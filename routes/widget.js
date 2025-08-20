const express = require("express")
const router = express.Router()
const path = require("path")

// Serve the widget JavaScript file
router.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/javascript")
  res.setHeader("Cache-Control", "public, max-age=3600") // Cache for 1 hour
  res.sendFile(path.join(__dirname, "../public/widget.js"))
})

module.exports = router
