import { query } from '../config/db.js';
import { STATUS_LABEL, ACTIVE, code, ago, handler } from './helpers.js';

export const incidentRows = async (statusFilter = ACTIVE) => {
  const { rows } = await query(`
    SELECT c.id, c.status, c.created_at AS case_created, c.comments,
           d.lat, d.lng, d.violation_type, d.severity, d.confidence, d.created_at AS detected_at,
           z.name AS ward, u.name AS officer
    FROM cases c
    JOIN detections d ON d.id = c.detection_id
    LEFT JOIN surveys s ON s.id = d.survey_after_id
    LEFT JOIN zones z ON z.id = s.zone_id
    LEFT JOIN users u ON u.id = c.official_id
    WHERE c.status IN ${statusFilter}
    ORDER BY d.created_at DESC
    LIMIT 500`);
  return rows;
};

const shape = (r) => ({
  id: code(r.id), caseId: r.id, lat: r.lat, lng: r.lng,
  ward: r.ward || 'Unassigned', type: r.violation_type, severity: r.severity,
  status: STATUS_LABEL[r.status], detected: ago(r.detected_at),
  confidence: Math.round((r.confidence ?? 0) * 100),
});

export const getIncidents = handler(async (req, res) => {
  res.json((await incidentRows()).map(shape));
});

export const getInvestigations = handler(async (req, res) => {
  const rows = await incidentRows(`('under_review','verified_unauthorized')`);
  res.json(rows.map(r => ({
    ...shape(r),
    officer: r.officer || 'Unassigned',
    due: new Date(new Date(r.case_created).getTime() + 14 * 864e5)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  })));
});

export const getZones = handler(async (req, res) => {
  const { rows } = await query('SELECT id, name, geojson FROM zones ORDER BY name');
  res.json(rows);
});
