import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateVerificationToken, {
    hashToken,
} from "../utils/generateVerificationToken.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const { token, hashedToken, expire } = generateVerificationToken();

        const user = await User.create({
            name,
            email,
            password,
            role: role || "student",
            verificationToken: hashedToken,
            verificationTokenExpire: expire,
        });

        await sendVerificationEmail(email, token);

        res.status(201).json({
            message:
                "Registration successful. Please check your email to verify your account.",
            email: user.email,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (role && user.role !== role) {
            return res.status(403).json({
                message: `This account is not registered as ${role}`,
            });
        }

        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
    try {
        const hashedToken = hashToken(req.params.token);

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification link.",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        const { token, hashedToken, expire } = generateVerificationToken();
        user.verificationToken = hashedToken;
        user.verificationTokenExpire = expire;
        await user.save();

        await sendVerificationEmail(email, token);

        res.json({ message: "Verification email sent successfully." });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
