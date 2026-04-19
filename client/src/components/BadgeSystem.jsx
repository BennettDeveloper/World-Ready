import { REGIONS } from '../data/regions'

const ALL_BADGES = [
  { id: 'first_interview', icon: '🎤', label: 'First Interview', desc: 'Completed your first session', check: h => h.length >= 1 },
  { id: 'globe_trotter', icon: '✈️', label: 'Globe Trotter', desc: 'Interviewed in 3+ regions', check: h => new Set(h.map(s => s.region)).size >= 3 },
  { id: 'global_explorer', icon: '🗺️', label: 'Global Explorer', desc: 'Completed all 8 regions', check: h => new Set(h.map(s => s.region)).size >= Object.keys(REGIONS).length },
  { id: 'high_scorer', icon: '⭐', label: 'High Scorer', desc: 'Scored 85+ overall', check: h => h.some(s => s.overall >= 85) },
  { id: 'perfect', icon: '💎', label: 'Diamond', desc: 'Scored 95+ overall', check: h => h.some(s => s.overall >= 95) },
  { id: 'speed_demon', icon: '⚡', label: 'Speedster', desc: 'Completed a Hard interview', check: h => h.some(s => s.difficulty === 'hard') },
  { id: 'consistent', icon: '🔥', label: 'On Fire', desc: 'Completed 5 interviews', check: h => h.length >= 5 },
  { id: 'world_ready', icon: '🌐', label: 'World Ready', desc: 'Completed 10 interviews', check: h => h.length >= 10 },
]

export default function BadgeSystem({ history }) {
  const earned = ALL_BADGES.filter(b => b.check(history))
  const locked = ALL_BADGES.filter(b => !b.check(history))

  const BadgeGrid = ({ badges, isEarned }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {badges.map(b => (
        <div key={b.id} title={b.desc} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', padding: '12px 16px', minWidth: '80px',
          background: isEarned ? 'rgba(0,210,255,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isEarned ? 'var(--cyan-border)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 'var(--radius-md)',
          opacity: isEarned ? 1 : 0.45,
          cursor: 'default',
          transition: 'all var(--transition-fast)',
        }}>
          <span style={{ fontSize: '22px' }}>{isEarned ? b.icon : '🔒'}</span>
          <span style={{
            fontSize: '10px', fontFamily: 'var(--font-display)',
            fontWeight: 600, color: isEarned ? 'var(--cyan)' : 'var(--text-muted)',
            textAlign: 'center', letterSpacing: '0.5px',
          }}>{b.label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {earned.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px', color: 'var(--score-high)',
            letterSpacing: '2px', fontFamily: 'var(--font-display)',
            marginBottom: '10px',
          }}>EARNED</div>
          <BadgeGrid badges={earned} isEarned={true} />
        </div>
      )}
      {locked.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px', color: 'var(--text-muted)',
            letterSpacing: '2px', fontFamily: 'var(--font-display)',
            marginBottom: '10px',
          }}>LOCKED</div>
          <BadgeGrid badges={locked} isEarned={false} />
        </div>
      )}
    </div>
  )
}