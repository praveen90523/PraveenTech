import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const loginUser = (formData) => api.post("/api/auth/login", formData);

export const registerUser = (formData) =>
    api.post("/api/auth/register", formData);

export const verifyEmail = (token) =>
    api.get(`/api/auth/verify-email/${token}`);

export const resendVerificationEmail = (email) =>
    api.post("/api/auth/resend-verification", { email });

export const forgotPassword = (email) =>
    api.post("/api/auth/forgot-password", { email });

export default api;
