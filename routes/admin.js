const express = require("express")
const router = express.Router()

let supabase = null
try {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  console.log("[v0] Checking Supabase configuration...")
  console.log("[v0] SUPABASE_URL exists:", !!supabaseUrl)
  console.log("[v0] SUPABASE_ANON_KEY exists:", !!supabaseKey)

  if (supabaseUrl && supabaseKey && supabaseUrl.trim() !== "" && supabaseKey.trim() !== "") {
    console.log("[v0] Attempting to create Supabase client...")
    const { createClient } = require("@supabase/supabase-js")

    supabase = createClient(supabaseUrl, supabaseKey)
    console.log("[v0] Supabase client created successfully")
  } else {
    console.log("[v0] Supabase environment variables not configured properly")
  }
} catch (error) {
  console.error("[v0] Failed to initialize Supabase client:", error.message)
  supabase = null
}

// Admin dashboard HTML
router.get("/", (req, res) => {
  if (!supabase) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Planobration Chatbot Admin - Setup Required</title>
          <style>
              body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
              .header { background: linear-gradient(135deg, #e11d48, #f43f5e); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
              .setup-steps { text-align: left; margin: 20px 0; }
              .step { margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 6px; border-left: 4px solid #e11d48; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Admin Setup Required</h1>
                  <p>Configure Supabase to enable the learning system</p>
              </div>
              
              <p>Your chatbot is working, but the admin learning system needs Supabase configuration.</p>
              
              <div class="setup-steps">
                  <div class="step">
                      <strong>Step 1:</strong> Add these environment variables to your Render service:
                      <ul>
                          <li><code>SUPABASE_URL</code> - Your Supabase project URL</li>
                          <li><code>SUPABASE_ANON_KEY</code> - Your Supabase anon key</li>
                      </ul>
                  </div>
                  
                  <div class="step">
                      <strong>Step 2:</strong> Run the database setup script to create the required tables
                  </div>
                  
                  <div class="step">
                      <strong>Step 3:</strong> Restart your Render service
                  </div>
              </div>
              
              <p><strong>Your chatbot continues to work normally without this setup.</strong></p>
          </div>
      </body>
      </html>
    `)
  }

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
            .question-item.selected { background: #fef3c7; border-color: #f59e0b; }
            .badge { background: #e11d48; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
            .answer-form { display: none; }
            .answer-form.active { display: block; }
            textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical; font-family: Arial, sans-serif; }
            button { background: #e11d48; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
            button:hover { background: #be185d; }
            button:disabled { background: #9ca3af; cursor: not-allowed; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .stat-number { font-size: 24px; font-weight: bold; color: #e11d48; }
            .loading { text-align: center; padding: 20px; color: #6b7280; }
            .success-message { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; margin: 10px 0; }
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
            let selectedQuestionId = null;
            
            console.log("[v0] Admin interface loaded");
            
            async function loadQuestions() {
                try {
                    console.log("[v0] Loading questions...");
                    const response = await fetch('/admin/api/questions');
                    questions = await response.json();
                    console.log("[v0] Loaded", questions.length, "questions");
                    renderQuestions();
                    updateStats();
                } catch (error) {
                    console.error('[v0] Error loading questions:', error);
                    document.getElementById('questions-list').innerHTML = '<p style="color: red;">Error loading questions. Please refresh the page.</p>';
                }
            }
            
            function renderQuestions() {
                console.log("[v0] Rendering questions...");
                const container = document.getElementById('questions-list');
                if (questions.length === 0) {
                    container.innerHTML = '<p>No questions yet.</p>';
                    return;
                }
                
                container.innerHTML = questions.map(q => {
                    const isSelected = selectedQuestionId === q.id;
                    return '<div class="question-item ' + (q.answer ? 'answered' : 'pending') + (isSelected ? ' selected' : '') + '" data-question-id="' + q.id + '">' +
                        '<strong>' + escapeHtml(q.question) + '</strong>' +
                        (q.question_count > 1 ? '<span class="badge">' + q.question_count + 'x</span>' : '') +
                        '<div style="font-size: 12px; color: #6b7280; margin-top: 5px;">' + 
                        new Date(q.created_at).toLocaleDateString() + '</div>' +
                    '</div>';
                }).join('');
                
                const questionItems = document.querySelectorAll('.question-item');
                console.log("[v0] Attaching click events to", questionItems.length, "question items");
                
                questionItems.forEach((item, index) => {
                    item.addEventListener('click', function() {
                        const questionId = parseInt(this.getAttribute('data-question-id'));
                        console.log("[v0] Question clicked:", questionId, "at index:", index);
                        selectQuestion(questionId);
                    });
                });
            }
            
            function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            
            function selectQuestion(id) {
                console.log("[v0] selectQuestion called with id:", id);
                const question = questions.find(q => q.id === id);
                if (!question) {
                    console.error("[v0] Question not found with id:", id);
                    return;
                }
                
                console.log("[v0] Selected question:", question.question);
                selectedQuestionId = id;
                renderQuestions();
                
                console.log("[v0] Creating answer form for question:", question.question);
                
                document.getElementById('answer-section').innerHTML = 
                    '<div><strong>Question:</strong></div>' +
                    '<p style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 6px; border-left: 4px solid #e11d48;">' + escapeHtml(question.question) + '</p>' +
                    '<div><strong>Your Answer:</strong></div>' +
                    '<textarea id="answer-text" placeholder="Type your detailed answer here..." style="margin: 10px 0;">' + (question.answer || '') + '</textarea>' +
                    '<div>' +
                        '<button onclick="saveAnswer(' + id + ')" id="save-btn">Save Answer</button>' +
                        '<button onclick="clearSelection()" style="background: #6b7280; margin-left: 10px;">Cancel</button>' +
                    '</div>' +
                    '<div id="save-status"></div>';
                
                setTimeout(() => {
                    const textarea = document.getElementById('answer-text');
                    if (textarea) {
                        textarea.focus();
                        console.log("[v0] Answer textarea focused");
                    } else {
                        console.error("[v0] Answer textarea not found");
                    }
                }, 100);
            }
            
            function clearSelection() {
                console.log("[v0] Clearing selection");
                selectedQuestionId = null;
                renderQuestions();
                document.getElementById('answer-section').innerHTML = '<p>Select a question from the left to provide an answer.</p>';
            }
            
            async function saveAnswer(id) {
                console.log("[v0] saveAnswer called with id:", id);
                const answer = document.getElementById('answer-text').value.trim();
                const saveBtn = document.getElementById('save-btn');
                const statusDiv = document.getElementById('save-status');
                
                if (!answer) {
                    console.log("[v0] No answer provided");
                    statusDiv.innerHTML = '<p style="color: red;">Please provide an answer</p>';
                    return;
                }
                
                console.log("[v0] Saving answer:", answer.substring(0, 50) + "...");
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';
                statusDiv.innerHTML = '<p style="color: #6b7280;">Saving answer...</p>';
                
                try {
                    const response = await fetch('/admin/api/answer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, answer })
                    });
                    
                    if (response.ok) {
                        console.log("[v0] Answer saved successfully");
                        statusDiv.innerHTML = '<div class="success-message">Answer saved successfully!</div>';
                        await loadQuestions();
                        setTimeout(() => {
                            clearSelection();
                        }, 2000);
                    } else {
                        throw new Error('Failed to save answer');
                    }
                } catch (error) {
                    console.error('[v0] Error saving answer:', error);
                    statusDiv.innerHTML = '<p style="color: red;">Error saving answer. Please try again.</p>';
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Answer';
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
            
            loadQuestions();
            
            setInterval(loadQuestions, 30000);
        </script>
    </body>
    </html>
  `)
})

// API endpoint to get questions
router.get("/api/questions", async (req, res) => {
  if (!supabase) {
    console.log("[v0] Admin API: Supabase not configured")
    return res.json([])
  }

  try {
    console.log("[v0] Admin API: Fetching questions from database...")

    const { count, error: countError } = await supabase.from("chatbot_qa").select("*", { count: "exact", head: true })

    console.log("[v0] Admin API: Total records in table:", count)

    if (countError) {
      console.error("[v0] Admin API: Count error:", countError)
    }

    const { data, error } = await supabase
      .from("chatbot_qa")
      .select("*")
      .order("question_count", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Admin API: Database error:", error)
      throw error
    }

    console.log("[v0] Admin API: Found", data?.length || 0, "questions")
    console.log("[v0] Admin API: Sample data:", data?.slice(0, 2))

    const { data: allData, error: allError } = await supabase
      .from("chatbot_qa")
      .select("id, question, status, created_at")
      .limit(5)

    console.log("[v0] Admin API: Direct query result:", allData?.length || 0, "records")
    if (allError) {
      console.error("[v0] Admin API: Direct query error:", allError)
    }

    res.json(data || [])
  } catch (error) {
    console.error("[v0] Admin API: Error fetching questions:", error)
    res.status(500).json({ error: "Failed to fetch questions" })
  }
})

// API endpoint to save answer
router.post("/api/answer", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase not configured" })
  }

  try {
    const { id, answer } = req.body

    const { error } = await supabase
      .from("chatbot_qa")
      .update({
        answer: answer,
        status: "answered",
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

// Debug endpoint to check environment variables
router.get("/debug", (req, res) => {
  res.json({
    supabaseConfigured: !!supabase,
    envVars: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      urlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
      keyLength: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : 0,
    },
    supabaseUrlPreview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 40) + "..." : null,
    supabaseKeyPreview: process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.substring(0, 20) + "..." : null,
  })
})

module.exports = router
