import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            default: 10,
        },
        badge: {
            type: String,
            default: "trophy",
        },
    },
    {
        timestamps: true,
    }
);

const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;
