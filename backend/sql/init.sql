-- Schema for the unauthorized construction monitoring system (PostgreSQL 13+)

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','official','operator')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Monitoring zones (wards, localities)
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    geojson JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Surveys (image uploads)
CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    capture_date DATE NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Detections (change detection results)
CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_before_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    survey_after_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geometry JSONB,
    violation_type VARCHAR(60) NOT NULL DEFAULT 'Unapproved construction',
    severity VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
    confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
    area_sq_meters FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cases for verification workflow
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID REFERENCES detections(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN (
        'new','under_review','verified_unauthorized','authorized','false_positive','resolved'
    )),
    official_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_detections_created ON detections(created_at);
