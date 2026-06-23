import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },
        profilePicture: {
            type: String,
            default: "",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationTokenExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        skills: {
            type: [String],
            default: [],
        },
        careerGoal: {
            type: String,
            default: "",
        },
        targetCompany: {
            type: String,
            default: "",
        },
        experienceLevel: {
            type: String,
            default: "",
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
            default: "",
        },
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        streak: {
            type: Number,
            default: 0,
        },
        lastActive: {
            type: Date,
            default: Date.now,
        },
        studyHours: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before save
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
