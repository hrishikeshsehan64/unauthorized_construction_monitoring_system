// Fills the database with demo data. Usage: npm run seed   (add --force to wipe and reseed)
// Change the city with SEED_LAT / SEED_LNG / SEED_ZONES in .env, e.g.
//   SEED_LAT=28.6139  SEED_LNG=77.2090  SEED_ZONES=Rohini,Dwarka,Karol Bagh,Saket
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool, { initDb } from '../config/db.js';

const LAT = Number(process.env.SEED_LAT) || 18.5204;
const LNG = Number(process.env.SEED_LNG) || 73.8567;
const ZONES = (process.env.SEED_ZONES || 'Kothrud,Hadapsar,Baner,Wakad,Kharadi,Katraj,Aundh,Yerwada').split(',').map(s => s.trim());
const TYPES = ['Unapproved extra floor', 'No building permit', 'Encroachment', 'Setback violation', 'Change of land use'];
const SEV = ['critical', 'high', 'medium', 'low'];
const STATUS = ['new', 'under_review', 'verified_unauthorized', 'resolved', 'authorized', 'false_positive'];
const pick = (a, w) => { if (!w) return a[Math.floor(Math.random() * a.length)]; let r = Math.random() * w.reduce((x, y) => x + y), i = 0; while ((r -= w[i]) > 0) i++; return a[i]; };

if (!(await initDb())) { console.error('Cannot reach the database. Check DB_* values in .env'); process.exit(1); }
const force = process.argv.includes('--force');
const { rows: [{ n }] } = await pool.query('SELECT count(*)::int AS n FROM zones');
if (n > 0 && !force) { console.log('Database already has data. Use `npm run seed -- --force` to wipe and reseed.'); process.exit(0); }
if (force) await pool.query('TRUNCATE notifications, cases, detections, surveys, zones, users CASCADE');

const hash = await bcrypt.hash('admin123', 10);
const users = [];
for (const [name, email, role] of [['Admin', 'admin@usms.local', 'admin'], ['R. Deshmukh', 'rd@usms.local', 'official'], ['A. Kulkarni', 'ak@usms.local', 'official'], ['S. Patil', 'sp@usms.local', 'official']]) {
  const { rows } = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,role', [name, email, hash, role]);
  users.push(rows[0]);
}
const officials = users.filter(u => u.role === 'official');

let total = 0;
for (let z = 0; z < ZONES.length; z++) {
  // each zone sits at a spot around the city centre
  const ang = (z / ZONES.length) * Math.PI * 2, cLat = LAT + Math.sin(ang) * 0.045, cLng = LNG + Math.cos(ang) * 0.06;
  const geo = { type: 'Point', coordinates: [cLng, cLat] };
  const { rows: [zone] } = await pool.query('INSERT INTO zones (name, geojson) VALUES ($1,$2) RETURNING id', [ZONES[z], geo]);
  const mk = async (d) => (await pool.query('INSERT INTO surveys (zone_id, operator_id, capture_date, image_path) VALUES ($1,$2,current_date - $3::int,$4) RETURNING id', [zone.id, users[0].id, d, `/uploads/${ZONES[z]}-${d}d.jpg`])).rows[0].id;
  const before = await mk(30), after = await mk(1);
  const count = 4 + Math.floor(Math.random() * 6);
  for (let k = 0; k < count; k++) {
    const lat = cLat + (Math.random() - .5) * 0.035, lng = cLng + (Math.random() - .5) * 0.045;
    const ageH = Math.floor(Math.random() * 24 * 9);
    const { rows: [det] } = await pool.query(
      `INSERT INTO detections (survey_before_id, survey_after_id, lat, lng, geometry, violation_type, severity, confidence, area_sq_meters, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now() - ($10 || ' hours')::interval) RETURNING id`,
      [before, after, lat, lng, { type: 'Point', coordinates: [lng, lat] }, pick(TYPES), pick(SEV, [1, 2, 4, 4]), 0.7 + Math.random() * 0.29, 40 + Math.random() * 400, ageH]);
    const status = pick(STATUS, [3, 4, 4, 3, 1, 1]);
    await pool.query('INSERT INTO cases (detection_id, status, official_id, created_at, updated_at) VALUES ($1,$2,$3, now() - ($4 || \' hours\')::interval, now() - ($5 || \' hours\')::interval)',
      [det.id, status, status === 'new' ? null : pick(officials).id, ageH, Math.max(0, ageH - Math.floor(Math.random() * 40))]);
    total++;
  }
}
console.log(`Seeded ${ZONES.length} zones, ${total} detections/cases, 4 users.\nLogin: admin@usms.local / admin123`);
await pool.end();
