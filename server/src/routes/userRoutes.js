import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
    deleteProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);

export default router;
