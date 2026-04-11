// NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '8rem', fontWeight: 800, background: 'linear-gradient(90deg, #60a5fa, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The route you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
      </div>
    </div>
  );
}