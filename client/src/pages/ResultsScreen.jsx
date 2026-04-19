import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatBar from '../components/StatBar';
import CoachingCard from '../components/CoachingCard';
import { REGIONS } from '../data/regions';
import { saveSession, submitToLeaderboard } from '../utils/storage';
import { scoreAnswers } from '../utils/scoring';
import { generateCoaching, generateCoachingFromAI } from '../utils/coaching';

const STAT_LABELS = ['Cultural Fluency', 'Communication Clarity', 'Confidence', 'Role Alignment', 'Overall'];

export default function ResultsScreen({ user, sessionData }) {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);

  const { region, role, company, difficulty, messages, answers } = sessionData || {};
  const regionData = REGIONS[region];

  const keywordScores = sessionData ? scoreAnswers(answers, region, role) : [65, 65, 65, 65, 65];
  const [scores, setScores] = useState(keywordScores);
  const [coaching, setCoaching] = useState(() => generateCoaching(keywordScores, region));
  const overall = scores[4];

  useEffect(() => {
    if (!sessionData) { navigate('/home'); return; }
    const t = setTimeout(() => setAnimated(true), 150);
    if (user) saveSession(user.userId, { region, role, company, difficulty, messages, scores: keywordScores, overall: keywordScores[4], answers });

    // Try AI scoring — fall back to keyword scores if backend unavailable
    const conversationHistory = (messages || [])
      .filter(m => !m.isTransition && !m.isClosing && !m.isGibberish)
      .map(m => ({ sender: m.from === 'interviewer' ? 'interviewer' : 'user', text: m.text }));

    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region, role, conversationHistory }),
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        const s = data.scores;
        const aiScores = [
          s.culturalAlignment ?? keywordScores[0],
          s.answerStructure ?? keywordScores[1],
          s.confidence ?? keywordScores[2],
          s.followUpHandling ?? keywordScores[3],
          Math.round(((s.culturalAlignment ?? 0) + (s.answerStructure ?? 0) + (s.confidence ?? 0) + (s.followUpHandling ?? 0) + (s.fillerControl ?? 0)) / 5) || keywordScores[4],
        ];
        setScores(aiScores);
        setCoaching(generateCoachingFromAI(data.feedback, aiScores));
        setAiPowered(true);
      })
      .catch(() => {
        // Backend unavailable — keyword scores already set
      });

    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sessionData) return null;

  function handleSubmitLeaderboard() {
    if (submitted || !user) return;
    submitToLeaderboard({ username: user.username, region, role, overall, difficulty });
    setSubmitted(true);
  }

  function handleShare() {
    const text = `I just scored ${overall}/100 in a ${regionData?.name} interview simulation as a ${role} on World Ready! 🌐`;
    if (navigator.share) {
      navigator.share({ title: 'World Ready Results', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  }

  const scoreLabel = overall >= 85 ? 'Outstanding' : overall >= 70 ? 'Solid Performance' : 'Keep Practicing';

  return (
    <div className="results-screen">
      <div className="results-header">
        <div className="evaluator-badge glass">
          <span className="eval-flag">{regionData?.flag}</span>
          <div>
            <div className="eval-name">{regionData?.interviewer}</div>
            <div className="eval-region">{regionData?.name} Interview</div>
            <span className="style-badge">{regionData?.styleTag}</span>
          </div>
        </div>
        <div className="results-title-block">
          <h1 className="results-title">Interview Complete</h1>
          <p className="results-sub">{role}{company ? ` at ${company}` : ''}</p>
          <div className="overall-score">
            <span className="overall-num" style={{ color: overall >= 85 ? '#22c55e' : overall >= 70 ? '#00d4ff' : '#f59e0b' }}>
              {overall}
            </span>
            <span className="overall-label">{scoreLabel}</span>
          </div>
          {aiPowered && <span className="ai-badge">✨ AI-Powered Analysis</span>}
        </div>
      </div>

      <div className="stats-section glass">
        <h2 className="section-title">Performance Breakdown</h2>
        {scores.map((score, i) => (
          <StatBar key={i} label={STAT_LABELS[i]} score={score} animated={animated} />
        ))}
      </div>

      <div className="coaching-section">
        <h2 className="section-title">Coaching Feedback</h2>
        <div className="coaching-grid">
          {coaching.map((c, i) => <CoachingCard key={i} {...c} />)}
        </div>
      </div>

      <div className="replay-section glass">
        <button className="replay-toggle" onClick={() => setShowTranscript(t => !t)}>
          <span>📋 Session Replay — Full Transcript</span>
          <span>{showTranscript ? '▲' : '▼'}</span>
        </button>
        {showTranscript && (
          <div className="transcript">
            {messages.map((msg, i) => (
              <div key={i} className={`transcript-line ${msg.from}`}>
                <span className="transcript-who">{msg.from === 'interviewer' ? regionData?.flag || '🎙' : '🧑'}</span>
                <span className="transcript-text">{msg.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={() => navigate('/home')}>Try Another Region</button>
        <button className={`btn-secondary glass${submitted ? ' submitted' : ''}`}
          onClick={handleSubmitLeaderboard} disabled={submitted}>
          {submitted ? '✅ On the Leaderboard!' : '🏆 Submit to Leaderboard'}
        </button>
        <button className="btn-secondary glass" onClick={handleShare}>📤 Share Results</button>
        <button className="btn-ghost" onClick={() => navigate('/profile')}>View Profile</button>
      </div>
    </div>
  );
}
