import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../assets/novara-logo.png";

/* ─── tiny hook: count-up animation ─── */
function useCountUp(target, duration = 1800, started = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(start);
        }, 16);
        return () => clearInterval(timer);
    }, [started, target, duration]);
    return count;
}

/* ─── Features dropdown data ─── */
const NAV_FEATURES = [
    { icon: "🎙️", label: "AI Mock Interviews", desc: "Real-time practice sessions with instant scoring" },
    { icon: "📄", label: "Resume Intelligence", desc: "ATS analysis & actionable resume tips" },
    { icon: "🤖", label: "AI Career Coach", desc: "Personalized career Q&A chatbot assistant" },
    { icon: "🧠", label: "AI Prep Hub", desc: "Topic-level roadmaps, quizzes & coding tasks" },
    { icon: "📅", label: "Study Planner", desc: "Week-by-week personalised prep schedules" },
    { icon: "🏆", label: "Leaderboard & Streaks", desc: "XP, achievements & global candidate rankings" },
];

/* ─── Feature cards data ─── */
const FEATURE_CARDS = [
    {
        icon: "🎙️",
        gradient: "from-indigo-500 to-violet-600",
        glow: "shadow-indigo-200",
        title: "AI Mock Interviews",
        description:
            "Face realistic technical & behavioural interviews powered by Gemini AI. Get instant scores, mistake analysis, model answers, and confidence-level feedback after each question.",
        tags: ["Live Q&A", "Coding Challenges", "Voice Mode"],
    },
    {
        icon: "📄",
        gradient: "from-emerald-500 to-teal-600",
        glow: "shadow-emerald-200",
        title: "Resume Intelligence",
        description:
            "Upload your resume and run it through ATS simulation algorithms. Extract key skills, identify red flags, and receive laser-focused suggestions to maximise recruiter visibility.",
        tags: ["ATS Scoring", "Skill Extraction", "Actionable Fixes"],
    },
    {
        icon: "🤖",
        gradient: "from-sky-500 to-blue-600",
        glow: "shadow-sky-200",
        title: "AI Career Coach",
        description:
            "A conversational AI assistant to answer career doubts, explain complex concepts, generate company-specific study roadmaps, and keep you motivated throughout your prep.",
        tags: ["24/7 Available", "Concept Explanations", "Roadmap Gen"],
    },
    {
        icon: "🧠",
        gradient: "from-amber-500 to-orange-600",
        glow: "shadow-amber-200",
        title: "AI Prep Hub",
        description:
            "Generate exhaustive preparation resources for any domain or company — curated study content, practice tasks, flashcards, and timed quizzes all in one place.",
        tags: ["Quizzes", "Coding Tasks", "Flashcards"],
    },
    {
        icon: "📅",
        gradient: "from-rose-500 to-pink-600",
        glow: "shadow-rose-200",
        title: "Smart Study Planner",
        description:
            "Set your interview target date and receive a personalised, week-by-week study plan. Track daily progress, mark milestones, and stay accountable with streak reminders.",
        tags: ["Daily Plans", "Milestone Tracking", "Streak Alerts"],
    },
    {
        icon: "🏆",
        gradient: "from-yellow-500 to-amber-600",
        glow: "shadow-yellow-200",
        title: "Leaderboard & Gamification",
        description:
            "Earn XP for every activity, unlock achievement badges, maintain daily practice streaks, and see how you rank against candidates globally on the live leaderboard.",
        tags: ["Global Rankings", "XP System", "Achievements"],
    },
];

