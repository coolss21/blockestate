// pages/registrar/Certificate.jsx - Professional certificate generation/viewer
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../config/api';
import PageTransition from '../../components/PageTransition';

const Certificate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') || '');
    const [loading, setLoading] = useState(false);
    const [property, setProperty] = useState(null);
    const [error, setError] = useState('');

    const [generationSuccess, setGenerationSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get('propertyId')) {
            handleGenerate(searchParams.get('propertyId'));
        }
    }, [searchParams]);

    const handleGenerate = async (id) => {
        if (!id?.trim()) return;
        setLoading(true);
        setError('');
        setProperty(null);
        setGenerationSuccess(false);

        try {
            // 1. Generate and Store in DB
            const genRes = await apiClient.post(`/registrar/certificate/${id}`);

            // 2. Fetch full public details for professional view
            const response = await apiClient.get(`/public/property/${id}`);
            setProperty(response.data.property);
            setGenerationSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate certificate. Ensure the Property ID is correct and approved.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await apiClient.get(`/property/certificate/${propertyId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Official_Certificate_${propertyId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('PDF Download failed:', error);
            toast.error('Failed to generate official PDF. Please try again.');
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        return `${addr.line1 || ''}, ${addr.district || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim().replace(/^, |, $/, '');
    };

    return (
        <PageTransition className="min-h-screen bg-slate-50/50 pb-20">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Authenticity Protocol</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-0.5">Sovereign Deed Validation</p>
                    </div>
                    <button
                        onClick={() => navigate('/registrar/dashboard')}
                        className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                    >
                        <span>←</span> Overview
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Authority Input Console */}
                <div className="card p-10 mb-16 bg-white border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                        <span className="text-9xl">🛡️</span>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleGenerate(propertyId); }} className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-3 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">
                                Ledger Reference ID
                            </label>
                            <input
                                type="text"
                                value={propertyId}
                                onChange={(e) => setPropertyId(e.target.value)}
                                placeholder="PROP-XX-XXXX..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-8 text-sm font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none italic placeholder-slate-300"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !propertyId.trim()}
                            className="w-full md:w-auto btn-primary h-16 px-12 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 bg-blue-600 border-blue-600 hover:bg-blue-700 active:scale-95"
                        >
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Syncing Record...</span>
                                </div>
                            ) : 'Generate Sovereign Deed'}
                        </button>
                    </form>

                    {generationSuccess && (
                        <div className="mt-8 flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🛡️</div>
                                <span className="text-xs font-black text-emerald-800 uppercase tracking-tight">Record successfully committed to ledger and cryptographically indexed.</span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-4 py-2 bg-white rounded-xl ring-1 ring-emerald-100 shadow-sm">LIVE_BLOCK_SYNC</span>
                        </div>
                    )}

                    {error && (
                        <div className="mt-8 flex items-center gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 text-xs font-black uppercase tracking-tight animate-in fade-in slide-in-from-top-4 duration-500">
                            <span className="text-xl">🚫</span> {error}
                        </div>
                    )}
                </div>

                {/* Sovereign Certificate Display */}
                {property && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        <div className="card max-w-4xl mx-auto overflow-hidden border-0 shadow-[0_50px_100px_-20px_rgba(30,41,59,0.25)] bg-white ring-[12px] ring-white relative isolate scale-[1.02]">
                            {/* Inner Border/Frame */}
                            <div className="absolute inset-4 border border-slate-100 pointer-events-none rounded-[1.5rem] z-20"></div>

                            {/* Institutional Header */}
                            <div className="bg-slate-950 p-16 text-center text-white relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-slate-900/60 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white flex items-center justify-center rounded-[2rem] shadow-2xl mb-8 ring-8 ring-white/10 group-hover:scale-110 transition-transform">
                                        <span className="text-4xl">🏛️</span>
                                    </div>
                                    <h2 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.5em] mb-3 font-mono">Blockchain Real Estate Authority</h2>
                                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Deed of Ownership</h1>
                                    <div className="mt-8 flex items-center gap-6">
                                        <div className="h-px w-20 bg-blue-500/40"></div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">Immutable Digital Identity</span>
                                        <div className="h-px w-20 bg-blue-500/40"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Body */}
                            <div className="p-16 md:p-24 relative bg-[url('https://www.transparenttextures.com/patterns/pinstripe-light.png')]">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                                    <span className="text-[15rem] font-black -rotate-12 tracking-tighter">SECURED</span>
                                </div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-16">
                                    <div className="flex-1 space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block">Proprietor Name</label>
                                                <p className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">{property.ownerName}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block">Ledger Reference</label>
                                                <p className="text-sm font-mono font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 inline-block uppercase tracking-tight">{property.propertyId}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block">Surface Matrix</label>
                                                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{property.areaSqft.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold tracking-widest ml-1">SQ_FT</span></p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block">Registry Status</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] italic">Validated & Sealed</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 border-t-2 border-slate-50 pt-12">
                                            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] block">Geospatial Locus</label>
                                            <p className="text-lg font-black text-slate-700 leading-relaxed italic">
                                                "{formatAddress(property.address)}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Audit Trail */}
                                <div className="mt-20 pt-12 border-t-2 border-slate-50 flex flex-col md:flex-row items-end justify-between gap-10">
                                    <div className="space-y-3 opacity-40 hover:opacity-100 transition-all duration-500 group/audit">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase w-24 tracking-widest">TRANSACTION:</span>
                                            <span className="text-[9px] font-mono font-black text-slate-900 truncate max-w-[240px] group-hover/audit:text-blue-600 transition-colors uppercase">{property.chain?.txHash || 'UNCOMMITTED_SEGMENT'}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase w-24 tracking-widest">LEDGER_BLOCK:</span>
                                            <span className="text-[9px] font-mono font-black text-slate-900 group-hover/audit:text-blue-600 transition-colors">#{property.chain?.blockNumber || 'PENDING_COMMIT'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 no-print">
                                        <button
                                            onClick={() => window.print()}
                                            className="btn-secondary h-12 px-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white"
                                        >
                                            Print Deed
                                        </button>
                                        <button
                                            onClick={handleDownloadPDF}
                                            className="btn-primary h-12 px-10 text-[10px] font-black uppercase tracking-widest bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 active:scale-95"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 max-w-xl mx-auto pb-10">
                            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-relaxed italic">
                                This document serves as an official authenticated surrogate of the primary blockchain record.
                                The validity of this deed can be instantly verified via the official BlockEstate Sovereign Distributed Ledger.
                            </p>
                            <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Certificate;
