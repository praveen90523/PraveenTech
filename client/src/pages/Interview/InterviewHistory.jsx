import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function InterviewHistory() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "https://praveentech-backend.onrender.com/api/interviews",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setInterviews(res.data.interviews || []);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Failed to load interviews"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                            Interview History
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs font-medium">
                            Track all your AI Mock Interviews
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/create-interview")
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition duration-200 text-xs"
                    >
                        + New Interview
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-705 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl mb-6 text-xs font-semibold">
                        {error}
                    </div>
                )}

                {interviews.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm dark:shadow-lg p-10 text-center">
                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                            No Interviews Found
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 mt-3 text-xs">
                            Create your first AI Mock Interview.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/create-interview")
                            }
                            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition duration-200 text-xs"
                        >
                            Start Interview
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews.map((interview) => (
                            <div
                                key={interview._id}
                                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm dark:shadow-lg p-6 hover:shadow-md hover:-translate-y-0.5 transition duration-300 border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${interview.type === "coding"
                                                ? "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/30"
                                                : (interview.mode === "executive" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" : "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30")
                                            }`}>
                                            {interview.type === "coding" ? "Coding" : (interview.mode === "executive" ? "Executive" : "Concept")}
                                        </span>
                                        <span className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                                            {interview.domain}
                                        </span>
                                    </div>

                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${interview.status === "completed"
                                                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400"
                                            }`}
                                    >
                                        {interview.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                    {interview.role}
                                </h3>

                                <p className="text-slate-500 dark:text-slate-450 mt-2 text-xs">
                                    Difficulty:
                                    {" "}
                                    {interview.difficulty}
                                </p>

                                <p className="text-slate-500 dark:text-slate-450 text-xs mt-0.5">
                                    Questions:
                                    {" "}
                                    {interview.questions?.length || 0}
                                </p>

                                <div className="mt-4">
                                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                        Final Score
                                    </div>

                                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                        {interview.finalScore || 0}/10
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/interview/${interview._id}`
                                            )
                                        }
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition duration-200"
                                    >
                                        {interview.status ===
                                            "completed"
                                            ? "View"
                                            : "Continue"}
                                    </button>

                                    {interview.status ===
                                        "completed" && (
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/result/${interview._id}`
                                                    )
                                                }
                                                className="flex-1 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-bold py-2.5 rounded-xl text-xs transition duration-200"
                                            >
                                                Result
                                            </button>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterviewHistory;