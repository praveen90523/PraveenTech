import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function QuizSession() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuiz();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `https://praveentech-backend.onrender.com/api/preparation/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success && res.data.quiz) {
                setQuiz(res.data.quiz);

                // Initialize selection state if it was already solved/in-progress
                if (res.data.quiz.completed) {
                    setResult(res.data.quiz);
                } else {
                    const initial = {};
                    res.data.quiz.questions.forEach((_, idx) => {
                        initial[idx] = "";
                    });
                    setSelectedAnswers(initial);
                }
            }
        } catch (error) {
            console.error("Fetch quiz error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIdx, optionText) => {
        if (result) return; // Locked if already submitted
        setSelectedAnswers(prev => ({
            ...prev,
            [qIdx]: optionText
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all answered
        const questionsCount = quiz.questions.length;
        const answeredCount = Object.values(selectedAnswers).filter(val => val !== "").length;
        if (answeredCount < questionsCount) {
            alert(`Please answer all ${questionsCount} questions before submitting.`);
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `https://praveentech-backend.onrender.com/api/preparation/${id}/quiz/submit`,
                { answers: Object.values(selectedAnswers) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res.data.success) {
                setResult(res.data.quiz);
                setQuiz(res.data.quiz);
            }
        } catch (error) {
            console.error("Submit quiz error:", error);
            alert("Error grading quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="spinner-border text-indigo-600 animate-spin" role="status"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="w-full text-center py-12">
                <span className="text-5xl mb-4 block">⚠️</span>
                <h2 className="text-xl font-bold text-gray-800">Quiz Session Not Found</h2>
                <button onClick={() => navigate(`/preparation/${id}`)} className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-xl">
                    Return to Topic
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">

            <div className="max-w-3xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => navigate(`/preparation/${id}`)}
                    className="text-gray-500 hover:text-indigo-600 text-sm font-semibold mb-6 flex items-center gap-1 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm transition"
                >
                    &larr; Return to Roadmap Session
                </button>

                {/* Score Summary header if graded */}
                {result && (
                    <div className="bg-white rounded-3xl border border-green-100 shadow-sm p-8 text-center mb-8 animate-fadeIn">
                        <span className="text-5xl block mb-2">🎉</span>
                        <h2 className="text-2xl font-black text-gray-800">Practice Quiz Completed!</h2>
                        <p className="text-gray-400 text-sm mt-1 mb-6">Review your choices and study explanations below.</p>

                        <div className="inline-block bg-indigo-50 border border-indigo-100 rounded-3xl px-12 py-5 shadow-sm shadow-indigo-50">
                            <span className="text-xs text-gray-400 font-bold block uppercase tracking-widest">Final Score</span>
                            <span className="text-5xl font-black text-indigo-600 mt-1 block">{result.score}%</span>
                        </div>
                    </div>
                )}

                {/* Quiz form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {quiz.questions.map((q, idx) => {
                        const isGraded = !!result;
                        const selected = isGraded ? q.selectedAnswer : selectedAnswers[idx];

                        return (
                            <div
                                key={idx}
                                className={`bg-white border rounded-3xl p-6 shadow-sm transition-all duration-300 ${isGraded
                                        ? q.isCorrect
                                            ? "border-green-200 bg-green-50/5"
                                            : "border-red-200 bg-red-50/5"
                                        : "border-slate-100"
                                    }`}
                            >
                                <div className="flex items-start gap-3 justify-between">
                                    <h3 className="font-bold text-gray-800 text-base leading-snug">
                                        <span className="text-indigo-600 mr-1.5">{idx + 1}.</span> {q.questionText}
                                    </h3>

                                    {isGraded && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {q.isCorrect ? "Correct" : "Incorrect"}
                                        </span>
                                    )}
                                </div>

                                {/* Options list */}
                                <div className="mt-4 space-y-2.5">
                                    {q.options.map((opt, oIdx) => {
                                        const isSelected = selected === opt;
                                        const isCorrectKey = q.correctAnswer === opt;

                                        let optionStyle = "border-slate-200 bg-white text-gray-700 hover:bg-slate-50";
                                        if (isGraded) {
                                            if (isCorrectKey) {
                                                optionStyle = "bg-green-600 border-green-600 text-white font-semibold";
                                            } else if (isSelected) {
                                                optionStyle = "bg-red-500 border-red-500 text-white font-semibold";
                                            } else {
                                                optionStyle = "border-slate-100 bg-slate-50 text-gray-400 opacity-60";
                                            }
                                        } else if (isSelected) {
                                            optionStyle = "border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold";
                                        }

                                        return (
                                            <button
                                                key={oIdx}
                                                type="button"
                                                onClick={() => handleOptionSelect(idx, opt)}
                                                disabled={isGraded}
                                                className={`w-full text-left px-5 py-3 rounded-2xl border text-sm transition-all flex justify-between items-center ${optionStyle}`}
                                            >
                                                <span>{opt}</span>
                                                {!isGraded && isSelected && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Question Explanation summary */}
                                {isGraded && !q.isCorrect && (
                                    <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs text-red-600">
                                        <strong>Correct Key:</strong> {q.correctAnswer}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Action buttons */}
                    {!result && (
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition shadow-sm text-base"
                            >
                                {submitting ? "Evaluating Answers..." : "Submit Quiz for Grading"}
                            </button>
                        </div>
                    )}
                </form>

            </div>
        </div>
    );
}

export default QuizSession;
