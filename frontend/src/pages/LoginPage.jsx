// LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDirectionsBus } from 'react-icons/md';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@cityroute.in', password: 'admin@123' });
    else setForm({ email: 'demo@cityroute.in', password: 'demo@123' });
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <FiMail className="input-icon" size={15} />
            <input type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <FiLock className="input-icon" size={15} />
            <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}>{showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}</button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {/* Demo credentials */}
      <div style={{ marginTop: '1.25rem' }}>
        <div className="divider-text">Demo Credentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button onClick={() => fillDemo('user')} className="btn btn-secondary btn-sm">👤 Demo User</button>
          <button onClick={() => fillDemo('admin')} className="btn btn-secondary btn-sm">🔧 Demo Admin</button>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start navigating cities smarter">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="Your Name"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <FiMail className="input-icon" size={15} />
            <input type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper">
            <FiLock className="input-icon" size={15} />
            <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}>{showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}</button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-input" placeholder="Re-enter password"
            value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
        </div>
        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '1.5rem',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <MdDirectionsBus style={{ color: 'var(--accent-blue)', fontSize: '1.75rem' }} />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CityRoute</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{subtitle}</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;