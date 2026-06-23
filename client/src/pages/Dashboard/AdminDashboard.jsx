import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

function AdminDashboard() {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // Broadcast notice fields
    const [broadcastTitle, setBroadcastTitle] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [broadcasting, setBroadcasting] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState("");

    // Admin prompting panel state
    const [systemPrompt, setSystemPrompt] = useState(
        "You are Praveen Tech Assistant, a helpful and encouraging AI career assistant..."
    );
    const [promptSaving, setPromptSaving] = useState(false);

    useEffect(() => {
        fetchAdminStats();
        fetchUsersList();
    }, []);

    const fetchAdminStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:5000/api/admin/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (error) {
            console.error("Fetch admin stats error:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsersList = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:5000/api/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setUsers(res.data.users || []);
            }
        } catch (error) {
            console.error("Fetch admin users list error:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleToggleRole = async (targetUserId, currentRole) => {
        const nextRole = currentRole === "admin" ? "student" : "admin";
        if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `http://localhost:5000/api/admin/users/${targetUserId}/role`,
                { role: nextRole },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setUsers(prev => prev.map(u => u._id === targetUserId ? { ...u, role: nextRole } : u));
                fetchAdminStats(); // Recalculate admin counts
            }
        } catch (error) {
            console.error("Update role error:", error);
            alert("Error updating role");
        }
    };

    const handleDeleteAccount = async (targetUserId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user account and all their prep/mock histories? This action is irreversible.")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(
                `http://localhost:5000/api/admin/users/${targetUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setUsers(prev => prev.filter(u => u._id !== targetUserId));
                fetchAdminStats();
            }
        } catch (error) {
            console.error("Delete user error:", error);
            alert("Error deleting user account");
        }
    };

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

        setBroadcasting(true);
        setBroadcastStatus("");

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/admin/broadcast",
                { title: broadcastTitle.trim(), message: broadcastMsg.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setBroadcastStatus("Broadcast sent successfully to all candidates!");
                setBroadcastTitle("");
                setBroadcastMsg("");
            }
        } catch (error) {
            console.error("Broadcast error:", error);
            setBroadcastStatus("Failed to distribute announcement.");
        } finally {
            setBroadcasting(false);
        }
    };

    return (
        <div className="w-full transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <span className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Administrator Panel
                        </span>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">Praveen Tech System Controls</h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage user profiles, review aggregate usage analytics, and configure prompt heuristics.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl transition active:scale-[0.98]"
                    >
                        Admin Logout
                    </button>
                </div>

                {/* System Metrics Stats Cards */}
                {loadingStats ? (
                    <div className="text-center py-6 text-gray-400 dark:text-slate-500">Loading system metrics...</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase block">Total Accounts</span>
                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{stats?.totalUsers}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase block">Student Users</span>
                            <span className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1 block">{stats?.totalStudents}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase block">Admin Users</span>
                            <span className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 block">{stats?.totalAdmins}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase block">Mock Tests</span>
                            <span className="text-3xl font-black text-green-600 dark:text-green-400 mt-1 block">{stats?.totalInterviews}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                            <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase block">Prep Roadmaps</span>
                            <span className="text-3xl font-black text-orange-500 dark:text-orange-450 mt-1 block">{stats?.totalPreps}</span>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* Left: Broadcast & AI Config Panels */}
                    <div className="md:col-span-1 space-y-6">
                        
                        {/* Broadcast Notification Broadcaster */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-base">
                                <i className="bi bi-megaphone text-indigo-600"></i> Broadcast Notification
                            </h3>
                            
                            <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                                {broadcastStatus && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-455">
                                        {broadcastStatus}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">Subject / Title</label>
                                    <input
                                        type="text"
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                        placeholder="e.g. Server Maintenance Notice"
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        required
                                        disabled={broadcasting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">Message Body</label>
                                    <textarea
                                        value={broadcastMsg}
                                        onChange={(e) => setBroadcastMsg(e.target.value)}
                                        placeholder="Type broadcast text here..."
                                        rows="3"
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        required
                                        disabled={broadcasting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={broadcasting || !broadcastTitle.trim() || !broadcastMsg.trim()}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                                >
                                    {broadcasting ? "Transmitting..." : "Send Announcement"}
                                </button>
                            </form>
                        </div>

                        {/* System Prompts Config Heuristics */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-extrabold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-base">
                                <i className="bi bi-sliders text-indigo-600"></i> AI Agent Parameters
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase mb-2">System AI Assistant Prompt</label>
                                    <textarea
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950"
                                        disabled={promptSaving}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        setPromptSaving(true);
                                        setTimeout(() => {
                                            setPromptSaving(false);
                                            alert("System Prompt Heuristics saved locally in context!");
                                        }, 800);
                                    }}
                                    className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white text-xs font-bold py-3 rounded-xl transition"
                                    disabled={promptSaving}
                                >
                                    {promptSaving ? "Saving Config..." : "Save AI Parameters"}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right: Active Users Administration Table */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col h-full">
                            <h3 className="font-extrabold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1.5 text-base">
                                <i className="bi bi-people text-indigo-600"></i> Candidate Database ({users.length})
                            </h3>
                            
                            {loadingUsers ? (
                                <div className="text-center py-12 text-gray-400 dark:text-slate-500">Loading active users...</div>
                            ) : (
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-805 text-xs text-gray-400 dark:text-slate-500 font-bold uppercase">
                                                <th className="py-3 px-2">Name</th>
                                                <th className="py-3 px-2">Role</th>
                                                <th className="py-3 px-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 text-sm">
                                            {users.map((u) => {
                                                const isSelf = u._id === user?._id;
                                                
                                                return (
                                                    <tr key={u._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors">
                                                        <td className="py-3.5 px-2">
                                                            <div className="font-bold text-gray-800 dark:text-slate-200">{u.name}</div>
                                                            <div className="text-[10px] text-gray-400 dark:text-slate-500">{u.email}</div>
                                                        </td>
                                                        <td className="py-3.5 px-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                                u.role === "admin" ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-405 border border-red-100 dark:border-red-900/30" : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-405 border border-indigo-100 dark:border-indigo-900/30"
                                                            }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-2 text-right space-x-1.5">
                                                            <button
                                                                onClick={() => handleToggleRole(u._id, u.role)}
                                                                disabled={isSelf}
                                                                className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition hover:shadow-sm ${
                                                                    u.role === "admin" ? "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800" : "border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25"
                                                                } disabled:opacity-30`}
                                                            >
                                                                {u.role === "admin" ? "Demote" : "Promote"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAccount(u._id)}
                                                                disabled={isSelf}
                                                                className="px-2 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-650 hover:text-white rounded-lg text-xs font-bold transition disabled:opacity-30"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;