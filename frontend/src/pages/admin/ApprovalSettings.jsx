// pages/admin/ApprovalSettings.jsx - Multi-step approval configuration
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../config/api';

const ApprovalSettings = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        enabled: true,
        requiredApprovals: 2,
        approvalType: 'parallel'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiClient.get('/admin/config/approval-settings');
            setSettings(response.data.settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await apiClient.put('/admin/config/approval-settings', settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">Approval Settings</h1>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-0.5">Multi-Step Verification Configuration</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2 font-mono"
                    >
                        <span>←</span> Dashboard
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="card bg-white shadow-2xl shadow-slate-900/5 rounded-[2.5rem] overflow-hidden border-0 ring-1 ring-slate-100">
                    <div className="bg-slate-900 text-white px-10 py-8 relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-7xl font-black italic">CONFIG</div>
                        <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2 font-mono italic">Approval_Workflow</h2>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Multi-Step Verification Settings</h3>
                    </div>

                    <div className="p-10 space-y-10">
                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <label className="font-black text-slate-900 text-lg uppercase tracking-tight italic block mb-2">
                                    Enable Multi-Step Approval
                                </label>
                                <p className="text-sm text-slate-600 italic">
                                    Require multiple registrars to approve applications before blockchain registration
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Required Approvals */}
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                            <label className="font-black text-slate-900 text-lg uppercase tracking-tight italic block mb-4">
                                Required Approvals
                            </label>
                            <select
                                value={settings.requiredApprovals}
                                onChange={(e) => setSettings({ ...settings, requiredApprovals: parseInt(e.target.value) })}
                                className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 text-lg font-black text-slate-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                disabled={!settings.enabled}
                            >
                                <option value="1">1 Approval</option>
                                <option value="2">2 Approvals</option>
                                <option value="3">3 Approvals</option>
                                <option value="4">4 Approvals</option>
                                <option value="5">5 Approvals</option>
                            </select>
                            <p className="text-sm text-slate-600 italic mt-3">
                                Number of registrars required to approve before property is registered on blockchain
                            </p>
                        </div>

                        {/* Approval Type */}
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <label className="font-black text-slate-900 text-lg uppercase tracking-tight italic block mb-4">
                                Approval Type
                            </label>
                            <div className="space-y-4">
                                <label className={`flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${settings.approvalType === 'parallel'
                                        ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-900/10'
                                        : 'bg-white border-slate-200 hover:border-blue-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        value="parallel"
                                        checked={settings.approvalType === 'parallel'}
                                        onChange={(e) => setSettings({ ...settings, approvalType: e.target.value })}
                                        disabled={!settings.enabled}
                                        className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="font-black text-slate-900 uppercase tracking-tight italic block mb-1">Parallel</span>
                                        <p className="text-sm text-slate-600 italic">
                                            Any registrar can approve; no specific order required
                                        </p>
                                    </div>
                                </label>
                                <label className={`flex items-start p-5 rounded-2xl border-2 cursor-pointer transition-all ${settings.approvalType === 'sequential'
                                        ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-900/10'
                                        : 'bg-white border-slate-200 hover:border-blue-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        value="sequential"
                                        checked={settings.approvalType === 'sequential'}
                                        onChange={(e) => setSettings({ ...settings, approvalType: e.target.value })}
                                        disabled={!settings.enabled}
                                        className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="font-black text-slate-900 uppercase tracking-tight italic block mb-1">Sequential</span>
                                        <p className="text-sm text-slate-600 italic">
                                            Approvals must follow a specific order (requires workflow setup)
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="border-t border-slate-200 pt-8">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="w-full btn-primary h-16 text-[10px] font-black uppercase tracking-widest bg-blue-600 border-blue-600 hover:bg-blue-700 shadow-2xl shadow-blue-900/20 disabled:bg-gray-400 disabled:border-gray-400"
                            >
                                {saving ? 'Saving Configuration...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalSettings;
