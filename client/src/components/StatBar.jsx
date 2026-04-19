import { useEffect, useState } from 'react'
import styles from '../styles/StatBar.module.css'

function scoreColor(s) {
  if (s >= 75) return 'var(--score-high)'
  if (s >= 45) return 'var(--score-mid)'
  return 'var(--score-low)'
}

export default function StatBar({ label, score, feedback, index }) {
  const [width, setWidth] = useState(0)
  const [count, setCount] = useState(0)
  const color = scoreColor(score)

  useEffect(() => {
    const t1 = setTimeout(() => setWidth(score), 200 + index * 120)
    const t2 = setTimeout(() => {
      let c = 0
      const increment = score / 40
      const iv = setInterval(() => {
        c = Math.min(c + increment, score)
        setCount(Math.round(c))
        if (c >= score) clearInterval(iv)
      }, 15)
      return () => clearInterval(iv)
    }, 200 + index * 120)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [score, index])

  return (
    <div
      className={styles.container}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label.toUpperCase()}</span>
        <span className={styles.score} style={{ color, textShadow: `0 0 20px ${color}66` }}>
          {count}
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: `${width}%`,
            background: color,
            boxShadow: `0 0 12px ${color}88`,
          }}
        />
      </div>
      <p className={styles.feedback}>{feedback}</p>
    </div>
  )
}