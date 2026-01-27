import { CertificateService } from '../services/certificateService.js';

export const CertificateController = {
  async pdf(req, res) {
    try {
      const propertyId = String(req.params.id || '').trim();
      if (!propertyId) return res.status(400).json({ error: 'propertyId missing' });

      await CertificateService.generateCertificatePdf({
        propertyId,
        req,
        res,
        isPublic: false
      });
    } catch (e) {
      return res.status(e.statusCode || 500).json({ error: e.message });
    }
  },

  async publicPdf(req, res) {
    try {
      const propertyId = String(req.params.id || '').trim();
      if (!propertyId) return res.status(400).json({ error: 'propertyId missing' });

      await CertificateService.generateCertificatePdf({
        propertyId,
        req,
        res,
        isPublic: true
      });
    } catch (e) {
      return res.status(e.statusCode || 500).json({ error: e.message });
    }
  },

  // GET /api/public/verify?propertyId=BLR-001
  async publicVerify(req, res) {
    try {
      const propertyId = String(req.query?.propertyId || '').trim();
      if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });

      const { payload, proof } = await CertificateService.generateCertificateProof(propertyId, req);

      return res.json({
        ok: true,
        propertyId,
        payload,
        proof: {
          certificateNo: proof.certificateNo,
          certificateId: proof.certificateId,
          payloadHash: proof.payloadHash,
          signature: proof.signature,
          signer: proof.signer
        }
      });
    } catch (e) {
      const status = e.statusCode || e.status || 500;
      return res.status(status).json({ error: e.message || 'Failed to build public verification payload' });
    }
  },

  async proof(req, res) {
    try {
      const propertyId = String(req.params.id || '').trim();
      if (!propertyId) return res.status(400).json({ error: 'propertyId missing' });
      const { payload, proof } = await CertificateService.generateCertificateProof(propertyId, req);
      return res.json({ ok: true, propertyId, payload, proof });
    } catch (e) {
      return res.status(e.statusCode || 500).json({ error: e.message });
    }
  },

  async verify(req, res) {
    try {
      const { payloadJson, payloadHash, signature, signer } = req.body || {};
      if (!payloadJson || !payloadHash || !signature || !signer) {
        return res.status(400).json({ error: 'payloadJson, payloadHash, signature, signer required' });
      }
      const verification = CertificateService.verifyCertificate({ payloadJson, payloadHash, signature, signer });
      return res.json({ ok: true, verification });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
};
