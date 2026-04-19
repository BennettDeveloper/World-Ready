import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BadgeSystem from '../components/BadgeSystem'
import SessionCard from '../components/SessionCard'
import { getHistory } from '../utils/storage'
import { REGIONS } from '../data/regions'

function scoreColor(s) {
  if (s >= 85) return 'var(--score-high)'
  if (s >= 70) return 'var(--cyan)'
  return 'var(--score-mid)'
}

export default function ProfilePage({ user }) {
  const navigate = useNavigate()
  const history = useMemo(() => (user ? getHistory(user.userId) : []), [user])

  if (!user) { navigate('/login'); return null }

  const totalSessions = history.length
  const avgScore = totalSessions > 0
    ? Math.round(history.reduce((s, h) => s + (h.overall || 0), 0) / totalSessions) : 0
  const bestScore = totalSessions > 0
    ? Math.max(...history.map(h => h.overall || 0)) : 0
  const regionsExplored = new Set(history.map(h => h.region)).size
  const recentScores = history.slice(0, 10).reverse()

  const stats = [
    { label: 'Sessions', value: totalSessions, icon: '🎤' },
    { label: 'Avg Score', value: avgScore || '—', icon: '📊' },
    { label: 'Best Score', value: bestScore || '—', icon: '⭐' },
    { label: 'Regions', value: `${regionsExplored} / ${Object.keys(REGIONS).length}`, icon: '🌍' },
  ]

  return (
    <div style={{
      maxWidth: '900px', margin: '0 auto', padding: '32px 24px',
      display: 'flex', flexDirection: 'column', gap: '24px',
    }}>

      {/* Header */}
      <div className="glass-panel" style={{
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '26px', color: 'var(--bg-primary)', flexShrink: 0,
        }}>
          {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px',
          }}>{user.name}</h1>
          <div style={{ fontSize: '13px', color: 'var(--cyan)', marginBottom: '2px' }}>@{user.username}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '10px 24px', background: 'var(--cyan)', border: 'none',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'var(--bg-primary)', cursor: 'pointer',
          }}
        >
          Start Interview
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {stats.map(s => (
          <div key={s.label} className="glass-panel" style={{
            textAlign: 'center', display: 'flex',
            flexDirection: 'column', gap: '6px', alignItems: 'center',
          }}>
            <span style={{ fontSize: '22px' }}>{s.icon}</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '22px', color: 'var(--cyan)',
            }}>{s.value}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      {recentScores.length > 0 && (
        <div className="glass-panel">
          <div style={{
            fontSize: '11px', color: 'var(--cyan)', letterSpacing: '3px',
            fontFamily: 'var(--font-display)', marginBottom: '20px',
          }}>PROGRESS OVER TIME</div>
          <div style={{
            display: 'flex', alignItems: 'flex-end',
            gap: '8px', height: '120px',
          }}>
            {recentScores.map((s, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px', flex: 1,
              }}>
                <span style={{
                  fontSize: '10px', color: scoreColor(s.overall),
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                }}>{s.overall}</span>
                <div style={{
                  width: '100%', height: `${s.overall}%`,
                  background: s.overall >= 85
                    ? 'linear-gradient(var(--score-high), var(--cyan))'
                    : s.overall >= 70
                    ? 'linear-gradient(var(--cyan), var(--violet))'
                    : 'linear-gradient(var(--score-mid), var(--score-low))',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                  boxShadow: `0 0 8px ${scoreColor(s.overall)}66`,
                  transition: 'height 0.5s ease',
                }} />
                <span style={{ fontSize: '14px' }}>
                  {REGIONS[s.region]?.flag || '🌐'}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
            Last {recentScores.length} interview{recentScores.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Badges */}
      <div className="glass-panel">
        <div style={{
          fontSize: '11px', color: 'var(--cyan)', letterSpacing: '3px',
          fontFamily: 'var(--font-display)', marginBottom: '16px',
        }}>ACHIEVEMENTS</div>
        <BadgeSystem history={history} />
      </div>

      {/* History */}
      <div>
        <div style={{
          fontSize: '11px', color: 'var(--cyan)', letterSpacing: '3px',
          fontFamily: 'var(--font-display)', marginBottom: '16px',
        }}>PAST SESSIONS</div>
        {history.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No interviews yet.</p>
            <button
              onClick={() => navigate('/home')}
              style={{
                padding: '10px 24px', background: 'var(--cyan)', border: 'none',
                borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)',
                fontWeight: 700, fontSize: '13px', color: 'var(--bg-primary)',
                cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
              }}
            >Start your first one!</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}