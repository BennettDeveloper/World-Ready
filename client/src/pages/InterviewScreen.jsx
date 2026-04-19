import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Timer from '../components/Timer'
import FillerCounter from '../components/FillerCounter'
import { REGIONS } from '../data/regions'
import { getPendingSession, clearPendingSession } from '../utils/storage'
import { DIFFICULTY_SECONDS } from '../components/DifficultySelector'
import { isGibberish } from '../utils/validation'

const CATEGORIES = [
  'Cultural Fluency', 'Communication Clarity',
  'Confidence', 'Role Alignment', 'Overall Performance'
]

export default function InterviewScreen({ onComplete }) {
  const navigate = useNavigate()
  const config = getPendingSession()

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [answers, setAnswers] = useState([])
  const [timerKey, setTimerKey] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [repeatCounts, setRepeatCounts] = useState({})
  const chatRef = useRef(null)
  const textareaRef = useRef(null)

  const regionData = config ? REGIONS[config.region] : null
  const questions = regionData?.questions || []
  const timerSeconds = DIFFICULTY_SECONDS[config?.difficulty] || 120

  useEffect(() => {
    if (!config || !regionData) { navigate('/home'); return }
    setMessages([{ from: 'interviewer', text: regionData.greeting, isGreeting: true }])
    const t = setTimeout(() => {
      setMessages(prev => [...prev, { from: 'interviewer', text: questions[0] }])
      setTimerRunning(true)
    }, 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!isComplete && textareaRef.current) textareaRef.current.focus()
  }, [qIndex, isComplete])

  function submitAnswer(text) {
    const answer = text.trim()
    if (!answer || isComplete) return
    setTimerRunning(false)
    setMessages(prev => [...prev, { from: 'user', text: answer }])
    setDraft('')

    if (isGibberish(answer)) {
      const currentRepeats = repeatCounts[qIndex] || 0
      if (currentRepeats < 2) {
        const gibReply = regionData.gibberishResponse || "I'm sorry, I didn't quite follow that."
        setRepeatCounts(prev => ({ ...prev, [qIndex]: currentRepeats + 1 }))
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'interviewer', text: gibReply, isGibberish: true }])
          setTimeout(() => {
            setMessages(prev => [...prev, { from: 'interviewer', text: questions[qIndex] }])
            setTimerKey(k => k + 1)
            setTimerRunning(true)
          }, 700)
        }, 500)
        return
      } else {
        const moveOn = regionData.moveOnResponse || "Let us continue."
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'interviewer', text: moveOn, isTransition: true }])
          advanceQuestion(qIndex)
        }, 500)
        return
      }
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    setAnswerCount(c => c + 1)
    setTimeout(() => advanceQuestion(qIndex), 500)
  }

  function advanceQuestion(currentQIndex) {
    const nextQIndex = currentQIndex + 1
    if (nextQIndex < questions.length) {
      const transition = regionData.transitions?.[currentQIndex] || 'Thank you. Let us continue.'
      setMessages(prev => [...prev, { from: 'interviewer', text: transition, isTransition: true }])
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'interviewer', text: questions[nextQIndex] }])
        setQIndex(nextQIndex)
        setTimerKey(k => k + 1)
        setTimerRunning(true)
      }, 700)
    } else {
      setMessages(prev => [...prev, { from: 'interviewer', text: regionData.closing, isClosing: true }])
      setIsComplete(true)
    }
  }

  function handleFinish() {
    clearPendingSession()
    onComplete({
      region: config.region, role: config.role,
      company: config.company, difficulty: config.difficulty,
      messages, answers,
    })
    navigate('/results')
  }

  if (!config || !regionData) return null

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      position: 'relative', zIndex: 1,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: '280px 1fr',
        height: 'calc(100vh - 60px)',
      }}>

        {/* Left — Persona */}
        <aside style={{
          display: 'flex', flexDirection: 'column', gap: '14px',
          padding: '20px 16px', borderRight: '1px solid var(--cyan-border)',
          background: 'rgba(0,210,255,0.02)', overflowY: 'auto',
        }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(196,114,240,0.15))',
              border: '1px solid var(--cyan-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', flexShrink: 0,
            }}>{regionData.flag}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                {regionData.interviewer}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {regionData.title}
              </div>
            </div>
          </div>

          <span style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'rgba(0,210,255,0.08)', border: '1px solid var(--cyan-border)',
            borderRadius: '999px', fontSize: '10px', color: 'var(--cyan)',
            letterSpacing: '1px', fontFamily: 'var(--font-display)',
          }}>{regionData.styleTag}</span>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {regionData.personality}
          </p>

          <div style={{ height: '1px', background: 'var(--cyan-border)' }} />

          {/* Progress */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              PROGRESS
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  width: '32px', height: '28px', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-display)',
                  background: i < answerCount ? 'var(--cyan)'
                    : i === qIndex && !isComplete ? 'rgba(0,210,255,0.12)' : 'var(--bg-secondary)',
                  border: `1px solid ${i <= qIndex ? 'var(--cyan)' : 'var(--cyan-border)'}`,
                  color: i < answerCount ? 'var(--bg-primary)'
                    : i === qIndex && !isComplete ? 'var(--cyan)' : 'var(--text-muted)',
                  boxShadow: i === qIndex && !isComplete ? '0 0 10px rgba(0,210,255,0.25)' : 'none',
                }}>
                  {i < answerCount ? '✓' : `Q${i + 1}`}
                </div>
              ))}
            </div>
          </div>

          {/* Timer */}
          {!isComplete && timerRunning && (
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                TIME REMAINING
              </div>
              <Timer
                key={timerKey}
                seconds={timerSeconds}
                running={timerRunning}
                onExpire={() => submitAnswer(draft || '[No answer — time expired]')}
              />
            </div>
          )}

          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px',
            background: 'rgba(0,210,255,0.06)',
            border: '1px solid var(--cyan-border)',
            borderRadius: 'var(--radius-sm)',
            marginTop: 'auto',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isComplete ? 'var(--score-mid)' : 'var(--cyan-glow)',
              boxShadow: isComplete ? '0 0 8px var(--score-mid)' : '0 0 8px var(--cyan-glow)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              {isComplete ? 'Interview complete' : 'Listening'}
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{
              padding: '3px 8px', background: 'var(--bg-card)',
              border: '1px solid var(--cyan-border)',
              borderRadius: '999px', fontSize: '10px', color: 'var(--text-secondary)',
            }}>{config.role}</span>
            {config.company && (
              <span style={{
                padding: '3px 8px', background: 'var(--bg-card)',
                border: '1px solid var(--cyan-border)',
                borderRadius: '999px', fontSize: '10px', color: 'var(--text-secondary)',
              }}>{config.company}</span>
            )}
            <span style={{
              padding: '3px 8px',
              background: config.difficulty === 'hard' ? 'rgba(255,71,87,0.1)'
                : config.difficulty === 'easy' ? 'rgba(0,255,204,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${config.difficulty === 'hard' ? 'rgba(255,71,87,0.3)'
                : config.difficulty === 'easy' ? 'rgba(0,255,204,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: '999px', fontSize: '10px',
              color: config.difficulty === 'hard' ? 'var(--score-low)'
                : config.difficulty === 'easy' ? 'var(--score-high)' : 'var(--score-mid)',
            }}>{config.difficulty}</span>
          </div>

          {/* Traits */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {regionData.personalityTraits?.map(t => (
              <span key={t} style={{
                padding: '2px 8px',
                background: 'rgba(196,114,240,0.08)',
                border: '1px solid var(--violet-border)',
                borderRadius: '999px', fontSize: '10px', color: 'var(--violet)',
              }}>{t}</span>
            ))}
          </div>

          {/* Evaluating */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
              EVALUATING
            </div>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cat}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Right — Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px 24px',
            borderBottom: '1px solid var(--cyan-border)',
            background: 'rgba(2,13,26,0.6)', backdropFilter: 'blur(12px)',
          }}>
            <span style={{ fontSize: '20px' }}>{regionData.flag}</span>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: '15px', color: 'var(--text-primary)',
              }}>
                {regionData.name} Interview
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {config.role}{config.company ? ` at ${config.company}` : ''}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '24px', display: 'flex',
              flexDirection: 'column', gap: '16px',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start', gap: '10px',
                animation: 'fadeUp 0.3s ease forwards',
              }}>
                {msg.from === 'interviewer' && (
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--cyan-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0,
                  }}>{regionData.flag}</div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '14px 18px',
                  borderRadius: msg.from === 'interviewer'
                    ? '0 var(--radius-md) var(--radius-md) var(--radius-md)'
                    : 'var(--radius-md) 0 var(--radius-md) var(--radius-md)',
                  fontSize: '14px', lineHeight: 1.75, fontWeight: 300,
                  background: msg.isClosing ? 'rgba(0,255,204,0.06)'
                    : msg.isGibberish ? 'rgba(245,158,11,0.06)'
                    : msg.isTransition ? 'transparent'
                    : msg.from === 'interviewer' ? 'rgba(0,210,255,0.05)'
                    : 'rgba(196,114,240,0.08)',
                  border: msg.isClosing ? '1px solid rgba(0,255,204,0.2)'
                    : msg.isGibberish ? '1px solid rgba(245,158,11,0.2)'
                    : msg.isTransition ? 'none'
                    : msg.from === 'interviewer'
                    ? '1px solid rgba(0,210,255,0.15)'
                    : '1px solid rgba(196,114,240,0.2)',
                  borderLeft: msg.from === 'interviewer' && !msg.isTransition
                    ? '3px solid var(--cyan)' : undefined,
                  borderRight: msg.from === 'user'
                    ? '3px solid var(--violet)' : undefined,
                  color: msg.isTransition ? 'var(--text-muted)'
                    : msg.isGibberish ? 'var(--score-mid)'
                    : 'var(--text-primary)',
                  fontStyle: msg.isGreeting || msg.isTransition ? 'italic' : 'normal',
                  fontSize: msg.isTransition ? '12px' : '14px',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Answer area */}
          {isComplete ? (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--cyan-border)',
              background: 'rgba(0,255,204,0.02)',
            }}>
              <button
                onClick={handleFinish}
                style={{
                  width: '100%', padding: '14px',
                  background: 'var(--cyan)', border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '15px', letterSpacing: '2px',
                  textTransform: 'uppercase', color: 'var(--bg-primary)',
                  cursor: 'pointer', transition: 'all var(--transition-normal)',
                }}
              >
                See Your Results →
              </button>
            </div>
          ) : (
            <div style={{
              borderTop: '1px solid var(--cyan-border)',
              padding: '16px 24px',
              background: 'rgba(196,114,240,0.02)',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitAnswer(draft) }}
                placeholder={`Respond to ${regionData.interviewer}… (Cmd/Ctrl + Enter to submit)`}
                rows={4}
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', color: 'var(--text-primary)',
                  fontSize: '14px', lineHeight: 1.75,
                  fontFamily: 'var(--font-ui)', fontWeight: 300,
                  resize: 'none',
                }}
              />
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--cyan-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <FillerCounter text={draft} />
                  {wordCount > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                      {wordCount} words
                    </span>
                  )}
                </div>
                <button
                  onClick={() => submitAnswer(draft)}
                  disabled={!draft.trim()}
                  style={{
                    padding: '10px 28px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '13px', letterSpacing: '1.5px',
                    textTransform: 'uppercase', border: 'none',
                    cursor: draft.trim() ? 'pointer' : 'not-allowed',
                    background: draft.trim() ? 'var(--cyan)' : 'var(--bg-secondary)',
                    color: draft.trim() ? 'var(--bg-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea::placeholder { color: var(--text-muted); }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--cyan-dim); border-radius: 2px; }
      `}</style>
    </div>
  )
}