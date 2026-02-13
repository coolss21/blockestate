// pages/citizen/Apply.jsx - Complete property application form
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Apply = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'issue',
        ownerName: '',
        line1: '',
        line2: '',
        district: '',
        state: '',
        pincode: '',
        areaSqft: '',
        value: '',
        reason: '',
        notes: ''
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('type', formData.type);
            data.append('ownerName', formData.ownerName);

            const addressObj = {
                line1: formData.line1,
                line2: formData.line2,
                district: formData.district,
                state: formData.state,
                pincode: formData.pincode
            };
            data.append('address', JSON.stringify(addressObj));

            data.append('areaSqft', formData.areaSqft);
            data.append('value', formData.value);
            data.append('reason', formData.reason);
            data.append('notes', formData.notes);

            files.forEach(file => {
                data.append('documents', file);
            });

            await apiClient.post('/citizen/apply', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/citizen/applications');
        } catch (err) {
            console.error('Application failed:', err);
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Registry Initiation</h1>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-0.5">Asset Digitalization Protocol</p>
                    </div>
                    <button
                        onClick={() => navigate('/citizen/dashboard')}
                        className="btn-secondary h-10 px-6 font-black text-[10px] uppercase tracking-widest border-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-mono"
                    >
                        <span>←</span> Cancel Filing
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="card shadow-2xl shadow-indigo-900/5 bg-white border-0 overflow-hidden relative isolate">
                    {/* Progress Indicator Decorative */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 flex">
                        <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: '25%' }}></div>
                    </div>

                    <div className="px-10 py-12 border-b border-slate-50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-600/20">🛡️</div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">New Record Declaration</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] max-w-xl leading-relaxed">
                            Formulating a new sovereign asset record for commit to the BlockEstate distributed ledger. All fields must be verified against legal deeds.
                        </p>
                    </div>

                    {error && (
                        <div className="mx-10 mt-8 p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-4 text-rose-700 animate-in fade-in slide-in-from-top-4">
                            <span className="text-2xl">🚫</span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Declaration Error</p>
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-10 space-y-16">
                        {/* Section 1: Intent */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full flex items-center justify-center">01</span>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Intent Classification</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <label className={`relative flex items-center p-6 border-2 rounded-3xl cursor-pointer transition-all ${formData.type === 'issue' ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-600/10' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="issue"
                                        checked={formData.type === 'issue'}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-5">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Primary Issuance</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Initial Asset Digitalization</p>
                                    </div>
                                </label>
                                <label className={`relative flex items-center p-6 border-2 rounded-3xl cursor-pointer transition-all ${formData.type === 'transfer' ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-600/10' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="transfer"
                                        checked={formData.type === 'transfer'}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-5">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Registry Transfer</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ownership Re-assignment</p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        {/* Section 2: Proprietor & Locus */}
                        <section className="space-y-8 pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full flex items-center justify-center">02</span>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Proprietor & Geospatial Locus</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Legal Holder Full Name</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        placeholder="EXACTLY AS PER GOVERNMENT DEED"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-8 text-sm font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic uppercase placeholder:not-italic placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Site Address</label>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                name="line1"
                                                value={formData.line1}
                                                onChange={handleChange}
                                                placeholder="Primary Street / Building Reference"
                                                required
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-8 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic placeholder:not-italic"
                                            />
                                            <input
                                                type="text"
                                                name="line2"
                                                value={formData.line2}
                                                onChange={handleChange}
                                                placeholder="Secondary / Landmark Reference (Optional)"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-8 text-sm font-bold text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic placeholder:not-italic"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <input
                                                    type="text"
                                                    name="district"
                                                    value={formData.district}
                                                    onChange={handleChange}
                                                    placeholder="DISTRICT"
                                                    required
                                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-black uppercase text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                />
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    placeholder="STATE"
                                                    required
                                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-black uppercase text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                />
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    placeholder="POSTAL CODE"
                                                    required
                                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-xs font-black uppercase text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Asset Specifics */}
                        <section className="space-y-8 pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full flex items-center justify-center">03</span>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Technical & Valuation Matrix</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Surveyed Area Matrix</label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            name="areaSqft"
                                            value={formData.areaSqft}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 px-8 text-lg font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm group-focus-within:text-indigo-600 transition-colors">SQ_FT</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Market Valuation Assessment</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xl">₹</span>
                                        <input
                                            type="number"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-5 pl-14 pr-8 text-lg font-black text-slate-900 shadow-inner focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Acquisition Reason</label>
                                    <input
                                        type="text"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        placeholder="e.g., INHERITANCE, PURCHASE, GRANT"
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic uppercase placeholder:not-italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registry Administrative Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="1"
                                        placeholder="INTERNAL REFERENCE OR CLARIFICATIONS"
                                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none italic uppercase placeholder:not-italic resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Evidence */}
                        <section className="space-y-8 pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <span className="w-6 h-6 bg-slate-100 text-[10px] font-black text-slate-400 rounded-full flex items-center justify-center">04</span>
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Evidentiary Attachment Protocol</h3>
                            </div>

                            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center hover:border-indigo-400 hover:bg-slate-50/50 transition-all group relative cursor-pointer">
                                <input
                                    type="file"
                                    id="file-upload"
                                    name="documents"
                                    onChange={handleFileChange}
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="relative z-0">
                                    <div className="w-20 h-20 bg-white shadow-2xl shadow-indigo-900/10 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        📄
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Submit Legal Evidence</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">Property Deeds, Survey Maps, or Notary Affirmations</p>
                                    <div className="mt-8 flex justify-center gap-3">
                                        {['PDF', 'JPG', 'PNG'].map(ext => (
                                            <span key={ext} className="px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 tracking-[0.2em] shadow-sm">{ext}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="bg-indigo-900 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-8 duration-500">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📋</div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight italic">{files.length} BUNDLED_ASSETS_DETECTED</p>
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-0.5">Ready for Cryptographic Indexing</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFiles([])}
                                        className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-[0.3em] font-mono px-6 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-center w-full sm:w-auto"
                                    >
                                        RESET_FILES
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Actions */}
                        <div className="pt-16 flex flex-col sm:flex-row justify-end items-center gap-10 border-t-2 border-slate-50">
                            <button
                                type="button"
                                onClick={() => navigate('/citizen/dashboard')}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-slate-900 transition-colors"
                            >
                                Abandon Declaration
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto btn-primary h-20 px-16 text-[10px] font-black uppercase tracking-[0.3em] bg-slate-900 border-slate-900 shadow-2xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-6">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>COMMITTING...</span>
                                    </div>
                                ) : 'SUBMIT_TO_REGISTRY'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center pb-20">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic mb-4">Official BlockEstate Sovereign Utility</p>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default Apply;
