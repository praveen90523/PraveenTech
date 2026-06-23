import { createContext, useContext, useState, useEffect } from "react";
import {
    loginUser,
    registerUser,
    resendVerificationEmail,
    forgotPassword as forgotPasswordRequest,
} from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
}, []);

    const login = async (formData) => {
        try {
            const res = await loginUser(formData);
            const userData = res.data.user;
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Login failed",
            };
        }
    };

    const signup = async (formData) => {
        try {
            const res = await registerUser(formData);
            return {
                success: true,
                message: res.data.message,
                email: res.data.email,
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || "Signup failed",
            };
        }
    };

    const resendVerification = async (email) => {
        try {
            const res = await resendVerificationEmail(email);
            return { success: true, message: res.data.message };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    "Failed to send verification email",
            };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await forgotPasswordRequest(email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    "Failed to send reset email",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        setUser(updatedUserData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                resendVerification,
                forgotPassword,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
