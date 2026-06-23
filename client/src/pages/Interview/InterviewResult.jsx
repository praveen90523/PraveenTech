import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
    AlertCircle,
    Download,
    History,
    RefreshCw,
    TrendingUp,
    HelpCircle,
    BookOpen,
    ThumbsUp,
    CheckCircle,
    Award
} from "lucide-react";

const CircularGauge = ({ percent, label, subtitle, colorClass = "stroke-indigo-600 dark:stroke-indigo-400" }) => {
    const radius = 32;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-3xs">
            <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        className={`transition-all duration-500 ease-out ${colorClass}`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>
                <span className="absolute text-xs font-black text-slate-800 dark:text-slate-200">
                    {percent}%
                </span>
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-[10px] mt-3 uppercase tracking-wider">{label}</h4>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">{subtitle}</p>
        </div>
    );
};

const getMetricPercent = (level) => {
    if (!level || level === "N/A") return 0;
    if (level === "Excellent") return 90;
    if (level === "Good") return 75;
    if (level === "Basic") return 50;
    return 30; // Needs Improvement
};

function InterviewResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviewResult();
    }, []);

    const fetchInterviewResult = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/interviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterview(res.data.interview);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch assessment results");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!interview) return;

        let text = `==================================================\n`;
        text += `     PRAVEEN TECH AI MOCK ASSESSMENT REPORT CARD  \n`;
        text += `==================================================\n\n`;
        text += `Candidate Name: ${user?.name || "Student"}\n`;
        text += `Date Analyzed: ${new Date(interview.updatedAt || interview.createdAt).toLocaleString()}\n`;
        text += `Session Pathway: ${interview.type === "coding" ? "Coding Practice" : "AI Mock Interview"}\n`;
        if (interview.type !== "coding") {
            text += `Interview Mode: ${interview.mode === "executive" ? "Executive behavioral" : "Technical Concept"}\n`;
        }
        text += `Target Role: ${interview.role}\n`;
        text += `Focus Domain: ${interview.domain}\n`;
        text += `Difficulty Level: ${interview.difficulty}\n`;
        text += `Placement Status: ${interview.resultStatus || "Completed"}\n`;
        text += `Overall Score: ${interview.finalScore * 10}% (${interview.finalScore} / 10)\n\n`;
        
        text += `--------------------------------------------------\n`;
        text += `               CORE PLACEMENT METRICS             \n`;
        text += `--------------------------------------------------\n`;
        text += `Technical Knowledge: ${interview.technicalKnowledge || "N/A"}\n`;
        text += `Communication Style: ${interview.communication || "N/A"}\n`;
        text += `Delivery Confidence: ${interview.confidence || "N/A"}\n`;
        text += `HR & Coding Readiness: ${interview.hrReadiness || "N/A"}\n\n`;
        
        text += `--------------------------------------------------\n`;
        text += `               EXECUTIVE SUMMARY                  \n`;
        text += `--------------------------------------------------\n`;
        text += `Strengths Summary:\n  ${interview.strengthsSummary || "No direct summary."}\n\n`;
        text += `Areas of Improvement:\n  ${interview.improvementAreasSummary || "Refer to question breakdowns."}\n\n`;
        text += `Recommended Revision Topics:\n  ${(interview.recommendedTopics || []).join(", ") || "None."}\n\n`;
        
        text += `--------------------------------------------------\n`;
        text += `               DETAILED QUESTION BREAKDOWN        \n`;
        text += `--------------------------------------------------\n`;
        interview.answers.forEach((ans, idx) => {
            text += `\n[${idx + 1}] QUESTION: ${ans.question}\n`;
            text += `\tYour Response: "${ans.answer}"\n`;
            text += `\tScore awarded: ${ans.score} / 10\n`;
            text += `\tEvaluation feedback: ${ans.feedback}\n`;
            if (ans.improvement) {
                text += `\tAI Tip: ${ans.improvement}\n`;
            }
            if (ans.correctAnswer) {
                text += `\tSuggested reference model: ${ans.correctAnswer}\n`;
            }
        });
        
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const element = document.createElement("a");
        element.href = URL.createObjectURL(blob);
        element.download = `Praveen_Tech_Placement_Assessment_${interview._id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-semibold animate-pulse">Compiling assessment report...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-6">
                <div className="max-w-xl mx-auto bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/35 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-semibold text-xs">{error}</span>
                </div>
            </div>
        );
    }

    const score = interview?.finalScore || 0;
    const scorePercentage = score * 10;
    const isCoding = interview.type === "coding";
    const status = interview.resultStatus || (isCoding ? "Code Ready" : "Interview Ready");
    const isPassed = status === "Interview Ready" || status === "Code Ready";

    const answersList = interview?.answers || [];
    const totalQs = interview?.questions?.length || 0;
    const answeredCount = answersList.filter(ans => !ans.isSkipped && ans.answer).length;
    const skippedCount = answersList.filter(ans => ans.isSkipped).length;
    const completionRate = totalQs > 0 ? Math.round((answeredCount / totalQs) * 100) : 0;

    return (
        <div className="w-full pb-10 max-w-4xl mx-auto animate-fadeIn">
            {/* Header Dashboard Banner */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 mb-6 shadow-sm dark:shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🏆
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                isPassed 
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30" 
                                    : "bg-amber-50 dark:bg-amber-950/20 text-amber-605 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30"
                            }`}>
                                {isPassed ? `✓ ${status}` : `⚠ ${status}`}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                {interview.type} • {interview.difficulty}
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">Placement Assessment Summary</h1>
                        <p className="text-slate-450 dark:text-slate-405 text-xs mt-0.5 font-medium">
                            Targeting {interview.role} in {interview.domain}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-3.5 text-center shrink-0 w-full md:w-auto">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block">Average score</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-0.5 block">{scorePercentage}%</span>
                </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg text-center">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Questions Answered</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{answeredCount} Qs</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg text-center">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Questions Skipped</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{skippedCount} Qs</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg text-center">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Completion Rate</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{completionRate}%</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg text-center">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Accuracy Rating</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1 block">{Math.round((interview.accuracyScore || 0) * 10)}%</span>
                </div>
            </div>

            {/* Circular gauges & Action Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                
                {/* Circular skill gauges */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-lg">
                    <h3 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-5 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Detailed Skill & Performance Gauges
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        
                        <CircularGauge 
                            percent={getMetricPercent(interview.technicalKnowledge)} 
                            label="Tech Knowledge" 
                            subtitle="Conceptual correct scope" 
                            colorClass="stroke-teal-500 dark:stroke-teal-400" 
                        />

                        <CircularGauge 
                            percent={getMetricPercent(interview.communication)} 
                            label="Communication" 
                            subtitle="Articulation & speed" 
                            colorClass="stroke-violet-600 dark:stroke-violet-405" 
                        />

                        <CircularGauge 
                            percent={getMetricPercent(interview.confidence)} 
                            label="Confidence" 
                            subtitle="Pacing & posture" 
                            colorClass="stroke-emerald-600 dark:stroke-emerald-400" 
                        />

                        <CircularGauge 
                            percent={getMetricPercent(interview.hrReadiness)} 
                            label={isCoding ? "Code Standards" : "HR Readiness"}
                            subtitle="Recruiter fit metrics" 
                            colorClass="stroke-amber-600 dark:stroke-amber-400" 
                        />

                    </div>
                </div>

                {/* Actions sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-center space-y-2.5">
                    <button
                        onClick={handleDownloadReport}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer border-0"
                    >
                        <Download className="w-4 h-4" /> Download Report
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                        <History className="w-4 h-4" /> Prep Dashboard
                    </button>

                    <button
                        onClick={() => navigate("/create-interview")}
                        className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-850 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer border-0"
                    >
                        <RefreshCw className="w-4 h-4" /> Retake Simulation
                    </button>
                </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">
                    <h3 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-450 tracking-wider mb-2.5 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Executive Strengths
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        {interview.strengthsSummary || "Candidate demonstrated a clear understanding of concept requirements and expressed core structures correctly."}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">
                    <h3 className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider mb-2.5 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Areas of Improvement
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        {interview.improvementAreasSummary || "Focus on explaining concepts using technical step-by-step nomenclature and dry-running code variables to check edge behaviors."}
                    </p>
                </div>
            </div>

            {/* Recommended topics */}
            {interview.recommendedTopics && interview.recommendedTopics.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg mb-6">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Recommended Revision Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {interview.recommendedTopics.map((topic, i) => (
                            <span 
                                key={i}
                                className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions list breakdown */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-lg">
                <h2 className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">
                    Question breakdown
                </h2>

                <div className="space-y-4">
                    {interview.answers.map((item, index) => {
                        const isHigh = item.score >= 8;
                        const isWeak = item.score < 5;
                        const isSkipped = item.isSkipped;
                        const isBookmarked = interview.bookmarkedQuestions?.includes(index);
                        
                        return (
                            <div
                                key={index}
                                className={`border rounded-xl p-4.5 transition duration-200 hover:shadow-xs relative ${
                                    isSkipped
                                        ? "border-amber-100/45 dark:border-amber-950/20 bg-amber-50/5 dark:bg-amber-950/5"
                                        : (isHigh 
                                            ? "border-emerald-200/60 dark:border-emerald-950/30 bg-emerald-50/5 dark:bg-emerald-950/5" 
                                            : (isWeak ? "border-rose-200/60 dark:border-rose-950/30 bg-rose-50/5 dark:bg-rose-950/5" : "border-slate-200/60 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-900/10"))
                                }`}
                            >
                                <div className="flex justify-between items-center gap-2 mb-3">
                                    <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                        <HelpCircle className="w-4 h-4" /> Question {index + 1}
                                        {isBookmarked && (
                                            <span className="text-[8px] bg-amber-500/10 text-amber-500 font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                                                ★ Bookmarked
                                            </span>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {isSkipped ? (
                                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold border bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-600 dark:text-amber-400">
                                                Skipped
                                            </span>
                                        ) : (
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border ${
                                                isHigh
                                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                    : (isWeak ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400")
                                            }`}>
                                                Score: {item.score} / 10
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-slate-800 dark:text-slate-100 font-bold text-sm mb-3">
                                    {item.question}
                                </p>

                                {!isSkipped ? (
                                    <>
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-xl p-3 mb-3 text-xs">
                                            <span className="font-bold text-slate-400 dark:text-slate-500 block mb-1 uppercase tracking-wider text-[8px]">Your Response</span>
                                            <p className={`text-slate-600 dark:text-slate-300 italic ${isCoding ? "font-mono bg-slate-100/50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 leading-normal" : ""}`}>
                                                {isCoding ? item.answer : `"${item.answer}"`}
                                            </p>
                                        </div>

                                        <div className="space-y-2 mt-3.5 text-xs text-slate-700 dark:text-slate-300">
                                            <p className="leading-relaxed"><strong className="text-slate-800 dark:text-slate-100 font-bold">AI Evaluation Feedback:</strong> {item.feedback}</p>
                                            
                                            {item.strengths && (
                                                <div className="bg-emerald-50/40 dark:bg-emerald-950/15 p-2.5 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 text-slate-700 dark:text-slate-300">
                                                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Strengths:</strong> {item.strengths}
                                                </div>
                                            )}

                                            {item.improvement && (
                                                <div className="bg-amber-50/40 dark:bg-amber-900/15 p-2.5 rounded-xl border border-amber-100/30 dark:border-amber-900/20 text-slate-700 dark:text-slate-300">
                                                    <strong className="text-amber-700 dark:text-amber-400 font-bold">AI Coaching Tip:</strong> {item.improvement}
                                                </div>
                                            )}

                                            {item.correctAnswer && (
                                                <div className="bg-indigo-50/20 dark:bg-indigo-950/15 p-2.5 rounded-xl border border-indigo-100/20 dark:border-indigo-900/20 text-slate-700 dark:text-slate-300">
                                                    <strong className="text-indigo-700 dark:text-indigo-400 font-bold">{isCoding ? "Suggested Model Code:" : "Suggested Reference Answer:"}</strong>
                                                    <p className={`mt-1 text-slate-600 dark:text-slate-300 italic ${isCoding ? "font-mono bg-slate-100/50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 leading-normal" : ""}`}>
                                                        {item.correctAnswer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                                        This question was skipped. You can retake the simulation to try again!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default InterviewResult;