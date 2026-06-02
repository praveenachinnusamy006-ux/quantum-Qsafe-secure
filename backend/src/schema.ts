import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  trustScore: integer("trust_score").notNull().default(50),
  quantumRiskScore: integer("quantum_risk_score").notNull().default(50),
  status: text("status").notNull().default("active"),
  certificationLevel: text("certification_level").notNull().default("none"),
  headquarters: text("headquarters").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  lastCertScan: timestamp("last_cert_scan", { withTimezone: true }),
  certValid: boolean("cert_valid"),
  certExpiresAt: timestamp("cert_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const threatsTable = pgTable("threats", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id"),
  title: text("title").notNull(),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shorSimulationsTable = pgTable("shor_simulations", {
  id: serial("id").primaryKey(),
  n: integer("n").notNull(),
  a: integer("a"),
  period: integer("period"),
  factor1: integer("factor1"),
  factor2: integer("factor2"),
  success: boolean("success").notNull().default(false),
  modSequence: jsonb("mod_sequence"),
  steps: integer("steps").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Bumblebee: developer endpoint supply-chain scanner
// scanTarget = workstation path, repo root, or dev machine identifier
export const bumblebeeScansTable = pgTable("bumblebee_scans", {
  id: serial("id").primaryKey(),
  scanTarget: text("scan_target").notNull(),
  scanDepth: text("scan_depth").notNull(),
  overallRisk: integer("overall_risk").notNull().default(0),
  anomalyCount: integer("anomaly_count").notNull().default(0),
  riskScores: jsonb("risk_scores"),
  anomalies: jsonb("anomalies"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
