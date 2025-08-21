const { OpenAI } = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Store conversations in memory (use Redis or database in production)
const conversations = new Map()

// Local knowledge base for Planobration travel assistant
const TRAVEL_KNOWLEDGE = {
  destinations: {
    india: {
      cities: ["delhi", "mumbai", "goa", "kerala", "rajasthan", "agra", "jaipur"],
      info: "India offers incredible diversity from the Taj Mahal in Agra to the backwaters of Kerala. Popular destinations include Delhi for history, Goa for beaches, and Rajasthan for palaces.",
    },
    china: {
      cities: ["beijing", "shanghai", "hangzhou", "xian", "guangzhou"],
      info: "China combines ancient history with modern marvels. Visit Beijing for the Great Wall, Shanghai for skylines, Hangzhou for West Lake, and Xi'an for the Terracotta Warriors.",
    },
    europe: {
      cities: ["paris", "london", "rome", "barcelona", "amsterdam"],
      info: "Europe offers rich history, diverse cultures, and stunning architecture. From Paris' romance to Rome's ancient wonders, each city tells a unique story.",
    },
  },

  services: [
    "travel planning",
    "destination guides",
    "itinerary creation",
    "hotel booking assistance",
    "flight recommendations",
    "local experiences",
    "cultural insights",
    "budget planning",
  ],

  responses: {
    greeting: [
      "Hello! I'm your Planobration travel assistant. I can help you discover amazing destinations, plan itineraries, and provide travel insights. What adventure are you planning?",
      "Welcome to Planobration! I'm here to help you explore the world. Whether you're looking for destination ideas, travel tips, or planning assistance, I've got you covered. How can I help?",
      "Hi there! Ready to plan your next adventure? I can provide information about destinations, travel tips, and help you create memorable experiences. What interests you?",
    ],

    planobration: [
      "Planobration is your trusted travel companion, specializing in creating personalized travel experiences. We help you discover hidden gems, plan perfect itineraries, and make your travel dreams reality.",
      "Planobration offers comprehensive travel planning services including destination research, itinerary creation, and local insights to make your trips unforgettable.",
      "At Planobration, we believe every journey should be extraordinary. We provide expert travel guidance, destination recommendations, and personalized planning services.",
    ],

    destinations: [
      "I can help you explore amazing destinations! Are you interested in cultural experiences, adventure travel, beach destinations, or historical sites? Let me know your preferences.",
      "There are so many incredible places to discover! I can provide insights about popular destinations like India, China, Europe, and many more. What type of experience are you looking for?",
      "From bustling cities to serene landscapes, the world is full of amazing destinations. Tell me about your travel style and I'll suggest perfect places for you.",
    ],

    planning: [
      "I'd love to help you plan your trip! Tell me your destination, travel dates, interests, and budget, and I'll provide personalized recommendations.",
      "Great travel planning starts with understanding your preferences. What destination interests you, and what kind of experiences are you hoping to have?",
      "Let's create an amazing itinerary for you! Share your destination ideas, travel style, and must-see attractions, and I'll help you plan the perfect trip.",
    ],

    fallback: [
      "That's an interesting question! While I specialize in travel planning and destinations, I'm always learning. Could you tell me more about what you're looking for?",
      "I'm focused on helping with travel and destination planning. If you have specific travel questions, I'd be happy to help! Otherwise, feel free to contact our team directly.",
      "I'm here to help with travel-related questions and planning. Is there a specific destination or travel topic you'd like to explore?",
    ],
  },
}

function analyzeMessage(message) {
  const lowerMessage = message.toLowerCase()

  // Check for greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerMessage)) {
    return "greeting"
  }

  // Check for Planobration-specific questions
  if (/planobration|about you|who are you|what do you do/.test(lowerMessage)) {
    return "planobration"
  }

  // Check for destination queries
  if (/destination|place|country|city|visit|travel to|where/.test(lowerMessage)) {
    return "destinations"
  }

  // Check for planning queries
  if (/plan|itinerary|trip|vacation|holiday|book|recommend/.test(lowerMessage)) {
    return "planning"
  }

  // Check for specific destinations
  for (const [region, data] of Object.entries(TRAVEL_KNOWLEDGE.destinations)) {
    if (lowerMessage.includes(region) || data.cities.some((city) => lowerMessage.includes(city))) {
      return { type: "destination_info", region, data }
    }
  }

  return "fallback"
}

function generateLocalResponse(message, conversationId = null) {
  try {
    // Create conversation ID if not provided
    if (!conversationId) {
      conversationId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Analyze the message
    const analysis = analyzeMessage(message)
    let response

    if (typeof analysis === "object" && analysis.type === "destination_info") {
      // Specific destination information
      response = `${analysis.data.info} Would you like specific recommendations for ${analysis.region} or help planning an itinerary?`
    } else {
      // Get random response from category
      const responses = TRAVEL_KNOWLEDGE.responses[analysis] || TRAVEL_KNOWLEDGE.responses.fallback
      response = responses[Math.floor(Math.random() * responses.length)]
    }

    // Store conversation
    const conversation = conversations.get(conversationId) || []
    conversation.push({ role: "user", content: message }, { role: "assistant", content: response })
    conversations.set(conversationId, conversation.slice(-20)) // Keep last 20 messages

    return {
      content: response,
      conversationId: conversationId,
    }
  } catch (error) {
    console.error("[v0] Local AI Service Error:", error.message)

    return {
      content:
        "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our support team for assistance.",
      conversationId: conversationId || `error_${Date.now()}`,
    }
  }
}

async function generateResponse(message, conversationId = null) {
  return generateLocalResponse(message, conversationId)
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
