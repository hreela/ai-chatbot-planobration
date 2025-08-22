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
    asia: {
      cities: ["tokyo", "seoul", "bangkok", "singapore", "kuala lumpur", "manila"],
      info: "Asia offers incredible diversity from Tokyo's modern culture to Bangkok's temples. Experience cutting-edge technology, ancient traditions, and amazing cuisine.",
    },
    africa: {
      cities: ["cairo", "cape town", "marrakech", "nairobi", "lagos"],
      info: "Africa combines wildlife adventures, ancient history, and vibrant cultures. From Egyptian pyramids to African safaris, it's a continent of wonders.",
    },
    americas: {
      cities: ["new york", "los angeles", "mexico city", "rio de janeiro", "buenos aires"],
      info: "The Americas offer everything from bustling metropolises to natural wonders. Experience diverse cultures, stunning landscapes, and world-class cities.",
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

    budget: [
      "I can help you plan a trip within your budget! What's your approximate budget range and preferred destination? I'll suggest cost-effective options.",
      "Budget travel doesn't mean compromising on experiences! Tell me your budget and interests, and I'll recommend affordable destinations and money-saving tips.",
      "Great question about budget planning! Share your budget range and travel style, and I'll help you maximize your travel experience.",
    ],

    weather: [
      "Weather can make or break a trip! What destination and time of year are you considering? I'll provide weather insights and best travel times.",
      "I can help you choose the perfect time to visit based on weather patterns. Which destination interests you and when are you planning to travel?",
      "Weather planning is crucial! Tell me your destination and I'll share the best seasons to visit and what to expect.",
    ],

    food: [
      "Food is one of the best parts of traveling! Are you interested in specific cuisines or looking for food experiences in a particular destination?",
      "Culinary adventures await! I can recommend food experiences, local specialties, and dining tips for various destinations. What interests you?",
      "Every destination has unique flavors to discover! Which cuisine or destination's food scene would you like to explore?",
    ],

    accommodation: [
      "I can help you find the perfect place to stay! Are you looking for luxury hotels, budget options, unique experiences, or family-friendly accommodations?",
      "Accommodation choice can enhance your travel experience! Tell me your destination, budget, and preferences, and I'll provide recommendations.",
      "From boutique hotels to local homestays, there are many accommodation options! What type of experience are you looking for?",
    ],

    activities: [
      "There are so many amazing activities to choose from! Are you interested in adventure sports, cultural experiences, nature activities, or city exploration?",
      "I can suggest activities based on your interests! Tell me what you enjoy - outdoor adventures, museums, local experiences, or relaxation?",
      "Every destination offers unique activities! What type of experiences excite you most - adventure, culture, nature, or entertainment?",
    ],
  },
}

let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  const { createClient } = require("@supabase/supabase-js")
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
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

  // Check for budget queries
  if (/budget|cost|price|cheap|expensive|afford|money/.test(lowerMessage)) {
    return "budget"
  }

  // Check for weather queries
  if (/weather|climate|temperature|rain|season|best time/.test(lowerMessage)) {
    return "weather"
  }

  // Check for food queries
  if (/food|cuisine|restaurant|eat|dining|local food|street food/.test(lowerMessage)) {
    return "food"
  }

  // Check for accommodation queries
  if (/hotel|accommodation|stay|lodge|resort|hostel|airbnb/.test(lowerMessage)) {
    return "accommodation"
  }

  // Check for activity queries
  if (/activity|activities|things to do|attractions|sightseeing|adventure/.test(lowerMessage)) {
    return "activities"
  }

  // Check for specific destinations
  for (const [region, data] of Object.entries(TRAVEL_KNOWLEDGE.destinations)) {
    if (lowerMessage.includes(region) || data.cities.some((city) => lowerMessage.includes(city))) {
      return { type: "destination_info", region, data }
    }
  }

  return "fallback"
}

async function checkDatabaseAnswer(question) {
  if (!supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from("chatbot_qa")
      .select("answer")
      .eq("status", "answered")
      .ilike("question", `%${question}%`)
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("[v0] Database query error:", error)
      return null
    }

    return data?.answer || null
  } catch (error) {
    console.error("[v0] Database connection error:", error)
    return null
  }
}

async function saveUnansweredQuestion(question) {
  console.log("[v0] AI Service: Attempting to save question:", question)

  if (!supabase) {
    console.log("[v0] Supabase not configured - question not saved:", question)
    return
  }

  console.log("[v0] AI Service: Supabase client exists, proceeding with save")

  try {
    console.log("[v0] AI Service: Checking for existing question...")

    const { data: existing, error: selectError } = await supabase
      .from("chatbot_qa")
      .select("id, question_count")
      .ilike("question", `%${question}%`)
      .limit(1)

    console.log("[v0] AI Service: Existing question check result:", { existing, selectError })

    if (selectError) {
      console.error("[v0] AI Service: Error checking existing question:", selectError)
    }

    if (existing && existing.length > 0) {
      const existingQuestion = existing[0]
      // Increment question count if similar question exists
      console.log("[v0] AI Service: Updating existing question count")
      const { data: updateData, error: updateError } = await supabase
        .from("chatbot_qa")
        .update({
          question_count: existingQuestion.question_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingQuestion.id)
        .select() // Added .select() to return updated data

      console.log("[v0] AI Service: Update result:", { updateData, updateError })
    } else {
      // Insert new question
      console.log("[v0] AI Service: Inserting new question")
      const { data: insertData, error: insertError } = await supabase
        .from("chatbot_qa")
        .insert({
          question: question,
          status: "pending",
          question_count: 1, // Added explicit question_count
        })
        .select() // Added .select() to return inserted data

      console.log("[v0] AI Service: Insert result:", { insertData, insertError })

      if (insertError) {
        console.error("[v0] AI Service: Insert error details:", insertError)
      }
    }

    console.log("[v0] AI Service: Question save operation completed successfully")
  } catch (error) {
    console.error("[v0] AI Service: Error saving question to database:", error)
  }
}

async function generateLocalResponse(message, conversationId = null) {
  try {
    // Create conversation ID if not provided
    if (!conversationId) {
      conversationId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // First, check if we have a database answer for this question
    const databaseAnswer = await checkDatabaseAnswer(message)
    if (databaseAnswer) {
      // Store conversation
      const conversation = conversations.get(conversationId) || []
      conversation.push({ role: "user", content: message }, { role: "assistant", content: databaseAnswer })
      conversations.set(conversationId, conversation.slice(-20))

      return {
        content: databaseAnswer,
        conversationId: conversationId,
        source: "database",
      }
    }

    await saveUnansweredQuestion(message)

    // If no database answer, use local knowledge base
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
      source: "knowledge_base",
    }
  } catch (error) {
    console.error("[v0] Local AI Service Error:", error.message)

    return {
      content:
        "I apologize, but I'm experiencing some technical difficulties. Please try again or contact our support team for assistance.",
      conversationId: conversationId || `error_${Date.now()}`,
      source: "error",
    }
  }
} // Added missing closing brace for generateLocalResponse function

async function generateResponse(message, conversationId = null) {
  return await generateLocalResponse(message, conversationId)
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
