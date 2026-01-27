import { Router } from 'express';
import authRoutes from './authRoutes.js';
import accountsRoutes from './accountsRoutes.js';
import metricsRoutes from './metricsRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import transferRoutes from './transferRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import publicRoutes from './publicRoutes.js';
import rbacAuthRoutes from './rbacAuthRoutes.js';
import rbacRoutes from './rbacRoutes.js';

// New BlockEstate routes
import citizenRoutes from './citizenRoutes.js';
import registrarRoutes from './registrarRoutes.js';
import courtRoutes from './courtRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicVerificationRoutes from './publicVerificationRoutes.js';

const r = Router();

r.get('/health', (_req, res) => res.json({ ok: true }));

// Auth routes (password-based login)
r.use('/auth', authRoutes);

// BlockEstate role-based routes
r.use('/citizen', citizenRoutes);
r.use('/registrar', registrarRoutes);
r.use('/court', courtRoutes);
r.use('/admin', adminRoutes);

// Public verification
r.use('/public/verify', publicVerificationRoutes);

// Legacy routes (keep for backward compatibility)
r.use('/accounts', accountsRoutes);
r.use('/metrics', metricsRoutes);
r.use('/property', propertyRoutes);
r.use('/transfer', transferRoutes);
r.use('/dispute', disputeRoutes);
r.use('/certificate', certificateRoutes);
r.use('/public', publicRoutes);
r.use('/rbac/auth', rbacAuthRoutes);
r.use('/rbac', rbacRoutes);

export default r;
