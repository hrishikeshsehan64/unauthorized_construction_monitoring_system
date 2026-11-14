import React from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';

export const SEV = { critical: '#ff4d6a', high: '#f5a524', medium: '#38bdf8', low: '#2f7bff' };
const icons = {};
const iconFor = (sev) => icons[sev] ??= L.divIcon({
  className: '',
  html: `<div class="pin ${sev === 'critical' ? 'crit' : ''}" style="--c:${SEV[sev]}"><div>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4l9-1v18M13 8h7v13M2 21h20"/></svg></div></div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});

// Zooms the map to fit whatever incidents the API returned, wherever they are.
function FitBounds({ incidents }) {
  const map = useMap();
  React.useEffect(() => {
    const pts = incidents.filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng)).map(i => [i.lat, i.lng]);
    if (pts.length) map.fitBounds(pts, { padding: [70, 70], maxZoom: 15 });
  }, [incidents, map]);
  return null;
}

export default function MapView({ incidents, center, zoom = 12 }) {
  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <FitBounds incidents={incidents} />
      {incidents.map(i => i.severity === 'critical' || i.severity === 'high' ? (
        <Marker key={i.id} position={[i.lat, i.lng]} icon={iconFor(i.severity)}>
          <Popup><Pop i={i} /></Popup>
        </Marker>
      ) : (
        <CircleMarker key={i.id} center={[i.lat, i.lng]} radius={5}
          pathOptions={{ color: SEV[i.severity], fillColor: SEV[i.severity], fillOpacity: .8, weight: 1 }}>
          <Popup><Pop i={i} /></Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function Pop({ i }) {
  return (
    <div className="space-y-1">
      <div className="font-mono font-bold">{i.id}</div>
      <div>{i.type}</div>
      <div className="text-[11px]" style={{ color: '#7a8aa8' }}>{i.ward} · {i.status} · {i.confidence}% match</div>
    </div>
  );
}
