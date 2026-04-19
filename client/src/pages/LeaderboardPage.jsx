import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../utils/storage';
import { REGIONS } from '../data/regions';

export default function LeaderboardPage({ user }) {
  const navigate = useNavigate();
  const entries = useMemo(() => getLeaderboard(), []);

  return (
    <div className="leaderboard-page">
      <div className="lb-page-header">
        <h1 className="lb-page-title">🏆 Global Leaderboard</h1>
        <p className="lb-page-sub">Top scores from World Ready interview simulations worldwide</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>Take the Interview</button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state glass">
          <p className="empty-title">No scores yet — be the first on the board!</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>Start Now</button>
        </div>
      ) : (
        <div className="lb-table glass">
          <div className="lb-table-header">
            <span>Rank</span>
            <span>Player</span>
            <span>Region</span>
            <span>Role</span>
            <span>Difficulty</span>
            <span>Score</span>
            <span>Date</span>
          </div>
          {entries.map((e, i) => (
            <div
              key={e.id}
              className={`lb-table-row${e.username === user?.username ? ' own-row' : ''}${i < 3 ? ` top-${i + 1}` : ''}`}
            >
              <span className="lb-rank">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <span className="lb-player">{e.username}</span>
              <span className="lb-region">{REGIONS[e.region]?.flag || '🌐'} {REGIONS[e.region]?.name || e.region}</span>
              <span className="lb-role">{e.role}</span>
              <span className={`lb-diff diff-${e.difficulty}`}>{e.difficulty}</span>
              <span className={`lb-score-val ${e.overall >= 85 ? 'high' : e.overall >= 70 ? 'mid' : 'low'}`}>
                {e.overall}
              </span>
              <span className="lb-date">
                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
