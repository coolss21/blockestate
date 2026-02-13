// routes/courtRoutes.js - Court-specific routes
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Case from '../models/Case.js';
import Dispute from '../models/Dispute.js';
import Property from '../models/Properties.js';
import { BlockchainService } from '../services/blockchainService.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

/**
 * GET /api/court/dashboard - Get court dashboard stats
 */
router.get('/dashboard', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const [activeCases, upcomingHearings] = await Promise.all([
            Case.countDocuments({ status: 'active' }),
            Dispute.countDocuments({
                hearingDate: { $gte: new Date() },
                status: { $in: ['open', 'in-court'] }
            })
        ]);

        res.json({ activeCases, upcomingHearings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * POST /api/court/cases/register - Register new case and flag dispute on-chain
 */
router.post('/cases/register', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const { propertyId, reason, details } = req.body;
        const userId = req.user.sub;

        // Check if property exists
        const property = await Property.findOne({ propertyId });
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Generate IDs
        const disputeId = `DIS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const caseId = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Flag dispute on blockchain
        let txHash;
        try {
            txHash = await BlockchainService.flagDispute({
                propertyId,
                reason,
                caseId
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to flag dispute on blockchain: ' + error.message });
        }

        // Create dispute
        const dispute = new Dispute({
            disputeId,
            propertyId,
            status: 'in-court',
            details,
            timeline: [{
                type: 'DISPUTE_FLAGGED',
                txHash,
                message: reason,
                createdAt: new Date()
            }]
        });
        await dispute.save();

        // Create case
        const newCase = new Case({
            caseId,
            disputeId,
            propertyId,
            status: 'active'
        });
        await newCase.save();

        // Update property status
        property.status = 'disputed';
        await property.save();

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'CASE_REGISTERED',
            details: { caseId, disputeId, propertyId },
            txHash,
            req
        });

        res.status(201).json({
            message: 'Case registered and dispute flagged',
            case: { caseId, disputeId, txHash }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/court/cases - List all cases
 */
router.get('/cases', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const cases = await Case.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json({ cases });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load cases' });
    }
});

/**
 * GET /api/court/cases/:caseId - Get case details
 */
router.get('/cases/:caseId', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const caseData = await Case.findOne({ caseId: req.params.caseId }).lean();

        if (!caseData) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Get related dispute and property
        const [dispute, property] = await Promise.all([
            Dispute.findOne({ disputeId: caseData.disputeId }).lean(),
            Property.findOne({ propertyId: caseData.propertyId }).lean()
        ]);

        res.json({ case: caseData, dispute, property });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load case' });
    }
});

/**
 * POST /api/court/cases/:caseId/orders - Add court order
 */
router.post('/cases/:caseId/orders', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const { caseId } = req.params;
        const { orderText } = req.body;
        const userId = req.user.sub;

        const caseData = await Case.findOne({ caseId });
        if (!caseData) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Add order to case
        caseData.orders.push({
            text: orderText,
            createdBy: userId,
            createdAt: new Date()
        });
        await caseData.save();

        // Add order to dispute
        const dispute = await Dispute.findOne({ disputeId: caseData.disputeId });
        if (dispute) {
            dispute.courtOrders.push({
                orderText,
                createdBy: userId,
                createdAt: new Date()
            });

            // Log to timeline for visibility
            dispute.timeline.push({
                type: 'COURT_ORDER',
                message: `Court Order: ${orderText}`,
                createdAt: new Date()
            });

            await dispute.save();
        }

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'COURT_ORDER_ISSUED',
            details: { caseId, orderPreview: orderText.substring(0, 100) },
            req
        });

        res.json({ message: 'Court order added' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add order' });
    }
});

router.get('/hearings', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const hearings = await Dispute.aggregate([
            {
                $match: {
                    hearingDate: { $exists: true, $ne: null }
                }
            },
            {
                $lookup: {
                    from: 'cases',
                    localField: 'disputeId',
                    foreignField: 'disputeId',
                    as: 'caseInfo'
                }
            },
            {
                $addFields: {
                    caseId: { $arrayElemAt: ['$caseInfo.caseId', 0] }
                }
            }
        ]);

        res.json({ hearings });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load hearings' });
    }
});

/**
 * POST /api/court/hearings - Schedule a hearing
 */
router.post('/hearings', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const { disputeId, hearingDate } = req.body;
        const userId = req.user.sub;

        const dispute = await Dispute.findOne({ disputeId });
        if (!dispute) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        dispute.hearingDate = new Date(hearingDate);

        // Log to timeline for visibility
        dispute.timeline.push({
            type: 'HEARING_SCHEDULED',
            message: `Hearing scheduled for: ${new Date(hearingDate).toLocaleString()}`,
            createdAt: new Date()
        });

        await dispute.save();

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'HEARING_SCHEDULED',
            details: { disputeId, hearingDate },
            req
        });

        res.json({ message: 'Hearing scheduled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to schedule hearing' });
    }
});

/**
 * POST /api/court/cases/:caseId/close - Close case and clear dispute
 */
router.post('/cases/:caseId/close', requireAuth(['court', 'admin']), async (req, res) => {
    try {
        const { caseId } = req.params;
        const { resolution } = req.body;
        const userId = req.user.sub;

        const caseData = await Case.findOne({ caseId });
        if (!caseData) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // Clear dispute on blockchain
        let txHash;
        try {
            txHash = await BlockchainService.clearDispute({ propertyId: caseData.propertyId });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to clear dispute on blockchain' });
        }

        // Update case
        caseData.status = 'closed';
        await caseData.save();

        // Update dispute
        const dispute = await Dispute.findOne({ disputeId: caseData.disputeId });
        if (dispute) {
            dispute.status = 'resolved';
            dispute.timeline.push({
                type: 'RESOLVED',
                txHash,
                message: resolution || 'Case closed',
                createdAt: new Date()
            });
            await dispute.save();
        }

        // Update property
        const property = await Property.findOne({ propertyId: caseData.propertyId });
        if (property) {
            property.status = 'approved';
            await property.save();
        }

        // Log action
        await AuditService.logAction({
            userId,
            role: req.user.role,
            action: 'CASE_CLOSED',
            details: { caseId, resolution },
            txHash,
            req
        });

        res.json({ message: 'Case closed and dispute cleared', txHash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
