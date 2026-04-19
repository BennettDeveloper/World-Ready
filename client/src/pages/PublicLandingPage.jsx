import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS } from '../data/regions';
import { getCityTimeContext } from '../utils/maps';

const Globe = lazy(() => import('../components/WorldMap'));

const REGION_LIST = Object.entries(REGIONS);

const REVIEWS = [
  {
    name: 'Marcus T.',
    role: 'Software Engineer',
    region: 'Tokyo',
    flag: '🇯🇵',
    stars: 5,
    text: '"I walked in calm and composed. I got the offer. This app is the real deal."',
  },
  {
    name: 'Amara O.',
    role: 'Product Manager',
    region: 'London',
    flag: '🇬🇧',
    stars: 5,
    text: '"After practicing with James Whitmore for two weeks, my actual London panel felt easy by comparison."',
  },
  {
    name: 'Jordan K.',
    role: 'Business Development',
    region: 'New York',
    flag: '🇺🇸',
    stars: 5,
    text: '"After two weeks I could deliver tight, metrics-backed answers under pressure. Got the offer same day."',
  },
];

const STEPS = [
  { num: '01', icon: '🌍', title: 'Select your room', desc: 'Pick a city. Meet your interviewer. Each room has a unique persona, culture, and style.' },
  { num: '02', icon: '💼', title: 'Enter your role', desc: 'Tell us the job you\'re after. Optionally add a target company for tailored questions.' },
  { num: '03', icon: '🎯', title: 'Face the interview', desc: 'AI evaluates cultural fluency, clarity, confidence, and role alignment — then coaches you.' },
];

