import { Router } from 'express';
import QRCode from 'qrcode';
import os from 'os';
import { CertificateController } from '../controllers/certificateController.js';
import Property from '../models/Properties.js';

const r = Router();

function getLanIpV4() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net && net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

function derivePublicBase(req) {
  const host = String(req.get('host') || '').trim();
  const protocol = String(req.protocol || 'http').trim();

  // Priority 1: User defined Frontend Origin
  if (process.env.FRONTEND_ORIGIN) return process.env.FRONTEND_ORIGIN.replace(/\/$/, '');

  const isLocalhost = /^localhost(?::\d+)?$/i.test(host) || /^127\.0\.0\.1(?::\d+)?$/.test(host);

  // If request hits backend (e.g. via local IP 192.168.x.x:8081), point QR to frontend port 5173
  if (host.includes(':8081')) {
    return `${protocol}://${host.split(':')[0]}:5173`;
  }

  if (!isLocalhost) return `${protocol}://${host}`;

  const ip = getLanIpV4();
  return ip ? `${protocol}://${ip}:5173` : `${protocol}://${host.replace(':8081', ':5173')}`;
}

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

    const base = derivePublicBase(req);
    const url = `${base}/certificate/${encodeURIComponent(propertyId)}`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    await QRCode.toFileStream(res, url, { width: 360, margin: 2 });
  } catch (e) {
    res.status(500).send(e?.message || 'Failed to generate QR');
  }
});

export default r;
