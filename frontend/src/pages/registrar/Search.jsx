// pages/registrar/Search.jsx - Complete property search
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';
import QRModal from '../../components/QRModal';
import HistoryModal from '../../components/HistoryModal';

const formatAddress = (addr) => {
    if (!addr) return 'N/A';
    return `${addr.line1 || ''}, ${addr.district || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim().replace(/^, |, $/, '');
};

const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedQr, setSelectedQr] = useState(null);

    // History Modal State
    const [historyId, setHistoryId] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const response = await apiClient.get(`/registrar/search?q=${encodeURIComponent(query)}`);
            setResults(response.data.properties || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (propId) => {
        try {
            const response = await apiClient.get(`/property/certificate/${propId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${propId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('PDF Download failed:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            disputed: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            approved: 'badge-success',
            pending: 'badge-warning',
            disputed: 'badge-danger'
        };
        return classes[status] || 'badge-neutral';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Global Asset Query</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-0.5">Authorized Ledger Supervision</p>
                    </div>
                    <button
                        onClick={() => navigate('/registrar/dashboard')}
                        className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white transition-all"
                    >
                        <span>←</span> Control Center
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Advanced Search Command Center */}
                <div className="card p-10 mb-12 bg-slate-950 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden ring-1 ring-white/10 group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                        <span className="text-9xl">🔍</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>

                    <form onSubmit={handleSearch} className="relative z-10">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative flex-1 group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors text-xl">🔎</span>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Execute query by Asset ID, Owner Signature, or Legal Address..."
                                    className="w-full bg-white/5 border-white/10 border-2 rounded-[2rem] py-6 pl-16 pr-8 text-white placeholder-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white/10 transition-all outline-none font-black tracking-tight italic text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !query.trim()}
                                className="btn-primary h-20 px-12 bg-blue-600 border-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-4 active:scale-95 transition-all"
                            >
                                {loading && (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                )}
                                <span>{loading ? 'Processing Query...' : 'Execute Forensic Search'}</span>
                            </button>
                        </div>
                    </form>
                    <div className="flex items-center gap-8 mt-10 ml-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Ledger Sync: Active</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Query Engine: Real-time</span>
                        </div>
                    </div>
                </div>

                {/* Results Engine */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-20 h-20 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Scanning Distributed Asset Database...</p>
                    </div>
                ) : searched && results.length === 0 ? (
                    <div className="card py-32 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[3rem]">
                        <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-xl shadow-rose-900/5 rotate-12">
                            👻
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic italic">Registry Mismatch</h3>
                        <p className="text-slate-500 mt-4 max-w-sm mx-auto font-black text-[11px] uppercase tracking-widest leading-relaxed">
                            Zero blockchain records found for reference <span className="text-rose-600 italic">"{query}"</span>. Please verify input.
                        </p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="card overflow-hidden border-0 shadow-2xl shadow-blue-900/5 bg-white ring-1 ring-slate-100">
                        <div className="px-10 py-6 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Scan Result: <span className="text-blue-600">{results.length} Matches</span></h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-white border-b border-slate-100">
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Index</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Legal Holder</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Site Geometry</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit State</th>
                                        <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security QR</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.map((property) => (
                                        <tr key={property._id} className="hover:bg-blue-50/20 transition-all group">
                                            <td className="px-10 py-8">
                                                <span className="font-mono font-black text-blue-600 text-sm tracking-tight bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">
                                                    {property.propertyId}
                                                </span>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">{property.ownerName}</span>
                                                    <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] mt-0.5">REGISTERED PROPRIETOR</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8 max-w-[240px]">
                                                <p className="text-[11px] font-black text-slate-500 leading-relaxed italic line-clamp-2" title={formatAddress(property.address)}>
                                                    {formatAddress(property.address)}
                                                </p>
                                            </td>
                                            <td className="px-8 py-8">
                                                <span className={getStatusBadgeClass(property.status)}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div
                                                    onClick={() => setSelectedQr({
                                                        url: `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${property.propertyId}`,
                                                        id: property.propertyId
                                                    })}
                                                    className="w-14 h-14 bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-sm mx-auto cursor-pointer hover:ring-4 hover:ring-blue-500/10 hover:border-blue-500 transition-all group-hover:scale-110 active:scale-90"
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${property.propertyId}`}
                                                        alt="Verification QR"
                                                        className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/registrar/certificate?propertyId=${property.propertyId}`)}
                                                        className="btn-secondary h-10 px-6 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-white hover:text-blue-600 hover:border-blue-600"
                                                    >
                                                        Certificate
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadPDF(property.propertyId)}
                                                        className="h-10 w-10 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                                                        title="Download Official PDF"
                                                    >
                                                        📥
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setHistoryId(property.propertyId);
                                                            setIsHistoryOpen(true);
                                                        }}
                                                        className="h-10 w-10 bg-slate-900 rounded-xl text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20"
                                                        title="Comprehensive Asset History"
                                                    >
                                                        📜
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 opacity-30 select-none">
                        <div className="text-8xl mb-6">🛰️</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Waiting for Query Execution...</p>
                    </div>
                )}
            </div>

            {/* Forensic Modal Suite */}
            <HistoryModal
                propertyId={historyId}
                isOpen={isHistoryOpen}
                onClose={() => {
                    setIsHistoryOpen(false);
                    setHistoryId(null);
                }}
            />

            <QRModal
                isOpen={!!selectedQr}
                onClose={() => setSelectedQr(null)}
                qrUrl={selectedQr?.url}
                propertyId={selectedQr?.id}
            />
        </div>
    );
};

export default Search;
