// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    ownerWallet: {
      type: String,
      lowercase: true,
      index: true,
    },

    ownerEmail: {
      type: String,
      lowercase: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      district: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    areaSqft: {
      type: Number,
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "disputed"],
      default: "pending",
      index: true,
    },

    /* Hybrid Storage */
    ipfsCID: {
      type: String,
      index: true,
    },

    bucketUrl: {
      type: String, // CDN / S3 / GCS URL
    },

    docHash: {
      type: String, // SHA-256
      required: true,
    },

    certificateUrl: {
      type: String,
    },

    qrData: {
      type: mongoose.Schema.Types.Mixed,
    },

    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    chain: {
      chainId: Number,
      txHash: String,
      blockNumber: Number,
      contractAddress: String,
    },
  },
  { timestamps: true }
);

/* Indexes */
propertySchema.index({
  ownerName: "text",
  ownerEmail: "text",
  "address.line1": "text",
  "address.district": "text",
  "address.state": "text",
});

propertySchema.index({ createdAt: -1 });

export default mongoose.model("Property", propertySchema);
