import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { CertificateController } from '../controllers/certificateController.js';

const r = Router();

// Protected (requires token)
r.get('/:id.pdf', requireRole(['citizen','registrar','court']), CertificateController.pdf);
r.get('/:id/proof', requireRole(['citizen','registrar','court']), CertificateController.proof);
r.post('/verify', requireRole(['citizen','registrar','court']), CertificateController.verify);

export default r;
