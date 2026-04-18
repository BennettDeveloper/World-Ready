import { useState } from "react";
import { REGIONS } from "../data/regions";

const QUESTIONS = [
  "Tell me about yourself and what draws you to this role.",
  "Describe a challenge you faced at work and how you overcame it.",
  "Where do you see yourself in five years?",
];

export default function InterviewScreen({ region, role, messages, onSubmitAnswer, onFinish }) {
  const [draft, setDraft] = useState("");
  const regionData = REGIONS[region];
  const currentQ = messages.filter((m) => m.from === "interviewer").length;
  const isComplete = currentQ >= QUESTIONS.length && messages[messages.length - 1]?.from === "interviewer";

  function handleSubmit() {
    if (!draft.trim()) return;
    onSubmitAnswer(draft.trim(), currentQ < QUESTIONS.length ? QUESTIONS[currentQ] : null);
    setDraft("");
  }

  return (
    <div className="interview-screen">
      <div className="left-panel">
        <div className="persona-card glass">
          <div className="persona-flag">{regionData.flag}</div>
          <h2 className="persona-name">{regionData.interviewer}</h2>
          <p className="persona-title">{regionData.title}</p>
          <div className="style-badge">{regionData.styleTag}</div>
          <p className="persona-desc">{regionData.styleDesc}</p>
        </div>
        <div className="progress-indicator">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < currentQ ? "done" : i === currentQ ? "active" : ""}`}
            >
              Q{i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="chat-header">
          <span className="role-tag">{role}</span>
          <span className="region-tag">{regionData.name} Interview</span>
        </div>

        <div className="chat-bubbles">
          {messages.map((msg, i) => (
            <div key={i} className={`bubble ${msg.from === "interviewer" ? "interviewer" : "user"}`}>
              {msg.from === "interviewer" && (
                <span className="bubble-avatar">{regionData.flag}</span>
              )}
              <div className="bubble-text">{msg.text}</div>
            </div>
          ))}
        </div>

        {isComplete ? (
          <button className="begin-btn active finish-btn" onClick={onFinish}>
            See Your Results →
          </button>
        ) : (
          <div className="answer-area">
            <textarea
              className="answer-input"
              placeholder="Type your answer here…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handleSubmit();
              }}
            />
            <button
              className={`submit-btn ${draft.trim() ? "active" : "disabled"}`}
              disabled={!draft.trim()}
              onClick={handleSubmit}
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { QUESTIONS };
