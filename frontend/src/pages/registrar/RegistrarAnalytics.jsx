import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';

// --- Configuration & Styles ---
const COLORS = {
    'Low Risk': '#0088FE',
    'Medium Risk': '#00C49F',
    'High Risk': '#FFBB28',
    'Critical': '#FF8042'
};

const styles = {
    container: { padding: 20 },
    header: { marginBottom: 30 },
    section: { marginBottom: 40, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    chartTitle: { marginBottom: 20, color: '#333', borderBottom: '1px solid #eee', paddingBottom: 10 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }
};

// --- Mock Data Service (Placeholder for Future ML API) ---
// Future URL: GET /api/registrar/anomaly-metrics
// Schema: propertyId, anomalyScore, riskLevel, region, timestamp
async function fetchAnomalyMetrics() {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    // Return raw list of anomalies (ML output style)
    return [
        // North Region
        { propertyId: 'P001', anomalyScore: 0.85, riskLevel: 'Critical', region: 'North', timestamp: 1672531200000 }, // Jan 1
        { propertyId: 'P002', anomalyScore: 0.65, riskLevel: 'High Risk', region: 'North', timestamp: 1675209600000 }, // Feb 1
        { propertyId: 'P003', anomalyScore: 0.45, riskLevel: 'Medium Risk', region: 'North', timestamp: 1675309600000 },

        // East Region (High activity)
        { propertyId: 'P004', anomalyScore: 0.95, riskLevel: 'Critical', region: 'East', timestamp: 1680307200000 }, // Apr 1
        { propertyId: 'P005', anomalyScore: 0.75, riskLevel: 'High Risk', region: 'East', timestamp: 1682899200000 }, // May 1
        { propertyId: 'P006', anomalyScore: 0.55, riskLevel: 'Medium Risk', region: 'East', timestamp: 1685577600000 }, // Jun 1
        { propertyId: 'P007', anomalyScore: 0.35, riskLevel: 'Low Risk', region: 'East', timestamp: 1688169600000 }, // Jul 1
        { propertyId: 'P008', anomalyScore: 0.88, riskLevel: 'Critical', region: 'East', timestamp: 1688269600000 }, // Jul 2

        // South Region
        { propertyId: 'P009', anomalyScore: 0.25, riskLevel: 'Low Risk', region: 'South', timestamp: 1677628800000 }, // Mar 1

        // West Region
        { propertyId: 'P010', anomalyScore: 0.60, riskLevel: 'Medium Risk', region: 'West', timestamp: 1677728800000 },
    ];
}

// --- Helpers ---
function aggregateData(anomalies) {
    if (!anomalies) return { registrations: [], transfers: [], risks: [] };

    // 1. Registrations over time (Group by Month for trend)
    const regMap = {};
    anomalies.forEach(a => {
        const date = new Date(a.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        regMap[key] = (regMap[key] || 0) + 1;
    });
    const registrations = Object.keys(regMap).sort().map(date => ({ date, count: regMap[date] }));

    // 2. Transfers per Region (Group by Region)
    const transMap = {};
    anomalies.forEach(a => {
        transMap[a.region] = (transMap[a.region] || 0) + 1;
    });
    const transfers = Object.keys(transMap).map(region => ({ region, count: transMap[region] }));

    // 3. Risk Distribution
    const riskMap = {};
    anomalies.forEach(a => {
        riskMap[a.riskLevel] = (riskMap[a.riskLevel] || 0) + 1;
    });
    const risks = Object.keys(riskMap).map(name => ({ name, value: riskMap[name] }));

    return { registrations, transfers, risks };
}

// --- Components ---

function AnalyticsCard({ title, children }) {
    return (
        <div style={styles.section}>
            <h3 style={styles.chartTitle}>{title}</h3>
            <div style={{ width: '100%', height: 300 }}>
                {children}
            </div>
        </div>
    );
}

export default function RegistrarAnalytics() {
    const [rawAnomalies, setRawAnomalies] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnomalyMetrics().then(data => {
            setRawAnomalies(data);
            setLoading(false);
        });
    }, []);

    const { registrations, transfers, risks } = useMemo(() => aggregateData(rawAnomalies), [rawAnomalies]);

    if (loading) return <div style={{ padding: 20 }}>Loading analytics...</div>;
    if (!rawAnomalies) return <div style={{ padding: 20 }}>No data available.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Abnormal Property Registration & Transfer Trends</h2>
                <p style={{ color: '#666' }}>
                    Monitoring potential fraud and anomalies in property registration and transfer requests.
                </p>
            </div>

            <div style={styles.grid}>
                {/* Line Chart: Registrations over time */}
                <AnalyticsCard title="Abnormal Registrations (Trend)">
                    <ResponsiveContainer>
                        <LineChart data={registrations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="Anomalies" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </AnalyticsCard>

                {/* Bar Chart: Transfers per Region */}
                <AnalyticsCard title="Abnormal Transfers per Region">
                    <ResponsiveContainer>
                        <BarChart data={transfers}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="region" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Flagged Transfers" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </AnalyticsCard>

                {/* Pie Chart: Risk Distribution */}
                <AnalyticsCard title="Risk Distribution">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={risks}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                            >
                                {risks.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </AnalyticsCard>
            </div>
        </div>
    );
}
