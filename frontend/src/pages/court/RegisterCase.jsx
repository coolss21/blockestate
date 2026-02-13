// pages/court/RegisterCase.jsx - Complete case registration form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const RegisterCase = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        propertyId: '',
        reason: '',
        details: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.post('/court/cases/register', {
                propertyId: formData.propertyId,
                reason: formData.reason,
                details: formData.details
            });

            navigate('/court/cases');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'Failed to register case. Make sure the property ID exists.');
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
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Litigation Terminal</h1>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-[0.3em] mt-0.5">Asset Restriction Initiation Interface</p>
                    </div>
                    <button
                        onClick={() => navigate('/court/cases')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    >
                        <span>←</span> Cancel Initiation
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="card shadow-2xl shadow-rose-900/10 overflow-hidden border-0 bg-white ring-1 ring-slate-100 rounded-[2.5rem]">
                    <div className="bg-slate-900 text-white px-12 py-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl font-black italic rotate-12 select-none">INITIATE</div>
                        <div className="relative z-10">
                            <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] mb-3 font-mono">Registry Authority Protocol</h2>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Sovereign Restriction Mandate</h3>

                            <div className="mt-8 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md ring-1 ring-white/10">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-2xl border border-rose-500/30">⚠️</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mb-2">Blockchain Persistence Warning</p>
                                        <p className="text-sm font-bold text-slate-300 leading-relaxed italic pr-4">
                                            Executing this mandate will immediately flag the subject digital asset as <span className="text-rose-500 underline decoration-2 underline-offset-4">LITIGATION_PENDING</span>.
                                            This action suspends all commercial exchange rights until a court resolution is synchronized with the registry.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-12 bg-white">
                        {error && (
                            <div className="mb-12 p-6 bg-rose-50 border-2 border-rose-100 rounded-[1.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 ring-8 ring-rose-50/50">
                                <div className="w-12 h-12 bg-rose-200 text-rose-700 flex items-center justify-center text-2xl rounded-xl shadow-inner shrink-0">🚫</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-1">Protocol Initialization Failure</p>
                                    <p className="text-sm font-black text-rose-900 italic">"{error?.toUpperCase().replace(/_/g, ' ')}"</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Asset Reference ID</label>
                                    <span className="text-[8px] font-black text-rose-500 uppercase italic">Validated Registry ID Required</span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors pointer-events-none">🏢</div>
                                    <input
                                        type="text"
                                        value={formData.propertyId}
                                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                        placeholder="COMMERCIAL_ASSET_UUID_1029384756..."
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-8 text-sm font-black text-slate-900 placeholder:text-slate-300 placeholder:italic focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all font-mono tracking-widest uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3 md:col-span-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Litigation Classification</label>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors pointer-events-none">⚖️</div>
                                        <select
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-8 text-sm font-black text-slate-900 focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer uppercase italic tracking-tight"
                                        >
                                            <option value="">Select Jurisdictional Cause...</option>
                                            <option value="ownership_dispute">Ownership Dispute Protocol</option>
                                            <option value="fraud">Fraudulent Activity Alert</option>
                                            <option value="title_defect">Title Consistency Incident</option>
                                            <option value="inheritance_dispute">Inheritance Conflict Log</option>
                                            <option value="boundary_dispute">Spatial Boundary Discrepancy</option>
                                            <option value="other">Unclassified Legal Incident</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3 md:col-span-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Forensic Evidentiary Metadata</label>
                                        <span className="text-[8px] font-black text-slate-400 uppercase italic">Max 500 Sub-units</span>
                                    </div>
                                    <textarea
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        required
                                        rows="6"
                                        placeholder="State the formal legal grounds for this restriction. Identify all involved entities, claims, and verified incident chronologies..."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-8 text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:italic focus:ring-8 focus:ring-rose-500/5 focus:border-rose-500 outline-none transition-all min-h-[180px] leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-end gap-8 pt-12 mt-12 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => navigate('/court/cases')}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-rose-600 transition-all italic underline decoration-transparent hover:decoration-rose-600 underline-offset-8"
                                >
                                    Abandon Initiation
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto btn-primary bg-rose-700 border-rose-700 hover:bg-rose-950 h-16 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-rose-900/40 disabled:opacity-50 active:scale-95 transition-all rounded-[1.2rem] group"
                                >
                                    {loading ? 'Synchronizing Oracles...' : (
                                        <span className="flex items-center gap-3">
                                            Commit Filing & Restrict Asset
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-20 text-center pb-20 opacity-30">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Judicial Registry Initiation Point Secured by Advanced Crypto-Protocol</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterCase;
