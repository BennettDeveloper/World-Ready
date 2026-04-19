import { useState } from 'react'
import { REGIONS } from '../data/regions'

function scoreColor(s) {
  if (s >= 85) return 'var(--score-high)'
  if (s >= 70) return 'var(--cyan)'
  return 'var(--score-mid)'
}

export default function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false)
  const region = REGIONS[session.region]
  const date = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const color = scoreColor(session.overall)

  return (
    <div style={{
      background: 'rgba(5,21,37,0.85)',
      border: '1px solid var(--cyan-border)',
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'blur(20px)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '14px 16px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,210,255,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: '20px', flexShrink: 0 }}>
          {region?.flag || '🌐'}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '14px', color: 'var(--text-primary)',
          }}>
            {region?.name || session.region}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {session.role}{session.company ? ` at ${session.company}` : ''}
          </div>
        </div>

        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '18px', color, flexShrink: 0,
        }}>{session.overall}</span>

        <span style={{
          fontSize: '10px', padding: '3px 8px',
          background: session.difficulty === 'hard' ? 'rgba(255,71,87,0.1)'
            : session.difficulty === 'easy' ? 'rgba(0,255,204,0.1)' : 'rgba(245,158,11,0.1)',
          color: session.difficulty === 'hard' ? 'var(--score-low)'
            : session.difficulty === 'easy' ? 'var(--score-high)' : 'var(--score-mid)',
          borderRadius: '999px', flexShrink: 0,
        }}>{session.difficulty}</span>

        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
          {date}
        </span>

        <span style={{ fontSize: '12px', color: 'var(--cyan)', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded transcript */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--cyan-border)',
          padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Score breakdown */}
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            {['Cultural Fluency', 'Clarity', 'Confidence', 'Role Fit', 'Overall'].map((label, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '4px', flex: 1, minWidth: '60px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '16px', color: scoreColor(session.scores?.[i] || 0),
                }}>
                  {session.scores?.[i] ?? '—'}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '1px' }}>
                  {label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            fontSize: '11px', color: 'var(--text-muted)',
            letterSpacing: '2px', fontFamily: 'var(--font-display)',
            marginBottom: '4px',
          }}>SESSION REPLAY</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {session.messages?.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: '8px',
                flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                opacity: msg.isTransition ? 0.5 : 1,
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>
                  {msg.from === 'interviewer' ? region?.flag || '🎙' : '🧑'}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: msg.isTransition ? 'var(--text-muted)' : 'var(--text-secondary)',
                  lineHeight: 1.6, maxWidth: '85%',
                  fontStyle: msg.isGreeting || msg.isTransition ? 'italic' : 'normal',
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}