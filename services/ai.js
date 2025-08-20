const { OpenAI } = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Store conversations in memory (use Redis or database in production)
const conversations = new Map()

const SYSTEM_PROMPT = `You are a helpful AI assistant for Planobration.com. 
You should be professional, friendly, and knowledgeable about business planning and strategy.
Keep responses concise and helpful. If you don't know something specific about Planobration, 
direct users to contact the team directly.`

async function generateResponse(message, conversationId = null) {
  try {
    // Create or retrieve conversation
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    const conversation = conversations.get(conversationId) || []

    // Add user message to conversation
    conversation.push({ role: "user", content: message })

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...conversation.slice(-10), // Keep last 10 messages for context
    ]

    // Generate response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const assistantMessage = completion.choices[0].message.content

    // Add assistant response to conversation
    conversation.push({ role: "assistant", content: assistantMessage })

    // Store updated conversation (limit to last 20 messages)
    conversations.set(conversationId, conversation.slice(-20))

    return {
      content: assistantMessage,
      conversationId: conversationId,
    }
  } catch (error) {
    console.error("AI Service Error:", error)
    throw new Error("Failed to generate AI response")
  }
}

// Clean up old conversations (run periodically)
setInterval(
  () => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
    for (const [id] of conversations) {
      const timestamp = Number.parseInt(id.split("_")[1])
      if (timestamp < cutoff) {
        conversations.delete(id)
      }
    }
  },
  60 * 60 * 1000,
) // Run every hour

module.exports = {
  generateResponse,
}
