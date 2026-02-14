import { Router } from 'express';
import QRCode from 'qrcode';
import os from 'os';
import { CertificateController } from '../controllers/certificateController.js';
import Property from '../models/Properties.js';
import { BACKEND_URL } from '../config/index.js';

const r = Router();

// Removed deriveBackendBase - utilizing BACKEND_URL from config directly

// Public certificate (no token) -> shareable
r.get('/certificate/:id.pdf', CertificateController.publicPdf);

// Public verification data (JSON) used by the QR verify URL
r.get('/verify', CertificateController.publicVerify);

// Public property details for authenticated-looking professional views (read-only)
r.get('/property/:propertyId', async (req, res) => {
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

// Public QR that opens the certificate directly (phone-friendly)
// ✅ Never encodes localhost; swaps to LAN IP automatically.
r.get('/qr/:id', async (req, res) => {
  try {
    const propertyId = String(req.params.id || '').trim();
    if (!propertyId) return res.status(400).send('Missing propertyId');

    // Point to backend certificate endpoint (Static File)
    const url = `${BACKEND_URL}/certificates/${encodeURIComponent(propertyId)}.pdf`;

    console.log(`[QR] Generated URL: ${url}`); // Debug logging

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    await QRCode.toFileStream(res, url, { width: 360, margin: 2 });
  } catch (e) {
    res.status(500).send(e?.message || 'Failed to generate QR');
  }
});

export default r;
