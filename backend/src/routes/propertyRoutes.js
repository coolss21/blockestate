import { Router } from 'express';
import multer from 'multer';
import { requireRole } from '../middleware/auth.js';
import { PropertyController } from '../controllers/propertyController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const r = Router();

// Specific GET routes must come before '/:id' to avoid being shadowed.
r.get('/certificate/:id/pdf', PropertyController.downloadCertificate);
r.get('/timeline/:id', requireRole(['citizen', 'registrar', 'court', 'admin']), PropertyController.timeline);
r.get('/qr/:id', PropertyController.qr);

r.post('/register', requireRole(['registrar']), upload.single('file'), PropertyController.register);
r.post('/verify', requireRole(['citizen', 'registrar', 'court', 'admin']), upload.single('file'), PropertyController.verify);

r.get('/:id', requireRole(['citizen', 'registrar', 'court', 'admin']), PropertyController.get);

export default r;
