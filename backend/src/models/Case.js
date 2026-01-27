// models/Case.js
import mongoose from "mongoose";

const caseOrderSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    disputeId: {
      type: String, // reference disputes.disputeId
      required: true,
      index: true,
    },

    propertyId: {
      type: String,
      required: true,
      index: true,
    },

    orders: [caseOrderSchema],

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

/* Indexes */
caseSchema.index({ createdAt: -1 });

export default mongoose.model("Case", caseSchema);
