import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db } from "../db";
import { shorSimulationsTable } from "../schema";

const router: IRouter = Router();

function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t; }
  return a;
}

function modExp(base: number, exp: number, mod: number): number {
  let result = 1; base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2); base = (base * base) % mod;
  }
  return result;
}

function findPeriod(a: number, N: number): { period: number; sequence: { x: number; value: number }[] } {
  const sequence: { x: number; value: number }[] = [];
  let current = 1;
  for (let x = 0; x <= Math.min(N + 2, 64); x++) {
    sequence.push({ x, value: current });
    current = (current * a) % N;
    if (x > 0 && current === 1) { sequence.push({ x: x + 1, value: current }); return { period: x + 1, sequence }; }
  }
  return { period: -1, sequence };
}

function runShorAlgorithm(N: number) {
  const candidateBases = [2, 3, 5, 7, 11, 13];
  for (const a of candidateBases) {
    if (a >= N) continue;
    const g = gcd(a, N);
    if (g > 1 && g < N) return { success: true, a, period: null, factor1: g, factor2: N / g, modSequence: [], steps: 1 };
    const { period: r, sequence } = findPeriod(a, N);
    if (r === -1 || r % 2 !== 0) continue;
    const halfPow = modExp(a, r / 2, N);
    if (halfPow === N - 1) continue;
    const f1 = gcd(halfPow - 1 + N, N);
    const f2 = gcd(halfPow + 1, N);
    if (f1 > 1 && f1 < N) return { success: true, a, period: r, factor1: f1, factor2: N / f1, modSequence: sequence, steps: r };
    if (f2 > 1 && f2 < N) return { success: true, a, period: r, factor1: f2, factor2: N / f2, modSequence: sequence, steps: r };
  }
  const isPrime = (n: number) => { for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false; return n > 1; };
  for (let i = 2; i <= Math.sqrt(N); i++) {
    if (N % i === 0 && !isPrime(N)) {
      const { sequence } = findPeriod(2, N);
      return { success: true, a: 2, period: null, factor1: i, factor2: N / i, modSequence: sequence, steps: sequence.length };
    }
  }
  return { success: false, a: 2, period: null, factor1: null, factor2: null, modSequence: [], steps: 0 };
}

router.post("/shor/simulate", async (req, res): Promise<void> => {
  const { n } = req.body;
  if (!n || typeof n !== "number" || n < 4) { res.status(400).json({ error: "n must be a number >= 4" }); return; }
  const result = runShorAlgorithm(n);
  const [sim] = await db.insert(shorSimulationsTable).values({
    n, a: result.a, period: result.period ?? null, factor1: result.factor1 ?? null,
    factor2: result.factor2 ?? null, success: result.success,
    modSequence: result.modSequence as any, steps: result.steps,
  }).returning();
  res.status(201).json({ ...sim, modSequence: sim.modSequence, createdAt: sim.createdAt.toISOString() });
});

router.get("/shor/simulations", async (_req, res): Promise<void> => {
  const sims = await db.select().from(shorSimulationsTable).orderBy(desc(shorSimulationsTable.createdAt)).limit(20);
  res.json(sims.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

export default router;
