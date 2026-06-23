import Notification from "../models/Notification.js";
import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import { getUserAnalytics } from "../services/analyticsService.js";

/**
 * Fetch detailed metrics, stats and weekly active counts.
 */
export const getStats = async (req, res) => {
    try {
        const data = await getUserAnalytics(req.user.id);
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to gather metrics",
            error: error.message
        });
    }
};

/**
 * Fetch notification tray.
 */
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message
        });
    }
};

/**
 * Mark notification as read.
 */
export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update notification status",
            error: error.message
        });
    }
};

/**
 * Get achievements and the global leaderboard ranking list.
 */
export const getAchievementsAndLeaderboard = async (req, res) => {
    try {
        // Fetch user achievements
        const achievements = await Achievement.find({ userId: req.user.id }).sort({ createdAt: -1 });

        // Fetch top 10 users for global leaderboard ranking
        const leaderboard = await User.find()
            .sort({ xp: -1 })
            .limit(10)
            .select("name email xp level profilePicture");

        res.status(200).json({
            success: true,
            achievements,
            leaderboard
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve gamification details",
            error: error.message
        });
    }
};
