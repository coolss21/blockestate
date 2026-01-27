/* 

This controller manages the entire lifecycle of an application:

Submission by a citizen

Review by registrar / court

Decision logging for audit & compliance
*/

import { connectMongo } from "../db/mongoose.js";
import Application from "../models/Application.js";
import crypto from "crypto";

/* Utility: Generate Application ID */
function generateAppId() {
  return `APP-${crypto.randomInt(100000, 999999)}`;
}

export const ApplicationController = {
  /**
   * Create new application (issue / correction)
   */
  async create(req, res) {
    await connectMongo();

    const { type, propertyId, reason, notes, fieldsToCorrect } = req.body || {};

    if (!type || !["issue", "correction"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing application type" });
    }

    const application = await Application.create({
      appId: generateAppId(),

      propertyId: propertyId ? String(propertyId).trim() : undefined,

      type,
      applicantId: req.user.sub,

      details: {
        reason: reason ? String(reason) : undefined,
        notes: notes ? String(notes) : undefined,
        fieldsToCorrect: fieldsToCorrect || undefined,
      },
    });

    return res.status(201).json({
      ok: true,
      application,
    });
  },

  /**
   * Get applications submitted by current user
   */
  async my(req, res) {
    await connectMongo();

    const applications = await Application.find({
      applicantId: req.user.sub,
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({
      ok: true,
      applications,
    });
  },

  /**
   * Registrar / Court inbox
   */
  async inbox(req, res) {
    await connectMongo();

    const { status, type } = req.query || {};
    const query = {};

    if (status) query.status = String(status);
    if (type) query.type = String(type);

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.json({
      ok: true,
      applications,
    });
  },

  /**
   * Approve / Reject application
   */
  async decide(req, res) {
    await connectMongo();

    const id = String(req.params.id || "").trim();
    const { decision, comment } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Application ID required" });
    }

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        error: "Decision must be 'approved' or 'rejected'",
      });
    }

    const application = await Application.findById(id).exec();

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.status !== "pending") {
      return res.status(409).json({
        error: "Application already processed",
      });
    }

    application.status = decision;

    application.review = {
      reviewedBy: req.user.sub,
      reviewedAt: new Date(),
      comment: comment ? String(comment) : undefined,
    };

    await application.save();

    return res.json({
      ok: true,
      application,
    });
  },
};
