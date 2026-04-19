import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer';
import { REGIONS } from '../data/regions';
import { getPendingSession, clearPendingSession } from '../utils/storage';
import { DIFFICULTY_SECONDS } from '../components/DifficultySelector';
import { isGibberish } from '../utils/validation';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const hasSpeech = !!SpeechRecognition;

export default function InterviewScreen({ onComplete }) {
  const navigate = useNavigate();
  const config = getPendingSession();

  const regionData = config ? REGIONS[config.region] : null;
  const questions = regionData?.questions || [];
  const timerSeconds = DIFFICULTY_SECONDS[config?.difficulty] || 120;

  const [messages, setMessages] = useState(() =>
    regionData ? [{ from: 'interviewer', text: regionData.greeting, isGreeting: true }] : []
  );
  const [draft, setDraft] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [repeatCounts, setRepeatCounts] = useState({});
  const [listening, setListening] = useState(false);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if (!config || !regionData) { navigate('/home'); return; }
    const t = setTimeout(() => {
      setMessages(prev => [...prev, { from: 'interviewer', text: questions[0] }]);
      setTimerRunning(true);
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function submitAnswer(text) {
    const answer = text.trim();
    if (!answer || isComplete) return;

    setTimerRunning(false);
    setMessages(prev => [...prev, { from: 'user', text: answer }]);
    setDraft('');

    // Gibberish check
    if (isGibberish(answer)) {
      const currentRepeats = repeatCounts[qIndex] || 0;

      if (currentRepeats < 2) {
        // In-character gibberish response + repeat question
        const gibReply = regionData.gibberishResponse || "I'm sorry, I didn't quite follow that. Let me ask again.";
        setRepeatCounts(prev => ({ ...prev, [qIndex]: currentRepeats + 1 }));

        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'interviewer', text: gibReply, isGibberish: true }]);
          setTimeout(() => {
            setMessages(prev => [...prev, { from: 'interviewer', text: questions[qIndex] }]);
            setTimerKey(k => k + 1);
            setTimerRunning(true);
          }, 700);
        }, 500);
        return;
      } else {
        // Max repeats reached — move on
        const moveOn = regionData.moveOnResponse || "Let us continue to the next question.";
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'interviewer', text: moveOn, isTransition: true }]);
          advanceQuestion(qIndex);
        }, 500);
        return;
      }
    }

    // Valid answer — record and advance
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setAnswerCount(c => c + 1);

    setTimeout(() => {
      advanceQuestion(qIndex);
    }, 500);
  }

  function advanceQuestion(currentQIndex) {
    const nextQIndex = currentQIndex + 1;

    if (nextQIndex < questions.length) {
      const transition = regionData.transitions?.[currentQIndex] || 'Thank you. Let us continue.';
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
            <div key={i} className={`bubble ${msg.from}${msg.isGreeting ? ' greeting' : ''}${msg.isTransition ? ' transition' : ''}${msg.isClosing ? ' closing' : ''}${msg.isGibberish ? ' gibberish-warning' : ''}`}>
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
