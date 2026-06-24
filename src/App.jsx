import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import axios from "axios";
import "./App.css";

// Import support for additional languages in PrismJS
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-typescript";

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1;\n}`);
  const [review, setReview] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("review"); // "review" | "preview"
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("dark");
  const [previewData, setPreviewData] = useState({
    logs: [],
    result: null,
    error: null,
    isHtml: false
  });

  const [currentTip, setCurrentTip] = useState(0);

  const loadingMessages = [
    "Parsing code syntax tree...",
    "Running dry-run checks...",
    "Analyzing algorithm complexity (Big O)...",
    "Checking for potential security vulnerabilities...",
    "Verifying DRY and SOLID programming principles...",
    "Comparing patterns against senior developer guidelines...",
    "Drafting refactoring recommendations...",
    "Formatting review feedback reports..."
  ];

  useEffect(() => {
    prism.highlightAll();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isLoading = reviewLoading || previewLoading;

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setCurrentTip(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Update default placeholder code when language changes
  useEffect(() => {
    const placeholders = {
      javascript: `// JavaScript Code
function greet(name) {
  console.log("Hello, " + name + "!");
  return 100;
}
greet("Developer");`,
      python: `# Python Code
def greet(name):
    print(f"Hello, {name}!")
    return 100

greet("Developer")`,
      java: `// Java Code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Developer!");
    }
}`,
      cpp: `// C++ Code
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Developer!" << endl;
    return 0;
}`,
      csharp: `// C# Code
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, Developer!");
    }
}`,
      go: `// Go Code
package main
import "fmt"

func main() {
    fmt.Println("Hello, Developer!")
}`,
      rust: `// Rust Code
fn main() {
    println!("Hello, Developer!");
}`,
      html: `<!-- HTML/CSS Code -->
<div style="padding: 20px; font-family: sans-serif; text-align: center; background: #e0f2fe; border-radius: 8px;">
  <h1 style="color: #0369a1;">Hello, Developer!</h1>
  <p style="color: #0c4a6e;">This is a live HTML preview.</p>
</div>`
    };
    if (placeholders[language]) {
      setCode(placeholders[language]);
    }
  }, [language]);

  async function reviewCode() {
    setReviewLoading(true);
    setReview("");
    setActiveTab("review");
    
    // Auto-detect backend URL based on Vite environment mode
    const backendUrl = import.meta.env.DEV
      ? "http://localhost:3000/ai/get-review"
      : "https://code-reviewbackend.onrender.com/ai/get-review";

    try {
      const response = await axios.post(backendUrl, { code });
      console.log("API Response:", response.data); // Debug API response
      
      // Correctly extract the review text from the response payload
      const data = response.data;
      const reviewText = typeof data === "object" && data.review 
        ? data.review 
        : (typeof data === "string" ? data : JSON.stringify(data, null, 2));
      
      setReview(reviewText);
    } catch (error) {
      console.error("Error fetching review:", error);
      setReview("Error fetching review. Please make sure the backend server is running and try again.");
    } finally {
      setReviewLoading(false);
    }
  }

  const runCode = async () => {
    setActiveTab("preview");
    setPreviewLoading(true);
    setPreviewData({
      logs: [],
      result: null,
      error: null,
      isHtml: language === "html"
    });

    if (language === "html") {
      setPreviewLoading(false);
      return;
    }

    const backendUrl = import.meta.env.DEV
      ? "http://localhost:3000/ai/execute-code"
      : "https://code-reviewbackend.onrender.com/ai/execute-code";

    try {
      const response = await axios.post(backendUrl, { code, language });
      const data = response.data;

      setPreviewData({
        logs: data.logs || [],
        result: data.result !== undefined ? data.result : null,
        error: data.error || null,
        isHtml: false
      });
    } catch (error) {
      console.error("Error executing code:", error);
      setPreviewData({
        logs: [],
        result: null,
        error: "Error executing code. Please make sure the backend server is running and try again.",
        isHtml: false
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const highlightCode = (code) => {
    const prismLang = prism.languages[language] || prism.languages.javascript;
    return prism.highlight(code, prismLang, language);
  };

  return (
    <>
      <header className="app-header">
        <div className="logo-section">
          <img src="/favicon.png" alt="CodeReviewer Logo" />
          <h1>CodeReviewer AI</h1>
        </div>
        <div className="header-actions">
          <div className="connection-status">
            <span className={`status-dot ${isLoading ? "active-loading" : ""}`}></span>
            <span>{isLoading ? "AI Engine Running..." : "AI Engine Online"}</span>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 18, height: 18}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 18, height: 18}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main>
        <div className="left">
          <div className="window-header">
            <div className="window-dots">
              <span className="dot close"></span>
              <span className="dot minimize"></span>
              <span className="dot expand"></span>
            </div>
            <span className="window-title">
              {language === "javascript" ? "index.js" :
               language === "python" ? "main.py" :
               language === "java" ? "Main.java" :
               language === "cpp" ? "main.cpp" :
               language === "csharp" ? "Program.cs" :
               language === "go" ? "main.go" :
               language === "rust" ? "main.rs" :
               language === "html" ? "index.html" : "index.js"}
            </span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-selector"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="html">HTML/CSS</option>
            </select>
          </div>
          <div className="code-container">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={highlightCode}
              padding={15}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 15,
                lineHeight: '1.5',
                height: "100%",
                width: "100%",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <div className="left-actions-container">
            <button 
              onClick={runCode}
              className="preview-btn"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width: 14, height: 14}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Preview Code
            </button>
            <button 
              onClick={reviewLoading ? null : reviewCode} 
              className={`review-btn ${reviewLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width: 14, height: 14}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982M18 13.612l.757-.757a4.243 4.243 0 00-6-6l-7.57 7.57a4.243 4.243 0 000 6l.757.757m0 0l1.414-1.414" />
              </svg>
              {reviewLoading ? "Reviewing..." : "Review Code"}
            </button>
          </div>
        </div>

        <div className="right">
          <div className="window-header">
            <div className="window-dots">
              <span className="dot close"></span>
              <span className="dot minimize"></span>
              <span className="dot expand"></span>
            </div>
            <span className="window-title">workspace</span>
            <span className="window-action">Interactive</span>
          </div>

          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
              onClick={() => setActiveTab("review")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 14, height: 14}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982M18 13.612l.757-.757a4.243 4.243 0 00-6-6l-7.57 7.57a4.243 4.243 0 000 6l.757.757m0 0l1.414-1.414" />
              </svg>
              AI Review
            </button>
            <button 
              className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 14, height: 14}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Live Preview
            </button>
          </div>

          {activeTab === "review" ? (
            <div className="review-content">
              {reviewLoading ? (
                <div className="scanner-container">
                  <div className="scanner-brain">
                    <svg className="scanning-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982M18 13.612l.757-.757a4.243 4.243 0 00-6-6l-7.57 7.57a4.243 4.243 0 000 6l.757.757m0 0l1.414-1.414" />
                    </svg>
                    <div className="scan-line"></div>
                  </div>
                  <div className="scanning-title">AI Engine Analyzing</div>
                  <div className="scanning-tip">{loadingMessages[currentTip]}</div>
                  <div className="scanning-bars">
                    <span className="bar shadow-pulse-1"></span>
                    <span className="bar shadow-pulse-2"></span>
                    <span className="bar shadow-pulse-3"></span>
                  </div>
                </div>
              ) : review ? (
                <Markdown>{review}</Markdown>
              ) : (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982M18 13.612l.757-.757a4.243 4.243 0 00-6-6l-7.57 7.57a4.243 4.243 0 000 6l.757.757m0 0l1.414-1.414" />
                  </svg>
                  <h3>No Review Generated Yet</h3>
                  <p>Click the "Review Code" button in the editor panel to get instant feedback on code quality, security, and performance.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="preview-panel-content">
              {previewLoading ? (
                <div className="scanner-container">
                  <div className="scanner-brain">
                    <svg className="scanning-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.982M18 13.612l.757-.757a4.243 4.243 0 00-6-6l-7.57 7.57a4.243 4.243 0 000 6l.757.757m0 0l1.414-1.414" />
                    </svg>
                    <div className="scan-line"></div>
                  </div>
                  <div className="scanning-title">AI Engine Compiling</div>
                  <div className="scanning-tip">{loadingMessages[currentTip]}</div>
                  <div className="scanning-bars">
                    <span className="bar shadow-pulse-1"></span>
                    <span className="bar shadow-pulse-2"></span>
                    <span className="bar shadow-pulse-3"></span>
                  </div>
                </div>
              ) : previewData.isHtml ? (
                <div className="iframe-container">
                  <iframe 
                    title="Code Preview"
                    srcDoc={code}
                    className="preview-iframe"
                    sandbox="allow-scripts"
                  />
                </div>
              ) : (
                <>
                  {previewData.error && (
                    <div className="error-block">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 16, height: 16}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        Runtime/Compilation Error
                      </h4>
                      <pre>{previewData.error}</pre>
                    </div>
                  )}

                  {previewData.result !== null && (
                    <div className="result-block">
                      <h4>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: 16, height: 16}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                        </svg>
                        Evaluation Result
                      </h4>
                      <pre>{previewData.result}</pre>
                    </div>
                  )}

                  <div className="console-window">
                    <div className="console-header">
                      <span>Console Output / stdout</span>
                      <span>{previewData.logs.length} entries</span>
                    </div>
                    <div className="console-body">
                      {previewData.logs.length > 0 ? (
                        previewData.logs.map((log, index) => (
                          <div key={index} className={`console-line ${log.type}`}>
                            <span className="console-timestamp">[{index + 1}]</span>
                            <span>{log.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-output-msg">No logs printed during simulation.</div>
                      )}
                    </div>
                  </div>

                  {!previewData.error && previewData.result === null && previewData.logs.length === 0 && (
                    <div className="no-output-msg">
                      The code simulated successfully, but produced no returned value or console outputs. Try calling your functions or logging them.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
