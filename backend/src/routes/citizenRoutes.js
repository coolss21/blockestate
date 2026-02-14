// routes/citizenRoutes.js - Citizen-specific routes
import { Router } from 'express';
import multer from 'multer';
import { createHash } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import Property from '../models/Properties.js';
import Application from '../models/Application.js';
import Dispute from '../models/Dispute.js';
import { IpfsService } from '../services/ipfsService.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and images allowed.'));
        }
    }
});

/**
 * GET /api/citizen/dashboard - Get citizen dashboard stats
 */
router.get('/dashboard', requireAuth(['citizen']), async (req, res) => {
    try {
        const userId = req.user.sub;

        const [propertiesCount, pendingApps, disputes] = await Promise.all([
            Property.countDocuments({ appliedBy: userId, status: 'approved' }),
            Application.countDocuments({ applicantId: userId, status: 'pending' }),
            Dispute.countDocuments({
                propertyId: {
                    $in: await Property.find({ appliedBy: userId }).distinct('propertyId')
                },
                status: { $ne: 'resolved' }
            })
        ]);

        res.json({
            propertiesCount,
            pendingApplications: pendingApps,
            activeDisputes: disputes
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * GET /api/citizen/properties - Get user's properties
 */
router.get('/properties', requireAuth(['citizen']), async (req, res) => {
    try {
        const userId = req.user.sub;

        const properties = await Property.find({
            appliedBy: userId,
            status: 'approved'
        }).sort({ createdAt: -1 }).lean();

        res.json({ properties });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Failed to load properties' });
    }
});

/**
 * POST /api/citizen/apply - Submit application with documents
 */
router.post('/apply', requireAuth(['citizen']), upload.array('documents', 5), async (req, res) => {
    try {
        const userId = req.user.sub;
        const { type, ownerName, address, areaSqft, value, reason, notes } = req.body;

        // Validate required fields
        if (!type || !ownerName || !address || !areaSqft || !value) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Parse address if it's a string
        let addressObj;
        try {
            addressObj = typeof address === 'string' ? JSON.parse(address) : address;
        } catch {
            return res.status(400).json({ error: 'Invalid address format' });
        }

        // Process uploaded documents
        const documents = [];
        const files = req.files || [];

        for (const file of files) {
            // Calculate hash
            const docHash = createHash('sha256').update(file.buffer).digest('hex');

            // Upload to IPFS (or mark as pending if no JWT)
            let ipfsCID = null;
            let uploadStatus = 'pending';

            try {
                if (process.env.PINATA_JWT) {
                    ipfsCID = await IpfsService.pinToPinata({
                        buffer: file.buffer,
                        filename: file.originalname,
                        contentType: file.mimetype
                    });
                    uploadStatus = 'uploaded';
                }
            } catch (error) {
                console.error('IPFS upload error:', error.message);
                // Continue with pending status
            }

            documents.push({
                ipfsCID,
                docHash,
                fileName: file.originalname,
                fileType: file.mimetype,
                size: file.size,
                uploadStatus
            });
        }

        // Generate application ID
        const appId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Get system config for default approval settings
        const OfficeConfig = (await import('../models/Office.js')).default;
        const config = await OfficeConfig.findOne({ officeId: 'default-office' });
        const multiStepEnabled = config?.configData?.multiStepApproval?.enabled ?? true;

        // Create application
        const application = new Application({
            appId,
            type,
            status: 'pending',
            applicantId: userId,
            propertyDraft: {
                ownerName,
                address: addressObj,
                areaSqft: Number(areaSqft),
                value: Number(value)
            },
            details: { reason, notes },
            documents,
            // Initialize approvals array and metadata if multi-step enabled
            approvals: [],
            approvalMetadata: multiStepEnabled ? {
                requiredApprovals: config?.configData?.multiStepApproval?.requiredApprovals || 2,
                approvalType: config?.configData?.multiStepApproval?.approvalType || 'parallel',
                currentStep: 0,
                approvedCount: 0,
                rejectedCount: 0
            } : undefined
        });

        await application.save();

        // Log action
        await AuditService.logAction({
            userId,
            role: 'citizen',
            action: 'APPLICATION_SUBMITTED',
            details: { appId, type, documentsCount: documents.length },
            req
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            application: {
                appId: application.appId,
                type: application.type,
                status: application.status,
                createdAt: application.createdAt
            }
        });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit application' });
    }
});

/**
 * GET /api/citizen/applications - Get user's applications with approval progress
 */
router.get('/applications', requireAuth(['citizen']), async (req, res) => {
    try {
        const userId = req.user.sub;

        const applications = await Application.find({ applicantId: userId })
            .sort({ createdAt: -1 })
            .populate('review.reviewedBy', 'name email')
            .populate('approvals.registrarId', 'name email')
            .lean();

        // Add approval progress to each application and ensure status is correct
        const applicationsWithProgress = applications.map(app => {
            // Calculate actual approval count from approvals array
            const actualApprovedCount = app.approvals?.filter(a => a.decision === 'approved').length || 0;
            const requiredApprovals = app.approvalMetadata?.requiredApprovals || 2;
            
            // Ensure status is correct based on approval count
            let correctStatus = app.status;
            if (app.status === 'pending' && actualApprovedCount > 0) {
                correctStatus = 'under-review';
            } else if (app.status === 'under-review' && actualApprovedCount >= requiredApprovals && !app.propertyId) {
                // Should be approved but might not be finalized yet
                correctStatus = 'under-review'; // Keep as under-review until blockchain registration
            } else if (app.status === 'approved' && actualApprovedCount < requiredApprovals && !app.propertyId) {
                // Status incorrectly set to approved - fix it
                correctStatus = 'under-review';
            }
            
            return {
                ...app,
                status: correctStatus, // Use corrected status
                approvalProgress: app.approvalMetadata ? {
                    approved: actualApprovedCount,
                    required: requiredApprovals,
                    remaining: requiredApprovals - actualApprovedCount,
                    percentage: Math.round((actualApprovedCount / requiredApprovals) * 100)
                } : null
            };
        });

        res.json({ applications: applicationsWithProgress });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Failed to load applications' });
    }
});

/**
 * GET /api/citizen/application/:appId/status - Get detailed approval status (citizen view)
 */
router.get('/application/:appId/status', requireAuth(['citizen']), async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.sub;

        const query = req.params.appId.startsWith('APP-')
            ? { appId, applicantId: userId }
            : { $or: [{ appId }, { _id: appId }], applicantId: userId };

        const application = await Application.findOne(query)
            .populate('approvals.registrarId', 'name')
            .lean();

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        function getStatusMessage(app) {
            if (app.status === 'rejected') {
                return `Application rejected: ${app.rejectionReason || 'No reason provided'}`;
            }
            if (app.status === 'approved') {
                return `Application approved and property registered`;
            }
            if (app.status === 'under-review') {
                const approved = app.approvalMetadata?.approvedCount || 0;
                const required = app.approvalMetadata?.requiredApprovals || 2;
                return `Under review: ${approved} of ${required} approvals received`;
            }
            return 'Application pending initial review';
        }

        // Don't expose full registrar details to citizen
        const approvalStatus = {
            appId: application.appId,
            status: application.status,
            submittedAt: application.createdAt,
            approvalProgress: application.approvalMetadata ? {
                approved: application.approvalMetadata.approvedCount || 0,
                required: application.approvalMetadata.requiredApprovals || 2,
                percentage: Math.round(((application.approvalMetadata.approvedCount || 0) / (application.approvalMetadata.requiredApprovals || 2)) * 100)
            } : null,
            approvals: application.approvals?.map(approval => ({
                decision: approval.decision,
                timestamp: approval.approvedAt,
                comment: approval.comment, // Only show comment, not registrar identity
            })) || [],
            statusMessage: getStatusMessage(application)
        };

        res.json(approvalStatus);
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to load status' });
    }
});

/**
 * GET /api/citizen/disputes - Get user's property disputes
 */
router.get('/disputes', requireAuth(['citizen']), async (req, res) => {
    try {
        const userId = req.user.sub;

        // Find user's properties
        const userProperties = await Property.find({ appliedBy: userId }).distinct('propertyId');

        // Find disputes for those properties
        const disputes = await Dispute.find({
            propertyId: { $in: userProperties }
        }).sort({ createdAt: -1 }).lean();

        res.json({ disputes });
    } catch (error) {
        console.error('Get disputes error:', error);
        res.status(500).json({ error: 'Failed to load disputes' });
    }
});

export default router;
