import {
    processAndAnalyzeResume,
    getUserResumeHistory,
    getResumeDetails,
    deleteUserResume,
} from "../services/resumeService.js";

/**
 * Upload and analyze a resume PDF
 * POST /api/resumes/upload
 */
export const uploadAndAnalyze = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a resume file in PDF format.",
            });
        }

        const { targetRole, targetDescription } = req.body;
        const userId = req.user.id || req.user._id;

        const resume = await processAndAnalyzeResume(
            userId,
            req.file,
            targetRole,
            targetDescription
        );

        res.status(201).json({
            success: true,
            message: "Resume uploaded and analyzed successfully.",
            resume,
        });
    } catch (error) {
        console.error("Upload & Analyze controller error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process and analyze resume.",
        });
    }
};

/**
 * Get resume analysis history for the logged-in user
 * GET /api/resumes/history
 */
export const getResumeHistory = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const history = await getUserResumeHistory(userId);

        res.status(200).json({
            success: true,
            count: history.length,
            history,
        });
    } catch (error) {
        console.error("Get Resume History controller error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch resume history.",
        });
    }
};

/**
 * Get details of a single resume analysis report
 * GET /api/resumes/:id
 */
export const getResumeById = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const resume = await getResumeDetails(req.params.id, userId);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume report not found.",
            });
        }

        res.status(200).json({
            success: true,
            resume,
        });
    } catch (error) {
        console.error("Get Resume By ID controller error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch resume details.",
        });
    }
};

/**
 * Delete a specific resume analysis report
 * DELETE /api/resumes/:id
 */
export const deleteResume = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const success = await deleteUserResume(req.params.id, userId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: "Resume not found or unauthorized to delete.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Resume analysis deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Resume controller error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete resume analysis.",
        });
    }
};
