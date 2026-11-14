# USMS backend
Requires Node 18+ and PostgreSQL 13+.

1. Create the database:   createdb construction_monitor      (or: psql -c "CREATE DATABASE construction_monitor;")
2. Edit .env  -> DB_USER / DB_PASSWORD must be a real Postgres user (on macOS Homebrew it is usually your Mac username, empty password).
3. npm install
4. npm run seed           (creates tables + demo data;  login admin@usms.local / admin123)
5. npm run dev            -> http://localhost:5001

Endpoints: /api/health /api/dashboard /api/incidents /api/violations /api/investigations /api/zones /api/auth/login /api/auth/register
If Postgres is not running the server still starts; the API returns 503 and the frontend shows demo data.
