// models/OfficeConfig.js
import mongoose from 'mongoose';

const OfficeConfigSchema = new mongoose.Schema(
  {
    officeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'default-office'
    },
    name: {
      type: String,
      required: true,
      default: 'BlockEstate Registry Office'
    },
    location: {
      type: String,
      default: ''
    },
    configData: {
      pinataGateway: {
        type: String,
        default: 'https://gateway.pinata.cloud/ipfs'
      },
      defaultGasLimit: {
        type: Number,
        default: 500000
      },
      allowedFileTypes: {
        type: [String],
        default: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      },
      maxFileSize: {
        type: Number,
        default: 10
      },
      requireDocumentHash: {
        type: Boolean,
        default: true
      },
      autoVerifyUsers: {
        type: Boolean,
        default: false
      },
      blockchainEnabled: {
        type: Boolean,
        default: true
      },
      // Multi-step approval settings
      multiStepApproval: {
        enabled: {
          type: Boolean,
          default: true
        },
        requiredApprovals: {
          type: Number,
          default: 2,
          min: 1,
          max: 5
        },
        approvalType: {
          type: String,
          enum: ["parallel", "sequential"],
          default: "parallel"
        },
        sequentialOrder: [{
          role: String, // 'junior-registrar', 'senior-registrar', 'chief-registrar'
          title: String,
          required: Boolean
        }],
        allowSelfRejection: {
          type: Boolean,
          default: true
        }, // Can a registrar who approved later reject?
        autoAssignment: {
          type: Boolean,
          default: false
        }, // Auto-assign to specific registrars?
        assignedRegistrars: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }] // Pre-assigned registrars for approvals
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model('OfficeConfig', OfficeConfigSchema);
