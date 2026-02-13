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
            documents
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
 * GET /api/citizen/applications - Get user's applications
 */
router.get('/applications', requireAuth(['citizen']), async (req, res) => {
    try {
        const userId = req.user.sub;

        const applications = await Application.find({ applicantId: userId })
            .sort({ createdAt: -1 })
            .populate('review.reviewedBy', 'name email')
            .lean();

        res.json({ applications });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Failed to load applications' });
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
