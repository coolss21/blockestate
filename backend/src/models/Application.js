// models/Application.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    ipfsCID: String,
    bucketUrl: String,
    docHash: String,
    fileName: String,
    fileType: String,
    size: Number,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    comment: String,
  },
  { _id: false }
);

const approvalSchema = new mongoose.Schema(
  {
    registrarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    decision: {
      type: String,
      enum: ["approved", "rejected", "requested-changes"],
      required: true,
    },
    comment: String,
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    approvalOrder: Number, // For sequential workflow
    registrarName: String, // Snapshot at approval time
    registrarEmail: String, // Snapshot at approval time
  },
  { _id: false }
);

const approvalMetadataSchema = new mongoose.Schema(
  {
    requiredApprovals: {
      type: Number,
      default: 2,
    },
    approvalType: {
      type: String,
      enum: ["parallel", "sequential"],
      default: "parallel",
    },
    currentStep: {
      type: Number,
      default: 0,
    }, // For sequential workflow
    approvedCount: {
      type: Number,
      default: 0,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
    finalApprovedAt: Date,
    finalApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    blockchainError: String, // Track blockchain registration failures
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    propertyId: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: ["issue", "transfer", "correction"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    propertyDraft: {
      ownerName: { type: String },
      address: {
        line1: { type: String },
        line2: { type: String },
        district: { type: String },
        state: { type: String },
        pincode: { type: String }
      },
      areaSqft: { type: Number },
      value: { type: Number }
    },

    details: {
      reason: { type: String },
      fieldsToCorrect: { type: mongoose.Schema.Types.Mixed },
      notes: { type: String },
    },

    rejectionReason: {
      type: String
    },

    documents: [documentSchema],

    review: reviewSchema,

    // Multi-step approval fields
    approvals: [approvalSchema],
    approvalMetadata: approvalMetadataSchema,
  },
  { timestamps: true }
);

/* Indexes */
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({
  "details.reason": "text",
  "details.notes": "text",
});
applicationSchema.index({ "approvalMetadata.currentStep": 1 });
applicationSchema.index({ "approvals.registrarId": 1 });
applicationSchema.index({ status: 1, "approvalMetadata.approvedCount": 1 });

export default mongoose.model("Application", applicationSchema);
