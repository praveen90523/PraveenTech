import User from "../models/User.js";
import Resume from "../models/Resume.js";
import Interview from "../models/Interview.js";
import PreparationSession from "../models/PreparationSession.js";
import Achievement from "../models/Achievement.js";
import Notification from "../models/Notification.js";

/**
 * Award XP to a user and check for level ups and milestones.
 */
export const awardXP = async (userId, points, title, description, badge = "trophy") => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const oldLevel = user.level;
        user.xp += points;

        // Level formula: Level = floor(xp / 100) + 1
        const newLevel = Math.floor(user.xp / 100) + 1;
        let leveledUp = false;

        if (newLevel > oldLevel) {
            user.level = newLevel;
            leveledUp = true;
        }

        // Keep track of active days and update lastActive
        const today = new Date();
        const lastActiveDate = new Date(user.lastActive);
        const diffTime = Math.abs(today - lastActiveDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.streak += 1;
        } else if (diffDays > 1) {
            user.streak = 1;
        }
        user.lastActive = today;

        await user.save();

        // Save Achievement
        const achievement = await Achievement.create({
            userId,
            title,
            description,
            points,
            badge
        });

        // Create notification for XP
        await Notification.create({
            userId,
            title: `Earned ${points} XP!`,
            message: `You earned ${points} XP: "${title}" - ${description}`
        });

        // Create notification for Level Up
        if (leveledUp) {
            await Notification.create({
                userId,
                title: `🎉 Leveled Up to Level ${newLevel}!`,
                message: `Congratulations! Your dedication has advanced you to Level ${newLevel}. Keep preparation going!`
            });
        }

        return { achievement, leveledUp, newLevel };
    } catch (error) {
        console.error("Error awarding XP:", error);
    }
};

/**
 * Updates the user's daily login streak.
 */
export const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastActive = new Date(user.lastActive);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = today - lastActive;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            user.streak += 1;
            user.lastActive = new Date();
            await user.save();

            // Notify about streak increase
            await Notification.create({
                userId,
                title: `🔥 Streak Alert: ${user.streak} Days!`,
                message: `You've kept your preparation streak alive for ${user.streak} days. Keep up the momentum!`
            });
        } else if (diffDays > 1) {
            user.streak = 1;
            user.lastActive = new Date();
            await user.save();
        }
    } catch (error) {
        console.error("Error updating streak:", error);
    }
};

/**
 * Get comprehensive analytics for a specific user.
 */
export const getUserAnalytics = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password -verificationToken -resetPasswordToken");
        if (!user) {
            throw new Error("User not found");
        }
        
        // Resume Stats
        const resumes = await Resume.find({ userId });
        const avgResumeScore = resumes.length > 0 
            ? Math.round(resumes.reduce((acc, curr) => acc + curr.atsScore, 0) / resumes.length)
            : 0;

        // Interview Stats
        const interviews = await Interview.find({ user: userId });
        const completedInterviews = interviews.filter(i => i.status === "completed");
        const avgInterviewScore = completedInterviews.length > 0
            ? Number((completedInterviews.reduce((acc, curr) => acc + curr.finalScore, 0) / completedInterviews.length).toFixed(1))
            : 0;

        // Preparation Sessions Stats
        const prepSessions = await PreparationSession.find({ userId });
        const avgPrepProgress = prepSessions.length > 0
            ? Math.round(prepSessions.reduce((acc, curr) => acc + curr.progress, 0) / prepSessions.length)
            : 0;

        // Achievement count
        const achievementCount = await Achievement.countDocuments({ userId });

        // Weekly activity mockup (represents active prepare actions in past 7 days)
        const weeklyActivity = [
            { day: "Mon", count: 2 },
            { day: "Tue", count: 4 },
            { day: "Wed", count: 1 },
            { day: "Thu", count: 3 },
            { day: "Fri", count: user.streak > 1 ? 5 : 2 },
            { day: "Sat", count: 0 },
            { day: "Sun", count: 1 },
        ];

        return {
            user,
            stats: {
                totalResumes: resumes.length,
                avgResumeScore,
                totalInterviews: interviews.length,
                completedInterviews: completedInterviews.length,
                avgInterviewScore,
                totalPrepSessions: prepSessions.length,
                avgPrepProgress,
                achievementCount,
                streak: user.streak,
                level: user.level,
                xp: user.xp,
                studyHours: user.studyHours || Math.round(completedInterviews.length * 0.5 + prepSessions.length * 1.2)
            },
            weeklyActivity
        };
    } catch (error) {
        console.error("Error gathering user analytics:", error);
        throw error;
    }
};
