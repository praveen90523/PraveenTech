import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Compass, Award, Sparkles, AlertCircle, BookOpen, ChevronRight, Cpu } from "lucide-react";

function PreparationHub() {
    const navigate = useNavigate();

    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Beginner");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [generating, setGenerating] = useState(false);
    
    const [sessions, setSessions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [statusMsg, setStatusMsg] = useState("");

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/preparation", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSessions(res.data.sessions || []);
            }
        } catch (error) {
            console.error("Fetch preps error:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setGenerating(true);
        setStatusMsg("");

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/preparation/generate",
                {
                    topic: topic.trim(),
                    role: role.trim(),
                    company: company.trim(),
                    difficulty
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                navigate(`/preparation/${res.data.session._id}`);
            }
        } catch (error) {
            console.error("Generate preparation error:", error);
            setStatusMsg(error.response?.data?.message || "Failed to generate preparation resources.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header banner */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    Syllabus Planner
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-3 tracking-tight">
                    Preparation Hub
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Generate comprehensive, company-aligned study roadmaps, theory resources, and test quizzes using AI.
                </p>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left: Generator Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg">
                        <div className="flex items-center gap-2 mb-5">
                            <Cpu className="w-4.5 h-4.5 text-indigo-500" />
                            <h2 className="font-bold text-slate-850 dark:text-slate-250 text-sm">Initialize Module</h2>
                        </div>
                        
                        <form onSubmit={handleGenerate} className="space-y-4">
                            {statusMsg && (
                                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{statusMsg}</span>
                                </div>
                            )}

                            {/* Subject/Topic */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Subject / Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. React.js, Trees, OS"
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    required
                                    disabled={generating}
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    disabled={generating}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            {/* Target Company */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Target Company (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Google, Stripe"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    disabled={generating}
                                />
                            </div>

                            {/* Target Role */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Target Role (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Frontend Engineer"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    disabled={generating}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={generating || !topic.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 disabled:opacity-50 mt-5 flex items-center justify-center gap-2 shadow-sm"
                            >
                                {generating ? (
                                    <>
                                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        <span>Building Syllabus...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Generate Roadmap</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Active Modules List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg min-h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-5">
                            <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                            <h2 className="font-bold text-slate-855 dark:text-slate-245 text-sm">Active Study Modules</h2>
                        </div>

                        {loadingHistory ? (
                            <div className="flex-1 flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                <span className="text-4xl mb-4">📚</span>
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-xs leading-relaxed">
                                    No preparation modules active yet. Enter a topic on the left to generate customized study plans.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {sessions.map((sess) => (
                                    <div
                                        key={sess._id}
                                        onClick={() => navigate(`/preparation/${sess._id}`)}
                                        className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between hover-card-effect"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">{sess.topic}</h3>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                                    sess.difficulty === "Advanced" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/35" :
                                                    sess.difficulty === "Intermediate" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/35" :
                                                    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35"
                                                }`}>
                                                    {sess.difficulty}
                                                </span>
                                            </div>

                                            {(sess.company || sess.role) && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 line-clamp-1 font-semibold">
                                                    {sess.company && `Target: ${sess.company}`}
                                                    {sess.company && sess.role && " • "}
                                                    {sess.role && `${sess.role}`}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            {/* Progress bar */}
                                            <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                                                <span>Completion Progress:</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-100">{sess.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${sess.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-100/40 dark:border-indigo-900/30">
                                                    +50 XP Rewards
                                                </span>
                                                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                                                    View roadmap <ChevronRight className="w-3 h-3 ml-0.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PreparationHub;