const styles = {
  page: {
    background: '#020d1a',
    minHeight: '100vh',
    width: '100%',
    alignSelf: 'stretch',
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#fff',
    overflowX: 'hidden',
  },

  // NAV
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 48px',
    height: '64px',
    background: 'rgba(2,13,26,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0,210,255,0.1)',
  },
  navLogo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '18px',
    color: '#00d2ff',
    letterSpacing: '0.5px',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  navLinks: {
    display: 'flex', alignItems: 'center', gap: '32px',
  },
  navLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px', fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    background: 'none', border: 'none', padding: 0,
  },
  navCta: {
    background: 'rgba(0,210,255,0.12)',
    border: '1px solid rgba(0,210,255,0.35)',
    borderRadius: '8px',
    color: '#00d2ff',
    padding: '8px 20px',
    fontSize: '14px', fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // HERO
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: '64px',
  },
  heroGrid: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(rgba(10,58,90,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(10,58,90,0.3) 1px, transparent 1px)',
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  heroGlow: {
    position: 'absolute', top: '10%', left: '30%',
    width: '600px', height: '600px',
    background: 'radial-gradient(ellipse, rgba(0,210,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  heroGlow2: {
    position: 'absolute', bottom: '10%', right: '10%',
    width: '400px', height: '400px',
    background: 'radial-gradient(ellipse, rgba(196,114,240,0.06) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  heroContent: {
    position: 'relative', zIndex: 2,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 48px',
    gap: '0',
  },
  heroLeft: {
    flex: '0 0 480px',
    maxWidth: '480px',
    zIndex: 3,
  },
  heroLabel: {
    fontSize: '11px',
    letterSpacing: '3px',
    color: '#00d2ff',
    textTransform: 'uppercase',
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    marginBottom: '24px',
    display: 'block',
  },
  heroH1: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: '56px',
    lineHeight: 1.05,
    margin: 0,
    marginBottom: '24px',
  },
  heroH1Line1: {
    display: 'block',
    color: '#fff',
  },
  heroH1Line2: {
    display: 'block',
    background: 'linear-gradient(90deg, #00d2ff, #c472f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '17px',
    lineHeight: 1.6,
    marginBottom: '40px',
    fontWeight: 400,
  },
  heroCtas: {
    display: 'flex', gap: '16px', alignItems: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #00d2ff, #0099cc)',
    border: 'none',
    borderRadius: '10px',
    color: '#020d1a',
    padding: '14px 28px',
    fontSize: '15px', fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.3px',
    boxShadow: '0 0 30px rgba(0,210,255,0.3)',
    transition: 'all 0.2s',
  },
  btnGhost: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.7)',
    padding: '14px 28px',
    fontSize: '15px', fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    transition: 'all 0.2s',
  },

  // GLOBE STAGE
  heroGlobeWrap: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: '600px',
  },

  // TIME BADGES
  timeBadgesContainer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 4,
  },
  timeBadge: {
    position: 'absolute',
    background: 'rgba(5,21,37,0.9)',
    border: '1px solid rgba(0,210,255,0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    display: 'flex', alignItems: 'center', gap: '8px',
    backdropFilter: 'blur(10px)',
    animation: 'fadeInFloat 0.6s ease forwards',
    boxShadow: '0 4px 20px rgba(0,210,255,0.1)',
  },
  timeBadgeCity: {
    fontSize: '12px', fontWeight: 600,
    color: '#fff',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  timeBadgeDot: {
    width: '3px', height: '3px',
    borderRadius: '50%', background: 'rgba(0,210,255,0.6)',
  },
  timeBadgeTime: {
    fontSize: '12px', fontWeight: 500,
    color: '#00d2ff',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  // SECTION COMMON
  section: {
    padding: '100px 48px',
    position: 'relative',
  },
  sectionLabel: {
    fontSize: '11px', letterSpacing: '3px',
    color: '#00d2ff', textTransform: 'uppercase',
    fontWeight: 600, fontFamily: "'Syne', sans-serif",
    marginBottom: '12px', display: 'block',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: '40px',
    color: '#fff', textAlign: 'center',
    margin: '0 0 60px',
    lineHeight: 1.1,
  },

  // ROOMS SECTION
  roomsDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.2), transparent)',
    margin: '0 48px',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  roomCard: {
    background: 'rgba(5,21,37,0.85)',
    border: '1px solid rgba(0,210,255,0.15)',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
  roomCardFlag: {
    fontSize: '36px', display: 'block', marginBottom: '12px',
  },
  roomCardCity: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700, fontSize: '18px',
    color: '#fff', marginBottom: '4px',
  },
  roomCardInterviewer: {
    fontSize: '13px', color: 'rgba(255,255,255,0.5)',
    marginBottom: '12px',
  },
  roomCardBadge: {
    display: 'inline-block',
    background: 'rgba(0,210,255,0.1)',
    border: '1px solid rgba(0,210,255,0.25)',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '10px', fontWeight: 600,
    color: '#00d2ff', letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  roomCardTime: {
    fontSize: '12px', color: 'rgba(255,255,255,0.4)',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  roomCardPreview: {
    marginTop: '12px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },

  // HOW IT WORKS
  howSection: {
    padding: '100px 48px',
    background: 'rgba(0,210,255,0.02)',
    borderTop: '1px solid rgba(0,210,255,0.08)',
    borderBottom: '1px solid rgba(0,210,255,0.08)',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
  },
  stepConnector: {
    position: 'absolute',
    top: '40px', left: '33%', right: '33%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.3), transparent)',
    pointerEvents: 'none',
  },
  stepCard: {
    background: 'rgba(5,21,37,0.85)',
    border: '1px solid rgba(0,210,255,0.15)',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    backdropFilter: 'blur(20px)',
    position: 'relative',
  },
  stepNum: {
    position: 'absolute', top: '16px', right: '20px',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: '11px',
    color: 'rgba(0,210,255,0.3)',
    letterSpacing: '1px',
  },
  stepIcon: {
    fontSize: '36px', display: 'block', marginBottom: '16px',
  },
  stepTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700, fontSize: '16px',
    color: '#fff', marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '13px', color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.6,
  },

  // REVIEWS
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  reviewCard: {
    background: 'rgba(5,21,37,0.85)',
    border: '1px solid rgba(196,114,240,0.15)',
    borderRadius: '16px',
    padding: '28px',
    backdropFilter: 'blur(20px)',
  },
  reviewStars: {
    color: '#f59e0b', fontSize: '14px',
    marginBottom: '16px', display: 'block',
    letterSpacing: '2px',
  },
  reviewText: {
    fontSize: '14px', color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7, marginBottom: '20px',
    fontStyle: 'italic',
  },
  reviewAuthor: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  reviewAvatar: {
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(196,114,240,0.2))',
    border: '1px solid rgba(0,210,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 700, color: '#00d2ff',
    fontFamily: "'Syne', sans-serif",
  },
  reviewName: {
    fontSize: '13px', fontWeight: 600, color: '#fff',
  },
  reviewMeta: {
    fontSize: '11px', color: 'rgba(255,255,255,0.4)',
  },

  // FINAL CTA
  ctaSection: {
    padding: '120px 48px',
    textAlign: 'center',
    background: 'rgba(0,210,255,0.02)',
    borderTop: '1px solid rgba(0,210,255,0.08)',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px', height: '300px',
    background: 'radial-gradient(ellipse, rgba(0,210,255,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaSub: {
    fontSize: '16px', color: 'rgba(255,255,255,0.5)',
    marginBottom: '16px', letterSpacing: '0.3px',
    position: 'relative', zIndex: 1,
  },
  ctaTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: '42px',
    color: '#fff',
    marginBottom: '40px',
    lineHeight: 1.15,
    position: 'relative', zIndex: 1,
  },
  ctaTitleHighlight: {
    background: 'linear-gradient(90deg, #00d2ff, #c472f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  // FOOTER
  footer: {
    padding: '32px 48px',
    borderTop: '1px solid rgba(0,210,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
};

// Badge positions around the globe (percentage-based)
const BADGE_POSITIONS = [
  { key: 'london',   top: '18%', left: '8%' },
  { key: 'paris',    top: '22%', left: '16%' },
  { key: 'dubai',    top: '38%', left: '6%' },
  { key: 'mumbai',   top: '52%', left: '14%' },
  { key: 'tokyo',    top: '20%', right: '8%' },
  { key: 'beijing',  top: '30%', right: '16%' },
  { key: 'sydney',   top: '68%', right: '8%' },
  { key: 'newyork',  top: '60%', left: '4%' },
];

export default function PublicLandingPage({ user }) {
  const navigate = useNavigate();
  const [cityTimes, setCityTimes] = useState({});
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const roomsRef = useRef(null);

  useEffect(() => {
    async function loadTimes() {
      const results = {};
      await Promise.all(
        REGION_LIST.map(async ([key, r]) => {
          const data = await getCityTimeContext(r.lat, r.lon, r.name);
          results[key] = data.timeStr;
        })
      );
      setCityTimes(results);
    }
    loadTimes();
    const interval = setInterval(loadTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleBegin() {
    navigate(user ? '/home' : '/login');
  }

  function scrollToRooms() {
    roomsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function selectRoom(key) {
    localStorage.setItem('wr_selected_region', key);
    navigate(user ? '/home' : '/login');
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeInFloat {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0,210,255,0.3); }
          50%       { box-shadow: 0 0 50px rgba(0,210,255,0.5); }
        }
        .wr-room-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(0,210,255,0.35) !important;
          box-shadow: 0 16px 40px rgba(0,210,255,0.12) !important;
        }
        .wr-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(0,210,255,0.45) !important;
        }
        .wr-btn-ghost:hover {
          border-color: rgba(255,255,255,0.4) !important;
          color: #fff !important;
        }
        .wr-nav-link:hover { color: #fff !important; }
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span>🌐</span>
          <span>World Ready</span>
        </div>
        <div style={styles.navLinks}>
          <button className="wr-nav-link" style={styles.navLink} onClick={scrollToRooms}>Rooms</button>
          <button className="wr-nav-link" style={styles.navLink} onClick={() => navigate('/about')}>About</button>
          <button className="wr-nav-link" style={styles.navLink} onClick={() => navigate('/leaderboard')}>Leaderboard</button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <button className="wr-btn-primary" style={styles.btnPrimary} onClick={() => navigate('/home')}>
              Open App →
            </button>
          ) : (
            <>
              <button className="wr-nav-link" style={styles.navLink} onClick={() => navigate('/login')}>Sign In</button>
              <button className="wr-btn-primary" style={{ ...styles.navCta }} onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroGrid} />
        <div style={styles.heroGlow} />
        <div style={styles.heroGlow2} />

        <div style={styles.heroContent}>
          {/* Left copy */}
          <div style={styles.heroLeft}>
            <span style={styles.heroLabel}>World Ready · AI Interview Simulator</span>
            <h1 style={styles.heroH1}>
              <span style={styles.heroH1Line1}>Culture isn't a<br />bonus question.</span>
              <span style={styles.heroH1Line2}>It's the whole test.</span>
            </h1>
            <p style={styles.heroSub}>
              8 cities. 8 interviewers. One AI that knows exactly what time it is in the room.
            </p>
            <div style={styles.heroCtas}>
              <button className="wr-btn-primary" style={styles.btnPrimary} onClick={handleBegin}>
                Begin Your Interview →
              </button>
              <button className="wr-btn-ghost" style={styles.btnGhost} onClick={scrollToRooms}>
                See the rooms ↓
              </button>
            </div>
          </div>

          {/* Globe + time badges */}
          <div style={styles.heroGlobeWrap}>
            {/* Time badges */}
            <div style={styles.timeBadgesContainer}>
              {BADGE_POSITIONS.map(({ key, ...pos }, i) => {
                const r = REGIONS[key];
                const time = cityTimes[key];
                if (!r || !time) return null;
                return (
                  <div
                    key={key}
                    style={{
                      ...styles.timeBadge,
                      ...pos,
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{r.flag}</span>
                    <span style={styles.timeBadgeCity}>{r.name}</span>
                    <div style={styles.timeBadgeDot} />
                    <span style={styles.timeBadgeTime}>{time}</span>
                  </div>
                );
              })}
            </div>

            <Suspense fallback={
              <div style={{
                width: 620, height: 540,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(0,210,255,0.4)', fontSize: '14px',
              }}>
                Loading globe…
              </div>
            }>
              <Globe selectedRegion={null} onSelectRegion={() => {}} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ROOMS */}
      <div style={styles.roomsDivider} />
      <section ref={roomsRef} style={styles.section}>
        <span style={styles.sectionLabel}>Interview Rooms</span>
        <h2 style={styles.sectionTitle}>Choose Your Room</h2>
        <div style={styles.roomsGrid}>
          {REGION_LIST.map(([key, r]) => (
            <div
              key={key}
              className="wr-room-card"
              style={styles.roomCard}
              onClick={() => selectRoom(key)}
              onMouseEnter={() => setHoveredRoom(key)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              <span style={styles.roomCardFlag}>{r.flag}</span>
              <div style={styles.roomCardCity}>{r.name}</div>
              <div style={styles.roomCardInterviewer}>{r.interviewer}</div>
              <span style={styles.roomCardBadge}>{r.styleTag}</span>
              {cityTimes[key] && (
                <div style={styles.roomCardTime}>
                  🕐 Local time: {cityTimes[key]}
                </div>
              )}
              {hoveredRoom === key && (
                <div style={styles.roomCardPreview}>
                  {r.personality.split('.')[0]}.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.howSection}>
        <span style={styles.sectionLabel}>The Process</span>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.num} style={styles.stepCard}>
              <span style={styles.stepNum}>{step.num}</span>
              <span style={styles.stepIcon}>{step.icon}</span>
              <div style={styles.stepTitle}>{step.title}</div>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={styles.section}>
        <span style={styles.sectionLabel}>What People Say</span>
        <h2 style={styles.sectionTitle}>Real Prep. Real Offers.</h2>
        <div style={styles.reviewsGrid}>
          {REVIEWS.map((r) => (
            <div key={r.name} style={styles.reviewCard}>
              <span style={styles.reviewStars}>{'★'.repeat(r.stars)}</span>
              <p style={styles.reviewText}>{r.text}</p>
              <div style={styles.reviewAuthor}>
                <div style={styles.reviewAvatar}>{r.name[0]}</div>
                <div>
                  <div style={styles.reviewName}>{r.name}</div>
                  <div style={styles.reviewMeta}>{r.role} · {r.flag} {r.region}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <p style={styles.ctaSub}>In a world where everyone is interview ready,</p>
        <h2 style={styles.ctaTitle}>
          the candidates who stand out will be the ones<br />
          who are <span style={styles.ctaTitleHighlight}>World-Ready.</span>
        </h2>
        <button className="wr-btn-primary" style={{ ...styles.btnPrimary, fontSize: '16px', padding: '16px 36px', position: 'relative', zIndex: 1 }} onClick={handleBegin}>
          Begin Your Interview →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'rgba(0,210,255,0.4)', fontSize: '14px' }}>
          🌐 World Ready
        </div>
        <div>HornetHacks 2026 · Built with Claude AI + Google Maps</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button style={{ ...styles.navLink, fontSize: '13px' }} onClick={() => navigate('/about')}>About</button>
          <button style={{ ...styles.navLink, fontSize: '13px' }} onClick={() => navigate('/login')}>Sign In</button>
        </div>
      </footer>
    </div>
  );
}
