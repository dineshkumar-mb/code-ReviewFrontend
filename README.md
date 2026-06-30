# AI Code Reviewer - Frontend

A React-based user interface for an AI-driven code analysis and simulated execution platform.

## 🚀 What Was Built

A responsive React application that provides developers with a dynamic code editor and an interactive feedback dashboard. It allows users to submit source code to the backend and renders structured, categorized AI feedback alongside simulated compiler logs.

## 💡 Why It's Technically Interesting

Instead of just rendering a wall of text from an LLM, the frontend is engineered to parse and display a strict JSON schema returned by the backend. It dynamically breaks down the AI's response into distinct, actionable UI components: categorized code reviews (Code Quality, Best Practices, etc.) and a mocked terminal interface that renders simulated runtime execution logs.

## 🛠️ Architecture

- **Frontend:** React application built with Vite. Hosted on [Netlify](https://codereviewer2.netlify.app/).
- **Backend Communication:** REST API calls (`axios`) to the Node.js backend hosted on Render.
- **Code Highlighting & Editing:** `react-simple-code-editor` and `prismjs`/`highlight.js` for syntax-aware code inputs.

## AI Integration & Data Structure

The frontend relies on the backend enforcing a strict output format from Google Gemini. 
- **Code Review:** The UI expects the backend to provide categorized feedback arrays (e.g., `Bad Code`, `Issues`, `Recommended Fix`, `Improvements`) and maps them to distinct visual cards.
- **Execution Simulation:** The frontend renders a terminal-like window that loops over the `logs` array returned by the backend's "Compiler Simulation" prompt, displaying synthetic runtime errors and execution traces exactly as a real console would.

## Response Validation & Error Handling

Because LLMs can be unpredictable, the frontend is built to handle the backend's graceful fallback schemas. If the backend fails to parse the AI's output, it wraps the raw text in a guaranteed safe schema (`{ logs: [...], result: String, error: String }`). The frontend safely digests this without crashing, rendering the fallback string safely within the mocked terminal or review window.

## Getting Started

### Prerequisites
- Node.js (version 20+ or 22+ recommended)

### Installation
```bash
git clone https://github.com/dineshkumar-mb/code-ReviewFrontend
cd code-ReviewFrontend
npm install
```

### Running the App
```bash
npm run dev
```

## Environment Variables
Create a `.env` file in the root directory:
- `VITE_API_URL` (Base URL pointing to the Node.js backend)

## License
MIT License
