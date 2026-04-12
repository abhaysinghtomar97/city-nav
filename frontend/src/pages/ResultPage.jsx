import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { MdDirectionsBus, MdDirectionsCar, MdTrain, MdElectricRickshaw } from 'react-icons/md';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const VEHICLE_META = {
  bus: { label: 'Bus', icon: <MdDirectionsBus />, color: '#3b82f6', badge: 'badge-blue' },
  auto: { label: 'Auto', icon: <MdElectricRickshaw />, color: '#f59e0b', badge: 'badge-amber' },
  taxi: { label: 'Taxi', icon: <MdDirectionsCar />, color: '#22c55e', badge: 'badge-green' },
  metro: { label: 'Metro', icon: <MdTrain />, color: '#8b5cf6', badge: 'badge-purple' },
};

function FareBreakdown({ fare }) {
  if (!fare || fare.error) return null;
  return (
    <div className="fare-breakdown">
      {fare.baseFare > 0 && <div className="fare-row"><span>Base fare</span><span>₹{fare.baseFare}</span></div>}
      <div className="fare-row"><span>Distance</span><span>₹{fare.distanceCharge}</span></div>
      {fare.nightSurcharge > 0 && <div className="fare-row"><span>Night</span><span>₹{fare.nightSurcharge}</span></div>}
      <div className="fare-row total"><span>Total</span><span>₹{fare.total}</span></div>
    </div>
  );
}

function StepsList({ steps }) {
  if (!steps) return null;
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i}>
          {s.from} → {s.to} ({s.distanceKm} km, {s.durationMin} min)
        </div>
      ))}
    </div>
  );
}

//////////////////////////////////////////////////
// 🔥 NEW: dynamic map updater (MAIN FIX)
//////////////////////////////////////////////////
function ChangeMapView({ coords }) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords); // auto center + zoom
    }
  }, [coords, map]);

  return null;
}

function SingleResult({ vehicleType, data, source, destination }) {
  const meta = VEHICLE_META[vehicleType] || {};
  if (!data || !data.route) {
  return <div>No route data available</div>;
}

const { route, fare } = data;

  const [coords, setCoords] = useState([]);

 useEffect(() => {
  if (!route?.path) return;

  const newCoords = route.path
    .filter(p => p && p.lat && p.lng)
    .map(p => [p.lat, p.lng]);

  setCoords(newCoords);
}, [route.path]);
console.log("COORDS:", coords);
  return (
    <div>
      <h3>{meta.label} Route</h3>
      <p>{source} → {destination}</p>

      <div>
        Distance: {route.totalDistanceKm} km | Time: {route.estimatedDurationMin} min | Fare: ₹{fare?.total}
      </div>

      <FareBreakdown fare={fare} />
      <StepsList steps={route.steps} />

      {/* 🗺️ MAP */}
      <div style={{ marginTop: 20 }}>
        <MapContainer
          center={[28.6139, 77.2090]} // default (will be overridden)
          zoom={10}
          style={{ height: 400 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 🔥 THIS LINE FIXES YOUR ISSUE */}
          <ChangeMapView coords={coords} />

          {coords.length > 0 && <Polyline positions={coords} />}

          {coords[0] && (
            <Marker position={coords[0]}>
              <Popup>Start: {source}</Popup>
            </Marker>
            
          )}

          {coords[coords.length - 1] && (
            <Marker position={coords[coords.length - 1]}>
              <Popup>End: {destination}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.result) {
    return <div>No data</div>;
  }

  const { result } = state;
  const { source, destination, vehicleType, results } = result;

  const singleResult = results?.[vehicleType];

  return (
    <div>
      <button onClick={() => navigate('/planner')}>
        <FiArrowLeft /> Back
      </button>

      {singleResult?.error ? (
        <div><FiAlertTriangle /> {singleResult.error}</div>
      ) : (
        <SingleResult
          vehicleType={vehicleType}
          data={singleResult}
          source={source?.name}
          destination={destination?.name}
        />
      )}
    </div>
  );
}