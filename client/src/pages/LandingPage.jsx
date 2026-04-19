import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
const WorldMap = lazy(() => import('../components/WorldMap'));
import DifficultySelector from '../components/DifficultySelector';
import LeaderboardPreview from '../components/LeaderboardPreview';
import { REGIONS } from '../data/regions';
import { setPendingSession, getResume } from '../utils/storage';
import { isValidJobTitle } from '../utils/validation';
import { getCityTimeContext } from '../utils/maps';

export default function LandingPage({ user }) {
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem('wr_selected_region') || null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [showSetup, setShowSetup] = useState(() => !!localStorage.getItem('wr_selected_region'));
  const [timeData, setTimeData] = useState({});
  const navigate = useNavigate();

  const canBegin = selectedRegion && isValidJobTitle(role);
  const region = selectedRegion ? REGIONS[selectedRegion] : null;

  useEffect(() => {
    localStorage.removeItem('wr_selected_region');
  }, []);

  useEffect(() => {
    if (!selectedRegion || !REGIONS[selectedRegion]) { setTimeData({}); return; }
    const r = REGIONS[selectedRegion];
    getCityTimeContext(r.lat, r.lon, r.name).then(d => setTimeData(d || {}));
  }, [selectedRegion]);

  function handleSelectRegion(key) {
    localStorage.removeItem('wr_selected_region');
    setSelectedRegion(key);
    setShowSetup(true);
  }

  function handleBegin() {
    if (!canBegin) return;
    const resumeText = user?.userId ? getResume(user.userId) : '';
    setPendingSession({ region: selectedRegion, role: role.trim(), company: company.trim(), difficulty, resumeText, timeContext: timeData.contextString || '', timeOfDay: timeData.timeOfDay || '', timeStr: timeData.timeStr || '', isWeekend: timeData.isWeekend || false });
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

          {/* No region selected — hint */}
          {!region && (
            <div style={{
              background: 'rgba(5,21,37,0.6)',
              border: '1px solid rgba(0,210,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🌍</div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>
                Click a city pin on the globe or choose a room from the right panel to see your interviewer's current mood.
              </p>
            </div>
          )}

          {/* Mood card — shown when region is selected and time loaded */}
          {region && timeData.contextString && (
            <div style={{
              background: 'rgba(5,21,37,0.85)',
              border: '1px solid rgba(0,210,255,0.2)',
              borderRadius: '12px',
              padding: '18px',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{
                fontSize: '10px', letterSpacing: '2.5px', color: '#00d2ff',
                fontFamily: 'var(--font-display)', fontWeight: 600,
                textTransform: 'uppercase', marginBottom: '12px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ffcc', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Live Room Context
              </div>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.7, margin: 0, fontStyle: 'italic',
              }}>
                {timeData.contextString}
              </p>
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
