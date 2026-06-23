import StudyPlan from "../models/StudyPlan.js";
import User from "../models/User.js";
import { generatePersonalizedStudyPlan } from "../services/geminiService.js";
import { awardXP } from "../services/analyticsService.js";

/**
 * Generate a personalized study plan.
 */
export const generateStudyPlan = async (req, res) => {
    try {
        const { targetRole, timeline } = req.body;
        if (!targetRole) {
            return res.status(400).json({
                success: false,
                message: "Target role is required",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Call Gemini service
        const rawPlan = await generatePersonalizedStudyPlan(
            targetRole,
            timeline || "4 Weeks",
            user.skills || []
        );

        // Delete any existing plan for this user
        await StudyPlan.findOneAndDelete({ userId: req.user.id });

        // Map milestones with dates based on current day plus daysFromStart
        const startDay = new Date();
        const milestones = (rawPlan.milestones || []).map(m => {
            const dueDate = new Date();
            dueDate.setDate(startDay.getDate() + (m.daysFromStart || 7));
            return {
                title: m.title,
                dueDate,
                completed: false
            };
        });

        // Create new study plan
        const studyPlan = await StudyPlan.create({
            userId: req.user.id,
            targetRole,
            timeline: timeline || "4 Weeks",
            roadmap: rawPlan.roadmap || [],
            milestones,
            progress: 0
        });

        // Award 20 XP for study planning
        await awardXP(
            req.user.id,
            20,
            `Initiated Study Plan: ${targetRole}`,
            `Generated a personalized ${timeline || "4-week"} learning path.`,
            "calendar-check"
        );

        res.status(201).json({
            success: true,
            message: "Study plan generated successfully",
            studyPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate study plan",
            error: error.message
        });
    }
};

/**
 * Get active study plan.
 */
export const getStudyPlan = async (req, res) => {
    try {
        const studyPlan = await StudyPlan.findOne({ userId: req.user.id });
        res.status(200).json({
            success: true,
            studyPlan: studyPlan || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve study plan",
            error: error.message
        });
    }
};

/**
 * Update checklist item (toggle task or milestone completion status)
 */
export const updateChecklist = async (req, res) => {
    try {
        const { weekIndex, taskIndex, milestoneIndex } = req.body;
        
        const studyPlan = await StudyPlan.findOne({ userId: req.user.id });
        if (!studyPlan) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found"
            });
        }

        let isCompleted = false;

        // Toggle task
        if (weekIndex !== undefined && taskIndex !== undefined) {
            if (studyPlan.roadmap[weekIndex] && studyPlan.roadmap[weekIndex].tasks[taskIndex]) {
                const task = studyPlan.roadmap[weekIndex].tasks[taskIndex];
                task.completed = !task.completed;
                isCompleted = task.completed;
            }
        }
        
        // Toggle milestone
        if (milestoneIndex !== undefined) {
            if (studyPlan.milestones[milestoneIndex]) {
                const milestone = studyPlan.milestones[milestoneIndex];
                milestone.completed = !milestone.completed;
                isCompleted = milestone.completed;
            }
        }

        // Recalculate progress: percentage of completed tasks + milestones
        let totalItems = 0;
        let completedItems = 0;

        studyPlan.roadmap.forEach(week => {
            week.tasks.forEach(task => {
                totalItems++;
                if (task.completed) completedItems++;
            });
        });

        studyPlan.milestones.forEach(m => {
            totalItems++;
            if (m.completed) completedItems++;
        });

        const newProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        studyPlan.progress = newProgress;
        await studyPlan.save();

        // If something was checked completed, award 5 XP
        if (isCompleted) {
            await awardXP(
                req.user.id,
                5,
                "Study plan progress",
                "Successfully completed a task in your planner.",
                "clipboard-check"
            );
        }

        res.status(200).json({
            success: true,
            message: "Checklist updated",
            studyPlan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update study plan checklist",
            error: error.message
        });
    }
};

/**
 * Delete / reset active study plan.
 */
export const deleteStudyPlan = async (req, res) => {
    try {
        await StudyPlan.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({
            success: true,
            message: "Study plan reset successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reset study plan",
            error: error.message
        });
    }
};
