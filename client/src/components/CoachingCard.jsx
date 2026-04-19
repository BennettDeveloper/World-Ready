export default function CoachingCard({ category, tip, score, icon }) {
  const level = score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low'
  const borderColor = level === 'high'
    ? 'rgba(0,255,204,0.4)'
    : level === 'mid'
    ? 'rgba(245,158,11,0.4)'
    : 'rgba(255,71,87,0.4)'
  const scoreColor = level === 'high'
    ? 'var(--score-high)'
    : level === 'mid'
    ? 'var(--score-mid)'
    : 'var(--score-low)'

  return (
    <div style={{
      background: 'rgba(5,21,37,0.85)',
      border: `1px solid ${borderColor}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '12px', color: 'var(--text-primary)',
            letterSpacing: '0.5px',
          }}>{category}</span>
        </div>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '16px', color: scoreColor,
        }}>{score}</span>
      </div>
      <p style={{
        fontSize: '12px', color: 'var(--text-secondary)',
        lineHeight: 1.65, fontStyle: 'italic', margin: 0,
      }}>{tip}</p>
    </div>
  )
}