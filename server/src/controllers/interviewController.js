import Interview from "../models/Interview.js";
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateFinalInterviewReport,
} from "../services/geminiService.js";

/**
 * Create Interview
 * POST /api/interviews/create
 */
export const createInterview = async (req, res) => {
  try {
    const { role, domain, difficulty, type, mode, questionCount } = req.body;

    if (!role || !domain || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Role, domain and difficulty are required",
      });
    }

    const count = questionCount ? Number(questionCount) : 5;

    const questions = await generateInterviewQuestions(
      role,
      domain,
      difficulty,
      type || "interview",
      mode || "technical",
      count
    );

    const interview = await Interview.create({
      user: req.user.id || req.user._id,
      role,
      domain,
      difficulty,
      type: type || "interview",
      mode: mode || "technical",
      questionCount: count,
      questions,
      answers: [],
      status: "pending",
      finalScore: 0,
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Create Interview Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create interview",
      error: error.message,
    });
  }
};

/**
 * Get All User Interviews
 * GET /api/interviews
 */
export const getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id || req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error("Get Interviews Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Interview
 * GET /api/interviews/:id
 */
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (
      interview.user.toString() !==
      (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error("Get Interview Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Submit Answer
 * POST /api/interviews/:id/answer
 */
export const submitAnswer = async (req, res) => {
  try {
    const { question, answer, isSkipped, questionIndex } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!isSkipped && answer === undefined) {
      return res.status(400).json({
        success: false,
        message: "Answer is required when not skipping",
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    let evaluation = {
      score: 0,
      confidenceLevel: "Low",
      feedback: "Skipped",
      improvement: "",
      correctAnswer: "",
      strengths: "",
    };

    if (!isSkipped) {
      evaluation = await evaluateAnswer(
        question,
        answer,
        interview.type || "interview",
        interview.mode || "technical"
      );
    }

    const answerObject = {
      question,
      answer: isSkipped ? "" : answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvement: evaluation.improvement,
      correctAnswer: evaluation.correctAnswer,
      confidenceLevel: evaluation.confidenceLevel,
      strengths: evaluation.strengths,
      isSkipped: !!isSkipped,
    };

    // Find if the question has already been answered/saved in the answers array
    let answerIndex = -1;
    if (typeof questionIndex === "number" && questionIndex >= 0 && questionIndex < interview.questions.length) {
      answerIndex = questionIndex;
    } else {
      answerIndex = interview.answers.findIndex(
        (ans) => ans.question.trim().toLowerCase() === question.trim().toLowerCase()
      );
    }

    if (answerIndex !== -1 && answerIndex < interview.answers.length) {
      interview.answers[answerIndex] = answerObject;
    } else {
      if (typeof questionIndex === "number" && questionIndex > interview.answers.length) {
        while (interview.answers.length < questionIndex) {
          const qText = interview.questions[interview.answers.length];
          interview.answers.push({
            question: qText,
            answer: "",
            score: 0,
            feedback: "Skipped",
            isSkipped: true,
          });
        }
      }
      interview.answers.push(answerObject);
    }

    await interview.save();

    res.status(200).json({
      success: true,
      evaluation,
      interview,
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Interview
 * POST /api/interviews/:id/complete
 */
export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    let totalScore = 0;

    interview.answers.forEach((answer) => {
      totalScore += answer.score || 0;
    });

    const averageScore =
      interview.answers.length > 0
        ? Math.round(totalScore / interview.answers.length)
        : 0;

    interview.finalScore = averageScore;
    interview.status = "completed";

    // Generate overall executive assessment report card details
    const report = await generateFinalInterviewReport(interview);
    interview.technicalKnowledge = report.technicalKnowledge || "Good";
    interview.communication = report.communication || "Good";
    interview.confidence = report.confidence || "Good";
    interview.hrReadiness = report.hrReadiness || "Good";
    interview.accuracyScore = typeof report.accuracyScore === "number" ? report.accuracyScore : 0;
    interview.strengthsSummary = report.strengthsSummary || "";
    interview.improvementAreasSummary = report.improvementAreasSummary || "";
    interview.recommendedTopics = report.recommendedTopics || [];
    interview.resultStatus = report.resultStatus || (interview.type === "coding" ? "Code Ready" : "Interview Ready");

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview completed",
      finalScore: averageScore,
      interview,
    });
  } catch (error) {
    console.error("Complete Interview Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Interview Notes
 * PUT /api/interviews/:id/notes
 */
export const updateInterviewNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (
      interview.user.toString() !==
      (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    interview.notes = notes || "";
    await interview.save();

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      notes: interview.notes,
    });
  } catch (error) {
    console.error("Update Notes Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Toggle Bookmark Question
 * PUT /api/interviews/:id/bookmark
 */
export const toggleBookmarkQuestion = async (req, res) => {
  try {
    const { questionIndex } = req.body;

    if (typeof questionIndex !== "number") {
      return res.status(400).json({
        success: false,
        message: "questionIndex is required",
      });
    }

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (
      interview.user.toString() !==
      (req.user.id || req.user._id).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const bookmarkIdx = interview.bookmarkedQuestions.indexOf(questionIndex);
    if (bookmarkIdx > -1) {
      interview.bookmarkedQuestions.splice(bookmarkIdx, 1);
    } else {
      interview.bookmarkedQuestions.push(questionIndex);
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Bookmark toggled successfully",
      bookmarkedQuestions: interview.bookmarkedQuestions,
    });
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};