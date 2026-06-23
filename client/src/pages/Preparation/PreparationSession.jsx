import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    Map,
    HelpCircle,
    Award,
    ArrowRight,
    BookOpen,
    CheckCircle,
    Info,
    Play,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";

function PreparationSession() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState(null);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("roadmap");
    const [questionTab, setQuestionTab] = useState("THEORY");
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [quizGenerating, setQuizGenerating] = useState(false);

    useEffect(() => {
        fetchSessionDetails();
    }, [id]);

    const fetchSessionDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`https://praveentech-backend.onrender.com/api/preparation/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSession(res.data.session);
                setQuestions(res.data.questions || []);
                setQuiz(res.data.quiz || null);
            }
        } catch (error) {
            console.error("Fetch session detail error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleQuestion = async (qId) => {
        setTogglingId(qId);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `https://praveentech-backend.onrender.com/api/preparation/question/${qId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setQuestions(prev => prev.map(q => q._id === qId ? res.data.question : q));
                setSession(prev => ({ ...prev, progress: res.data.progress }));
            }
        } catch (error) {
            console.error("Toggle question error:", error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleStartQuiz = async () => {
        setQuizGenerating(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `https://praveentech-backend.onrender.com/api/preparation/${id}/quiz`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                navigate(`/preparation/${id}/quiz`);
            }
        } catch (error) {
            console.error("Start quiz error:", error);
            alert("Failed to start quiz. Make sure your Gemini API key is configured.");
        } finally {
            setQuizGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="w-full text-center py-20">
                <span className="text-4xl mb-4 block">⚠️</span>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Session Not Found</h2>
                <button
                    onClick={() => navigate("/preparation")}
                    className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow"
                >
                    Back to Hub
                </button>
            </div>
        );
    }

    const filteredQuestions = questions.filter(q => q.type === questionTab);

    return (
        <div className="w-full pb-10">
            <div className="max-w-4xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate("/preparation")}
                    className="text-slate-505 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-105 text-xs font-semibold mb-6 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-sm transition"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Preparation Hub
                </button>

                {/* Session Header Panel */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${session.difficulty === "Advanced" ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" :
                                    session.difficulty === "Intermediate" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                                }`}>
                                {session.difficulty} Module
                            </span>
                            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">{session.topic}</h1>
                            {(session.company || session.role) && (
                                <p className="text-slate-400 dark:text-slate-500 mt-1.5 text-xs font-medium">
                                    {session.company && `Target Company: ${session.company}`}
                                    {session.company && session.role && " • "}
                                    {session.role && `Target Role: ${session.role}`}
                                </p>
                            )}
                        </div>

                        {/* Progress card */}
                        <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                                <span className="font-semibold">Completion progress:</span>
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{session.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${session.progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-100 dark:border-slate-800/80 gap-2">
                        <button
                            onClick={() => setActiveTab("roadmap")}
                            className={`pb-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${activeTab === "roadmap"
                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            <Map className="w-4 h-4" /> Learning Roadmap
                        </button>
                        <button
                            onClick={() => setActiveTab("questions")}
                            className={`pb-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${activeTab === "questions"
                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            <HelpCircle className="w-4 h-4" /> Practice Questions
                        </button>
                        <button
                            onClick={() => setActiveTab("quiz")}
                            className={`pb-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${activeTab === "quiz"
                                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            <Award className="w-4 h-4" /> Topic Quiz
                        </button>
                    </div>
                </div>

                {/* Tab 1: Roadmap Timeline Accordion */}
                {activeTab === "roadmap" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="relative border-l-2 border-indigo-100 dark:border-indigo-950/80 ml-4 pl-8 space-y-6 py-2">
                            {session.roadmap.map((item, index) => (
                                <div key={index} className="relative">
                                    {/* timeline bubble */}
                                    <div className="absolute -left-[41px] top-1 bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-500 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-400 shadow-sm z-10">
                                        {index + 1}
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover-card-effect">
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{item.phase}</h3>
                                        <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed mb-4">{item.description}</p>

                                        {item.resources && item.resources.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Suggested Resources</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.resources.map((res, rIdx) => (
                                                        <span
                                                            key={rIdx}
                                                            className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] px-2.5 py-1 rounded-full font-medium"
                                                        >
                                                            {res}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab 2: Practice Questions List */}
                {activeTab === "questions" && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Subtabs filters */}
                        <div className="flex flex-wrap gap-2 mb-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
                            {["THEORY", "CODING", "INTERVIEW", "BEHAVIORAL"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setQuestionTab(type);
                                        setExpandedQuestion(null);
                                    }}
                                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition duration-200 ${questionTab === type
                                            ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-50 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {filteredQuestions.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-400 dark:text-slate-505 text-xs italic shadow-sm">
                                No questions found in this category.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuestions.map((q) => (
                                    <div
                                        key={q._id}
                                        className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-sm transition-all duration-300 ${q.completed ? "border-emerald-200 bg-emerald-50/5 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700"
                                            }`}
                                    >
                                        <div className="flex items-start gap-4 justify-between">
                                            <div className="flex items-start gap-3.5">
                                                {/* Checkbox trigger */}
                                                <button
                                                    onClick={() => handleToggleQuestion(q._id)}
                                                    disabled={togglingId === q._id}
                                                    className={`w-5.5 h-5.5 mt-0.5 flex items-center justify-center rounded-lg border transition-all ${q.completed
                                                            ? "bg-emerald-600 border-emerald-600 text-white"
                                                            : "border-slate-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500 bg-white dark:bg-slate-900"
                                                        }`}
                                                >
                                                    {q.completed && <span className="text-[10px]">✓</span>}
                                                </button>

                                                <div>
                                                    <h3 className={`font-bold text-sm text-slate-800 dark:text-slate-200 ${q.completed ? 'line-through text-slate-400 dark:text-slate-600' : ''}`}>
                                                        {q.title}
                                                    </h3>
                                                    <p className="text-slate-400 dark:text-slate-400 text-xs mt-1 leading-relaxed">{q.description}</p>

                                                    {/* Metadata Badges */}
                                                    <div className="flex flex-wrap items-center gap-2 mt-3.5">
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${q.difficulty === "Hard" ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600" :
                                                                q.difficulty === "Medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                                                                    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                                            }`}>
                                                            {q.difficulty}
                                                        </span>
                                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                                            {q.source}
                                                        </span>
                                                        {q.url && (
                                                            <a
                                                                href={q.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 text-[10px] font-semibold"
                                                            >
                                                                Solve External <ExternalLink className="w-3 h-3 ml-0.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expand Toggler */}
                                            {q.correctAnswer && (
                                                <button
                                                    onClick={() => setExpandedQuestion(expandedQuestion === q._id ? null : q._id)}
                                                    className="bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center transition border border-slate-200 dark:border-slate-700"
                                                >
                                                    {expandedQuestion === q._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Expandable answer panel */}
                                        <AnimatePresence>
                                            {expandedQuestion === q._id && q.correctAnswer && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 overflow-hidden"
                                                >
                                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                                                        <Info className="w-4 h-4 text-indigo-500" /> AI Suggested Reference Solution:
                                                    </h4>
                                                    <p className="leading-relaxed whitespace-pre-wrap font-medium">{q.correctAnswer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Practice Quiz Card */}
                {activeTab === "quiz" && (
                    <div className="max-w-md mx-auto animate-fadeIn">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
                            <span className="text-4xl mb-4 block">📝</span>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Check Your Knowledge</h3>

                            {quiz && quiz.completed ? (
                                <div className="mt-4">
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">
                                        You completed the multiple-choice quiz for this topic.
                                    </p>
                                    <div className="inline-block bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-xl px-6 py-4 mb-6">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Your Score</span>
                                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{quiz.score}%</span>
                                    </div>

                                    <button
                                        onClick={handleStartQuiz}
                                        disabled={quizGenerating}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition duration-200 shadow-sm"
                                    >
                                        {quizGenerating ? "Generating New Quiz..." : "Retake Quiz Test"}
                                    </button>
                                </div>
                            ) : quiz && !quiz.completed ? (
                                <div>
                                    <p className="text-xs text-slate-450 dark:text-slate-500 mb-6 leading-relaxed">
                                        You have a generated quiz waiting. Continue to solve the multiple-choice test.
                                    </p>
                                    <button
                                        onClick={() => navigate(`/preparation/${id}/quiz`)}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-1.5"
                                    >
                                        <span>Resume Quiz Practice</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-slate-450 dark:text-slate-500 mb-6 leading-relaxed">
                                        Take a 5-question multiple-choice practice quiz customized by AI to reinforce your learning and earn up to 50 XP points!
                                    </p>
                                    <button
                                        onClick={handleStartQuiz}
                                        disabled={quizGenerating}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-2"
                                    >
                                        {quizGenerating ? (
                                            <>
                                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>Formulating Questions...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5" />
                                                <span>Start Practice Quiz</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default PreparationSession;
