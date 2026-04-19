import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    onLogout?.();
    setMenuOpen(false);
    navigate('/');
  }

  const isActive = path => location.pathname === path;

  const links = [
    { to: '/home', label: 'Home' },
    { to: '/profile', label: 'Profile' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-logo" onClick={() => setMenuOpen(false)}>
        <span className="navbar-logo-icon">🌐</span>
        <span className="navbar-logo-text">World Ready</span>
      </Link>

      {/* Desktop links */}
      <div className="navbar-links">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link${isActive(l.to) ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
        {user && (
          <div className="nav-user">
            <span className="nav-avatar">{user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}</span>
            <span className="nav-username">{user.name || user.username}</span>
          </div>
        )}
        <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Hamburger */}
      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-drawer">
          {user && (
            <div className="drawer-user">
              <span className="nav-avatar large">{user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}</span>
              <div>
                <div className="drawer-name">{user.name}</div>
                <div className="drawer-username">@{user.username}</div>
              </div>
            </div>
          )}
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`drawer-link${isActive(l.to) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <button className="drawer-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
