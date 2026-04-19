import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
const WorldMap = lazy(() => import('../components/WorldMap'));
import DifficultySelector from '../components/DifficultySelector';
import LeaderboardPreview from '../components/LeaderboardPreview';
import { REGIONS } from '../data/regions';
import { setPendingSession } from '../utils/storage';
import { isValidJobTitle } from '../utils/validation';

export default function LandingPage({ user }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [showSetup, setShowSetup] = useState(false);
  const navigate = useNavigate();

  const canBegin = selectedRegion && isValidJobTitle(role);
  const region = selectedRegion ? REGIONS[selectedRegion] : null;

  function handleSelectRegion(key) {
    setSelectedRegion(key);
    setShowSetup(true);
  }

  function handleBegin() {
    if (!canBegin) return;
    setPendingSession({ region: selectedRegion, role: role.trim(), company: company.trim(), difficulty });
    navigate('/interview');
  }

  return (
    <div className="landing-page">
      {/* Slogan banner */}
      <div className="slogan-banner">
        <span className="slogan-text">
          "In a world where everyone is interview ready, the candidates who stand out will be the ones who are{' '}
          <span className="slogan-highlight">World-Ready</span>."
        </span>
      </div>

      {/* Main layout: globe + side panels */}
      <div className="landing-layout">
        {/* Left panel */}
        <aside className="landing-left-panel">
          {/* Header */}
          <div className="panel-section">
            <h1 className="panel-title">
              <span className="globe-icon-sm">🌐</span>
              <span className="gradient-text">World Ready</span>
            </h1>
            <p className="panel-sub">
              {region
                ? `You selected ${region.name}. Now configure your session.`
                : 'Click a pin on the globe to select your interview location.'}
            </p>
          </div>

          {/* Selected region card */}
          {region && (
            <div className="selected-region-card glass-panel">
              <div className="src-top">
                <span className="src-flag">{region.flag}</span>
                <div>
                  <div className="src-name">{region.name}</div>
                  <div className="src-interviewer">{region.interviewer}</div>
                  <div className="src-title">{region.title}</div>
                </div>
                <button className="src-clear" onClick={() => { setSelectedRegion(null); setShowSetup(false); }} title="Change region">✕</button>
              </div>
              <span className="style-badge">{region.styleTag}</span>
              <p className="src-desc">{region.styleDesc}</p>
              <div className="personality-traits">
                {region.personalityTraits?.map(t => (
                  <span key={t} className="trait-pill">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Region grid fallback if no pin clicked */}
          {!region && (
            <div className="region-grid-compact">
              {Object.entries(REGIONS).map(([key, r]) => (
                <button
                  key={key}
                  className={`region-chip${selectedRegion === key ? ' selected' : ''}`}
                  onClick={() => handleSelectRegion(key)}
                  type="button"
                >
                  <span>{r.flag}</span>
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Setup form */}
          {showSetup && region && (
            <div className="setup-form glass-panel">
              <div className="form-group">
                <label className="form-label" htmlFor="role">Job Title *</label>
                <input id="role" type="text" className="form-input"
                  placeholder="e.g. Software Engineer, Product Manager…"
                  value={role} onChange={e => setRole(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="company">
                  Target Company <span className="optional">(optional)</span>
                </label>
                <input id="company" type="text" className="form-input"
                  placeholder="e.g. Google, Deloitte…"
                  value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
              <button
                className={`begin-btn${canBegin ? ' active' : ' disabled'}`}
                onClick={handleBegin}
                disabled={!canBegin}
                type="button"
              >
                {canBegin
                  ? `Enter ${region.name} ${region.flag}`
                  : 'Enter your job title to begin'}
              </button>
            </div>
          )}

          <LeaderboardPreview />
        </aside>

        {/* Globe */}
        <div className="globe-stage">
          <Suspense fallback={<div className="globe-loading">Loading globe…</div>}>
            <WorldMap selectedRegion={selectedRegion} onSelectRegion={handleSelectRegion} />
          </Suspense>
        </div>

        {/* Right panel */}
        <aside className="landing-right-panel">
          {user && (
            <div className="welcome-card glass-panel">
              <div className="wc-top">
                <span className="welcome-avatar">{user.name?.[0]?.toUpperCase()}</span>
                <div>
                  <div className="welcome-name">{user.name?.split(' ')[0]}</div>
                  <div className="welcome-role">Ready to practice</div>
                </div>
              </div>
            </div>
          )}

          <div className="regions-overview glass-panel">
            <h3 className="panel-section-title">Interview Rooms</h3>
            {Object.entries(REGIONS).map(([key, r]) => (
              <button
                key={key}
                className={`region-row${selectedRegion === key ? ' selected' : ''}`}
                onClick={() => handleSelectRegion(key)}
              >
                <span className="rr-flag">{r.flag}</span>
                <div className="rr-info">
                  <span className="rr-name">{r.name}</span>
                  <span className="rr-style">{r.styleTag}</span>
                </div>
                <span className="rr-arrow">→</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
