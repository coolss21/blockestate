import { connectMongo } from '../db/mongoose.js';
import { loginWithEmailPassword, seedDemoUsers } from '../services/rbacAuthService.js';

export const RbacAuthController = {
  async login(req, res) {
    await connectMongo();
    const { email, password, role } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, role required' });
    }
    const { user, token } = await loginWithEmailPassword({ email, password, role });
    return res.json({ ok: true, token, user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
  },

  async seed(req, res) {
    await connectMongo();
    const out = await seedDemoUsers();
    return res.json(out);
  }
};
