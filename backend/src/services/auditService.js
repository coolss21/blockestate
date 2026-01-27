// services/auditService.js
import AuditLog from '../models/AuditLog.js';

export const AuditService = {
    /**
     * Log an action to the audit trail
     */
    async logAction({ userId, wallet, role, action, details = {}, txHash = null, req = null }) {
        try {
            const logEntry = {
                userId,
                wallet,
                role,
                action,
                details,
                txHash,
                timestamp: new Date()
            };

            // Extract IP and user agent from request if available
            if (req) {
                logEntry.ip = req.ip || req.connection?.remoteAddress || null;
                logEntry.userAgent = req.get('user-agent') || null;
            }

            const auditLog = new AuditLog(logEntry);
            await auditLog.save();

            return auditLog;
        } catch (error) {
            // Log but don't throw - audit logging should not break the main flow
            console.error('Audit logging error:', error.message);
            return null;
        }
    },

    /**
     * Get audit logs with filtering
     */
    async getLogs({ user, role, action, from, to, page = 1, limit = 50 }) {
        const query = {};

        if (user) {
            query.$or = [
                { wallet: { $regex: user, $options: 'i' } },
                { userId: user }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (action) {
            query.action = action;
        }

        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email role')
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + logs.length < total
        };
    },

    /**
     * Get recent actions for a user
     */
    async getUserRecentActions(userId, limit = 10) {
        return await AuditLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    },

    /**
     * Get actions related to a specific property
     */
    async getPropertyAuditTrail(propertyId, limit = 50) {
        return await AuditLog.find({
            'details.propertyId': propertyId
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('userId', 'name email role')
            .lean();
    },

    /**
     * Get statistics about audit logs
     */
    async getStatistics(from, to) {
        const query = {};
        if (from || to) {
            query.timestamp = {};
            if (from) query.timestamp.$gte = new Date(from);
            if (to) query.timestamp.$lte = new Date(to);
        }

        const [totalLogs, actionCounts, roleCounts] = await Promise.all([
            AuditLog.countDocuments(query),
            AuditLog.aggregate([
                { $match: query },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            AuditLog.aggregate([
                { $match: query },
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ])
        ]);

        return {
            totalLogs,
            topActions: actionCounts.map(a => ({ action: a._id, count: a.count })),
            byRole: roleCounts.map(r => ({ role: r._id, count: r.count }))
        };
    }
};
