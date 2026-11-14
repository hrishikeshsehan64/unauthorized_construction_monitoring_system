export const STATUS_LABEL = {
  new: 'Open', under_review: 'Under review', verified_unauthorized: 'Notice served',
  authorized: 'Authorized', false_positive: 'False positive', resolved: 'Resolved',
};
export const ACTIVE = `('new','under_review','verified_unauthorized')`;

export const code = (id) => 'UC-' + String(id).replace(/-/g, '').slice(0, 5).toUpperCase();

export function ago(date) {
  const h = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 36e5));
  return h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

// Wraps async handlers: DB trouble => 503 (the frontend then falls back to demo data).
export const handler = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(`${req.method} ${req.originalUrl} failed:`, err.message);
    res.status(503).json({ error: 'Database unavailable', detail: err.message });
  }
};
