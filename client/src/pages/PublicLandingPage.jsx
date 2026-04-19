import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS } from '../data/regions';
import { getCityTimeContext } from '../utils/maps';

const GlobeComponent = lazy(() => import('../components/WorldMap'));

const REGION_LIST = Object.entries(REGIONS);

const REVIEWS = [
  {
    name: 'Marcus T.',
    role: 'Software Engineer',
    region: 'Tokyo',
    flag: '🇯🇵',
    text: '"I walked in calm and composed. I got the offer. This app is the real deal."',
  },
  {
    name: 'Amara O.',
    role: 'Product Manager',
    region: 'London',
    flag: '🇬🇧',
    text: '"After practicing with James Whitmore for two weeks, my actual London panel felt easy by comparison."',
  },
  {
    name: 'Jordan K.',
    role: 'Business Development',
    region: 'New York',
    flag: '🇺🇸',
    text: '"After two weeks I could deliver tight, metrics-backed answers under pressure. Got the offer same day."',
  },
];

const STEPS = [
  { num: '01', icon: '🌍', title: 'Select your room', desc: 'Pick a city. Meet your interviewer. Each room has a unique persona, culture, and communication style.' },
  { num: '02', icon: '💼', title: 'Enter your role', desc: 'Tell us the job you\'re after. Optionally add a target company for tailored questions.' },
  { num: '03', icon: '🎯', title: 'Face the interview', desc: 'AI evaluates cultural fluency, clarity, confidence, and role alignment — then coaches you toward the offer.' },
];

// Canvas particle + radar background
function useCanvas(canvasRef) {
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const sweepAngleRef = useRef(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight * 3;

    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.3,
    }));
  }, [canvasRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Radial grid — centered at top third (hero area)
    const cx = W / 2;
    const cy = H * 0.15;
    const maxR = Math.max(W, H * 0.4);
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (maxR / 5) * i, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,210,255,${0.025 - i * 0.003})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = 'rgba(0,210,255,0.018)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Radar sweep
    sweepAngleRef.current += 0.006;
    const sweepGrad = ctx.createConicalGradient
      ? null
      : null;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweepAngleRef.current);
    const grad = ctx.createLinearGradient(0, 0, maxR * 0.6, 0);
    grad.addColorStop(0, 'rgba(0,210,255,0.07)');
    grad.addColorStop(1, 'rgba(0,210,255,0)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxR * 0.6, -0.25, 0.25);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // Radial center glow
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5);
    radGrad.addColorStop(0, 'rgba(0,210,255,0.04)');
    radGrad.addColorStop(1, 'rgba(0,210,255,0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, W, H);

    // Particles
    const pts = particlesRef.current;
    pts.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    // Connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,210,255,${0.06 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,210,255,0.35)';
      ctx.fill();
    });

    animRef.current = requestAnimationFrame(draw);
  }, [canvasRef]);

  useEffect(() => {
    init();
    draw();
    const handleResize = () => { init(); };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [init, draw]);
}

// Badge positions around the globe (% of globe container)
const BADGE_POSITIONS = [
  { key: 'london',  style: { top: '12%',  left: '4%'  } },
  { key: 'paris',   style: { top: '22%',  left: '14%' } },
  { key: 'dubai',   style: { top: '48%',  left: '3%'  } },
  { key: 'mumbai',  style: { top: '62%',  left: '16%' } },
  { key: 'tokyo',   style: { top: '10%',  right: '4%' } },
  { key: 'beijing', style: { top: '28%',  right: '12%'} },
  { key: 'sydney',  style: { top: '70%',  right: '4%' } },
  { key: 'newyork', style: { top: '56%',  right: '16%'} },
];

const INTRO_PHRASES = [
  "Culture isn't a bonus question.",
  "It's the whole test.",
];

