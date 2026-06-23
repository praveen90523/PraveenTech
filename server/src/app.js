import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import preparationRoutes from "./routes/preparationRoutes.js";
import studyPlanRoutes from "./routes/studyPlanRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "https://praveen-tech.vercel.app",
            "https://www.praveen-tech.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static("uploads"));

// Health Check Routes
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Praveen Tech API is running",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", chatbotRoutes);
app.use("/api/preparation", preparationRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

export default app;