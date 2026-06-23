import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminProtect } from "../middleware/adminMiddleware.js";
import {
    getAllUsers,
    updateUserRole,
    deleteUserAccount,
    getSystemStats,
    broadcastNotification,
} from "../controllers/adminController.js";

const router = express.Router();

// Apply auth and admin check to all admin routes
router.use(protect, adminProtect);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUserAccount);
router.get("/stats", getSystemStats);
router.post("/broadcast", broadcastNotification);

export default router;
