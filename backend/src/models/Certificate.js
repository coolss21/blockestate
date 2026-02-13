// models/Certificate.js
import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    propertyId: {
        type: String,
        required: true,
        index: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    docHash: {
        type: String, // SHA-256 of the generated PDF content
        required: true
    },
    qrUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    },
    pdfData: {
        type: Buffer, // The complete PDF binary stored in MongoDB
        required: true
    },
    storagePath: {
        type: String // Optional local filesystem reference
    },
    status: {
        type: String,
        enum: ['active', 'revoked'],
        default: 'active'
    }
}, { timestamps: true });

certificateSchema.index({ propertyId: 1, createdAt: -1 });

export default mongoose.model('Certificate', certificateSchema);
