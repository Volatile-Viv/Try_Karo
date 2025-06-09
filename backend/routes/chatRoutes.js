const express = require("express");
const router = express.Router();
const { getChatResponse } = require("../controllers/chatController");

// Route to get chat response from Groq API
router.post("/message", getChatResponse);

module.exports = router;
