import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, GraduationCap, Shield, Loader2 } from "lucide-react";
import logo from "../../assets/novara-logo.png";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        const result = await login({ ...formData, role });
        setSubmitting(false);

        if (result.success) {
            if (result.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }
            return;
        }

        setError(result.error);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-5 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 shadow-2xl rounded-3xl w-full max-w-md p-8">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="Praveen Tech" className="h-16 w-auto object-contain mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">
                        Prepare. Practice. Perform.
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-slate-950 rounded-xl p-1 mb-8">
                    <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                            role === "student"
                                ? "bg-indigo-600 text-white"
                                : "text-gray-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        <GraduationCap size={18} />
                        Student
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole("admin")}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                            role === "admin"
                                ? "bg-indigo-600 text-white"
                                : "text-gray-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                    >
                        <Shield size={18} />
                        Admin
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block mb-2 text-gray-700 dark:text-slate-300 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block mb-2 text-gray-700 dark:text-slate-300 font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-4 text-gray-500 dark:text-slate-450"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-right mb-6">
                        <Link
                            to="/forgot-password"
                            className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <Loader2 size={18} className="animate-spin" />
                        )}
                        Login as {role === "admin" ? "Admin" : "Student"}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-gray-600 dark:text-slate-400">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
