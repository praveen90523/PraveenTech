import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    technologies: { type: [String], default: [] }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
    role: { type: String, default: "" },
    company: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" }
}, { _id: false });

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        atsScore: {
            type: Number,
            required: true,
        },
        extractedSkills: {
            type: [String],
            default: [],
        },
        extractedProjects: {
            type: [ProjectSchema],
            default: [],
        },
        extractedExperience: {
            type: [ExperienceSchema],
            default: [],
        },
        missingSkills: {
            type: [String],
            default: [],
        },
        feedback: {
            type: String,
            default: "",
        },
        targetRole: {
            type: String,
            default: "",
        },
        targetDescription: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
