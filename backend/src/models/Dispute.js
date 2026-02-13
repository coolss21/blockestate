// models/Dispute.js
import mongoose from "mongoose";

const courtOrderSchema = new mongoose.Schema(
  {
    orderText: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    type: String,
    txHash: String,
    blockNumber: Number,
    message: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const disputeSchema = new mongoose.Schema(
  {
    disputeId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    propertyId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "in-court", "resolved"],
      default: "open",
      index: true,
    },

    details: {
      type: String,
      required: true,
    },

    courtOrders: [courtOrderSchema],

    hearingDate: {
      type: Date,
      index: true,
    },

    timeline: [timelineSchema],
  },
  { timestamps: true }
);

/* Indexes */
disputeSchema.index({ createdAt: -1 });

export default mongoose.model("Dispute", disputeSchema);
