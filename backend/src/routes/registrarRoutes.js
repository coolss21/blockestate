// routes/registrarRoutes.js - Registrar-specific routes
import { Router } from 'express';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { BACKEND_URL } from '../config/index.js';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Property from '../models/Properties.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import OfficeConfig from '../models/Office.js';
import { BlockchainService } from '../services/blockchainService.js';
import { AuditService } from '../services/auditService.js';
import { PdfService } from '../services/pdfService.js';
import { sha256Hex } from '../utils/hash.js';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

/**
 * GET /api/registrar/dashboard - Get registrar dashboard stats
 */
router.get('/dashboard', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const userId = req.user.sub; // This is a string from JWT
        const config = await OfficeConfig.findOne({ officeId: 'default-office' });
        const multiStepEnabled = config?.configData?.multiStepApproval?.enabled ?? true;

        let pendingApps;
        if (multiStepEnabled) {
            // Count applications needing THIS registrar's approval
            const apps = await Application.find({
                status: { $in: ['pending', 'under-review'] }
            }).lean();

            pendingApps = apps.filter(app => {
                if (!app.approvals || app.approvals.length === 0) return true;
                return !app.approvals.some(a => {
                    const rid = a.registrarId?.toString?.() ||
                        (typeof a.registrarId === 'string' ? a.registrarId : null);
                    return rid === userId && a.decision === 'approved';
                });
            }).length;
        } else {
            pendingApps = await Application.countDocuments({ status: 'pending' });
        }

        const fraudAlerts = await Property.countDocuments({ status: 'disputed' });

        res.json({
            pendingApplications: pendingApps,
            fraudAlerts
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * GET /api/registrar/inbox - Get applications inbox with pagination
 * Returns applications that need THIS registrar's approval (multi-step enabled)
 * or all pending applications (legacy mode)
 */
router.get('/inbox', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const userId = req.user.sub;
        const { page = 1, limit = 20, status } = req.query;

        // Get system config
        const config = await OfficeConfig.findOne({ officeId: 'default-office' });
        const multiStepEnabled = config?.configData?.multiStepApproval?.enabled ?? true;

        let query = {};
        if (status) {
            query.status = status;
        } else if (multiStepEnabled) {
            // Multi-step enabled: show only applications needing approval
            query.status = { $in: ['pending', 'under-review'] };
        } else {
            // Legacy mode: show all pending
            query.status = 'pending';
        }

        // Fetch ALL applications with pending/under-review status (no pagination yet)
        // We'll filter out ones already approved by this registrar below
        // Don't populate approvals.registrarId - we'll compare ObjectIds directly
        let allApplications = await Application.find(query)
            .sort({ createdAt: -1 })
            .populate('applicantId', 'name email')
            .lean();

        // Filter out applications already approved by this registrar (multi-step mode)
        if (multiStepEnabled) {
            const userIdStr = userId.toString(); // Ensure it's a string
            console.log(`[INBOX] Filtering applications for registrar ${userIdStr}`);
            console.log(`[INBOX] req.user.sub type: ${typeof userId}, value: ${userIdStr}`);
            console.log(`[INBOX] Found ${allApplications.length} total applications with status pending/under-review`);

            allApplications = allApplications.filter(app => {
                // If no approvals, show it
                if (!app.approvals || app.approvals.length === 0) {
                    console.log(`[INBOX] Application ${app.appId} has no approvals - showing`);
                    return true;
                }

                // Check if this registrar has already approved
                const alreadyApproved = app.approvals.some(approval => {
                    if (!approval.registrarId) {
                        console.log(`[INBOX] Application ${app.appId} has approval without registrarId`);
                        return false;
                    }

                    // Normalize both to strings for comparison
                    // When using .lean(), registrarId might be ObjectId object or string
                    const approvalRegistrarId = approval.registrarId?.toString?.() ||
                        (typeof approval.registrarId === 'string' ? approval.registrarId : null);

                    console.log(`[INBOX] Application ${app.appId} approval registrarId type: ${typeof approval.registrarId}, normalized: ${approvalRegistrarId}`);

                    if (!approvalRegistrarId) {
                        return false;
                    }

                    const matches = approvalRegistrarId === userIdStr && approval.decision === 'approved';
                    if (matches) {
                        console.log(`[INBOX] Filtering out application ${app.appId} - already approved by registrar ${userIdStr} (approval registrarId: ${approvalRegistrarId})`);
                    }
                    return matches;
                });

                if (!alreadyApproved) {
                    console.log(`[INBOX] Application ${app.appId} needs approval - showing to registrar ${userIdStr}`);
                }

                return !alreadyApproved;
            });

            console.log(`[INBOX] After filtering, ${allApplications.length} applications visible to registrar ${userIdStr}`);
        }

        // NOW apply pagination after filtering
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const applications = allApplications.slice(skip, skip + parseInt(limit));

        // Count total matching applications (after filtering)
        const total = allApplications.length;

        res.json({
            applications,
            total: applications.length, // Return filtered count
            page: parseInt(page),
            totalPages: Math.ceil(applications.length / parseInt(limit)),
            multiStepEnabled,
            approvalType: config?.configData?.multiStepApproval?.approvalType || 'parallel'
        });
    } catch (error) {
        console.error('Inbox error:', error);
        res.status(500).json({ error: 'Failed to load inbox' });
    }
});

/**
 * GET /api/registrar/application/:appId - Get application details
 */
router.get('/application/:appId', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const query = {};
        if (req.params.appId.startsWith('APP-')) {
            query.appId = req.params.appId;
        } else {
            // Fallback to _id if it's a valid Mongo ID
            query.$or = [
                { appId: req.params.appId },
                { _id: req.params.appId }
            ];
        }

        const application = await Application.findOne(query)
            .populate('applicantId', 'name email walletAddress')
            .lean();

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ application });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load application' });
    }
});

