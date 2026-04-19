import { REGIONS } from '../data/regions';
import { getLeaderboard } from '../utils/storage';

export default function LeaderboardPreview() {
  const entries = getLeaderboard().slice(0, 5);

  if (entries.length === 0) {
    return (
      <div className="leaderboard-preview glass">
        <h3 className="lb-preview-title">🏆 Leaderboard</h3>
        <p className="lb-empty">No scores yet — be the first!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {entries.map((e, i) => (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 8px',
            borderRadius: 'var(--radius-sm)',
            background: i === 0 ? 'rgba(0,210,255,0.05)' : 'transparent',
            border: i === 0 ? '1px solid rgba(0,210,255,0.1)' : '1px solid transparent',
          }}>
            <span style={{ width: '20px', flexShrink: 0, fontSize: '14px' }}>
              {i < 3 ? medals[i] : `#${i + 1}`}
            </span>
            <span style={{ fontSize: '14px' }}>
              {REGIONS[e.region]?.flag || '🌐'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px', fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-ui)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {e.username}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {e.role || REGIONS[e.region]?.name}
              </div>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '14px',
              color: e.overall >= 90 ? 'var(--score-high)'
                   : e.overall >= 75 ? 'var(--cyan)'
                   : 'var(--score-mid)',
            }}>
              {e.overall}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}