// import express from "express";
// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";
// import connectDB from "./config/db.js";

// const app = express();

// connectDB();
// app.use(
//     cors({
//         origin: [
//             "http://localhost:5173",
//             "https://praveen-tech.vercel.app",
//         ],
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/auth", authRoutes);

// // Test Route
// app.get("/", (req, res) => {
//     res.json({ message: "Backend is running" });
// });

// export default app;
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

console.log("Starting server...");
console.log("PORT:", PORT);

const startServer = async () => {
    try {
        await connectDB();
        console.log("MongoDB Connected");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });

        console.log("listen() called");
    } catch (err) {
        console.error(err);
    }
};

startServer();