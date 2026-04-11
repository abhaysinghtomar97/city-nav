import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { FiUsers, FiMap, FiActivity, FiClock } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(r => {
      setStats(r.data.stats);
      setRecentTrips(r.data.recentTrips || []);
    }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { icon: '👥', label: 'Total Users', value: stats.users, color: 'var(--accent-blue)' },
    { icon: '🏙️', label: 'Active Cities', value: stats.cities, color: 'var(--accent-teal)' },
    { icon: '🗺️', label: 'Total Queries', value: stats.trips, color: 'var(--accent-amber)' },
  ] : [];

  const QUICK_LINKS = [
    { to: '/admin/cities', icon: <FiMap />, label: 'Manage Cities', desc: 'Add, edit, or disable cities' },
    { to: '/admin/fares', icon: '💰', label: 'Fare Rules', desc: 'Configure fare per city and vehicle' },
    { to: '/admin/routes', icon: '↔️', label: 'Route Edges', desc: 'Manage city graph connections' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users', desc: 'View and manage user accounts' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Admin Overview</h1>
        <p>System-wide stats and management tools</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton stat-card" style={{ height: 100 }} />) :
          STAT_CARDS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Quick links */}
        <div className="card">
          <div className="card-title">Quick Actions</div>
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '0.5rem',
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              textDecoration: 'none', transition: 'var(--transition)'
            }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize: '1.25rem' }}>{l.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{l.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent queries */}
        <div className="card">
          <div className="card-title">Recent Queries</div>
          {recentTrips.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <div className="empty-icon" style={{ fontSize: '1.5rem' }}>📊</div>
              <h3 style={{ fontSize: '0.9rem' }}>No queries yet</h3>
            </div>
          ) : recentTrips.map(t => (
            <div key={t._id} style={{ padding: '0.625rem 0', borderBottom: '1px solid rgba(30,45,74,0.4)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 500 }}>{t.source?.name} → {t.destination?.name}</div>
              <div style={{ color: 'var(--text-muted)' }}>{t.city?.name} · {t.vehicleType} · {new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}