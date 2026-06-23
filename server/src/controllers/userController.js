import User from "../models/User.js";

/**
 * Get the current user's profile.
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -verificationToken -resetPasswordToken");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};

/**
 * Update user profile details (skills, target role, company, experience).
 */
export const updateProfile = async (req, res) => {
    try {
        const {
            name,
            skills,
            careerGoal,
            targetCompany,
            experienceLevel,
            twoFactorEnabled,
            profilePicture
        } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update fields if provided
        if (name !== undefined) user.name = name;
        if (skills !== undefined) user.skills = skills;
        if (careerGoal !== undefined) user.careerGoal = careerGoal;
        if (targetCompany !== undefined) user.targetCompany = targetCompany;
        if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
        if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        const updatedUser = await user.save();

        // Strip password
        const userObj = updatedUser.toObject();
        delete userObj.password;
        delete userObj.verificationToken;
        delete userObj.resetPasswordToken;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: userObj,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message,
        });
    }
};

/**
 * Delete profile
 */
export const deleteProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete profile",
            error: error.message
        });
    }
};
