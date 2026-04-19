export default function CoachingCard({ category, tip, score, icon }) {
  const level = score >= 85 ? 'high' : score >= 70 ? 'mid' : 'low';
  const badge = level === 'high' ? '✅' : level === 'mid' ? '⚡' : '📌';

  return (
    <div className={`coaching-card level-${level}`}>
      <div className="coaching-card-header">
        <span className="coaching-icon">{icon}</span>
        <span className="coaching-category">{category}</span>
        <span className="coaching-badge">{badge}</span>
        <span className="coaching-score">{score}</span>
      </div>
      <p className="coaching-tip">{tip}</p>
    </div>
  );
}
