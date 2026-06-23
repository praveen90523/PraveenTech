import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar, 
    Flag, 
    RefreshCw, 
    CheckCircle2, 
    ChevronDown, 
    ChevronUp, 
    Clock, 
    Target, 
    Sparkles, 
    AlertCircle 
} from "lucide-react";

function StudyPlanner() {
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [targetRole, setTargetRole] = useState("");
    const [timeline, setTimeline] = useState("4 Weeks");
    const [generating, setGenerating] = useState(false);
    
    const [expandedWeek, setExpandedWeek] = useState(0);
    const [toggling, setToggling] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    useEffect(() => {
        fetchStudyPlan();
    }, []);

    const fetchStudyPlan = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/study-plan", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudyPlan(res.data.studyPlan);
            }
        } catch (error) {
            console.error("Fetch study plan error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!targetRole.trim()) return;

        setGenerating(true);
        setStatusMsg("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/study-plan/generate",
                { targetRole: targetRole.trim(), timeline },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setStudyPlan(res.data.studyPlan);
                setExpandedWeek(0);
            }
        } catch (error) {
            console.error("Generate study plan error:", error);
            setStatusMsg(error.response?.data?.message || "Failed to formulate weekly task sheets.");
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleTask = async (weekIdx, taskIdx) => {
        if (toggling) return;
        setToggling(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                "http://localhost:5000/api/study-plan",
                { weekIndex: weekIdx, taskIndex: taskIdx },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setStudyPlan(res.data.studyPlan);
            }
        } catch (error) {
            console.error("Toggle task error:", error);
        } finally {
            setToggling(false);
        }
    };

    const handleToggleMilestone = async (mIdx) => {
        if (toggling) return;
        setToggling(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                "http://localhost:5000/api/study-plan",
                { milestoneIndex: mIdx },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setStudyPlan(res.data.studyPlan);
            }
        } catch (error) {
            console.error("Toggle milestone error:", error);
        } finally {
            setToggling(false);
        }
    };

    const handleReformulate = async () => {
        if (!window.confirm("Do you want to reset and formulate a new planner? Your current milestones progress will be reset.")) {
            return;
        }
        
        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete("http://localhost:5000/api/study-plan", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudyPlan(null);
            }
        } catch (error) {
            console.error("Reformulate study plan error:", error);
            alert("Failed to reset the study plan on the server. Please try again.");
        }
    };

    const getDaysLeft = (dateString) => {
        const milestoneDate = new Date(dateString);
        const today = new Date();
        milestoneDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        const diffTime = milestoneDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "Passed";
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1 Day Left";
        return `${diffDays} Days Left`;
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    Weekly Planner
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                    Study Planner
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Formulate week-by-week task checklists tailored to your target job profile.
                </p>
            </div>

            {!studyPlan ? (
                /* Empty State: Create Plan Card */
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto shadow-sm dark:shadow-lg animate-fadeIn">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/30">
                        <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-slate-850 dark:text-slate-200 text-center mb-1">Create Study Plan</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-6 leading-relaxed">
                        Specify your target job role below to formulate a structured learning timeline.
                    </p>

                    <form onSubmit={handleGenerate} className="space-y-4">
                        {statusMsg && (
                            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{statusMsg}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Target Job Role</label>
                            <input
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. React Frontend Engineer, DevOps Engineer"
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                required
                                disabled={generating}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Preparation Timeline</label>
                            <select
                                value={timeline}
                                onChange={(e) => setTimeline(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                disabled={generating}
                            >
                                <option value="4 Weeks">4 Weeks (Crash course)</option>
                                <option value="6 Weeks">6 Weeks (Standard timeline)</option>
                                <option value="8 Weeks">8 Weeks (Comprehensive prep)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={generating || !targetRole.trim()}
                            className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition duration-200 disabled:opacity-50 mt-5 flex items-center justify-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    <span>Mapping Schedule...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate Study Plan</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                /* Active Planner Dashboard layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
                    
                    {/* Left: Weekly checklists */}
                    <div className="lg:col-span-2 space-y-4">
                        
                        {/* Plan Header Card */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                <div>
                                    <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold px-2.5 py-0.5 rounded border border-indigo-150/40 dark:border-indigo-900/30 uppercase tracking-wide">
                                        Active Track
                                    </span>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-2">{studyPlan.targetRole}</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-1">Timeline Target: {studyPlan.timeline}</p>
                                </div>
                                
                                <div className="w-full sm:w-48">
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 font-bold">
                                        <span>Total Progress:</span>
                                        <span>{studyPlan.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-650 h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${studyPlan.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist accordion cards */}
                        <div className="space-y-3">
                            {studyPlan.roadmap.map((week, wIdx) => {
                                const isExpanded = expandedWeek === wIdx;
                                const completedCount = week.tasks.filter(t => t.completed).length;
                                const totalCount = week.tasks.length;
                                
                                return (
                                    <div
                                        key={wIdx}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm dark:shadow-lg hover-card-effect"
                                    >
                                        <button
                                            onClick={() => setExpandedWeek(isExpanded ? null : wIdx)}
                                            className="w-full px-6 py-4.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-200"
                                        >
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{week.title}</h3>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1.5 block">
                                                    Tasks completion: {completedCount} / {totalCount} done
                                                </span>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-2 overflow-hidden"
                                                >
                                                    {week.tasks.map((task, tIdx) => (
                                                        <div
                                                            key={tIdx}
                                                            onClick={() => handleToggleTask(wIdx, tIdx)}
                                                            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-200 ${
                                                                task.completed
                                                                    ? "border-emerald-100 dark:border-emerald-950/25 bg-emerald-50/5 dark:bg-emerald-950/5 text-slate-400 dark:text-slate-500"
                                                                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900"
                                                            }`}
                                                        >
                                                            <button
                                                                type="button"
                                                                className={`w-5 h-5 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-all ${
                                                                    task.completed
                                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                                                                }`}
                                                            >
                                                                {task.completed && <span className="text-[10px] font-bold">✓</span>}
                                                            </button>
                                                            <span className={`text-xs ${task.completed ? "line-through text-slate-450 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>
                                                                {task.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Milestones list sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Flag className="w-4 h-4 text-indigo-500" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-205 text-sm">Planner Milestones</h3>
                            </div>

                            <div className="space-y-3">
                                {studyPlan.milestones.map((m, mIdx) => {
                                    const dateStr = new Date(m.dueDate).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric"
                                    });
                                    const daysLeft = getDaysLeft(m.dueDate);
                                    
                                    return (
                                        <div
                                            key={mIdx}
                                            onClick={() => handleToggleMilestone(mIdx)}
                                            className={`border rounded-xl p-3.5 cursor-pointer transition-colors duration-200 flex items-start gap-3 ${
                                                m.completed
                                                    ? "border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/5 opacity-60"
                                                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                className={`w-4.5 h-4.5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition ${
                                                    m.completed
                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                        : "border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-900"
                                                }`}
                                            >
                                                {m.completed && <span className="text-[9px] font-bold">✓</span>}
                                            </button>

                                            <div>
                                                <h4 className={`text-xs font-bold ${m.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {m.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                                                    <span>Due: {dateStr}</span>
                                                    {!m.completed && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                                                            daysLeft === "Passed" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" :
                                                            daysLeft === "Today" ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400" :
                                                            "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                                                        }`}>
                                                            {daysLeft}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reformulate button */}
                        <button
                            onClick={handleReformulate}
                            className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-xs"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reformulate Planner
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default StudyPlanner;
