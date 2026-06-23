import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
    Brain, 
    Code2, 
    Video, 
    Sparkles, 
    AlertCircle, 
    UserCheck, 
    Flame,
    Terminal,
    Target,
    Compass,
    Loader2
} from "lucide-react";

export default function CreateInterview() {
    const navigate = useNavigate();

    const [moduleType, setModuleType] = useState("interview"); // "interview" | "coding"
    const [interviewMode, setInterviewMode] = useState("technical"); // "technical" | "executive"

    const [formData, setFormData] = useState({
        role: "Frontend Developer",
        domain: "React",
        difficulty: "Beginner",
    });
    const [questionCount, setQuestionCount] = useState(5);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const payload = {
                role: formData.role,
                domain: moduleType === "coding" 
                    ? formData.domain 
                    : (interviewMode === "executive" ? "HR & Behavioral" : formData.domain),
                difficulty: formData.difficulty,
                type: moduleType,
                mode: moduleType === "interview" ? interviewMode : "technical",
                questionCount
            };

            const res = await axios.post(
                "http://localhost:5000/api/interviews/create",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            navigate(`/interview/${res.data.interview._id}`);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Failed to create interview session"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header banner */}
            <div className="text-center mb-10 animate-fadeIn">
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Placement Simulator
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Assessment Simulator
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
                    Prepare with realistic AI assessments. Select a targeted pathway to start a mock interview session or launch code challenges.
                </p>
            </div>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2.5 max-w-4xl mx-auto shadow-sm">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-4xl mx-auto">
                
                {/* Left: Pathway cards & styles selectors */}
                <div className="lg:col-span-2 space-y-6 flex flex-col justify-start">
                    
                    {/* Module selector cards */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg">
                        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            1. Select Module Pathway
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* AI Interview card */}
                            <motion.div 
                                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setModuleType("interview")}
                                className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative flex flex-col justify-between min-h-[160px] group ${
                                    moduleType === "interview" 
                                        ? "border-indigo-600 bg-indigo-50/10 dark:border-indigo-500 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-xs" 
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 hover:bg-slate-50/20 dark:hover:bg-slate-700/50 shadow-2xs"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2.5 rounded-xl transition duration-300 ${moduleType === "interview" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-900 text-slate-500"}`}>
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition duration-305 ${moduleType === "interview" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 dark:border-slate-700"}`}>
                                        {moduleType === "interview" && <div className="w-2.5 h-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">AI Mock Interview</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                        Concept explanation rounds, behavioral checkups, and communication testing.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Coding Practice card */}
                            <motion.div 
                                whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.04)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setModuleType("coding")}
                                className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 relative flex flex-col justify-between min-h-[160px] group ${
                                    moduleType === "coding" 
                                        ? "border-violet-600 bg-violet-50/10 dark:border-violet-500 dark:bg-violet-950/20 ring-2 ring-violet-500/20 shadow-xs" 
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 hover:bg-slate-50/20 dark:hover:bg-slate-700/50 shadow-2xs"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2.5 rounded-xl transition duration-300 ${moduleType === "coding" ? "bg-violet-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-900 text-slate-500"}`}>
                                        <Code2 className="w-5 h-5" />
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition duration-305 ${moduleType === "coding" ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40" : "border-slate-200 dark:border-slate-700"}`}>
                                        {moduleType === "coding" && <div className="w-2.5 h-2.5 bg-violet-600 dark:bg-violet-400 rounded-full"></div>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Coding Practice</h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                        Data structures, syntax-writing challenges, React tasks, and SQL queries.
                                    </p>
                                </div>
                            </motion.div>

                        </div>
                    </div>

                    {/* Mode Toggle (Interviews) */}
                    {moduleType === "interview" && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg animate-fadeIn">
                            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                                2. Choose Interview Style
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* Technical Mode */}
                                <motion.div 
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setInterviewMode("technical")}
                                    className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                                        interviewMode === "technical" 
                                            ? "border-indigo-600 bg-indigo-50/10 dark:border-indigo-500 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20" 
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-700/50 text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${interviewMode === "technical" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-900 text-slate-500"}`}>
                                            <Brain className="w-4.5 h-4.5 shrink-0" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Technical Concept Round</h4>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Concept theory & system design questions</p>
                                        </div>
                                    </div>
                                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${interviewMode === "technical" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 dark:border-slate-700"}`}>
                                        {interviewMode === "technical" && <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>}
                                    </div>
                                </motion.div>

                                {/* Executive HR Mode */}
                                <motion.div 
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setInterviewMode("executive")}
                                    className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                                        interviewMode === "executive" 
                                            ? "border-indigo-600 bg-indigo-50/10 dark:border-indigo-500 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20" 
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 hover:bg-slate-50/30 dark:hover:bg-slate-700/50 text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${interviewMode === "executive" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-900 text-slate-500"}`}>
                                            <UserCheck className="w-4.5 h-4.5 shrink-0" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Executive / HR Round</h4>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Behavioral, HR & managerial questions</p>
                                        </div>
                                    </div>
                                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${interviewMode === "executive" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" : "border-slate-200 dark:border-slate-700"}`}>
                                        {interviewMode === "executive" && <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>}
                                    </div>
                                </motion.div>

                            </div>
                        </div>
                    )}

                    {/* Features Preview Checklists */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg">
                        <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                            Feature Highlights
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">AI Question Generation</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Tailored questions generated dynamically by Gemini models.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Dual Mode Input</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Practice speaking naturally with Voice/Speech-to-Text or typing answers.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Real-Time Quality Meter</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Interactive text quality assessment & word counting feedback.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-extrabold">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Detailed Performance Analysis</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">Detailed score metrics, strengths summary, and model responses.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right: Setup parameters & Submit */}
                <div className="lg:col-span-1 flex">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg flex flex-col justify-between w-full items-stretch">
                        <div className="space-y-5">
                            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                3. Configure Session
                            </h2>

                            <div className="space-y-4">
                                
                                {/* Target Role */}
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        Target Job Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="Frontend Developer">Frontend Developer</option>
                                        <option value="Backend Developer">Backend Developer</option>
                                        <option value="Full Stack Developer">Full Stack Developer</option>
                                        <option value="MERN Stack Developer">MERN Stack Developer</option>
                                        <option value="Java Full Stack Developer">Java Full Stack Developer</option>
                                        <option value="Python Django Developer">Python Django Developer</option>
                                        <option value="React Developer">React Developer</option>
                                        <option value="Node.js Developer">Node.js Developer</option>
                                        <option value="Java Developer">Java Developer</option>
                                        <option value="Python Developer">Python Developer</option>
                                        <option value="Software Engineer">Software Engineer</option>
                                        <option value="DevOps Engineer">DevOps Engineer</option>
                                        <option value="Data Analyst">Data Analyst</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="AI Engineer">AI Engineer</option>
                                    </select>
                                </div>

                                {/* Technology Selector */}
                                {!(moduleType === "interview" && interviewMode === "executive") && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                            Technology / Domain
                                        </label>
                                        <select
                                            name="domain"
                                            value={formData.domain}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        >
                                            {moduleType === "coding" ? (
                                                <>
                                                    <option value="JavaScript">JavaScript</option>
                                                    <option value="Python">Python</option>
                                                    <option value="Java">Java</option>
                                                    <option value="React Coding">React Coding</option>
                                                    <option value="SQL Queries">SQL Queries</option>
                                                    <option value="DSA (Data Structures)">DSA (Data Structures)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="React">React</option>
                                                    <option value="JavaScript">JavaScript</option>
                                                    <option value="HTML & CSS">HTML & CSS</option>
                                                    <option value="Angular">Angular</option>
                                                    <option value="Vue">Vue</option>
                                                    <option value="Node.js">Node.js</option>
                                                    <option value="Express.js">Express.js</option>
                                                    <option value="MongoDB">MongoDB</option>
                                                    <option value="MySQL">MySQL</option>
                                                    <option value="PostgreSQL">PostgreSQL</option>
                                                    <option value="Java Core">Java Core</option>
                                                    <option value="Spring Boot">Spring Boot</option>
                                                    <option value="Python Core">Python Core</option>
                                                    <option value="Django">Django</option>
                                                    <option value="AWS">AWS</option>
                                                    <option value="Docker">Docker</option>
                                                    <option value="Kubernetes">Kubernetes</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Difficulty Selector */}
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        Difficulty Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["Beginner", "Intermediate", "Advanced"].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, difficulty: level })}
                                                className={`py-2 rounded-xl text-[9px] font-extrabold border transition ${
                                                    formData.difficulty === level
                                                        ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-105 dark:text-slate-950 shadow-xs"
                                                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Count Selector */}
                                <div>
                                    <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        Question Count
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[5, 10, 15].map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                onClick={() => setQuestionCount(count)}
                                                className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                                                    questionCount === count
                                                        ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-105 dark:text-slate-950 shadow-xs"
                                                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                                                }`}
                                            >
                                                {count} Qs
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Specifications List */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 space-y-2 border border-slate-200 dark:border-slate-700 shadow-3xs">
                                <div className="flex justify-between font-semibold">
                                    <span>Session Type:</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{moduleType}</span>
                                </div>
                                {moduleType === "interview" && (
                                    <div className="flex justify-between font-semibold">
                                        <span>Focus Style:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{interviewMode}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-semibold">
                                    <span>No. of Questions:</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{questionCount} Questions</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span>Evaluator:</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Praveen Tech AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all duration-205 shadow-sm flex items-center justify-center gap-2 border-0 outline-none select-none active:scale-[0.98] cursor-pointer ${
                                    moduleType === "coding"
                                        ? "bg-violet-600 hover:bg-violet-750"
                                        : "bg-indigo-600 hover:bg-indigo-750"
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Creating Session...</span>
                                    </>
                                ) : (
                                    <>
                                        {moduleType === "coding" ? <Terminal className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                                        <span>Launch Assessment Room</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}