/**
 * Helper: Finalize approval and register on blockchain
 */
async function finalizeApprovalAndRegister(application, userId, user, req) {
    // Generate property ID
    const propertyId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Get first document hash (main document)
    const mainDoc = application.documents[0];
    if (!mainDoc) {
        throw new Error('No documents attached to application');
    }

    const docHash = `0x${mainDoc.docHash}`;
    const fileRef = mainDoc.ipfsCID || 'pending';

    // Auto-assign wallet address to applicant if not exists
    const applicant = application.applicantId;
    let ownerWallet = applicant.walletAddress;
    if (!ownerWallet) {
        const tempWallet = ethers.Wallet.createRandom();
        ownerWallet = tempWallet.address;
        applicant.walletAddress = ownerWallet;
        await applicant.save();
    }

    // Register on blockchain
    let txHash;
    try {
        console.log(`[BLOCKCHAIN] Registering property ${propertyId} for application ${application.appId}`);
        txHash = await BlockchainService.registerProperty({
            propertyId,
            docHash,
            fileRef,
            ownerAddress: ownerWallet
        });
        console.log(`[BLOCKCHAIN] Successfully registered property ${propertyId}, txHash: ${txHash}`);
    } catch (error) {
        console.error('[BLOCKCHAIN] Registration error:', error);
        // Revert application status - keep it as under-review
        application.status = 'under-review';
        application.approvalMetadata.blockchainError = error.message;
        await application.save();
        throw new Error('Failed to register on blockchain: ' + error.message);
    }

    const receipt = await BlockchainService.provider.getTransactionReceipt(txHash);

    // Map address fields
    const appObj = application.toObject();
    const draftAddr = appObj.propertyDraft?.address || {};

    const normalizedAddress = {
        line1: draftAddr.line1 || draftAddr.street || 'Not Provided',
        line2: draftAddr.line2 || '',
        district: draftAddr.district || draftAddr.city || 'Not Provided',
        state: draftAddr.state || 'Not Provided',
        pincode: draftAddr.pincode || draftAddr.zip || '000000'
    };

    // Create property record
    const property = new Property({
        propertyId,
        ownerWallet,
        ownerEmail: applicant.email,
        ownerName: application.propertyDraft?.ownerName || applicant?.name || 'Unknown Owner',
        address: normalizedAddress,
        areaSqft: Number(application.propertyDraft?.areaSqft || 0),
        value: Number(application.propertyDraft?.value || 0),
        status: 'approved',
        ipfsCID: mainDoc.ipfsCID,
        docHash: mainDoc.docHash,
        appliedBy: application.applicantId._id || application.applicantId,
        approvedBy: userId,
        chain: {
            chainId: 31337,
            txHash,
            blockNumber: receipt.blockNumber,
            contractAddress: process.env.CONTRACT_ADDRESS
        }
    });

    await property.save();

    // Auto-generate certificate PDF and save to filesystem + MongoDB
    try {
        const enrichedProp = property.toObject();
        enrichedProp.chain = {
            txHash,
            blockNumber: receipt.blockNumber,
            contractAddress: process.env.CONTRACT_ADDRESS || '0x...'
        };

        const verifyUrl = `${BACKEND_URL.replace(/\/$/, '')}/certificates/${encodeURIComponent(propertyId)}.pdf`;
        const pdfBuffer = await PdfService.generateCertificate(enrichedProp, verifyUrl);
        const certDocHash = sha256Hex(pdfBuffer);

        // Save to MongoDB
        await Certificate.findOneAndUpdate(
            { propertyId },
            {
                generatedBy: userId,
                docHash: '0x' + certDocHash,
                qrUrl: verifyUrl,
                pdfData: pdfBuffer,
                fileName: `Certificate_${propertyId}.pdf`,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // Save to filesystem for static serving
        const __certFilename = fileURLToPath(import.meta.url);
        const __certDirname = path.dirname(__certFilename);
        const CERT_DIR = path.join(__certDirname, '../storage/certificates');
        if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
        fs.writeFileSync(path.join(CERT_DIR, `${propertyId}.pdf`), pdfBuffer);

        // Update property with certificate metadata
        property.certificateUrl = verifyUrl;
        property.qrData = { lastGeneratedAt: new Date(), docHash: '0x' + certDocHash };
        await property.save();

        console.log(`[CERT] Auto-generated certificate for ${propertyId} → storage/certificates/${propertyId}.pdf`);
    } catch (certErr) {
        console.error(`[CERT] Failed to auto-generate certificate for ${propertyId}:`, certErr);
        // Non-fatal — property is still registered even if cert generation fails
    }

    // Update application - ONLY set to 'approved' after successful blockchain registration
    application.status = 'approved';
    application.propertyId = propertyId;
    application.approvalMetadata.finalApprovedAt = new Date();
    application.approvalMetadata.finalApprovedBy = userId;

    // Update legacy review field for backward compatibility
    application.review = {
        reviewedBy: userId,
        reviewedAt: new Date(),
        comment: 'Multi-step approval completed'
    };

    await application.save();

    console.log(`[APPROVAL] Application ${application.appId} finalized and set to 'approved' status`);

    // Log final approval
    await AuditService.logAction({
        userId,
        role: user.role,
        action: 'FINAL_APPROVE_APPLICATION',
        txHash,
        details: {
            appId: application.appId,
            propertyId,
            totalApprovals: application.approvalMetadata.approvedCount,
            approvers: application.approvals.map(a => a.registrarEmail)
        },
        req
    });

    return {
        propertyId,
        txHash,
        blockNumber: receipt.blockNumber,
        property
    };
}

/**
 * POST /api/registrar/application/:appId/approve - Approve application (multi-step support)
 * Adds approval; registers on blockchain only when threshold met
 */
router.post('/application/:appId/approve', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { appId } = req.params;
        const { comment } = req.body;
        const userId = req.user.sub;

        const query = req.params.appId.startsWith('APP-')
            ? { appId: req.params.appId }
            : { $or: [{ appId: req.params.appId }, { _id: req.params.appId }] };

        const application = await Application.findOne(query).populate('applicantId');
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (!['pending', 'under-review'].includes(application.status)) {
            return res.status(400).json({ error: 'Application already processed' });
        }

        // Check if this registrar already approved
        const alreadyApproved = application.approvals?.some(approval => {
            // Handle both populated and non-populated registrarId
            const registrarId = approval.registrarId?._id || approval.registrarId;
            return registrarId?.toString() === userId.toString();
        });

        if (alreadyApproved) {
            return res.status(400).json({ error: 'You have already approved this application' });
        }

        // Check if approver is the applicant (prevent self-approval)
        if (application.applicantId._id?.toString() === userId.toString() ||
            application.applicantId.toString() === userId.toString()) {
            return res.status(403).json({ error: 'Cannot approve your own application' });
        }

        // Get system config
        const config = await OfficeConfig.findOne({ officeId: 'default-office' });
        const multiStepEnabled = config?.configData?.multiStepApproval?.enabled ?? true;

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If multi-step disabled, use legacy direct approval
        if (!multiStepEnabled) {
            // Legacy direct approval - register immediately
            const result = await finalizeApprovalAndRegister(application, userId, user, req);
            return res.json({
                message: 'Application approved and property registered',
                property: {
                    propertyId: result.propertyId,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber
                }
            });
        }

        // Initialize approval metadata if not exists
        if (!application.approvalMetadata) {
            application.approvalMetadata = {
                requiredApprovals: config?.configData?.multiStepApproval?.requiredApprovals || 2,
                approvalType: config?.configData?.multiStepApproval?.approvalType || 'parallel',
                currentStep: 0,
                approvedCount: 0,
                rejectedCount: 0
            };
        }

        // Ensure approvals array exists
        if (!application.approvals) {
            application.approvals = [];
        }

        // Add this registrar's approval
        const newApproval = {
            registrarId: userId, // This should be an ObjectId
            decision: 'approved',
            comment: comment || '',
            approvedAt: new Date(),
            registrarName: user.name,
            registrarEmail: user.email
        };

        application.approvals.push(newApproval);

        // Mark the approvals array as modified to ensure it's saved
        application.markModified('approvals');

        console.log(`[APPROVAL] Added approval for application ${application.appId} by registrar ${userId} (${user.name})`);
        console.log(`[APPROVAL] userId type: ${typeof userId}, value: ${userId}`);
        console.log(`[APPROVAL] newApproval.registrarId type: ${typeof newApproval.registrarId}, value: ${newApproval.registrarId}`);

        // Calculate approval count BEFORE saving
        const currentApprovedCount = application.approvals.filter(
            a => a.decision === 'approved'
        ).length;

        console.log(`[APPROVAL] Current approval count: ${currentApprovedCount}, approvals array length: ${application.approvals.length}`);

        // Update approval metadata
        if (!application.approvalMetadata) {
            application.approvalMetadata = {
                requiredApprovals: config?.configData?.multiStepApproval?.requiredApprovals || 2,
                approvalType: config?.configData?.multiStepApproval?.approvalType || 'parallel',
                currentStep: 0,
                approvedCount: 0,
                rejectedCount: 0
            };
        }

        application.approvalMetadata.approvedCount = currentApprovedCount;
        application.markModified('approvalMetadata');

        // IMPORTANT: Update status to 'under-review' if threshold NOT met
        // Only set to 'approved' AFTER blockchain registration (in finalizeApprovalAndRegister)
        const requiredApprovals = application.approvalMetadata.requiredApprovals || 2;

        if (currentApprovedCount < requiredApprovals) {
            // Threshold not met - set to under-review
            application.status = 'under-review';
            console.log(`[APPROVAL] Setting status to 'under-review' (${currentApprovedCount} < ${requiredApprovals})`);
        } else {
            console.log(`[APPROVAL] Threshold met (${currentApprovedCount} >= ${requiredApprovals}), will finalize after save`);
        }

        // Save the application
        await application.save();

        // Verify the save worked by checking the database directly
        const verifyApp = await Application.findById(application._id).lean();
        console.log(`[APPROVAL] Saved application ${application.appId}:`);
        console.log(`  - Status: ${verifyApp.status}`);
        console.log(`  - Approvals count: ${verifyApp.approvals?.length || 0}`);
        console.log(`  - Approval metadata: ${JSON.stringify(verifyApp.approvalMetadata)}`);
        if (verifyApp.approvals && verifyApp.approvals.length > 0) {
            verifyApp.approvals.forEach((a, idx) => {
                const ridType = typeof a.registrarId;
                const ridValue = a.registrarId?.toString?.() || a.registrarId;
                console.log(`  - Approval ${idx}: registrarId type=${ridType}, value=${ridValue}, decision=${a.decision}`);
            });
        }

        console.log(`[APPROVAL] Application ${application.appId}: ${currentApprovedCount}/${requiredApprovals} approvals. Status: ${application.status}`);

        // Reload to ensure we have the latest state from database
        const updatedApp = await Application.findById(application._id)
            .populate('approvals.registrarId', 'name email');

        console.log(`[APPROVAL] Reloaded application ${application.appId}, approvals count: ${updatedApp.approvals?.length || 0}`);
        if (updatedApp.approvals && updatedApp.approvals.length > 0) {
            updatedApp.approvals.forEach((approval, idx) => {
                console.log(`[APPROVAL] Approval ${idx}: registrarId=${approval.registrarId}, decision=${approval.decision}`);
            });
        }

        // Recalculate from reloaded data to be absolutely sure
        const verifiedApprovedCount = updatedApp.approvals?.filter(
            a => a.decision === 'approved'
        ).length || 0;

        console.log(`[APPROVAL] Verified approval count: ${verifiedApprovedCount}`);

        // Double-check status is correct
        if (verifiedApprovedCount < requiredApprovals && updatedApp.status !== 'under-review') {
            updatedApp.status = 'under-review';
            await updatedApp.save();
            console.log(`[APPROVAL] Corrected status to 'under-review' for ${application.appId}`);
        }

        const updatedAppLean = updatedApp.toObject();

        // Log partial approval
        await AuditService.logAction({
            userId,
            role: user.role,
            action: 'PARTIAL_APPROVE_APPLICATION',
            details: {
                appId: application.appId,
                approvalCount: verifiedApprovedCount,
                requiredApprovals: application.approvalMetadata.requiredApprovals,
                comment
            },
            req
        });

        // Check if threshold met using verified count from database
        const thresholdMet = verifiedApprovedCount >= application.approvalMetadata.requiredApprovals;

        console.log(`[APPROVAL] Threshold check for ${application.appId}: ${verifiedApprovedCount} >= ${application.approvalMetadata.requiredApprovals} = ${thresholdMet}`);

        if (thresholdMet) {
            console.log(`[APPROVAL] Threshold met! Finalizing approval for ${application.appId}`);

            // Reload full application for final approval
            const appForFinal = await Application.findById(application._id).populate('applicantId');

            // Double-check status before finalizing
            if (appForFinal.status !== 'under-review' && appForFinal.status !== 'pending') {
                console.error(`[APPROVAL] ERROR: Application ${application.appId} status is ${appForFinal.status}, expected under-review or pending`);
                return res.status(400).json({
                    error: `Application status is ${appForFinal.status}, cannot finalize approval`
                });
            }

            // Trigger final approval and blockchain registration
            const result = await finalizeApprovalAndRegister(appForFinal, userId, user, req);

            console.log(`[APPROVAL] Successfully finalized ${application.appId} with property ${result.propertyId}`);

            return res.json({
                message: 'Application fully approved and property registered on blockchain',
                status: 'approved',
                property: {
                    propertyId: result.propertyId,
                    ownerName: result.property.ownerName,
                    txHash: result.txHash,
                    blockNumber: result.blockNumber
                },
                approvalSummary: {
                    totalApprovals: verifiedApprovedCount,
                    approvers: updatedAppLean.approvals?.filter(a => a.decision === 'approved').map(a => ({
                        name: a.registrarName || a.registrarId?.name,
                        email: a.registrarEmail || a.registrarId?.email,
                        approvedAt: a.approvedAt
                    })) || []
                }
            });
        }

        // Threshold not met yet - application remains in 'under-review' status
        console.log(`[APPROVAL] Partial approval recorded for ${application.appId}: ${verifiedApprovedCount}/${application.approvalMetadata.requiredApprovals}`);

        res.json({
            message: 'Approval recorded successfully',
            status: updatedAppLean.status || 'under-review',
            approvalProgress: {
                approved: verifiedApprovedCount,
                required: application.approvalMetadata.requiredApprovals,
                remaining: application.approvalMetadata.requiredApprovals - verifiedApprovedCount
            },
            application: {
                appId: application.appId,
                status: updatedAppLean.status || 'under-review',
                approvals: updatedAppLean.approvals || []
            }
        });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ error: error.message || 'Failed to approve application' });
    }
});

