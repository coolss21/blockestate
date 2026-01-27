import { connectMongo } from "../db/mongoose.js";
import CaseModel from "../models/Case.js";

export const CaseController = {
  /**
   * List cases (optionally filtered by status)
   */
  async list(req, res) {
    await connectMongo();

    const status = req.query.status ? String(req.query.status) : undefined;
    const query = status ? { status } : {};

    const cases = await CaseModel.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({ ok: true, cases });
  },

  /**
   * Get a single case by MongoDB _id
   */
  async getOne(req, res) {
    await connectMongo();

    const id = String(req.params.id || "").trim();
    if (!id) {
      return res.status(400).json({ error: "Case id required" });
    }

    const caseRecord = await CaseModel.findById(id).lean().exec();
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found" });
    }

    return res.json({ ok: true, case: caseRecord });
  },

  /**
   * Add a court order to a case
   */
  async addOrder(req, res) {
    await connectMongo();

    const id = String(req.params.id || "").trim();
    const { text } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Case id required" });
    }

    if (!text) {
      return res.status(400).json({ error: "Order text required" });
    }

    const caseRecord = await CaseModel.findById(id).exec();
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found" });
    }

    caseRecord.orders.push({
      text: String(text),
      createdBy: req.user.sub,
      createdAt: new Date(),
    });

    await caseRecord.save();

    return res.json({ ok: true, case: caseRecord });
  },

  /**
   * Close a case (final resolution)
   */
  async close(req, res) {
    await connectMongo();

    const id = String(req.params.id || "").trim();

    if (!id) {
      return res.status(400).json({ error: "Case id required" });
    }

    const caseRecord = await CaseModel.findById(id).exec();
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (caseRecord.status === "closed") {
      return res.status(409).json({ error: "Case already closed" });
    }

    caseRecord.status = "closed";
    await caseRecord.save();

    return res.json({ ok: true, case: caseRecord });
  },
};
