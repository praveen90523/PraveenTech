import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PreparationSession",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["CODING", "THEORY", "INTERVIEW", "BEHAVIORAL"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
        },
        source: {
            type: String,
            default: "Praveen Tech AI",
        },
        url: {
            type: String,
            default: "",
        },
        completed: {
            type: Boolean,
            default: false,
        },
        correctAnswer: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
