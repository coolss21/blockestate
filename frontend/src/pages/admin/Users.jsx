// pages/admin/Users.jsx - Complete user management page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'citizen' });
    const [creating, setCreating] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, pagination.page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let url = `/admin/users?page=${pagination.page}&limit=50`;
            if (roleFilter) url += `&role=${roleFilter}`;
            const response = await apiClient.get(url);
            setUsers(response.data.users || []);
            setPagination({
                page: response.data.page || 1,
                totalPages: response.data.totalPages || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId) => {
        if (!window.confirm('Verify this user?')) return;
        try {
            await apiClient.patch(`/admin/users/${userId}/verify`);
            fetchUsers();
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to ${newRole}?`)) return;
        try {
            await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (error) {
            console.error('Role update failed:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error('Deletion failed:', error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await apiClient.post('/admin/users', newUser);
            setShowCreateModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'citizen' });
            fetchUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Professional Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic opacity-90">User Governance</h1>
                        <p className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.3em] mt-0.5">Identity Registry & Privilege Controller</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="btn-secondary h-11 px-6 text-[10px] font-black uppercase tracking-widest border-2"
                        >
                            <span>←</span> System Command
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary h-11 px-8 bg-cyan-700 border-cyan-700 hover:bg-cyan-900 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20"
                        >
                            + Initialize Identity
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Advanced Search & Filtering Command Bar */}
                <div className="card p-6 mb-10 bg-slate-900 border-0 shadow-2xl shadow-cyan-900/10 flex flex-col md:flex-row gap-6 ring-1 ring-white/10 rounded-[2rem]">
                    <div className="relative flex-1 group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">🔍</div>
                        <input
                            type="text"
                            placeholder="Query by name, email or blockchain signature..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm font-bold text-white placeholder-slate-500 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-72 relative group">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-black text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="" className="bg-slate-900">All Privileges</option>
                            <option value="citizen" className="bg-slate-900">Citizen Tier</option>
                            <option value="registrar" className="bg-slate-900">Administrative</option>
                            <option value="court" className="bg-slate-900">Judicial</option>
                            <option value="admin" className="bg-slate-900">Root Architect</option>
                        </select>
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none group-hover:scale-125 transition-transform">▼</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-16 h-16 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Querying Global Identity Persistence...</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden border-0 shadow-2xl shadow-slate-900/5 bg-white rounded-[2.5rem]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identified Participant</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Credentials</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Privilege Tier</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Verification Status</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Override Protocols</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{u.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {u._id.slice(-10).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <p className="text-sm font-black text-slate-600 font-mono italic">{u.email}</p>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="relative group/sel">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                                                        className={`pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 cursor-pointer focus:ring-8 focus:ring-slate-500/5 shadow-sm transition-all appearance-none ${u.role === 'admin' ? 'bg-slate-900 border-slate-900 text-white' :
                                                            u.role === 'registrar' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                                                u.role === 'court' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                                                            }`}
                                                    >
                                                        <option value="citizen">Citizen</option>
                                                        <option value="registrar">Registrar</option>
                                                        <option value="court">Court</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 text-[8px] pointer-events-none group-hover/sel:scale-125 transition-transform">▼</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${u.verified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${u.verified ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {u.verified ? 'Authenticated' : 'Unverified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!u.verified && (
                                                        <button
                                                            onClick={() => handleVerify(u._id)}
                                                            className="h-10 px-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                                        >
                                                            Auth_Verify
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(u._id)}
                                                        className="h-10 px-5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                                    >
                                                        Suspend
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-8 mt-16 bg-white p-6 rounded-[2rem] shadow-2xl shadow-slate-900/5 w-fit mx-auto ring-1 ring-slate-100">
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-cyan-50 hover:text-cyan-600 disabled:opacity-30 transition-all border border-slate-100"
                        >
                            ←
                        </button>
                        <div className="px-6 flex flex-col items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Identity Ledger</p>
                            <p className="text-sm font-black text-slate-900">{pagination.page} / {pagination.totalPages}</p>
                        </div>
                        <button
                            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-cyan-50 hover:text-cyan-600 disabled:opacity-30 transition-all border border-slate-100"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>

            {/* Authorization Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowCreateModal(false)}></div>
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="px-12 py-10 bg-slate-900 text-white relative">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-8xl font-black italic rotate-12">ROOT</div>
                            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-3 font-mono">Authorization Protocol</h3>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Initialize Global Identity</h2>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-12 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Legal Designation</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                    placeholder="SYNCHRONIZED_ENTITY_NAME"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm font-black text-slate-900 placeholder:text-slate-300 placeholder:italic focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all uppercase tracking-widest"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Digital Identifier</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                        placeholder="ops@system.io"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm font-black text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Access Token</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm font-black text-slate-900 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Authority Delegation</label>
                                <div className="relative group">
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm font-black text-slate-900 focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                                    >
                                        <option value="citizen">Public Citizen Tier</option>
                                        <option value="registrar">Administrative Registrar</option>
                                        <option value="court">High-Court Judicial</option>
                                        <option value="admin">System Architecture Root</option>
                                    </select>
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-600 pointer-events-none group-hover:scale-125 transition-transform">▼</span>
                                </div>
                            </div>

                            <div className="flex gap-6 mt-12 pt-8 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-rose-600 transition-colors italic underline decoration-transparent hover:decoration-rose-600 underline-offset-8"
                                >
                                    Abandon
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 btn-primary h-16 bg-cyan-700 border-cyan-700 hover:bg-cyan-900 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-cyan-900/40 active:scale-95 transition-all"
                                >
                                    {creating ? 'Synchronizing...' : 'Authorize Identify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
