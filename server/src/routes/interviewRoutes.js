import express from "express";
import {
  createInterview,
  getUserInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  updateInterviewNotes,
  toggleBookmarkQuestion,
} from "../controllers/interviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createInterview);
router.get("/", protect, getUserInterviews);
router.get("/:id", protect, getInterviewById);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/complete", protect, completeInterview);
router.put("/:id/notes", protect, updateInterviewNotes);
router.put("/:id/bookmark", protect, toggleBookmarkQuestion);

export default router;