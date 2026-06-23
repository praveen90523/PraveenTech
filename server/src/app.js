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
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve static uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", chatbotRoutes);
app.use("/api/preparation", preparationRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Root route
app.get("/", (req, res) => {
    res.send("Praveen Tech API is running");
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

export default app;
