# Unauthorized Construction Monitoring System (USMS)

An integrated platform for civic authorities and enforcement teams to detect, survey, and investigate unauthorized construction activities using drone surveys and geospatial intelligence.

## System Components

### 1. Backend REST API (Node.js + Express + Prisma + PostgreSQL)
- **Auth API (`/auth` / `/api/auth`)**: Authentication with bcrypt password hashing and JWT sessions (`/register`, `/login`, `/me`, `/users`). Roles: `ADMIN`, `OFFICER`, `SURVEYOR`, `VIEWER`.
- **Sites API (`/sites` / `/api/sites`)**: Full CRUD for registered construction sites (`site_name`, `address`, `latitude`, `longitude`).
- **Surveys API (`/surveys` / `/api/surveys`)**: Mission tracking for drone surveys (`site_id`, `survey_date`, `survey_status: PENDING | COMPLETED | CANCELLED`, `remarks`).
- **Reports API (`/reports` / `/api/reports`)**: Incident reporting for unauthorized construction (`site_id`, `survey_id`, `description`, `status: PENDING | UNDER_INVESTIGATION | VERIFIED | REJECTED`).
- **Investigations API (`/investigations` / `/api/investigations`)**: Case management for enforcement actions (`report_id`, `investigation_date`, `investigation_notes`, `investigation_status: NOT_STARTED | IN_PROGRESS | COMPLETED`).

### 2. Frontend Web Application (React + Vite + Tailwind CSS + Leaflet)
Located in `/frontend`:
- Command Center Dashboard with live KPIs, interactive surveillance map, and incident feeds.
- Dedicated management views for **Sites**, **Drone Surveys**, **Violation Reports**, **Investigations**, and **Live Map**.
- Real-time synchronization with the backend API, plus automatic schema-compliant local fallback mode for testing.

## Quick Start

### Start the Backend
```bash
npm install
npm run dev     # Runs on http://localhost:5001
```

### Start the Frontend
```bash
cd frontend
npm install
npm run dev     # Runs on http://localhost:3000
```
