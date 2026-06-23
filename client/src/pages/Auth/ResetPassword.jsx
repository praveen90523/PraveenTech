import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import logo from "../../assets/novara-logo.png";

function ResetPassword() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
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

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);

            // API Call Here
            // await authService.resetPassword(formData.password);

            setSuccess("Password reset successfully!");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError("Failed to reset password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-5 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 shadow-2xl rounded-3xl w-full max-w-md p-8">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="Praveen Tech" className="h-16 w-auto object-contain mb-4" />
                    <p className="text-gray-500 dark:text-slate-400">
                        Reset Your Password
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block mb-2 text-gray-700 dark:text-slate-300 font-medium">
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                required
                                className="w-full border border-gray-300 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 outline-none focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-4 text-gray-500 dark:text-slate-450"
                            >
                                {showPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-gray-700 dark:text-slate-300 font-medium">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                                className="w-full border border-gray-300 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 outline-none focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                className="absolute right-4 top-4 text-gray-500 dark:text-slate-450"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20} />
                                ) : (
                                    <Eye size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Lock size={18} />
                        )}
                        Reset Password
                    </button>

                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;