function IntroSplash({ onDone }) {
  const [phase, setPhase] = useState(0); // 0,1 = phrase index; 2 = fading out splash

  useEffect(() => {
    // Each phrase: 400ms fade-in, 900ms hold, 400ms fade-out → 1700ms total per phrase
    const t1 = setTimeout(() => setPhase(1), 1700);
    const t2 = setTimeout(() => setPhase(2), 3400);
    const t3 = setTimeout(onDone, 3900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#020d1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: phase === 2 ? 0 : 1,
      transition: phase === 2 ? 'opacity 0.5s ease' : 'none',
      pointerEvents: 'none',
    }}>
      {/* subtle grid behind text */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(10,58,90,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(10,58,90,0.2) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 40px', width: '100%', maxWidth: '700px' }}>
        {INTRO_PHRASES.map((text, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(26px, 4vw, 42px)',
              color: i === 0 ? '#ffffff' : '#00d2ff',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              margin: 0,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max-content',
              maxWidth: '90vw',
              opacity: phase === i ? 1 : 0,
              transition: 'opacity 0.4s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function PublicLandingPage({ user }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const roomsRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [cityTimes, setCityTimes] = useState({});
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);

  const handleIntroDone = useCallback(() => {
    setShowIntro(false);
  }, []);

  useCanvas(canvasRef);

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

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
    <div style={{ background: '#020d1a', minHeight: '100vh', width: '100%', alignSelf: 'stretch', fontFamily: "'Space Grotesk', sans-serif", color: '#fff', overflowX: 'hidden', position: 'relative' }}>
      {showIntro && <IntroSplash onDone={handleIntroDone} />}

      {/* Global animation keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,210,255,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 6px rgba(0,210,255,0); }
        }
        @keyframes sweep-line {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .wr-nav-link:hover { color: #fff !important; }
        .wr-room-card:hover {
          transform: translateY(-10px) !important;
          border-color: rgba(0,210,255,0.45) !important;
          box-shadow: 0 24px 60px rgba(0,210,255,0.14), 0 0 0 1px rgba(0,210,255,0.2) !important;
        }
        .wr-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 60px rgba(0,210,255,0.5) !important;
        }
        .wr-btn-ghost:hover {
          border-color: rgba(255,255,255,0.4) !important;
          color: #fff !important;
          background: rgba(255,255,255,0.04) !important;
        }
        .wr-step-card:hover {
          border-color: rgba(0,210,255,0.3) !important;
          transform: translateY(-4px);
        }
        .wr-review-card:hover {
          border-color: rgba(196,114,240,0.35) !important;
          transform: translateY(-4px);
        }
        .wr-room-card { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .wr-step-card { transition: all 0.25s ease; }
        .wr-review-card { transition: all 0.25s ease; }
      `}</style>

      {/* Canvas background — fixed, full-page */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Grid texture overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(10,58,90,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(10,58,90,0.25) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Content wrapper — sits above canvas */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 56px', height: '68px',
          background: navScrolled ? 'rgba(2,13,26,0.95)' : 'rgba(2,13,26,0.6)',
          backdropFilter: 'blur(24px)',
          borderBottom: navScrolled ? '1px solid rgba(0,210,255,0.12)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '18px', color: '#00d2ff', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🌐</span><span>World Ready</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {['Rooms', 'About', 'Leaderboard'].map((label, i) => (
              <button key={label} className="wr-nav-link" onClick={[scrollToRooms, () => navigate('/about'), () => navigate('/leaderboard')][i]} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Space Grotesk', sans-serif", padding: 0 }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user ? (
              <button className="wr-btn-primary" onClick={() => navigate('/home')} style={{ background: 'linear-gradient(135deg, #00d2ff, #0099cc)', border: 'none', borderRadius: '10px', color: '#020d1a', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s' }}>
                Open App →
              </button>
            ) : (
              <>
                <button className="wr-nav-link" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'color 0.2s', fontFamily: "'Space Grotesk', sans-serif", padding: 0 }}>
                  Sign In
                </button>
                <button onClick={() => navigate('/register')} style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)', borderRadius: '8px', color: '#00d2ff', padding: '9px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s' }}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '68px', position: 'relative', overflow: 'hidden' }}>

          {/* Ambient glow behind globe */}
          <div style={{ position: 'absolute', top: '50%', left: '58%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(0,210,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', left: '20%', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(196,114,240,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 56px 0 72px' }}>

            {/* LEFT — headline */}
            <div style={{ flex: '0 0 520px', maxWidth: '520px', animation: 'fadeUp 0.8s ease forwards' }}>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '4px', color: '#00d2ff', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'Syne', sans-serif", marginBottom: '28px', opacity: 0.9 }}>
                World Ready · AI Interview Simulator
              </span>

              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '44px', lineHeight: 1.15, margin: '0 0 24px', letterSpacing: '-0.5px' }}>
                <span style={{ display: 'block', color: '#fff' }}>Culture isn't a bonus question.</span>
                <span style={{ display: 'block', background: 'linear-gradient(90deg, #00d2ff 0%, #c472f0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  It's the whole test.
                </span>
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', lineHeight: 1.65, marginBottom: '44px', fontWeight: 400, maxWidth: '440px' }}>
                8 cities. 8 interviewers. One AI that knows exactly what time it is in the room.
              </p>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button className="wr-btn-primary" onClick={handleBegin} style={{ background: 'linear-gradient(135deg, #00d2ff, #0099cc)', border: 'none', borderRadius: '12px', color: '#020d1a', padding: '16px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.3px', boxShadow: '0 0 40px rgba(0,210,255,0.3)', transition: 'all 0.2s' }}>
                  Begin Your Interview →
                </button>
                <button className="wr-btn-ghost" onClick={scrollToRooms} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', color: 'rgba(255,255,255,0.65)', padding: '16px 32px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s' }}>
                  See the rooms ↓
                </button>
              </div>

              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '36px' }}>
                <span style={{ display: 'block', width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>LIVE TIMEZONE DATA · UPDATES EVERY 60s</span>
              </div>
            </div>

            {/* RIGHT — Globe + time badges */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: '640px' }}>

              {/* Time badges */}
              {BADGE_POSITIONS.map(({ key, style }, i) => {
                const r = REGIONS[key];
                const time = cityTimes[key];
                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute',
                      ...style,
                      background: 'rgba(5,21,37,0.88)',
                      border: '1px solid rgba(0,210,255,0.28)',
                      borderRadius: '24px',
                      padding: '7px 16px',
                      display: 'flex', alignItems: 'center', gap: '9px',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                      animation: `fadeIn 0.6s ease ${i * 0.1}s forwards, floatBadge ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0,
                      zIndex: 5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>{r.flag}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>{r.name}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(0,210,255,0.5)', display: 'block' }} />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#00d2ff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {time || '—'}
                    </span>
                  </div>
                );
              })}

              {/* Globe */}
              <Suspense fallback={
                <div style={{ width: 640, height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,210,255,0.3)', fontSize: '13px', letterSpacing: '2px' }}>
                  LOADING GLOBE…
                </div>
              }>
                <GlobeComponent selectedRegion={null} onSelectRegion={() => {}} />
              </Suspense>
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.35, animation: 'fadeIn 1.5s ease 1s forwards' }}>
            <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#fff' }}>SCROLL</span>
            <div style={{ width: '1px', height: '40px', background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }} />
          </div>
        </section>

        {/* ── SECTION DIVIDER ── */}
        <div style={{ height: '1px', margin: '0 56px', background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.2), rgba(196,114,240,0.15), transparent)' }} />

        {/* ── ROOMS ── */}
        <section ref={roomsRef} style={{ padding: '120px 56px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '4px', color: '#00d2ff', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'Syne', sans-serif", marginBottom: '16px' }}>
                Interview Rooms
              </span>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '44px', color: '#fff', margin: 0, lineHeight: 1.1 }}>
                Choose Your Room
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px', marginTop: '16px', fontWeight: 400 }}>
                Each room is a different world. Walk in knowing what to expect.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {REGION_LIST.map(([key, r]) => (
                <div
                  key={key}
                  className="wr-room-card"
                  onClick={() => selectRoom(key)}
                  onMouseEnter={() => setHoveredRoom(key)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  style={{
                    background: 'rgba(5,21,37,0.85)',
                    border: '1px solid rgba(0,210,255,0.12)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    minHeight: '200px',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Card glow on hover */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at top left, rgba(0,210,255,0.05) 0%, transparent 70%)',
                    opacity: hoveredRoom === key ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }} />

                  <span style={{ fontSize: '36px', display: 'block', marginBottom: '14px' }}>{r.flag}</span>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '4px' }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px' }}>{r.interviewer}</div>

                  <span style={{ display: 'inline-block', background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: '20px', padding: '3px 12px', fontSize: '10px', fontWeight: 600, color: '#00d2ff', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 'auto' }}>
                    {r.styleTag}
                  </span>

                  {cityTimes[key] && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ffcc', display: 'block', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {cityTimes[key]} local
                      </span>
                    </div>
                  )}

                  {hoveredRoom === key && (
                    <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, fontStyle: 'italic', paddingTop: '10px', borderTop: '1px solid rgba(0,210,255,0.08)' }}>
                      {r.personality.split('.')[0]}.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: '1px', margin: '0 56px', background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.15), transparent)' }} />

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: '120px 56px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '4px', color: '#00d2ff', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'Syne', sans-serif", marginBottom: '16px' }}>
                The Process
              </span>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '44px', color: '#fff', margin: 0, lineHeight: 1.1 }}>
                How It Works
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', top: '44px', left: '33%', right: '33%', height: '1px', background: 'linear-gradient(90deg, rgba(0,210,255,0.3), rgba(196,114,240,0.3))', zIndex: 0 }} />

              {STEPS.map((step) => (
                <div key={step.num} className="wr-step-card" style={{ background: 'rgba(5,21,37,0.85)', border: '1px solid rgba(0,210,255,0.12)', borderRadius: '16px', padding: '36px 28px', textAlign: 'center', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1 }}>
                  <span style={{ position: 'absolute', top: '18px', right: '20px', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '11px', color: 'rgba(0,210,255,0.25)', letterSpacing: '1px' }}>{step.num}</span>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
                    {step.icon}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '12px' }}>{step.title}</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div style={{ height: '1px', margin: '0 56px', background: 'linear-gradient(90deg, transparent, rgba(196,114,240,0.2), transparent)' }} />

        {/* ── SOCIAL PROOF ── */}
        <section style={{ padding: '120px 56px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '4px', color: '#c472f0', textTransform: 'uppercase', fontWeight: 600, fontFamily: "'Syne', sans-serif", marginBottom: '16px' }}>
                What People Say
              </span>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '44px', color: '#fff', margin: 0, lineHeight: 1.1 }}>
                Real Prep. Real Offers.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {REVIEWS.map((r, i) => (
                <div key={r.name} className="wr-review-card" style={{ background: 'rgba(5,21,37,0.85)', border: '1px solid rgba(196,114,240,0.15)', borderRadius: '16px', padding: '36px 32px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#f59e0b', fontSize: '15px', letterSpacing: '3px', marginBottom: '24px', display: 'block' }}>★★★★★</span>
                  <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '28px', fontStyle: 'italic', flex: 1 }}>
                    {r.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(196,114,240,0.15))', border: '1px solid rgba(196,114,240,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#c472f0', fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{r.role} · {r.flag} {r.region}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '160px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,210,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(196,114,240,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Top divider line */}
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.25), rgba(196,114,240,0.2), transparent)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto' }}>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.45)', marginBottom: '20px', letterSpacing: '0.2px' }}>
              In a world where everyone is interview ready,
            </p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '48px', color: '#fff', lineHeight: 1.1, marginBottom: '48px' }}>
              the candidates who stand out will be<br />
              the ones who are{' '}
              <span style={{ background: 'linear-gradient(90deg, #00d2ff, #c472f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                World-Ready.
              </span>
            </h2>
            <button className="wr-btn-primary" onClick={handleBegin} style={{ background: 'linear-gradient(135deg, #00d2ff, #0099cc)', border: 'none', borderRadius: '14px', color: '#020d1a', padding: '18px 40px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.3px', boxShadow: '0 0 50px rgba(0,210,255,0.3)', transition: 'all 0.2s' }}>
              Begin Your Interview →
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: '32px 56px', borderTop: '1px solid rgba(0,210,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'rgba(0,210,255,0.4)', fontSize: '15px' }}>🌐 World Ready</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>HornetHacks 2026 · Built with Claude AI + Google Maps</div>
          <div style={{ display: 'flex', gap: '28px' }}>
            {[['About', () => navigate('/about')], ['Sign In', () => navigate('/login')]].map(([label, fn]) => (
              <button key={label} className="wr-nav-link" onClick={fn} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '13px', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", padding: 0, transition: 'color 0.2s' }}>{label}</button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
