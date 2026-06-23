import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    LayoutDashboard,
    BookOpen,
    Brain,
    Calendar,
    Video,
    FileText,
    Trophy,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import logo from "../assets/novara-logo.png";

function Sidebar({ isOpen, setIsOpen, collapsed, setCollapsed }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Preparation Hub", path: "/preparation", icon: BookOpen },
        { name: "AI Career Coach", path: "/chatbot", icon: Brain },
        { name: "Study Planner", path: "/study-plan", icon: Calendar },
        { name: "Mock Interview", path: "/create-interview", icon: Video },
        { name: "Resume Intelligence", path: "/resume-intelligence", icon: FileText },
        { name: "Leaderboard", path: "/analytics", icon: Trophy },
        { name: "Profile", path: "/profile", icon: User },
    ];

    const isActive = (itemPath) => {
        if (itemPath === "/profile#settings") {
            return location.pathname === "/profile" && location.hash === "#settings";
        }
        if (itemPath === "/profile") {
            return location.pathname === "/profile" && location.hash !== "#settings";
        }
        return location.pathname === itemPath;
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        if (setIsOpen) setIsOpen(false);
    };

    return (
        <>
            {/* Desktop Sidebar: hidden on mobile */}
            <aside
                className={`hidden lg:flex flex-col h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 select-none z-40 transition-all duration-300 ${collapsed ? "w-20" : "w-[260px]"
                    }`}
            >
                {/* Logo Section */}
                <div className="h-[72px] px-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between relative">
                    {!collapsed ? (
                        <div className="flex flex-col">
                            <Link to="/dashboard" className="flex items-center gap-2 group">
                                <img
                                    src={logo}
                                    alt="Praveen Tech"
                                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
                                />
                            </Link>
                            <span className="text-[9px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                                Prepare • Practice • Perform
                            </span>
                        </div>
                    ) : (
                        <Link to="/dashboard" className="mx-auto">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-600/20">
                                N
                            </div>
                        </Link>
                    )}

                    {/* Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-105 transition-colors shadow-sm z-50"
                    >
                        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${active
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    }`}
                            >
                                <Icon
                                    className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400"
                                        }`}
                                />
                                {!collapsed && <span className="truncate">{item.name}</span>}

                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Profile / Settings */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-1">
                    <Link
                        to="/profile#settings"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive("/profile#settings")
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                    >
                        <Settings className={`w-4.5 h-4.5 shrink-0 ${isActive("/profile#settings") ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400"}`} />
                        {!collapsed && <span>Settings</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                                Settings
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all duration-200 group relative"
                    >
                        <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-400 dark:text-rose-500 group-hover:text-rose-500 transition-transform duration-200 group-hover:translate-x-0.5" />
                        {!collapsed && <span>Logout</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-950 text-white text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Mobile/Tablet Drawer Sidebar */}
            <div
                className={`fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={`fixed top-0 left-0 h-full w-[260px] bg-white dark:bg-slate-800 shadow-2xl border-r border-slate-200 dark:border-slate-700 z-50 transition-transform duration-300 ease-out lg:hidden flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="h-[72px] px-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex flex-col">
                        <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                            <img src={logo} alt="Praveen Tech" className="h-8 w-auto object-contain" />
                        </Link>
                        <span className="text-[9px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                            Prepare • Practice • Perform
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-50/40 dark:hover:bg-indigo-950/20"
                                    }`}
                            >
                                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400"}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <Link
                        to="/profile#settings"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive("/profile#settings")
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-50/40 dark:hover:bg-indigo-950/20"
                            }`}
                    >
                        <Settings className={`w-4.5 h-4.5 shrink-0 ${isActive("/profile#settings") ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400"}`} />
                        <span>Settings</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all duration-200 group"
                    >
                        <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-400 dark:text-rose-500" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
