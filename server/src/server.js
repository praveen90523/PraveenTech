import express from "express";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://praveen-tech.vercel.app",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({ message: "Backend is running" });
});

export default app;