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
    console.log("[v0] OpenAI API Key exists:", !!process.env.OPENAI_API_KEY)
    console.log("[v0] OpenAI API Key length:", process.env.OPENAI_API_KEY?.length || 0)

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

    console.log("[v0] Making OpenAI request with messages:", messages.length)

    // Generate response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    console.log("[v0] OpenAI response received:", !!completion.choices[0])

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
    console.error("[v0] AI Service Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status,
    })

    if (error.code === "insufficient_quota" || error.status === 429) {
      console.log("[v0] Using mock response due to OpenAI quota limit")

      const mockResponses = [
        "Welcome to Planobration! I'm here to help you with travel planning and destination information. What would you like to know about your next adventure?",
        "Planobration offers comprehensive travel planning services. We can help you discover amazing destinations, plan itineraries, and make your travel dreams come true. How can I assist you today?",
        "I'd be happy to help you with travel information! Planobration specializes in creating memorable travel experiences. What destination or travel topic interests you?",
        "Thank you for using Planobration's travel assistant! While I'm currently experiencing high demand, I can still help with basic travel questions. What would you like to know?",
        "Planobration is your trusted travel companion. We provide expert guidance on destinations, travel tips, and planning services. How can I help make your next trip amazing?",
      ]

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

      return {
        content: randomResponse,
        conversationId: conversationId || `mock_${Date.now()}`,
      }
    }

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
