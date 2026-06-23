import User from "../models/User.js";

export const adminProtect = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin role required.",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization check failed",
            error: error.message,
        });
    }
};
