import mongoose from "mongoose";

const roadmapItemSchema = new mongoose.Schema({
    phase: { type: String, required: true },
    description: { type: String, required: true },
    resources: { type: [String], default: [] }
}, { _id: false });

const preparationSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        topic: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "",
        },
        company: {
            type: String,
            default: "",
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },
        roadmap: [roadmapItemSchema],
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

const PreparationSession = mongoose.model("PreparationSession", preparationSessionSchema);
export default PreparationSession;
