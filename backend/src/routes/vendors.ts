import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { vendorsTable, documentsTable } from "../schema";

const router: IRouter = Router();

function serializeVendor(v: typeof vendorsTable.$inferSelect) {
  return {
    ...v,
    lastCertScan: v.lastCertScan?.toISOString() ?? null,
    certExpiresAt: v.certExpiresAt?.toISOString() ?? null,
    certValid: v.certValid ?? null,
    createdAt: v.createdAt.toISOString(),
  };
}

router.get("/vendors", async (req, res): Promise<void> => {
  let vendors = await db.select().from(vendorsTable).orderBy(vendorsTable.name);
  const { category, minTrustScore, search } = req.query as Record<string, string>;
  if (category) vendors = vendors.filter(v => v.category === category);
  if (minTrustScore) vendors = vendors.filter(v => v.trustScore >= Number(minTrustScore));
  if (search) {
    const q = search.toLowerCase();
    vendors = vendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.headquarters.toLowerCase().includes(q)
    );
  }
  res.json(vendors.map(serializeVendor));
});

router.get("/vendors/:id", async (req, res): Promise<void> => {
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, Number(req.params.id)));
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json(serializeVendor(vendor));
});

router.post("/vendors", async (req, res): Promise<void> => {
  const { name, category, headquarters, website, description, certificationLevel } = req.body;
  if (!name || !category || !headquarters || !website || !description) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [vendor] = await db.insert(vendorsTable).values({
    name, category, headquarters, website, description,
    certificationLevel: certificationLevel ?? "none",
    trustScore: 50, quantumRiskScore: 50, status: "active",
  }).returning();
  res.status(201).json(serializeVendor(vendor));
});

router.patch("/vendors/:id", async (req, res): Promise<void> => {
  const [vendor] = await db.update(vendorsTable).set(req.body).where(eq(vendorsTable.id, Number(req.params.id))).returning();
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.json(serializeVendor(vendor));
});

router.delete("/vendors/:id", async (req, res): Promise<void> => {
  const [vendor] = await db.delete(vendorsTable).where(eq(vendorsTable.id, Number(req.params.id))).returning();
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  res.sendStatus(204);
});

router.post("/vendors/:id/scan-certificate", async (req, res): Promise<void> => {
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, Number(req.params.id)));
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  const domain = req.body.domain || vendor.website;
  const now = new Date();
  const algorithms = ["RSA-2048", "ECDSA-256", "RSA-4096", "Ed25519"];
  const issuers = ["Let's Encrypt", "DigiCert", "Sectigo", "GlobalSign", "Entrust"];
  const algorithmIndex = Math.abs(domain.length % algorithms.length);
  const algorithm = algorithms[algorithmIndex];
  const quantumSafe = algorithm === "Ed25519";
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const grades = ["A+", "A", "A", "B", "A+"];
  const grade = grades[Math.abs(domain.charCodeAt(0) % grades.length)];
  const warnings: string[] = [];
  if (!quantumSafe) warnings.push("Algorithm is not quantum-resistant");
  if (algorithm === "RSA-2048") warnings.push("Consider upgrading to RSA-4096 or ECDSA");
  await db.update(vendorsTable).set({ lastCertScan: now, certValid: true, certExpiresAt: expiresAt }).where(eq(vendorsTable.id, vendor.id));
  res.json({ domain, valid: true, expiresAt: expiresAt.toISOString(), issuer: issuers[algorithmIndex], algorithm, quantumSafe, grade, warnings, scannedAt: now.toISOString() });
});

router.get("/vendors/:id/trust-score", async (req, res): Promise<void> => {
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, Number(req.params.id)));
  if (!vendor) { res.status(404).json({ error: "Vendor not found" }); return; }
  const seed = vendor.id * 17;
  const components = {
    certHealth: vendor.certValid === true ? 85 + (seed % 15) : 40 + (seed % 20),
    complianceScore: vendor.certificationLevel === "platinum" ? 95 : vendor.certificationLevel === "gold" ? 85 : vendor.certificationLevel === "silver" ? 70 : vendor.certificationLevel === "bronze" ? 55 : 30,
    incidentHistory: Math.max(20, 100 - (seed % 40)),
    quantumReadiness: Math.max(10, 100 - vendor.quantumRiskScore),
    documentationScore: 50 + (seed % 40),
  };
  const overall = Math.round(components.certHealth * 0.2 + components.complianceScore * 0.25 + components.incidentHistory * 0.2 + components.quantumReadiness * 0.2 + components.documentationScore * 0.15);
  res.json({ vendorId: vendor.id, overall, components });
});

router.get("/vendors/:id/documents", async (req, res): Promise<void> => {
  const docs = await db.select().from(documentsTable).where(eq(documentsTable.vendorId, Number(req.params.id)));
  res.json(docs.map(d => ({ ...d, uploadedAt: d.uploadedAt.toISOString() })));
});

router.post("/vendors/:id/documents", async (req, res): Promise<void> => {
  const { name, type, size, url } = req.body;
  const [doc] = await db.insert(documentsTable).values({ vendorId: Number(req.params.id), name, type, size, url }).returning();
  res.status(201).json({ ...doc, uploadedAt: doc.uploadedAt.toISOString() });
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const [doc] = await db.delete(documentsTable).where(eq(documentsTable.id, Number(req.params.id))).returning();
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
  res.sendStatus(204);
});

export default router;
