import { useState, useEffect } from 'react';

const REVIEWS_KEY = 'wr_reviews';

const HARDCODED_REVIEWS = [
  {
    id: 'hc1',
    name: 'Marcus T.',
    role: 'Software Engineer',
    region: '🇯🇵 Tokyo',
    rating: 5,
    date: 'March 2025',
    text: "I cannot overstate how much World Ready changed my preparation. I had a final round with a Japanese firm and I knew nothing about how formal their process would be. After three sessions with the Tokyo room, I walked in calm and composed. I got the offer. This app is the real deal.",
  },
  {
    id: 'hc2',
    name: 'Amara O.',
    role: 'Product Manager',
    region: '🇬🇧 London',
    rating: 5,
    date: 'February 2025',
    text: "The London interviewer is brutally accurate — James Whitmore does NOT give you an inch. After practicing with him for two weeks, my actual London panel felt easy by comparison. I landed a Senior PM role at a top consultancy. World Ready is unlike anything else out there.",
  },
  {
    id: 'hc3',
    name: 'Diego M.',
    role: 'Finance Analyst',
    region: '🇦🇪 Dubai',
    rating: 5,
    date: 'January 2025',
    text: "I was relocating to Dubai for a role at an investment group and had no idea what to expect culturally. The Dubai simulation opened my eyes — big ambition, global vision, no small thinking. I adjusted my entire pitch. The hiring manager told me I was the best-prepared candidate they had seen. Landed the job.",
  },
  {
    id: 'hc4',
    name: 'Preethi R.',
    role: 'Data Scientist',
    region: '🇮🇳 Mumbai',
    rating: 5,
    date: 'December 2024',
    text: "Priya Sharma feels like a real interviewer — warm but absolutely paying attention. I practiced the Mumbai room before an interview with an Indian tech company and the style was almost identical. The coaching tips helped me understand exactly where I was being vague. I got the job and I credit World Ready entirely.",
  },
  {
    id: 'hc5',
    name: 'Sophie L.',
    role: 'Creative Director',
    region: '🇫🇷 Paris',
    rating: 5,
    date: 'November 2024',
    text: "The Paris room is something else. Sophie Dubois pushed me to think in ways I had never considered for an interview. I showed up to my actual Paris interview expecting the usual questions — instead it was a deep philosophical conversation about creativity and I was completely ready. I got the role and a compliment from the interviewer on my depth of thinking.",
  },
  {
    id: 'hc6',
    name: 'Jordan K.',
    role: 'Business Development',
    region: '🇺🇸 New York',
    rating: 5,
    date: 'October 2024',
    text: "Ashley Rivera is terrifying in the best possible way. The first time I practiced I completely bombed — too vague, no numbers. After two weeks of sessions I could deliver tight, metrics-backed answers under pressure. My actual NY interview was with a VP who was exactly like Ashley. I had the numbers ready. Got the offer same day.",
  },
];

function StarRating({ rating }) {
  return (
    <span className="review-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="review-stars picker">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={i <= (hovered || value) ? 'star filled' : 'star'}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >★</span>
      ))}
    </span>
  );
}

export default function ReviewsPage({ user }) {
  const [userReviews, setUserReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]'); } catch { return []; }
  });
  const [form, setForm] = useState({ name: user?.name || '', role: '', region: '', rating: 5, text: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(userReviews));
  }, [userReviews]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim() || form.text.trim().length < 20) {
      setError('Please fill in your name and write at least 20 characters in your review.');
      return;
    }
    const review = {
      id: `u${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim() || 'Candidate',
      region: form.region || '🌐 Global',
      rating: form.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      text: form.text.trim(),
      isUserReview: true,
    };
    setUserReviews(prev => [review, ...prev]);
    setForm({ name: user?.name || '', role: '', region: '', rating: 5, text: '' });
    setError('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const allReviews = [...userReviews, ...HARDCODED_REVIEWS];

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1 className="reviews-title">
          <span className="gradient-text">Success Stories</span>
        </h1>
        <p className="reviews-sub">Real candidates. Real results. Real rooms.</p>
      </div>

      <div className="reviews-layout">
        {/* Review feed */}
        <div className="reviews-feed">
          {allReviews.map(r => (
            <div key={r.id} className={`review-card glass-panel${r.isUserReview ? ' user-review' : ''}`}>
              <div className="review-top">
                <div className="review-avatar">{r.name[0]?.toUpperCase()}</div>
                <div className="review-meta">
                  <span className="review-name">{r.name}</span>
                  <span className="review-role">{r.role}</span>
                </div>
                <div className="review-right-meta">
                  <StarRating rating={r.rating} />
                  <span className="review-region">{r.region}</span>
                  <span className="review-date">{r.date}</span>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
              {r.isUserReview && <span className="user-review-badge">Your Review</span>}
            </div>
          ))}
        </div>

        {/* Write review form */}
        <aside className="review-form-panel glass-panel">
          <h3 className="review-form-title">Share Your Story</h3>
          <p className="review-form-sub">Did World Ready help you land a role? Let others know.</p>

          {submitted && (
            <div className="review-success">Review posted! Thank you.</div>
          )}

          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Marcus T." />
            </div>
            <div className="form-group">
              <label className="form-label">Your Role</label>
              <input className="form-input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Software Engineer" />
            </div>
            <div className="form-group">
              <label className="form-label">Interview Room</label>
              <select className="form-input" value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}>
                <option value="">Select a room…</option>
                <option value="🇬🇧 London">🇬🇧 London</option>
                <option value="🇮🇳 Mumbai">🇮🇳 Mumbai</option>
                <option value="🇯🇵 Tokyo">🇯🇵 Tokyo</option>
                <option value="🇺🇸 New York">🇺🇸 New York</option>
                <option value="🇫🇷 Paris">🇫🇷 Paris</option>
                <option value="🇦🇪 Dubai">🇦🇪 Dubai</option>
                <option value="🇦🇺 Sydney">🇦🇺 Sydney</option>
                <option value="🇨🇳 Beijing">🇨🇳 Beijing</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Review *</label>
              <textarea className="form-input review-textarea"
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="Tell others how World Ready helped you…"
                rows={5} />
            </div>
            {error && <p className="review-error">{error}</p>}
            <button type="submit" className="btn-primary">Post Review</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
