# AI Code Reviewer - Frontend

Welcome to the Code Reviewer project! This frontend application is part of an AI-powered code analysis and execution platform that leverages Google's Generative AI (Gemini 2.5 Flash) to provide intelligent code feedback and simulated sandboxed execution.

## 🚀 What Was Built

A React-based web interface (built with Vite) that allows developers to paste their code and receive instant, senior-level code reviews. The application provides two core features:
1. **Automated Code Review:** Evaluates code for quality, best practices, security, and efficiency.
2. **Code Execution Simulation:** Simulates running the code in a sandboxed compiler environment and returns terminal logs, results, or runtime errors.

## 💡 Why It's Technically Interesting

This project goes beyond simple chat completions. It integrates a tightly constrained AI system prompt that acts as both a senior reviewer and a compiler. 
The frontend consumes a structured JSON response from the backend, enabling a dynamic UI that distinctly renders:
- ❌ The original problematic code.
- 🔍 Identified issues.
- ✅ Recommended fixes.
- 💡 Improvements.
- 🖥️ Simulated terminal output (`logs`, `result`, `error`).

## 🛠️ Proof It Works: Architecture & AI Integration

### Architecture
- **Frontend:** React + Vite, hosted on [Netlify](https://codereviewer2.netlify.app).
- **Backend:** Node.js + Express, hosted on [Render](https://code-reviewbackend.onrender.com).

### The Prompt Structure
The system heavily relies on prompt engineering. The prompt requests specific structured categories:
- **For Reviews:** The AI is instructed to act as a 7+ years experienced reviewer, evaluating Code Quality, Efficiency, Scalability, and Error Detection. It strictly outputs in a structured format containing `Bad Code`, `Issues`, `Recommended Fix`, and `Improvements`.
- **For Execution:** The AI acts as a sandboxed compiler, instructed to return a **raw JSON object only** without markdown formatting.

### Response-Schema Validation & Fallback
Handling non-deterministic LLM output is a core challenge. When the frontend requests a code execution simulation:
1. **Sanitization:** The backend intercepts the AI's response and sanitizes any stray Markdown code blocks using regex (e.g., stripping ` ```json `).
2. **Schema Validation:** The system attempts to parse the raw string into a strict JSON schema containing `logs`, `result`, and `error`.
3. **Fallback Mechanism:** If the AI hallucinates or fails to produce valid JSON (e.g., `JSON.parse` throws an error), the server gracefully catches the exception. Instead of returning a 500 error or retrying the LLM request, it wraps the raw text output into a safe fallback schema:
   ```json
   {
       "logs": [{ "type": "log", "text": "Raw AI output here" }],
       "result": null,
       "error": null
   }
   ```
This ensures the frontend never crashes and always displays a meaningful output to the user.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16+ recommended)
- npm or yarn

### Installation
```bash
git clone https://github.com/dineshkumar-mb/code-ReviewFrontend
cd code-reviewer
npm install
npm run dev
```

## 🤝 Contribution
Contributions are welcome! Please fork the repo, create a feature branch, and submit a PR.

## 📄 License
This project is licensed under the MIT License.
