import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { MetricsController } from '../controllers/metricsController.js';

const r = Router();
r.get('/', requireRole(['citizen','registrar','court']), MetricsController.get);
export default r;
