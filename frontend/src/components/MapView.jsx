import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';

export const STATUS_COLORS = {
  PENDING: '#f5a524',
  UNDER_INVESTIGATION: '#38bdf8',
  VERIFIED: '#ff4d6a',
  REJECTED: '#7a8aa8',
  COMPLETED: '#2dd4a0',
};

const createMarkerIcon = (color, isCritical = false) => {
  return L.divIcon({
    className: '',
    html: `
      <div class="pin ${isCritical ? 'crit' : ''}" style="--c: ${color}">
        <div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 21V4l9-1v18M13 8h7v13M2 21h20"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

function AutoFitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points || !points.length) return;
    const valid = points.filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    ).map((p) => [p.lat, p.lng]);

    if (valid.length) {
      map.fitBounds(valid, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

export default function MapView({
  sites = [],
  reports = [],
  center = [18.5204, 73.8567],
  zoom = 12,
  onSelectSite,
  className = 'h-full w-full',
}) {
  // Aggregate markers by site to show comprehensive site telemetry
  const mapPoints = useMemo(() => {
    return sites
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map((site) => {
        const siteReports = reports.filter((r) => r.site_id === site.site_id);
        const hasVerified = siteReports.some((r) => r.status === 'VERIFIED');
        const hasUnderInvestigation = siteReports.some(
          (r) => r.status === 'UNDER_INVESTIGATION'
        );
        const hasPending = siteReports.some((r) => r.status === 'PENDING');

        let markerColor = '#2f7bff'; // default blue site
        let isCrit = false;

        if (hasVerified) {
          markerColor = STATUS_COLORS.VERIFIED;
          isCrit = true;
        } else if (hasUnderInvestigation) {
          markerColor = STATUS_COLORS.UNDER_INVESTIGATION;
        } else if (hasPending) {
          markerColor = STATUS_COLORS.PENDING;
        }

        return {
          id: site.site_id,
          site,
          lat: site.latitude,
          lng: site.longitude,
          reports: siteReports,
          color: markerColor,
          isCrit,
        };
      });
  }, [sites, reports]);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <AutoFitBounds points={mapPoints} />

        {mapPoints.map((pt) => {
          const icon = createMarkerIcon(pt.color, pt.isCrit);
          return (
            <Marker
              key={pt.id}
              position={[pt.lat, pt.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSite && onSelectSite(pt.site),
              }}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px] text-ink">
                  <div className="flex items-center justify-between gap-2 border-b border-line pb-1.5">
                    <span className="font-mono text-xs font-bold text-accent2">
                      SITE #{pt.site.site_id}
                    </span>
                    <span
                      className="chip text-[9px]"
                      style={{
                        color: pt.color,
                        backgroundColor: pt.color + '22',
                      }}
                    >
                      {pt.reports.length
                        ? `${pt.reports.length} report(s)`
                        : 'No violations'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs leading-snug">
                      {pt.site.site_name}
                    </h4>
                    <p className="text-[11px] text-mute mt-0.5 leading-tight">
                      {pt.site.address}
                    </p>
                    <div className="font-mono text-[10px] text-mute/80 mt-1">
                      {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                    </div>
                  </div>

                  {pt.reports.length > 0 && (
                    <div className="pt-1.5 border-t border-line space-y-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-mute">
                        Reported Violations:
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {pt.reports.map((rep) => (
                          <div
                            key={rep.report_id}
                            className="text-[11px] bg-white/[0.04] p-1.5 rounded"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-accent2">
                                REP #{rep.report_id}
                              </span>
                              <span
                                className="font-semibold uppercase"
                                style={{
                                  color: STATUS_COLORS[rep.status] || '#fff',
                                }}
                              >
                                {rep.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-mute line-clamp-2 mt-0.5">
                              {rep.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
