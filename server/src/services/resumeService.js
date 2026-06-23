import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { analyzeResumeContent } from "./geminiService.js";
import Resume from "../models/Resume.js";

/**
 * Parses the PDF resume, triggers AI analysis via Gemini, and saves the results.
 * @param {string} userId - ID of the authenticated user
 * @param {object} file - The file object from Multer
 * @param {string} [targetRole] - Target role for analysis
 * @param {string} [targetDescription] - Target job description for analysis
 * @returns {Promise<object>} The saved Resume document
 */
export const processAndAnalyzeResume = async (userId, file, targetRole = "", targetDescription = "") => {
    try {
        if (!file) {
            throw new Error("No resume file uploaded.");
        }

        // Read file buffer
        const dataBuffer = fs.readFileSync(file.path);

        // Parse PDF to get raw text
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;
        await parser.destroy();

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error(
                "Unable to extract text from PDF. The document might be empty or scanned."
            );
        }

        // Send text to Gemini API for parsing and ATS match
        const analysis = await analyzeResumeContent(
            resumeText,
            targetRole,
            targetDescription
        );

        // Save resume details to MongoDB
        const resumeUrl = `/uploads/resumes/${file.filename}`;
        const newResume = new Resume({
            userId,
            resumeUrl,
            atsScore: analysis.atsScore,
            extractedSkills: analysis.extractedSkills,
            extractedProjects: analysis.extractedProjects,
            extractedExperience: analysis.extractedExperience,
            missingSkills: analysis.missingSkills,
            feedback: analysis.feedback,
            targetRole,
            targetDescription,
        });

        await newResume.save();
        return newResume;
    } catch (error) {
        console.error("Resume processing service error:", error);
        throw error;
    }
};

/**
 * Retrieves the analysis history for a specific user.
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} List of user resumes
 */
export const getUserResumeHistory = async (userId) => {
    return await Resume.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Retrieves details of a specific resume analysis report.
 * @param {string} resumeId - The resume ID
 * @param {string} userId - The user's ID (for authentication check)
 * @returns {Promise<object|null>} The Resume document
 */
export const getResumeDetails = async (resumeId, userId) => {
    return await Resume.findOne({ _id: resumeId, userId });
};

/**
 * Deletes a resume record and its associated physical file.
 * @param {string} resumeId - The resume ID
 * @param {string} userId - The user's ID (for ownership confirmation)
 * @returns {Promise<boolean>} Success state of the deletion
 */
export const deleteUserResume = async (resumeId, userId) => {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
        return false;
    }

    // Attempt to delete the physical PDF file
    if (resume.resumeUrl) {
        const filePath = path.join(process.cwd(), resume.resumeUrl);
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting physical file:", err.message);
        });
    }

    await Resume.deleteOne({ _id: resumeId, userId });
    return true;
};
