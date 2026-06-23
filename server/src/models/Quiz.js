import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    selectedAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false }
}, { _id: false });

const quizSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PreparationSession",
            required: true,
            index: true,
        },
        questions: [quizQuestionSchema],
        score: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
