import User from "../models/User.js";
import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import PreparationSession from "../models/PreparationSession.js";
import Notification from "../models/Notification.js";

/**
 * List all registered users (Admin only).
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profiles",
            error: error.message
        });
    }
};

/**
 * Update a user's role (Admin only).
 */
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !["student", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Valid role (student or admin) is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user role",
            error: error.message
        });
    }
};

/**
 * Moderate: Delete a user account (Admin only).
 */
export const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Clean up linked tables (optional but keeps DB tidy)
        await Interview.deleteMany({ user: req.params.id });
        await Resume.deleteMany({ userId: req.params.id });
        await PreparationSession.deleteMany({ userId: req.params.id });
        await Notification.deleteMany({ userId: req.params.id });

        res.status(200).json({
            success: true,
            message: "User and all associated data deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message
        });
    }
};

/**
 * Get system-wide usage statistics (Admin only).
 */
export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalAdmins = await User.countDocuments({ role: "admin" });
        const totalInterviews = await Interview.countDocuments();
        const totalResumes = await Resume.countDocuments();
        const totalPreps = await PreparationSession.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalAdmins,
                totalInterviews,
                totalResumes,
                totalPreps
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve system statistics",
            error: error.message
        });
    }
};

/**
 * Broadcast an announcement notification to all users (Admin only).
 */
export const broadcastNotification = async (req, res) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        const users = await User.find().select("_id");
        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No users to notify"
            });
        }

        const notifications = users.map(u => ({
            userId: u._id,
            title,
            message,
            isRead: false
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Broadcast sent successfully to ${users.length} users`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to broadcast notification",
            error: error.message
        });
    }
};
