import PreparationSession from "../models/PreparationSession.js";
import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import { generateRoadmapAndMaterials, generateQuizQuestions } from "../services/geminiService.js";
import { awardXP } from "../services/analyticsService.js";

/**
 * Recalculates progress for a preparation session.
 * Formula: 50% based on questions completed, 50% based on quiz completion.
 */
const recalculateSessionProgress = async (sessionId) => {
    const session = await PreparationSession.findById(sessionId);
    if (!session) return 0;

    const totalQuestions = await Question.countDocuments({ sessionId });
    const completedQuestions = await Question.countDocuments({ sessionId, completed: true });
    const quiz = await Quiz.findOne({ sessionId, completed: true });

    const questionsWeight = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 50 : 0;
    const quizWeight = quiz ? 50 : 0;
    const finalProgress = Math.round(questionsWeight + quizWeight);

    session.progress = finalProgress;
    await session.save();

    // Check for mastery bonus XP
    if (finalProgress === 100) {
        await awardXP(
            session.userId,
            40,
            `Topic Mastery: ${session.topic}`,
            `Successfully completed all coding/theory prep tasks and the topic quiz for ${session.topic}!`,
            "star"
        );
    }

    return finalProgress;
};

/**
 * Generate preparation materials: Roadmap + Coding + Theory questions.
 */
export const generatePreparation = async (req, res) => {
    try {
        const { topic, role, company, difficulty } = req.body;
        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required"
            });
        }

        // Call Gemini to generate materials
        const data = await generateRoadmapAndMaterials(
            topic,
            role,
            company,
            difficulty || "Beginner"
        );

        // Create Preparation Session
        const session = await PreparationSession.create({
            userId: req.user.id,
            topic,
            role: role || "",
            company: company || "",
            difficulty: difficulty || "Beginner",
            roadmap: data.roadmap || [],
            progress: 0
        });

        // Create associated Questions
        const questionsToCreate = (data.questions || []).map(q => ({
            ...q,
            sessionId: session._id,
            completed: false
        }));
        const questions = await Question.insertMany(questionsToCreate);

        // Award 30 XP for starting a new topic prep
        await awardXP(
            req.user.id,
            30,
            `Began preparing ${topic}`,
            `Generated a personalized learning roadmap with 6 study questions.`,
            "journal-bookmark"
        );

        res.status(201).json({
            success: true,
            message: "Preparation materials generated successfully",
            session,
            questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate preparation materials",
            error: error.message
        });
    }
};

/**
 * List all preparation sessions for the user.
 */
export const getPreparationSessions = async (req, res) => {
    try {
        const sessions = await PreparationSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch sessions",
            error: error.message
        });
    }
};

/**
 * Get detailed preparation session (including questions and active quizzes).
 */
export const getPreparationSessionById = async (req, res) => {
    try {
        const session = await PreparationSession.findById(req.params.id);
        if (!session || session.userId.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Preparation session not found"
            });
        }

        const questions = await Question.find({ sessionId: session._id });
        const quiz = await Quiz.findOne({ sessionId: session._id });

        res.status(200).json({
            success: true,
            session,
            questions,
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch session details",
            error: error.message
        });
    }
};

/**
 * Generate a new MCQ Quiz for a preparation session.
 */
export const startQuiz = async (req, res) => {
    try {
        const session = await PreparationSession.findById(req.params.id);
        if (!session || session.userId.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Preparation session not found"
            });
        }

        // Check if quiz already exists. If yes, delete to restart it or reuse it
        await Quiz.findOneAndDelete({ sessionId: session._id });

        // Generate MCQ questions using Gemini
        const quizQuestions = await generateQuizQuestions(session.topic, session.difficulty);

        const quiz = await Quiz.create({
            sessionId: session._id,
            questions: quizQuestions,
            score: 0,
            completed: false
        });

        res.status(201).json({
            success: true,
            message: "Quiz generated successfully",
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate quiz",
            error: error.message
        });
    }
};

/**
 * Submit answers for grading.
 */
export const submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body; // Array of selected option strings matching questions array index
        const session = await PreparationSession.findById(req.params.id);
        if (!session || session.userId.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: "Preparation session not found"
            });
        }

        const quiz = await Quiz.findOne({ sessionId: session._id });
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found for this session. Start a quiz first."
            });
        }

        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            const selected = answers[idx] || "";
            q.selectedAnswer = selected;
            q.isCorrect = (selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
            if (q.isCorrect) correctCount++;
        });

        const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
        quiz.score = calculatedScore;
        quiz.completed = true;
        quiz.completedAt = new Date();

        await quiz.save();

        // Update session progress
        await recalculateSessionProgress(session._id);

        // Award 50 XP for completing a quiz
        await awardXP(
            req.user.id,
            50,
            `Completed ${session.topic} Quiz`,
            `Scored ${calculatedScore}% (${correctCount}/${quiz.questions.length} correct).`,
            "patch-check"
        );

        res.status(200).json({
            success: true,
            message: "Quiz submitted and evaluated successfully",
            quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to evaluate quiz submission",
            error: error.message
        });
    }
};

/**
 * Toggle check status for a single study question.
 */
export const toggleQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Toggle state
        question.completed = !question.completed;
        await question.save();

        // Recompute session progress
        const updatedProgress = await recalculateSessionProgress(question.sessionId);

        res.status(200).json({
            success: true,
            message: `Question marked as ${question.completed ? "completed" : "incomplete"}`,
            question,
            progress: updatedProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to toggle question status",
            error: error.message
        });
    }
};
