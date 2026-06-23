import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from "recharts";
import {
    Trophy,
    Flame,
    Clock,
    TrendingUp,
    Award,
    Star,
    Sparkles,
    Loader2,
    FileText,
    Video,
    Shield,
    TrendingDown
} from "lucide-react";

export default function Analytics() {
    const [stats, setStats] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, achRes] = await Promise.all([
                axios.get("https://praveentech-backend.onrender.com/api/analytics", { headers }),
                axios.get("https://praveentech-backend.onrender.com/api/analytics/achievements", { headers })
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
            if (achRes.data.success) {
                setAchievements(achRes.data.achievements || []);
                setLeaderboard(achRes.data.leaderboard || []);
            }
        } catch (error) {
            console.error("Fetch analytics data error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[450px] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Loading your profile stats...</span>
            </div>
        );
    }

    const s = stats?.stats || {
        totalResumes: 0,
        avgResumeScore: 0,
        totalInterviews: 0,
        completedInterviews: 0,
        avgInterviewScore: 0,
        totalPrepSessions: 0,
        avgPrepProgress: 0,
        streak: 0,
        level: 1,
        xp: 0,
        studyHours: 0
    };

    const weeklyActivity = stats?.weeklyActivity || [];
    const chartData = weeklyActivity.map((d) => ({
        name: d.day.toUpperCase(),
        actions: d.count,
    }));

    const topThree = leaderboard.slice(0, 3);
    const remainingLeaderboard = leaderboard.slice(3);

    // Reorder topThree for visual podium alignment: Rank 2 on Left, Rank 1 in Middle, Rank 3 on Right
    const podiumOrder = [];
    if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2 });
    if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1 });
    if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3 });

    const getPodiumStyles = (rank) => {
        switch (rank) {
            case 1:
                return {
                    border: "border-amber-400 dark:border-amber-500/80 shadow-amber-500/10 dark:shadow-none",
                    badge: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
                    avatarRing: "ring-amber-400 dark:ring-amber-500",
                    avatarBg: "from-amber-400 to-yellow-500 text-white",
                    icon: "👑",
                    scale: "scale-105 md:scale-110 z-10",
                    bg: "bg-white dark:bg-slate-800",
                    delay: 0.1
                };
            case 2:
                return {
                    border: "border-slate-300 dark:border-slate-700 shadow-slate-500/10 dark:shadow-none",
                    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                    avatarRing: "ring-slate-300 dark:ring-slate-600",
                    avatarBg: "from-slate-300 to-slate-500 text-white",
                    icon: "🥈",
                    scale: "scale-100 z-0 mt-6 md:mt-8",
                    bg: "bg-white dark:bg-slate-800",
                    delay: 0.2
                };
            case 3:
                return {
                    border: "border-orange-300 dark:border-orange-800/80 shadow-orange-500/10 dark:shadow-none",
                    badge: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30",
                    avatarRing: "ring-orange-300 dark:ring-orange-800",
                    avatarBg: "from-orange-400 to-orange-600 text-white",
                    icon: "🥉",
                    scale: "scale-95 z-0 mt-10 md:mt-14",
                    bg: "bg-white dark:bg-slate-800",
                    delay: 0.3
                };
            default:
                return {};
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    Leaderboard
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                    Progress & Gamification
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Review your placement readiness metrics, inspect achievements, and compare ranks on the global leaderboard.
                </p>
            </div>

            {/* Gamified Stat Summary Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 rounded-2xl text-white p-6 md:p-8 mb-8 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-3xl"></div>

                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                    <div className="relative w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl border border-white/20 shrink-0">
                        👑
                        <div className="absolute -bottom-2.5 bg-yellow-400 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full border border-indigo-700 uppercase tracking-wider">
                            Level {s.level}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black">{stats?.user?.name || "Student"}</h2>
                        <p className="text-indigo-200 text-xs mt-0.5 font-medium">Ranked candidate in Praveen Tech Placement Hub</p>

                        {/* XP Progress Bar */}
                        <div className="mt-4 w-48 sm:w-60">
                            <div className="flex justify-between text-[9px] text-indigo-150 mb-1 font-bold uppercase tracking-wider">
                                <span>XP PROGRESS</span>
                                <span>{s.xp % 100}/100 XP</span>
                            </div>
                            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${s.xp % 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                    <div className="bg-white/10 border border-white/10 rounded-xl px-5 py-3 text-center">
                        <span className="text-xl block">🔥</span>
                        <span className="text-lg font-black block mt-0.5">{s.streak} Days</span>
                        <span className="text-[9px] text-indigo-200 font-bold uppercase tracking-wider">Daily Streak</span>
                    </div>
                    <div className="bg-white/10 border border-white/10 rounded-xl px-5 py-3 text-center">
                        <span className="text-xl block">⏳</span>
                        <span className="text-lg font-black block mt-0.5">{s.studyHours} Hrs</span>
                        <span className="text-[9px] text-indigo-200 font-bold uppercase tracking-wider">Time Invested</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                {/* Left Side: Score Metrics & Weekly Activity Charts */}
                <div className="lg:col-span-8 space-y-6 flex flex-col justify-start">

                    {/* Summary Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4.5">
                            <div className="w-13 h-13 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Avg ATS Score</span>
                                <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 block">{s.avgResumeScore}%</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{s.totalResumes} Resumes analyzed</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex items-center gap-4.5">
                            <div className="w-13 h-13 bg-emerald-50 dark:bg-indigo-950/40 border border-emerald-100/50 dark:border-indigo-900/30 text-emerald-600 dark:text-emerald-550 rounded-xl flex items-center justify-center shrink-0">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Avg Mock Score</span>
                                <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5 block">{s.avgInterviewScore}/10</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{s.completedInterviews} completed sessions</span>
                            </div>
                        </div>
                    </div>

                    {/* Recharts Weekly Activity Log */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">
                        <div className="mb-5 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
                                Weekly Activity Logs
                            </h3>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                Past 7 Days
                            </span>
                        </div>

                        <div className="w-full h-[220px]">
                            {chartData.length === 0 ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                    <TrendingDown className="w-7 h-7 mb-1" />
                                    <span className="text-[10px] font-bold">No active logs registered this week.</span>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#64748B", fontSize: 9, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#1E293B",
                                                borderRadius: "12px",
                                                border: "none",
                                                color: "#FFF",
                                                fontSize: "10px",
                                                fontWeight: "bold",
                                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                            }}
                                            cursor={{ fill: "rgba(99, 102, 241, 0.04)", radius: 8 }}
                                        />
                                        <Bar dataKey="actions" radius={[6, 6, 0, 0]} maxBarSize={32}>
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={index % 2 === 0 ? "#6366F1" : "#8B5CF6"}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Achievements unlocked tray */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                            <Award className="w-4.5 h-4.5 text-indigo-500" />
                            Unlocked Badges ({achievements.length})
                        </h3>

                        {achievements.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Award className="w-8 h-8 mx-auto text-slate-200 dark:text-slate-800 mb-2" />
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">No badges unlocked yet.</p>
                                <p className="text-[9px] text-slate-405 mt-0.5">Complete mock tests or study roadmaps to earn points!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {achievements.map((ach) => (
                                    <div key={ach._id} className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex gap-3.5 items-center hover:scale-[1.01] transition-transform">
                                        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-100/50 dark:border-amber-900/30 flex items-center justify-center text-xl shrink-0">
                                            🏆
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{ach.title}</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{ach.description}</p>
                                            <span className="inline-block mt-2 text-[9px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded border border-indigo-100">
                                                +{ach.points} XP
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Global XP Leaderboard with visual podium */}
                <div className="lg:col-span-4 flex flex-col justify-stretch">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <Trophy className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                                Global Leaderboard
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-1 font-semibold">Rankings calculated by total earned XP.</p>
                        </div>

                        {/* Top 3 Podium Cards */}
                        {topThree.length > 0 && (
                            <div className="flex items-end justify-center gap-2 mt-4 mb-6 pt-6 border-b border-slate-100 dark:border-slate-700 pb-6 shrink-0">
                                {podiumOrder.map((user) => {
                                    const style = getPodiumStyles(user.rank);
                                    const isSelf = user.email === stats?.user?.email;

                                    return (
                                        <motion.div
                                            key={user._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: style.delay }}
                                            className={`flex-1 flex flex-col items-center p-3 rounded-2xl border text-center relative ${style.scale} ${style.border} ${style.bg} ${style.shadow}`}
                                        >
                                            {/* Rank Badge / Emoji */}
                                            <div className="absolute -top-3.5 flex items-center justify-center">
                                                <span className={`text-base w-7 h-7 flex items-center justify-center rounded-full border shadow-sm ${style.badge}`}>
                                                    {style.icon}
                                                </span>
                                            </div>

                                            {/* User Avatar Circle */}
                                            <div className={`w-11 h-11 rounded-full ring-2 ${style.avatarRing} flex items-center justify-center bg-gradient-to-br ${style.avatarBg} font-black text-xs shadow-md mb-2 overflow-hidden`}>
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitials(user.name)
                                                )}
                                            </div>

                                            <div className="w-full">
                                                <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate w-full px-1">
                                                    {user.name.split(" ")[0]}
                                                </h4>
                                                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                    LVL {user.level || 1}
                                                </p>

                                                <span className="inline-block mt-1.5 text-[9px] font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg shadow-sm">
                                                    {user.xp} XP
                                                </span>
                                            </div>

                                            {isSelf && (
                                                <span className="absolute -bottom-2 bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                                                    YOU
                                                </span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* General ranking list (remaining users) */}
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] custom-scrollbar pr-1">
                            {leaderboard.map((user, idx) => {
                                // Skip podium ranks in the scrollable view if topThree is fully rendered
                                const rank = idx + 1;
                                const isSelf = user.email === stats?.user?.email;
                                const isPodium = rank <= 3;

                                return (
                                    <div
                                        key={user._id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelf
                                                ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-sm"
                                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Rank Indicator */}
                                            <span className={`w-5 font-black text-xs text-center shrink-0 ${rank === 1 ? "text-yellow-500" :
                                                    rank === 2 ? "text-slate-400" :
                                                        rank === 3 ? "text-orange-500" :
                                                            "text-slate-400 dark:text-slate-500"
                                                }`}>
                                                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                                            </span>

                                            {/* Avatar fallback for table */}
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    getInitials(user.name)
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className={`text-[11px] font-bold flex items-center gap-1.5 truncate ${isSelf ? "text-indigo-900 dark:text-indigo-300" : "text-slate-700 dark:text-slate-200"
                                                    }`}>
                                                    {user.name}
                                                    {isSelf && (
                                                        <span className="bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                            You
                                                        </span>
                                                    )}
                                                </h4>
                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5 block">
                                                    Level {user.level || 1}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 border ${isSelf
                                                ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30"
                                                : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                            }`}>
                                            {user.xp} XP
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
