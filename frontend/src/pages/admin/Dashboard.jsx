import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/api';
import {
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        users: {},
        totalUsers: 0,
        properties: 0,
        activeDisputes: 0,
        totalValue: 0,
        analytics: [],
        statusAnalytics: [],
        districtAnalytics: [],
        recentLogs: [],
        abnormalRegistrations: [],
        abnormalTransfers: [],
        riskDistribution: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    const COLORS = ['#0891b2', '#4f46e5', '#059669', '#e11d48', '#d97706'];
    const RISK_COLORS = { 'Low Risk': '#0891b2', 'Medium Risk': '#d97706', 'High Risk': '#e11d48', 'Critical': '#7c3aed' };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await apiClient.get('/admin/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Command Header */}
            <div className="bg-slate-900 text-white shadow-2xl relative overflow-hidden pb-24">
                <div className="absolute top-0 right-0 p-20 opacity-[0.03] text-[20rem] font-black italic select-none pointer-events-none">ROOT</div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-1 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner">
                            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain brightness-110" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter italic text-white uppercase">Global Command Center</h1>
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mt-1">System Authority Level 0 // Root Access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="hidden lg:block text-right">
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1">Architect Session</p>
                            <p className="text-base font-bold text-white italic">{user?.name?.toUpperCase()}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="h-12 px-10 bg-rose-600/10 border-2 border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            De-authorize
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                {/* Visual Action Bar */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex p-2 bg-slate-900 shadow-2xl rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`px-12 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'summary'
                                ? 'bg-cyan-600 text-white shadow-2xl shadow-cyan-600/40'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Infrastructure
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-12 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'analytics'
                                ? 'bg-cyan-600 text-white shadow-2xl shadow-cyan-600/40'
                                : 'text-slate-500 hover:text-white'
                                }`}
                        >
                            Analytics
                        </button>
                    </div>

                    <div className="flex items-center gap-6 bg-white px-10 py-5 rounded-[2.5rem] shadow-xl shadow-slate-900/5 ring-1 ring-slate-100/50">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Ledger Valuation</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(stats.totalValue)}</p>
                        </div>
                        <div className="w-14 h-14 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">💎</div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-24 h-24 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin mb-10"></div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Master Node Analytics...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {activeTab === 'summary' ? (
                            <>
                                {/* Telemetry Tiles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { label: 'Identitites', val: stats.totalUsers, tag: 'Live', color: 'cyan', icon: '👥' },
                                        { label: 'Blockchain Assets', val: stats.properties, tag: 'Immutable', color: 'indigo', icon: '🏢' },
                                        { label: 'System Access', val: (stats.users?.citizen || 0) + (stats.users?.registrar || 0), tag: 'Active', color: 'emerald', icon: '⚡' },
                                        { label: 'Security Alerts', val: stats.activeDisputes, tag: 'Locked', color: 'rose', icon: '🛡️' }
                                    ].map((stat, i) => (
                                        <div key={i} className="card p-10 bg-white border-0 shadow-2xl shadow-slate-900/5 group hover:-translate-y-2 transition-all duration-500 rounded-[3rem] relative overflow-hidden">
                                            <div className="absolute -top-4 -right-4 p-8 opacity-[0.04] text-7xl group-hover:scale-125 transition-transform duration-1000 grayscale group-hover:grayscale-0">{stat.icon}</div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 group-hover:text-cyan-600 transition-colors">{stat.label}</p>
                                            <div className="flex items-end gap-3">
                                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
                                                <span className={`text-[9px] font-black text-${stat.color}-500 mb-2 uppercase tracking-widest px-3 py-1 bg-${stat.color}-50 rounded-xl border border-${stat.color}-100`}>{stat.tag}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Live Audit Intel Feed */}
                                    <div className="lg:col-span-2 card bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3rem] overflow-hidden">
                                        <div className="px-12 py-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 backdrop-blur-md">
                                            <div>
                                                <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] font-mono italic">Audit_Intelligence_Stream</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Procedural Enforcement</p>
                                            </div>
                                            <div className="flex gap-3 items-center bg-emerald-50 px-4 py-2 rounded-2xl">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Link</span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {stats.recentLogs?.map((log, i) => (
                                                <div key={i} className="p-10 hover:bg-slate-50/50 transition-all flex items-center gap-8 group">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition-transform">
                                                        {log.action?.includes('VERIFIED') ? '🛡️' : log.action?.includes('CREATED') ? '➕' : '💠'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-base font-black text-slate-900 uppercase tracking-tight">{log.action?.replace(/_/g, ' ')}</p>
                                                            <span className="text-[10px] font-bold text-slate-400 font-mono italic bg-slate-100 px-3 py-1 rounded-full">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium">
                                                            Authenticated Practitioner: <span className="font-bold text-indigo-600 uppercase tracking-tighter">{log.userId?.name || 'ROOT_SERVICE'}</span>
                                                            <span className="mx-3 opacity-20">|</span>
                                                            Chain-ID: <span className="italic font-bold text-slate-400">#{(log.txHash?.substring(0, 8) || log.details?.userId?.substring(0, 8) || 'SYSTEM')}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!stats.recentLogs || stats.recentLogs.length === 0) && (
                                                <div className="p-32 text-center">
                                                    <div className="text-5xl mb-6 opacity-20">📡</div>
                                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.5em]">Scanning for recent procedural logs...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Authority Matrix Sidebar */}
                                    <div className="card p-12 bg-slate-900 text-white border-0 shadow-2xl shadow-cyan-900/40 rounded-[3rem] relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 p-12 opacity-[0.06] text-[10rem] font-black italic select-none pointer-events-none">OS</div>
                                        <div className="relative z-10">
                                            <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-12 font-mono italic border-b border-white/10 pb-6">Authority_Profile_Map</h3>
                                            <div className="space-y-8">
                                                {[
                                                    { role: 'Citizen', count: stats.users?.citizen || 0, color: '#6366f1' },
                                                    { role: 'Registrar', count: stats.users?.registrar || 0, color: '#10b981' },
                                                    { role: 'Judicial', count: stats.users?.court || 0, color: '#f43f5e' },
                                                    { role: 'Admin', count: stats.users?.admin || 0, color: '#22d3ee' }
                                                ].map((r, i) => (
                                                    <div key={i} className="space-y-3">
                                                        <div className="flex justify-between items-end">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.role}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-black text-white leading-none">{r.count}</span>
                                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Nodes</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-1000"
                                                                style={{
                                                                    width: `${(r.count / (stats.totalUsers || 1)) * 100}%`,
                                                                    backgroundColor: r.color,
                                                                    boxShadow: `0 0 10px ${r.color}40`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-16 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-2xl relative z-10">
                                            <p className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.4em] mb-3">Kernel Diagnostic</p>
                                            <p className="text-xs font-bold text-slate-400 italic leading-relaxed">Cross-jurisdictional synchronization verified. All participant nodes report terminal operational consistency.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Chronological Registration Trends */}
                                <div className="card p-12 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3.5rem] group">
                                    <div className="flex justify-between items-center mb-12 px-2">
                                        <div>
                                            <h2 className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.5em] mb-2 font-mono italic">Asset_Velocity_Telemetry</h2>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Registration Flux Analysis</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 bg-emerald-50 px-6 py-4 rounded-[1.5rem] border border-emerald-100/50">
                                            <span className="text-2xl">📈</span>
                                            <div>
                                                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Growth Index</p>
                                                <p className="text-xs font-black text-emerald-600">+14.2%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.analytics}>
                                                <defs>
                                                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                                    dy={20}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '24px', padding: '20px', boxShadow: '0 30px 60px -12px rgb(15 23 42 / 0.5)' }}
                                                    itemStyle={{ color: '#22d3ee', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}
                                                    labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="registrations"
                                                    stroke="#0891b2"
                                                    strokeWidth={6}
                                                    fillOpacity={1}
                                                    fill="url(#colorReg)"
                                                    animationDuration={2000}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Regional Asset Distribution */}
                                <div className="card p-12 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3.5rem]">
                                    <div className="flex justify-between items-center mb-12 px-2">
                                        <div>
                                            <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-2 font-mono italic">Geospatial_Clustering</h2>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Regional Asset Density</p>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.districtAnalytics} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                                <XAxis type="number" hide />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }}
                                                    width={120}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                                <Bar dataKey="count" fill="#4f46e5" radius={[0, 20, 20, 0]} barSize={40}>
                                                    {stats.districtAnalytics?.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Anomaly Section Header */}
                                <div className="lg:col-span-2 mt-4">
                                    <div className="flex items-center gap-4 mb-2 px-2">
                                        <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-lg shadow-lg shadow-rose-500/30">⚠️</div>
                                        <div>
                                            <h2 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] font-mono italic">Anomaly_Detection_Matrix</h2>
                                            <p className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Abnormal Registration & Transfer Trends</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Abnormal Registrations — Line Chart */}
                                <div className="card p-12 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3.5rem] group">
                                    <div className="flex justify-between items-center mb-12 px-2">
                                        <div>
                                            <h2 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.5em] mb-2 font-mono italic">Threat_Signal_Trend</h2>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Abnormal Registrations</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 bg-rose-50 px-6 py-4 rounded-[1.5rem] border border-rose-100/50">
                                            <span className="text-2xl">🚨</span>
                                            <div>
                                                <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Spike Alert</p>
                                                <p className="text-xs font-black text-rose-600">+46.7%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.abnormalRegistrations}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '24px', padding: '20px', boxShadow: '0 30px 60px -12px rgb(15 23 42 / 0.5)' }}
                                                    itemStyle={{ color: '#f43f5e', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px' }}
                                                    labelStyle={{ color: '#64748b', fontSize: '9px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}
                                                />
                                                <Line type="monotone" dataKey="anomalies" name="Flagged" stroke="#e11d48" strokeWidth={4} dot={{ r: 6, fill: '#e11d48', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10 }} animationDuration={2000} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Abnormal Transfers per Region — Bar Chart */}
                                <div className="card p-12 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3.5rem]">
                                    <div className="flex justify-between items-center mb-12 px-2">
                                        <div>
                                            <h2 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] mb-2 font-mono italic">Regional_Threat_Map</h2>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Abnormal Transfers</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.abnormalTransfers}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} allowDecimals={false} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                                <Bar dataKey="flagged" name="Flagged Transfers" fill="#d97706" radius={[16, 16, 0, 0]} barSize={50} animationDuration={2000}>
                                                    {(stats.abnormalTransfers || []).map((_, index) => (
                                                        <Cell key={`at-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Risk Distribution — Pie Chart (full width) */}
                                <div className="lg:col-span-2 card p-12 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3.5rem]">
                                    <div className="flex justify-between items-center mb-12 px-2">
                                        <div>
                                            <h2 className="text-[11px] font-black text-violet-500 uppercase tracking-[0.5em] mb-2 font-mono italic">Risk_Classification_Overlay</h2>
                                            <p className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Risk Distribution</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.riskDistribution}
                                                    cx="50%" cy="50%"
                                                    innerRadius={80} outerRadius={130}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    animationDuration={2000}
                                                >
                                                    {(stats.riskDistribution || []).map((entry, index) => (
                                                        <Cell key={`risk-${index}`} fill={RISK_COLORS[entry.name] || COLORS[index]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', padding: '12px' }}
                                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                                <Legend
                                                    wrapperStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tactical Hub Control */}
                        <div className="card p-16 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[4rem]">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-2">
                                <div className="space-y-2">
                                    <h2 className="text-[11px] font-black text-cyan-600 uppercase tracking-[0.6em] mb-4 font-mono italic border-l-4 border-cyan-500 pl-6">Override_Directives</h2>
                                    <p className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">Command Control Terminal</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Resilience Index</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>)}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                                {[
                                    { label: 'User Governance', route: '/admin/users', icon: '👤', desc: 'Identity & Authorization Matrix', color: 'cyan' },
                                    { label: 'Architecture Config', route: '/admin/config', icon: '⚙️', desc: 'Persistent Infrastructure Tuning', color: 'indigo' },
                                    { label: 'Audit Forensic Ledger', route: '/admin/audit', icon: '📜', desc: 'Terminal Transaction Forensics', color: 'emerald' }
                                ].map((hub, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(hub.route)}
                                        className="p-12 bg-slate-50 border-2 border-transparent rounded-[3.5rem] hover:border-cyan-500 hover:bg-white transition-all group relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-cyan-900/10"
                                    >
                                        <div className="absolute top-0 right-0 p-10 text-8xl opacity-[0.03] group-hover:scale-150 transition-transform duration-1000 grayscale group-hover:grayscale-0 pointer-events-none">{hub.icon}</div>
                                        <div className="text-6xl mb-10 group-hover:scale-110 transition-transform duration-700 inline-block drop-shadow-2xl">{hub.icon}</div>
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-3">{hub.label}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mb-10 leading-relaxed">{hub.desc}</p>
                                        <div className="pt-8 border-t border-slate-100 text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-3">
                                            Engage Protocol <span className="text-lg group-hover:translate-x-3 transition-transform duration-500">→</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* System Persistence Footer */}
                        <div className="text-center py-24 opacity-25 group cursor-default">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[1.2rem] italic group-hover:tracking-[1.4rem] transition-all duration-1000">BlockEstate Command & Control Unified Management Overlay</p>
                            <p className="text-[9px] font-bold text-slate-300 mt-6 uppercase tracking-[0.6rem]">Terminal Session Secured // Quantum-Wrapped Persistence // No Unauthorized Entry</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
