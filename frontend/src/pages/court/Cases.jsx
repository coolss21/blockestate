// pages/court/Cases.jsx - Complete cases list page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Cases = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCases();
    }, [statusFilter]);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const url = statusFilter ? `/court/cases?status=${statusFilter}` : '/court/cases';
            const response = await apiClient.get(url);
            setCases(response.data.cases || response.data || []);
        } catch (error) {
            console.error('Failed to load cases:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* High-Authority Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Sovereign Tribunal Docket</h1>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-[0.3em] mt-0.5">High-Court Adjudication Persistence Layer</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-rose-500 outline-none shadow-sm"
                        >
                            <option value="">All Jurisdictions</option>
                            <option value="active">Active Litigation</option>
                            <option value="closed">Adjudicated</option>
                        </select>
                        <button
                            onClick={() => navigate('/court/register-case')}
                            className="btn-primary h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-rose-700 border-rose-700 shadow-xl shadow-rose-900/20 active:scale-95 transition-all"
                        >
                            Initiate New Docket
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Judicial Registry...</p>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 bg-white/50 shadow-2xl shadow-slate-200/50">
                        <div className="text-7xl mb-8 grayscale opacity-30">⚖️</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">No Active Dockets</h3>
                        <p className="text-slate-400 mt-4 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                            The collective judicial registry currently reports zero active litigation dockets for this jurisdiction.
                        </p>
                        <button
                            onClick={() => navigate('/court/register-case')}
                            className="mt-10 btn-secondary px-10 h-12 text-[10px] font-black uppercase tracking-widest"
                        >
                            Initiate Primary Record
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Bar */}
                        <div className="flex justify-between items-end px-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Trail Result: {cases.length} Entries</h2>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Tribunal Sync Active
                            </p>
                        </div>

                        {/* Forensic Table Card */}
                        <div className="card overflow-hidden border-0 shadow-2xl shadow-rose-900/5 bg-white ring-1 ring-slate-100">
                            <div className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center">
                                <div className="flex gap-10">
                                    <div className="flex flex-col">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Version</p>
                                        <p className="text-[10px] font-black uppercase tracking-tight">JUDICIAL_VER_4.0.2</p>
                                    </div>
                                    <div className="flex flex-col border-l border-white/10 pl-10">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Persistence Layer</p>
                                        <p className="text-[10px] font-black uppercase tracking-tight">DECENTRALIZED_TRIBUNAL</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Oracles Synchronized</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-10 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Docket_Reference</th>
                                            <th className="px-6 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset_Digital_ID</th>
                                            <th className="px-6 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Incident_Ref</th>
                                            <th className="px-6 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Litigation_State</th>
                                            <th className="px-6 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Filing_Timestamp</th>
                                            <th className="px-10 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Action_Suite</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {cases.map((c) => (
                                            <tr key={c._id} className="hover:bg-rose-50/20 transition-all group">
                                                <td className="px-10 py-6">
                                                    <span className="text-xs font-black text-rose-900 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 uppercase tracking-tighter shadow-sm font-mono">
                                                        #{c.caseId?.toUpperCase() || 'SYS_GEN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 font-mono tracking-tighter truncate max-w-[120px]">{c.propertyId}</span>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">SOVEREIGN_ASSET</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="text-[10px] font-bold text-slate-500 font-mono italic">DIS_{c.disputeId?.substring(0, 10).toUpperCase() || 'INTERNAL'}</span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`badge-${c.status === 'active' ? 'danger' : 'neutral'} scale-90 origin-left ring-2 ring-white shadow-md`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-700 uppercase">{new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(c.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button
                                                        onClick={() => navigate(`/court/cases/${c.caseId}`)}
                                                        className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                                    >
                                                        Review Docket
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-20 text-center pb-20">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-4">Adjudication Persistence Layer Secured by Judicial Blockchain Oracle</p>
                            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cases;