/**
 * POST /api/registrar/application/:appId/reject - Reject application (multi-step support)
 */
router.post('/application/:appId/reject', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { appId } = req.params;
        const { reason } = req.body;
        const userId = req.user.sub;

        if (!reason || reason.trim().length < 3) {
            return res.status(400).json({ error: 'Rejection reason is required (minimum 3 characters)' });
        }

        const query = req.params.appId.startsWith('APP-')
            ? { appId: req.params.appId }
            : { $or: [{ appId: req.params.appId }, { _id: req.params.appId }] };

        const application = await Application.findOne(query).populate('applicantId');
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (!['pending', 'under-review'].includes(application.status)) {
            if (application.status === 'rejected') {
                return res.status(400).json({ error: 'Application has already been rejected' });
            }
            return res.status(400).json({ error: 'Application already processed' });
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add rejection to approvals array
        application.approvals.push({
            registrarId: userId,
            decision: 'rejected',
            comment: reason,
            approvedAt: new Date(),
            registrarName: user.name,
            registrarEmail: user.email
        });

        // Update status to rejected
        application.status = 'rejected';
        application.rejectionReason = reason;

        // Update metadata
        if (!application.approvalMetadata) {
            application.approvalMetadata = {};
        }
        application.approvalMetadata.rejectedCount =
            (application.approvalMetadata.rejectedCount || 0) + 1;

        // Update legacy review field
        application.review = {
            reviewedBy: userId,
            reviewedAt: new Date(),
            comment: reason
        };

        await application.save();

        // Log rejection
        await AuditService.logAction({
            userId,
            role: user.role,
            action: 'REJECT_APPLICATION',
            details: {
                appId: application.appId,
                reason,
                previousApprovals: application.approvalMetadata?.approvedCount || 0
            },
            req
        });

        res.json({
            message: 'Application rejected',
            application: {
                appId: application.appId,
                status: application.status,
                rejectionReason: reason,
                rejectedBy: user.name
            }
        });
    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({ error: error.message || 'Failed to reject application' });
    }
});

