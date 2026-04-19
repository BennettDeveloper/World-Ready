import { useNavigate } from 'react-router-dom';

const TEAM = [
  { name: 'James Kollilon Barclay III', role: 'Full-Stack Lead', flag: '🇺🇸', initial: 'J' },
  { name: 'Derwin Bell', role: 'Backend & Systems', flag: '🇺🇸', initial: 'D' },
  { name: 'Bennett Developer', role: 'Frontend & Design', flag: '🇺🇸', initial: 'B' },
];

const PILLARS = [
  { icon: '🌍', title: 'Global Perspective', desc: 'We cover 8 cities across 6 continents — each with a unique interviewer persona, communication style, and cultural lens.' },
  { icon: '🤖', title: 'AI-Powered Feedback', desc: 'Every session is analyzed by Claude AI, giving you real, personalized coaching beyond keyword matching.' },
  { icon: '🎙', title: 'True-to-Life Practice', desc: 'Voice input, live timers, gibberish detection, and region-specific personas create an experience that mirrors the real thing.' },
  { icon: '📊', title: 'Track Your Growth', desc: 'Every session is saved. Watch your scores improve over time and earn achievements as you explore new regions.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <span className="about-hero-globe">🌐</span>
        <h1 className="about-hero-title">
          About <span className="gradient-text">World Ready</span>
        </h1>
        <p className="about-hero-tagline">
          Preparing you for the interview — wherever in the world it happens.
        </p>
      </div>

      {/* Mission */}
      <div className="about-mission glass">
        <h2 className="about-section-title">Our Mission</h2>
        <p className="about-mission-text">
          We exist to redefine what it means to truly prepare for an interview. While most tools
          focus on helping candidates craft the perfect answer, we focus on the experience of being
          in the room. Interviews don't happen in isolation — they are shaped by culture, environment,
          and unspoken expectations.
        </p>
        <p className="about-mission-text">
          The way confidence is perceived in one city may be interpreted entirely differently in
          another, and an answer that resonates in one part of the world may miss the mark elsewhere.
          Yet, this layer of preparation is often overlooked.
        </p>
        <p className="about-mission-text about-mission-highlight">
          We built our platform to bridge that gap — equipping individuals not just with{' '}
          <em>what to say</em>, but with <em>how to show up</em> and stand out anywhere in the world.
        </p>
      </div>

      {/* Pillars */}
      <div className="about-pillars">
        <h2 className="about-section-title centered">What Sets Us Apart</h2>
        <div className="about-pillars-grid">
          {PILLARS.map(p => (
            <div key={p.title} className="about-pillar glass">
              <span className="pillar-icon">{p.icon}</span>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="about-team glass">
        <h2 className="about-section-title centered">The Team</h2>
        <div className="about-team-grid">
          {TEAM.map(m => (
            <div key={m.name} className="team-card">
              <div className="team-avatar">{m.initial}</div>
              <div className="team-info">
                <div className="team-name">{m.name} {m.flag}</div>
                <div className="team-role">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta">
        <h2 className="about-cta-title">Ready to practice?</h2>
        <p className="about-cta-sub">Pick your city, meet your interviewer, and find out how World Ready you really are.</p>
        <button className="btn-primary" onClick={() => navigate('/home')}>Start an Interview</button>
      </div>
    </div>
  );
}
