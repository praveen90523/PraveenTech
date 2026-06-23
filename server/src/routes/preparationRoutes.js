import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generatePreparation,
    getPreparationSessions,
    getPreparationSessionById,
    startQuiz,
    submitQuiz,
    toggleQuestion,
} from "../controllers/preparationController.js";

const router = express.Router();

router.post("/generate", protect, generatePreparation);
router.get("/", protect, getPreparationSessions);
router.get("/:id", protect, getPreparationSessionById);
router.post("/:id/quiz", protect, startQuiz);
router.post("/:id/quiz/submit", protect, submitQuiz);
router.put("/question/:id", protect, toggleQuestion);

export default router;
