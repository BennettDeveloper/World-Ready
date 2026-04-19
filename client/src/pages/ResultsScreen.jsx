import { useEffect, useState } from 'react'
import StatBar from '../components/StatBar'
import styles from '../styles/ResultsScreen.module.css'

const CATEGORIES = [
  { key: 'confidence',        label: 'Confidence' },
  { key: 'fillerControl',     label: 'Filler Control' },
  { key: 'answerStructure',   label: 'Answer Structure' },
  { key: 'culturalAlignment', label: 'Cultural Alignment' },
  { key: 'followUpHandling',  label: 'Follow-up Handling' },
]

function scoreColor(s) {
  if (s >= 75) return 'var(--score-high)'
  if (s >= 45) return 'var(--score-mid)'
  return 'var(--score-low)'
}

export default function ResultsScreen({ region, role, persona, scores, onRestart }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const s = scores?.scores || {}
  const f = scores?.feedback || {}

  const avg = CATEGORIES.length
    ? Math.round(CATEGORIES.reduce((a, c) => a + (s[c.key] || 0), 0) / CATEGORIES.length)
    : 0

  const avgColor = scoreColor(avg)

  return (
    <div className={styles.page}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          WORLD<span className={styles.logoAccent}>READY</span>
        </div>
      </header>

      <div className={styles.content}>

        {/* Score hero */}
        <div className={styles.scoreHero}>
          <div className={styles.scoreLabel}>INTERVIEW COMPLETE</div>
          <div
            className={styles.scoreNumber}
            style={{ color: avgColor, textShadow: `0 0 60px ${avgColor}44` }}
          >
            {mounted ? avg : 0}
          </div>
          <div className={styles.scoreSub}>
            out of 100 · {persona?.name || region?.interviewer} · {region?.label}
          </div>
          <p className={styles.scoreSummary}>
            {region?.interviewer} evaluates candidates on {region?.styleTag?.toLowerCase()} standards.
            Here is how you performed.
          </p>
        </div>

        {/* Stat bars */}
        <div className={styles.bars}>
          {CATEGORIES.map((cat, i) => (
            <StatBar
              key={cat.key}
              label={cat.label}
              score={s[cat.key] ?? 0}
              feedback={f[cat.key] ?? ''}
              index={i}
            />
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={onRestart}
          >
            Try Another Region
          </button>
          <button
            className={styles.btnSecondary}
            onClick={onRestart}
          >
            Practice Same Role Again
          </button>
        </div>

        {/* Closing line */}
        <p className={styles.closingLine}>
          In a world where everyone is interview ready, the candidates who stand out
          will be the ones who are World-Ready.
        </p>
      </div>
    </div>
  )
}