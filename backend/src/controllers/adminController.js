import { connectMongo } from '../db/mongoose.js';
import User  from '../models/User.js';

export const AdminController = {
  async listUsers(req, res) {
    await connectMongo();
    const users = await User.find({}).sort({ createdAt: -1 }).select('-passwordHash').lean().exec();
    return res.json({ ok: true, users });
  },

  async toggleActive(req, res) {
    await connectMongo();
    const id = String(req.params.id || '').trim();
    const { isActive } = req.body || {};
    const u = await User.findById(id).exec();
    if (!u) return res.status(404).json({ error: 'User not found' });
    u.isActive = Boolean(isActive);
    await u.save();
    return res.json({ ok: true, user: { id: String(u._id), email: u.email, role: u.role, isActive: u.isActive } });
  }
};
