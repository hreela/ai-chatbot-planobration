const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 10000

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://planobration.com",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.static("public"))

// Routes
app.use("/api/chat", require("./routes/chat"))
app.use("/widget.js", require("./routes/widget"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Planobration Chatbot API running on port ${PORT}`)
})
