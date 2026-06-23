import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Keyboard,
    LogOut,
    Volume2,
    VolumeX,
    Clock,
    Sparkles,
    ArrowRight,
    AlertCircle,
    Play,
    Send,
    Bot,
    User,
    Terminal,
    Bookmark,
    Star
} from "lucide-react";

function InterviewSession() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Simulator metrics
    const [timer, setTimer] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [recordingTimer, setRecordingTimer] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState(null);

    // Audio & Dictation states
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem("interview_muted") === "true";
    });
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    // Video stream state
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [videoStream, setVideoStream] = useState(null);
    const videoRef = useRef(null);

    // Modals
    const [showExitModal, setShowExitModal] = useState(false);

    // New premium tools state
    const [inputMode, setInputMode] = useState("text"); // "text" | "voice"
    const [notes, setNotes] = useState("");
    const saveNotesTimeoutRef = useRef(null);

    useEffect(() => {
        fetchInterview();

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = false;
            rec.lang = "en-US";

            rec.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setAnswer(prev => prev + (prev.trim() ? " " : "") + finalTranscript.trim());
                }
            };

            rec.onerror = (err) => {
                console.error("Speech Recognition error:", err);
                setIsRecording(false);
            };

            rec.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = rec;
        }

        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Sync current question state
    useEffect(() => {
        if (interview) {
            const existingAnswer = interview.answers[currentQuestion];
            if (existingAnswer) {
                setAnswer(existingAnswer.isSkipped ? "" : (existingAnswer.answer || ""));
                setIsSubmitted(existingAnswer.isSkipped ? false : !!existingAnswer.answer);
                setEvaluationResult(existingAnswer.isSkipped ? null : existingAnswer);
            } else {
                setAnswer("");
                setIsSubmitted(false);
                setEvaluationResult(null);
            }
            setTimer(0);
        }
    }, [currentQuestion, interview]);

    // Speak active question whenever currentQuestion changes or submission resets
    useEffect(() => {
        if (interview && interview.questions[currentQuestion] && !isSubmitted) {
            speakQuestion(interview.questions[currentQuestion]);
        }
    }, [currentQuestion, isSubmitted]);

    // Answering countup timer
    useEffect(() => {
        let interval = null;
        if (!loading && !isSubmitted && interview) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [loading, isSubmitted, interview, currentQuestion]);

    // 60-second auto-stop recording timer
    useEffect(() => {
        let interval = null;
        if (isRecording) {
            setRecordingTimer(0);
            interval = setInterval(() => {
                setRecordingTimer(prev => {
                    if (prev >= 59) {
                        if (recognitionRef.current) {
                            recognitionRef.current.stop();
                        }
                        setIsRecording(false);
                        clearInterval(interval);
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            setRecordingTimer(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Word counter
    useEffect(() => {
        const text = answer.trim();
        if (!text) {
            setWordCount(0);
        } else {
            const words = text.split(/\s+/).filter(Boolean).length;
            setWordCount(words);
        }
    }, [answer]);

    // Keep camera source bound
    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    const speakQuestion = (text) => {
        window.speechSynthesis.cancel();
        if (isMuted) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        localStorage.setItem("interview_muted", String(newMuted));
        if (newMuted) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else if (interview && interview.questions[currentQuestion]) {
            speakQuestion(interview.questions[currentQuestion]);
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Voice dictation is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const toggleCamera = async () => {
        if (isCameraOn) {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            setVideoStream(null);
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setVideoStream(stream);
                setIsCameraOn(true);
            } catch (err) {
                console.error("Camera access error:", err);
                alert("Could not access camera. Please check your browser permissions.");
            }
        }
    };

    const fetchInterview = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`https://praveentech-backend.onrender.com/api/interviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setInterview(res.data.interview);
            if (res.data.interview.status === "completed") {
                navigate(`/result/${id}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load interview session");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            return alert("Please type or speak your answer before submitting.");
        }

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `https://praveentech-backend.onrender.com/api/interviews/${id}/answer`,
                {
                    question: interview.questions[currentQuestion],
                    answer,
                    questionIndex: currentQuestion,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setInterview(res.data.interview);
            setEvaluationResult(res.data.evaluation);
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to evaluate answer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkipQuestion = async () => {
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `https://praveentech-backend.onrender.com/api/interviews/${id}/answer`,
                {
                    question: interview.questions[currentQuestion],
                    answer: "",
                    isSkipped: true,
                    questionIndex: currentQuestion,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setInterview(res.data.interview);

            if (currentQuestion < interview.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to skip question");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleBookmark = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `https://praveentech-backend.onrender.com/api/interviews/${id}/bookmark`,
                { questionIndex: currentQuestion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInterview(res.data.interview);
        } catch (err) {
            console.error("Failed to toggle bookmark:", err);
        }
    };

    const handleNotesChange = (e) => {
        const val = e.target.value;
        setNotes(val);

        if (saveNotesTimeoutRef.current) {
            clearTimeout(saveNotesTimeoutRef.current);
        }

        saveNotesTimeoutRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem("token");
                await axios.put(
                    `https://praveentech-backend.onrender.com/api/interviews/${id}/notes`,
                    { notes: val },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to auto-save notes:", err);
            }
        }, 1500);
    };

    const handleNextQuestion = () => {
        setAnswer("");
        setEvaluationResult(null);
        setIsSubmitted(false);
        setTimer(0);

        if (currentQuestion < interview.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handleFinishInterview = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");

            await axios.post(
                `https://praveentech-backend.onrender.com/api/interviews/${id}/complete`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/result/${id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to finalize assessment report.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleExitInterview = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
        navigate("/dashboard");
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-455 mt-4 font-semibold animate-pulse">Entering assessment room...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-6">
                <div className="max-w-xl mx-auto bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="font-semibold text-xs">{error}</span>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-455 mt-4 font-semibold animate-pulse">Entering assessment room...</span>
                </div>
            </div>
        );
    }

    const getQuality = (words) => {
        if (words < 15) return { label: "Too Brief", textColor: "text-rose-500" };
        if (words <= 80) return { label: "Concise & Focused", textColor: "text-emerald-500" };
        return { label: "Verbose", textColor: "text-amber-550 dark:text-amber-400" };
    };

    const quality = getQuality(wordCount);

    const totalQuestions = interview.questions.length;
    const progressPercent = Math.round(((currentQuestion + 1) / totalQuestions) * 100);
    const isCodingMode = interview.type === "coding";

    return (
        <div className="w-full select-none flex flex-col min-h-[calc(100vh-8rem)] max-w-6xl mx-auto pb-10">

            {/* ── Top Bar ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl px-5 py-3.5 mb-5 flex justify-between items-center shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${isCodingMode
                                ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400"
                                : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400"
                            }`}>
                            {isCodingMode ? "Coding Challenge" : (interview.mode === "executive" ? "Executive Round" : "Technical Concept")}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            · {interview.difficulty}
                        </span>
                    </div>
                    <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {interview.role} Simulation
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer pill */}
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Timer: <span className="font-bold text-slate-800 dark:text-slate-200">{formatTime(timer)}</span></span>
                    </div>

                    {/* Progress */}
                    <div className="w-28 hidden sm:block">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                            <span>Q {currentQuestion + 1} of {totalQuestions}</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1">
                            <div
                                className="bg-indigo-600 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 items-start">

                {/* ─── Column 1: Cameras ─── */}
                <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-4">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                        {/* Candidate tile */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[190px] shadow-sm dark:shadow-lg">
                            {isCameraOn && videoStream ? (
                                <video
                                    ref={videoRef}
                                    autoPlay playsInline muted
                                    className="w-full h-full object-cover transform -scale-x-100 absolute inset-0"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 p-4">
                                    <div className="w-11 h-11 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-full flex items-center justify-center">
                                        You
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Camera Off</p>
                                </div>
                            )}
                            <span className="absolute bottom-2 left-2 bg-slate-900/70 dark:bg-slate-950/70 backdrop-blur-sm text-[9px] font-bold text-white px-2 py-0.5 rounded-lg flex items-center gap-1.5 z-10">
                                <span className={`w-1.5 h-1.5 rounded-full ${isCameraOn ? "bg-emerald-400" : "bg-rose-400"}`} />
                                You
                            </span>
                        </div>

                        {/* AI Coach tile */}
                        <div className="bg-white dark:bg-slate-800 bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/80 dark:to-indigo-950 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden p-4 min-h-[190px] shadow-sm dark:shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${isSpeaking
                                    ? "bg-indigo-100 ring-4 ring-indigo-200/55 dark:bg-indigo-600 dark:ring-indigo-500/30 scale-105"
                                    : isRecording
                                        ? "bg-rose-500 ring-4 ring-rose-300/30 dark:bg-rose-600 dark:ring-rose-500/30 animate-pulse"
                                        : "bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/30"
                                }`}>
                                <Bot className={`w-7 h-7 ${isSpeaking || isRecording
                                        ? "text-white"
                                        : "text-indigo-600 dark:text-indigo-400"
                                    }`} />
                            </div>
                            <h3 className="text-slate-805 dark:text-slate-100 font-bold text-xs tracking-wide">Coach Praveen Tech</h3>

                            {/* Status bar */}
                            <div className="flex items-center gap-1 mt-1.5 h-5">
                                {isSpeaking ? (
                                    <>
                                        {[0.1, 0.2, 0.3, 0.4].map((d, i) => (
                                            <div key={i} className="w-0.5 bg-indigo-600 dark:bg-white/80 rounded animate-bounce" style={{ height: `${[10, 16, 8, 14][i]}px`, animationDelay: `${d}s` }} />
                                        ))}
                                        <span className="text-[9px] text-indigo-600 dark:text-white/80 font-bold ml-1 uppercase tracking-wider">Speaking</span>
                                    </>
                                ) : isRecording ? (
                                    <span className="text-[9px] text-rose-600 dark:text-rose-455 font-bold uppercase tracking-wider animate-pulse">Listening…</span>
                                ) : submitting ? (
                                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Analyzing…</span>
                                ) : (
                                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Idle</span>
                                )}
                            </div>

                            {/* Volume / Replay controls */}
                            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                                <button
                                    onClick={toggleMute}
                                    className={`p-1.5 rounded-lg border transition ${isMuted
                                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-250 dark:border-rose-900/50 text-rose-600 dark:text-rose-400"
                                            : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-605 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                        }`}
                                    title={isMuted ? "Unmute AI" : "Mute AI"}
                                >
                                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onClick={() => speakQuestion(interview.questions[currentQuestion])}
                                    className="p-1.5 rounded-lg bg-slate-105 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-605 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                    title="Repeat Question"
                                    disabled={isSpeaking || submitting}
                                >
                                    <Play className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <span className="absolute bottom-2 left-2 bg-slate-900/40 dark:bg-black/40 backdrop-blur-sm text-[9px] font-bold text-slate-650 dark:text-slate-300 px-2 py-0.5 rounded-lg">
                                Interviewer
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Column 2: Question & Answer Area ─── */}
                <div className="md:col-span-6 lg:col-span-6 flex flex-col gap-4">
                    {/* Question + Answer card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">

                        {/* Question prompt header */}
                        <div className="flex justify-between items-start gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex-1">
                                <span className="text-[9px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block mb-1.5">
                                    Current Question
                                </span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                    {interview.questions[currentQuestion]}
                                </p>
                            </div>
                            <button
                                onClick={handleToggleBookmark}
                                className={`p-2 rounded-xl transition shrink-0 ${interview.bookmarkedQuestions?.includes(currentQuestion)
                                        ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                                        : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                                title="Bookmark Question"
                            >
                                <Bookmark className="w-4 h-4 fill-current" />
                            </button>
                        </div>

                        {/* Input area or feedback */}
                        {!isSubmitted ? (
                            <div className="space-y-3 animate-fadeIn">

                                {/* Mode tabs */}
                                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                                    {["text", "voice"].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setInputMode(mode)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${inputMode === mode
                                                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-705 dark:hover:text-slate-300"
                                                }`}
                                        >
                                            {mode === "text" ? "✏️ Text" : "🎙️ Voice"}
                                        </button>
                                    ))}
                                </div>

                                {inputMode === "voice" ? (
                                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-5 flex flex-col items-center gap-4 min-h-[150px] text-center animate-fadeIn">
                                        <button
                                            type="button"
                                            onClick={toggleRecording}
                                            disabled={submitting}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${isRecording
                                                    ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-300/40"
                                                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                }`}
                                        >
                                            {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                        </button>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {isRecording ? "Recording… speak clearly" : "Click mic to start dictation"}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {isRecording ? `${recordingTimer}s / 60s — click again to stop` : "Transcripts appear below automatically"}
                                            </p>
                                        </div>
                                        {answer && (
                                            <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 rounded-xl p-3 text-[10px] text-slate-750 dark:text-slate-300 w-full text-left max-h-24 overflow-y-auto custom-scrollbar">
                                                <strong className="text-indigo-505 block mb-1">Live Transcript:</strong>
                                                {answer}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative animate-fadeIn">
                                        <textarea
                                            rows={isCodingMode ? 7 : 5}
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder={
                                                isCodingMode
                                                    ? "// Write your solution code here...\nfunction solution() {\n  \n}"
                                                    : "Type your answer here…"
                                            }
                                            className={`w-full p-4 rounded-xl text-[13px] leading-relaxed transition focus:outline-none focus:ring-2 resize-none border ${isCodingMode
                                                    ? "font-mono bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-indigo-300 placeholder-slate-400 dark:placeholder-slate-700 focus:ring-violet-500/30"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-555 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500"
                                                }`}
                                            disabled={submitting}
                                        />
                                        {isCodingMode && (
                                            <div className="absolute right-3 top-3 bg-violet-950/80 border border-violet-850/50 text-violet-300 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider select-none">
                                                Editor
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Word count footer */}
                                <div className="flex justify-between items-center text-[10px] font-medium text-slate-450 dark:text-slate-400 px-0.5">
                                    {isRecording ? (
                                        <span className="text-rose-500 animate-pulse flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                            Voice active · {recordingTimer}s / 60s
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span>{wordCount} words</span>
                                            {wordCount > 0 && (
                                                <span className={`font-bold ${quality.textColor}`}>· {quality.label}</span>
                                            )}
                                        </span>
                                    )}
                                    <span>Submit when ready</span>
                                </div>
                            </div>
                        ) : (
                            /* ── Evaluation feedback ── */
                            <div className="space-y-4 animate-fadeIn">
                                {/* Score header */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-705 dark:text-slate-200 uppercase tracking-wider">Evaluation</h4>
                                        <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
                                            Confidence: <span className="font-semibold text-slate-705 dark:text-slate-300">{evaluationResult.confidenceLevel || "Medium"}</span>
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-xl border text-xs font-black ${evaluationResult.score >= 8
                                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                                            : evaluationResult.score >= 5
                                                ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
                                                : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                                        }`}>
                                        {evaluationResult.score} / 10
                                    </div>
                                </div>

                                {/* Feedback */}
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                                    <strong className="text-slate-450 dark:text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">Feedback</strong>
                                    {evaluationResult.feedback}
                                </div>

                                {/* Strengths / Improvements */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                    {evaluationResult.strengths && (
                                        <div className="bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900/30 p-3.5 rounded-xl text-green-850 dark:text-green-300">
                                            <strong className="text-green-600 dark:text-green-400 block mb-1 text-[10px] uppercase tracking-wide font-black">Strengths</strong>
                                            {evaluationResult.strengths}
                                        </div>
                                    )}
                                    {evaluationResult.improvement && (
                                        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-100 dark:border-yellow-900/30 p-3.5 rounded-xl text-yellow-850 dark:text-yellow-300">
                                            <strong className="text-yellow-600 dark:text-yellow-400 block mb-1 text-[10px] uppercase tracking-wide font-black">Improvements</strong>
                                            {evaluationResult.improvement}
                                        </div>
                                    )}
                                </div>

                                {evaluationResult.correctAnswer && (
                                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3.5 rounded-xl text-[11px] text-indigo-850 dark:text-indigo-305">
                                        <strong className="text-indigo-600 dark:text-indigo-400 block mb-1 text-[10px] uppercase tracking-wide font-black">Reference Answer</strong>
                                        {evaluationResult.correctAnswer}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Column 3: Sidebar Controls ─── */}
                <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-4">

                    {/* Question Navigation */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg">
                        <h3 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-3">
                            Question Navigation
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {interview.questions.map((q, idx) => {
                                const answerObj = interview.answers[idx];
                                const isCurrent = idx === currentQuestion;
                                const isSkipped = answerObj?.isSkipped;
                                const isAnswered = answerObj && !answerObj.isSkipped && answerObj.answer;

                                let cls = "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750";
                                if (isCurrent) cls = "bg-indigo-600 text-white border-indigo-600 shadow-sm";
                                else if (isSkipped) cls = "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400";
                                else if (isAnswered) cls = "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400";

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestion(idx)}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold border transition flex items-center justify-center relative cursor-pointer ${cls}`}
                                    >
                                        {idx + 1}
                                        {interview.bookmarkedQuestions?.includes(idx) && (
                                            <span className="absolute -top-1 -right-0.5 text-[8px] text-amber-500">★</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            {[
                                { color: "bg-indigo-600", label: "Current" },
                                { color: "bg-green-500", label: "Done" },
                                { color: "bg-yellow-500", label: "Skipped" },
                            ].map(l => (
                                <span key={l.label} className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-450 dark:text-slate-400">
                                    <span className={`w-2 h-2 rounded-full ${l.color}`} />
                                    {l.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Coach Hints */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg">
                        <h3 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest mb-3">
                            Coach Praveen Tech's Hints
                        </h3>
                        <div className="space-y-2.5">
                            {[
                                {
                                    check: wordCount >= 15 && wordCount <= 80,
                                    label: "Keep answer concise (15–80 words)",
                                },
                                {
                                    check: wordCount > 10,
                                    label: "Explain core conceptual ideas",
                                },
                                {
                                    check: /example|instance|scenario|like|such as|demonstrate/i.test(answer),
                                    label: "Include a scenario or example",
                                },
                            ].map((hint, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors ${hint.check
                                            ? "bg-green-50 dark:bg-green-950/50 text-green-605 dark:text-green-400"
                                            : "bg-slate-105 dark:bg-slate-700 text-slate-350 dark:text-slate-500"
                                        }`}>
                                        ✓
                                    </span>
                                    <span className="text-[11px] font-medium text-slate-650 dark:text-slate-300">{hint.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Session Notebook */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm dark:shadow-lg flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest">
                                Session Notebook
                            </h3>
                            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-lg">
                                Auto-saved
                            </span>
                        </div>
                        <textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Jot down notes, key terms, or code patterns here…"
                            className="w-full flex-1 min-h-[140px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-[11px] text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500 dark:focus:border-indigo-500 resize-none font-sans"
                        />
                    </div>
                </div>
            </div>

            {/* ── Bottom Controls Bar ── */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mt-5 px-5 py-3 flex items-center justify-between shadow-sm dark:shadow-lg">

                {/* Leave */}
                <button
                    onClick={() => setShowExitModal(true)}
                    className="flex items-center gap-2 text-rose-605 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2 rounded-xl transition text-xs font-bold cursor-pointer"
                    title="Leave session"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Leave</span>
                </button>

                {/* Mic / Camera / Keyboard toggles */}
                <div className="flex items-center gap-2">
                    {!isSubmitted && (
                        <button
                            onClick={toggleRecording}
                            disabled={submitting}
                            title={isRecording ? "Stop dictation" : "Start voice dictation"}
                            className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer text-xs font-bold flex items-center gap-1.5 ${isRecording
                                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                                }`}
                        >
                            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </button>
                    )}

                    <button
                        onClick={toggleCamera}
                        title={isCameraOn ? "Mute webcam" : "Unmute webcam"}
                        className={`p-2.5 rounded-xl border transition active:scale-95 cursor-pointer ${isCameraOn
                                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                                : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                    >
                        {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>

                    {!isSubmitted && (
                        <button
                            onClick={() => { const el = document.querySelector("textarea"); if (el) el.focus(); }}
                            disabled={submitting}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-505 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-95 hidden sm:flex cursor-pointer"
                            title="Focus text input"
                        >
                            <Keyboard className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Submit / Skip / Next / Finish */}
                <div className="flex items-center gap-2">
                    {!isSubmitted ? (
                        <>
                            <button
                                onClick={handleSkipQuestion}
                                disabled={submitting}
                                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl transition active:scale-95 text-xs cursor-pointer"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={submitting || !answer.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                            >
                                {submitting
                                    ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Send className="w-3.5 h-3.5" />}
                                Submit Answer
                            </button>
                        </>
                    ) : currentQuestion < totalQuestions - 1 ? (
                        <button
                            onClick={handleNextQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                        >
                            Next Question
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinishInterview}
                            disabled={submitting}
                            className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-bold px-5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
                        >
                            {submitting
                                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <Sparkles className="w-3.5 h-3.5" />}
                            Finish Interview
                        </button>
                    )}
                </div>
            </div>

            {/* ── Exit Confirmation Modal ── */}
            {showExitModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700 shadow-2xl mx-4 text-center">
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/30">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Exit Assessment?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            Your completed answers are saved. You can continue this session from history.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition"
                            >
                                Stay
                            </button>
                            <button
                                onClick={handleExitInterview}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer transition"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default InterviewSession;