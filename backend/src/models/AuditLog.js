// models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    role: {
      type: String,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true, // e.g., LOGIN, APPROVE_APPLICATION
    },

    txHash: {
      type: String,
      index: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
    },

    ip: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

/* Indexes */
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
