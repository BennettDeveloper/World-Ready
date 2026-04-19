export default function StatBar({ label, score, animated }) {
  const color = score >= 85
    ? 'linear-gradient(90deg, #00d4ff, #22c55e)'
    : score >= 70
    ? 'linear-gradient(90deg, #00d4ff, #7c3aed)'
    : 'linear-gradient(90deg, #f59e0b, #ef4444)'

  const textColor = score >= 85 ? '#22c55e' : score >= 70 ? '#00d4ff' : '#f59e0b'

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: '6px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '11px', letterSpacing: '2px',
          color: 'var(--text-secondary)', textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '20px', color: textColor,
        }}>{score}</span>
      </div>
      <div style={{
        height: '4px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '999px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: animated ? `${score}%` : '0%',
          background: color,
          borderRadius: '999px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}