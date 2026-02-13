// scripts/migrate-multistep-approval.js
// Migration: Add multi-step approval fields to existing applications

import mongoose from 'mongoose';
import Application from '../models/Application.js';
import OfficeConfig from '../models/Office.js';
import { connectMongo } from '../db/mongoose.js';
import { MONGO_URI } from '../config/index.js';

/**
 * Migration: Add multi-step approval fields to existing applications
 */
async function migrateApplications() {
    console.log('🔄 Starting multi-step approval migration...');

    try {
        // Connect to MongoDB
        if (!MONGO_URI) {
            throw new Error('MONGO_URI not set in environment variables');
        }
        await connectMongo();
        console.log('✅ Connected to MongoDB');
        // Get default config
        let config = await OfficeConfig.findOne({ officeId: 'default-office' });

        if (!config) {
            // Create default config
            config = new OfficeConfig({
                officeId: 'default-office',
                name: 'BlockEstate Registry Office',
                configData: {
                    multiStepApproval: {
                        enabled: true,
                        requiredApprovals: 2,
                        approvalType: 'parallel',
                        assignedRegistrars: [],
                        autoAssignment: false,
                        allowSelfRejection: true
                    }
                }
            });
            await config.save();
            console.log('✅ Created default office config');
        } else if (!config.configData?.multiStepApproval) {
            // Add multi-step config to existing
            config.configData = config.configData || {};
            config.configData.multiStepApproval = {
                enabled: true,
                requiredApprovals: 2,
                approvalType: 'parallel',
                assignedRegistrars: [],
                autoAssignment: false,
                allowSelfRejection: true
            };
            await config.save();
            console.log('✅ Added multi-step config to existing office');
        }

        // Migrate existing approved applications
        const approvedApps = await Application.find({
            status: 'approved',
            $or: [
                { approvalMetadata: { $exists: false } },
                { approvals: { $exists: false } }
            ]
        });

        console.log(`📝 Migrating ${approvedApps.length} approved applications...`);

        for (const app of approvedApps) {
            // Convert legacy review to approvals array
            if (app.review && app.review.reviewedBy) {
                app.approvals = [{
                    registrarId: app.review.reviewedBy,
                    decision: 'approved',
                    comment: app.review.comment || '',
                    approvedAt: app.review.reviewedAt || app.updatedAt
                }];

                app.approvalMetadata = {
                    requiredApprovals: 1, // Legacy: only needed 1
                    approvalType: 'parallel',
                    currentStep: 0,
                    approvedCount: 1,
                    rejectedCount: 0,
                    finalApprovedAt: app.review.reviewedAt || app.updatedAt,
                    finalApprovedBy: app.review.reviewedBy
                };

                await app.save();
            }
        }

        // Migrate existing rejected applications
        const rejectedApps = await Application.find({
            status: 'rejected',
            $or: [
                { approvalMetadata: { $exists: false } },
                { approvals: { $exists: false } }
            ]
        });

        console.log(`📝 Migrating ${rejectedApps.length} rejected applications...`);

        for (const app of rejectedApps) {
            if (app.review && app.review.reviewedBy) {
                app.approvals = [{
                    registrarId: app.review.reviewedBy,
                    decision: 'rejected',
                    comment: app.rejectionReason || app.review.comment || '',
                    approvedAt: app.review.reviewedAt || app.updatedAt
                }];

                app.approvalMetadata = {
                    requiredApprovals: 1,
                    approvalType: 'parallel',
                    currentStep: 0,
                    approvedCount: 0,
                    rejectedCount: 1
                };

                await app.save();
            }
        }

        // Update pending applications
        const pendingApps = await Application.find({
            status: 'pending',
            $or: [
                { approvalMetadata: { $exists: false } },
                { approvals: { $exists: false } }
            ]
        });

        console.log(`📝 Migrating ${pendingApps.length} pending applications...`);

        for (const app of pendingApps) {
            app.approvals = app.approvals || [];
            app.approvalMetadata = {
                requiredApprovals: config.configData.multiStepApproval.requiredApprovals,
                approvalType: config.configData.multiStepApproval.approvalType,
                currentStep: 0,
                approvedCount: 0,
                rejectedCount: 0
            };

            await app.save();
        }

        console.log('✅ Migration completed successfully!');
        console.log(`
Summary:
- Approved: ${approvedApps.length}
- Rejected: ${rejectedApps.length}
- Pending: ${pendingApps.length}
- Total migrated: ${approvedApps.length + rejectedApps.length + pendingApps.length}
        `);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
}

// Run migration
migrateApplications().catch(console.error);
