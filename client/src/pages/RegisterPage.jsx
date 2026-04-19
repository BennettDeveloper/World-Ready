import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../utils/auth';

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { name, email, username, password, confirm } = form;
    if (!name.trim() || !email.trim() || !username.trim() || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({ name: name.trim(), email: email.trim(), username: username.trim(), password });
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

      <div className="auth-card glass register-card">
        <div className="auth-logo">
          <span className="auth-globe">🌐</span>
          <h1 className="auth-brand">World Ready</h1>
          <p className="auth-tagline">Join the global community</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 className="auth-title">Create your account</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" className="form-input" placeholder="Your full name"
                value={form.name} onChange={handleChange} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text" className="form-input" placeholder="Choose a username"
              value={form.username} onChange={handleChange} autoComplete="username" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="form-input" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} autoComplete="new-password" />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/" className="auth-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
