import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/novara-logo.png";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const result = await forgotPassword(email);
        if (result.success) {
            setMessage("Password reset email sent successfully");
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-5 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 shadow-2xl rounded-3xl w-full max-w-md p-8">
                <div className="text-center mb-6 flex flex-col items-center">
                    <img src={logo} alt="Praveen Tech" className="h-16 w-auto object-contain mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-150">Forgot Password</h2>
                </div>
                {message && <p className="text-green-600 dark:text-green-400 mb-4 text-center text-sm">{message}</p>}
                {error && <p className="text-red-500 dark:text-red-400 mb-4 text-center text-sm">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 focus:outline-none focus:border-indigo-650 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200"
                    >
                        Send Reset Link
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                    Remembered your password?{" "}
                    <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;