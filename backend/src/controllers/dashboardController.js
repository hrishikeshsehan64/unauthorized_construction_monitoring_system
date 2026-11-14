import { query } from '../config/db.js';
import { handler } from './helpers.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getDashboard = handler(async (req, res) => {
  const [counts, centre, wards, trend] = await Promise.all([
    query(`SELECT
        count(*) FILTER (WHERE status IN ('new','under_review','verified_unauthorized'))::int AS active,
        count(*) FILTER (WHERE status = 'resolved')::int AS resolved,
        count(*) FILTER (WHERE status IN ('new','under_review'))::int AS pending,
        count(*) FILTER (WHERE status = 'new')::int AS s_new,
        count(*) FILTER (WHERE status = 'under_review')::int AS s_review,
        count(*) FILTER (WHERE status = 'verified_unauthorized')::int AS s_verified,
        count(*) FILTER (WHERE status = 'false_positive')::int AS false_pos,
        count(*) FILTER (WHERE status IN ('resolved','authorized'))::int AS compliant,
        count(*)::int AS total,
        (SELECT count(*)::int FROM detections WHERE created_at > now() - interval '24 hours') AS new_today
      FROM cases`),
    query(`SELECT avg(lat) AS lat, avg(lng) AS lng FROM detections`),
    query(`SELECT coalesce(z.name,'Unassigned') AS name, count(*)::int AS count
           FROM cases c JOIN detections d ON d.id = c.detection_id
           LEFT JOIN surveys s ON s.id = d.survey_after_id LEFT JOIN zones z ON z.id = s.zone_id
           WHERE c.status IN ('new','under_review','verified_unauthorized')
           GROUP BY 1 ORDER BY 2 DESC LIMIT 6`),
    query(`SELECT g::date AS day,
             (SELECT count(*)::int FROM detections WHERE created_at::date = g::date) AS v,
             (SELECT count(*)::int FROM cases WHERE status='resolved' AND updated_at::date = g::date) AS w
           FROM generate_series(current_date - 6, current_date, '1 day') g ORDER BY 1`),
  ]);

  const c = counts.rows[0];
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const lat = centre.rows[0].lat, lng = centre.rows[0].lng;

  res.json({
    center: lat != null ? [lat, lng] : undefined,
    region: process.env.REGION_NAME || 'Monitored zones',
    kpis: { activeSites: c.active, newToday: c.new_today, resolved: c.resolved, pending: c.pending },
    detectionRate: c.total ? 100 - pct(c.false_pos, c.total) : 0,
    compliance: pct(c.compliant, c.total),
    inspectionLoad: pct(c.total - c.s_new, c.total), // share of cases already reviewed
    byWard: wards.rows,
    trend: trend.rows.map(r => ({ d: DAYS[new Date(r.day).getDay()], v: r.v, w: r.w })),
    status: [
      { label: 'Notices served', value: c.s_verified, max: c.total || 1 },
      { label: 'Under review', value: c.s_review, max: c.total || 1 },
      { label: 'New / unreviewed', value: c.s_new, max: c.total || 1 },
      { label: 'Resolved', value: c.resolved, max: c.total || 1 },
    ],
  });
});
