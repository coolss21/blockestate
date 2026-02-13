// pages/court/Dashboard.jsx - Court dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/api';

const CourtDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        activeCases: 0,
        upcomingHearings: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await apiClient.get('/court/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 glass border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-indigo-800">BlockEstate</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Judicial Tribunal Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-tighter italic">Honorable Judge</span>
                        </div>
                        <button
                            onClick={logout}
                            className="btn-danger h-10 text-sm font-bold"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Judicial Oversight</h2>
                        <p className="text-gray-500 mt-2 font-medium">Managing property litigation, hearings, and formal court orders.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        Secure Judicial Instance
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Judicial Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="card p-8 border-l-4 border-l-purple-600 bg-gradient-to-br from-white to-purple-50/20 group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-purple-600 uppercase tracking-[0.15em] mb-2">Litigated Assets</p>
                                        <h3 className="text-5xl font-black text-gray-900">{stats.activeCases}</h3>
                                        <p className="text-xs text-gray-400 mt-3 font-medium">Pending formal adjudication</p>
                                    </div>
                                    <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                        ⚖️
                                    </div>
                                </div>
                            </div>

                            <div className="card p-8 border-l-4 border-l-indigo-600 bg-gradient-to-br from-white to-indigo-50/20 group">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.15em] mb-2">Scheduled Sessions</p>
                                        <h3 className="text-5xl font-black text-gray-900">{stats.upcomingHearings}</h3>
                                        <p className="text-xs text-gray-400 mt-3 font-medium">Calendar efficiency: 94%</p>
                                    </div>
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                                        📅
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Judicial Actions */}
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                Judicial Operations
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Active Dockets', icon: '📋', path: '/court/cases', color: 'purple', desc: 'Review active litigation' },
                                    { label: 'Register Dispute', icon: '➕', path: '/court/register-case', color: 'indigo', desc: 'Open a new case file' },
                                    { label: 'Hearings Calendar', icon: '📅', path: '/court/hearings', color: 'blue', desc: 'Manage your schedule' },
                                    { label: 'Asset Search', icon: '🔍', path: '/registrar/search', color: 'slate', desc: 'Investigate asset history' }
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="card p-6 text-left hover:scale-[1.02] active:scale-[0.98] transition-all group relative border-b-4 border-transparent hover:border-purple-600"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-${action.color}-50 text-${action.color}-700 flex items-center justify-center text-3xl mb-4 group-hover:shadow-md transition-all`}>
                                            {action.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{action.label}</h3>
                                        <p className="text-gray-400 text-xs mt-2 font-medium leading-relaxed">{action.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Court Guidance - Formal Section */}
                        <div className="card p-8 bg-slate-900 text-white relative overflow-hidden border-0 shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">🏛️</div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm">Law</span>
                                    Operational Mandates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="text-purple-400 font-mono text-xs pt-1">01</div>
                                        <p className="text-sm text-slate-300">All property disputes registered here trigger an <strong>Immutable Blockchain Flag</strong>, preventing any unauthorized asset transfer during litigation.</p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="text-purple-400 font-mono text-xs pt-1">02</div>
                                        <p className="text-sm text-slate-300">Court orders are hashed and recorded on the ledger, providing a <strong>Permanent Legal Audit Trail</strong> for every judicial decision.</p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="text-purple-400 font-mono text-xs pt-1">03</div>
                                        <p className="text-sm text-slate-300">Hearing dates are publicly verifiable via the asset timeline, ensuring maximum transparency in land dispute resolution.</p>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="text-purple-400 font-mono text-xs pt-1">04</div>
                                        <p className="text-sm text-slate-300">Only authorized judicial officials (Judges, Magistrates) can clear disputes and restore property transfer eligibility.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CourtDashboard;
