import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
// Never let an idle-client error crash the process.
pool.on('error', err => console.warn('pg pool error:', err.message));

export const query = (text, params) => pool.query(text, params);

const here = path.dirname(fileURLToPath(import.meta.url));

// Creates tables if they don't exist. Resolves to true/false instead of throwing.
export const initDb = async () => {
  try {
    const sql = await fs.readFile(path.resolve(here, '../../sql/init.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Database ready');
    return true;
  } catch (err) {
    console.warn('Database unavailable:', err.message);
    return false;
  }
};

export default pool;
