// pages/court/CaseDetails.jsx - Complete case management page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';
import HistoryModal from '../../components/HistoryModal';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [dispute, setDispute] = useState(null);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderText, setOrderText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [hearingDate, setHearingDate] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await apiClient.get(`/court/cases/${id}`);
            setCaseData(response.data.case);
            setDispute(response.data.dispute);
            setProperty(response.data.property);
        } catch (error) {
            console.error('Failed to load case:', error);
            setError('Failed to load case details');
        } finally {
            setLoading(false);
        }
    };

    const handleIssueOrder = async () => {
        if (!orderText.trim()) {
            return;
        }

        setProcessing(true);
        try {
            await apiClient.post(`/court/cases/${caseData.caseId}/orders`, {
                orderText: orderText
            });
            setOrderText('');
            await fetchDetails();
        } catch (error) {
            console.error('Failed to issue order:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleScheduleHearing = async () => {
        if (!hearingDate) {
            return;
        }

        setProcessing(true);
        try {
            await apiClient.post('/court/hearings', {
                disputeId: caseData.disputeId,
                hearingDate: hearingDate
            });
            setHearingDate('');
            await fetchDetails();
        } catch (error) {
            console.error('Failed to schedule hearing:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseCase = async () => {
        const resolution = window.prompt('Enter resolution summary:');
        if (!resolution) return;

        if (!window.confirm('Are you sure you want to close this case? This will unfreeze the property and clear the dispute.')) return;

        setProcessing(true);
        try {
            await apiClient.post(`/court/cases/${caseData.caseId}/close`, {
                resolution
            });
            await fetchDetails();
        } catch (error) {
            console.error('Failed to close case:', error);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Dossier...</p>
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center">
                <div className="card p-16 bg-rose-50 border-rose-100 shadow-2xl shadow-rose-900/5">
                    <div className="text-6xl mb-6 opacity-50">📑</div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-4">Dossier Retrieval Failure</h2>
                    <p className="text-sm font-bold text-rose-700 uppercase tracking-widest mb-8">{error || 'Case reference not found in registry'}</p>
                    <button
                        onClick={() => navigate('/court/cases')}
                        className="btn-secondary h-12 px-8 text-[10px] font-black uppercase tracking-widest"
                    >
                        Return to Registry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/court/cases')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    >
                        <span>←</span> Return to Registry
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Judicial State</p>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${caseData.status === 'active' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {caseData.status === 'active' ? '● LITIGATION_ACTIVE' : '● ADJUDICATED'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <span className={`badge-${caseData.status === 'active' ? 'danger' : 'success'} scale-110 shadow-lg shadow-rose-100`}>
                            {caseData.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Supreme Case Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Primary Docket Information */}
                        <div className="card overflow-hidden border-0 shadow-2xl shadow-rose-900/10 ring-1 ring-slate-100">
                            <div className="px-12 py-10 bg-slate-900 text-white relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black italic select-none">#{caseData.caseId}</div>
                                <div className="relative z-10">
                                    <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mb-3 font-mono">Supreme Court of Decentralized Assets</h2>
                                    <h1 className="text-4xl font-black tracking-tight italic uppercase italic">DOX_LITIGATION_{caseData.caseId}</h1>
                                    <div className="mt-8 flex flex-wrap items-center gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Asset ID</p>
                                            <p className="text-sm font-bold font-mono text-white tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{caseData.propertyId}</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Filing Origin</p>
                                            <p className="text-sm font-black text-white italic uppercase tracking-widest">Registry_Alert_System</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dossier Timestamp</p>
                                            <p className="text-sm font-black text-white opacity-90">{new Date(caseData.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-10">
                                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <span className="w-2 h-2 bg-rose-600 rounded-full shadow-lg shadow-rose-200"></span>
                                            Asset Subject Profile
                                        </h3>
                                        {property ? (
                                            <div className="space-y-6">
                                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center group relative overflow-hidden ring-1 ring-slate-100">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">🏢</div>
                                                    <div className="space-y-1.5 relative z-10">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Primary Holder</p>
                                                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-rose-600 transition-colors italic">{property.ownerName}</p>
                                                    </div>
                                                    <div className="text-right relative z-10">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ValuationIndex</p>
                                                        <p className="text-xl font-black text-emerald-700">₹{property.value?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between px-6 py-4 bg-rose-50/30 rounded-2xl border border-rose-100/50">
                                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em]">Registry State Persistence</span>
                                                    <span className="badge-danger scale-90 ring-4 ring-white shadow-xl shadow-rose-900/10">FROZEN_ASSET</span>
                                                </div>
                                                <button
                                                    onClick={() => setIsHistoryOpen(true)}
                                                    className="w-full h-14 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm flex items-center justify-center gap-3"
                                                >
                                                    📜 Examine Forensic Ledger
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">Asset metadata synchronization failure</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-10">
                                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                            <span className="w-2 h-2 bg-rose-600 rounded-full shadow-lg shadow-rose-200"></span>
                                            Dispute Specifications
                                        </h3>
                                        {dispute ? (
                                            <div className="space-y-8 p-10 bg-rose-50/30 rounded-[2rem] border border-rose-100 ring-[12px] ring-rose-50/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-10 text-7xl font-black rotate-12">⚖️</div>
                                                <div className="space-y-2.5 relative z-10">
                                                    <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest underline decoration-2 underline-offset-4">Cause of Litigation</p>
                                                    <p className="text-lg font-black text-slate-800 leading-tight italic pr-6 group-hover:text-rose-900 transition-colors">
                                                        "{dispute.details?.replace(/_/g, ' ') || dispute.reason?.replace(/_/g, ' ') || 'UNDETERMINED_LITIGATION_BASIS'}"
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-end border-t border-rose-100 pt-6 relative z-10">
                                                    <div className="space-y-1.5">
                                                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Dossier ID</p>
                                                        <p className="text-[10px] font-mono font-black text-rose-900 uppercase tracking-tighter bg-white px-2 py-0.5 rounded shadow-sm">{dispute.disputeId}</p>
                                                    </div>
                                                    <div className="text-right space-y-1.5">
                                                        <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Filing Date</p>
                                                        <p className="text-xs font-black text-slate-700 uppercase">{new Date(dispute.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">Dispute parameters unavailable</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Adjudication Timeline */}
                        <div className="card p-12 bg-white border-0 shadow-2xl shadow-rose-900/5 ring-1 ring-slate-100">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-16 flex items-center gap-6">
                                <span className="flex-1 h-px bg-slate-100"></span>
                                Adjudication Forensic Chronology
                                <span className="flex-1 h-px bg-slate-100"></span>
                            </h3>
                            {dispute?.timeline && dispute.timeline.length > 0 ? (
                                <div className="space-y-12 relative px-4">
                                    <div className="absolute left-[23px] top-6 bottom-12 w-[2.5px] bg-slate-100"></div>
                                    {dispute.timeline.map((event, idx) => (
                                        <div key={idx} className="flex gap-10 group/item relative">
                                            <div className={`w-[50px] h-[50px] rounded-[1.2rem] flex items-center justify-center flex-shrink-0 z-10 relative shadow-2xl ring-4 ring-white ${event.type === 'COURT_ORDER' ? 'bg-rose-950 text-white shadow-rose-200' :
                                                event.type === 'HEARING_SCHEDULED' ? 'bg-indigo-700 text-white shadow-indigo-200' :
                                                    'bg-slate-700 text-white shadow-slate-200'
                                                }`}>
                                                {event.type === 'COURT_ORDER' ? '⚖️' :
                                                    event.type === 'HEARING_SCHEDULED' ? '📅' : '🔗'}
                                            </div>
                                            <div className="flex-1 pb-10 border-b border-slate-50">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-0.5">
                                                            {event.type?.replace('_', ' ') || event.action}
                                                        </p>
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                                            PROTOCOL_LOG_ENTRY_{idx + 1}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                        {new Date(event.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed pr-16 italic">
                                                    {event.message || event.details}
                                                </p>
                                                {event.txHash && (
                                                    <div className="mt-5 flex items-center gap-3 px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/50 w-fit">
                                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">DECENTRALIZED_PROOF:</span>
                                                        <span className="text-[9px] font-mono font-black text-indigo-600 truncate max-w-[300px]">{event.txHash}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 text-center opacity-40">
                                    <div className="text-5xl mb-6 grayscale opacity-30">📂</div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic pr-4">
                                        Forensic parameters haven't yet been synchronized with the persistence layer.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Decision Authority */}
                    <div className="space-y-10">
                        {caseData.status === 'active' ? (
                            <>
                                {/* Proactive Adjudication Module */}
                                <div className="card overflow-hidden border-0 shadow-2xl shadow-rose-900/10 ring-1 ring-slate-100">
                                    <div className="p-8 bg-rose-900 text-white relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">✒️</div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Judicial Adjudication</h3>
                                        <p className="text-xl font-black italic tracking-tight">Issue Official Decree</p>
                                    </div>
                                    <div className="p-10 space-y-8 bg-white">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Decree Formulation</label>
                                                <span className="text-[8px] font-black text-rose-500 uppercase italic">Immutable Action</span>
                                            </div>
                                            <textarea
                                                value={orderText}
                                                onChange={(e) => setOrderText(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-6 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none min-h-[220px] transition-all placeholder:text-slate-300 placeholder:italic placeholder:font-medium"
                                                placeholder="Formulate the High-Court's mandate to be committed to the blockchain persistence layer..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleIssueOrder}
                                            disabled={processing || !orderText.trim()}
                                            className="w-full btn-primary h-16 bg-rose-700 border-rose-700 hover:bg-rose-800 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-900/30 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {processing ? 'Signing Ledger...' : 'Commit Sovereign Decree'}
                                        </button>
                                    </div>
                                </div>

                                {/* Hearing Synchronization Module */}
                                <div className="card overflow-hidden border-0 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-100">
                                    <div className="p-8 bg-indigo-900 text-white relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">📅</div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Ritual Scheduling</h3>
                                        <p className="text-xl font-black italic tracking-tight">Set Hearing Window</p>
                                    </div>
                                    <div className="p-10 space-y-8 bg-white">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Proposed Session Timestamp</label>
                                            </div>
                                            <input
                                                type="datetime-local"
                                                value={hearingDate}
                                                onChange={(e) => setHearingDate(e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.2rem] p-5 text-sm font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleScheduleHearing}
                                            disabled={processing || !hearingDate}
                                            className="w-full btn-primary h-16 bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/30 active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {processing ? 'Synchronizing Oracles...' : 'Lock Hearing Session'}
                                        </button>
                                    </div>
                                </div>

                                {/* Sovereign Case Closure */}
                                <div className="card p-10 bg-slate-900 text-white border-0 shadow-2xl shadow-slate-900/20 relative overflow-hidden group/close border-t-8 border-t-rose-600">
                                    <div className="absolute -top-6 -right-6 text-9xl opacity-10 group-hover/close:rotate-12 transition-transform duration-1000">🏷️</div>
                                    <div className="relative z-10 space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Absolute Adjudication</h3>
                                            <p className="text-xl font-black italic pr-10">Clear Dossier & Unfreeze Asset</p>
                                        </div>
                                        <button
                                            onClick={handleCloseCase}
                                            disabled={processing}
                                            className="w-full h-16 bg-white text-slate-950 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            ⚖️ Issue Final Adjudication
                                        </button>
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0"></div>
                                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">THIS ACTION IS IRREVERSIBLE. ALL REGISTRY LOCKS WILL BE PURGED AND ASSET OWNERSHIP RIGHTS COMMERCIALLY RESTORED IN FULL.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card p-12 bg-emerald-950 text-white border-0 shadow-2xl shadow-emerald-900/30 relative overflow-hidden ring-4 ring-white/10">
                                <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl scale-125 rotate-12">🏛️</div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mb-8 border border-emerald-500/30 shadow-inner">
                                        ⚖️
                                    </div>
                                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-3 font-mono">Dossier Closure Protocol</h3>
                                    <p className="text-3xl font-black italic leading-tight uppercase tracking-tighter italic">Adjudication Successfully Finalized</p>
                                    <div className="mt-10 space-y-6">
                                        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                                            <p className="text-[9px] font-black text-emerald-300 uppercase tracking-[0.3em] mb-2">Final Conclusion</p>
                                            <p className="text-sm font-bold text-emerald-50/80 leading-relaxed italic">The property registry persistence layer has been unfrozen. Sovereign ownership rights are cleared for secondary market operations.</p>
                                        </div>
                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] text-center italic">Synchronized with Global Oracle Network</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Authority Modals */}
            {caseData && (
                <HistoryModal
                    propertyId={caseData.propertyId}
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                />
            )}
        </div>
    );
};

export default CaseDetails;
