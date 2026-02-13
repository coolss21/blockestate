// routes/registrarRoutes.js - Registrar-specific routes
import { Router } from 'express';
import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { requireAuth } from '../middleware/auth.js';
import Application from '../models/Application.js';
import Property from '../models/Properties.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { BlockchainService } from '../services/blockchainService.js';
import { AuditService } from '../services/auditService.js';
import { PdfService } from '../services/pdfService.js';
import { sha256Hex } from '../utils/hash.js';
import os from 'os';

const router = Router();

/**
 * GET /api/registrar/dashboard - Get registrar dashboard stats
 */
router.get('/dashboard', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const [pendingApps, fraudAlerts] = await Promise.all([
            Application.countDocuments({ status: 'pending' }),
            Property.countDocuments({ status: 'disputed' })
        ]);

        res.json({
            pendingApplications: pendingApps,
            fraudAlerts
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * GET /api/registrar/inbox - Get applications inbox with pagination
 */
router.get('/inbox', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = status ? { status } : {};

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [applications, total] = await Promise.all([
            Application.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('applicantId', 'name email')
                .lean(),
            Application.countDocuments(query)
        ]);

        res.json({
            applications,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
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
 * POST /api/registrar/application/:appId/approve - Approve application and register on-chain
 */
router.post('/application/:appId/approve', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { appId } = req.params;
        const userId = req.user.sub;

        const query = req.params.appId.startsWith('APP-')
            ? { appId: req.params.appId }
            : { $or: [{ appId: req.params.appId }, { _id: req.params.appId }] };

        const application = await Application.findOne(query).populate('applicantId');
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Application already processed' });
        }

        // Generate property ID
        const propertyId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Get first document hash (main document)
        const mainDoc = application.documents[0];
        if (!mainDoc) {
            return res.status(400).json({ error: 'No documents attached to application' });
        }

        const docHash = `0x${mainDoc.docHash}`;
        const fileRef = mainDoc.ipfsCID || 'pending';

        // Auto-assign wallet address to applicant if not exists
        const applicant = application.applicantId;
        let ownerWallet = applicant.walletAddress;
        if (!ownerWallet) {
            // Generate a valid Ethereum address for the applicant
            const tempWallet = ethers.Wallet.createRandom();
            ownerWallet = tempWallet.address;
            applicant.walletAddress = ownerWallet;
            await applicant.save();
        }

        // Register on blockchain
        let txHash;
        try {
            txHash = await BlockchainService.registerProperty({
                propertyId,
                docHash,
                fileRef,
                ownerAddress: ownerWallet
            });
        } catch (error) {
            console.error('Blockchain registration error:', error);
            return res.status(500).json({ error: 'Failed to register on blockchain: ' + error.message });
        }

        // Get block number
        const receipt = await BlockchainService.provider.getTransactionReceipt(txHash);

        // Map address fields (ensure compatibility between legacy Application and new Property schema)
        // Using toObject() ensures we can access 'street', 'city', 'zip' even if they were removed from the Mongoose schema
        const appObj = application.toObject();
        const draftAddr = appObj.propertyDraft?.address || {};

        const normalizedAddress = {
            line1: draftAddr.line1 || draftAddr.street || 'Not Provided',
            line2: draftAddr.line2 || '',
            district: draftAddr.district || draftAddr.city || 'Not Provided',
            state: draftAddr.state || 'Not Provided',
            pincode: draftAddr.pincode || draftAddr.zip || '000000'
        };

        console.log('[DEBUG] Approving application, mapping address:', {
            appId: application.appId || application._id,
            originalAddress: draftAddr,
            normalizedAddress
        });

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

        // Update application
        application.status = 'approved';
        application.propertyId = propertyId;
        application.review = {
            reviewedBy: userId,
            reviewedAt: new Date(),
            comment: 'Approved and registered on blockchain'
        };
        await application.save();

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'APPLICATION_APPROVED',
            details: { appId, propertyId },
            txHash,
            req
        });

        res.json({
            message: 'Application approved and property registered',
            property: {
                propertyId,
                txHash,
                blockNumber: receipt.blockNumber
            }
        });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ error: error.message || 'Failed to approve application' });
    }
});

/**
 * POST /api/registrar/application/:appId/reject - Reject application
 */
router.post('/application/:appId/reject', requireAuth(['registrar', 'admin']), async (req, res) => {
    try {
        const { appId } = req.params;
        const { reason } = req.body;
        const userId = req.user.sub;

        const query = req.params.appId.startsWith('APP-')
            ? { appId: req.params.appId }
            : { $or: [{ appId: req.params.appId }, { _id: req.params.appId }] };

        const application = await Application.findOne(query);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Application already processed' });
        }

        application.status = 'rejected';
        application.rejectionReason = reason || 'No reason provided';
        application.review = {
            reviewedBy: userId,
            reviewedAt: new Date(),
            comment: reason
        };
        await application.save();

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'APPLICATION_REJECTED',
            details: { appId, reason },
            req
        });

        res.json({ message: 'Application rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject application' });
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

        // 1. Determine the verification (QR) URL (Mobile friendly)
        let host = process.env.PUBLIC_BASE || 'http://localhost:8081';
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
            const interfaces = os.networkInterfaces();
            let localIp = 'localhost';
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        localIp = iface.address;
                        break;
                    }
                }
            }
            host = `http://${localIp}:5173`;
        } else {
            host = process.env.FRONTEND_ORIGIN || host;
        }

        const verifyUrl = `${host.replace(/\/$/, '')}/certificate/${encodeURIComponent(propertyId)}`;

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
