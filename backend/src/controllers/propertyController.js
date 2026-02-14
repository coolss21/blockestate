import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { BACKEND_URL } from '../config/index.js';
import { sha256Hex } from '../utils/hash.js';
import { BlockchainService } from '../services/blockchainService.js';
import { IpfsService } from '../services/ipfsService.js';
import { MetricsService } from '../services/metricsService.js';
import { PdfService } from '../services/pdfService.js';
import Property from '../models/Properties.js';
import Certificate from '../models/Certificate.js';
import os from 'os';
import fs from 'fs';
import path from 'path';

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function getQrUrl(propertyId) {
  return `${BACKEND_URL.replace(/\/$/, '')}/certificates/${encodeURIComponent(propertyId)}.pdf`;
}

export const PropertyController = {
  async health(_req, res) {
    return res.json({ ok: true, base: BACKEND_URL });
  },

  async get(req, res) {
    try {
      const propertyId = req.params.id;
      const data = await BlockchainService.getProperty(propertyId);
      const cid = IpfsService.extractCid(data.fileRef);
      return res.json({ ok: true, propertyId, ...data, ipfsCid: cid, ipfsUrl: cid ? IpfsService.toGatewayUrl(cid) : null });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async register(req, res) {
    try {
      const propertyId = String(req.body.propertyId || '').trim();
      const ownerAddress = String(req.body.ownerAddress || '').trim();
      const useIpfs = String(req.body.useIpfs || '').toLowerCase() === 'true';

      if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });
      if (!ownerAddress) return res.status(400).json({ error: 'ownerAddress is required' });
      if (!ethers.isAddress(ownerAddress)) return res.status(400).json({ error: 'ownerAddress invalid' });
      if (!req.file) return res.status(400).json({ error: 'file is required' });

      const docHash = '0x' + sha256Hex(req.file.buffer);

      let cid = null;
      let fileRef = req.file.originalname || 'uploaded_file';

      if (useIpfs) {
        cid = await IpfsService.pinToPinata({
          buffer: req.file.buffer,
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        fileRef = `ipfs://${cid}`;
        MetricsService.inc('ipfsUploads');
      }

      const txHash = await BlockchainService.registerProperty({ propertyId, docHash, fileRef, ownerAddress });
      MetricsService.inc('propertiesRegistered');

      return res.json({ ok: true, propertyId, ownerAddress, docHash, fileRef, ipfsCid: cid, ipfsUrl: cid ? IpfsService.toGatewayUrl(cid) : null, txHash });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async verify(req, res) {
    const start = Date.now();
    try {
      const propertyId = String(req.body.propertyId || '').trim();
      if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });
      if (!req.file) return res.status(400).json({ error: 'file is required' });

      const localHash = '0x' + sha256Hex(req.file.buffer);
      const data = await BlockchainService.getProperty(propertyId);
      if (!data.exists) return res.status(404).json({ error: 'Property not found' });

      const verified = localHash.toLowerCase() === String(data.docHash).toLowerCase();

      const ms = Date.now() - start;
      // Tracks avg verification time + mismatch counts.
      MetricsService.noteVerification(ms, verified);

      const cid = IpfsService.extractCid(data.fileRef);

      return res.json({
        ok: true,
        propertyId,
        verified,
        verificationMs: ms,
        localHash,
        onchainHash: data.docHash,
        fileRef: data.fileRef,
        ipfsCid: cid,
        ipfsUrl: cid ? IpfsService.toGatewayUrl(cid) : null,
        createdAt: data.createdAt,
        owner: data.owner,
        status: data.status,
        disputeReason: data.disputeReason,
        disputeCaseId: data.disputeCaseId,
        disputeAt: data.disputeAt,
        transferPending: data.transferPending,
        pendingBuyer: data.pendingBuyer
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async timeline(req, res) {
    try {
      const propertyId = req.params.id;
      const { events, score, risk } = await BlockchainService.timeline(propertyId);
      return res.json({ ok: true, propertyId, events, score, risk });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async qr(req, res) {
    try {
      const propertyId = req.params.id;
      const url = getQrUrl(propertyId);

      res.setHeader('Content-Type', 'image/png');
      await QRCode.toFileStream(res, url, { width: 400, margin: 2 });
    } catch (e) {
      console.error('QR Gen Error:', e);
      res.status(500).send(e.message);
    }
  },

  async downloadCertificate(req, res) {
    try {
      const { id } = req.params;
      const forceRegen = req.query.force === 'true';

      // 1. Check if we already have a stored certificate in MongoDB
      let certRecord = null;
      if (!forceRegen) {
        certRecord = await Certificate.findOne({ propertyId: id }).sort({ createdAt: -1 });
      }

      if (certRecord && certRecord.pdfData) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${id}.pdf`);
        return res.send(certRecord.pdfData);
      }

      // 2. Otherwise generate new one
      const property = await Property.findOne({ propertyId: id }).lean();
      if (!property) return res.status(404).json({ error: 'Property record not found' });

      const chainData = await BlockchainService.getProperty(id);
      property.chain = {
        txHash: chainData.docHash,
        blockNumber: chainData.createdAt,
        contractAddress: process.env.CONTRACT_ADDRESS || '0x...'
      };

      const qrUrl = getQrUrl(id);
      const pdfBuffer = await PdfService.generateCertificate(property, qrUrl);
      const docHash = sha256Hex(pdfBuffer);

      // 3. Store in MongoDB (Full PDF Binary)
      // Using findOneAndUpdate with upsert: true ensures 1 cert per property
      await Certificate.findOneAndUpdate(
        { propertyId: id },
        {
          generatedBy: req.user.sub,
          docHash: '0x' + docHash,
          qrUrl,
          pdfData: pdfBuffer,
          fileName: `Certificate_${id}.pdf`,
          status: 'active'
        },
        { upsert: true, new: true }
      );

      // 4. Update property record metadata
      await Property.updateOne({ propertyId: id }, {
        certificateUrl: qrUrl,
        qrData: { ...property.qrData, lastGeneratedAt: new Date(), docHash }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Certificate_${id}.pdf`);
      res.send(pdfBuffer);
    } catch (e) {
      console.error('PDF Download Error:', e);
      res.status(500).json({ error: e.message });
    }
  }
};
