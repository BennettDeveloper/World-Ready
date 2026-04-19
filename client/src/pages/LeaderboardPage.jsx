import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../utils/storage'
import { REGIONS } from '../data/regions'

const DEMO_ENTRIES = [
  { id: '1', username: 'marcus_t',  region: 'tokyo',   role: 'Software Engineer', difficulty: 'hard',   overall: 94, date: new Date().toISOString() },
  { id: '2', username: 'amara_o',   region: 'london',  role: 'Product Manager',   difficulty: 'hard',   overall: 91, date: new Date().toISOString() },
  { id: '3', username: 'preethi_r', region: 'mumbai',  role: 'Data Scientist',    difficulty: 'medium', overall: 88, date: new Date().toISOString() },
  { id: '4', username: 'diego_m',   region: 'dubai',   role: 'Finance Analyst',   difficulty: 'medium', overall: 85, date: new Date().toISOString() },
  { id: '5', username: 'jordan_k',  region: 'newyork', role: 'Biz Development',   difficulty: 'hard',   overall: 82, date: new Date().toISOString() },
  { id: '6', username: 'sophie_l',  region: 'paris',   role: 'Creative Director', difficulty: 'medium', overall: 79, date: new Date().toISOString() },
  { id: '7', username: 'wei_z',     region: 'beijing', role: 'Operations Lead',   difficulty: 'easy',   overall: 76, date: new Date().toISOString() },
]

function scoreColor(s) {
  if (s >= 85) return 'var(--score-high)'
  if (s >= 70) return 'var(--cyan)'
  return 'var(--score-mid)'
}

export default function LeaderboardPage({ user }) {
  const navigate = useNavigate()
  const realEntries = useMemo(() => getLeaderboard(), [])
  const entries = realEntries.length > 0 ? realEntries : DEMO_ENTRIES
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{
      maxWidth: '900px', margin: '0 auto', padding: '32px 24px',
      display: 'flex', flexDirection: 'column', gap: '28px',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--cyan)', letterSpacing: '4px', fontFamily: 'var(--font-display)' }}>
          GLOBAL RANKINGS
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '32px', color: 'var(--text-primary)',
        }}>🏆 Global Leaderboard</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Top scores from World Ready interview simulations worldwide
        </p>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '11px 28px', background: 'var(--cyan)', border: 'none',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '13px', letterSpacing: '2px',
            textTransform: 'uppercase', color: 'var(--bg-primary)', cursor: 'pointer',
          }}
        >
          Take the Interview
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 120px 140px 80px 60px 80px',
          padding: '12px 20px',
          borderBottom: '1px solid var(--cyan-border)',
          background: 'rgba(0,210,255,0.04)',
        }}>
          {['Rank', 'Player', 'Region', 'Role', 'Difficulty', 'Score', 'Date'].map(h => (
            <span key={h} style={{
              fontSize: '10px', color: 'var(--text-muted)',
              letterSpacing: '2px', fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
            }}>{h}</span>
          ))}
        </div>

        {entries.map((e, i) => {
          const isOwn = e.username === user?.username
          const isTop = i < 3
          return (
            <div key={e.id} style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 120px 140px 80px 60px 80px',
              padding: '14px 20px',
              borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              background: isOwn ? 'rgba(0,210,255,0.06)'
                : isTop ? 'rgba(245,158,11,0.03)' : 'transparent',
              alignItems: 'center',
              transition: 'background var(--transition-fast)',
            }}>
              <span style={{ fontSize: '18px' }}>
                {i < 3 ? medals[i] : (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                    #{i + 1}
                  </span>
                )}
              </span>
              <span style={{
                fontFamily: 'var(--font-ui)', fontWeight: 600,
                fontSize: '14px',
                color: isOwn ? 'var(--cyan)' : 'var(--text-primary)',
              }}>{e.username}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {REGIONS[e.region]?.flag || '🌐'} {REGIONS[e.region]?.name || e.region}
              </span>
              <span style={{
                fontSize: '12px', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{e.role}</span>
              <span style={{
                fontSize: '11px', padding: '3px 8px',
                borderRadius: '999px',
                background: e.difficulty === 'hard' ? 'rgba(255,71,87,0.1)'
                  : e.difficulty === 'easy' ? 'rgba(0,255,204,0.1)' : 'rgba(245,158,11,0.1)',
                color: e.difficulty === 'hard' ? 'var(--score-low)'
                  : e.difficulty === 'easy' ? 'var(--score-high)' : 'var(--score-mid)',
                display: 'inline-block', textAlign: 'center',
              }}>{e.difficulty}</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '16px', color: scoreColor(e.overall),
              }}>{e.overall}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}