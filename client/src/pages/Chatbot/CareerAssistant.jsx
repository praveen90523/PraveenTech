import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Sparkles, AlertCircle, Mic, MicOff, Bot, User, HelpCircle } from "lucide-react";

function CareerAssistant() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const quickChips = [
        "Explain Dynamic Programming concepts",
        "Give me a study plan for Amazon SDE",
        "What are common behavioral interview tips?",
        "How do I optimize my resume for ATS?",
        "Explain differences between SQL and NoSQL"
    ];

    useEffect(() => {
        fetchChatHistory();

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = "en-US";

            rec.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInputText(prev => prev + (prev.trim() ? " " : "") + transcript.trim());
                }
                setIsRecording(false);
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

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/ai/chat", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.chatHistory || []);
            }
        } catch (error) {
            console.error("Fetch chat error:", error);
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Voice search is not supported in this browser. Please use Chrome or Edge.");
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

    const handleSendMessage = async (textToSend) => {
        const text = textToSend || inputText;
        if (!text || text.trim() === "") return;

        if (!textToSend) {
            setInputText("");
        }

        // Optimistically append user message
        const userMsg = { sender: "user", text, createdAt: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/ai/chat",
                { message: text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setMessages(res.data.chatHistory);
            }
        } catch (error) {
            console.error("Chat message send error:", error);
            setMessages(prev => [
                ...prev,
                { sender: "ai", text: "⚠️ System offline. I couldn't transmit that query to my brain. Please try again later.", createdAt: new Date() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm("Are you sure you want to clear your chat history?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete("http://localhost:5000/api/ai/chat", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages([]);
            }
        } catch (error) {
            console.error("Clear chat error:", error);
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header banner */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
                    AI Guidance
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-3 tracking-tight">
                    AI Career Coach
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                    Consult the career assistant regarding syllabus concepts, roadmap checkpoints, and interview setups.
                </p>
            </div>

            <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row gap-6 items-stretch">
                
                {/* Left side: Coach Info Column */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-5">
                    
                    {/* Bot Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm dark:shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-indigo-500/10">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Praveen Tech Assistant</h2>
                                <p className="text-[10px] text-emerald-500 dark:text-emerald-455 font-semibold flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Welcome! I'm Praveen Tech Assistant, your interview coach. Ask me technical problems, system design advice, resume guidelines, or behavioral situations.
                        </p>
                        
                        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 dark:text-slate-500 font-bold">XP reward per ask:</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-105/30">
                                +5 XP
                            </span>
                        </div>
                    </div>

                    {/* Quick Clean actions */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm flex items-center gap-1"><Sparkles className="w-4 h-4 text-indigo-200" /> Need Inspiration?</h3>
                        <p className="text-[11px] text-indigo-150 leading-relaxed">
                            Click on any of the starting prompts in the chat area to quickly ask system design templates or questions.
                        </p>
                        <button
                            onClick={handleClearChat}
                            className="w-full bg-indigo-750 hover:bg-rose-600 hover:text-white text-indigo-100 text-xs font-bold py-2.5 rounded-xl border border-indigo-500/25 transition duration-200 flex items-center justify-center gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Clear History
                        </button>
                    </div>
                </div>

                {/* Right side: Chat Window */}
                <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm dark:shadow-lg flex flex-col overflow-hidden h-[500px] md:h-[550px]">
                    
                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                                <span className="text-4xl animate-bounce mb-3">👋</span>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-250">Hey there! I am Praveen Tech Assistant</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1 mb-6 font-medium">
                                    Your placement counselor. What would you like to prepare or learn about today?
                                </p>
                                
                                <div className="flex flex-col gap-2 max-w-md w-full">
                                    {quickChips.map((chip, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(chip)}
                                            className="text-xs bg-slate-50 hover:bg-indigo-50/50 dark:bg-slate-900/50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2.5 px-4 rounded-xl text-left transition duration-200"
                                        >
                                            {chip} &rarr;
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                                >
                                    {msg.sender !== "user" && (
                                        <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm font-medium ${
                                            msg.sender === "user"
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-805 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-600"
                                        }`}
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.sender === "user" && (
                                        <div className="w-7.5 h-7.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex gap-3 justify-start animate-pulse">
                                <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span className="flex gap-0.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span>Praveen Tech Assistant is writing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2">
                        {/* Voice mic toggle */}
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`p-3 rounded-xl border transition duration-200 ${
                                isRecording 
                                    ? "bg-rose-505 border-rose-505 text-white animate-pulse" 
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-750"
                            }`}
                            title={isRecording ? "Stop voice listening" : "Start voice listening"}
                        >
                            {isRecording ? <Mic className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                        </button>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isRecording ? "Listening to voice input..." : "Ask Praveen Tech career suggestions..."}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/25 focus:border-indigo-500 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-205 placeholder-slate-405 dark:placeholder-slate-505"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSendMessage();
                                }
                            }}
                            disabled={loading}
                        />

                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || !inputText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-750 disabled:opacity-40 text-white px-4 rounded-xl flex items-center justify-center transition duration-200 shadow-md shadow-indigo-600/10"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default CareerAssistant;
