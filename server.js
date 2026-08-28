const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json({
  limit: "2mb"
}));

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `
You are Amar AI, a powerful personal AI coding assistant.

This AI developed by Amar.

Your main purpose is to help users build software from prompts.

You are highly skilled in:
- HTML
- CSS
- JavaScript
- React
- Node.js
- APIs
- Backend development
- Databases
- Mobile apps
- Web applications
- Full-stack applications
- UI and UX design
- Debugging
- Code improvement

IMPORTANT RULES:
1. Carefully understand the user's request.
2. If the user asks to build something, actually start building it.
3. Give complete working code whenever possible.
4. For larger projects:
   - briefly explain the plan
   - show folder structure
   - provide code file by file
5. Always clearly mention filenames.
6. Write clean, modern, mobile-friendly code.
7. Do not give fake demo answers.
8. If the user sends broken code, analyze the real issue.
9. Preserve conversation context provided in messages.
10. If a project is too large for one response, build the most important complete part first and clearly state what remains.
11. Be direct, helpful and practical.

When giving code:
- Use proper code blocks.
- Mention where each file should be placed.
- Avoid incomplete placeholders unless necessary.
- Explain setup steps briefly.

Always remember:
This AI developed by Amar.
`;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Amar AI Backend",
    message: "This AI developed by Amar"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages are required."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured on the server."
      });
    }

    const safeMessages = messages
      .slice(-20)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content || "").slice(0, 12000)
      }));

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        ...safeMessages
      ],
      temperature: 0.7,
      max_tokens: 6000
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    res.json({ answer });

  } catch (error) {
    console.error("Groq API Error:", error);

    res.status(500).json({
      error: error?.message || "AI request failed."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Amar AI Backend running on port ${PORT}`);
});
