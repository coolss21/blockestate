// pages/court/Hearings.jsx - Complete hearings list
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Hearings = () => {
    const navigate = useNavigate();
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHearings();
    }, []);

    const fetchHearings = async () => {
        try {
            const response = await apiClient.get('/court/hearings');
            setHearings(response.data.hearings || []);
        } catch (error) {
            console.error('Failed to load hearings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Adjudication Calendar</h1>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-[0.3em] mt-0.5">High-Court Session Persistence Layer</p>
                    </div>
                    <button
                        onClick={() => navigate('/court/cases')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    >
                        <span>←</span> Return to Registry
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8 px-4">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Scheduled Sessions: {hearings.length}</h2>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                        Oracle Sync Active
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Session Ledger...</p>
                    </div>
                ) : hearings.length === 0 ? (
                    <div className="card p-24 text-center border-dashed border-2 bg-white/50 shadow-2xl shadow-slate-200/50 rounded-[2rem]">
                        <div className="text-7xl mb-8 grayscale opacity-30">📅</div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">No Active Sessions</h3>
                        <p className="text-slate-400 mt-4 max-w-sm mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
                            The judicial tribunal calendar currently reports zero scheduled property deliberations for this jurisdiction.
                        </p>
                        <button
                            onClick={() => navigate('/court/cases')}
                            className="mt-10 btn-secondary px-10 h-12 text-[10px] font-black uppercase tracking-widest"
                        >
                            Return to Registry
                        </button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {hearings.map((hearing) => (
                            <div key={hearing._id} className="card group hover:shadow-[0_20px_60px_-15px_rgba(159,18,57,0.1)] transition-all duration-700 border-0 bg-white ring-1 ring-slate-100 overflow-hidden rounded-[2.5rem]">
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    {/* Timing Section */}
                                    <div className="p-10 md:w-72 bg-slate-900 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-600"></div>
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner mb-6 text-2xl border border-white/10 group-hover:scale-110 transition-transform duration-700">
                                            📅
                                        </div>
                                        <p className="text-[10px] font-black text-rose-500 leading-tight uppercase tracking-[0.3em] mb-2 font-mono">
                                            {new Date(hearing.hearingDate).toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase()}
                                        </p>
                                        <p className="text-3xl font-black tracking-tighter uppercase italic">
                                            {new Date(hearing.hearingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                        <div className="mt-6 px-4 py-2 bg-rose-950/50 border border-rose-500/30 rounded-xl shadow-2xl shadow-rose-900/50">
                                            <p className="text-xs font-black text-rose-400 font-mono tracking-widest">
                                                {new Date(hearing.hearingDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-10 flex-1 flex flex-col justify-between bg-white relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl font-black italic select-none">SESSION</div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest font-mono bg-rose-50 px-3 py-1 rounded-lg border border-rose-100 italic">#{hearing.disputeId?.substring(0, 10).toUpperCase() || 'SYS_GEN'}</span>
                                                        <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ASSET_ID: {hearing.propertyId?.substring(0, 12)}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Litigation Review Protocol</h3>
                                                </div>
                                                <span className={`badge-${hearing.status === 'active' || hearing.status === 'scheduled' ? 'danger' : 'neutral'} scale-110 ring-4 ring-white shadow-xl shadow-rose-100`}>
                                                    {hearing.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2.5 mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 ring-4 ring-slate-50/50">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block underline decoration-rose-500 decoration-2 underline-offset-4">Judicial Basis</label>
                                                <p className="text-sm font-bold text-slate-700 italic leading-relaxed pr-8">
                                                    "{hearing.reason?.replace(/_/g, ' ') || 'The tribunal deliberates upon properties with unresolved forensic status flags.'}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-[1.2rem] border border-emerald-100 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"></div>
                                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Persistence Layer Ready</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => navigate(`/court/cases/${hearing.caseId || hearing.disputeId}`)}
                                                    className="h-12 px-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
                                                >
                                                    Review Case Dossier
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-32 text-center pb-20 opacity-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Judicial Oracle Synchronized with Global Registry Network</p>
                    <div className="w-16 h-1 bg-slate-200 mx-auto mt-6 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default Hearings;
