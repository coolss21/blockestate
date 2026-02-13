// pages/citizen/Applications.jsx - Complete citizen applications tracking
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Applications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await apiClient.get('/citizen/applications');
            setApplications(response.data.applications || []);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.line1,
            addr.line2,
            addr.district,
            addr.state,
            addr.pincode
        ].filter(Boolean);
        return parts.join(', ') || 'N/A';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            approved: '✅',
            rejected: '❌'
        };
        return icons[status] || '❓';
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'badge-warning',
            approved: 'badge-success',
            rejected: 'badge-danger'
        };
        return classes[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Declaration Ledger</h1>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-0.5">Asset Lifecycle Chronology</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/citizen/dashboard')}
                            className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2 font-mono"
                        >
                            <span>←</span> Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/citizen/apply')}
                            className="btn-primary h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Initiate New Filing
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Registry Nodes...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 bg-white/50 shadow-2xl shadow-slate-200/50">
                        <div className="text-7xl mb-8 grayscale opacity-30">📋</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">No Records Found</h3>
                        <p className="text-slate-400 mt-4 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                            The decentralized ledger does not contain any historical filings for this account.
                        </p>
                        <button
                            onClick={() => navigate('/citizen/apply')}
                            className="mt-10 btn-secondary px-10 h-12 text-[10px] font-black uppercase tracking-widest"
                        >
                            Initiate Primary Issuance
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Summary Bar */}
                        <div className="flex justify-between items-end px-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Trail Result: {applications.length} Records</h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                Ledger Synchronized
                            </p>
                        </div>

                        {/* Ledger Cards */}
                        <div className="grid grid-cols-1 gap-6">
                            {applications.map((app) => (
                                <div key={app._id} className="card group hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 border-0 bg-white ring-1 ring-slate-100 overflow-hidden">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Status Sidebar */}
                                        <div className="md:w-56 p-8 bg-slate-50 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-xl ${app.status === 'approved' ? 'bg-emerald-600 text-white shadow-emerald-200' :
                                                app.status === 'rejected' ? 'bg-rose-600 text-white shadow-rose-200' :
                                                    'bg-amber-500 text-white shadow-amber-200'
                                                }`}>
                                                {getStatusIcon(app.status)}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">State</p>
                                            <span className={`${getStatusBadgeClass(app.status)} scale-110`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 p-8 md:p-10">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest font-mono">
                                                            {app.appId || `DOCKET-${app._id?.substring(0, 8).toUpperCase()}`}
                                                        </span>
                                                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {app.type === 'issue' ? 'Digital Asset Minting' : 'Ownership Re-assignment'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors">
                                                        {app.propertyDraft?.ownerName || 'UNIDENTIFIED_PROPRIETOR'}
                                                    </h3>

                                                    <div className="flex flex-wrap items-center gap-y-4 gap-x-10">
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Site Parameters</label>
                                                            <p className="text-sm font-bold text-slate-600 italic">
                                                                {formatAddress(app.propertyDraft?.address)}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dimension Matrix</label>
                                                            <p className="text-sm font-black text-slate-900">
                                                                {app.propertyDraft?.areaSqft?.toLocaleString() || 'N/A'} <span className="text-[9px] text-slate-400">SQ_FT</span>
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Valuation Index</label>
                                                            <p className="text-sm font-black text-emerald-700">₹{app.propertyDraft?.value?.toLocaleString() || '0'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right space-y-4 w-full md:w-auto">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ledger Timestamp</p>
                                                        <p className="text-xs font-bold text-slate-900 uppercase">{new Date(app.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                                    </div>
                                                    {app.status === 'approved' && app.propertyId && (
                                                        <button
                                                            onClick={() => navigate(`/citizen/certificate/${app.propertyId}`)}
                                                            className="w-full md:w-auto h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10"
                                                        >
                                                            📜 View Sovereign Deed
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Context Alerts */}
                                            {app.status === 'rejected' && app.review?.comment && (
                                                <div className="mt-8 p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                                                    <span className="text-lg">🚫</span>
                                                    <div>
                                                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Registrar Intelligence Response</p>
                                                        <p className="text-sm font-bold text-rose-700 italic leading-relaxed">{app.review.comment}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-20 text-center pb-20">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-4">Secured by BlockEstate Ledger Intelligence</p>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default Applications;
