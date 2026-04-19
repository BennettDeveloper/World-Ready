import { useState, useEffect } from 'react'
import { REGIONS } from '../data/regions'

const REVIEWS_KEY = 'wr_reviews'

const HARDCODED_REVIEWS = [
  { id: 'hc1', name: 'Marcus T.', role: 'Software Engineer', region: '🇯🇵 Tokyo', rating: 5, date: 'March 2025', text: "I cannot overstate how much World Ready changed my preparation. I had a final round with a Japanese firm and I knew nothing about how formal their process would be. After three sessions with the Tokyo room, I walked in calm and composed. I got the offer. This app is the real deal." },
  { id: 'hc2', name: 'Amara O.', role: 'Product Manager', region: '🇬🇧 London', rating: 5, date: 'February 2025', text: "The London interviewer is brutally accurate — James Whitmore does NOT give you an inch. After practicing with him for two weeks, my actual London panel felt easy by comparison. I landed a Senior PM role at a top consultancy. World Ready is unlike anything else out there." },
  { id: 'hc3', name: 'Diego M.', role: 'Finance Analyst', region: '🇦🇪 Dubai', rating: 5, date: 'January 2025', text: "I was relocating to Dubai for a role at an investment group and had no idea what to expect culturally. The Dubai simulation opened my eyes — big ambition, global vision, no small thinking. I adjusted my entire pitch. The hiring manager told me I was the best-prepared candidate they had seen. Landed the job." },
  { id: 'hc4', name: 'Preethi R.', role: 'Data Scientist', region: '🇮🇳 Mumbai', rating: 5, date: 'December 2024', text: "Priya Sharma feels like a real interviewer — warm but absolutely paying attention. I practiced the Mumbai room before an interview with an Indian tech company and the style was almost identical. The coaching tips helped me understand exactly where I was being vague. I got the job and I credit World Ready entirely." },
  { id: 'hc5', name: 'Sophie L.', role: 'Creative Director', region: '🇫🇷 Paris', rating: 5, date: 'November 2024', text: "The Paris room is something else. Sophie Dubois pushed me to think in ways I had never considered for an interview. I showed up to my actual Paris interview expecting the usual questions — instead it was a deep philosophical conversation about creativity and I was completely ready." },
  { id: 'hc6', name: 'Jordan K.', role: 'Business Development', region: '🇺🇸 New York', rating: 5, date: 'October 2024', text: "Ashley Rivera is terrifying in the best possible way. The first time I practiced I completely bombed — too vague, no numbers. After two weeks of sessions I could deliver tight, metrics-backed answers under pressure. My actual NY interview was with a VP who was exactly like Ashley. I had the numbers ready. Got the offer same day." },
]

function Stars({ rating, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <span style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: '18px',
            color: i <= (hovered || rating) ? '#f59e0b' : 'var(--text-muted)',
            cursor: onChange ? 'pointer' : 'default',
            transition: 'color 0.15s',
          }}
        >★</span>
      ))}
    </span>
  )
}

export default function ReviewsPage({ user }) {
  const [userReviews, setUserReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ name: user?.name || '', role: '', region: '', rating: 5, text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(userReviews))
  }, [userReviews])

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || form.text.trim().length < 20) {
      setError('Please fill in your name and write at least 20 characters.')
      return
    }
    setUserReviews(prev => [{
      id: `u${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim() || 'Candidate',
      region: form.region || '🌐 Global',
      rating: form.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      text: form.text.trim(),
      isUserReview: true,
    }, ...prev])
    setForm({ name: user?.name || '', role: '', region: '', rating: 5, text: '' })
    setError('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const allReviews = [...userReviews, ...HARDCODED_REVIEWS]

  const inputStyle = {
    background: 'rgba(0,210,255,0.04)',
    border: '1px solid var(--cyan-border)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-ui)',
    width: '100%',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px',
          marginBottom: '6px',
        }}>
          <span className="gradient-text">Success Stories</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Real candidates. Real results. Real rooms.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Reviews feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allReviews.map(r => (
            <div key={r.id} className="glass-panel" style={{
              borderLeft: r.isUserReview ? '3px solid var(--cyan)' : '3px solid var(--cyan-border)',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '15px', color: 'var(--bg-primary)', flexShrink: 0,
                }}>
                  {r.name[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    fontSize: '14px', color: 'var(--text-primary)',
                  }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.role}</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                  <Stars rating={r.rating} />
                  <span style={{ fontSize: '11px', color: 'var(--cyan)' }}>{r.region}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.date}</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {r.text}
              </p>
              {r.isUserReview && (
                <span style={{
                  display: 'inline-block', padding: '2px 10px',
                  background: 'rgba(0,210,255,0.08)', border: '1px solid var(--cyan-border)',
                  borderRadius: '999px', fontSize: '10px', color: 'var(--cyan)',
                  letterSpacing: '1px', alignSelf: 'flex-start',
                }}>Your Review</span>
              )}
            </div>
          ))}
        </div>

        {/* Write review */}
        <div className="glass-panel" style={{
          position: 'sticky', top: '80px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px',
            }}>Share Your Story</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Did World Ready help you land a role?
            </p>
          </div>

          {submitted && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(0,255,204,0.08)',
              border: '1px solid rgba(0,255,204,0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px', color: 'var(--score-high)',
            }}>
              ✅ Review posted! Thank you.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Your Name *', key: 'name', placeholder: 'e.g. Marcus T.' },
              { label: 'Your Role', key: 'role', placeholder: 'e.g. Software Engineer' },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={update(f.key)}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                Interview Room
              </label>
              <select value={form.region} onChange={update('region')} style={{ ...inputStyle }}>
                <option value="">Select a room…</option>
                {Object.entries(REGIONS).map(([key, r]) => (
                  <option key={key} value={`${r.flag} ${r.name}`}>{r.flag} {r.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                Rating
              </label>
              <Stars rating={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                Your Review *
              </label>
              <textarea
                value={form.text}
                onChange={update('text')}
                placeholder="Tell others how World Ready helped you…"
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: 'var(--score-low)' }}>{error}</p>
            )}

            <button type="submit" style={{
              padding: '12px', background: 'var(--cyan)', border: 'none',
              borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: '13px', letterSpacing: '2px',
              textTransform: 'uppercase', color: 'var(--bg-primary)', cursor: 'pointer',
            }}>
              Post Review
            </button>
          </form>
        </div>
      </div>

      <style>{`
        select option { background: var(--bg-secondary); color: var(--text-primary); }
        input::placeholder, textarea::placeholder { color: var(--text-muted); }
        input:focus, textarea:focus, select:focus { border-color: var(--cyan) !important; outline: none; }
      `}</style>
    </div>
  )
}