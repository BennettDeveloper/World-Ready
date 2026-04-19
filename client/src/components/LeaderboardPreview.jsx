import { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/storage'
import { REGIONS } from '../data/regions'

const DEMO_ENTRIES = [
  { id: '1', username: 'marcus_t', region: 'tokyo',   role: 'Software Engineer', overall: 94 },
  { id: '2', username: 'amara_o',  region: 'london',  role: 'Product Manager',   overall: 91 },
  { id: '3', username: 'preethi_r',region: 'mumbai',  role: 'Data Scientist',    overall: 88 },
  { id: '4', username: 'diego_m',  region: 'dubai',   role: 'Finance Analyst',   overall: 85 },
  { id: '5', username: 'jordan_k', region: 'newyork', role: 'Biz Development',   overall: 82 },
]

export default function LeaderboardPreview() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const real = getLeaderboard().slice(0, 5)
    setEntries(real.length > 0 ? real : DEMO_ENTRIES)
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{
      background: 'rgba(5,21,37,0.85)',
      border: '1px solid var(--cyan-border)',
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'blur(20px)',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '13px', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          🏆 <span>Top Scores</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          GLOBAL
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map((e, i) => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 8px',
            borderRadius: 'var(--radius-sm)',
            background: i === 0 ? 'rgba(0,210,255,0.05)' : 'transparent',
            border: i === 0 ? '1px solid rgba(0,210,255,0.1)' : '1px solid transparent',
          }}>
            <span style={{ width: '20px', flexShrink: 0, fontSize: '14px' }}>
              {i < 3 ? medals[i] : `#${i + 1}`}
            </span>
            <span style={{ fontSize: '14px' }}>
              {REGIONS[e.region]?.flag || '🌐'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px', fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-ui)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {e.username}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {e.role || REGIONS[e.region]?.name}
              </div>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '14px',
              color: e.overall >= 90 ? 'var(--score-high)'
                   : e.overall >= 75 ? 'var(--cyan)'
                   : 'var(--score-mid)',
            }}>
              {e.overall}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}