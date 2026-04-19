import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ username: form.username.trim(), password: form.password });
      if (result.success) {
        onLogin(result.user);
        navigate('/home');
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-card glass">
        <div className="auth-logo">
          <span className="auth-globe">🌐</span>
          <h1 className="auth-brand">World Ready</h1>
          <p className="auth-tagline">Master interviews across cultures</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="auth-title">Welcome back</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>

          <p className="auth-switch">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </p>
          <p className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
