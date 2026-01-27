import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { DisputeController } from '../controllers/disputeController.js';

const r = Router();
r.post('/flag', requireRole(['court']), DisputeController.flag);
r.post('/clear', requireRole(['court']), DisputeController.clear);
export default r;
