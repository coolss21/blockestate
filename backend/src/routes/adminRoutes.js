import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import { requireAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Property from '../models/Properties.js';
import Dispute from '../models/Dispute.js';
import OfficeConfig from '../models/Office.js';
import { AuditService } from '../services/auditService.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();

/**
 * GET /api/admin/dashboard - Get admin dashboard stats
 */
router.get('/dashboard', requireAuth(['admin']), async (req, res) => {
    try {

        const [
            userCounts, propertiesCount, disputesCount,
            propertyStats, propertyStatusStats, totalValuation,
            districtStats, recentLogs,
            // Anomaly queries
            rejectedAppsByMonth, disputedByDistrict, applicationStatusCounts
        ] = await Promise.all([
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Property.countDocuments({ status: 'approved' }),
            Dispute.countDocuments({ status: { $ne: 'resolved' } }),
            // Property registrations over past 6 months
            Property.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            // Property status distribution
            Property.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            // Total valuation
            Property.aggregate([
                { $group: { _id: null, total: { $sum: '$value' } } }
            ]),
            // Top districts
            Property.aggregate([
                { $group: { _id: '$address.district', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            // Recent audit logs
            AuditLog.find({})
                .sort({ timestamp: -1 })
                .limit(5)
                .populate('userId', 'name email')
                .lean(),

            // ── Anomaly: Rejected/flagged applications per month (past 12 months) ──
            Application.aggregate([
                {
                    $match: {
                        status: { $in: ['rejected'] },
                        createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),

            // ── Anomaly: Disputed + Rejected properties by district ──
            Property.aggregate([
                { $match: { status: { $in: ['disputed', 'rejected'] } } },
                {
                    $group: {
                        _id: '$address.district',
                        flagged: { $sum: 1 }
                    }
                },
                { $sort: { flagged: -1 } },
                { $limit: 10 }
            ]),

            // ── Risk distribution: count applications by status ──
            Application.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const usersByRole = userCounts.reduce((acc, curr) => {
            acc[curr._id || 'unknown'] = curr.count;
            return acc;
        }, {});

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const analytics = propertyStats.map(s => ({
            name: `${months[s._id.month - 1]} ${s._id.year}`,
            registrations: s.count
        }));

        const propertyStatusAnalytics = propertyStatusStats.map(s => ({
            name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
            value: s.count
        }));

        const districtAnalytics = districtStats.map(s => ({
            name: s._id || 'Unknown',
            count: s.count
        }));

        // ── Build anomaly response data ──

        // 1. Abnormal registrations over time (rejected apps per month)
        const abnormalRegistrations = rejectedAppsByMonth.map(s => ({
            month: `${months[s._id.month - 1]} ${s._id.year}`,
            anomalies: s.count
        }));

        // 2. Abnormal transfers per region (disputed/rejected properties by district)
        const abnormalTransfers = disputedByDistrict.map(s => ({
            region: s._id || 'Unknown',
            flagged: s.flagged
        }));

        // 3. Risk distribution mapped from application statuses
        const riskMap = {
            'pending': 'Low Risk',
            'under-review': 'Medium Risk',
            'rejected': 'High Risk',
            'approved': 'Low Risk'
        };
        const riskAgg = {};
        applicationStatusCounts.forEach(s => {
            const label = riskMap[s._id] || 'Medium Risk';
            riskAgg[label] = (riskAgg[label] || 0) + s.count;
        });
        // Also blend in disputed properties as Critical
        const disputedTotal = disputedByDistrict.reduce((sum, d) => sum + d.flagged, 0);
        if (disputedTotal > 0) riskAgg['Critical'] = (riskAgg['Critical'] || 0) + disputedTotal;

        const riskDistribution = Object.entries(riskAgg).map(([name, value]) => ({ name, value }));

        res.json({
            users: usersByRole,
            totalUsers: Object.values(usersByRole).reduce((a, b) => a + b, 0),
            properties: propertiesCount,
            activeDisputes: disputesCount,
            totalValue: totalValuation[0]?.total || 0,
            analytics,
            statusAnalytics: propertyStatusAnalytics,
            districtAnalytics,
            recentLogs,
            // Anomaly analytics
            abnormalRegistrations,
            abnormalTransfers,
            riskDistribution
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * GET /api/admin/users - Get all users with search
 */
router.get('/users', requireAuth(['admin']), async (req, res) => {
    try {
        const { search, role, page = 1, limit = 50 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load users' });
    }
});

/**
 * POST /api/admin/users - Create new user
 */
router.post('/users', requireAuth(['admin']), async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Generate server-managed wallet
        const wallet = ethers.Wallet.createRandom();

        const user = new User({
            email: email.toLowerCase(),
            passwordHash,
            name,
            role,
            verified: true,
            isActive: true,
            walletAddress: wallet.address,
            privateKey: wallet.privateKey
        });

        await user.save();

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'USER_CREATED',
            details: { userId: user._id, email, role },
            req
        });

        res.status(201).json({
            message: 'User created',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

/**
 * PATCH /api/admin/users/:id/role - Update user role
 */
router.patch('/users/:id/role', requireAuth(['admin']), async (req, res) => {
    try {
        const { role } = req.body;

        if (!['citizen', 'registrar', 'court', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'USER_ROLE_UPDATED',
            details: { userId: user._id, newRole: role },
            req
        });

        res.json({ message: 'Role updated', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * PATCH /api/admin/users/:id/verify - Verify user
 */
router.patch('/users/:id/verify', requireAuth(['admin']), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'USER_VERIFIED',
            details: { userId: user._id },
            req
        });

        res.json({ message: 'User verified', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify user' });
    }
});

/**
 * DELETE /api/admin/users/:id - Delete user
 */
router.delete('/users/:id', requireAuth(['admin']), async (req, res) => {
    try {
        // Instead of hard delete, mark as inactive
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'USER_DELETED',
            details: { userId: user._id },
            req
        });

        res.json({ message: 'User deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * GET /api/admin/config - Get office config
 */
router.get('/config', requireAuth(['admin']), async (req, res) => {
    try {
        let config = await OfficeConfig.findOne({ officeId: 'default-office' });

        if (!config) {
            // Create default config
            config = new OfficeConfig({ officeId: 'default-office' });
            await config.save();
        }

        res.json({ config });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load config' });
    }
});

/**
 * PUT /api/admin/config - Update office config
 */
router.put('/config', requireAuth(['admin']), async (req, res) => {
    try {
        const { name, location, configData } = req.body;

        let config = await OfficeConfig.findOne({ officeId: 'default-office' });

        if (!config) {
            config = new OfficeConfig({ officeId: 'default-office' });
        }

        if (name) config.name = name;
        if (location) config.location = location;
        if (configData) {
            config.configData = { ...config.configData, ...configData };
        }

        await config.save();

        // Log action
        await AuditService.logAction({
            userId: req.user.sub,
            role: req.user.role,
            action: 'CONFIG_UPDATED',
            details: { configData },
            req
        });

        res.json({ message: 'Config updated', config });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update config' });
    }
});

/**
 * GET /api/admin/audit - Get audit logs
 */
router.get('/audit', requireAuth(['admin']), async (req, res) => {
    try {
        const { user, action, from, to, page, limit } = req.query;

        const result = await AuditService.getLogs({
            user,
            action,
            from,
            to,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 50
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load audit logs' });
    }
});

/**
 * PUT /api/admin/config/approval-settings - Update multi-step approval configuration
 */
router.put('/config/approval-settings', requireAuth(['admin']), async (req, res) => {
    try {
        const { enabled, requiredApprovals, approvalType, assignedRegistrars } = req.body;
        const userId = req.user.sub;

        // Validate
        if (requiredApprovals !== undefined && (requiredApprovals < 1 || requiredApprovals > 5)) {
            return res.status(400).json({
                error: 'Required approvals must be between 1 and 5'
            });
        }

        if (approvalType && !['parallel', 'sequential'].includes(approvalType)) {
            return res.status(400).json({
                error: 'Approval type must be parallel or sequential'
            });
        }

        // Update config
        let config = await OfficeConfig.findOne({ officeId: 'default-office' });

        if (!config) {
            config = new OfficeConfig({ officeId: 'default-office' });
        }

        if (!config.configData) {
            config.configData = {};
        }

        config.configData.multiStepApproval = {
            enabled: enabled !== undefined ? enabled : (config.configData.multiStepApproval?.enabled ?? true),
            requiredApprovals: requiredApprovals || config.configData.multiStepApproval?.requiredApprovals || 2,
            approvalType: approvalType || config.configData.multiStepApproval?.approvalType || 'parallel',
            assignedRegistrars: assignedRegistrars || config.configData.multiStepApproval?.assignedRegistrars || [],
            autoAssignment: config.configData.multiStepApproval?.autoAssignment || false,
            allowSelfRejection: config.configData.multiStepApproval?.allowSelfRejection ?? true
        };

        await config.save();

        // Log change
        await AuditService.logAction({
            userId,
            role: 'admin',
            action: 'UPDATE_APPROVAL_SETTINGS',
            details: {
                enabled,
                requiredApprovals,
                approvalType
            },
            req
        });

        res.json({
            message: 'Approval settings updated successfully',
            settings: config.configData.multiStepApproval
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

/**
 * GET /api/admin/config/approval-settings - Get current approval settings
 */
router.get('/config/approval-settings', requireAuth(['admin']), async (req, res) => {
    try {
        const config = await OfficeConfig.findOne({ officeId: 'default-office' });

        const settings = config?.configData?.multiStepApproval || {
            enabled: true,
            requiredApprovals: 2,
            approvalType: 'parallel',
            assignedRegistrars: [],
            autoAssignment: false,
            allowSelfRejection: true
        };

        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

/**
 * GET /api/admin/applications/approval-stats - Get statistics about multi-step approvals
 */
router.get('/applications/approval-stats', requireAuth(['admin']), async (req, res) => {
    try {
        // Application already imported at top of file

        const [
            totalApplications,
            underReview,
            approved,
            rejected,
            averageApprovalTime,
            approvalsByRegistrar
        ] = await Promise.all([
            Application.countDocuments(),
            Application.countDocuments({ status: 'under-review' }),
            Application.countDocuments({ status: 'approved' }),
            Application.countDocuments({ status: 'rejected' }),

            // Average time from submission to final approval
            Application.aggregate([
                { $match: { status: 'approved', 'approvalMetadata.finalApprovedAt': { $exists: true } } },
                {
                    $project: {
                        approvalTime: {
                            $subtract: ['$approvalMetadata.finalApprovedAt', '$createdAt']
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgTime: { $avg: '$approvalTime' }
                    }
                }
            ]),

            // Count approvals by each registrar
            Application.aggregate([
                { $unwind: '$approvals' },
                { $match: { 'approvals.decision': 'approved' } },
                {
                    $group: {
                        _id: '$approvals.registrarId',
                        count: { $sum: 1 },
                        registrarName: { $first: '$approvals.registrarName' }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);

        const avgApprovalHours = averageApprovalTime[0]?.avgTime
            ? Math.round(averageApprovalTime[0].avgTime / (1000 * 60 * 60))
            : 0;

        res.json({
            totalApplications,
            byStatus: {
                underReview,
                approved,
                rejected,
                pending: totalApplications - underReview - approved - rejected
            },
            averageApprovalTime: `${avgApprovalHours} hours`,
            topApprovers: approvalsByRegistrar.slice(0, 5).map(a => ({
                registrarId: a._id,
                name: a.registrarName,
                approvalsCount: a.count
            }))
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to load statistics' });
    }
});

export default router;
