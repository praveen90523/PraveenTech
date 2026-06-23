import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import axios from "axios";
import logo from "../assets/novara-logo.png";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Fetch notifications periodically (every 30s)
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        // Close notification tray on click outside
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
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
                "http://localhost:5000/api/analytics/notifications",
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
                `http://localhost:5000/api/analytics/notifications/${nId}`,
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
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2"
                    >
                        <img src={logo} alt="Praveen Tech" className="h-8 w-auto object-contain" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-6">

                        <Link
                            to="/dashboard"
                            className={`text-sm font-bold transition-colors ${isActive("/dashboard") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/preparation"
                            className={`text-sm font-bold transition-colors ${isActive("/preparation") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Prep Hub
                        </Link>

                        <Link
                            to="/chatbot"
                            className={`text-sm font-bold transition-colors ${isActive("/chatbot") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            AI Coach
                        </Link>

                        <Link
                            to="/study-plan"
                            className={`text-sm font-bold transition-colors ${isActive("/study-plan") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Planner
                        </Link>

                        <Link
                            to="/create-interview"
                            className={`text-sm font-bold transition-colors ${isActive("/create-interview") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Mock Interview
                        </Link>

                        <Link
                            to="/resume-intelligence"
                            className={`text-sm font-bold transition-colors ${isActive("/resume-intelligence") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Resume
                        </Link>

                        <Link
                            to="/analytics"
                            className={`text-sm font-bold transition-colors ${isActive("/analytics") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Leaderboard
                        </Link>

                        <Link
                            to="/profile"
                            className={`text-sm font-bold transition-colors ${isActive("/profile") ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                                }`}
                        >
                            Profile
                        </Link>

                        {/* Admin link if user is administrator */}
                        {user?.role === "admin" && (
                            <Link
                                to="/admin/dashboard"
                                className={`text-sm font-black transition-colors ${isActive("/admin/dashboard") ? "text-red-600" : "text-red-500 hover:text-red-700"
                                    }`}
                            >
                                Admin Controls
                            </Link>
                        )}

                        <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
                            {/* Dark Mode Toggle */}
                            <ThemeToggle />
                            {/* Notification Bell Icon Dropdown */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative text-gray-400 hover:text-gray-600 w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center transition focus:outline-none"
                                >
                                    <i className="bi bi-bell-fill text-lg"></i>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white font-extrabold animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Menu list */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                                        <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <span className="font-extrabold text-xs text-gray-800">NOTIFICATIONS</span>
                                            {unreadCount > 0 && (
                                                <span className="bg-indigo-50 text-indigo-600 font-bold text-[9px] px-2 py-0.5 rounded-full">
                                                    {unreadCount} Unread
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/50">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-xs text-gray-400 italic">
                                                    No notifications.
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        onClick={() => handleMarkAsRead(n._id)}
                                                        className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${!n.isRead ? "bg-indigo-50/20 font-medium" : "text-gray-500"
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-bold text-gray-800">{n.title}</span>
                                                            {!n.isRead && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1"></span>
                                                            )}
                                                        </div>
                                                        <p className="leading-snug">{n.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden text-gray-700 w-9 h-9 hover:bg-slate-50 rounded-xl flex items-center justify-center text-xl"
                    >
                        ☰
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden pb-4 pt-2 border-t border-slate-50 space-y-1">
                        <Link
                            to="/dashboard"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/dashboard") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/preparation"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/preparation") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Prep Hub
                        </Link>
                        <Link
                            to="/chatbot"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/chatbot") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            AI Coach
                        </Link>
                        <Link
                            to="/study-plan"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/study-plan") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Planner
                        </Link>
                        <Link
                            to="/create-interview"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/create-interview") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Mock Interview
                        </Link>
                        <Link
                            to="/resume-intelligence"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/resume-intelligence") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Resume
                        </Link>
                        <Link
                            to="/analytics"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/analytics") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Leaderboard
                        </Link>
                        <Link
                            to="/profile"
                            className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/profile") ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
                            onClick={() => setIsOpen(false)}
                        >
                            Profile
                        </Link>

                        {user?.role === "admin" && (
                            <Link
                                to="/admin/dashboard"
                                className={`block py-2 px-3 rounded-xl text-sm font-bold ${isActive("/admin/dashboard") ? "bg-red-50 text-red-600" : "text-red-500"}`}
                                onClick={() => setIsOpen(false)}
                            >
                                Admin Controls
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl mt-4"
                        >
                            Logout
                        </button>
                       
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;