/* ─── Pricing tiers ─── */
const PRICING = [
    {
        name: "Starter",
        badge: null,
        price: "$0",
        period: "/ forever",
        color: "border-slate-200",
        btnClass: "bg-slate-100 hover:bg-slate-200 text-slate-800",
        btnText: "Get Started Free",
        description: "Perfect for casual exploration and light interview prep.",
        features: [
            "1 AI Mock Interview per week",
            "Basic Resume ATS Analysis (1/month)",
            "Career Chatbot (10 queries/day)",
            "Community Leaderboard access",
            "Public study roadmaps",
        ],
        missing: [
            "Unlimited mock interviews",
            "Company-specific roadmaps",
            "Advanced analytics dashboard",
        ],
    },
    {
        name: "Pro Prep",
        badge: "Most Popular",
        price: "$19",
        period: "/ month",
        color: "border-indigo-500 ring-2 ring-indigo-500/20",
        btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200",
        btnText: "Start 7-Day Free Trial",
        description: "For serious candidates actively applying to top-tier companies.",
        features: [
            "Unlimited AI Mock Interviews",
            "Unlimited Resume ATS Analysis",
            "Priority AI Career Coach (unlimited)",
            "Company-specific preparation roadmaps",
            "Custom quiz generator for any topic",
            "Advanced progress analytics",
            "Interview history & detailed reports",
            "Bookmark & notes during sessions",
        ],
        missing: [],
    },
    {
        name: "Enterprise",
        badge: "Teams",
        price: "$49",
        period: "/ month",
        color: "border-violet-400 ring-2 ring-violet-400/20",
        btnClass: "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200",
        btnText: "Contact Sales",
        description: "For placement cells, bootcamps, and universities managing cohorts.",
        features: [
            "Everything in Pro Prep",
            "Up to 50 team member seats",
            "Admin analytics dashboard",
            "Batch import & candidate management",
            "Custom branding & white-label option",
            "Dedicated account manager",
            "SLA-backed 99.9% uptime",
            "Priority email & phone support",
        ],
        missing: [],
    },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
    {
        name: "Priya Sharma",
        role: "SWE Intern @ Google",
        avatar: "PS",
        color: "bg-indigo-100 text-indigo-700",
        quote:
            "Praveen Tech's mock interviews were eerily similar to my actual Google rounds. The instant feedback and model answers gave me exactly what I needed to improve.",
    },
    {
        name: "Arjun Mehta",
        role: "Placed @ Flipkart",
        avatar: "AM",
        color: "bg-emerald-100 text-emerald-700",
        quote:
            "The Resume Intelligence caught 8 ATS issues I had no idea about. After fixing them, my callback rate jumped from 12% to over 40% in two weeks.",
    },
    {
        name: "Sara Williams",
        role: "PM Intern @ Microsoft",
        avatar: "SW",
        color: "bg-violet-100 text-violet-700",
        quote:
            "The AI Career Coach helped me prep for behavioral questions from scratch. The STAR-format suggestions are genuinely better than anything I found on YouTube.",
    },
    {
        name: "Kiran Raj",
        role: "Data Engineer @ Zepto",
        avatar: "KR",
        color: "bg-amber-100 text-amber-700",
        quote:
            "Study Planner kept me consistent for 6 weeks straight. The daily streak system is addictive — I didn't want to break the chain!",
    },
];

