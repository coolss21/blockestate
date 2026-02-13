// pages/registrar/Dashboard.jsx - Registrar dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/api';

const RegistrarDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        pendingApplications: 0,
        fraudAlerts: 0
    });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
        fetchApplications();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await apiClient.get('/registrar/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            // Remove status filter to get all pending/under-review applications
            // The backend will filter out applications already approved by this registrar
            const response = await apiClient.get('/registrar/inbox?limit=5');
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Registrar</h1>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Land & Asset Governance</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Official</span>
                            <span className="text-sm font-black text-slate-900 uppercase italic">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="btn-secondary px-6 py-2.5 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                        >
                            De-Authorize
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Operational Surface */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-8">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Administrative Suite</h2>
                        <p className="text-slate-500 mt-2 font-medium italic">Operational oversight for global property registration & forensic verification</p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Network Synchronized</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Querying Registry Ledger...</p>
                    </div>
                ) : (
                    <>
                        {/* Dimensional Metric Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="card group p-10 bg-white border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100 hover:ring-amber-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Pending Review</p>
                                        </div>
                                        <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{stats.pendingApplications}</h3>
                                        <p className="text-xs font-bold text-slate-400 italic">Dockets awaiting administrative determination</p>
                                    </div>
                                    <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                        📬
                                    </div>
                                </div>
                            </div>

                            <div className="card group p-10 bg-white border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100 hover:ring-rose-200 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1 h-3 bg-rose-500 rounded-full"></span>
                                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">High Alert Status</p>
                                        </div>
                                        <h3 className="text-6xl font-black text-slate-900 tracking-tighter">{stats.fraudAlerts}</h3>
                                        <p className="text-xs font-bold text-slate-400 italic">Anomalies requiring immediate forensic scan</p>
                                    </div>
                                    <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                        🚨
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* High-Performance Submission Ledger */}
                        <div className="card overflow-hidden border-0 shadow-2xl shadow-slate-900/5 bg-white mb-20 ring-1 ring-slate-100">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                    Operational Queue
                                </h2>
                                <button
                                    onClick={() => navigate('/registrar/inbox')}
                                    className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                >
                                    Access Full Archive
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Docket Signature</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Tier</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Primary Delegate</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filing Chronology</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {applications.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-24 text-center">
                                                    <div className="text-6xl mb-6 opacity-20">📂</div>
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Registry Queue Depleted</p>
                                                    <p className="text-xs text-slate-300 mt-2">All submissions have been synchronized.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            applications.map((app) => (
                                                <tr key={app._id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg ring-1 ring-blue-100/50">
                                                            {app.appId}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`badge-${app.type === 'issue' ? 'neutral' : 'warning'} scale-90`}>
                                                            {app.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 leading-none mb-1 tracking-tight">{app.applicantId?.name || 'GENERIC_ENTITY'}</span>
                                                            <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic">Identity Verified</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-600">
                                                                {new Date(app.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                                                                {new Date(app.createdAt).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => navigate(`/registrar/applications/${app.appId || app._id}`)}
                                                            className="btn-primary h-10 px-6 font-black text-[10px] uppercase tracking-widest bg-slate-900 border-slate-900 hover:bg-blue-600 hover:border-blue-600 shadow-xl shadow-slate-900/10 transition-all"
                                                        >
                                                            Process Docket
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Authority Command Center */}
                        <div className="mb-12">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-8 flex items-center gap-3">
                                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                Power Controls
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { label: 'Registry Inbox', icon: '📬', path: '/registrar/inbox', color: 'blue', desc: 'Secure docket processing pipeline' },
                                    { label: 'Global Assets', icon: '🏢', path: '/registrar/properties', color: 'emerald', desc: 'Browse synchronized blockchain estates' },
                                    { label: 'Forensic Search', icon: '🔍', path: '/registrar/search', color: 'violet', desc: 'Advanced property telemetry & query' },
                                    { label: 'Asset Certification', icon: '📜', path: '/registrar/certificate', color: 'amber', desc: 'Issue verifiable digital property deeds' }
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="card group p-8 text-left hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all border-0 bg-white ring-1 ring-slate-100"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
                                            {action.icon}
                                        </div>
                                        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter mb-2 group-hover:text-blue-600 transition-colors">{action.label}</h3>
                                        <p className="text-slate-400 text-[11px] font-bold leading-relaxed italic">{action.desc}</p>
                                        <div className="mt-8 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Initialize</span>
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                →
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RegistrarDashboard;
