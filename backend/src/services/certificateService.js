import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { ethers } from 'ethers';
import crypto from 'crypto';
import os from 'os';
import { BlockchainService } from './blockchainService.js';
import { IpfsService } from './ipfsService.js';
import { shortHex } from '../utils/hash.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BACKEND_URL } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '../storage/certificates');

// Helper to get status label
function statusLabel(n) {
  return Number(n) === 1 ? 'DISPUTED' : 'CLEAR';
}

function shortAddr(a) {
  if (!a) return '';
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

async function findRegistrationEvent(propertyId, lookbackBlocks = 200000) {
  const latest = await BlockchainService.provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - lookbackBlocks);
  const filter = BlockchainService.contract.filters.PropertyRegistered(propertyId);
  const logs = await BlockchainService.contract.queryFilter(filter, fromBlock, latest);
  if (!logs || logs.length === 0) return null;
  logs.sort((a, b) => a.blockNumber - b.blockNumber);
  const ev = logs[0];
  return {
    txHash: ev.transactionHash,
    blockNumber: ev.blockNumber,
    registrar: ev.args?.registrar || '',
    timestamp: ev.args?.timestamp ? Number(ev.args.timestamp) : null
  };
}

/**
 * Build payload with request-derived base so URLs never embed localhost.
 */
async function buildPayload(propertyId, req) {
  const p = await BlockchainService.getProperty(propertyId);

  if (!p?.exists) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }

  const cid = IpfsService.extractCid(p.fileRef);
  const regEv = await findRegistrationEvent(propertyId);

  const base = BACKEND_URL; // ✅ Use Env

  // NOTE: routes mounted under /api
  const publicCertificateUrl = `${base}/certificates/${encodeURIComponent(propertyId)}.pdf`;
  // QR Code points to the static PDF file per requirements
  const publicVerifyUrl = publicCertificateUrl;

  return {
    propertyId,
    onchain: {
      owner: p.owner,
      ownerShort: shortAddr(p.owner),
      docHash: p.docHash,
      docHashShort: shortHex(p.docHash, 14, 10),
      fileRef: p.fileRef,
      createdAt: Number(p.createdAt),
      status: Number(p.status),
      statusLabel: statusLabel(p.status),
      disputeReason: p.disputeReason || '',
      disputeCaseId: p.disputeCaseId || '',
      disputeAt: Number(p.disputeAt || 0),
      transferPending: Boolean(p.transferPending),
      pendingBuyer: p.pendingBuyer || '',
      ipfsCid: cid,
      ipfsUrl: cid ? IpfsService.toGatewayUrl(cid) : null
    },
    registration: {
      registrar: regEv?.registrar || '',
      registrarShort: regEv?.registrar ? shortAddr(regEv.registrar) : '',
      txHash: regEv?.txHash || '',
      txHashShort: regEv?.txHash ? shortHex(regEv.txHash, 14, 10) : '',
      blockNumber: regEv?.blockNumber ?? null,
      eventTimestamp: regEv?.timestamp ?? null
    },
    urls: {
      certificate: publicCertificateUrl,
      verify: publicVerifyUrl
    }
  };
}

async function signPayload(payloadObj) {
  const payloadJson = JSON.stringify(payloadObj);
  const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(payloadJson));
  const signature = await BlockchainService.wallet.signMessage(ethers.getBytes(payloadHash));
  const certificateId = ethers.keccak256(ethers.concat([ethers.getBytes(payloadHash), ethers.getBytes(signature)]));
  return {
    payloadJson,
    payloadHash,
    signature,
    signer: BlockchainService.wallet.address,
    certificateId,
    certificateNo: `CERT-${certificateId.slice(2, 14).toUpperCase()}`
  };
}

function verifySignature({ payloadJson, payloadHash, signature, signer }) {
  const recomputedHash = ethers.keccak256(ethers.toUtf8Bytes(payloadJson));
  if (recomputedHash.toLowerCase() !== String(payloadHash).toLowerCase()) {
    return { ok: false, reason: 'HASH_MISMATCH_WITH_PAYLOAD_JSON' };
  }
  const recovered = ethers.verifyMessage(ethers.getBytes(payloadHash), signature);
  if (recovered.toLowerCase() !== String(signer).toLowerCase()) {
    return { ok: false, reason: 'SIGNATURE_INVALID', recovered };
  }
  return { ok: true, recovered };
}

function drawBadge(doc, x, y, text) {
  doc.roundedRect(x, y, 160, 24, 6).fillOpacity(0.08).fillAndStroke('#000000', '#000000');
  doc.fillOpacity(1).fontSize(10).fillColor('#111111').text(text, x + 10, y + 7);
  doc.fillColor('black');
}

/**
 * Render PDF to Buffer (prevents "loads forever" issues)
 */
