import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import {
    Trophy,
    Flame,
    Sparkles,
    Award,
    ArrowUpRight,
    ArrowRight,
    Brain,
    Video,
    FileText,
    Calendar,
    Activity,
    Clock,
    ChevronRight,
    TrendingUp,
    Compass
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();


    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        avgResumeScore: 0,
        totalResumes: 0,
        avgPrepProgress: 0,
        streak: 0,
        level: 1,
        xp: 0,
        studyHours: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const interviewRes = await axios.get("http://localhost:5000/api/interviews", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const analyticsRes = await axios.get("http://localhost:5000/api/analytics", {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => null);

            const interviews = interviewRes.data.interviews || [];
            const completedCount = interviews.filter(i => i.status === "completed").length;
            const pendingCount = interviews.filter(i => i.status === "pending").length;

            if (analyticsRes && analyticsRes.data.success) {
                const data = analyticsRes.data.data;
                setStats({
                    total: interviews.length,
                    completed: completedCount,
                    pending: pendingCount,
                    avgResumeScore: data.stats.avgResumeScore || 0,
                    totalResumes: data.stats.totalResumes || 0,
                    avgPrepProgress: data.stats.avgPrepProgress || 0,
                    streak: data.stats.streak || user?.streak || 0,
                    level: data.stats.level || user?.level || 1,
                    xp: data.stats.xp || user?.xp || 0,
                    studyHours: data.stats.studyHours || 0
                });
            } else {
                setStats({
                    total: interviews.length,
                    completed: completedCount,
                    pending: pendingCount,
                    avgResumeScore: 0,
                    totalResumes: 0,
                    avgPrepProgress: 0,
                    streak: user?.streak || 0,
                    level: user?.level || 1,
                    xp: user?.xp || 0,
                    studyHours: Math.round(completedCount * 0.5)
                });
            }
        } catch (error) {
            console.error("Fetch dashboard stats error:", error);
        } finally {
            setLoading(false);
        }
    };



    // Recharts Data Setup
    const weeklyProgressData = [
        { name: "Mon", Progress: 20, StudyTime: 0.5 },
        { name: "Tue", Progress: 35, StudyTime: 1.2 },
        { name: "Wed", Progress: 48, StudyTime: 2.0 },
        { name: "Thu", Progress: 55, StudyTime: 1.5 },
        { name: "Fri", Progress: 70, StudyTime: 3.1 },
        { name: "Sat", Progress: 85, StudyTime: 4.0 },
        { name: "Sun", Progress: 90, StudyTime: 2.5 }
    ];

    const interviewScoresData = [
        { session: "S1", Score: 5.5 },
        { session: "S2", Score: 6.2 },
        { session: "S3", Score: 7.0 },
        { session: "S4", Score: stats.completed > 0 ? stats.completed * 1.5 + 5.0 : 7.8 }
    ];

    const atsImprovementData = [
        { resume: "V1", Score: 50 },
        { resume: "V2", Score: 68 },
        { resume: "V3", Score: stats.avgResumeScore > 0 ? stats.avgResumeScore : 78 }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="w-full pb-10">

            {/* Title Block */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    Placement Platform
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-3 tracking-tight">
                    Candidate Workspace
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Welcome back, <span className="text-slate-700 dark:text-slate-200 font-bold">{user?.name}</span>. Review your readiness progress dashboard.
                </p>
            </div>

            {/* Metric Cards Row */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
            >
                {/* 1. XP Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 dark:bg-indigo-400/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +25%
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Points</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                            {loading ? "..." : `${stats.xp} XP`}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">+120 XP from last week</p>
                    </div>
                </motion.div>

                {/* 2. Level Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 dark:bg-violet-400/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100/50 dark:bg-violet-950/50 px-2 py-0.5 rounded-full">
                            Active
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Ranking</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                            {loading ? "..." : `Lvl ${stats.level}`}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Streak: {stats.streak} Days 🔥</p>
                    </div>
                </motion.div>

                {/* 3. ATS Score Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 dark:bg-emerald-400/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12%
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg ATS Match</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                            {loading ? "..." : `${stats.avgResumeScore}%`}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">{stats.totalResumes} Resumes analyzed</p>
                    </div>
                </motion.div>

                {/* 4. Study Progress Card */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 dark:bg-orange-400/5 rounded-bl-full transition-transform duration-300 group-hover:scale-110" />
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                            <Award className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Roadmaps
                        </span>
                    </div>
                    <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Syllabus Progress</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                            {loading ? "..." : `${stats.avgPrepProgress}%`}
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">Goal: {user?.careerGoal || "Student"}</p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Quick Actions Grid Section */}
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                🚀 Quick Action Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {/* 1. Resume Intelligence */}
                <div
                    onClick={() => navigate("/resume-intelligence")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Resume ATS Scoring</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                            Analyze your resume files, review overall score gauge, and find matched skills.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>Launch Analysis</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>

                {/* 2. Mock Interview */}
                <div
                    onClick={() => navigate("/create-interview")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <Video className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Start AI Interview</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 leading-relaxed">
                            Participate in real-time concept questions, code reviews, and communication tests.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span>Setup meeting</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>

                {/* 3. Generate Roadmap */}
                <div
                    onClick={() => navigate("/preparation")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <Compass className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Syllabus Roadmaps</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 leading-relaxed">
                            Formulate targeted developer learning path guides, quiz sessions, and milestones.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-orange-600 dark:text-orange-400">
                        <span>Generate Roadmap</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>

                {/* 4. AI Career Coach */}
                <div
                    onClick={() => navigate("/chatbot")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <Brain className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Consult AI Coach</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 leading-relaxed">
                            Discuss layout choices, preparation checkpoints, and resume optimizations with AI.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Chat Assistant</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>

                {/* 5. Weekly Planner */}
                <div
                    onClick={() => navigate("/study-plan")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Milestones Planner</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 leading-relaxed">
                            Organize structural weeks list schedule containing checklist boxes.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400">
                        <span>Weekly Planner</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>

                {/* 6. Leaderboard */}
                <div
                    onClick={() => navigate("/analytics")}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-slate-350 dark:hover:border-slate-650 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform duration-300">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Check Leaderboard</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1.5 leading-relaxed">
                            Compare your active XP parameters with global Praveen Tech candidates rankings.
                        </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        <span>Rankings Podium</span>
                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>

            {/* Progress Section: Visual charts */}
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-4">
                📊 Activity & Analytics Charts
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Weekly Progress Area Chart */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Study Engagement</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Weekly progress % values and study hours</p>
                        </div>
                        <Activity className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                                <Area type="monotone" dataKey="Progress" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorProgress)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. ATS & Interview Scores Dual Line Chart */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">ATS & Interview Trends</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">History scores trajectory timeline metrics</p>
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={atsImprovementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                <XAxis dataKey="resume" stroke="#94A3B8" fontSize={10} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                                <Line type="monotone" dataKey="Score" stroke="#10B981" strokeWidth={2} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;