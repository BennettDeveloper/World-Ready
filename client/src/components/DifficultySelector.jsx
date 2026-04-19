const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🟢',
    time: '3 min / question',
    desc: 'Relaxed pace, more time to think.',
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '🟡',
    time: '2 min / question',
    desc: 'Balanced. Matches a real interview.',
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔴',
    time: '1 min / question',
    desc: 'High pressure. For the World-Ready.',
  },
]

// eslint-disable-next-line react-refresh/only-export-components
export const DIFFICULTY_SECONDS = { easy: 180, medium: 120, hard: 60 };

export default function DifficultySelector({ value, onChange }) {
  return (
    <div>
      <div style={{
        fontSize: '11px', color: 'var(--text-muted)',
        letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: 'var(--font-display)', marginBottom: '8px',
      }}>
        Difficulty
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {DIFFICULTIES.map(d => (
          <button
            key={d.key}
            type="button"
            onClick={() => onChange(d.key)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '4px',
              padding: '10px 6px',
              background: value === d.key ? 'rgba(0,210,255,0.1)' : 'rgba(0,210,255,0.03)',
              border: `1px solid ${value === d.key ? 'var(--cyan)' : 'var(--cyan-border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              boxShadow: value === d.key ? '0 0 12px rgba(0,210,255,0.15)' : 'none',
            }}
          >
            <span style={{ fontSize: '16px' }}>{d.emoji}</span>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: value === d.key ? 'var(--cyan)' : 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}>
              {d.label}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
              {d.time}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
              {d.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}