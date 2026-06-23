import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generateStudyPlan,
    getStudyPlan,
    updateChecklist,
    deleteStudyPlan,
} from "../controllers/studyPlanController.js";

const router = express.Router();

router.post("/generate", protect, generateStudyPlan);
router.get("/", protect, getStudyPlan);
router.put("/", protect, updateChecklist);
router.delete("/", protect, deleteStudyPlan);

export default router;