/**
 * GET /api/registrar/application/:appId/approvals - Get detailed approval history
 */
router.get('/application/:appId/approvals', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { appId } = req.params;

        const query = req.params.appId.startsWith('APP-')
            ? { appId }
            : { $or: [{ appId }, { _id: appId }] };

        const application = await Application.findOne(query)
            .populate('approvals.registrarId', 'name email role')
            .populate('applicantId', 'name email')
            .lean();

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({
            appId: application.appId,
            status: application.status,
            applicant: application.applicantId,
            approvalMetadata: application.approvalMetadata || {},
            approvals: application.approvals?.map(approval => ({
                registrar: {
                    id: approval.registrarId?._id || approval.registrarId,
                    name: approval.registrarName || approval.registrarId?.name,
                    email: approval.registrarEmail || approval.registrarId?.email
                },
                decision: approval.decision,
                comment: approval.comment,
                timestamp: approval.approvedAt
            })) || [],
            timeline: application.approvals
                ?.sort((a, b) => new Date(a.approvedAt) - new Date(b.approvedAt))
                .map((approval, index) => ({
                    step: index + 1,
                    action: approval.decision,
                    by: approval.registrarName,
                    at: approval.approvedAt,
                    comment: approval.comment
                })) || []
        });
    } catch (error) {
        console.error('Get approvals error:', error);
        res.status(500).json({ error: 'Failed to load approval history' });
    }
});

