import { REGIONS } from '../data/regions';

const ALL_BADGES = [
  { id: 'first_interview', icon: '🎤', label: 'First Interview', desc: 'Completed your first session', check: h => h.length >= 1 },
  { id: 'globe_trotter', icon: '✈️', label: 'Globe Trotter', desc: 'Interviewed in 3+ regions', check: h => new Set(h.map(s => s.region)).size >= 3 },
  { id: 'global_explorer', icon: '🗺️', label: 'Global Explorer', desc: 'Completed all 8 regions', check: h => new Set(h.map(s => s.region)).size >= Object.keys(REGIONS).length },
  { id: 'high_scorer', icon: '⭐', label: 'High Scorer', desc: 'Scored 85+ overall', check: h => h.some(s => s.overall >= 85) },
  { id: 'perfect', icon: '💎', label: 'Diamond', desc: 'Scored 95+ overall', check: h => h.some(s => s.overall >= 95) },
  { id: 'speed_demon', icon: '⚡', label: 'Speed Demon', desc: 'Completed a Hard interview', check: h => h.some(s => s.difficulty === 'hard') },
  { id: 'consistent', icon: '🔥', label: 'On Fire', desc: 'Completed 5 interviews', check: h => h.length >= 5 },
  { id: 'world_ready', icon: '🌐', label: 'World Ready', desc: 'Completed 10 interviews', check: h => h.length >= 10 },
];

export default function BadgeSystem({ history }) {
  const earned = ALL_BADGES.filter(b => b.check(history));
  const locked = ALL_BADGES.filter(b => !b.check(history));

  return (
    <div className="badge-system">
      {earned.length > 0 && (
        <>
          <h4 className="badge-section-title">Earned Badges</h4>
          <div className="badge-grid">
            {earned.map(b => (
              <div key={b.id} className="badge earned" title={b.desc}>
                <span className="badge-icon">{b.icon}</span>
                <span className="badge-label">{b.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {locked.length > 0 && (
        <>
          <h4 className="badge-section-title muted">Locked</h4>
          <div className="badge-grid">
            {locked.map(b => (
              <div key={b.id} className="badge locked" title={b.desc}>
                <span className="badge-icon">🔒</span>
                <span className="badge-label">{b.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
