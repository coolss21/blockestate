// pages/admin/AuditLogs.jsx - Complete audit logs viewer
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const AuditLogs = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        from: '',
        to: ''
    });
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let url = `/admin/audit?page=${pagination.page}&limit=50`;
            if (filters.user) url += `&user=${filters.user}`;
            if (filters.action) url += `&action=${filters.action}`;
            if (filters.from) url += `&from=${filters.from}`;
            if (filters.to) url += `&to=${filters.to}`;

            const response = await apiClient.get(url);
            setLogs(response.data.logs || []);
            setPagination({
                page: response.data.page || 1,
                totalPages: response.data.totalPages || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(p => ({ ...p, page: 1 }));
        fetchLogs();
    };

    const getActionBadge = (action) => {
        const styles = {
            'LOGIN': 'bg-cyan-50 text-cyan-700 border-cyan-100',
            'APPLICATION_SUBMITTED': 'bg-blue-50 text-blue-700 border-blue-100',
            'APPLICATION_APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'APPLICATION_REJECTED': 'bg-rose-50 text-rose-700 border-rose-100',
            'CASE_REGISTERED': 'bg-violet-50 text-violet-700 border-violet-100',
            'CASE_CLOSED': 'bg-slate-100 text-slate-700 border-slate-200',
            'USER_CREATED': 'bg-indigo-50 text-indigo-700 border-indigo-100',
            'CERTIFICATE_GENERATED': 'bg-amber-50 text-amber-700 border-amber-100'
        };
        return styles[action] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Forensic System Ledger</h1>
                        <p className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.3em] mt-0.5">Immutable Activity Stream & Protocol Audit</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    >
                        <span>←</span> System Command
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Advanced Forensic Filter Bar */}
                <form onSubmit={handleSearch} className="card p-8 mb-10 bg-slate-900 border-0 shadow-2xl shadow-cyan-900/10 ring-1 ring-white/10 rounded-[2.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Operator Identifier</label>
                            <input
                                type="text"
                                placeholder="User Hash / ID"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold text-white placeholder-slate-500 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                value={filters.user}
                                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Protocol Action</label>
                            <div className="relative group">
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-black text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                    value={filters.action}
                                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900">All Operations</option>
                                    <option value="LOGIN" className="bg-slate-900">Login</option>
                                    <option value="APPLICATION_SUBMITTED" className="bg-slate-900">Application Submitted</option>
                                    <option value="APPLICATION_APPROVED" className="bg-slate-900">Application Approved</option>
                                    <option value="APPLICATION_REJECTED" className="bg-slate-900">Application Rejected</option>
                                    <option value="CASE_REGISTERED" className="bg-slate-900">Case Registered</option>
                                    <option value="CASE_CLOSED" className="bg-slate-900">Case Closed</option>
                                    <option value="USER_CREATED" className="bg-slate-900">User Created</option>
                                    <option value="CERTIFICATE_GENERATED" className="bg-slate-900">Certificate Generated</option>
                                </select>
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none group-hover:scale-125 transition-transform">▼</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Temporal Start</label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-black text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none uppercase"
                                value={filters.from}
                                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1">Temporal End</label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-black text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none uppercase"
                                value={filters.to}
                                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full btn-primary h-14 bg-cyan-700 border-cyan-700 hover:bg-cyan-900 shadow-2xl shadow-cyan-900/40 text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
                            >
                                Sync Ledger
                            </button>
                        </div>
                    </div>
                </form>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding Ledger Persistence...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="card py-32 text-center border-dashed border-4 border-slate-200 bg-white/50 rounded-[3rem]">
                        <div className="text-8xl mb-10 grayscale opacity-20">📂</div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Null Event Vector</h3>
                        <p className="text-slate-500 mt-4 max-w-sm mx-auto font-black text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                            The specified temporal parameters returned no synchronized ledger entries.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="card overflow-hidden border-0 shadow-2xl shadow-slate-900/5 bg-white rounded-[2.5rem]">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Marker</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operator Identity</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Action Protocol</th>
                                            <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Details</th>
                                            <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ledger Link</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logs.map((log) => (
                                            <tr key={log._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-10 py-6 whitespace-nowrap">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mt-0.5">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </td>
                                                <td className="px-10 py-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-400">
                                                            {(log.userId?.name || 'S')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 tracking-tight">
                                                                {log.userId?.name || 'SYSTEM_CORE'}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                                Tier: {log.role || 'INFRASTRUCTURE'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 whitespace-nowrap">
                                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${getActionBadge(log.action)}`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-[11px] text-slate-500 max-w-xs truncate font-mono italic">
                                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}).substring(0, 80)}
                                                </td>
                                                <td className="px-10 py-6 whitespace-nowrap text-right">
                                                    {log.txHash ? (
                                                        <a
                                                            href={`https://etherscan.io/tx/${log.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 group/link"
                                                        >
                                                            <span className="font-mono text-[11px] font-black text-cyan-600 hover:text-cyan-800 transition-colors">
                                                                HEX:{log.txHash.substring(0, 10).toUpperCase()}
                                                            </span>
                                                            <span className="text-xs group-hover/link:translate-x-1 transition-transform">↗</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Internal_Logic</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Selection */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-8 mt-16 bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-900/5 w-fit mx-auto ring-1 ring-slate-100">
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-cyan-50 hover:text-cyan-600 disabled:opacity-30 transition-all border border-slate-100"
                                >
                                    ←
                                </button>
                                <div className="px-6 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ledger Fragment</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {pagination.page} / {pagination.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-cyan-50 hover:text-cyan-600 disabled:opacity-30 transition-all border border-slate-100"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
