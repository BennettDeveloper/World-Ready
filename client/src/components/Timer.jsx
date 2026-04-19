import { useState, useEffect, useRef } from 'react'

export default function Timer({ seconds, onExpire, running = true }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => { setRemaining(seconds) }, [seconds])

  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, onExpire])

  const pct = (remaining / seconds) * 100
  const isWarning = pct <= 33
  const isCritical = pct <= 15
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const trackColor = isCritical
    ? 'var(--score-low)'
    : isWarning
    ? 'var(--score-mid)'
    : 'var(--cyan)'

  return (
    <div>
      <div style={{
        height: '4px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '6px',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: trackColor,
          borderRadius: '999px',
          boxShadow: `0 0 8px ${trackColor}88`,
          transition: 'width 1s linear, background 0.3s ease',
          animation: isCritical ? 'pulse 0.8s infinite' : 'none',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '18px',
        color: trackColor,
        letterSpacing: '2px',
        transition: 'color 0.3s ease',
      }}>
        {timeStr}
      </span>
    </div>
  )
}