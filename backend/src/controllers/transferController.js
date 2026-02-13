import { ethers } from 'ethers';
import { BlockchainService } from '../services/blockchainService.js';
import { MetricsService } from '../services/metricsService.js';

export const TransferController = {
  async initiate(req, res) {
    try {
      const { propertyId, buyerAddress } = req.body || {};
      if (!propertyId || !buyerAddress) return res.status(400).json({ error: 'propertyId and buyerAddress required' });
      if (!ethers.isAddress(buyerAddress)) return res.status(400).json({ error: 'buyerAddress invalid' });

      const txHash = await BlockchainService.initiateTransfer({ propertyId, buyerAddress });
      MetricsService.inc('transfersInitiated');
      return res.json({ ok:true, propertyId, buyerAddress, txHash });
    } catch (e) {
      if ((e.message || '').includes('TRANSFER_ALREADY_PENDING')) MetricsService.inc('blockedAttempts');
      return res.status(500).json({ error: e.message });
    }
  },

  async finalize(req, res) {
    try {
      const { propertyId } = req.body || {};
      if (!propertyId) return res.status(400).json({ error: 'propertyId required' });

      const txHash = await BlockchainService.finalizeTransfer({ propertyId });
      MetricsService.inc('transfersFinalized');
      return res.json({ ok:true, propertyId, txHash });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
};
