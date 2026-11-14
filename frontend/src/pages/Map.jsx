import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUSMS } from '../context/USMSContext';
import MapView, { STATUS_COLORS } from '../components/MapView';
import { Search, Building, Alert, Radar, MapPin } from '../components/Icons';

export default function MapPage() {
  const { sites, reports } = useUSMS();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL | VIOLATIONS | COMPLIANT
  const [selectedSite, setSelectedSite] = useState(null);

  // Check if query param specifies a site
  const siteParam = params.get('site');
  React.useEffect(() => {
    if (siteParam) {
      const match = sites.find((s) => String(s.site_id) === String(siteParam));
      if (match) setSelectedSite(match);
    }
  }, [siteParam, sites]);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesText =
        !query.trim() ||
        site.site_name.toLowerCase().includes(query.toLowerCase()) ||
        site.address.toLowerCase().includes(query.toLowerCase()) ||
        String(site.site_id).includes(query);

      if (!matchesText) return false;

      if (filter === 'VIOLATIONS') return site.hasViolations;
      if (filter === 'COMPLIANT') return !site.hasViolations;
      return true;
    });
  }, [sites, query, filter]);

  // Center on selected site or default Pune
  const mapCenter = useMemo(() => {
    if (selectedSite && Number.isFinite(selectedSite.latitude)) {
      return [selectedSite.latitude, selectedSite.longitude];
    }
    if (sites.length && Number.isFinite(sites[0].latitude)) {
      return [sites[0].latitude, sites[0].longitude];
    }
    return [18.5204, 73.8567];
  }, [selectedSite, sites]);

  return (
    <div className="panel h-full flex overflow-hidden relative bg-card">
      {/* Sidebar Overlay for Map Navigation */}
      <div className="w-72 shrink-0 border-r border-line bg-surface/90 backdrop-blur-md flex flex-col z-[500] hidden md:flex">
        {/* Search & Filter */}
        <div className="p-3 border-b border-line space-y-2">
          <div className="relative">
            <Search
              width={13}
              height={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search map sites..."
              className="w-full h-8 pl-8 pr-2.5 rounded bg-bg border border-line text-xs text-ink placeholder:text-mute/60 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 p-0.5 rounded bg-bg text-[10px] font-medium border border-line">
            <button
              onClick={() => setFilter('ALL')}
              className={`py-1 rounded text-center transition ${
                filter === 'ALL'
                  ? 'bg-card text-ink shadow-sm'
                  : 'text-mute hover:text-ink'
              }`}
            >
              All ({sites.length})
            </button>
            <button
              onClick={() => setFilter('VIOLATIONS')}
              className={`py-1 rounded text-center transition ${
                filter === 'VIOLATIONS'
                  ? 'bg-crit/20 text-crit shadow-sm'
                  : 'text-mute hover:text-ink'
              }`}
            >
              Flagged
            </button>
            <button
              onClick={() => setFilter('COMPLIANT')}
              className={`py-1 rounded text-center transition ${
                filter === 'COMPLIANT'
                  ? 'bg-ok/20 text-ok shadow-sm'
                  : 'text-mute hover:text-ink'
              }`}
            >
              Compliant
            </button>
          </div>
        </div>

        {/* Site List */}
        <div className="flex-1 overflow-y-auto divide-y divide-line/50">
          {filteredSites.length === 0 ? (
            <div className="p-4 text-center text-xs text-mute">
              No sites match your filter.
            </div>
          ) : (
            filteredSites.map((site) => {
              const isSelected = selectedSite?.site_id === site.site_id;
              return (
                <div
                  key={site.site_id}
                  onClick={() => setSelectedSite(site)}
                  className={`p-3 text-xs cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-accent/15 border-l-2 border-accent'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-accent2 font-bold text-[11px]">
                      #{site.site_id}
                    </span>
                    {site.hasViolations ? (
                      <span className="chip text-[9px] bg-crit/15 text-crit">
                        Flagged
                      </span>
                    ) : (
                      <span className="chip text-[9px] bg-ok/15 text-ok">
                        Compliant
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-ink mt-1 truncate">
                    {site.site_name}
                  </h4>
                  <p className="text-[11px] text-mute truncate mt-0.5">
                    {site.address}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-mute font-mono">
                    <span className="flex items-center gap-1">
                      <Radar width={10} height={10} />
                      {site.surveysCount} surveys
                    </span>
                    <span className="flex items-center gap-1">
                      <Alert width={10} height={10} />
                      {site.reportsCount} reports
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative h-full">
        <MapView
          sites={filteredSites}
          reports={reports}
          center={mapCenter}
          zoom={selectedSite ? 14 : 12}
          onSelectSite={(site) => setSelectedSite(site)}
        />

        {/* Legend Overlay bottom-left */}
        <div className="absolute bottom-4 left-4 z-[500] panel px-3 py-2 bg-card/90 backdrop-blur border border-line flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-wider text-mute">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-accent" /> Normal Site
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-warn" /> Pending Report
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-accent2" /> Under Investigation
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-crit" /> Verified Violation
          </span>
        </div>
      </div>
    </div>
  );
}
