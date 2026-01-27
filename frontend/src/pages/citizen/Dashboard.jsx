// pages/citizen/Dashboard.jsx - Citizen dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/api';

const CitizenDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        propertiesCount: 0,
        pendingApplications: 0,
        activeDisputes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await apiClient.get('/citizen/dashboard');
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
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">BlockEstate</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Citizen Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{user?.walletAddress?.substring(0, 10)}...</span>
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
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
                    <p className="text-gray-500 mt-2">Here is what's happening with your property portfolio.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Status Cards - Modern Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="card p-6 border-l-4 border-l-blue-600 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        🏢
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Verified</span>
                                </div>
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">My Properties</div>
                                <div className="text-4xl font-black text-gray-900 mt-1">{stats.propertiesCount}</div>
                            </div>

                            <div className="card p-6 border-l-4 border-l-amber-500 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        ⏳
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">In Progress</span>
                                </div>
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Applications</div>
                                <div className="text-4xl font-black text-gray-900 mt-1">{stats.pendingApplications}</div>
                            </div>

                            <div className="card p-6 border-l-4 border-l-red-500 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        ⚖️
                                    </div>
                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Action Needed</span>
                                </div>
                                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Disputes</div>
                                <div className="text-4xl font-black text-gray-900 mt-1">{stats.activeDisputes}</div>
                            </div>
                        </div>

                        {/* Quick Actions - Polished Grid */}
                        <div className="mb-12">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                Digital Services
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'My Properties', icon: '🏰', path: '/citizen/properties', color: 'blue', desc: 'View your verified assets' },
                                    { label: 'Apply New', icon: '📝', path: '/citizen/apply', color: 'indigo', desc: 'Register a new property' },
                                    { label: 'Applications', icon: '📋', path: '/citizen/applications', color: 'emerald', desc: 'Track your submissions' },
                                    { label: 'Disputes', icon: '⚖️', path: '/citizen/disputes', color: 'rose', desc: 'Manage legal claims' }
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="card p-5 text-left hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-${action.color}-50 text-${action.color}-600 flex items-center justify-center text-3xl mb-4 group-hover:shadow-lg transition-all`}>
                                            {action.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg">{action.label}</h3>
                                        <p className="text-gray-500 text-xs mt-1">{action.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Instructions - Modern Alert */}
                        <div className="card border-0 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 relative overflow-hidden text-white shadow-xl shadow-blue-900/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">🏘️</div>
                            <div className="relative z-10 w-full sm:w-2/3">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="p-2 bg-white/20 rounded-lg">💡</span>
                                    Blockchain Registry Guide
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-50/80">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-white">01.</span>
                                        <span>Click <strong>Apply New</strong> to start the registration process.</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-white">02.</span>
                                        <span>Upload your digital deed and survey documents.</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-white">03.</span>
                                        <span>Track status in <strong>Applications</strong> real-time.</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-white">04.</span>
                                        <span>Download <strong>NFT Certificates</strong> once verified.</span>
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

export default CitizenDashboard;