async function renderPublicCertificatePdfBuffer({ propertyId, req }) {
  const payload = await buildPayload(propertyId, req);
  const proof = await signPayload(payload);

  // Only show non-sensitive fields.
  const ownerShort = payload.onchain.ownerShort;
  const docHashShort = payload.onchain.docHashShort;
  const status = payload.onchain.statusLabel;
  const ipfsCidShort = payload.onchain.ipfsCid ? shortHex(payload.onchain.ipfsCid, 16, 10) : 'N/A';
  const regTxShort = payload.registration.txHashShort || 'N/A';

  const pdfBuffer = await new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: { Title: `PropertyChain Certificate - ${propertyId}` }
      });

      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).fillColor('#111111').text('Certificate of Authenticity', { align: 'center' });
      doc.moveDown(0.15);
      doc.fontSize(10).fillColor('#333333').text('Issued by PropertyChain • Blockchain + IPFS Verified', { align: 'center' });
      doc.moveDown(1);

      // top line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke('#999999');
      doc.moveDown(1);

      // Meta row
      drawBadge(doc, 50, doc.y, proof.certificateNo);
      drawBadge(doc, 390, doc.y, `STATUS: ${status}`);
      doc.moveDown(2);

      // Main section
      doc.fontSize(14).fillColor('#111111').text(`Property ID: ${payload.propertyId}`);
      doc.moveDown(0.5);

      doc.fontSize(11).fillColor('#222222');
      doc.text(`Owner (masked): ${ownerShort}`);
      doc.text(`Document fingerprint (masked): ${docHashShort}`);
      doc.text(`IPFS reference (masked CID): ${ipfsCidShort}`);
      doc.text(`Registration Tx (masked): ${regTxShort}`);
      doc.moveDown(0.8);

      if (payload.onchain.status === 1) {
        doc.fillColor('#8a1f1f').text('Note: This property is currently marked as DISPUTED on-chain.');
        doc.fillColor('#222222');
        doc.moveDown(0.3);
      }

      doc.fontSize(10).fillColor('#333333').text(
        'This certificate proves that a property record exists on a blockchain. The full deed/document remains private with the owner. The only public proof is a cryptographic fingerprint (hash) and an optional IPFS reference.',
        { align: 'left' }
      );
      doc.moveDown(1);

      // Verification box
      doc.roundedRect(50, doc.y, 495, 210, 12).lineWidth(1).stroke('#cccccc');
      const boxTop = doc.y + 12;

      // QR code (links to public verify page)
      const qrPng = await QRCode.toBuffer(payload.urls.certificate, { width: 250, margin: 1 });
      doc.image(qrPng, 70, boxTop + 20, { width: 130 });
      doc.fontSize(10).fillColor('#111111').text('Scan to verify online', 70, boxTop + 155);

      // Right side details
      const rx = 230;
      const ry = boxTop + 18;
      doc.fontSize(12).fillColor('#111111').text('Verification Details', rx, ry);
      doc.fontSize(10).fillColor('#222222');
      doc.text(`Verify URL: ${payload.urls.verify}`, rx, ry + 20, { width: 300 });
      doc.text(`Certificate URL: ${payload.urls.certificate}`, rx, ry + 55, { width: 300 });

      doc.moveTo(rx, ry + 98).lineTo(525, ry + 98).stroke('#e0e0e0');

      doc.fontSize(12).fillColor('#111111').text('Cryptographic Proof', rx, ry + 110);
      doc.fontSize(9).fillColor('#333333');
      doc.text(`Signer: ${shortAddr(proof.signer)}`, rx, ry + 130);
      doc.text(`Payload Hash: ${shortHex(proof.payloadHash, 18, 14)}`, rx, ry + 145);
      doc.text(`Signature: ${shortHex(proof.signature, 18, 14)}`, rx, ry + 160);

      doc.moveDown(15);
      doc.y = boxTop + 225;

      // Footer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke('#999999');
      doc.moveDown(0.8);
      doc.fontSize(8).fillColor('#555555').text(
        'How authenticity works: we sign a deterministic hash of the current on-chain state. Anyone can re-verify by querying the blockchain and checking the signature. This PDF contains masked fields only.',
        { align: 'left' }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });

  return { payload, proof, pdfBuffer };
}

/**
 * Send buffer with Range support (prevents infinite loading on phones)
 */
function sendPdfBuffer(req, res, propertyId, pdfBuffer) {
  const size = pdfBuffer.length;
  const range = req.headers.range;

  const sha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="certificate_${propertyId}.pdf"`);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Certificate-SHA256', sha256);

  if (range) {
    const m = /^bytes=(\d+)-(\d+)?$/.exec(range);
    if (!m) {
      res.setHeader('Content-Range', `bytes */${size}`);
      return res.status(416).end();
    }
    const start = parseInt(m[1], 10);
    const end = m[2] ? parseInt(m[2], 10) : size - 1;

    if (start >= size || end >= size || start > end) {
      res.setHeader('Content-Range', `bytes */${size}`);
      return res.status(416).end();
    }
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Content-Length', String(end - start + 1));
    return res.end(pdfBuffer.subarray(start, end + 1));
  }

  res.status(200);
  res.setHeader('Content-Length', String(size));
  return res.end(pdfBuffer);
}

// Controllers call this
async function generateCertificatePdf({ propertyId, req, res /*, isPublic */ }) {
  const { pdfBuffer } = await renderPublicCertificatePdfBuffer({ propertyId, req });

  // Save to backend storage for static serving
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const filePath = path.join(STORAGE_DIR, `${propertyId}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);
  } catch (err) {
    console.error('Failed to save certificate PDF to storage:', err);
  }

  return sendPdfBuffer(req, res, propertyId, pdfBuffer);
}

// Public verify/proof uses this
async function generateCertificateProof(propertyId, req) {
  const payload = await buildPayload(propertyId, req);
  const proof = await signPayload(payload);
  return { payload, proof };
}

function verifyCertificate({ payloadJson, payloadHash, signature, signer }) {
  return verifySignature({ payloadJson, payloadHash, signature, signer });
}

export const CertificateService = {
  buildPayload,
  signPayload,
  verifySignature,
  renderPublicCertificatePdfBuffer,
  generateCertificatePdf,
  generateCertificateProof,
  verifyCertificate
};
