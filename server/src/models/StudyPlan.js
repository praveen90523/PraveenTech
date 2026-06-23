import mongoose from "mongoose";

const studyTaskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { _id: false });

const studyWeekSchema = new mongoose.Schema({
    week: { type: Number, required: true },
    title: { type: String, required: true },
    tasks: [studyTaskSchema]
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false }
}, { _id: false });

const studyPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        targetRole: {
            type: String,
            required: true,
        },
        timeline: {
            type: String,
            default: "4 Weeks",
        },
        roadmap: [studyWeekSchema],
        milestones: [milestoneSchema],
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

const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);
export default StudyPlan;
