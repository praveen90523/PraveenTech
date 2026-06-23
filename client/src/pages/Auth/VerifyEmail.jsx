import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail as verifyEmailRequest } from "../../services/authService";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await verifyEmailRequest(token);
                setStatus("success");
                setMessage(res.data.message);
            } catch (error) {
                setStatus("error");
                setMessage(
                    error.response?.data?.message ||
                        "Verification failed. Please try again."
                );
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-5 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800/80 shadow-2xl rounded-3xl w-full max-w-md p-8 text-center">
                {status === "loading" && (
                    <>
                        <Loader2
                            className="mx-auto text-indigo-600 animate-spin mb-4"
                            size={48}
                        />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">
                            Verifying your email...
                        </h2>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle
                            className="mx-auto text-green-600 mb-4"
                            size={48}
                        />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
                            Email Verified
                        </h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle
                            className="mx-auto text-red-600 mb-4"
                            size={48}
                        />
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
                            Verification Failed
                        </h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                        >
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
