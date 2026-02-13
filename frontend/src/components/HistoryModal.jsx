import { useState, useEffect } from 'react';
import apiClient from '../config/api';

const HistoryModal = ({ propertyId, isOpen, onClose }) => {
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && propertyId) {
            fetchHistory();
        }
    }, [isOpen, propertyId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get(`/property/timeline/${propertyId}`);
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to fetch property history:', err);
            setError('Failed to load property history. Please check if the property ID is correct.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getEventIcon = (label) => {
        switch (label) {
            case 'PropertyRegistered': return '🏠';
            case 'TransferInitiated': return '📤';
            case 'TransferFinalized': return '🤝';
            case 'DisputeFlagged': return '⚠️';
            case 'DisputeCleared': return '✅';
            default: return '📄';
        }
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return 'text-red-600 bg-red-50';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50';
            case 'LOW': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Property History</h2>
                        <p className="text-xs text-gray-500 mt-1 font-mono">{propertyId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-500 text-sm font-medium">Authenticating blockchain records...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                            <div className="text-4xl mb-4">⚠️</div>
                            <h3 className="text-lg font-bold text-red-900 mb-2">Registry Access Error</h3>
                            <p className="text-red-600 text-sm mb-6">{error}</p>
                            <button
                                onClick={fetchHistory}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : !history ? (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-bold text-gray-900">No History Found</h3>
                            <p className="text-gray-500 text-sm mt-2">This property hasn't generated any blockchain events yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Score & Risk Summary */}
                            <div className="flex gap-4 mb-8">
                                <div className="flex-1 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Audit Score</div>
                                    <div className="text-2xl font-black text-blue-900">{history.score ?? 'N/A'}/100</div>
                                </div>
                                <div className={`flex-1 p-4 rounded-2xl border ${getRiskColor(history.risk)}`}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1">Risk Profile</div>
                                    <div className="text-2xl font-black">{history.risk || 'UNKNOWN'} RISK</div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="relative pl-8 border-l-2 border-gray-100 ml-4 space-y-8">
                                {history.events && history.events.length > 0 ? (
                                    history.events.map((event, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Icon Dot */}
                                            <div className="absolute -left-[2.35rem] top-0 h-8 w-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-sm shadow-sm ring-4 ring-white">
                                                {getEventIcon(event.label)}
                                            </div>

                                            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">{event.label}</h4>
                                                    <span className="text-[10px] text-gray-400 font-mono">Block #{event.blockNumber}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    {event.args && Object.entries(event.args).map(([key, val]) => (
                                                        <div key={key} className="flex gap-2 text-xs">
                                                            <span className="text-gray-500 font-medium w-24 flex-shrink-0">{key}:</span>
                                                            <span className="text-gray-800 break-all font-mono">{String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                                    <a
                                                        href={`#tx/${event.txHash}`}
                                                        className="text-[10px] text-blue-600 hover:underline font-mono truncate max-w-full md:max-w-[200px]"
                                                        title={event.txHash}
                                                    >
                                                        Tx: {event.txHash?.substring(0, 24)}...
                                                    </a>
                                                    {event.args?.timestamp && (
                                                        <span className="text-[10px] text-gray-400 italic">
                                                            {new Date(Number(event.args.timestamp) * 1000).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 text-sm italic py-4">No recent events cataloged.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg"
                    >
                        Close Registry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
