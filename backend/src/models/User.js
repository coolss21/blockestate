// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      trim: true,
    },

    passwordHash: {
      type: String, // bcrypt hash
    },

    walletAddress: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    privateKey: {
      type: String, // Server-managed wallet key (encrypt in production)
      select: false // Don't return by default
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["citizen", "registrar", "court", "admin"],
      required: true,
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;