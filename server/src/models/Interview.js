import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      trim: true,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    feedback: {
      type: String,
      default: "",
    },

    improvement: {
      type: String,
      default: "",
    },

    correctAnswer: {
      type: String,
      default: "",
    },

    confidenceLevel: {
      type: String,
      default: "Medium",
    },

    strengths: {
      type: String,
      default: "",
    },

    isSkipped: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    domain: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    type: {
      type: String,
      enum: ["interview", "coding"],
      default: "interview",
    },

    mode: {
      type: String,
      enum: ["technical", "executive"],
      default: "technical",
    },

    questions: {
      type: [String],
      default: [],
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    accuracyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    bookmarkedQuestions: {
      type: [Number],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },

    questionCount: {
      type: Number,
      default: 5,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    technicalKnowledge: {
      type: String,
      default: "",
    },

    communication: {
      type: String,
      default: "",
    },

    confidence: {
      type: String,
      default: "",
    },

    hrReadiness: {
      type: String,
      default: "",
    },

    strengthsSummary: {
      type: String,
      default: "",
    },

    improvementAreasSummary: {
      type: String,
      default: "",
    },

    recommendedTopics: {
      type: [String],
      default: [],
    },

    resultStatus: {
      type: String,
      default: "Needs Practice",
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

export default Interview;