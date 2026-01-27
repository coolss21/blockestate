// pages/public/PublicCertificate.jsx - Professional property authenticity certificate
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const PublicCertificate = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/public/property/${propertyId}`);
            setProperty(response.data.property);
        } catch (err) {
            setError(err.response?.data?.error || 'Property not found or invalid certificate');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        return `${addr.line1 || ''}, ${addr.district || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim().replace(/^, |, $/, '');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900">Certificate Invalid</h2>
                    <p className="text-gray-500 mt-2">{error}</p>
                    <button
                        onClick={() => navigate('/verify-qr')}
                        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                    >
                        Scan Another QR
                    </button>
                </div>
            </div>
        );
    }

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
            alert('Failed to generate official PDF. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 selection:bg-cyan-100 print:p-0 print:bg-white text-slate-900">
            {/* Design Watermark */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
                <span className="text-[40vw] font-black tracking-tighter rotate-12">SOVEREIGN</span>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Authority Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">BlockEstate</h2>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">State Property Registry</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-[0.2em] border-2 bg-white"
                        >
                            🖨️ Generate Print Copy
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="btn-primary h-11 px-8 bg-cyan-700 border-cyan-700 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/20"
                        >
                            Download Master Deed
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden border border-slate-100 relative isolate ring-1 ring-slate-900/5">
                    {/* Header: Citizen Receipt Terminal */}
                    <div className="bg-slate-900 p-12 md:p-16 text-center text-white relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-1 bg-cyan-500 rounded-full mb-8 opacity-50"></div>
                            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4">Sovereign Asset Document</h3>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 italic uppercase">Deed of Ownership</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs max-w-lg mx-auto">
                                Validated by BlockEstate Decentralized Oracle & Municipal Registry Authority
                            </p>
                        </div>
                    </div>

                    {/* Main Content: Asset Matrix */}
                    <div className="p-12 md:p-20 space-y-16">
                        {/* Property Snapshot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">Asset Identification Matrix</label>
                                <p className="text-2xl font-black text-cyan-700 font-mono tracking-tighter">{property.propertyId}</p>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">Registered Sovereign Owner</label>
                                <p className="text-2xl font-black text-slate-900 uppercase italic truncate">{property.ownerName}</p>
                            </div>
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">Legal Physical Coordinates</label>
                                <p className="text-xl font-black text-slate-800 uppercase leading-relaxed max-w-2xl">
                                    {formatAddress(property.address)}
                                </p>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">Registry Land Area</label>
                                <p className="text-3xl font-black text-slate-900 italic">{property.areaSqft.toLocaleString()} <span className="text-sm font-bold text-slate-400 uppercase not-italic tracking-widest ml-2">Sq. Ft.</span></p>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block">Valuation Baseline</label>
                                <p className="text-3xl font-black text-emerald-600">₹{property.value.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Persistence Proof */}
                        <div className="pt-12 border-t border-slate-100">
                            <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl group-hover:rotate-12 transition-transform duration-700">🔒</div>

                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></span>
                                    Blockchain Integrity Matrix
                                </h4>

                                <div className="space-y-8 flex-1 w-full">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Hash Persistence</span>
                                        <p className="text-sm font-mono font-black text-cyan-600 bg-white p-4 rounded-xl shadow-inner border border-slate-100 flex items-center justify-between">
                                            <span>{property.chain?.txHash ? `${property.chain.txHash.substring(0, 16)}...${property.chain.txHash.substring(property.chain.txHash.length - 12)}` : 'PENDING'}</span>
                                            <span className="text-[10px] bg-cyan-50 px-2 py-0.5 rounded-md text-cyan-700">MODERN_LEDGER</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Block Height</span>
                                            <p className="text-sm font-mono font-black text-slate-900 italic">#{property.chain?.blockNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Network Protocol</span>
                                            <p className="text-sm font-black text-slate-900 uppercase">Aptos Mainnet v1</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legal Note */}
                        <div className="text-center space-y-4">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Deed Integrity Verified by Sovereign Ledger Protocol</p>
                            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto"></div>
                        </div>
                    </div>
                </div>

                {/* Return Action */}
                <div className="mt-16 text-center print:hidden">
                    <button
                        onClick={() => navigate('/verify-qr')}
                        className="text-[10px] font-black text-slate-400 hover:text-cyan-600 uppercase tracking-[0.3em] transition-colors flex items-center gap-3 mx-auto"
                    >
                        <span>←</span> Return to Public Registry Terminal
                    </button>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-8">
                        Instance Node: 0x7E...4A2 | Security Level: Sovereign
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PublicCertificate;
