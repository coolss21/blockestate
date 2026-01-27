// routes/publicVerificationRoutes.js - Public property verification routes
import { Router } from 'express';
import Property from '../models/Properties.js';
import { VerificationService } from '../services/verificationService.js';

const router = Router();

/**
 * GET /api/public/property/:propertyId - Get public property info
 */
router.get('/property/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;

        const property = await Property.findOne({ propertyId, status: 'approved' })
            .select('propertyId ownerName address areaSqft ipfsCID createdAt chain qrData')
            .lean();

        if (!property) {
            return res.status(404).json({ error: 'Property not found or not approved' });
        }

        res.json({ property });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load property' });
    }
});

/**
 * POST /api/public/verify - Verify property authenticity
 * Accepts either propertyId or qrData
 */
router.post('/verify', async (req, res) => {
    try {
        const { propertyId, qrData } = req.body;

        let result;

        if (qrData) {
            // Verify using QR data
            result = await VerificationService.verifyFromQRData(qrData);
        } else if (propertyId) {
            // Verify using property ID
            result = await VerificationService.verifyProperty(propertyId);
        } else {
            return res.status(400).json({ error: 'Either propertyId or qrData is required' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            valid: false,
            error: 'VERIFICATION_FAILED',
            message: error.message
        });
    }
});

export default router;
