// pages/registrar/AllProperties.jsx - List of all registered properties
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';
import HistoryModal from '../../components/HistoryModal';
import QRModal from '../../components/QRModal';

const AllProperties = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // History Modal State
    const [historyId, setHistoryId] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedQr, setSelectedQr] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, [pagination.page]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            let url = `/registrar/properties?page=${pagination.page}&limit=12`;
            if (searchTerm) url += `&search=${searchTerm}`;

            const response = await apiClient.get(url);
            setProperties(response.data.properties || []);
            setPagination({
                page: response.data.page || 1,
                totalPages: response.data.totalPages || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Failed to load properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(p => ({ ...p, page: 1 }));
        fetchProperties();
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

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        return `${addr.line1 || ''}, ${addr.district || ''}, ${addr.state || ''} ${addr.pincode || ''}`.trim().replace(/^, |, $/, '');
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Registry Ledger</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-0.5">Global Asset Synchronizer</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Ledger</span>
                            <span className="text-xs font-black text-slate-900 uppercase italic">{pagination.total} Validated Records</span>
                        </div>
                        <button
                            onClick={() => navigate('/registrar/dashboard')}
                            className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-black"
                        >
                            <span>←</span> Overview
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Premium Command Bar Search */}
                <form onSubmit={handleSearch} className="mb-16 relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <span className="text-xl">🔍</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Query Sovereign Ledger by Asset ID, Identity, or Geospatial Link..."
                        className="w-full bg-white border-0 rounded-[2.5rem] py-6 pl-16 pr-48 text-sm font-black text-slate-900 shadow-2xl shadow-blue-900/5 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-300 italic ring-1 ring-slate-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-blue-600 text-white px-10 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        Execute Forensic Query
                    </button>
                </form>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-6 shadow-inner"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Parsing Sovereign Ledger...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="card p-32 text-center border-dashed border-2 bg-slate-100/30">
                        <div className="text-8xl mb-8 opacity-20">📂</div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Ledger Nullity</h3>
                        <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium italic">No registry records synchronize with the current query parameters.</p>
                        <button
                            onClick={() => { setSearchTerm(''); fetchProperties(); }}
                            className="mt-10 btn-secondary px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                        >
                            Reset Registry Sync
                        </button>
                    </div>
                ) : (
                    <>
                        {/* High-Performance Asset Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {properties.map((prop) => (
                                <div key={prop._id} className="card group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border-0 bg-white ring-1 ring-slate-100 overflow-hidden flex flex-col relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                        <span className="text-8xl">🏢</span>
                                    </div>

                                    <div className="p-8 pb-4 flex justify-between items-start relative z-10">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg ring-1 ring-blue-100/50">{prop.propertyId}</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">EPOCH_{new Date(prop.updatedAt).getFullYear()}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors truncate max-w-[200px]" title={prop.ownerName}>{prop.ownerName}</h3>
                                        </div>
                                        <span className={`badge-${prop.status === 'approved' ? 'success' : 'warning'} scale-75 origin-right shadow-sm`}>
                                            {prop.status}
                                        </span>
                                    </div>

                                    <div className="px-8 pb-8 flex-1 flex flex-col relative z-10">
                                        <div className="flex justify-between items-start gap-6 mt-6">
                                            <div className="space-y-6 flex-1">
                                                <div className="space-y-1.5">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block">Geospatial Marker</label>
                                                    <p className="text-xs font-black text-slate-500 line-clamp-2 italic leading-relaxed">
                                                        "{formatAddress(prop.address)}"
                                                    </p>
                                                </div>
                                                <div className="flex gap-8">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block">Metric Matrix</label>
                                                        <p className="text-sm font-black text-slate-900">{prop.areaSqft.toLocaleString()} <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter ml-1">SQFT</span></p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] block">Forensic Value</label>
                                                        <p className="text-sm font-black text-blue-600 uppercase">₹{prop.value?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className="w-24 h-24 bg-slate-50 p-1.5 pb-4 border border-slate-100 rounded-[2rem] shadow-inner cursor-pointer hover:ring-8 hover:ring-blue-500/5 transition-all flex flex-col group/qr shrink-0"
                                                onClick={() => setSelectedQr({
                                                    url: `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${prop.propertyId}`,
                                                    id: prop.propertyId
                                                })}
                                            >
                                                <div className="flex-1 overflow-hidden rounded-[1.5rem] border border-white bg-white">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${prop.propertyId}`}
                                                        alt="Asset QR"
                                                        className="w-full h-full object-contain grayscale group-hover/qr:grayscale-0 transition-all duration-300"
                                                    />
                                                </div>
                                                <span className="text-[7px] text-center font-black text-slate-300 uppercase tracking-tighter mt-1 group-hover/qr:text-blue-600 transition-colors">Verify Layer</span>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-slate-50 flex gap-3">
                                            <button
                                                onClick={() => navigate(`/registrar/certificate?propertyId=${prop.propertyId}`)}
                                                className="flex-1 h-12 px-6 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                            >
                                                Audit Cert
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPDF(prop.propertyId)}
                                                className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white hover:rounded-xl transition-all shadow-sm hover:shadow-blue-500/20 active:scale-90"
                                                title="Export Official PDF"
                                            >
                                                📥
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setHistoryId(prop.propertyId);
                                                    setIsHistoryOpen(true);
                                                }}
                                                className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white hover:rounded-xl transition-all shadow-sm active:scale-90"
                                                title="Blockchain Audit Logs"
                                            >
                                                📜
                                            </button>
                                            {prop.ipfsCID && (
                                                <button
                                                    onClick={() => window.open(`http://127.0.0.1:8081/ipfs/${prop.ipfsCID}`, '_blank')}
                                                    className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white hover:rounded-xl transition-all shadow-sm active:scale-90"
                                                    title="Raw IPFS Segment"
                                                >
                                                    📄
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Authority Pagination Orchestration */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-12 mt-20 bg-white py-8 px-12 rounded-[3rem] shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100 max-w-fit mx-auto">
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all shadow-inner active:scale-90"
                                >
                                    <span className="text-xl font-black">←</span>
                                </button>
                                <div className="text-center min-w-[160px]">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">Ledger Registry Segment</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        SECTION <span className="text-blue-600 italic">0{pagination.page}</span> <span className="text-slate-200 mx-2 text-2xl font-light">/</span> 0{pagination.totalPages}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all shadow-inner active:scale-90"
                                >
                                    <span className="text-xl font-black">→</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Authority Modals */}
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

export default AllProperties;
