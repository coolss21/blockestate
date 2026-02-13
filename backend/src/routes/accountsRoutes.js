import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import { AccountsController } from '../controllers/accountsController.js';

const r = Router();
r.get('/', requireRole(['citizen','registrar','court']), AccountsController.list);
export default r;
