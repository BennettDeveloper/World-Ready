import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../utils/auth';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleVerify(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Step 1 just validates the fields exist — we verify on final submit
      setStep(2);
      setLoading(false);
    }, 400);
  }

  function handleReset(e) {
    e.preventDefault();
    if (!form.password || !form.confirm) {
      setError('Please fill in both password fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = resetPassword(form.username.trim(), form.email.trim(), form.password);
      if (result.success) {
        setStep(3);
      } else {
        setError(result.error);
      }
      setLoading(false);
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
          <p className="auth-tagline">Reset your password</p>
        </div>

        {step === 1 && (
          <form className="auth-form" onSubmit={handleVerify} noValidate>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="form-help-text">Enter your username and email address to verify your account.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-username">Username</label>
              <input id="fp-username" name="username" type="text" className="form-input"
                placeholder="Your username" value={form.username} onChange={handleChange} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">Email</label>
              <input id="fp-email" name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Verify Account'}
            </button>
            <p className="auth-switch">
              <Link to="/login" className="auth-link">← Back to Sign In</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleReset} noValidate>
            <h2 className="auth-title">Set New Password</h2>
            <p className="form-help-text">Choose a new password for <strong>{form.username}</strong>.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-password">New Password</label>
              <input id="fp-password" name="password" type="password" className="form-input"
                placeholder="Min 6 characters" value={form.password} onChange={handleChange} autoFocus
                autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-confirm">Confirm Password</label>
              <input id="fp-confirm" name="confirm" type="password" className="form-input"
                placeholder="Repeat new password" value={form.confirm} onChange={handleChange}
                autoComplete="new-password" />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="auth-form">
            <div className="reset-success">
              <span className="reset-success-icon">✅</span>
              <h2 className="auth-title">Password Reset!</h2>
              <p className="form-help-text">Your password has been updated. You can now sign in with your new password.</p>
              <Link to="/login" className="btn-primary full-width" style={{ textAlign: 'center', display: 'block', marginTop: '16px' }}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
