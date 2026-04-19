import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer';
import { REGIONS } from '../data/regions';
import { getPendingSession, clearPendingSession } from '../utils/storage';
import { DIFFICULTY_SECONDS } from '../components/DifficultySelector';

export default function InterviewScreen({ onComplete }) {
  const navigate = useNavigate();
  const config = getPendingSession();

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [qIndex, setQIndex] = useState(0);       // which question we're on
  const [answerCount, setAnswerCount] = useState(0); // how many answers submitted
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false); // starts after greeting
  const chatRef = useRef(null);

  const regionData = config ? REGIONS[config.region] : null;
  const questions = regionData?.questions || [];
  const timerSeconds = DIFFICULTY_SECONDS[config?.difficulty] || 120;

  useEffect(() => {
    if (!config || !regionData) { navigate('/home'); return; }
    // Seed conversation: greeting → then Q1 after a short delay
    const greeting = { from: 'interviewer', text: regionData.greeting, isGreeting: true };
    setMessages([greeting]);
    const t = setTimeout(() => {
      setMessages(prev => [...prev, { from: 'interviewer', text: questions[0] }]);
      setTimerRunning(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function submitAnswer(text) {
    const answer = text.trim();
    if (!answer || isComplete) return;

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setTimerRunning(false);

    const nextQIndex = qIndex + 1;
    const updated = [...messages, { from: 'user', text: answer }];
    setMessages(updated);
    setDraft('');
    setAnswerCount(c => c + 1);

    // After short delay, show interviewer reaction
    setTimeout(() => {
      if (nextQIndex < questions.length) {
        const transition = regionData.transitions?.[qIndex] || 'Thank you. Let us continue.';
        setMessages(prev => [...prev, { from: 'interviewer', text: transition, isTransition: true }]);

        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'interviewer', text: questions[nextQIndex] }]);
          setQIndex(nextQIndex);
          setTimerKey(k => k + 1);
          setTimerRunning(true);
        }, 700);
      } else {
        setMessages(prev => [...prev, { from: 'interviewer', text: regionData.closing, isClosing: true }]);
        setIsComplete(true);
      }
    }, 500);
  }

  function handleFinish() {
    clearPendingSession();
    onComplete({
      region: config.region,
      role: config.role,
      company: config.company,
      difficulty: config.difficulty,
      messages,
      answers,
    });
    navigate('/results');
  }

  if (!config || !regionData) return null;

  return (
    <div className="interview-screen">
      {/* Left panel */}
      <aside className="interview-left">
        <div className="persona-card glass-panel">
          <span className="persona-flag">{regionData.flag}</span>
          <h3 className="persona-name">{regionData.interviewer}</h3>
          <p className="persona-title-text">{regionData.title}</p>
          <span className="style-badge">{regionData.styleTag}</span>
          <p className="persona-personality">{regionData.personality}</p>
        </div>

        <div className="progress-section">
          <p className="progress-label">Progress</p>
          <div className="progress-dots">
            {questions.map((_, i) => (
              <div key={i} className={`progress-dot${i < answerCount ? ' done' : i === qIndex && !isComplete ? ' active' : ''}`}>
                Q{i + 1}
              </div>
            ))}
          </div>
        </div>

        {!isComplete && timerRunning && (
          <div className="timer-section">
            <p className="progress-label">Time Remaining</p>
            <Timer key={timerKey} seconds={timerSeconds} running={timerRunning}
              onExpire={() => submitAnswer(draft || '[No answer — time expired]')} />
          </div>
        )}

        <div className="interview-meta">
          <span className="meta-tag">{config.role}</span>
          {config.company && <span className="meta-tag">{config.company}</span>}
          <span className={`meta-tag diff-${config.difficulty}`}>{config.difficulty}</span>
        </div>

        <div className="personality-traits">
          {regionData.personalityTraits?.map(t => (
            <span key={t} className="trait-pill">{t}</span>
          ))}
        </div>
      </aside>

      {/* Right: chat */}
      <div className="interview-right">
        <div className="chat-header">
          <span className="chat-flag">{regionData.flag}</span>
          <div>
            <span className="chat-title">{regionData.name} Interview</span>
            <span className="chat-sub"> — {config.role}{config.company ? ` at ${config.company}` : ''}</span>
          </div>
        </div>

        <div className="chat-bubbles" ref={chatRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`bubble ${msg.from}${msg.isGreeting ? ' greeting' : ''}${msg.isTransition ? ' transition' : ''}${msg.isClosing ? ' closing' : ''}`}>
              {msg.from === 'interviewer' && (
                <span className="bubble-avatar">{regionData.flag}</span>
              )}
              <span className="bubble-text">{msg.text}</span>
            </div>
          ))}
        </div>

        {isComplete ? (
          <div className="answer-area">
            <button className="btn-primary" onClick={handleFinish}>
              See Your Results →
            </button>
          </div>
        ) : (
          <div className="answer-area">
            <textarea className="answer-textarea"
              placeholder={`Respond to ${regionData.interviewer}… (Cmd/Ctrl + Enter to submit)`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitAnswer(draft); }}
            />
            <div className="answer-footer">
              <span className="answer-hint">Cmd/Ctrl + Enter to submit</span>
              <button className={`btn-primary${draft.trim() ? '' : ' disabled'}`}
                onClick={() => submitAnswer(draft)} disabled={!draft.trim()}>
                Submit Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { };
