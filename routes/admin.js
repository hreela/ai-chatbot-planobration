const express = require("express")
const { createClient } = require("@supabase/supabase-js")
const router = express.Router()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Admin dashboard HTML
router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planobration Chatbot Admin</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .header { background: linear-gradient(135deg, #e11d48, #f43f5e); color: white; padding: 20px; text-align: center; }
            .container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .question-item { padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; cursor: pointer; transition: background 0.2s; }
            .question-item:hover { background: #f9fafb; }
            .question-item.pending { border-left: 4px solid #f59e0b; }
            .question-item.answered { border-left: 4px solid #10b981; }
            .badge { background: #e11d48; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
            .answer-form { display: none; }
            .answer-form.active { display: block; }
            textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; }
            button { background: #e11d48; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
            button:hover { background: #be185d; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .stat-number { font-size: 24px; font-weight: bold; color: #e11d48; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Planobration Chatbot Admin</h1>
            <p>Manage visitor questions and train your chatbot</p>
        </div>
        
        <div class="container">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number" id="total-questions">0</div>
                    <div>Total Questions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="pending-questions">0</div>
                    <div>Pending Answers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="answered-questions">0</div>
                    <div>Answered</div>
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>Visitor Questions</h3>
                    <div id="questions-list">Loading questions...</div>
                </div>
                
                <div class="card">
                    <h3>Answer Question</h3>
                    <div id="answer-section">
                        <p>Select a question from the left to provide an answer.</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let questions = [];
            
            async function loadQuestions() {
                try {
                    const response = await fetch('/admin/api/questions');
                    questions = await response.json();
                    renderQuestions();
                    updateStats();
                } catch (error) {
                    console.error('Error loading questions:', error);
                }
            }
            
            function renderQuestions() {
                const container = document.getElementById('questions-list');
                if (questions.length === 0) {
                    container.innerHTML = '<p>No questions yet.</p>';
                    return;
                }
                
                container.innerHTML = questions.map(q => 
                    '<div class="question-item ' + (q.answer ? 'answered' : 'pending') + '" onclick="selectQuestion(' + q.id + ')">' +
                        '<strong>' + q.question + '</strong>' +
                        (q.frequency > 1 ? '<span class="badge">' + q.frequency + 'x</span>' : '') +
                        '<div style="font-size: 12px; color: #6b7280; margin-top: 5px;">' + 
                        new Date(q.created_at).toLocaleDateString() + '</div>' +
                    '</div>'
                ).join('');
            }
            
            function selectQuestion(id) {
                const question = questions.find(q => q.id === id);
                if (!question) return;
                
                document.getElementById('answer-section').innerHTML = 
                    '<div><strong>Question:</strong></div>' +
                    '<p style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 6px;">' + question.question + '</p>' +
                    '<div><strong>Your Answer:</strong></div>' +
                    '<textarea id="answer-text" placeholder="Type your answer here...">' + (question.answer || '') + '</textarea>' +
                    '<button onclick="saveAnswer(' + id + ')" style="margin-top: 10px;">Save Answer</button>';
            }
            
            async function saveAnswer(id) {
                const answer = document.getElementById('answer-text').value.trim();
                if (!answer) {
                    alert('Please provide an answer');
                    return;
                }
                
                try {
                    const response = await fetch('/admin/api/answer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, answer })
                    });
                    
                    if (response.ok) {
                        alert('Answer saved successfully!');
                        loadQuestions();
                        document.getElementById('answer-section').innerHTML = '<p>Answer saved! Select another question to continue.</p>';
                    } else {
                        alert('Error saving answer');
                    }
                } catch (error) {
                    console.error('Error saving answer:', error);
                    alert('Error saving answer');
                }
            }
            
            function updateStats() {
                const total = questions.length;
                const pending = questions.filter(q => !q.answer).length;
                const answered = questions.filter(q => q.answer).length;
                
                document.getElementById('total-questions').textContent = total;
                document.getElementById('pending-questions').textContent = pending;
                document.getElementById('answered-questions').textContent = answered;
            }
            
            // Load questions on page load
            loadQuestions();
            
            // Refresh every 30 seconds
            setInterval(loadQuestions, 30000);
        </script>
    </body>
    </html>
  `)
})

// API endpoint to get questions
router.get("/api/questions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chatbot_questions")
      .select("*")
      .order("frequency", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    console.error("Error fetching questions:", error)
    res.status(500).json({ error: "Failed to fetch questions" })
  }
})

// API endpoint to save answer
router.post("/api/answer", async (req, res) => {
  try {
    const { id, answer } = req.body

    const { error } = await supabase
      .from("chatbot_questions")
      .update({
        answer: answer,
        answered_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error("Error saving answer:", error)
    res.status(500).json({ error: "Failed to save answer" })
  }
})

module.exports = router
