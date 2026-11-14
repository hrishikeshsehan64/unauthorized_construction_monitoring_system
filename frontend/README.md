# Unauthorized Construction Monitoring System (USMS) - Frontend

A minimal, high-craft React frontend engineered specifically for the USMS Express & Prisma PostgreSQL backend.

## Architecture & Features

Designed around the 4 core Prisma backend entities and their relational workflows:

1. **Monitored Construction Sites (`/sites`)**
   - View, search, register, edit, and delete monitored construction sites.
   - Coordinates (latitude/longitude) with quick-navigation to geospatial map.
   - Direct triggers to schedule drone flights or file violation reports.

2. **Drone Aerial Surveillance (`/surveys`)**
   - Mission registry tracking drone photogrammetry and LiDAR sweeps.
   - Status tracking (`PENDING`, `COMPLETED`, `CANCELLED`) with instant inline status updates.
   - Filter by status and target construction site.
   - 1-click violation report generation from survey findings.

3. **Violation Reports (`/reports`)**
   - Core log of unauthorized construction, setback violations, and unpermitted building activity.
   - Status workflow (`PENDING`, `UNDER_INVESTIGATION`, `VERIFIED`, `REJECTED`).
   - Relational linkage to both the site and the optional drone survey.
   - 1-click "Investigate" action to initiate enforcement cases.

4. **Enforcement & Investigations (`/investigations`)**
   - Active legal enforcement cases, field verification notes, and hearings.
   - Case status tracking (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
   - Strictly enforces the 1-to-1 unique relationship with violation reports.

5. **Geospatial Surveillance Map (`/map`)**
   - Full-screen interactive Leaflet map plotting construction sites and color-coded report pins.
   - Interactive popups with site details and reported unauthorized activities.
   - Fast filtering by compliance status and name search.

6. **Command Center Dashboard (`/dashboard`)**
   - Live telemetry KPI cards (Sites, Drone Sweeps, Reports, Investigations).
   - Embedded real-time geospatial surveillance preview.
   - Recent violations alert feed with 1-click actions.
   - Compliance index gauge and resolution funnel analytics.

## Backend Connection & Local Mode

- **Live Backend**: When the Express API is running on `:5001`, all CRUD operations synchronize in real time with the PostgreSQL database.
- **Local Fallback Mode**: If the backend database is unreachable or offline, the app automatically switches to schema-compliant in-memory state with realistic demo data, allowing every action (creation, updates, deletions) to be tested without errors. The header displays an active connection indicator with a 1-click reconnect button.

## Getting Started

### 1. Run the Backend API
From the root repository directory:
```bash
npm install
npm run dev     # Starts Express server on http://localhost:5001
```

### 2. Run the Frontend
From the `frontend` directory:
```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on http://localhost:3000
```
Open `http://localhost:3000` in your browser.
