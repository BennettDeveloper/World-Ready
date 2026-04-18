import { useEffect, useState } from "react";
import { REGIONS } from "../data/regions";

const STAT_LABELS = [
  "Cultural Fluency",
  "Communication Clarity",
  "Confidence",
  "Role Alignment",
  "Overall Performance",
];

const COACHING = [
  "Practice active listening — pause before answering to show thoughtfulness.",
  "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
  "Research your interviewer's regional expectations before the real thing.",
  "Tailor your tone — match the formality level of the culture you're interviewing in.",
  "Quantify your achievements wherever possible to demonstrate impact.",
];

export default function ResultsScreen({ region, role, scores, onRestart, onShare }) {
  const [animated, setAnimated] = useState(false);
  const regionData = REGIONS[region];

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="results-screen">
      <div className="results-header">
        <div className="evaluator-badge glass">
          <span>{regionData.flag}</span>
          <div>
            <p className="badge-label">Evaluated by</p>
            <p className="badge-name">{regionData.interviewer}</p>
            <p className="badge-region">{regionData.name} · {regionData.styleTag}</p>
          </div>
        </div>
        <h2 className="results-title">Interview Complete</h2>
        <p className="results-role">{role} Candidate</p>
      </div>

      <div className="stats-section glass">
        <h3 className="stats-heading">Performance Breakdown</h3>
        {STAT_LABELS.map((label, i) => (
          <div key={i} className="stat-row">
            <span className="stat-label">{label}</span>
            <div className="stat-bar-track">
              <div
                className="stat-bar-fill"
                style={{ width: animated ? `${scores[i]}%` : "0%" }}
              />
            </div>
            <span className="stat-score">{scores[i]}</span>
          </div>
        ))}
      </div>

      <div className="coaching-section glass">
        <h3 className="coaching-heading">Coaching Feedback</h3>
        <ul className="coaching-list">
          {COACHING.map((tip, i) => (
            <li key={i} className="coaching-item">
              <span className="coaching-dot" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="results-actions">
        <button className="begin-btn active" onClick={onRestart}>
          Try Another Region
        </button>
        <button className="share-btn glass" onClick={onShare}>
          Share Results
        </button>
      </div>
    </div>
  );
}
