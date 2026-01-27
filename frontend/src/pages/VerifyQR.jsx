// pages/VerifyQR.jsx - Public QR verification page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const VerifyQR = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let data;
            try {
                // Try to parse as JSON (QR data)
                const parsed = JSON.parse(input);
                data = { qrData: parsed };
            } catch {
                // Otherwise treat as property ID
                data = { propertyId: input.trim() };
            }

            const response = await apiClient.post('/public/verify', data);

            if (response.data.valid) {
                // Redirect to professional certificate page
                const propertyId = response.data.propertyId || response.data.onChain?.propertyId;
                navigate(`/certificate/${propertyId}`);
            } else {
                setResult(response.data);
            }
        } catch (error) {
            setResult({
                valid: false,
                error: 'VERIFICATION_FAILED',
                message: error.response?.data?.message || 'Verification failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 pb-20">
            {/* Branding & Mission */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-4 mb-6">
                    <div className="p-1 bg-white rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">BlockEstate</h1>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Public Validation Terminal</h2>
                <p className="text-slate-500 mt-3 font-black text-[10px] uppercase tracking-[0.3em]">Decentralized Asset Authenticity Verification Engine</p>
            </div>

            <div className="max-w-4xl w-full">
                {/* Search / Validation Terminal */}
                <div className="card p-10 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[3rem] mb-12">
                    <form onSubmit={handleVerify} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">
                                Cryptographic Input: Property ID or QR Persistence Matrix
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                rows={4}
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-6 px-8 text-sm font-bold text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all resize-none"
                                placeholder='Example: PROP-123456 or Paste QR JSON data here'
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="w-full btn-primary h-20 bg-cyan-700 border-cyan-700 hover:bg-cyan-900 text-sm font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-900/30 active:scale-95 transition-all rounded-[2rem]"
                        >
                            {loading ? 'Initializing Verification Matrix...' : 'Execute Asset Validation →'}
                        </button>
                    </form>
                </div>

                {/* Results Visualizer */}
                {result && (
                    <div className={`card overflow-hidden border-0 shadow-2xl rounded-[3rem] animate-in fade-in slide-in-from-bottom-5 duration-700 ${result.valid ? 'bg-white' : 'bg-rose-50/50'}`}>
                        {/* Status Header */}
                        <div className={`p-10 flex items-center justify-between ${result.valid ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-900/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-900/20'}`}>
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-md">
                                    {result.valid ? '✓' : '✗'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                                        {result.valid ? 'Persistence Verified' : 'Authentication Failure'}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                        {result.message || (result.valid ? 'Asset record matches decentralized registry' : 'Record mismatch or invalid protocol input')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hidden md:block">
                                Signature Verification: 100% Secure
                            </div>
                        </div>

                        {result.valid ? (
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-cyan-500 transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Universal Asset ID</p>
                                        <p className="font-mono text-lg font-black text-cyan-700">{result.propertyId || result.onChain?.propertyId}</p>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-cyan-500 transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registered Entity</p>
                                        <p className="text-lg font-black text-slate-900 uppercase italic truncate">{result.offChain?.owner || 'Sovereign Holder'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-cyan-500 transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Integrity Hash Integrity</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                            <p className="text-sm font-black text-emerald-600 uppercase">Cryptographic Match</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-cyan-500 transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Registry Consistency</p>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                            <p className="text-sm font-black text-emerald-600 uppercase">Synchronized</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl">🔒</div>
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                        <div className="space-y-2 text-center md:text-left">
                                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Blockchain Integrity Matrix</p>
                                            <p className="text-[11px] font-mono text-slate-400 truncate max-w-[300px]">
                                                CONTRACT: {result.contractAddress || 'REGISTRY_KERNEL_V1'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/certificate/${result.propertyId || result.onChain?.propertyId}`)}
                                            className="px-8 py-4 bg-cyan-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/40"
                                        >
                                            View Official Deed →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10">
                                <div className="bg-white p-8 rounded-[2rem] border-2 border-rose-200">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4">Verification Error Manifest</p>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-slate-900 italic">"{result.error || 'The asset signature provided does not match any official registry persistence.'}"</p>
                                        <p className="text-sm text-slate-400 font-bold">{result.details || 'Please ensure you are using an official QR code or a valid Property ID issued by the state registry.'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-[10px] font-black text-slate-400 hover:text-cyan-600 uppercase tracking-[0.4em] transition-colors flex items-center gap-3 mx-auto"
                    >
                        <span>←</span> Return to Sovereign Portal
                    </button>
                    <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-6"></div>
                </div>
            </div>
        </div>
    );
};

export default VerifyQR;
