// pages/admin/SystemConfig.jsx - Complete system configuration page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const SystemConfig = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        configData: {
            maxFileSize: 10,
            allowedFileTypes: ['pdf', 'jpg', 'png'],
            requireDocumentHash: true,
            autoVerifyUsers: false,
            blockchainEnabled: true
        }
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get('/admin/config');
            const cfg = response.data.config;
            if (cfg) {
                setConfig(cfg);
                setFormData({
                    name: cfg.name || '',
                    location: cfg.location || '',
                    configData: {
                        maxFileSize: cfg.configData?.maxFileSize || 10,
                        allowedFileTypes: cfg.configData?.allowedFileTypes || ['pdf', 'jpg', 'png'],
                        requireDocumentHash: cfg.configData?.requireDocumentHash ?? true,
                        autoVerifyUsers: cfg.configData?.autoVerifyUsers ?? false,
                        blockchainEnabled: cfg.configData?.blockchainEnabled ?? true
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiClient.put('/admin/config', formData);
            fetchConfig();
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding Architecture Persistence...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Master Configuration Hub</h1>
                        <p className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.3em] mt-0.5">Architecture & Protocol Governance</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                    >
                        <span>←</span> System Command
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSave} className="space-y-10">
                    {/* Office Authority Persistence */}
                    <div className="card bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[2.5rem] overflow-hidden">
                        <div className="bg-slate-900 text-white px-10 py-8 relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-7xl font-black italic">ROOT</div>
                            <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2 font-mono italic">Registry_Identification</h2>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Office Authority Profile</h3>
                        </div>
                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Universal Registry Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all uppercase tracking-widest"
                                    placeholder="e.g., CENTRAL_DISTRICT_LAND_ORACLE"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Spatial Jurisdiction (Location)</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all uppercase tracking-widest"
                                    placeholder="e.g., SECTOR_7_METROPOLIS"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Evidentiary Document Protocols */}
                        <div className="card p-10 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[2.5rem]">
                            <h3 className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.4em] mb-8 font-mono italic">Document_Persistence</h3>
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Payload Constraint (MB)</label>
                                        <span className="text-[9px] font-black text-cyan-600 bg-cyan-50 px-2 py-1 rounded-lg">MAX_50_MB</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.configData.maxFileSize}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            configData: { ...formData.configData, maxFileSize: parseInt(e.target.value) }
                                        })}
                                        min="1"
                                        max="50"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-black text-slate-900 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="requireHash" className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer">Hash Integrity Enforcement</label>
                                        <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300">
                                            <input
                                                type="checkbox"
                                                id="requireHash"
                                                checked={formData.configData.requireDocumentHash}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    configData: { ...formData.configData, requireDocumentHash: e.target.checked }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 italic">Forces bitwise validation of all uploaded evidentiary payloads.</p>
                                </div>
                            </div>
                        </div>

                        {/* System Identity & Oracle Settings */}
                        <div className="card p-10 bg-white border-0 shadow-2xl shadow-slate-900/5 rounded-[2.5rem]">
                            <h3 className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.4em] mb-8 font-mono italic">Kernel_Behavior</h3>
                            <div className="space-y-8">
                                {[
                                    { id: 'autoVerify', label: 'Autonomous Identity Verification', field: 'autoVerifyUsers', desc: 'Instantly authorize new participants without manual synchronization.' },
                                    { id: 'blockchain', label: 'Ledger Persistence Protocol', field: 'blockchainEnabled', desc: 'Mandates end-to-end blockchain synchronization for all registrations.' }
                                ].map((sys) => (
                                    <div key={sys.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor={sys.id} className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer">{sys.label}</label>
                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id={sys.id}
                                                    checked={formData.configData[sys.field]}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        configData: { ...formData.configData, [sys.field]: e.target.checked }
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                                            </div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 italic">{sys.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Blockchain Oracle Persistence Telemetry */}
                    <div className="card p-10 bg-slate-100/50 border-2 border-slate-200 border-dashed rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-8xl font-black italic rotate-12 grayscale group-hover:grayscale-0 transition-all duration-1000">LINK</div>
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-6">Blockchain Oracle Persistence</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Active Network', val: 'Hardhat Local Sovereign', icon: '🌐' },
                                { label: 'Contract Pointer', val: import.meta.env.VITE_CONTRACT_ADDRESS?.slice(0, 16) + '...' || '0xB7f8...4F5e', icon: '💎' },
                                { label: 'Tunnel Status', val: 'ESTABLISHED', icon: '✅', color: 'emerald' }
                            ].map((net, i) => (
                                <div key={i} className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-200">{net.icon}</div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{net.label}</p>
                                        <p className={`text-xs font-black italic ${net.color === 'emerald' ? 'text-emerald-600' : 'text-slate-700'} tracking-tighter`}>{net.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Persistence Hub */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-10 bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/5 ring-1 ring-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-rose-600 transition-colors italic underline decoration-transparent hover:decoration-rose-600 underline-offset-8"
                        >
                            Abandon Modifications
                        </button>
                        <div className="flex gap-6 w-full sm:w-auto">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 sm:flex-none btn-primary h-16 px-12 bg-cyan-700 border-cyan-700 hover:bg-cyan-900 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-cyan-900/40 active:scale-95 transition-all"
                            >
                                {saving ? 'Synchronizing Kernel...' : 'Commit Architecture Persistence'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/users')}
                                className="flex-1 sm:flex-none btn-secondary h-16 px-10 border-2 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                            >
                                Manage Identities Next →
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-20 text-center pb-10 opacity-30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.6em] italic">System Kernel Parameters Secured by Multi-Signature Logic</p>
                </div>
            </div>
        </div>
    );
};

export default SystemConfig;
