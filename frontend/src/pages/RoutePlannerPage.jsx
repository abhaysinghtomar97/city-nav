import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { citiesApi, routesApi } from '../services/api';
import AutocompleteInput from '../components/navigation/AutocompleteInput';
import { FiArrowRight, FiRefreshCw, FiNavigation } from 'react-icons/fi';
import { MdDirectionsBus, MdDirectionsCar, MdTrain, MdElectricRickshaw } from 'react-icons/md';
import toast from 'react-hot-toast';

const VEHICLES = [
  { id: 'bus', label: 'Bus', icon: <MdDirectionsBus />, color: '#3b82f6' },
  { id: 'auto', label: 'Auto', icon: <MdElectricRickshaw />, color: '#f59e0b' },
  { id: 'taxi', label: 'Taxi', icon: <MdDirectionsCar />, color: '#22c55e' },
  { id: 'metro', label: 'Metro', icon: <MdTrain />, color: '#8b5cf6' },
];

export default function RoutePlannerPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cityObj, setCityObj] = useState(null);
  const [source, setSource] = useState({ name: '', id: null });
  const [destination, setDestination] = useState({ name: '', id: null });
  const [vehicleType, setVehicleType] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    citiesApi.getAll({ active: true })
      .then(r => setCities(r.data.cities || []))
      .catch(() => toast.error('Failed to load cities'));
  }, []);

  const handleCityChange = (e) => {
    const id = e.target.value;
    setSelectedCity(id);
    setCityObj(cities.find(c => c._id === id) || null);
    setSource({ name: '', id: null });
    setDestination({ name: '', id: null });
    setVehicleType('');
  };

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
  };

  const validate = () => {
    const errs = {};
    if (!selectedCity) errs.city = 'Please select a city';
    if (!source.name) errs.source = 'Please enter a source location';
    if (!destination.name) errs.destination = 'Please enter a destination';
    if (!compareMode && !vehicleType) errs.vehicle = 'Please select a vehicle type';
    if (source.name && destination.name && source.name.toLowerCase() === destination.name.toLowerCase())
      errs.destination = 'Source and destination cannot be the same';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        cityId: selectedCity,
        source: source.id || source.name,
        destination: destination.id || destination.name,
        vehicleType: compareMode ? 'all' : vehicleType,
      };
      const res = await (compareMode ? routesApi.compare(payload) : routesApi.estimate(payload));
      navigate('/result', { state: { result: res.data, compareMode } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to estimate route. Please try again.';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleClear = () => {
    setSource({ name: '', id: null });
    setDestination({ name: '', id: null });
    setVehicleType('');
    setErrors({});
  };

  const supportedVehicles = cityObj
    ? VEHICLES.filter(v => cityObj.supportedVehicles.includes(v.id))
    : VEHICLES;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><FiNavigation style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />Plan Your Route</h1>
        <p>Enter your journey details to find the shortest route and estimate fare</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Planner Form */}
        <div className="card" style={{ gridColumn: '1', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* City */}
            <div className="form-group">
              <label className="form-label">City</label>
              <select className={`form-select${errors.city ? ' error' : ''}`} value={selectedCity} onChange={handleCityChange}>
                <option value="">Select a city...</option>
                {cities.map(c => <option key={c._id} value={c._id}>{c.name}, {c.state}</option>)}
              </select>
              {errors.city && <div className="form-error">{errors.city}</div>}
            </div>

            {/* Source */}
            <div className="form-group">
              <AutocompleteInput
                value={source.name}
                onChange={setSource}
                cityId={selectedCity}
                placeholder="From: Enter source location"
                label="From"
              />
              {errors.source && <div className="form-error">{errors.source}</div>}
            </div>

            {/* Swap */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0' }}>
              <button type="button" className="swap-btn" onClick={handleSwap} title="Swap source and destination">
                <FiRefreshCw size={14} />
              </button>
            </div>

            {/* Destination */}
            <div className="form-group" style={{ marginTop: '0.25rem' }}>
              <AutocompleteInput
                value={destination.name}
                onChange={setDestination}
                cityId={selectedCity}
                placeholder="To: Enter destination"
                label="To"
              />
              {errors.destination && <div className="form-error">{errors.destination}</div>}
            </div>

            {/* Compare toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={compareMode} onChange={e => { setCompareMode(e.target.checked); setVehicleType(''); }}
                  style={{ accentColor: 'var(--accent-blue)' }} />
                Compare all vehicle types
              </label>
            </div>

            {/* Vehicle selector */}
            {!compareMode && (
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <div className="vehicle-grid">
                  {supportedVehicles.map(v => (
                    <div key={v.id} className={`vehicle-card${vehicleType === v.id ? ' selected' : ''}`}
                      onClick={() => setVehicleType(v.id)} style={vehicleType === v.id ? { borderColor: v.color } : {}}>
                      <span className="vehicle-icon" style={vehicleType === v.id ? { color: v.color } : {}}>{v.icon}</span>
                      <span className="vehicle-name">{v.label}</span>
                    </div>
                  ))}
                </div>
                {errors.vehicle && <div className="form-error" style={{ marginTop: '0.5rem' }}>{errors.vehicle}</div>}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Calculating...' : <><FiArrowRight /> {compareMode ? 'Compare Routes' : 'Find Route'}</>}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
            </div>
          </form>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* How it works */}
          <div className="card">
            <div className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>How it works</div>
            {[
              { step: '1', text: 'Select your city from the supported cities' },
              { step: '2', text: 'Enter source and destination — use autocomplete for accuracy' },
              { step: '3', text: 'Choose a vehicle type or compare all options' },
              { step: '4', text: 'Get shortest route, ETA, and fare estimate instantly' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'rgba(59,130,246,0.15)',
                  color: 'var(--accent-blue-light)', fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
                }}>{s.step}</div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Supported cities */}
          {cities.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Supported Cities</div>
              {cities.map(c => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(30,45,74,0.4)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.state}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {c.supportedVehicles.map(v => (
                      <span key={v} className="badge badge-blue" style={{ fontSize: '0.6rem' }}>{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}