import { issueToken } from '../middleware/auth.js';

export const AuthController = {
  token(req, res) {
    const role = String(req.params.role || '').toLowerCase();
    if (!['citizen','registrar','court'].includes(role)) {
      return res.status(400).json({ error: 'role must be citizen|registrar|court' });
    }
    return res.json({ ok:true, role, token: issueToken(role) });
  }
};
