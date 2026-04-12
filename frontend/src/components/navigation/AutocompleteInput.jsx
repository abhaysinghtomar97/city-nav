import React, { useState, useEffect, useRef, useCallback } from 'react';
import { locationsApi } from '../../services/api';
import { FiMapPin, FiLoader } from 'react-icons/fi';

const TYPE_ICONS = {
  landmark: '🏛️', station: '🚉', area: '🏘️', airport: '✈️',
  hospital: '🏥', market: '🛒', educational: '🎓', residential: '🏠', other: '📍'
};

export default function AutocompleteInput({ value, onChange, cityId, placeholder, label, icon }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!wrapperRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (q.length < 2 || !cityId) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await locationsApi.autocomplete(cityId, q);
      setSuggestions(res.data.suggestions || []);
      setOpen(true);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, [cityId]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    onChange({ name: val, id: null });
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setSelected(item);
    onChange({ name: item.name, id: item.id, coordinates: item.coordinates });
    setOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    onChange({ name: '', id: null });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="autocomplete-wrapper">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrapper">
        <span className="input-icon">{icon || <FiMapPin size={15} />}</span>
        <input
          type="text"
          className={`form-input${selected ? ' border-teal' : ''}`}
          style={selected ? { borderColor: 'var(--accent-teal)' } : {}}
          placeholder={placeholder || 'Search location...'}
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && (
          <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
            <FiLoader size={14} />
          </span>
        )}
        {query && !loading && (
          <button onClick={handleClear} style={{
            position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '1rem', lineHeight: 1
          }}>×</button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((item) => (
            <div key={item.id || item._id || item.name} className="autocomplete-item" onClick={() => handleSelect(item)}>
              <span>{TYPE_ICONS[item.type] || '📍'}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div className="place-type">{item.type} {item.city ? `· ${item.city}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
            No locations found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}