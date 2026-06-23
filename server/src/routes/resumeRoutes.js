import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
    uploadAndAnalyze,
    getResumeHistory,
    getResumeById,
    deleteResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// Route for uploading a PDF resume for ATS analysis
router.post("/upload", protect, upload.single("resume"), uploadAndAnalyze);

// Route for getting user's resume analysis history
router.get("/history", protect, getResumeHistory);

// Route for getting detailed analysis of a specific resume
router.get("/:id", protect, getResumeById);

// Route for deleting a specific resume analysis
router.delete("/:id", protect, deleteResume);

export default router;
