import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Globe from '../components/Globe'
import DifficultySelector from '../components/DifficultySelector'
import LeaderboardPreview from '../components/LeaderboardPreview'
import { REGIONS } from '../data/regions'
import { setPendingSession } from '../utils/storage'
import { isValidJobTitle } from '../utils/validation'
import { getCityTimeContext } from '../utils/maps'

export default function LandingPage({ user }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [cityContext, setCityContext] = useState(null)
  const navigate = useNavigate()

  const canBegin = selectedRegion && isValidJobTitle(role)
  const region = selectedRegion ? REGIONS[selectedRegion] : null

  useEffect(() => {
    if (!selectedRegion || !region) { setCityContext(null); return }
    getCityTimeContext(region.lat, region.lon, region.name).then(setCityContext)
  }, [selectedRegion])

  function handleSelectRegion(key) { setSelectedRegion(key) }

  function handleBegin() {
    if (!canBegin) return
    setPendingSession({
      region: selectedRegion, role: role.trim(),
      company: company.trim(), difficulty,
      timeContext: cityContext?.contextString || '',
    })
    navigate('/interview')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

      {/* Slogan */}
      <div style={{ textAlign: 'center', padding: '12px 24px 0' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "In a world where everyone is interview ready, the candidates who stand out will be the ones who are{' '}
          <span style={{ color: 'var(--cyan)', fontStyle: 'normal', fontWeight: 600 }}>World-Ready</span>."
        </span>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 280px',
        flex: 1,
        height: 'calc(100vh - 85px)',
        padding: '12px 24px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        overflow: 'hidden',
      }}>

        {/* ── Left panel ── */}
        <aside style={{
          display: 'flex', flexDirection: 'column',
          gap: '12px', overflowY: 'auto', paddingRight: '16px',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '22px', display: 'flex', alignItems: 'center',
              gap: '8px', marginBottom: '6px',
            }}>
              <span>🌐</span>
              <span className="gradient-text">World Ready</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {region
                ? `You selected ${region.name}. Configure your session.`
                : 'Click a pin on the globe or select a room on the right.'}
            </p>
          </div>

          {/* Selected region card */}
          {region && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{region.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{region.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>{region.interviewer}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{region.title}</div>
                </div>
                <button
                  onClick={() => { setSelectedRegion(null); setCityContext(null) }}
                  style={{
                    background: 'transparent', border: '1px solid var(--cyan-border)',
                    color: 'var(--text-muted)', width: '22px', height: '22px',
                    borderRadius: '50%', cursor: 'pointer', fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>

              <span style={{
                display: 'inline-block', padding: '2px 10px',
                background: 'rgba(0,210,255,0.08)', border: '1px solid var(--cyan-border)',
                borderRadius: '999px', fontSize: '10px', color: 'var(--cyan)',
                letterSpacing: '1px', fontFamily: 'var(--font-display)',
              }}>{region.styleTag}</span>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{region.styleDesc}</p>

              {cityContext?.timeStr && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px',
                  background: 'rgba(0,210,255,0.06)',
                  border: '1px solid var(--cyan-border)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--cyan-glow)',
                    boxShadow: '0 0 6px var(--cyan-glow)',
                    animation: 'pulse 2s infinite', flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '11px', color: 'var(--cyan)',
                    fontFamily: 'var(--font-display)', letterSpacing: '1px',
                  }}>
                    {cityContext.timeStr} · {cityContext.timezone}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {region.personalityTraits?.map(t => (
                  <span key={t} style={{
                    padding: '2px 8px',
                    background: 'rgba(196,114,240,0.08)',
                    border: '1px solid var(--violet-border)',
                    borderRadius: '999px', fontSize: '10px', color: 'var(--violet)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Setup form — only when region selected */}
          {region && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '11px', color: 'var(--text-muted)',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                }}>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer…"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBegin()}
                  autoFocus
                  style={{
                    background: 'rgba(0,210,255,0.04)',
                    border: '1px solid var(--cyan-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: 'var(--text-primary)', fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  fontSize: '11px', color: 'var(--text-muted)',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                }}>
                  Target Company{' '}
                  <span style={{ fontStyle: 'italic', textTransform: 'none' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Deloitte…"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  style={{
                    background: 'rgba(0,210,255,0.04)',
                    border: '1px solid var(--cyan-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: 'var(--text-primary)', fontSize: '14px',
                  }}
                />
              </div>

              <DifficultySelector value={difficulty} onChange={setDifficulty} />

              <button
                onClick={handleBegin}
                disabled={!canBegin}
                style={{
                  width: '100%', padding: '13px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '14px', letterSpacing: '2px',
                  textTransform: 'uppercase', border: 'none',
                  cursor: canBegin ? 'pointer' : 'not-allowed',
                  background: canBegin ? 'var(--cyan)' : 'var(--bg-secondary)',
                  color: canBegin ? 'var(--bg-primary)' : 'var(--text-muted)',
                  transition: 'all var(--transition-normal)',
                }}
              >
                {canBegin ? `Enter ${region.name} ${region.flag}` : 'Enter your job title to begin'}
              </button>
            </div>
          )}

          <LeaderboardPreview />
        </aside>

        {/* ── Globe center ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Globe
            size={500}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
          <p style={{
            marginTop: '12px', fontSize: '11px',
            color: 'var(--text-muted)', letterSpacing: '1px', fontStyle: 'italic',
          }}>
            Click a pin to select your interview room
          </p>
        </div>

        {/* ── Right panel ── */}
        <aside style={{
          display: 'flex', flexDirection: 'column',
          gap: '16px', paddingLeft: '16px', overflowY: 'auto',
        }}>
          {user && (
            <div className="glass-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '18px', color: 'var(--bg-primary)',
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>
                    {user.name?.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ready to practice</div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '11px',
              fontWeight: 600, letterSpacing: '3px',
              color: 'var(--text-muted)', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Interview Rooms
            </h3>
            {Object.entries(REGIONS).map(([key, r]) => (
              <button
                key={key}
                onClick={() => handleSelectRegion(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: selectedRegion === key ? 'rgba(0,210,255,0.08)' : 'transparent',
                  border: `1px solid ${selectedRegion === key ? 'var(--cyan)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)', padding: '9px 10px',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (selectedRegion !== key) {
                    e.currentTarget.style.background = 'rgba(0,210,255,0.05)'
                    e.currentTarget.style.borderColor = 'var(--cyan-border)'
                  }
                }}
                onMouseLeave={e => {
                  if (selectedRegion !== key) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{r.flag}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    color: selectedRegion === key ? 'var(--cyan)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-ui)',
                  }}>{r.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.styleTag}</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--cyan)', opacity: 0.6 }}>→</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input:focus { border-color: var(--cyan) !important; outline: none; box-shadow: 0 0 0 1px rgba(0,210,255,0.15); }
        input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  )
}