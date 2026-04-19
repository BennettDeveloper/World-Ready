import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../utils/auth'

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    onLogout?.()
    setMenuOpen(false)
    navigate('/')
  }

  const isActive = path => location.pathname === path

  const links = [
    { to: '/home', label: 'Home' },
    { to: '/profile', label: 'Profile' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/reviews', label: 'Reviews' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
      zIndex: 100, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 24px',
      background: 'rgba(2,13,26,0.92)',
      borderBottom: '1px solid var(--cyan-border)',
      backdropFilter: 'blur(24px)',
    }}>
      <Link to="/home" style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: '16px', letterSpacing: '3px', textDecoration: 'none',
        display: 'flex', gap: '2px',
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>WORLD</span>
        <span style={{ color: 'var(--cyan)' }}>READY</span>
      </Link>

      <div style={{ display: 'flex', gap: '4px' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: '14px', fontWeight: 500, textDecoration: 'none',
            fontFamily: 'var(--font-ui)', transition: 'all var(--transition-fast)',
            color: isActive(l.to) ? 'var(--cyan)' : 'var(--text-secondary)',
            background: isActive(l.to) ? 'rgba(0,210,255,0.08)' : 'transparent',
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user && (
          <>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '13px', color: 'var(--bg-primary)',
            }}>
              {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {user.name || user.username}
            </span>
          </>
        )}
        <button onClick={handleLogout} style={{
          padding: '6px 14px', borderRadius: 'var(--radius-sm)',
          fontSize: '13px', color: 'var(--text-muted)',
          background: 'transparent', border: '1px solid var(--cyan-border)',
          cursor: 'pointer', fontFamily: 'var(--font-ui)',
          transition: 'all var(--transition-fast)',
        }}
          onMouseEnter={e => { e.target.style.color = 'var(--score-low)'; e.target.style.borderColor = 'var(--score-low)' }}
          onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.borderColor = 'var(--cyan-border)' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}