/* ═══════════════════════════════════════════════ COMPONENT ═══ */
function Home() {
    const navigate = useNavigate();
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);
    const dropdownRef = useRef(null);

    /* ── navbar scroll shadow ── */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── close dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setFeaturesOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ── intersection observer for stats count-up ── */
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) obs.observe(statsRef.current);
        return () => obs.disconnect();
    }, []);

    const c1 = useCountUp(98, 1200, statsVisible);
    const c2 = useCountUp(15000, 1800, statsVisible);
    const c3 = useCountUp(49, 1400, statsVisible);
    const c4 = useCountUp(40, 1600, statsVisible);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">

            {/* ══════════════ NAVBAR ══════════════ */}
            <header
                className={`sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b transition-all duration-300 ${scrolled ? "border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none" : "border-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <img
                        src={logo}
                        alt="Praveen Tech"
                        className="h-8 w-auto object-contain cursor-pointer select-none"
                        onClick={() => navigate("/")}
                    />

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400">

                        {/* Features Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setFeaturesOpen((v) => !v)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-colors ${featuresOpen
                                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                                        : "hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                    }`}
                            >
                                Features
                                <svg
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
                                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                    <polyline points="4 6 8 10 12 6" />
                                </svg>
                            </button>

                            {/* Dropdown Panel */}
                            {featuresOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-none p-4 grid grid-cols-2 gap-2 animate-fadeIn">
                                    {NAV_FEATURES.map((f) => (
                                        <button
                                            key={f.label}
                                            onClick={() => { setFeaturesOpen(false); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}
                                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-left group"
                                        >
                                            <span className="text-2xl leading-none mt-0.5 shrink-0">{f.icon}</span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{f.label}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-snug">{f.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="col-span-2 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                                        <button
                                            onClick={() => { setFeaturesOpen(false); navigate("/register"); }}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
                                        >
                                            Start for Free →
                                        </button>
                                        <button
                                            onClick={() => { setFeaturesOpen(false); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}
                                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl transition"
                                        >
                                            View Pricing
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate("/login")}
                            className="hidden sm:block text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl transition"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-200/60 dark:shadow-none"
                        >
                            Get Started →
                        </button>
                    </div>
                </div>
            </header>

            {/* ══════════════ HERO ══════════════ */}
            <section className="relative overflow-hidden">
                {/* Gradient Orbs Background */}
                <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
                    <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-indigo-100/60 dark:bg-indigo-950/20 rounded-full blur-3xl" />
                    <div className="absolute -top-16 right-0 w-[400px] h-[400px] bg-violet-100/50 dark:bg-violet-950/15 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] bg-sky-100/40 dark:bg-sky-950/10 rounded-full blur-3xl" />
                    {/* Grid lines */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
                            backgroundSize: "60px 60px",
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-8 animate-fadeIn">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        🚀 AI-Powered Interview Preparation Ecosystem
                    </div>

                    {/* Heading */}
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-5xl mx-auto mb-6">
                        Master Your{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                Technical
                            </span>
                            <span className="absolute bottom-1 left-0 right-0 h-3 bg-indigo-100/80 dark:bg-indigo-950/40 rounded-full -z-0" />
                        </span>
                        {" & Behavioral "}
                        Interviews
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
                        Praveen Tech coaches you from resume optimisation to mock interview mastery — powered by Gemini AI with real-time feedback, scoring, and personalised roadmaps.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-4 px-10 rounded-2xl transition shadow-xl shadow-indigo-200 text-base flex items-center justify-center gap-2"
                        >
                            Start Preparing — It's Free
                            <span className="text-indigo-200">→</span>
                        </button>
                        <a
                            href="#features"
                            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 active:scale-[0.98] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-10 rounded-2xl transition text-base flex items-center justify-center gap-2 shadow-sm dark:shadow-none"
                        >
                            Explore Features
                            <span className="text-slate-400">↓</span>
                        </a>
                    </div>

                    {/* Social Proof Avatars */}
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex -space-x-2">
                            {["PS", "AM", "SW", "KR", "RB"].map((init, i) => (
                                <div
                                    key={i}
                                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-black"
                                    style={{ background: ["#e0e7ff", "#d1fae5", "#ede9fe", "#fef3c7", "#fce7f3"][i], color: ["#4f46e5", "#059669", "#7c3aed", "#d97706", "#db2777"][i] }}
                                >
                                    {init}
                                </div>
                            ))}
                        </div>
                        <span>
                            Join <strong className="text-slate-800 dark:text-slate-200">15,000+</strong> candidates who landed their dream offer
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            ★★★★★ <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">4.9/5</span>
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════ ANIMATED STATS ══════════════ */}
            <section
                ref={statsRef}
                className="bg-white dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-800/80 py-14"
            >
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {[
                        { value: c1, suffix: "%", label: "ATS Detection Accuracy" },
                        { value: c2.toLocaleString(), suffix: "+", label: "Mock Sessions Conducted" },
                        { value: c3, suffix: "%", label: "of users improve in week 1" },
                        { value: c4, suffix: "%", label: "Higher Offer Rate" },
                    ].map((s, i) => (
                        <div key={i}>
                            <p className="text-4xl md:text-5xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                {s.value}{s.suffix}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ FEATURES ══════════════ */}
            <section id="features" className="py-24 bg-[#F8FAFC] dark:bg-[#0F172A]">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Heading */}
                    <div className="text-center mb-16">
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4">
                            Platform Features
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Everything you need to land{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                the offer
                            </span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-medium max-w-2xl mx-auto">
                            Six powerful AI tools working together in one cohesive preparation ecosystem.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURE_CARDS.map((f, idx) => (
                            <div
                                key={idx}
                                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 cursor-default"
                            >
                                {/* Icon */}
                                <div
                                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl shadow-lg ${f.glow} mb-6 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2.5">{f.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{f.description}</p>
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {f.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="text-[10px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wide"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <section className="bg-white dark:bg-slate-950 border-y border-slate-200/60 dark:border-slate-800/80 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4">
                            How It Works
                        </span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Go from nervous to confident in 4 steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", icon: "✍️", title: "Create Account", desc: "Sign up free — no credit card needed. Your dashboard is ready instantly." },
                            { step: "02", icon: "📄", title: "Analyse Resume", desc: "Upload your resume for ATS scoring, skill extraction and targeted improvement tips." },
                            { step: "03", icon: "🧠", title: "Build Your Plan", desc: "Get a personalised, week-by-week roadmap crafted for your target role or company." },
                            { step: "04", icon: "🎙️", title: "Practice & Perform", desc: "Sharpen your skills with unlimited AI mock interviews and track your growth over time." },
                        ].map((s, i) => (
                            <div key={i} className="relative text-center">
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 border-t-2 border-dashed border-slate-200 dark:border-slate-800" />
                                )}
                                <div className="relative inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 to-violet-50 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/30 items-center justify-center text-2xl mb-4 mx-auto shadow-sm">
                                    {s.icon}
                                    <span className="absolute -top-2 -right-2 text-[10px] font-black text-white bg-indigo-600 w-5 h-5 rounded-full flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{s.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ PRICING ══════════════ */}
            <section id="pricing" className="py-24 bg-[#F8FAFC] dark:bg-[#0F172A]">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Heading */}
                    <div className="text-center mb-16">
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-medium max-w-xl mx-auto">
                            No hidden fees. No surprise charges. Cancel anytime.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {PRICING.map((p, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-white dark:bg-slate-900 rounded-3xl p-8 border dark:border-slate-800/80 flex flex-col ${p.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none`}
                            >
                                {/* Badge */}
                                {p.badge && (
                                    <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap ${p.badge === "Most Popular"
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "bg-violet-600 text-white shadow-md shadow-violet-200"
                                        }`}>
                                        {p.badge === "Most Popular" ? "⭐ " : "🏢 "}{p.badge}
                                    </span>
                                )}

                                {/* Header */}
                                <div className="mb-6">
                                    <h3 className="font-black text-xl text-slate-900 dark:text-white mb-1">{p.name}</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-snug">{p.description}</p>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className="text-5xl font-black text-slate-900 dark:text-white">{p.price}</span>
                                    <span className="text-sm text-slate-400 dark:text-slate-500 font-semibold">{p.period}</span>
                                </div>

                                {/* Included Features */}
                                <ul className="space-y-3 mb-6 flex-1">
                                    {p.features.map((feat, fi) => (
                                        <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                                            {feat}
                                        </li>
                                    ))}
                                    {p.missing.map((feat, fi) => (
                                        <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-400 dark:text-slate-550 line-through">
                                            <span className="mt-0.5 w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0">✕</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    onClick={() => navigate("/register")}
                                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition active:scale-[0.98] ${p.btnClass}`}
                                >
                                    {p.btnText}
                                </button>

                                {idx === 1 && (
                                    <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium mt-3">
                                        Free for 7 days · No credit card required
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* FAQ Note */}
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium mt-10">
                        All plans include a free onboarding tour.{" "}
                        <a href="#" className="text-indigo-500 dark:text-indigo-400 hover:underline font-bold">Compare full feature table →</a>
                    </p>
                </div>
            </section>

            {/* ══════════════ TESTIMONIALS ══════════════ */}
            <section id="testimonials" className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/80 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block mb-4">
                            Success Stories
                        </span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Loved by thousands of candidates
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={i}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md dark:hover:shadow-none transition-all duration-300 hover:-translate-y-0.5"
                            >
                                {/* Stars */}
                                <div className="text-amber-400 text-sm font-bold tracking-wider">★★★★★</div>
                                {/* Quote */}
                                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed flex-1">
                                    "{t.quote}"
                                </p>
                                {/* Author */}
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${t.color}`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ CTA BANNER ══════════════ */}
            <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                        Your next offer is one interview away.
                    </h2>
                    <p className="text-indigo-200 text-lg font-medium mb-10">
                        Join 15,000+ candidates who used Praveen Tech to prepare smarter and perform with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 active:scale-[0.97] text-indigo-700 dark:text-indigo-400 font-black py-4 px-10 rounded-2xl transition shadow-xl dark:shadow-none text-base"
                        >
                            Start Free Today →
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="border border-white/30 hover:bg-white/10 text-white font-bold py-4 px-10 rounded-2xl transition text-base"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════ FOOTER ══════════════ */}
            <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-500 py-16 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-10 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <img src={logo} alt="Praveen Tech" className="h-8 w-auto object-contain mb-4 brightness-0 invert opacity-80" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                                Praveen Tech is an AI-powered career preparation ecosystem helping candidates master technical and behavioural interviews.
                            </p>
                            <div className="flex gap-3 mt-5">
                                {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                                    <a
                                        key={s}
                                        href="#"
                                        className="text-[10px] font-bold bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-white px-3 py-1.5 rounded-lg transition"
                                    >
                                        {s}
                                    </a>
                                ))}
                            </div>
                        </div>
                        {/* Links */}
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Product</h4>
                            <ul className="space-y-2.5">
                                {["Features", "Pricing", "Testimonials", "Blog"].map((l) => (
                                    <li key={l}>
                                        <a href="#" className="text-sm text-slate-500 dark:text-slate-450 hover:text-white transition">{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Company</h4>
                            <ul className="space-y-2.5">
                                {["About", "Careers", "Privacy Policy", "Terms of Service"].map((l) => (
                                    <li key={l}>
                                        <a href="#" className="text-sm text-slate-500 dark:text-slate-450 hover:text-white transition">{l}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 dark:border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-600 dark:text-slate-500 font-medium">
                            © 2026 Praveen Tech. All rights reserved. Built with ❤️ for ambitious candidates.
                        </p>
                        <p className="text-[10px] text-slate-700 dark:text-slate-600 font-bold uppercase tracking-widest">
                            Prepare. Practice. Perform.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}

export default Home;
