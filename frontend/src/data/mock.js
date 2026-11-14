// Fallback data used when the backend (http://localhost:5001/api/*) is unreachable.
const CENTER = [18.5204, 73.8567]; // Pune

const wards = ['Kothrud', 'Hadapsar', 'Baner', 'Wakad', 'Kharadi', 'Katraj', 'Aundh', 'Yerwada'];
const types = ['Unapproved extra floor', 'No building permit', 'Encroachment', 'Setback violation', 'Change of land use'];
const sev = ['critical', 'high', 'medium', 'low'] // weighted toward lower severities;

function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const r = rnd(42);

export const incidents = Array.from({ length: 46 }, (_, i) => ({
  id: `UC-${2400 + i}`,
  lat: CENTER[0] + (r() - 0.5) * 0.13,
  lng: CENTER[1] + (r() - 0.5) * 0.17,
  ward: wards[Math.floor(r() * wards.length)],
  type: types[Math.floor(r() * types.length)],
  severity: sev[Math.min(3, Math.floor(Math.pow(r(), 0.8) * 4))],
  status: ['Open', 'Under review', 'Notice served', 'Demolition ordered'][Math.floor(r() * 4)],
  detected: `${Math.floor(r() * 28) + 1}h ago`,
  confidence: Math.round(72 + r() * 27),
}));

export const dashboard = {
  center: CENTER,
  region: 'Pune Metropolitan Region (demo data)',
  kpis: { activeSites: 109, newToday: 18, resolved: 86, pending: 23 },
  detectionRate: 86,
  compliance: 94,
  inspectionLoad: 20,
  byWard: wards.slice(0, 6).map((name, i) => ({ name, count: [58, 74, 41, 66, 33, 52][i] })),
  trend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, v: [22, 31, 26, 44, 38, 61, 47][i], w: [14, 19, 28, 25, 33, 30, 41][i] })),
  status: [
    { label: 'Notices served', value: 132, max: 160 },
    { label: 'Inspections done', value: 94, max: 160 },
    { label: 'Pending review', value: 61, max: 160 },
    { label: 'Demolitions ordered', value: 18, max: 160 },
  ],
};

export const investigations = incidents.filter(i => i.severity !== 'low').slice(0, 12).map((i, n) => ({
  ...i, officer: ['R. Deshmukh', 'A. Kulkarni', 'S. Patil', 'M. Iyer'][n % 4], due: `${n + 2} Dec`,
}));
