import { Router } from 'express';
import { RbacAuthController } from '../controllers/rbacAuthController.js';

const r = Router();

// Mongo-backed RBAC login
r.post('/login', RbacAuthController.login);

// Dev/demo seeder (should be protected in production)
r.get('/seed', RbacAuthController.seed);

export default r;
