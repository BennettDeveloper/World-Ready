import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer';
import { REGIONS } from '../data/regions';
import { getPendingSession, clearPendingSession } from '../utils/storage';
import { DIFFICULTY_SECONDS } from '../components/DifficultySelector';
import { isGibberish } from '../utils/validation';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeech = !!SpeechRecognition;

function getMoodBadge(timeOfDay, isWeekend) {
  if (timeOfDay === 'morning') return { icon: '☀️', label: 'Morning Energy' };
  if (timeOfDay === 'afternoon') return { icon: '🌤', label: 'Afternoon Mode' };
  if (timeOfDay === 'evening') return { icon: '🌆', label: 'Evening Wind-Down' };
  if (timeOfDay === 'night' || timeOfDay === 'late_night') return { icon: '🌙', label: 'Late Night Mode' };
  if (isWeekend) return { icon: '🎉', label: 'Weekend Session' };
  return null;
}

export default function InterviewScreen({ onComplete }) {
  const navigate = useNavigate();
  const config = getPendingSession();

  const regionData = config ? REGIONS[config.region] : null;
  const questions = regionData?.questions || [];
  const timerSeconds = DIFFICULTY_SECONDS[config?.difficulty] || 120;
  const moodBadge = getMoodBadge(config?.timeOfDay, config?.isWeekend);
  const regionColor = regionData?.color || '#00d2ff';

  // Refs first — so they're available to useState initializers below
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const isProcessingRef = useRef(false);
  const answersRef = useRef([]);
  const messagesRef = useRef(
    regionData ? [{ from: 'interviewer', text: regionData.greeting, isGreeting: true }] : []
  );

  const [messages, setMessages] = useState(() => messagesRef.current);
  const [draft, setDraft] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [repeatCounts, setRepeatCounts] = useState({});
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!config || !regionData) { navigate('/home'); return; }
    setIsTyping(true);
    const t = setTimeout(() => {
      setMessages(prev => {
        const updated = [...prev, { from: 'interviewer', text: questions[0] }];
        messagesRef.current = updated;
        return updated;
      });
      setIsTyping(false);
      setTimerRunning(true);
    }, 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function addInterviewerMessage(text, flags = {}) {
    setMessages(prev => {
      const updated = [...prev, { from: 'interviewer', text, ...flags }];
      messagesRef.current = updated;
      return updated;
    });
  }

  function submitAnswer(text) {
    const answer = text.trim();
    if (!answer || isComplete || isProcessingRef.current) return;

    setTimerRunning(false);
    setMessages(prev => {
      const updated = [...prev, { from: 'user', text: answer }];
      messagesRef.current = updated;
      return updated;
    });
    setDraft('');
    if (listening) { recognitionRef.current?.stop(); }

    // Gibberish check
    if (isGibberish(answer)) {
      const currentRepeats = repeatCounts[qIndex] || 0;
      if (currentRepeats < 2) {
        const gibReply = regionData.gibberishResponse || "I'm sorry, I didn't quite follow that. Let me ask again.";
        setRepeatCounts(prev => ({ ...prev, [qIndex]: currentRepeats + 1 }));
        setIsTyping(true);
        setTimeout(() => {
          addInterviewerMessage(gibReply, { isGibberish: true });
          setTimeout(() => {
            addInterviewerMessage(questions[qIndex]);
            setIsTyping(false);
            setTimerKey(k => k + 1);
            setTimerRunning(true);
          }, 700);
        }, 500);
        return;
      } else {
        const moveOn = regionData.moveOnResponse || "Let us continue to the next question.";
        setIsTyping(true);
        setTimeout(() => {
          addInterviewerMessage(moveOn, { isTransition: true });
          setIsTyping(false);
          advanceQuestion(qIndex);
        }, 500);
        return;
      }
    }

    // Valid answer — record and get AI reaction
    answersRef.current = [...answersRef.current, answer];
    setAnswerCount(c => c + 1);

    isProcessingRef.current = true;
    setIsTyping(true);

    // Build conversation history (includes the answer we just added)
    const convHistory = messagesRef.current
      .filter(m => !m.isTransition && !m.isGibberish && !m.isClosing)
      .map(m => ({ sender: m.from === 'interviewer' ? 'interviewer' : 'user', text: m.text }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    fetch('/api/next-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        region: config.region,
        role: config.role,
        conversationHistory: convHistory,
        questionNumber: qIndex + 1,
        timeContext: config.timeContext || '',
      }),
      signal: controller.signal,
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        clearTimeout(timeout);
        if (data.question) {
          addInterviewerMessage(data.question);
          setIsTyping(false);
          isProcessingRef.current = false;
          if (!data.complete) {
            setQIndex(qIndex + 1);
            setTimerKey(k => k + 1);
            setTimerRunning(true);
          } else {
            setIsComplete(true);
          }
        } else throw new Error();
      })
      .catch(() => {
        clearTimeout(timeout);
        isProcessingRef.current = false;
        advanceQuestion(qIndex);
      });
  }

  function advanceQuestion(currentQIndex) {
    const nextQIndex = currentQIndex + 1;
    if (nextQIndex < questions.length) {
      const transition = regionData.transitions?.[currentQIndex] || 'Thank you. Let us continue.';
      addInterviewerMessage(transition, { isTransition: true });
      setTimeout(() => {
        addInterviewerMessage(questions[nextQIndex]);
        setIsTyping(false);
        setQIndex(nextQIndex);
        setTimerKey(k => k + 1);
        setTimerRunning(true);
      }, 700);
    } else {
      setTimeout(() => {
        addInterviewerMessage(regionData.closing, { isClosing: true });
        setIsTyping(false);
        setIsComplete(true);
      }, 400);
    }
  }

  function toggleMic() {
    if (!hasSpeech) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    finalTranscriptRef.current = draft;

    rec.onresult = (e) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += (final ? ' ' : '') + e.results[i][0].transcript;
          finalTranscriptRef.current = final;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      setDraft(final + (interim ? ' ' + interim : ''));
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  function handleFinish() {
    clearPendingSession();
    const data = {
      region: config.region,
      role: config.role,
      company: config.company,
      difficulty: config.difficulty,
      messages: messagesRef.current,
      answers: answersRef.current,
      timeContext: config.timeContext || '',
      timeOfDay: config.timeOfDay || '',
      timeStr: config.timeStr || '',
      isWeekend: config.isWeekend || false,
      resumeText: config.resumeText || '',
    };
    localStorage.setItem('wr_last_session', JSON.stringify(data));
    onComplete(data);
    navigate('/results');
  }

  if (!config || !regionData) return null;

  return (
    <div className="interview-screen">
      {/* Left panel */}
      <aside className="interview-left">
        <div className="persona-card glass-panel" style={{ borderColor: `${regionColor}55`, boxShadow: `0 0 24px ${regionColor}18` }}>
          <div style={{ position: 'relative' }}>
            <span className="persona-flag" style={{ textShadow: `0 0 20px ${regionColor}66` }}>{regionData.flag}</span>
            <div style={{
              position: 'absolute', top: 0, right: 0, fontSize: '48px', opacity: 0.06,
              lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
            }}>{regionData.flag}</div>
          </div>
          <h3 className="persona-name">{regionData.interviewer}</h3>
          <p className="persona-title-text">{regionData.title}</p>
          <span className="style-badge" style={{ borderColor: `${regionColor}66`, color: regionColor }}>{regionData.styleTag}</span>
          {moodBadge && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.2)',
              borderRadius: '20px', padding: '4px 10px', fontSize: '11px',
              color: '#00d2ff', fontWeight: 600, letterSpacing: '0.5px',
              marginTop: '6px', width: 'fit-content',
            }}>
              <span>{moodBadge.icon}</span>
              <span>{moodBadge.label}</span>
            </div>
          )}
          <p className="persona-personality">{regionData.personality}</p>
        </div>

        {config.timeContext && (
          <div style={{
            background: 'rgba(5,21,37,0.85)', border: '1px solid rgba(0,210,255,0.15)',
            borderRadius: '12px', padding: '14px', backdropFilter: 'blur(20px)',
          }}>
            <div style={{
              fontSize: '9px', letterSpacing: '2px', color: '#00d2ff', fontWeight: 700,
              textTransform: 'uppercase', marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ffcc', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Live Room Context
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              {config.timeContext}
            </p>
          </div>
        )}

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
        <div className="chat-header" style={{ borderBottomColor: `${regionColor}33` }}>
          <span className="chat-flag">{regionData.flag}</span>
          <div>
            <span className="chat-title">{regionData.name} Interview</span>
            <span className="chat-sub"> — {config.role}{config.company ? ` at ${config.company}` : ''}</span>
          </div>
          {moodBadge && (
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{moodBadge.icon}</span>
              <span>{config.timeStr}</span>
            </div>
          )}
        </div>

        <div className="chat-bubbles" ref={chatRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`bubble ${msg.from}${msg.isGreeting ? ' greeting' : ''}${msg.isTransition ? ' transition' : ''}${msg.isClosing ? ' closing' : ''}${msg.isGibberish ? ' gibberish-warning' : ''}`}
              style={msg.from === 'interviewer' ? { borderLeftColor: `${regionColor}44` } : {}}>
              {msg.from === 'interviewer' && (
                <span className="bubble-avatar">{regionData.flag}</span>
              )}
              <span className="bubble-text">{msg.text}</span>
            </div>
          ))}
          {isTyping && (
            <div className="bubble interviewer" style={{ borderLeftColor: `${regionColor}44` }}>
              <span className="bubble-avatar">{regionData.flag}</span>
              <span className="bubble-text" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </div>
          )}
        </div>

        {isComplete ? (
          <div className="answer-area">
            <button className="btn-primary" onClick={handleFinish}>
              See Your Results →
            </button>
          </div>
        ) : (
          <div className="answer-area">
            <textarea ref={textareaRef} className="answer-textarea"
              placeholder={`Respond to ${regionData.interviewer}… (Cmd/Ctrl + Enter to submit)`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitAnswer(draft); }}
            />
            <div className="answer-footer">
              <span className="answer-hint">Cmd/Ctrl + Enter to submit</span>
              <div className="answer-footer-right">
                {hasSpeech && (
                  <button
                    className={`mic-btn${listening ? ' active' : ''}`}
                    onClick={toggleMic}
                    title={listening ? 'Stop recording' : 'Speak your answer'}
                    type="button"
                  >
                    {listening ? '⏹ Stop' : '🎙 Speak'}
                  </button>
                )}
                <button className={`btn-primary${draft.trim() ? '' : ' disabled'}`}
                  onClick={() => submitAnswer(draft)} disabled={!draft.trim()}>
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { };
