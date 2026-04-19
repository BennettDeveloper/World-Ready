const FILLERS = ['um', 'uh', 'like', 'basically', 'literally', 'you know', 'sort of', 'kind of', 'i mean', 'right']

export function countFillers(text) {
  const lower = text.toLowerCase()
  return FILLERS.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = lower.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

export default function FillerCounter({ text }) {
  const count = countFillers(text)
  const color = count === 0 ? 'var(--cyan)' : count <= 2 ? 'var(--score-mid)' : 'var(--score-low)'

  return (
    <div style={{
      fontSize: '11px',
      fontFamily: 'var(--font-ui)',
      color,
      letterSpacing: '1px',
      transition: 'color 0.2s',
    }}>
      {count === 0
        ? '● Clean delivery'
        : `● Fillers detected: ${count}`
      }
    </div>
  )
}