import { useEffect, useState } from 'react';
import { getLeaderboard } from '../utils/storage';
import { REGIONS } from '../data/regions';

export default function LeaderboardPreview() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getLeaderboard().slice(0, 5));
  }, []);

  if (entries.length === 0) {
    return (
      <div className="leaderboard-preview glass">
        <h3 className="lb-preview-title">🏆 Leaderboard</h3>
        <p className="lb-empty">No scores yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-preview glass">
      <h3 className="lb-preview-title">🏆 Top Scores</h3>
      <ol className="lb-list">
        {entries.map((e, i) => (
          <li key={e.id} className="lb-entry">
            <span className="lb-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
            <span className="lb-flag">{REGIONS[e.region]?.flag || '🌐'}</span>
            <span className="lb-name">{e.username}</span>
            <span className="lb-score">{e.overall}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
