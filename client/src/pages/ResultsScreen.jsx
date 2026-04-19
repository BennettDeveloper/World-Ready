import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { REGIONS } from '../data/regions'
import { saveSession, submitToLeaderboard } from '../utils/storage'
import { scoreAnswers } from '../utils/scoring'
import { generateCoaching } from '../utils/coaching'

const STAT_LABELS = [
  'Cultural Fluency',
  'Communication Clarity',
  'Confidence',
  'Role Alignment',
  'Overall Performance',
]

function scoreColor(s) {
  if (s >= 85) return 'var(--score-high)'
  if (s >= 70) return 'var(--cyan)'
  return 'var(--score-mid)'
}

function AnimatedBar({ label, score, index, animated }) {
  const [width, setWidth] = useState(0)
  const [count, setCount] = useState(0)
  const color = scoreColor(score)

  useEffect(() => {
    if (!animated) return
    const t1 = setTimeout(() => setWidth(score), 200 + index * 120)
    const t2 = setTimeout(() => {
      let c = 0
      const step = score / 40
      const iv = setInterval(() => {
        c = Math.min(c + step, score)
        setCount(Math.round(c))
        if (c >= score) clearInterval(iv)
      }, 15)
      return () => clearInterval(iv)
    }, 200 + index * 120)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [animated, score, index])

  return (
    <div style={{
      marginBottom: '20px',
      opacity: animated ? 1 : 0,
      transform: animated ? 'translateY(0)' : 'translateY(10px)',
      transition: `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '12px', letterSpacing: '2px',
          color: 'var(--text-secondary)', textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '22px', color,
          textShadow: `0 0 20px ${color}66`,
        }}>{count}</span>
      </div>
      <div style={{
        height: '5px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '999px', overflow: 'hidden', marginBottom: '8px',
      }}>
        <div style={{
          height: '100%', width: `${width}%`,
          background: color, borderRadius: '999px',
          boxShadow: `0 0 10px ${color}88`,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  )
}

function CoachingCard({ category, tip, score, icon }) {
  const color = scoreColor(score)
  return (
    <div style={{
      background: 'rgba(5,21,37,0.85)',
      border: `1px solid ${color}44`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '12px', color: 'var(--text-primary)',
            letterSpacing: '1px',
          }}>{category}</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '16px', color,
        }}>{score}</span>
      </div>
      <p style={{
        fontSize: '12px', color: 'var(--text-secondary)',
        lineHeight: 1.65, fontStyle: 'italic',
      }}>{tip}</p>
    </div>
  )
}

export default function ResultsScreen({ user, sessionData }) {
  const navigate = useNavigate()
  const [animated, setAnimated] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  if (!sessionData) { navigate('/home'); return null }

  const { region, role, company, difficulty, messages, answers } = sessionData
  const regionData = REGIONS[region]
  const scores = scoreAnswers(answers, region, role)
  const coaching = generateCoaching(scores)
  const overall = scores[4]
  const color = scoreColor(overall)
  const scoreLabel = overall >= 85 ? 'Outstanding' : overall >= 70 ? 'Solid Performance' : 'Keep Practicing'

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150)
    if (user) saveSession(user.userId, { region, role, company, difficulty, messages, scores, overall, answers })
    return () => clearTimeout(t)
  }, [])

  function handleSubmitLeaderboard() {
    if (submitted || !user) return
    submitToLeaderboard({ username: user.username, region, role, overall, difficulty })
    setSubmitted(true)
  }

  function handleShare() {
    const text = `I just scored ${overall}/100 in a ${regionData?.name} interview simulation as a ${role} on World Ready! 🌐`
    if (navigator.share) {
      navigator.share({ title: 'World Ready Results', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Results copied to clipboard!')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', position: 'relative', zIndex: 1,
      padding: '32px 24px', maxWidth: '800px',
      margin: '0 auto', width: '100%',
      display: 'flex', flexDirection: 'column', gap: '32px',
    }}>

      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '24px', alignItems: 'start',
      }}>
        {/* Evaluator badge */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(196,114,240,0.15))',
            border: '1px solid var(--cyan-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', flexShrink: 0,
          }}>{regionData?.flag}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              {regionData?.interviewer}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              {regionData?.name} Interview
            </div>
            <span style={{
              display: 'inline-block', padding: '2px 10px',
              background: 'rgba(0,210,255,0.08)', border: '1px solid var(--cyan-border)',
              borderRadius: '999px', fontSize: '10px', color: 'var(--cyan)',
              letterSpacing: '1px', fontFamily: 'var(--font-display)',
            }}>{regionData?.styleTag}</span>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--cyan)', letterSpacing: '4px', fontFamily: 'var(--font-display)' }}>
            INTERVIEW COMPLETE
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '80px', lineHeight: 1, color,
            textShadow: `0 0 60px ${color}44`,
          }}>
            {animated ? overall : 0}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            / 100 · {scoreLabel}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {role}{company ? ` at ${company}` : ''} · {difficulty}
          </div>
        </div>
      </div>

      {/* Stat bars */}
      <div className="glass-panel">
        <div style={{ fontSize: '11px', color: 'var(--cyan)', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
          PERFORMANCE BREAKDOWN
        </div>
        {scores.map((score, i) => (
          <AnimatedBar key={i} label={STAT_LABELS[i]} score={score} index={i} animated={animated} />
        ))}
      </div>

      {/* Coaching */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--cyan)', letterSpacing: '3px', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
          COACHING FEEDBACK
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {coaching.map((c, i) => <CoachingCard key={i} {...c} />)}
        </div>
      </div>

      {/* Transcript */}
      <div className="glass-panel">
        <button
          onClick={() => setShowTranscript(t => !t)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: '13px',
          }}
        >
          <span>📋 Session Replay — Full Transcript</span>
          <span style={{ color: 'var(--cyan)' }}>{showTranscript ? '▲' : '▼'}</span>
        </button>

        {showTranscript && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: '10px',
                flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {msg.from === 'interviewer' ? regionData?.flag || '🎙' : '🧑'}
                </span>
                <span style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  lineHeight: 1.6, maxWidth: '80%',
                  fontStyle: msg.isGreeting || msg.isTransition ? 'italic' : 'normal',
                  color: msg.isTransition ? 'var(--text-muted)' : 'var(--text-secondary)',
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            flex: 1, padding: '13px',
            background: 'var(--cyan)', border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', color: 'var(--bg-primary)',
            cursor: 'pointer', transition: 'all var(--transition-normal)',
            minWidth: '160px',
          }}
        >
          Try Another Region
        </button>

        <button
          onClick={handleSubmitLeaderboard}
          disabled={submitted}
          style={{
            flex: 1, padding: '13px',
            background: 'transparent',
            border: `1px solid ${submitted ? 'var(--score-high)' : 'var(--cyan-border)'}`,
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase',
            color: submitted ? 'var(--score-high)' : 'var(--cyan)',
            cursor: submitted ? 'default' : 'pointer',
            transition: 'all var(--transition-normal)',
            minWidth: '160px',
          }}
        >
          {submitted ? '✅ On the Leaderboard!' : '🏆 Submit Score'}
        </button>

        <button
          onClick={handleShare}
          style={{
            flex: 1, padding: '13px',
            background: 'transparent',
            border: '1px solid var(--violet-border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', color: 'var(--violet)',
            cursor: 'pointer', transition: 'all var(--transition-normal)',
            minWidth: '160px',
          }}
        >
          📤 Share Results
        </button>

        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '13px 20px',
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: '13px',
            transition: 'color var(--transition-fast)',
          }}
        >
          View Profile →
        </button>
      </div>

      {/* Closing line */}
      <p style={{
        textAlign: 'center', fontSize: '13px',
        color: 'var(--text-muted)', fontStyle: 'italic',
        lineHeight: 1.8, paddingTop: '8px',
        borderTop: '1px solid var(--cyan-border)',
      }}>
        In a world where everyone is interview ready, the candidates who stand out will be the ones who are World-Ready.
      </p>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}