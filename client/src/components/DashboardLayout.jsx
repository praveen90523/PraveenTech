import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import axios from "axios";
import { Bell, Menu, User, Settings, LogOut, ChevronDown, Trophy, Flame, Shield, Search } from "lucide-react";

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sidebar Mobile Open State
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    // Desktop Sidebar Collapsed State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Profile Dropdown State
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Search Query State
    const [searchQuery, setSearchQuery] = useState("");

    // Page Title resolution based on current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/dashboard") return "Dashboard";
        if (path.startsWith("/preparation")) {
            if (path.includes("/quiz")) return "Syllabus Quiz";
            return "Preparation Hub";
        }
        if (path === "/chatbot") return "AI Career Coach";
        if (path === "/study-plan") return "Study Planner";
        if (path === "/create-interview") return "Mock Interview Setup";
        if (path.startsWith("/interview")) return "Interview Session";
        if (path.startsWith("/result")) return "Interview Result Details";
        if (path === "/history") return "Interview History";
        if (path === "/resume-intelligence") return "Resume Intelligence";
        if (path === "/profile") return location.hash === "#settings" ? "Settings" : "Profile Details";
        if (path === "/analytics") return "Leaderboard & Analytics";
        if (path === "/admin/dashboard") return "Admin Dashboard";
        return "Praveen Tech SaaS Platform";
    };

    // Notification fetching & polling
    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Handle clicks outside dropdowns to close them
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const res = await axios.get(
                "https://praveentech-backend.onrender.com/api/analytics/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    };

    const handleMarkAsRead = async (nId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `https://praveentech-backend.onrender.com/api/analytics/notifications/${nId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setNotifications(prev => prev.map(n => n._id === nId ? { ...n, isRead: true } : n));
            }
        } catch (error) {
            console.error("Mark notification read error:", error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const nameInit = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
            {/* Sidebar component */}
            <Sidebar
                isOpen={mobileSidebarOpen}
                setIsOpen={setMobileSidebarOpen}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* Main Application Layout */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

                {/* Premium Glassmorphic Header Navbar */}
                <header className="h-[72px] shrink-0 border-b border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md flex items-center justify-between px-6 z-30 sticky top-0 transition-colors duration-300">

                    {/* Left: Hamburger & Dynamic Page Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-3">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                {getPageTitle()}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Actions (Search, Theme, Notifications, Profile) */}
                    <div className="flex items-center gap-4">

                        {/* Search Input bar */}
                        <div className="relative hidden md:block">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search preparation content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-60 pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>


                        {/* Notification Bell Dropdown */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative w-10 h-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                            >
                                <Bell className="w-4.5 h-4.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white font-extrabold animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Drawer */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                        <span className="font-extrabold text-[10px] text-slate-500 dark:text-slate-400 tracking-wider">NOTIFICATIONS</span>
                                        {unreadCount > 0 && (
                                            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] px-2.5 py-0.5 rounded-full">
                                                {unreadCount} Unread
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n._id}
                                                    onClick={() => handleMarkAsRead(n._id)}
                                                    className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 ${!n.isRead ? "bg-indigo-50/15 dark:bg-indigo-950/10 font-semibold" : "text-slate-500 dark:text-slate-400"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1 gap-2">
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">{n.title}</span>
                                                        {!n.isRead && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1 flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                    <p className="leading-relaxed font-normal text-slate-500 dark:text-slate-400">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                        {/* User Avatar Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none"
                            >
                                <div className="w-8.5 h-8.5 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/10 overflow-hidden shrink-0">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        nameInit
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:block max-w-[100px] truncate">
                                    {user?.name || "User"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                                    {/* User Details */}
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email}</p>

                                        {/* Stats Badges */}
                                        <div className="flex gap-2 mt-3">
                                            <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 border border-indigo-100/50 dark:border-indigo-900/30">
                                                <Trophy className="w-3 h-3" /> Lvl {user?.level || 1}
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 border border-orange-100/50 dark:border-orange-900/30">
                                                <Flame className="w-3 h-3" /> {user?.streak || 0} Streak
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu Items */}
                                    <div className="p-1 space-y-0.5">
                                        {user?.role === "admin" && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setShowProfileDropdown(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                            >
                                                <Shield className="w-4 h-4 text-rose-500 animate-pulse" />
                                                <span>Admin Controls</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/profile#settings"
                                            onClick={() => setShowProfileDropdown(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            <span>Settings</span>
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 p-1 mt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-500 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* Content Viewport with custom shadow layout */}
                <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0F172A] p-4 sm:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto h-full animate-fadeIn">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
