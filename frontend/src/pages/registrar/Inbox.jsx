// pages/registrar/Inbox.jsx - Complete application inbox
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Inbox = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchApplications();
    }, [statusFilter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/registrar/inbox?status=${statusFilter}&limit=20`);
            setApplications(response.data.applications || []);
            setPagination({
                page: response.data.page || 1,
                totalPages: response.data.totalPages || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Failed to load inbox:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr.substring(0, 30) + '...';
        return `${addr.city || ''}, ${addr.state || ''}`;
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
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Application Inbox</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-0.5">Verification & Registry Pipeline</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-slate-900 border-0 rounded-xl px-6 py-2.5 pr-12 text-[10px] font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-blue-500 shadow-xl shadow-slate-900/10 cursor-pointer transition-all"
                            >
                                <option value="" className="bg-slate-900">Global Ledger</option>
                                <option value="pending" className="bg-slate-900">Pending Review</option>
                                <option value="approved" className="bg-slate-900">Finalized Assets</option>
                                <option value="rejected" className="bg-slate-900">Declined Dockets</option>
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 text-[10px]">▼</span>
                        </div>
                        <button
                            onClick={() => navigate('/registrar/dashboard')}
                            className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                        >
                            <span>←</span> Overview
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing Registry...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 bg-slate-100/30">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner animate-pulse">
                            📥
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Queue Fully Processed</h3>
                        <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium italic italic">
                            {statusFilter
                                ? `No dockets currently meet the "${statusFilter.toUpperCase()}" status criteria.`
                                : "The property registry queue is currently empty. All dockets have been successfully processed."}
                        </p>
                    </div>
                ) : (
                    <div className="card overflow-hidden border-0 shadow-2xl shadow-slate-900/5 bg-white ring-1 ring-slate-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Docket Signature</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Model</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority / Entity</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Geospatial Link</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry State</th>
                                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Date</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Process</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {applications.map((app) => (
                                        <tr key={app._id} className="hover:bg-blue-50/20 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-1.5 h-10 bg-blue-600 rounded-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                                                    <span className="font-mono text-xs font-black text-slate-900 tracking-tighter">
                                                        {app.appId || app._id?.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-mono">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${app.type === 'issue' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                                                    }`}>
                                                    {app.type === 'issue' ? 'NEW_INIT' : 'TRANSFER_ORD'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{app.applicantId?.name || 'GENERIC_OPERATOR'}</span>
                                                    <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest italic">Identity Authenticated</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-xs font-bold text-slate-500 italic max-w-[200px] truncate leading-relaxed">
                                                    {formatAddress(app.propertyDraft?.address)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`badge-${getStatusBadgeClass(app.status)} scale-90`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-600 font-mono">
                                                        {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/registrar/applications/${app.appId || app._id}`)}
                                                    className="btn-primary h-9 px-6 font-black text-[9px] uppercase tracking-widest bg-slate-900 border-slate-900 hover:bg-blue-600 hover:border-blue-600 shadow-xl shadow-slate-900/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    Audit Docket
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Dimensional Pagination Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Registry Segment: {applications.length} of {pagination.total} Verified Dockets
                            </p>
                            <div className="flex gap-3">
                                <button disabled className="btn-secondary h-8 px-4 text-[9px] font-black uppercase tracking-widest opacity-30 shadow-none border-0 bg-slate-200">Sector Prev</button>
                                <button disabled className="btn-secondary h-8 px-4 text-[9px] font-black uppercase tracking-widest opacity-30 shadow-none border-0 bg-slate-200">Sector Next</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;
