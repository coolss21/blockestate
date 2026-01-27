import { connectMongo } from "../db/mongoose.js";
import Dispute from "../models/Dispute.js";
import CaseModel from "../models/Case.js";
import crypto from "crypto";

/* Utilities */
function generateDisputeId() {
  return `DSP-${crypto.randomInt(100000, 999999)}`;
}

function generateCaseId() {
  return `CASE-${crypto.randomInt(100000, 999999)}`;
}

export const RbacDisputeController = {
  /**
   * Citizen / Registrar: create a dispute
   */
  async create(req, res) {
    await connectMongo();

    const { propertyId, details } = req.body || {};

    if (!propertyId || !details) {
      return res.status(400).json({
        error: "propertyId and details required",
      });
    }

    /* Prevent multiple active disputes */
    const existing = await Dispute.findOne({
      propertyId: String(propertyId),
      status: { $ne: "resolved" },
    }).lean();

    if (existing) {
      return res.status(409).json({
        error: "Active dispute already exists for this property",
      });
    }

    const dispute = await Dispute.create({
      disputeId: generateDisputeId(),
      propertyId: String(propertyId).trim(),
      status: "open",
      details: String(details),
      timeline: [
        {
          type: "DISPUTE_CREATED",
          message: "Dispute created by user",
        },
      ],
    });

    return res.status(201).json({ ok: true, dispute });
  },

  /**
   * List disputes created by user (ownership inferred via property)
   * NOTE: If you want strict ownership, add createdBy to schema
   */
  async my(req, res) {
    await connectMongo();

    const disputes = await Dispute.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({ ok: true, disputes });
  },

  /**
   * Registrar / Admin inbox
   */
  async inbox(req, res) {
    await connectMongo();

    const status = req.query.status ? String(req.query.status) : undefined;
    const query = status ? { status } : {};

    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({ ok: true, disputes });
  },

  /**
   * Registrar/Admin: refer dispute to court (create case)
   */
  async referToCourt(req, res) {
    await connectMongo();

    const id = String(req.params.id || "").trim();
    if (!id) {
      return res.status(400).json({ error: "Dispute id required" });
    }

    const dispute = await Dispute.findById(id).exec();
    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found" });
    }

    if (dispute.status !== "open") {
      return res.status(409).json({
        error: "Only open disputes can be referred to court",
      });
    }

    /* Create case */
    const courtCase = await CaseModel.create({
      caseId: generateCaseId(),
      disputeId: dispute.disputeId,
      propertyId: dispute.propertyId,
      status: "active",
      orders: [],
    });

    /* Update dispute */
    dispute.status = "in-court";
    dispute.timeline.push({
      type: "REFERRED_TO_COURT",
      message: "Dispute referred to court",
    });

    await dispute.save();

    return res.json({
      ok: true,
      dispute,
      case: courtCase,
    });
  },
};
