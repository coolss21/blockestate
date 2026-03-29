/**
 * Seed anomaly data for admin dashboard charts.
 * Creates rejected applications (spread across months/districts)
 * and disputed properties so the anomaly charts have real data.
 *
 * Usage: node scripts/seedAnomalyData.cjs
 */

const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://admin:admin123@localhost:27017/propertychain?authSource=admin';

// Inline schemas (minimal, matching the app models)
const applicationSchema = new mongoose.Schema({
    appId: { type: String, unique: true, required: true },
    type: { type: String, enum: ['issue', 'transfer', 'correction'], required: true },
    status: { type: String, enum: ['pending', 'under-review', 'approved', 'rejected'], default: 'pending' },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: String,
    propertyDraft: {
        ownerName: String,
        address: { line1: String, line2: String, district: String, state: String, pincode: String },
        areaSqft: Number,
        value: Number
    },
    details: { reason: String, notes: String },
    rejectionReason: String,
    documents: [],
    approvals: [],
    approvalMetadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const propertySchema = new mongoose.Schema({
    propertyId: { type: String, unique: true, required: true },
    ownerWallet: String,
    ownerEmail: String,
    ownerName: { type: String, required: true },
    address: {
        line1: { type: String, required: true },
        line2: String,
        district: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    areaSqft: { type: Number, required: true },
    value: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'disputed'], default: 'pending' },
    ipfsCID: String,
    bucketUrl: String,
    docHash: { type: String, required: true },
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
const Property = mongoose.model('Property', propertySchema);

const districts = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Kolhapur', 'Solapur'];
const states = ['Maharashtra'];

function randomDate(monthsAgo) {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    d.setDate(Math.floor(Math.random() * 28) + 1);
    return d;
}

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get or create a user ID to use as applicant
    const usersColl = mongoose.connection.db.collection('users');
    let anyUser = await usersColl.findOne();
    if (!anyUser) {
        // Create a minimal seed user
        const bcrypt = require('bcryptjs');
        const result = await usersColl.insertOne({
            name: 'Admin Demo',
            email: 'admin@demo.com',
            role: 'admin',
            passwordHash: await bcrypt.hash('demo1234', 10),
            verified: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        anyUser = { _id: result.insertedId, name: 'Admin Demo' };
        console.log('Created seed admin user');
    }
    const userId = anyUser._id;
    console.log(`Using user: ${anyUser.name} (${userId})`);

    // ── 1. Seed Rejected Applications (spread across 12 months) ──
    const rejectedApps = [];
    for (let m = 0; m < 12; m++) {
        const count = Math.floor(Math.random() * 5) + 1; // 1-5 per month
        for (let i = 0; i < count; i++) {
            const district = districts[Math.floor(Math.random() * districts.length)];
            const appId = `ANOM-REJ-${m}-${i}-${Date.now()}`;
            rejectedApps.push({
                appId,
                type: Math.random() > 0.5 ? 'issue' : 'transfer',
                status: 'rejected',
                applicantId: userId,
                propertyId: `PROP-ANOM-${m}-${i}`,
                propertyDraft: {
                    ownerName: `Suspicious Owner ${m}-${i}`,
                    address: {
                        line1: `${Math.floor(Math.random() * 999) + 1} Test Road`,
                        district,
                        state: 'Maharashtra',
                        pincode: `${400000 + Math.floor(Math.random() * 99999)}`
                    },
                    areaSqft: Math.floor(Math.random() * 5000) + 500,
                    value: Math.floor(Math.random() * 50000000) + 1000000,
                },
                details: {
                    reason: 'Flagged for anomalies',
                    notes: 'Auto-generated anomaly seed data'
                },
                rejectionReason: 'Suspected fraudulent documentation',
                createdAt: randomDate(m),
                updatedAt: randomDate(m),
            });
        }
    }

    // Also add some pending and under-review for risk distribution variety
    const pendingApps = [];
    for (let i = 0; i < 8; i++) {
        pendingApps.push({
            appId: `ANOM-PEND-${i}-${Date.now()}`,
            type: 'issue',
            status: 'pending',
            applicantId: userId,
            propertyDraft: {
                ownerName: `Pending Owner ${i}`,
                address: { line1: 'Test', district: districts[i % districts.length], state: 'Maharashtra', pincode: '400001' },
                areaSqft: 1000, value: 5000000
            },
            createdAt: randomDate(Math.floor(Math.random() * 6)),
            updatedAt: new Date(),
        });
    }

    const underReviewApps = [];
    for (let i = 0; i < 5; i++) {
        underReviewApps.push({
            appId: `ANOM-REV-${i}-${Date.now()}`,
            type: 'transfer',
            status: 'under-review',
            applicantId: userId,
            propertyDraft: {
                ownerName: `Review Owner ${i}`,
                address: { line1: 'Test', district: districts[i % districts.length], state: 'Maharashtra', pincode: '400001' },
                areaSqft: 1500, value: 8000000
            },
            createdAt: randomDate(Math.floor(Math.random() * 3)),
            updatedAt: new Date(),
        });
    }

    const allApps = [...rejectedApps, ...pendingApps, ...underReviewApps];
    let insertedApps = 0;
    for (const app of allApps) {
        try {
            await Application.create(app);
            insertedApps++;
        } catch (e) {
            if (e.code === 11000) continue; // duplicate, skip
            console.error('App insert error:', e.message);
        }
    }
    console.log(`Inserted ${insertedApps} applications`);

    // ── 2. Seed Disputed/Rejected Properties (by district) ──
    const anomalyProps = [];
    for (let i = 0; i < 15; i++) {
        const district = districts[Math.floor(Math.random() * districts.length)];
        const status = Math.random() > 0.4 ? 'disputed' : 'rejected';
        anomalyProps.push({
            propertyId: `ANOM-PROP-${i}-${Date.now()}`,
            ownerName: `Flagged Owner ${i}`,
            address: {
                line1: `${Math.floor(Math.random() * 999) + 1} Anomaly Lane`,
                district,
                state: 'Maharashtra',
                pincode: `${400000 + Math.floor(Math.random() * 99999)}`
            },
            areaSqft: Math.floor(Math.random() * 3000) + 500,
            value: Math.floor(Math.random() * 30000000) + 500000,
            status,
            docHash: require('crypto').randomBytes(32).toString('hex'),
            appliedBy: userId,
            createdAt: randomDate(Math.floor(Math.random() * 12)),
            updatedAt: new Date(),
        });
    }

    let insertedProps = 0;
    for (const prop of anomalyProps) {
        try {
            await Property.create(prop);
            insertedProps++;
        } catch (e) {
            if (e.code === 11000) continue;
            console.error('Property insert error:', e.message);
        }
    }
    console.log(`Inserted ${insertedProps} anomaly properties`);

    console.log('\n✅ Anomaly seed data complete!');
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
