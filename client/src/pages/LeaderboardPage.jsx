import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../utils/storage';
import { REGIONS } from '../data/regions';

const HARDCODED = [
  { id: 'hc1',  username: 'alexchen_sf',    region: 'newyork', role: 'Product Manager',       difficulty: 'hard',   overall: 97, date: '2026-04-10' },
  { id: 'hc2',  username: 'priya_dev',       region: 'mumbai',  role: 'Software Engineer',     difficulty: 'hard',   overall: 94, date: '2026-04-12' },
  { id: 'hc3',  username: 'tanaka_hiroshi',  region: 'tokyo',   role: 'Senior Engineer',        difficulty: 'hard',   overall: 91, date: '2026-04-08' },
  { id: 'hc4',  username: 'sophiemrt',       region: 'paris',   role: 'UX Designer',            difficulty: 'hard',   overall: 89, date: '2026-04-14' },
  { id: 'hc5',  username: 'omar_global',     region: 'dubai',   role: 'Business Analyst',       difficulty: 'hard',   overall: 88, date: '2026-04-11' },
  { id: 'hc6',  username: 'james_lb',        region: 'london',  role: 'Data Scientist',         difficulty: 'hard',   overall: 86, date: '2026-04-09' },
  { id: 'hc7',  username: 'chloe_aus',       region: 'sydney',  role: 'Engineering Manager',    difficulty: 'medium', overall: 85, date: '2026-04-13' },
  { id: 'hc8',  username: 'wei_zhang99',     region: 'beijing', role: 'Operations Lead',        difficulty: 'hard',   overall: 83, date: '2026-04-07' },
  { id: 'hc9',  username: 'mike_nyc',        region: 'newyork', role: 'Sales Engineer',         difficulty: 'medium', overall: 81, date: '2026-04-15' },
  { id: 'hc10', username: 'anika_sharma',    region: 'mumbai',  role: 'Product Designer',       difficulty: 'medium', overall: 79, date: '2026-04-06' },
  { id: 'hc11', username: 'lena_berlin',     region: 'paris',   role: 'Marketing Manager',      difficulty: 'medium', overall: 77, date: '2026-04-16' },
  { id: 'hc12', username: 'ravi_tech',       region: 'dubai',   role: 'Cloud Architect',        difficulty: 'medium', overall: 75, date: '2026-04-05' },
  { id: 'hc13', username: 'yuki_san',        region: 'tokyo',   role: 'QA Engineer',            difficulty: 'medium', overall: 73, date: '2026-04-17' },
  { id: 'hc14', username: 'emma_syd',        region: 'sydney',  role: 'Frontend Developer',     difficulty: 'easy',   overall: 71, date: '2026-04-04' },
  { id: 'hc15', username: 'oliver_uk',       region: 'london',  role: 'DevOps Engineer',        difficulty: 'easy',   overall: 68, date: '2026-04-18' },
];

export default function LeaderboardPage({ user }) {
  const navigate = useNavigate();

  const entries = useMemo(() => {
    const live = getLeaderboard();
    const all = [...HARDCODED, ...live];
    // deduplicate by id, sort by score desc
    const seen = new Set();
    return all
      .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
      .sort((a, b) => b.overall - a.overall);
  }, []);

  return (
    <div className="leaderboard-page">
      <div className="lb-page-header">
        <h1 className="lb-page-title">🏆 Global Leaderboard</h1>
        <p className="lb-page-sub">Top scores from World Ready interview simulations worldwide</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>Take the Interview</button>
      </div>

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
            <span className="lb-player">
              {e.username === user?.username ? <strong>{e.username} 👤</strong> : e.username}
            </span>
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
    </div>
  );
}
