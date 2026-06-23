import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchResumeHistory,
    fetchResumeDetails,
    uploadResumeAction,
    deleteResumeAction,
    clearCurrentAnalysis,
} from "../../redux/slices/resumeSlice.js";
import {
    Upload,
    FileText,
    Trash2,
    Briefcase,
    Code,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Plus,
    ChevronRight,
    Loader2,
    Calendar,
    Award,
    Sparkles,
    Eye
} from "lucide-react";

export default function ResumeIntelligence() {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    // State from Redux
    const { history, currentAnalysis, loading, uploading, error } = useSelector(
        (state) => state.resumes
    );

    // Local UI states
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState("");
    const [targetDescription, setTargetDescription] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // "all", "skills", "experience", "projects"
    const [uploadStep, setUploadStep] = useState(0);

    // Load history on mount
    useEffect(() => {
        dispatch(fetchResumeHistory());
    }, [dispatch]);

    // Simulated progress steps for the loader during analysis
    useEffect(() => {
        let interval;
        if (uploading) {
            setUploadStep(0);
            interval = setInterval(() => {
                setUploadStep((prev) => {
                    if (prev < 3) return prev + 1;
                    return prev;
                });
            }, 3000);
        } else {
            setUploadStep(0);
        }
        return () => clearInterval(interval);
    }, [uploading]);

    const processingSteps = [
        "Reading and uploading PDF document...",
        "Parsing resume text extraction...",
        "Analyzing skills, experience, and projects using Gemini AI...",
        "Calculating ATS score and generating career recommendations..."
    ];

    // File Drag handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                alert("Only PDF files are supported.");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    // Form submission
    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole);
        formData.append("targetDescription", targetDescription);

        await dispatch(uploadResumeAction(formData));
        setFile(null);
        setTargetRole("");
        setTargetDescription("");
    };

    // Selecting a past record
    const handleSelectResume = (id) => {
        dispatch(fetchResumeDetails(id));
    };

    // Deleting a record
    const handleDeleteResume = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this analysis report?")) {
            dispatch(deleteResumeAction(id));
        }
    };

    const handleNewUploadClick = () => {
        dispatch(clearCurrentAnalysis());
    };

    // Color mapper for ATS score
    const getScoreColorClass = (score) => {
        if (score >= 80) return "text-emerald-500 stroke-emerald-500 border-emerald-250 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20";
        if (score >= 60) return "text-amber-500 stroke-amber-500 border-amber-250 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20";
        return "text-rose-500 stroke-rose-500 border-rose-250 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20";
    };

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    ATS Audit
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                    Resume Intelligence
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Evaluate your resume match accuracy, identify missing skills, and unlock career optimizations.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto gap-6 items-stretch">

                {/* Left Sidebar - Resume History */}
                <div className="w-full lg:w-72 flex flex-col bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shrink-0 max-h-[500px] lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar shadow-sm dark:shadow-lg">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <FileText className="w-4.5 h-4.5 text-indigo-500" />
                            History Logs
                        </h2>
                        <button
                            onClick={handleNewUploadClick}
                            className="bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 px-2.5 py-1 rounded-lg transition duration-200 flex items-center gap-1 text-[10px] font-bold border border-indigo-105 dark:border-indigo-900/30"
                            title="Upload new resume"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New
                        </button>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-y-auto">
                        {loading && history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin mb-2" />
                                <span className="text-[10px] text-slate-450">Loading history...</span>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <FileText className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                <p className="text-xs font-semibold text-slate-400">No resumes analyzed yet</p>
                                <p className="text-[10px] text-slate-500 mt-1">Upload a PDF resume to get started</p>
                            </div>
                        ) : (
                            history.map((item) => {
                                const isSelected = currentAnalysis?._id === item._id;
                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => handleSelectResume(item._id)}
                                        className={`group relative p-2.5 rounded-xl cursor-pointer border transition-all duration-200 flex items-center gap-3 ${isSelected
                                                ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 shadow-sm"
                                                : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                                            }`}
                                    >
                                        <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 text-xs font-extrabold ${item.atsScore >= 80
                                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                                                : item.atsScore >= 60
                                                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600"
                                                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600"
                                            }`}>
                                            {item.atsScore}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {item.targetRole || "General Analysis"}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => handleDeleteResume(e, item._id)}
                                                className="p-1 text-slate-400 hover:text-rose-650 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition duration-200"
                                                title="Delete analysis report"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Side - Analysis Dashboard / Upload Zone */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Error Alerts */}
                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-sm">
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold">Analysis Error</h4>
                                <p className="text-[11px] mt-1 leading-normal">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Loader during Gemini Analysis processing */}
                    {uploading ? (
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[450px] shadow-sm dark:shadow-lg animate-fadeIn">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 border-4 border-indigo-105 border-t-indigo-600 rounded-full animate-spin"></div>
                                <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>

                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 text-center animate-pulse">
                                Resume Intelligence Processing
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center max-w-xs leading-relaxed">
                                Please wait while Gemini AI parses your document, extracts milestones/skills, and audits core matching parameters.
                            </p>

                            <div className="mt-8 w-full max-w-xs bg-slate-100 dark:bg-slate-905 h-1 rounded-full overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-1 rounded-full transition-all duration-700"
                                    style={{ width: `${(uploadStep + 1) * 25}%` }}
                                ></div>
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>{processingSteps[uploadStep]}</span>
                            </div>
                        </div>
                    ) : !currentAnalysis ? (

                        /* Upload Form */
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm dark:shadow-lg animate-fadeIn">
                            <div className="mb-6">
                                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    ATS Placement Analyzer
                                </h2>
                                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 leading-relaxed">
                                    Upload your resume PDF to calculate your ATS match score, extract skills, and identify missing gaps for target job configurations.
                                </p>
                            </div>

                            <form onSubmit={handleAnalyze} className="space-y-5">

                                {/* Drag & Drop Area */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={handleUploadClick}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group ${dragActive
                                            ? "border-indigo-500 bg-indigo-50/20"
                                            : file
                                                ? "border-emerald-500 bg-emerald-50/10"
                                                : "border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        className="hidden"
                                    />

                                    {file ? (
                                        <>
                                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm mb-3">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{file.name}</h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                                            </p>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                }}
                                                className="mt-3.5 text-[10px] font-bold text-rose-500 hover:underline"
                                            >
                                                Change File
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-103 transition-transform mb-3">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-750 dark:text-slate-300">
                                                Drag & drop your resume PDF here
                                            </h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">browse file</span> from computer
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* Custom target job matching parameters */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-xs font-bold text-slate-750 dark:text-slate-250 flex items-center gap-1.5 mb-2">
                                        <Award className="w-4 h-4 text-indigo-500" />
                                        Target Job Customization (Optional)
                                    </h3>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mb-4 leading-relaxed">
                                        Providing a target job details helps Gemini tailor the ATS matching scoring.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                                Target Job Title
                                            </label>
                                            <input
                                                type="text"
                                                value={targetRole}
                                                onChange={(e) => setTargetRole(e.target.value)}
                                                placeholder="e.g. Full Stack Developer, DevOps Engineer"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-700 dark:text-slate-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                                Job Description Requirements
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={targetDescription}
                                                onChange={(e) => setTargetDescription(e.target.value)}
                                                placeholder="Paste key responsibilities or core tech stacks required..."
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:border-indigo-500 text-slate-700 dark:text-slate-200 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!file}
                                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all text-xs flex items-center justify-center gap-1.5 ${file
                                            ? "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-sm"
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
                                        }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Analyze Resume Report</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* Analysis Report Card Details */
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg flex flex-col min-h-0 overflow-y-auto animate-fadeIn">

                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4.5 mb-5">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-105 dark:border-indigo-900/30 uppercase tracking-wide">
                                            ATS Scorecard
                                        </span>
                                        {currentAnalysis.targetRole && (
                                            <span className="text-[9px] font-bold bg-slate-105 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded truncate max-w-xs">
                                                Target: {currentAnalysis.targetRole}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2 flex items-center gap-1.5">
                                        <FileText className="w-5 h-5 text-indigo-500" />
                                        Audit Breakdown Details
                                    </h1>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                                        <span>Analyzed {new Date(currentAnalysis.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <a
                                            href={`https://praveentech-backend.onrender.com${currentAnalysis.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View PDF
                                        </a>
                                    </p>
                                </div>
                                <button
                                    onClick={handleNewUploadClick}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition duration-200 flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    New upload
                                </button>
                            </div>

                            {/* Score Ring & Feedback summary */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">

                                {/* Ring card */}
                                <div className={`md:col-span-4 rounded-2xl border p-5 flex flex-col items-center justify-center text-center relative overflow-hidden ${getScoreColorClass(currentAnalysis.atsScore)}`}>
                                    <div className="relative w-24 h-24 flex items-center justify-center mb-2.5">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r={35}
                                                className="stroke-slate-100 dark:stroke-slate-700 fill-none"
                                                strokeWidth="6"
                                            />
                                            <circle
                                                cx="48"
                                                cy="48"
                                                r={35}
                                                className="fill-none transition-all duration-1000 ease-out"
                                                strokeWidth="6"
                                                strokeDasharray={2 * Math.PI * 35}
                                                strokeDashoffset={2 * Math.PI * 35 - (currentAnalysis.atsScore / 100) * 2 * Math.PI * 35}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{currentAnalysis.atsScore}</span>
                                            <span className="text-[8px] uppercase tracking-wider text-slate-450 font-bold">ATS Score</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                                        {currentAnalysis.atsScore >= 80
                                            ? "Strong Candidate Match"
                                            : currentAnalysis.atsScore >= 60
                                                ? "Good Match with Gaps"
                                                : "Needs Refactoring"}
                                    </h3>
                                </div>

                                {/* Summary */}
                                <div className="md:col-span-8 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1 mb-2">
                                            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                                            AI Executive Feedback
                                        </h3>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic font-medium">
                                            "{currentAnalysis.feedback}"
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-3xs">
                                        <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-350">Optimization Goal</p>
                                            <p className="text-[9px] text-slate-550 dark:text-slate-500 truncate mt-0.5">
                                                {currentAnalysis.missingSkills?.length > 0
                                                    ? `Incorporate ${currentAnalysis.missingSkills[0]} and other gaps to raise score.`
                                                    : "Your core skills align nicely! Highlight achievements."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section tabs */}
                            <div className="flex border-b border-slate-100 dark:border-slate-800/80 mb-5 overflow-x-auto gap-1">
                                {[
                                    { id: "all", label: "Overview" },
                                    { id: "skills", label: "Skills Gap" },
                                    { id: "experience", label: "Experience" },
                                    { id: "projects", label: "Projects" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-3.5 font-bold text-xs rounded-t-xl transition-all border-b-2 shrink-0 ${activeTab === tab.id
                                                ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-500 bg-indigo-50/20"
                                                : "text-slate-400 border-transparent hover:text-slate-600"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab items */}
                            <div className="flex-1 min-h-[250px]">

                                {activeTab === "all" && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-750 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                                                <Code className="w-4 h-4 text-indigo-500" />
                                                Core & Target Skills Comparison
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Extracted Skills ({currentAnalysis.extractedSkills?.length})
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {currentAnalysis.extractedSkills?.map((skill, i) => (
                                                            <span key={i} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 px-2 py-0.5 rounded font-semibold border border-emerald-150/40 dark:border-emerald-900/30">
                                                                {skill}
                                                            </span>
                                                        )) || <span className="text-xs text-slate-400">None detected</span>}
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Missing Gaps ({currentAnalysis.missingSkills?.length})
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {currentAnalysis.missingSkills?.map((skill, i) => (
                                                            <span key={i} className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded font-semibold border border-rose-150/40 dark:border-rose-900/30">
                                                                {skill}
                                                            </span>
                                                        )) || <span className="text-[10px] text-slate-400 italic">Perfect match! No gaps.</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-350 mb-3 flex items-center gap-1.5">
                                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                                    Experience snippet
                                                </h3>
                                                <div className="space-y-2.5">
                                                    {currentAnalysis.extractedExperience?.slice(0, 2).map((exp, i) => (
                                                        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xs">
                                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.role}</h4>
                                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{exp.company} • {exp.duration}</p>
                                                            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{exp.description}</p>
                                                        </div>
                                                    )) || <p className="text-xs text-slate-400">No experience parsed.</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                                                    <Code className="w-4 h-4 text-indigo-500" />
                                                    Key projects
                                                </h3>
                                                <div className="space-y-2.5">
                                                    {currentAnalysis.extractedProjects?.slice(0, 2).map((proj, i) => (
                                                        <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl shadow-xs">
                                                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{proj.title}</h4>
                                                            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{proj.description}</p>
                                                        </div>
                                                    )) || <p className="text-xs text-slate-400">No projects parsed.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === "skills" && (
                                    <div className="space-y-5 animate-fadeIn">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2.5">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                                                Verified Resume Skills
                                            </h3>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                                                These skills are explicitly mentioned or strongly inferred in your resume document.
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {currentAnalysis.extractedSkills?.map((skill, i) => (
                                                    <span key={i} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 font-bold px-2.5 py-1.5 rounded flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                        {skill}
                                                    </span>
                                                )) || <span className="text-xs text-slate-400">No skills parsed</span>}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2.5">
                                                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                                                Missing Core Skills
                                            </h3>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
                                                Gaps identified by comparing your resume with core requirements.
                                            </p>

                                            {currentAnalysis.missingSkills?.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {currentAnalysis.missingSkills.map((skill, i) => (
                                                        <span key={i} className="text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 font-bold px-2.5 py-1.5 rounded flex items-center gap-1">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded text-[10px] font-bold">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Excellent match! Your resume contains all core skills needed.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "experience" && (
                                    <div className="space-y-3.5 animate-fadeIn">
                                        {currentAnalysis.extractedExperience && currentAnalysis.extractedExperience.length > 0 ? (
                                            currentAnalysis.extractedExperience.map((exp, i) => (
                                                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm transition hover:shadow-md">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                        <div>
                                                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.role}</h3>
                                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{exp.company}</p>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {exp.duration}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">
                                                        {exp.description}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <Briefcase className="w-7 h-7 mx-auto text-slate-200 dark:text-slate-800 mb-2" />
                                                <p className="text-[10px] font-bold">No professional experience parsed.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "projects" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                        {currentAnalysis.extractedProjects && currentAnalysis.extractedProjects.length > 0 ? (
                                            currentAnalysis.extractedProjects.map((proj, i) => (
                                                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md">
                                                    <div>
                                                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                            <Code className="w-4 h-4 text-indigo-500" />
                                                            {proj.title}
                                                        </h3>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2 whitespace-pre-line">
                                                            {proj.description}
                                                        </p>
                                                    </div>

                                                    {proj.technologies && proj.technologies.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                            <p className="text-[8px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                                                                Technologies Used
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {proj.technologies.map((t, idx) => (
                                                                    <span key={idx} className="text-[9px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="md:col-span-2 text-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <Code className="w-7 h-7 mx-auto text-slate-200 dark:text-slate-800 mb-2" />
                                                <p className="text-[10px] font-bold">No projects parsed from resume.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
