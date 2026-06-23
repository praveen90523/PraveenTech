import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    sendMessage,
    getChatHistory,
    clearChatHistory,
} from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/chat", protect, sendMessage);
router.get("/chat", protect, getChatHistory);
router.delete("/chat", protect, clearChatHistory);

export default router;
