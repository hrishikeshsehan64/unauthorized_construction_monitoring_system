import { useEffect, useState } from 'react';
import axios from 'axios';
import { dashboard, incidents, investigations } from './mock';

const fallback = { dashboard, incidents, investigations };

// Accept backend data only if it has the shape the UI needs; otherwise keep demo data.
function sane(resource, data) {
  if (resource === 'dashboard') {
    return data && typeof data === 'object' && !Array.isArray(data) ? { ...dashboard, ...data, kpis: { ...dashboard.kpis, ...(data.kpis || {}) } } : null;
  }
  const list = Array.isArray(data) ? data : data?.items || data?.data;
  if (!Array.isArray(list) || !list.length) return null;
  const ok = list.every(i => i && Number.isFinite(+i.lat) && Number.isFinite(+i.lng));
  if (resource === 'incidents' && !ok) return null;
  return list.map((i, n) => ({ ...fallback[resource][n % fallback[resource].length], ...i, ...(ok ? { lat: +i.lat, lng: +i.lng } : {}) }));
}

export function useApi(resource) {
  const [data, setData] = useState(fallback[resource]);
  const [live, setLive] = useState(false);
  useEffect(() => {
    let off = false;
    axios.get(`/api/${resource}`, { timeout: 2500 })
      .then(res => { const v = sane(resource, res.data); if (!off && v) { setData(v); setLive(true); } })
      .catch(() => {});
    return () => { off = true; };
  }, [resource]);
  return { data, live };
}
