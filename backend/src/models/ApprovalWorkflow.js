// models/ApprovalWorkflow.js
import mongoose from 'mongoose';

const approvalStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true }, // "Junior Registrar Review"
  role: { type: String, required: true }, // "junior-registrar"
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  autoAssign: { type: Boolean, default: false },
  required: { type: Boolean, default: true },
  maxDuration: { type: Number }, // In hours
  notifyOnPending: { type: Boolean, default: true }
}, { _id: false });

const approvalWorkflowSchema = new mongoose.Schema({
  workflowId: {
    type: String,
    unique: true,
    required: true,
    default: () => `WF-${Date.now()}`
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  applicationType: {
    type: String,
    enum: ['issue', 'transfer', 'correction'],
    default: 'issue'
  },
  steps: [approvalStepSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

approvalWorkflowSchema.index({ applicationType: 1, isActive: 1 });

export default mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
