import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BadgeSystem from '../components/BadgeSystem';
import SessionCard from '../components/SessionCard';
import { getHistory } from '../utils/storage';
import { REGIONS } from '../data/regions';

export default function ProfilePage({ user }) {
  const navigate = useNavigate();
  const history = useMemo(() => (user ? getHistory(user.userId) : []), [user]);

  if (!user) {
    navigate('/');
    return null;
  }

  const totalSessions = history.length;
  const avgScore = totalSessions > 0 ? Math.round(history.reduce((s, h) => s + (h.overall || 0), 0) / totalSessions) : 0;
  const bestScore = totalSessions > 0 ? Math.max(...history.map(h => h.overall || 0)) : 0;
  const regionsExplored = new Set(history.map(h => h.region)).size;
  const recentScores = history.slice(0, 10).reverse();

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-header glass">
        <div className="profile-avatar">{user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/home')}>Start Interview</button>
      </div>

      {/* Stats row */}
      <div className="profile-stats">
        {[
          { label: 'Sessions', value: totalSessions, icon: '🎤' },
          { label: 'Avg Score', value: avgScore || '—', icon: '📊' },
          { label: 'Best Score', value: bestScore || '—', icon: '⭐' },
          { label: 'Regions', value: `${regionsExplored} / ${Object.keys(REGIONS).length}`, icon: '🌍' },
        ].map(s => (
          <div key={s.label} className="profile-stat glass">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-val">{s.value}</span>
            <span className="stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      {recentScores.length > 0 && (
        <div className="profile-chart glass">
          <h2 className="section-title">Progress Over Time</h2>
          <div className="chart-bars">
            {recentScores.map((s, i) => (
              <div key={i} className="chart-bar-col">
                <div className="chart-bar-label">{s.overall}</div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      height: `${s.overall}%`,
                      background: s.overall >= 85 ? 'linear-gradient(#22c55e,#00d4ff)' :
                        s.overall >= 70 ? 'linear-gradient(#00d4ff,#7c3aed)' :
                          'linear-gradient(#f59e0b,#ef4444)',
                    }}
                  />
                </div>
                <div className="chart-bar-flag">{REGIONS[s.region]?.flag || '🌐'}</div>
              </div>
            ))}
          </div>
          <p className="chart-hint">Last {recentScores.length} interview{recentScores.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Badges */}
      <div className="profile-badges glass">
        <h2 className="section-title">Achievements</h2>
        <BadgeSystem history={history} />
      </div>

      {/* Session history */}
      <div className="profile-history">
        <h2 className="section-title">Past Sessions</h2>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No interviews yet. <button className="auth-link" onClick={() => navigate('/home')}>Start your first one!</button></p>
          </div>
        ) : (
          history.map(s => <SessionCard key={s.id} session={s} />)
        )}
      </div>
    </div>
  );
}
