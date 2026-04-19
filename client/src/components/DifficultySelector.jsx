const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🟢',
    time: '3 min / question',
    desc: 'Relaxed pace, more time to think. Great for practice.',
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '🟡',
    time: '2 min / question',
    desc: 'Balanced challenge. Matches a real interview pace.',
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔴',
    time: '1 min / question',
    desc: 'High pressure, tight clock. For the truly World-Ready.',
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export const DIFFICULTY_SECONDS = { easy: 180, medium: 120, hard: 60 };

export default function DifficultySelector({ value, onChange }) {
  return (
    <div className="difficulty-selector">
      {DIFFICULTIES.map(d => (
        <button
          key={d.key}
          className={`difficulty-card${value === d.key ? ' selected' : ''}`}
          onClick={() => onChange(d.key)}
          type="button"
        >
          <span className="diff-emoji">{d.emoji}</span>
          <span className="diff-label">{d.label}</span>
          <span className="diff-time">{d.time}</span>
          <span className="diff-desc">{d.desc}</span>
        </button>
      ))}
    </div>
  );
}
