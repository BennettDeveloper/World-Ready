import { useState } from 'react';
import { REGIONS } from '../data/regions';

export default function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const region = REGIONS[session.region];
  const date = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="session-card glass">
      <button className="session-card-header" onClick={() => setExpanded(e => !e)}>
        <span className="session-flag">{region?.flag || '🌐'}</span>
        <div className="session-meta">
          <span className="session-region">{region?.name || session.region}</span>
          <span className="session-role">{session.role}</span>
        </div>
        <div className="session-stats">
          <span className={`session-score ${session.overall >= 85 ? 'high' : session.overall >= 70 ? 'mid' : 'low'}`}>
            {session.overall}
          </span>
          <span className={`session-diff diff-${session.difficulty}`}>{session.difficulty}</span>
        </div>
        <span className="session-date">{date}</span>
        <span className="session-chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="session-transcript">
          <h4 className="transcript-title">Session Replay</h4>
          {session.messages?.map((msg, i) => (
            <div key={i} className={`transcript-line ${msg.from}`}>
              <span className="transcript-who">{msg.from === 'interviewer' ? region?.flag || '🎙' : '🧑'}</span>
              <span className="transcript-text">{msg.text}</span>
            </div>
          ))}
          <div className="transcript-scores">
            {['Cultural Fluency', 'Clarity', 'Confidence', 'Role Fit', 'Overall'].map((label, i) => (
              <span key={i} className="ts-score">
                <span className="ts-label">{label}</span>
                <span className="ts-val">{session.scores?.[i] ?? '—'}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
