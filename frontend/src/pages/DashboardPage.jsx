// DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyApi, citiesApi, profileApi } from '../services/api';
import { FiCompass, FiClock, FiMap, FiArrowRight } from 'react-icons/fi';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTrips, setRecentTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      historyApi.getAll({ limit: 5 }),
      citiesApi.getAll({ active: true })
    ]).then(([h, c]) => {
      setRecentTrips(h.data.trips || []);
      setCities(c.data.cities || []);
    }).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p>Ready to navigate your next journey?</p>
      </div>

      {/* Quick action */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(20,184,166,0.06))',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-xl)',
        padding: '2rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>Plan Your Next Route</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Find the shortest path and compare fares</div>
        </div>
        <button onClick={() => navigate('/planner')} className="btn btn-primary btn-lg">
          <FiCompass /> Plan Route <FiArrowRight />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent trips */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Recent Trips</div>
            <Link to="/history" style={{ fontSize: '0.8rem', color: 'var(--accent-blue-light)' }}>View all</Link>
          </div>
          {loading ? (
            <div>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}</div>
          ) : recentTrips.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <div className="empty-icon" style={{ fontSize: '2rem' }}>🗺️</div>
              <h3>No trips yet</h3>
              <p style={{ fontSize: '0.8rem' }}>Your route history will appear here</p>
            </div>
          ) : recentTrips.map(trip => (
            <div key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(30,45,74,0.4)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{trip.source.name} → {trip.destination.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trip.city?.name} · {trip.vehicleType}</div>
              </div>
              {trip.result?.estimatedFare && (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-green)' }}>₹{trip.result.estimatedFare}</span>
              )}
            </div>
          ))}
        </div>

        {/* Available cities */}
        <div className="card">
          <div className="card-title">Available Cities</div>
          {cities.map(c => (
            <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid rgba(30,45,74,0.4)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.state}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {c.supportedVehicles.map(v => <span key={v} className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{v}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── History Page ──────────────────────────────────────
export function HistoryPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await historyApi.getAll({ page: p, limit: 10 });
      setTrips(res.data.trips || []);
      setPagination(res.data.pagination || {});
      setPage(p);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this trip from history?')) return;
    await historyApi.delete(id);
    load(page);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><FiClock style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Trip History</h1>
        <p>Your previous route searches and fare estimates</p>
      </div>

      <div className="card">
        {loading ? (
          <div>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />)}</div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h3>No trip history yet</h3>
            <p>Plan your first route to see it here</p>
            <Link to="/planner" className="btn btn-primary" style={{ marginTop: '1rem' }}>Plan a Route</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Route</th><th>City</th><th>Vehicle</th><th>Distance</th><th>Fare</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{t.source.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→ {t.destination.name}</div>
                    </td>
                    <td><span style={{ fontSize: '0.8rem' }}>{t.city?.name}</span></td>
                    <td><span className="badge badge-blue">{t.vehicleType}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{t.result?.totalDistanceKm ? `${t.result.totalDistanceKm} km` : '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{t.result?.estimatedFare ? `₹${t.result.estimatedFare}` : '—'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
            <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {page} / {pagination.pages}
            </span>
            <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => load(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Profile Page ──────────────────────────────────────
export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');


  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await profileApi.update({ name: form.name });
      setMsg('Profile updated!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNew) { setPwMsg('New passwords do not match.'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      await profileApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your account information</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Profile */}
        <div className="card">
          <div className="card-title">Account Details</div>
          {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({ name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input type="text" className="form-input" value={user?.role} disabled style={{ opacity: 0.5 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <div className="card-title">Change Password</div>
          {pwMsg && <div className={`alert ${pwMsg.includes('!') ? 'alert-success' : 'alert-error'}`}>{pwMsg}</div>}
          <form onSubmit={handlePwChange}>
            {['currentPassword', 'newPassword', 'confirmNew'].map((field, i) => (
              <div className="form-group" key={field}>
                <label className="form-label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                <input type="password" className="form-input" value={pwForm[field]}
                  onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Updating...' : 'Update Password'}</button>
          </form>

          <div className="divider" />
          <button onClick={() => { logout(); navigate('/'); }} className="btn btn-danger btn-full">
            Logout from all sessions
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;