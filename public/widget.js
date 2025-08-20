;(() => {
  // Prevent multiple initializations
  if (window.PlanobrationChatbot) {
    return
  }

  const PlanobrationChatbot = {
    config: {
      apiUrl: "",
      position: "bottom-right",
      primaryColor: "#be123c",
      accentColor: "#ec4899",
    },

    init: function (options) {
      this.config = { ...this.config, ...options }
      this.createWidget()
      this.attachEventListeners()
    },

    createWidget: function () {
      // Create widget HTML
      const widgetHTML = `
        <div id="planobration-chatbot-container" style="
          position: fixed;
          ${this.config.position.includes("bottom") ? "bottom: 20px;" : "top: 20px;"}
          ${this.config.position.includes("right") ? "right: 20px;" : "left: 20px;"}
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <!-- Chat Button -->
          <div id="planobration-chat-button" style="
            width: 60px;
            height: 60px;
            background-color: ${this.config.primaryColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
          ">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>

          <!-- Chat Widget -->
          <div id="planobration-chat-widget" style="
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            display: none;
            flex-direction: column;
            position: absolute;
            ${this.config.position.includes("bottom") ? "bottom: 70px;" : "top: 70px;"}
            ${this.config.position.includes("right") ? "right: 0;" : "left: 0;"}
          ">
            <!-- Header -->
            <div style="
              background-color: ${this.config.primaryColor};
              color: white;
              padding: 16px;
              border-radius: 12px 12px 0 0;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span style="font-weight: 600;">Planobration AI</span>
              </div>
              <div id="planobration-close-button" style="
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
              ">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </div>
            </div>

            <!-- Messages -->
            <div id="planobration-messages" style="
              flex: 1;
              padding: 16px;
              overflow-y: auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
            ">
              <div class="bot-message" style="
                display: flex;
                align-items: flex-start;
                gap: 8px;
              ">
                <div style="
                  width: 32px;
                  height: 32px;
                  background-color: ${this.config.accentColor};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                ">
                  <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div style="
                  background-color: #f3f4f6;
                  padding: 12px;
                  border-radius: 12px;
                  max-width: 80%;
                  font-size: 14px;
                  line-height: 1.4;
                ">
                  Hello! I'm the Planobration AI assistant. How can I help you today?
                </div>
              </div>
            </div>

            <!-- Input -->
            <div style="
              padding: 16px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              gap: 8px;
            ">
              <input 
                id="planobration-message-input" 
                type="text" 
                placeholder="Type your message..."
                style="
                  flex: 1;
                  padding: 12px;
                  border: 1px solid #d1d5db;
                  border-radius: 8px;
                  font-size: 14px;
                  outline: none;
                "
              />
              <button id="planobration-send-button" style="
                background-color: ${this.config.primaryColor};
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
              ">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `

      // Insert widget into page
      document.body.insertAdjacentHTML("beforeend", widgetHTML)
    },

    attachEventListeners: function () {
      const button = document.getElementById("planobration-chat-button")
      const widget = document.getElementById("planobration-chat-widget")
      const closeButton = document.getElementById("planobration-close-button")
      const sendButton = document.getElementById("planobration-send-button")
      const input = document.getElementById("planobration-message-input")

      button.addEventListener("click", () => {
        widget.style.display = widget.style.display === "none" ? "flex" : "none"
      })

      closeButton.addEventListener("click", () => {
        widget.style.display = "none"
      })

      sendButton.addEventListener("click", () => {
        this.sendMessage()
      })

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage()
        }
      })
    },

    sendMessage: async function () {
      const input = document.getElementById("planobration-message-input")
      const message = input.value.trim()

      if (!message) return

      // Add user message to chat
      this.addMessage(message, "user")
      input.value = ""

      // Show typing indicator
      this.showTyping()

      try {
        const response = await fetch(`${this.config.apiUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })

        const data = await response.json()

        // Remove typing indicator and add bot response
        this.hideTyping()
        this.addMessage(data.response || data.fallback, "bot")
      } catch (error) {
        console.error("Chat error:", error)
        this.hideTyping()
        this.addMessage("Sorry, I'm having trouble connecting. Please try again later.", "bot")
      }
    },

    addMessage: function (content, sender) {
      const messagesContainer = document.getElementById("planobration-messages")
      const isUser = sender === "user"

      const messageHTML = `
        <div class="${sender}-message" style="
          display: flex;
          align-items: flex-start;
          gap: 8px;
          ${isUser ? "flex-direction: row-reverse;" : ""}
        ">
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${isUser ? this.config.primaryColor : this.config.accentColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              ${
                isUser
                  ? '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
                  : '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>'
              }
            </svg>
          </div>
          <div style="
            background-color: ${isUser ? this.config.primaryColor : "#f3f4f6"};
            color: ${isUser ? "white" : "#374151"};
            padding: 12px;
            border-radius: 12px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.4;
          ">
            ${content}
          </div>
        </div>
      `

      messagesContainer.insertAdjacentHTML("beforeend", messageHTML)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    showTyping: function () {
      const messagesContainer = document.getElementById("planobration-messages")
      const typingHTML = `
        <div id="typing-indicator" class="bot-message" style="
          display: flex;
          align-items: flex-start;
          gap: 8px;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background-color: ${this.config.accentColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div style="
            background-color: #f3f4f6;
            padding: 12px;
            border-radius: 12px;
            font-size: 14px;
          ">
            <div style="display: flex; gap: 4px;">
              <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out;"></div>
              <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; animation-delay: 0.16s;"></div>
              <div style="width: 8px; height: 8px; background-color: #9ca3af; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; animation-delay: 0.32s;"></div>
            </div>
          </div>
        </div>
      `

      messagesContainer.insertAdjacentHTML("beforeend", typingHTML)
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      // Add bounce animation
      if (!document.getElementById("bounce-animation")) {
        const style = document.createElement("style")
        style.id = "bounce-animation"
        style.textContent = `
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `
        document.head.appendChild(style)
      }
    },

    hideTyping: () => {
      const typingIndicator = document.getElementById("typing-indicator")
      if (typingIndicator) {
        typingIndicator.remove()
      }
    },
  }

  // Make available globally
  window.PlanobrationChatbot = PlanobrationChatbot
})()
