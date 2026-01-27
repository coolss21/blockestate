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
      enum: ["pending", "approved", "rejected"],
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
  },
  { timestamps: true }
);

/* Indexes */
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({
  "details.reason": "text",
  "details.notes": "text",
});

export default mongoose.model("Application", applicationSchema);
