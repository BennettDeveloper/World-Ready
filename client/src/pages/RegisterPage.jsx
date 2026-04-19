import { useState } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../utils/auth'

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.username.length < 3) { setError('Username must be at least 3 characters.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = register({ username: form.username, password: form.password, name: form.name, email: form.email })
    if (result.success) { onLogin(result.user) } else { setError(result.error) }
    setLoading(false)
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>{label}</label>
      <input type={type} value={form[key]} onChange={update(key)} placeholder={placeholder} required
        style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid var(--cyan-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px' }}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(0,210,255,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(196,114,240,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '4px' }} className="gradient-text">Create your account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Join World Ready and start practicing</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {field('Full Name', 'name', 'text', 'Your full name')}
            {field('Email', 'email', 'email', 'your@email.com')}
          </div>
          {field('Username', 'username', 'text', 'Choose a username')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {field('Password', 'password', 'password', 'Min 6 characters')}
            {field('Confirm Password', 'confirm', 'password', 'Repeat password')}
          </div>

          {error && <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '13px', color: 'var(--score-low)' }}>{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}