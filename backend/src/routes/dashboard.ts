import { Router, type IRouter } from "express";
import { db } from "../db";
import { vendorsTable, threatsTable, documentsTable } from "../schema";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable);
  const threats = await db.select().from(threatsTable);
  const documents = await db.select().from(documentsTable);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  res.json({
    totalVendors: vendors.length,
    activeVendors: vendors.filter(v => v.status === "active").length,
    underReview: vendors.filter(v => v.status === "under-review").length,
    avgTrustScore: vendors.length > 0 ? Math.round(vendors.reduce((s, v) => s + v.trustScore, 0) / vendors.length) : 0,
    avgQuantumRisk: vendors.length > 0 ? Math.round(vendors.reduce((s, v) => s + v.quantumRiskScore, 0) / vendors.length) : 0,
    criticalThreats: threats.filter(t => t.severity === "critical" && t.status !== "resolved").length,
    openThreats: threats.filter(t => t.status === "open" || t.status === "investigating").length,
    certExpiringSoon: vendors.filter(v => v.certExpiresAt != null && v.certExpiresAt > now && v.certExpiresAt <= thirtyDaysFromNow).length,
    totalDocuments: documents.length,
  });
});

router.get("/dashboard/risk-distribution", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable);
  const buckets = [
    { label: "Low (0–24)", min: 0, max: 24 },
    { label: "Moderate (25–49)", min: 25, max: 49 },
    { label: "High (50–74)", min: 50, max: 74 },
    { label: "Critical (75–100)", min: 75, max: 100 },
  ];
  res.json(buckets.map(b => ({
    label: b.label,
    count: vendors.filter(v => v.quantumRiskScore >= b.min && v.quantumRiskScore <= b.max).length,
  })));
});

router.get("/dashboard/threat-timeline", async (_req, res): Promise<void> => {
  const threats = await db.select().from(threatsTable);
  const now = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().split("T")[0];
    const dayThreats = threats.filter(t => t.detectedAt.toISOString().split("T")[0] === dayStr);
    days.push({
      date: dayStr,
      critical: dayThreats.filter(t => t.severity === "critical").length,
      high: dayThreats.filter(t => t.severity === "high").length,
      medium: dayThreats.filter(t => t.severity === "medium").length,
      low: dayThreats.filter(t => t.severity === "low").length,
    });
  }
  res.json(days);
});

router.get("/dashboard/top-vendors", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable);
  res.json(vendors.sort((a, b) => b.trustScore - a.trustScore).slice(0, 8).map(v => ({
    id: v.id, name: v.name, category: v.category,
    trustScore: v.trustScore, quantumRiskScore: v.quantumRiskScore,
    certificationLevel: v.certificationLevel,
  })));
});

router.get("/dashboard/category-breakdown", async (_req, res): Promise<void> => {
  const vendors = await db.select().from(vendorsTable);
  const categories: Record<string, { count: number; trustSum: number; riskSum: number }> = {};
  for (const v of vendors) {
    if (!categories[v.category]) categories[v.category] = { count: 0, trustSum: 0, riskSum: 0 };
    categories[v.category].count++;
    categories[v.category].trustSum += v.trustScore;
    categories[v.category].riskSum += v.quantumRiskScore;
  }
  res.json(Object.entries(categories).map(([category, data]) => ({
    category, count: data.count,
    avgTrustScore: Math.round(data.trustSum / data.count),
    avgQuantumRisk: Math.round(data.riskSum / data.count),
  })));
});

export default router;
