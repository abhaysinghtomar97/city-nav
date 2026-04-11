// AdminCities.jsx
import React, { useEffect, useState } from 'react';
import { adminApi, citiesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { faresApi } from '../../services/api';
import { locationsApi } from '../../services/api';


const VEHICLES = ['bus', 'auto', 'taxi', 'metro'];
const EMPTY_FORM = { name: '', state: '', code: '', coordinates: { lat: '', lng: '' }, supportedVehicles: ['bus', 'auto', 'taxi'], description: '', isActive: true };

export function AdminCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => citiesApi.getAll().then(r => setCities(r.data.cities || [])).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    setForm({ ...c, coordinates: { lat: c.coordinates?.lat || '', lng: c.coordinates?.lng || '' } });
    setEditing(c._id); setModal(true);
  };

  const toggleVehicle = (v) => {
    setForm(p => ({
      ...p,
      supportedVehicles: p.supportedVehicles.includes(v)
        ? p.supportedVehicles.filter(x => x !== v)
        : [...p.supportedVehicles, v]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, coordinates: { lat: Number(form.coordinates.lat), lng: Number(form.coordinates.lng) } };
      if (editing) await citiesApi.update(editing, payload);
      else await citiesApi.create(payload);
      toast.success(editing ? 'City updated!' : 'City created!');
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete city "${name}"?`)) return;
    await citiesApi.delete(id).then(() => { toast.success('City deleted.'); load(); }).catch(() => toast.error('Delete failed'));
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Manage Cities</h1>
          <p>Add and configure supported cities</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add City</button>
      </div>

      <div className="card">
        {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>City</th><th>State</th><th>Code</th><th>Vehicles</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {cities.map(c => (
                  <tr key={c._id}>
                    <td><div style={{ fontWeight: 600 }}>{c.name}</div></td>
                    <td>{c.state}</td>
                    <td><span className="badge badge-teal">{c.code}</span></td>
                    <td style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {c.supportedVehicles.map(v => <span key={v} className="badge badge-blue">{v}</span>)}
                    </td>
                    <td><span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}><FiEdit2 size={12} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id, c.name)}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit City' : 'Add New City'}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group"><label className="form-label">City Name</label><input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">State</label><input className="form-input" required value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Code (e.g. DEL)</label><input className="form-input" maxLength={6} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} /></div>
                <div className="form-group"><label className="form-label">Lat, Lng</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="form-input" type="number" step="any" placeholder="Lat" value={form.coordinates.lat} onChange={e => setForm(p => ({ ...p, coordinates: { ...p.coordinates, lat: e.target.value } }))} />
                    <input className="form-input" type="number" step="any" placeholder="Lng" value={form.coordinates.lng} onChange={e => setForm(p => ({ ...p, coordinates: { ...p.coordinates, lng: e.target.value } }))} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Supported Vehicles</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {VEHICLES.map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.supportedVehicles.includes(v)} onChange={() => toggleVehicle(v)} style={{ accentColor: 'var(--accent-blue)' }} />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} style={{ accentColor: 'var(--accent-blue)' }} />Active
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save City'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Fare Rules ────────────────────────────────────
export function AdminFareRules() {
  const [rules, setRules] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ city: '', vehicleType: 'bus', baseFare: 0, minimumFare: 10, perKmRate: 5, nightSurchargeMultiplier: 1.0, currency: 'INR', notes: '', isActive: true });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
 

  const load = async () => {
    setLoading(true);
    const [r, c] = await Promise.all([faresApi.getAll(), citiesApi.getAll()]);
    setRules(r.data.fareRules || []); setCities(c.data.cities || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ city: cities[0]?._id || '', vehicleType: 'bus', baseFare: 0, minimumFare: 10, perKmRate: 5, nightSurchargeMultiplier: 1.0, currency: 'INR', notes: '', isActive: true }); setEditing(null); setModal(true); };
  const openEdit = (r) => { setForm({ ...r, city: r.city?._id || r.city }); setEditing(r._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await faresApi.update(editing, form);
      else await faresApi.create(form);
      toast.success('Fare rule saved!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fare rule?')) return;
    await faresApi.delete(id).then(() => { toast.success('Deleted.'); load(); }).catch(() => toast.error('Delete failed'));
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}><h1>Fare Rules</h1><p>Configure fare rates per city and vehicle</p></div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Rule</button>
      </div>
      <div className="card">
        {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>City</th><th>Vehicle</th><th>Base Fare</th><th>Min Fare</th><th>Per KM</th><th>Night x</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r._id}>
                    <td>{r.city?.name || '—'}</td>
                    <td><span className="badge badge-blue">{r.vehicleType}</span></td>
                    <td>₹{r.baseFare}</td><td>₹{r.minimumFare}</td><td>₹{r.perKmRate}/km</td>
                    <td>{r.nightSurchargeMultiplier}x</td>
                    <td><span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Off'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}><FiEdit2 size={12} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">{editing ? 'Edit' : 'Add'} Fare Rule</div><button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group"><label className="form-label">City</label>
                  <select className="form-select" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Vehicle</label>
                  <select className="form-select" value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}>
                    {['bus', 'auto', 'taxi', 'metro'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                {[['baseFare', 'Base Fare (₹)'], ['minimumFare', 'Min Fare (₹)'], ['perKmRate', 'Per KM Rate (₹)'], ['nightSurchargeMultiplier', 'Night Multiplier']].map(([field, label]) => (
                  <div className="form-group" key={field}><label className="form-label">{label}</label>
                    <input type="number" step="0.01" className="form-input" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: parseFloat(e.target.value) }))} />
                  </div>
                ))}
              </div>
              <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Users ─────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.users({ search }).then(r => setUsers(r.data.users || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Users</h1><p>View and manage user accounts</p></div>
      <div className="card">
        <input className="form-input" style={{ marginBottom: '1rem', maxWidth: 320 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => adminApi.toggleUser(u._id).then(load)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Routes ─────────────────────────────────────────
export function AdminRoutes() {
  const [edges, setEdges] = useState([]);
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ city: '', from: '', to: '', distanceKm: '', durationMinutes: '', supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);


  const load = async () => {
    setLoading(true);
    const [e, c] = await Promise.all([adminApi.getRoutes(cityFilter ? { cityId: cityFilter } : {}), citiesApi.getAll()]);
    setEdges(e.data.edges || []); setCities(c.data.cities || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [cityFilter]);

  const loadLocations = async (cityId) => {
    if (!cityId) return;
    const r = await locationsApi.getAll({ cityId });
    setLocations(r.data.locations || []);
  };

  const openCreate = () => {
    const firstCity = cities[0]?._id || '';
    setForm({ city: firstCity, from: '', to: '', distanceKm: '', durationMinutes: '', supportedVehicles: ['bus', 'auto', 'taxi'], isBidirectional: true, isActive: true });
    if (firstCity) loadLocations(firstCity);
    setEditing(null); setModal(true);
  };

  const toggleVehicle = (v) => setForm(p => ({ ...p, supportedVehicles: p.supportedVehicles.includes(v) ? p.supportedVehicles.filter(x => x !== v) : [...p.supportedVehicles, v] }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, distanceKm: Number(form.distanceKm), durationMinutes: Number(form.durationMinutes) };
      if (editing) await adminApi.updateRoute(editing, payload);
      else await adminApi.createRoute(payload);
      toast.success('Route saved!'); setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}><h1>Route Edges</h1><p>Manage city graph connections for routing</p></div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Edge</button>
      </div>

      <div className="card">
        <select className="form-select" style={{ maxWidth: 240, marginBottom: '1rem' }} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {loading ? <div className="skeleton" style={{ height: 200 }} /> : edges.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">↔️</div><h3>No route edges found</h3><p>Add edges to enable routing between locations</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>City</th><th>From</th><th>To</th><th>Distance</th><th>Duration</th><th>Vehicles</th><th>Bidir.</th><th></th></tr></thead>
              <tbody>
                {edges.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontSize: '0.8rem' }}>{e.city?.name}</td>
                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{e.from?.name}</td>
                    <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{e.to?.name}</td>
                    <td>{e.distanceKm} km</td>
                    <td>{e.durationMinutes} min</td>
                    <td style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                      {e.supportedVehicles.map(v => <span key={v} className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{v}</span>)}
                    </td>
                    <td><span className={`badge ${e.isBidirectional ? 'badge-green' : 'badge-amber'}`}>{e.isBidirectional ? '↔' : '→'}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => adminApi.deleteRoute(e._id).then(() => { toast.success('Deleted'); load(); })}>
                        <FiTrash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header"><div className="modal-title">Add Route Edge</div><button className="btn btn-secondary btn-sm" onClick={() => setModal(false)}>✕</button></div>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">City</label>
                <select className="form-select" required value={form.city} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, city: v, from: '', to: '' })); loadLocations(v); }}>
                  <option value="">Select city...</option>
                  {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group"><label className="form-label">From</label>
                  <select className="form-select" required value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))}>
                    <option value="">Select...</option>
                    {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">To</label>
                  <select className="form-select" required value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))}>
                    <option value="">Select...</option>
                    {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Distance (km)</label>
                  <input type="number" step="0.1" min="0" className="form-input" required value={form.distanceKm} onChange={e => setForm(p => ({ ...p, distanceKm: e.target.value }))} />
                </div>
                <div className="form-group"><label className="form-label">Duration (min)</label>
                  <input type="number" min="0" className="form-input" required value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicles</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['bus', 'auto', 'taxi', 'metro'].map(v => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.supportedVehicles.includes(v)} onChange={() => toggleVehicle(v)} style={{ accentColor: 'var(--accent-blue)' }} />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input type="checkbox" checked={form.isBidirectional} onChange={e => setForm(p => ({ ...p, isBidirectional: e.target.checked }))} style={{ accentColor: 'var(--accent-blue)' }} />Bidirectional (A↔B)
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Edge'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCities;