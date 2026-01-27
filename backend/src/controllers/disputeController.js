import { connectMongo } from "../db/mongoose.js";
import Dispute from "../models/Dispute.js";
import { BlockchainService } from "../services/blockchainService.js";
import { MetricsService } from "../services/metricsService.js";
import crypto from "crypto";

/* Utility: Generate Dispute ID */
function generateDisputeId() {
  return `DSP-${crypto.randomInt(100000, 999999)}`;
}

export const DisputeController = {
  /**
   * Flag a dispute on a property
   * Creates DB record + anchors evidence on-chain
   */
  async flag(req, res) {
    await connectMongo();

    const { propertyId, details } = req.body || {};

    if (!propertyId || !details) {
      return res.status(400).json({
        error: "propertyId and details are required",
      });
    }

    /* Prevent duplicate open disputes */
    const existing = await Dispute.findOne({
      propertyId: String(propertyId),
      status: { $ne: "resolved" },
    }).lean();

    if (existing) {
      return res.status(409).json({
        error: "Active dispute already exists for this property",
      });
    }

    /* Blockchain anchoring */
    const tx = await BlockchainService.flagDispute({
      propertyId: String(propertyId),
      reason: String(details),
    });

    /* Create dispute record */
    const dispute = await Dispute.create({
      disputeId: generateDisputeId(),
      propertyId: String(propertyId),
      status: "open",
      details: String(details),
      timeline: [
        {
          type: "DISPUTE_FLAGGED",
          txHash: tx.txHash || tx,
          blockNumber: tx.blockNumber,
          message: "Dispute flagged on blockchain",
        },
      ],
    });

    MetricsService.inc("disputesFlagged");

    return res.status(201).json({
      ok: true,
      dispute,
    });
  },

  /**
   * Resolve (clear) a dispute
   * Closes DB record + anchors resolution on-chain
   */
  async clear(req, res) {
    await connectMongo();

    const { disputeId } = req.body || {};

    if (!disputeId) {
      return res.status(400).json({
        error: "disputeId required",
      });
    }

    const dispute = await Dispute.findOne({ disputeId }).exec();

    if (!dispute) {
      return res.status(404).json({
        error: "Dispute not found",
      });
    }

    if (dispute.status === "resolved") {
      return res.status(409).json({
        error: "Dispute already resolved",
      });
    }

    /* Blockchain anchoring */
    const tx = await BlockchainService.clearDispute({
      propertyId: dispute.propertyId,
    });

    /* Update dispute lifecycle */
    dispute.status = "resolved";
    dispute.timeline.push({
      type: "DISPUTE_RESOLVED",
      txHash: tx.txHash || tx,
      blockNumber: tx.blockNumber,
      message: "Dispute resolved on blockchain",
    });

    await dispute.save();

    MetricsService.inc("disputesResolved");

    return res.json({
      ok: true,
      dispute,
    });
  },
};
