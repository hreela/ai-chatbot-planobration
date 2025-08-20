const express = require("express")
const router = express.Router()
const aiService = require("../services/ai")

// POST /api/chat - Handle chat messages
router.post("/", async (req, res) => {
  try {
    const { message, conversationId } = req.body

    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    // Generate AI response
    const response = await aiService.generateResponse(message, conversationId)

    res.json({
      response: response.content,
      conversationId: response.conversationId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat error:", error)
    res.status(500).json({
      error: "Failed to process message",
      fallback: "I apologize, but I'm experiencing technical difficulties. Please try again later.",
    })
  }
})

// GET /api/chat/health - Chat service health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "chat",
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
