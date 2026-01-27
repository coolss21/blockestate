// pages/registrar/ApplicationDetails.jsx - Complete application review page
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const ApplicationDetails = () => {
    const { id } = useParams(); // This is the appId (APP-xxx) not MongoDB _id
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            // Backend expects appId (APP-xxx format)
            const response = await apiClient.get(`/registrar/application/${id}`);
            setApplication(response.data.application);
        } catch (error) {
            console.error('Failed to load application:', error);
            setError('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!window.confirm('Are you sure you want to approve and register this property on the blockchain?')) return;

        setProcessing(true);
        try {
            const response = await apiClient.post(`/registrar/application/${application.appId || application._id}/approve`);
            alert(`Application Approved!\n\nProperty ID: ${response.data.property?.propertyId}\nTransaction: ${response.data.property?.txHash || 'Pending'}`);
            navigate('/registrar/inbox');
        } catch (error) {
            alert('Approval failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);
        try {
            await apiClient.post(`/registrar/application/${application.appId || application._id}/reject`, {
                reason: rejectionReason
            });
            alert('Application Rejected');
            navigate('/registrar/inbox');
        } catch (error) {
            alert('Rejection failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-700">{error || 'Application not found'}</p>
                    <button
                        onClick={() => navigate('/registrar/inbox')}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        ← Back to Inbox
                    </button>
                </div>
            </div>
        );
    }

    const { propertyDraft, applicantId, type, status, documents, appId, createdAt } = application;

    // Format address for display matching the schema
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

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* High-Authority Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/registrar/inbox')}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all group"
                        >
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span> Return
                            </span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Docket Audit</h1>
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] mt-0.5">Asset Registration Protocol</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-900 px-5 py-2.5 rounded-2xl shadow-xl shadow-slate-900/10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State:</p>
                        <span className={`badge-${status === 'pending' ? 'warning' : status === 'approved' ? 'success' : 'danger'} scale-90`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Audit Console */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="card overflow-hidden border-0 shadow-2xl shadow-blue-900/5 bg-white ring-1 ring-slate-100">
                            <div className="px-10 py-8 bg-slate-900 text-white flex justify-between items-end relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                                    <span className="text-9xl">🏛️</span>
                                </div>
                                <div className="relative z-10">
                                    <h1 className="text-4xl font-black tracking-tighter uppercase italic opacity-90 leading-none">{appId}</h1>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mt-4">Blockchain Asset Payload</p>
                                </div>
                                <div className="text-right relative z-10">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filing Chronology</p>
                                    <p className="text-sm font-black italic">{new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </div>

                            <div className="p-10">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                    <span className="w-8 h-px bg-slate-200"></span>
                                    Asset Property Profile
                                    <span className="w-8 h-px bg-slate-200"></span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Classification</label>
                                        <p className="text-lg font-black text-slate-900 tracking-tight italic">
                                            {type === 'issue' ? 'New Registration' : 'Title Transfer'}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Declared Authority</label>
                                        <p className="text-lg font-black text-slate-900 tracking-tight italic">{propertyDraft?.ownerName || 'PENDING_IDENTITY'}</p>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Geospatial Locus</label>
                                        <p className="text-lg font-bold text-slate-600 leading-relaxed italic">{formatAddress(propertyDraft?.address)}</p>
                                    </div>
                                    <div className="space-y-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group hover:bg-slate-900 transition-all duration-300">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Surface Area Matrix</label>
                                        <p className="text-3xl font-black text-slate-900 group-hover:text-white transition-colors">{propertyDraft?.areaSqft?.toLocaleString() || '0'} <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">SQFT</span></p>
                                    </div>
                                    <div className="space-y-2 p-6 bg-blue-50 rounded-3xl border border-blue-100 shadow-inner group hover:bg-blue-600 transition-all duration-300">
                                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest group-hover:text-blue-100 transition-colors">Forensic Fiscal Valuation</label>
                                        <p className="text-3xl font-black text-blue-700 group-hover:text-white transition-colors">₹{propertyDraft?.value?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicant Information Card */}
                        <div className="card p-10 bg-white border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                <span className="w-8 h-px bg-slate-200"></span>
                                Digital Identity Profile
                                <span className="w-8 h-px bg-slate-200"></span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Legal Title</label>
                                    <p className="text-sm font-black text-slate-900 uppercase italic">{applicantId?.name || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Verified Channel</label>
                                    <p className="text-sm font-black text-blue-600 lowercase tracking-tight">{applicantId?.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">On-Chain Signature</label>
                                    <p className="text-[9px] font-mono font-black text-slate-500 truncate bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner">
                                        {applicantId?.walletAddress || 'IDENTITY_NOT_LINKED'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Documents & Actions */}
                    <div className="space-y-10">
                        <div className="card p-10 bg-slate-900 border-0 shadow-2xl shadow-slate-900/20 ring-1 ring-white/10">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                Evidence Dossier
                            </h3>
                            {documents && documents.length > 0 ? (
                                <ul className="space-y-4">
                                    {documents.map((doc, idx) => (
                                        <li key={idx} className="group flex flex-col p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                        📄
                                                    </div>
                                                    <div className="max-w-[120px]">
                                                        <p className="text-xs font-black text-white truncate" title={doc.fileName}>{doc.fileName || `DOC-0${idx + 1}`}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.fileType} • {(doc.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                {doc.ipfsCID && (
                                                    <a
                                                        href={`https://gateway.pinata.cloud/ipfs/${doc.ipfsCID}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all"
                                                    >
                                                        <span className="text-sm">↗</span>
                                                    </a>
                                                )}
                                            </div>
                                            {doc.ipfsCID ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                                    <p className="text-[9px] font-mono text-emerald-400 truncate opacity-60">CID: {doc.ipfsCID}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span>
                                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic animate-pulse">Synchronizing Segment...</p>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                                    <div className="text-4xl mb-4 opacity-20">📂</div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Zero Evidence Found</p>
                                </div>
                            )}

                            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 leading-relaxed italic flex gap-3">
                                    <span className="text-blue-500">🔒</span>
                                    Registry Hash Guard: All materials are cryptographically sealed upon authorization.
                                </p>
                            </div>
                        </div>

                        {/* Registry Authority Decisions */}
                        {status === 'pending' && (
                            <div className="card p-10 bg-white border-0 shadow-2xl shadow-blue-900/10 ring-1 ring-blue-50">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-8 text-center italic">Administrative Authority</h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="w-full btn-primary h-16 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/20 bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                                    >
                                        {processing ? 'Signing Ledger...' : 'Commit to Blockchain'}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={processing}
                                        className="w-full btn-secondary h-12 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 hover:bg-rose-50 hover:border-rose-100 border-2"
                                    >
                                        Deny Registration
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'rejected' && application.review && (
                            <div className="card p-10 bg-rose-50/50 border-0 ring-1 ring-rose-100 shadow-xl shadow-rose-900/5">
                                <h3 className="text-[10px] font-black text-rose-900 uppercase tracking-[0.4em] mb-6 italic text-center">Rejection Notice</h3>
                                <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-inner">
                                    <p className="text-sm text-rose-700 font-black italic leading-relaxed">
                                        "{application.review.comment || 'No administrative commentary provided.'}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Elite Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowRejectModal(false)}></div>
                    <div className="relative bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 mx-auto shadow-inner">
                            🚫
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 text-center tracking-tighter uppercase italic mb-4">Deny Authorization</h3>
                        <p className="text-sm text-slate-500 text-center font-medium italic mb-10 max-w-sm mx-auto">
                            Provide a formal administrative rationale for the denial of this asset submission.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full bg-slate-50 border-slate-100 border-2 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:bg-white transition-all outline-none italic"
                            placeholder="State administrative deficiency or legal concern..."
                            rows="5"
                        />
                        <div className="flex gap-6 mt-12">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 btn-secondary h-14 text-[10px] font-black uppercase tracking-widest border-2"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing}
                                className="flex-1 btn-primary h-14 text-[10px] font-black uppercase tracking-widest bg-rose-600 border-rose-600 shadow-2xl shadow-rose-900/20 hover:bg-rose-700"
                            >
                                {processing ? 'EXC...' : 'Issue Denial'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationDetails;