/**
 * GET /api/registrar/search - Search properties
 */
router.get('/search', requireAuth(['registrar', 'admin', 'court']), async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ properties: [] });
        }

        const queryObj = {};
        if (q.trim().startsWith('PROP-')) {
            queryObj.$or = [
                { propertyId: { $regex: q.trim(), $options: 'i' } },
                { $text: { $search: q } }
            ];
        } else {
            queryObj.$text = { $search: q };
        }

        const properties = await Property.find(queryObj).limit(20).lean();

        res.json({ properties });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /api/registrar/properties - Get all registered properties
 */
router.get('/properties', requireAuth(['registrar', 'admin', 'court']), async (req, res) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const query = { status: 'approved' };

        if (search) {
            query.$or = [
                { propertyId: { $regex: search, $options: 'i' } },
                { ownerName: { $regex: search, $options: 'i' } },
                { ownerEmail: { $regex: search, $options: 'i' } },
                { 'address.line1': { $regex: search, $options: 'i' } },
                { 'address.district': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [properties, total] = await Promise.all([
            Property.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Property.countDocuments(query)
        ]);

        res.json({
            properties,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load properties' });
    }
});

/**
 * POST /api/registrar/certificate/:propertyId - Generate and store professional property certificate in DB
 */
router.post('/certificate/:propertyId', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findOne({ propertyId });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // 1. Determine the verification (QR) URL -> points to static backend PDF
        const verifyUrl = `${BACKEND_URL.replace(/\/$/, '')}/certificates/${encodeURIComponent(propertyId)}.pdf`;

        // 2. Enrich property with blockchain data for the PDF
        const chainData = await BlockchainService.getProperty(propertyId);
        const enrichedProp = property.toObject();
        enrichedProp.chain = {
            txHash: chainData.docHash,
            blockNumber: chainData.createdAt,
            contractAddress: process.env.CONTRACT_ADDRESS || '0x...'
        };

        // 3. Generate the PDF buffer
        const pdfBuffer = await PdfService.generateCertificate(enrichedProp, verifyUrl);
        const docHash = sha256Hex(pdfBuffer);

        // 4. Save/Update the Certificate document in MongoDB (Full PDF Binary)
        // Using findOneAndUpdate with upsert: true ensures 1 cert per property
        const certificate = await Certificate.findOneAndUpdate(
            { propertyId },
            {
                generatedBy: req.user.sub,
                docHash: '0x' + docHash,
                qrUrl: verifyUrl,
                pdfData: pdfBuffer,
                fileName: `Certificate_${propertyId}.pdf`,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // 5b. Save to filesystem for static serving
        try {
            const __certFilename = fileURLToPath(import.meta.url);
            const __certDirname = path.dirname(__certFilename);
            const CERT_DIR = path.join(__certDirname, '../storage/certificates');
            if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });
            fs.writeFileSync(path.join(CERT_DIR, `${propertyId}.pdf`), pdfBuffer);
            console.log(`[CERT] Saved certificate PDF to storage/certificates/${propertyId}.pdf`);
        } catch (fsErr) {
            console.error('[CERT] Failed to save certificate PDF to filesystem:', fsErr);
        }

        // 5. Update Property metadata
        property.certificateUrl = verifyUrl;
        property.qrData = {
            lastGeneratedAt: new Date(),
            docHash: '0x' + docHash
        };
        await property.save();

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'CERTIFICATE_GENERATED',
            details: { propertyId, docHash: '0x' + docHash },
            req
        });

        // 6. Generate QR for the frontend response (Data URL)
        const qrDataURL = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300
        });

        res.json({
            message: 'Certificate generated and stored in database successfully',
            qrCode: qrDataURL,
            certificateId: certificate._id,
            docHash: '0x' + docHash,
            verifyUrl
        });
    } catch (error) {
        console.error('Certificate Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate certificate' });
    }
});

export default router;
