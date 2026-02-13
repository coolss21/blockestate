import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { TransferController } from '../controllers/transferController.js';

const r = Router();
r.post('/initiate', requireRole(['citizen']), TransferController.initiate);
r.post('/finalize', requireRole(['registrar']), TransferController.finalize);
export default r;
