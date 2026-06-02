import { Router, type IRouter } from "express";
import { db } from "../db";
import { threatsTable } from "../schema";

const router: IRouter = Router();

router.get("/threats", async (req, res): Promise<void> => {
  const threats = await db.select().from(threatsTable);
  let list = threats;
  if (req.query.severity) list = list.filter(t => t.severity === req.query.severity);
  if (req.query.vendorId) list = list.filter(t => t.vendorId === Number(req.query.vendorId));
  res.json(list.map(t => ({
    ...t,
    vendorId: t.vendorId ?? null,
    detectedAt: t.detectedAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
  })));
});

router.post("/threats", async (req, res): Promise<void> => {
  const { vendorId, title, severity, category, description } = req.body;
  if (!title || !severity || !category || !description) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [threat] = await db.insert(threatsTable).values({
    vendorId: vendorId ?? null, title, severity, category, description, status: "open",
  }).returning();
  res.status(201).json({
    ...threat,
    vendorId: threat.vendorId ?? null,
    detectedAt: threat.detectedAt.toISOString(),
    resolvedAt: threat.resolvedAt?.toISOString() ?? null,
  });
});

export default router;
