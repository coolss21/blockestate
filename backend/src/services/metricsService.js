const metrics = {
  totalVerifications: 0,
  avgVerificationMs: 0,
  docMismatchDetections: 0,
  disputesFlagged: 0,
  transfersInitiated: 0,
  transfersFinalized: 0,
  blockedAttempts: 0,
  ipfsUploads: 0,
  propertiesRegistered: 0
};

function updateAvg(oldAvg, n, x) {
  return oldAvg + (x - oldAvg) / n;
}

export const MetricsService = {
  get() {
    return metrics;
  },
  inc(key, n = 1) {
    if (typeof metrics[key] !== 'number') metrics[key] = 0;
    metrics[key] += n;
  },
  noteVerification(ms, verified) {
    metrics.totalVerifications += 1;
    metrics.avgVerificationMs = updateAvg(metrics.avgVerificationMs, metrics.totalVerifications, ms);
    if (!verified) metrics.docMismatchDetections += 1;
  }
};
