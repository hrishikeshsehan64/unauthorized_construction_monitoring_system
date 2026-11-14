import { initDb } from '../config/db.js';
const ok = await initDb();
process.exit(ok ? 0 : 1);
