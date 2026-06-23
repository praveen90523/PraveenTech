import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getStats,
    getNotifications,
    markNotificationRead,
    getAchievementsAndLeaderboard,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", protect, getStats);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id", protect, markNotificationRead);
router.get("/achievements", protect, getAchievementsAndLeaderboard);

export default router;
