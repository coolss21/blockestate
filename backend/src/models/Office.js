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
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model('OfficeConfig', OfficeConfigSchema);
