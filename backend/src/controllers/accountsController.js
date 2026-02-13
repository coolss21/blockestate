import { BlockchainService } from '../services/blockchainService.js';

export const AccountsController = {
  async list(_req, res) {
    try {
      const accounts = await BlockchainService.getAccounts();
      return res.json({ ok:true, accounts });
    } catch (e) {
      return res.status(500).json({ ok:false, error: e.message });
    }
  }
};
