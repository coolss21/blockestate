// models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    propertyId: {
      type: String,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      index: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    storageMode: {
      type: String,
      enum: ["IPFS", "BUCKET", "HYBRID"],
      default: "HYBRID",
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    uploadStatus: {
      type: String,
      enum: ["pending", "uploaded", "failed"],
      default: "uploaded",
      index: true,
    },

    encryptedData: {
      type: String, // reserved for future encryption metadata
    },
  },
  { timestamps: true }
);

/* Indexes */
documentSchema.index({ ipfsCID: 1, docHash: 1 }, { unique: true });
documentSchema.index({ createdAt: -1 });

export default mongoose.model("Document", documentSchema);
