import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
    User,
    Mail,
    Briefcase,
    Building,
    Shield,
    Plus,
    X,
    Award,
    Sparkles,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Flame,
    Star,
    Camera,
    Trash2,
    Code2,
    Target,
    Lock,
    ChevronRight,
    Edit3,
} from "lucide-react";

export default function Profile() {
    const { user, updateUser } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [careerGoal, setCareerGoal] = useState(user?.careerGoal || "");
    const [targetCompany, setTargetCompany] = useState(user?.targetCompany || "");
    const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || "Student");
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [profilePic, setProfilePic] = useState(user?.profilePicture || "");

    const [skills, setSkills] = useState(user?.skills || []);
    const [newSkill, setNewSkill] = useState("");
    const [statusMsg, setStatusMsg] = useState("");
    const [isError, setIsError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setCareerGoal(user.careerGoal || "");
            setTargetCompany(user.targetCompany || "");
            setExperienceLevel(user.experienceLevel || "Student");
            setTwoFactorEnabled(user.twoFactorEnabled || false);
            setSkills(user.skills || []);
            setProfilePic(user.profilePicture || "");
        }
    }, [user]);

    const handleAddSkill = (e) => {
        e.preventDefault();
        const skillClean = newSkill.trim();
        if (skillClean && !skills.includes(skillClean)) {
            setSkills([...skills, skillClean]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setStatusMsg("File size exceeds 2 MB. Please choose a smaller image.");
                setIsError(true);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setProfilePic(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatusMsg("");
        setIsError(false);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                "http://localhost:5000/api/users/profile",
                { name, careerGoal, targetCompany, experienceLevel, twoFactorEnabled, skills, profilePicture: profilePic },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                updateUser(res.data.user);
                setStatusMsg("Profile updated successfully!");
                setIsError(false);
            } else {
                setStatusMsg(res.data.message || "Failed to update profile");
                setIsError(true);
            }
        } catch (error) {
            setStatusMsg(error.response?.data?.message || "Failed to connect to the server");
            setIsError(true);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (n) => {
        if (!n) return "?";
        const parts = n.split(" ");
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return n.slice(0, 2).toUpperCase();
    };

    const xpPercent = Math.min(((user?.xp || 0) % 500) / 500 * 100, 100);

    const TABS = [
        { id: "profile", label: "Profile Info", icon: User },
        { id: "skills", label: "Skills", icon: Code2 },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="w-full pb-10 max-w-6xl mx-auto">

            {/* ── Page Header ── */}
            <div className="mb-8">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                    My Account
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
                    Profile Settings
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Manage your identity, career goals, and security preferences.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-7 items-start">

                {/* ══════════ LEFT SIDEBAR ══════════ */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col gap-5">

                    {/* Avatar Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                        {/* Cover banner */}
                        <div className="h-24 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative">
                            <div className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                                    backgroundSize: "30px 30px"
                                }}
                            />
                        </div>

                        {/* Avatar circle — sits on the border of cover + body */}
                        <div className="flex flex-col items-center px-6 pb-6">
                            <div className="relative -mt-12 mb-3">
                                <div className="w-24 h-24 rounded-full ring-4 ring-white dark:ring-slate-800 overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-600 shadow-xl">
                                    {profilePic ? (
                                        <img
                                            src={profilePic}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black">
                                            {getInitials(name)}
                                        </div>
                                    )}
                                </div>

                                {/* Camera upload button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer border-2 border-white dark:border-slate-800"
                                    title="Change profile picture"
                                >
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Remove photo link */}
                            {profilePic && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setProfilePic(""); }}
                                    className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 mb-2 cursor-pointer"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove photo
                                </button>
                            )}

                            {/* Name & email */}
                            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 text-center truncate w-full">
                                {name || "Your Name"}
                            </h2>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" />
                                {user?.email}
                            </p>

                            {/* Career goal pill */}
                            {careerGoal && (
                                <span className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold">
                                    <Target className="w-3 h-3" />
                                    {careerGoal}
                                </span>
                            )}

                            {/* XP Progress bar */}
                            <div className="w-full mt-5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Level {user?.level || 1}</span>
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{user?.xp || 0} XP</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1 text-right">{500 - ((user?.xp || 0) % 500)} XP to next level</p>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
                            {[
                                { icon: Star, label: "Level", value: `${user?.level || 1}`, color: "text-indigo-600 dark:text-indigo-400" },
                                { icon: Flame, label: "Streak", value: `${user?.streak || 0}d`, color: "text-orange-500 dark:text-orange-400" },
                                { icon: Award, label: "XP", value: `${user?.xp || 0}`, color: "text-violet-600 dark:text-violet-400" },
                            ].map(({ icon: Icon, label, value, color }) => (
                                <div key={label} className="py-4 flex flex-col items-center gap-0.5">
                                    <Icon className={`w-4 h-4 ${color} mb-0.5`} />
                                    <span className={`text-sm font-black ${color}`}>{value}</span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upload hint card */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Profile Photo</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">JPG or PNG · Max 2 MB</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* ══════════ RIGHT MAIN PANEL ══════════ */}
                <div className="flex-1 min-w-0">

                    {/* Status toast */}
                    {statusMsg && (
                        <div className={`mb-5 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 border animate-fadeIn ${
                            isError
                                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                                : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                        }`}>
                            {isError
                                ? <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                                : <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />}
                            {statusMsg}
                        </div>
                    )}

                    {/* Tab navigation */}
                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-5 w-fit">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === id
                                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSave}>

                        {/* ── Tab: Profile Info ── */}
                        {activeTab === "profile" && (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <Edit3 className="w-4 h-4 text-indigo-500" />
                                        Personal Information
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Your name and career preferences shown across the platform.</p>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition placeholder-slate-400"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Career Goal + Target Company */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Career Goal / Role
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={careerGoal}
                                                onChange={(e) => setCareerGoal(e.target.value)}
                                                placeholder="e.g. Frontend Developer"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                            Target Company
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={targetCompany}
                                                onChange={(e) => setTargetCompany(e.target.value)}
                                                placeholder="e.g. Google, Amazon"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                                        Experience Level
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { value: "Student", label: "Student", sub: "Placement ready" },
                                            { value: "Entry Level", label: "Entry Level", sub: "0 – 2 years" },
                                            { value: "Intermediate", label: "Mid Level", sub: "2 – 5 years" },
                                            { value: "Senior", label: "Senior", sub: "5+ years" },
                                        ].map((lvl) => (
                                            <button
                                                key={lvl.value}
                                                type="button"
                                                onClick={() => setExperienceLevel(lvl.value)}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                    experienceLevel === lvl.value
                                                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/20"
                                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                <p className={`text-xs font-bold ${experienceLevel === lvl.value ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                    {lvl.label}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{lvl.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save */}
                                <div className="pt-2">
                                    <SaveButton saving={saving} />
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Skills ── */}
                        {activeTab === "skills" && (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-indigo-500" />
                                        Professional Skills
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Skills are used to personalise AI interview questions and roadmaps for you.</p>
                                </div>

                                {/* Skill input */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="e.g. React, Python, System Design…"
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-600 transition placeholder-slate-400"
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(e); } }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 rounded-xl transition text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add
                                    </button>
                                </div>

                                {/* Skill chips */}
                                <div>
                                    {skills.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                            <Code2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">No skills added yet</p>
                                            <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-1">Add skills above to personalise your AI experience</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl text-xs font-semibold"
                                                >
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="text-indigo-400 hover:text-rose-500 focus:outline-none transition ml-0.5 cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Skill count */}
                                {skills.length > 0 && (
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                        {skills.length} skill{skills.length !== 1 ? "s" : ""} added · AI will use these to tailor questions and roadmaps
                                    </p>
                                )}

                                {/* Save */}
                                <div className="pt-2">
                                    <SaveButton saving={saving} />
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Security ── */}
                        {activeTab === "security" && (
                            <div className="bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-indigo-500" />
                                        Security Settings
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Control how you authenticate and protect your Novara account.</p>
                                </div>

                                {/* 2FA Toggle */}
                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center shrink-0">
                                                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    Two-Factor Authentication
                                                </h3>
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed max-w-md">
                                                    Add an extra verification step when logging in. Significantly increases account security against unauthorised access.
                                                </p>
                                                <span className={`inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                                    twoFactorEnabled
                                                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${twoFactorEnabled ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                    {twoFactorEnabled ? "Enabled" : "Disabled"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Toggle switch */}
                                        <button
                                            type="button"
                                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 mt-1 ${
                                                twoFactorEnabled ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                                    twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Account info row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{user?.email}</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            Active & Verified
                                        </p>
                                    </div>
                                </div>

                                {/* Save */}
                                <div className="pt-2">
                                    <SaveButton saving={saving} />
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
}

/* ── Shared Save Button ── */
function SaveButton({ saving }) {
    return (
        <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
        >
            {saving ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving changes…
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4" />
                    Save Changes
                </>
            )}
        </button>
    );
}
