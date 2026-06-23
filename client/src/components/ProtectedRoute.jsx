import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white shadow-lg rounded-2xl px-8 py-6">
                    <p className="text-lg font-medium text-gray-700">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // Not Logged In
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admin Route Protection
    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    // Student trying to access admin dashboard
    if (!adminOnly && user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;