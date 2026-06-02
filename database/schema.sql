-- QuantumSecure Database Schema
-- Run: psql -U postgres -d your_db -f schema.sql

CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  trust_score INTEGER NOT NULL DEFAULT 50,
  quantum_risk_score INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'active',
  certification_level TEXT NOT NULL DEFAULT 'none',
  headquarters TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT NOT NULL,
  last_cert_scan TIMESTAMPTZ,
  cert_valid BOOLEAN,
  cert_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS threats (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES vendors(id),
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shor_simulations (
  id SERIAL PRIMARY KEY,
  n INTEGER NOT NULL,
  a INTEGER,
  period INTEGER,
  factor1 INTEGER,
  factor2 INTEGER,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  mod_sequence JSONB,
  steps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bumblebee: developer endpoint supply-chain scanner
-- scan_target = workstation path, repo root, or dev machine identifier
-- Domain: local package installs, editor plugins, AI tool configs, git hooks, IDE settings
CREATE TABLE IF NOT EXISTS bumblebee_scans (
  id SERIAL PRIMARY KEY,
  scan_target TEXT NOT NULL,
  scan_depth TEXT NOT NULL,
  overall_risk INTEGER NOT NULL DEFAULT 0,
  anomaly_count INTEGER NOT NULL DEFAULT 0,
  risk_scores JSONB,
  anomalies JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
