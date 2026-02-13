import { MetricsService } from '../services/metricsService.js';

export const MetricsController = {
  get(_req, res) {
    return res.json({ ok:true, metrics: MetricsService.get() });
  }
};
