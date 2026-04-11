import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { citiesApi } from '../services/api';
import { MdDirectionsBus } from 'react-icons/md';
import { FiCompass, FiDollarSign, FiClock, FiArrowRight, FiMap } from 'react-icons/fi';

const FEATURES = [
  { icon: '🗺️', title: 'Smart Route Planning', desc: 'Shortest path algorithm finds the optimal route between any two points in the city.' },
  { icon: '💸', title: 'Fare Transparency', desc: 'Real-time fare estimation for Bus, Auto, Taxi & Metro with full breakdown.' },
  { icon: '⏱️', title: 'Travel Time Estimate', desc: 'Accurate ETA with traffic-aware adjustments for peak and off-peak hours.' },
  { icon: '🔄', title: 'Compare Vehicles', desc: 'Side-by-side comparison of all transport options so you pick the best one.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    citiesApi.getAll({ active: true }).then(r => setCities(r.data.cities || [])).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: 64,
        background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
          <MdDirectionsBus style={{ color: 'var(--accent-blue)', fontSize: '1.5rem' }} />
          <span style={{ background: 'linear-gradient(90deg, #60a5fa, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CityRoute</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center', padding: '2rem',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div style={{ position: 'relative', maxWidth: 720, animation: 'fadeIn 0.6s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.8rem', color: 'var(--accent-blue-light)', fontWeight: 600
          }}>
            <span>🗺️</span> City Navigation & Fare Estimation
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Navigate Any City<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Know Your Fare
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Find the shortest route between any two locations. Compare transport options, 
            estimate travel time, and know the fare — before you travel.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/planner')} className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              <FiCompass /> Plan a Route <FiArrowRight />
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-secondary btn-lg">
              Create Free Account
            </button>
          </div>

          {/* City pills */}
          {cities.length > 0 && (
            <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Cities:</span>
              {cities.map(c => (
                <span key={c._id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  padding: '0.2rem 0.75rem', borderRadius: '999px',
                  fontSize: '0.8rem', color: 'var(--text-secondary)'
                }}>{c.name}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>
          Everything You Need to Travel Smart
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Designed for travelers navigating unfamiliar cities
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '4rem 2rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(20,184,166,0.05))',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to navigate smarter?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          No signup required to plan a route. Try it now.
        </p>
        <button onClick={() => navigate('/planner')} className="btn btn-primary btn-lg">
          <FiMap /> Start Planning
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CityRoute</div>
        <p>City Navigation & Fare Estimation • Built with MEARN Stack</p>
      </footer>
    </div>
  );
}