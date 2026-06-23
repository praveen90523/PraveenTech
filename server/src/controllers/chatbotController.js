import Chat from "../models/Chat.js";
import { generateChatResponse } from "../services/geminiService.js";
import { awardXP } from "../services/analyticsService.js";

/**
 * Send a message to the AI Chatbot and get a contextual response.
 */
export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Fetch or create chat record for this user
        let chat = await Chat.findOne({ userId: req.user.id });
        if (!chat) {
            chat = await Chat.create({ userId: req.user.id, messages: [] });
        }

        // Get AI response
        const aiResponseText = await generateChatResponse(chat.messages, message);

        // Update conversation history
        chat.messages.push({ sender: "user", text: message });
        chat.messages.push({ sender: "ai", text: aiResponseText });
        await chat.save();

        // Award 5 XP for chatbot consultation (once per interaction cycle)
        await awardXP(
            req.user.id, 
            5, 
            "Career assistant query", 
            `Consulted the AI Career assistant about: "${message.substring(0, 30)}..."`
        );

        res.status(200).json({
            success: true,
            chatHistory: chat.messages,
            reply: aiResponseText,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to communicate with Career Assistant",
            error: error.message,
        });
    }
};

/**
 * Get chatbot history for the authenticated user.
 */
export const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.user.id });
        res.status(200).json({
            success: true,
            chatHistory: chat ? chat.messages : [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch chat history",
            error: error.message,
        });
    }
};

/**
 * Clear chat history.
 */
export const clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ userId: req.user.id });
        res.status(200).json({
            success: true,
            message: "Chat history cleared successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to clear chat history",
            error: error.message,
        });
    }
};
