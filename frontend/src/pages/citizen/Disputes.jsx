// pages/citizen/Disputes.jsx - Complete citizen disputes page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Disputes = () => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const response = await apiClient.get('/citizen/disputes');
            setDisputes(response.data.disputes || []);
        } catch (error) {
            console.error('Failed to load disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            open: 'badge-danger scale-110 shadow-lg shadow-rose-100',
            'in-court': 'badge-warning border-amber-200 text-amber-700 scale-110 shadow-lg shadow-amber-100',
            resolved: 'badge-success scale-110 shadow-lg shadow-emerald-100',
            dismissed: 'badge-neutral scale-110',
            active: 'badge-danger scale-110 shadow-lg shadow-rose-100',
            pending: 'badge-warning scale-110 shadow-lg shadow-amber-100'
        };
        return classes[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">BlockEstate</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Judicial Alert Console</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/citizen/dashboard')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2 font-mono"
                    >
                        <span>←</span> System Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Critical Info Banner */}
                <div className="bg-slate-900 text-white rounded-[2rem] p-8 mb-12 shadow-2xl shadow-slate-900/20 flex items-start gap-6 relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl rotate-12">⚖️</div>
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-indigo-500/30">
                        ⚖️
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black uppercase tracking-tight italic mb-2 text-indigo-100">Blockchain Frozen State: Litigation Protocol 402</h2>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-4xl">
                            ASSETS UNDER DISPUTE ARE <span className="text-rose-400">HARD-LOCKED</span> ON THE DECENTRALIZED LEDGER. OWNERSHIP TRANSFERS, ENCUMBRANCES, AND SECONDARY FILINGS ARE AUTOMATICALLY SUSPENDED BY TRIBUNAL SMART CONTRACTS UNTIL FORMAL RESOLUTION CLEARANCE.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Court Records...</p>
                    </div>
                ) : disputes.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 bg-emerald-50/20 shadow-2xl shadow-emerald-900/5 border-emerald-100">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                            🛡️
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Portfolio Unencumbered</h3>
                        <p className="text-slate-400 mt-4 max-w-sm mx-auto text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">
                            Zero active claims identified. Your sovereign assets are currently clear of all legal impediments and registry locks.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Summary Bar */}
                        <div className="flex justify-between items-end px-4">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Litigation Audit Trail: {disputes.length} Active Records</h2>
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                Legal Persistence Active
                            </p>
                        </div>

                        {/* Dispute Logs */}
                        <div className="grid grid-cols-1 gap-8">
                            {disputes.map((dispute) => (
                                <div key={dispute._id} className="card group hover:shadow-2xl hover:shadow-indigo-900/5 transition-all duration-500 border-0 bg-white ring-1 ring-slate-100 overflow-hidden">
                                    <div className={`px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${['active', 'open', 'in-court'].includes(dispute.status) ? 'bg-rose-50/40 border-b border-rose-100' : 'bg-slate-50 border-b border-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${['active', 'open', 'in-court'].includes(dispute.status) ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'
                                                }`}>
                                                ⚖️
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-slate-900 font-mono tracking-tighter uppercase italic">
                                                        LITIGATION_{(dispute.disputeId?.substring(0, 8) || dispute._id?.substring(0, 8) || 'UNKNOWN').toUpperCase()}
                                                    </h3>
                                                    <span className={getStatusBadgeClass(dispute.status)}>
                                                        {dispute.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                                                    DECENTRALIZED_ASSET_ID: <span className="text-indigo-600 font-black">{dispute.propertyId}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                                            <div className="space-y-1.5">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Judicial Basis</p>
                                                <p className="text-sm font-black text-slate-900 uppercase italic leading-snug">
                                                    {dispute.details?.replace(/_/g, ' ') || dispute.reason?.replace(/_/g, ' ') || 'UNDISCLOSED_LITIGATION_TYPE'}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filing Chronology</p>
                                                <p className="text-sm font-bold text-slate-600 uppercase">
                                                    {new Date(dispute.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                            {dispute.hearingDate && (
                                                <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100/50 shadow-inner">
                                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                                        Tribunal Session Window
                                                    </p>
                                                    <p className="text-sm font-black text-amber-900 uppercase italic">
                                                        {new Date(dispute.hearingDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            )}
                                            {(!dispute.hearingDate && dispute.status === 'in-court') && (
                                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Scheduling Persistence</p>
                                                    <p className="text-sm font-black text-slate-500 uppercase italic">Awaiting Docket Assignment</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Forensic Timeline */}
                                        {dispute.timeline && Array.isArray(dispute.timeline) && dispute.timeline.length > 0 && (
                                            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-lg shadow-indigo-200"></span>
                                                    Forensic Action Log
                                                </h4>
                                                <div className="space-y-6 relative pl-4">
                                                    <div className="absolute left-[3.5px] top-2 bottom-6 w-[2px] bg-slate-100"></div>
                                                    {dispute.timeline.slice(-3).reverse().map((event, idx) => (
                                                        <div key={idx} className="flex gap-6 group/item relative">
                                                            <div className="w-[11px] h-[11px] rounded-full ring-[4px] ring-white bg-indigo-600 z-10 shrink-0 mt-1.5"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-black text-slate-800 uppercase italic">{event.message || event.action || 'Unknown Action'}</p>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                                    {event.createdAt ? new Date(event.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Temporal Signature Pending'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sovereign Court Order */}
                                        {dispute.resolution && (
                                            <div className="mt-10 p-8 bg-emerald-900 text-white rounded-[2rem] shadow-2xl shadow-emerald-900/20 flex items-start gap-6 relative overflow-hidden group/order italic">
                                                <div className="absolute -top-4 -right-4 text-9xl opacity-10 group-hover:rotate-12 transition-transform duration-700">📜</div>
                                                <span className="text-4xl filter drop-shadow-lg">🏛️</span>
                                                <div className="relative z-10">
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-3">Enforceable Sovereign Order</p>
                                                    <p className="text-lg text-emerald-50 font-black leading-relaxed tracking-tight">
                                                        "{dispute.resolution}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-20 text-center pb-20">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-4">Litigation Integrity Verified by Judicial Oracle Network</p>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default Disputes;
