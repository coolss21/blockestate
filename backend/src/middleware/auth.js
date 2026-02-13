import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';

export function issueToken(role) {
  return jwt.sign({ role }, JWT_SECRET, { expiresIn: '7d' });
}

export function requireRole(allowed) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!allowed.includes(payload.role)) return res.status(403).json({ error: 'Forbidden (role)' });
      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// Requires a JWT that includes a user id (sub). Used for Mongo-backed RBAC routes.
export function requireAuth(allowedRoles) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (!payload.sub) return res.status(401).json({ error: 'Invalid token (missing sub)' });
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden (role)' });
      }
      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
