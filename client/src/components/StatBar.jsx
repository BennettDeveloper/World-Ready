export default function StatBar({ label, score, animated }) {
  const color =
    score >= 85 ? 'linear-gradient(90deg,#00d4ff,#22c55e)' :
    score >= 70 ? 'linear-gradient(90deg,#00d4ff,#7c3aed)' :
    'linear-gradient(90deg,#f59e0b,#ef4444)';

  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{
            width: animated ? `${score}%` : '0%',
            background: color,
          }}
        />
      </div>
      <span className="stat-score" style={{ color: score >= 85 ? '#22c55e' : score >= 70 ? '#00d4ff' : '#f59e0b' }}>
        {score}
      </span>
    </div>
  );
}
