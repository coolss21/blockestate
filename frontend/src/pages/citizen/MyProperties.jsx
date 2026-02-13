// pages/citizen/MyProperties.jsx - Complete citizen properties page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';
import QRModal from '../../components/QRModal';

const MyProperties = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQr, setSelectedQr] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await apiClient.get('/citizen/properties');
            setProperties(response.data.properties || []);
        } catch (error) {
            console.error('Failed to load properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.line1,
            addr.line2,
            addr.district,
            addr.state,
            addr.pincode
        ].filter(Boolean);
        return parts.join(', ') || 'N/A';
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            disputed: 'bg-red-100 text-red-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Properties</h1>
                    <p className="text-gray-500 mt-1">Manage and track your verified real estate assets</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate('/citizen/dashboard')}
                        className="btn-secondary h-11"
                    >
                        <span>←</span> Back
                    </button>
                    <button
                        onClick={() => navigate('/citizen/apply')}
                        className="btn-primary h-11 grow md:grow-0"
                    >
                        <span>+</span> New Registration
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="card p-12 text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                        🏠
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                    <p className="text-gray-500 mt-2 mb-8 max-w-sm mx-auto">
                        You haven't registered any properties on the blockchain yet. Start your first application today.
                    </p>
                    <button
                        onClick={() => navigate('/citizen/apply')}
                        className="btn-primary px-8"
                    >
                        Register Property
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.map((property) => (
                        <div key={property._id} className="card group">
                            {/* Card Header with ID */}
                            <div className="bg-slate-900 p-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl transform rotate-12 transition-transform group-hover:rotate-0">
                                    🏢
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Blockchain ID</p>
                                    <p className="font-mono font-bold text-white text-lg truncate">{property.propertyId}</p>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <label className="label-text">Legal Owner</label>
                                            <p className="font-bold text-gray-900">{property.ownerName}</p>
                                        </div>
                                        <div>
                                            <label className="label-text">location</label>
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                {formatAddress(property.address)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Interactive QR */}
                                    <div
                                        className="p-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group/qr overflow-hidden"
                                        onClick={() => setSelectedQr({
                                            url: `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${property.propertyId}`,
                                            id: property.propertyId
                                        })}
                                    >
                                        <div className="relative">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/public/qr/${property.propertyId}`}
                                                alt="QR"
                                                className="w-14 h-14"
                                            />
                                            <div className="absolute inset-0 bg-blue-600/0 group-hover/qr:bg-blue-600/5 transition-colors"></div>
                                        </div>
                                        <p className="text-[8px] font-bold text-blue-600 mt-1 text-center opacity-0 group-hover/qr:opacity-100 transition-opacity">ENLARGE</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                    <div>
                                        <label className="label-text">Total Area</label>
                                        <p className="font-bold text-sm text-gray-900">{property.areaSqft?.toLocaleString()} <span className="text-gray-400 font-medium">sqft</span></p>
                                    </div>
                                    <div>
                                        <label className="label-text">Market Value</label>
                                        <div className="flex items-center gap-1 font-bold text-sm text-gray-900">
                                            <span className="text-emerald-600">₹</span>
                                            {property.value?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={`${property.status === 'approved' ? 'badge-success' :
                                        property.status === 'disputed' ? 'badge-danger' : 'badge-warning'
                                        }`}>
                                        {property.status}
                                    </span>

                                    {property.blockchainTx?.txHash && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            BLOCKCHAIN VERIFIED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <QRModal
                isOpen={!!selectedQr}
                onClose={() => setSelectedQr(null)}
                qrUrl={selectedQr?.url}
                propertyId={selectedQr?.id}
            />
        </div>
    );
};

export default MyProperties;
