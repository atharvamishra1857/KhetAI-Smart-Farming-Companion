import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, scansTable } from "@workspace/db";
import {
  CreateScanBody,
  CreateScanResponse,
  GetDashboardSummaryResponse,
  GetMandiPricesQueryParams,
  GetMandiPricesResponse,
  GetScanParams,
  GetScanResponse,
  ListScansQueryParams,
  ListScansResponse,
} from "@workspace/api-zod";
import { diagnoseCrop } from "../lib/diagnosis";
import { fetchMandiPrices } from "../lib/mandi";

const router: IRouter = Router();

function asScan(scan: typeof scansTable.$inferSelect, imageData: string | null = null) {
  return {
    id: scan.id,
    crop: scan.crop,
    disease: scan.disease,
    status: scan.status as "healthy" | "attention" | "critical",
    confidence: scan.confidence,
    summary: scan.summary,
    treatment: scan.treatment,
    prevention: scan.prevention,
    imageData,
    createdAt: scan.createdAt.toISOString(),
  };
}

router.get("/dashboard-summary", async (req, res): Promise<void> => {
  const scans = await db
    .select()
    .from(scansTable)
    .orderBy(desc(scansTable.createdAt))
    .limit(100);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scansTable);
  const mandi = await fetchMandiPrices({ limit: 20 });
  const latestScan = scans[0] ? asScan(scans[0]) : null;
  const topMandiPrice = mandi.prices.length
    ? mandi.prices.reduce((best, current) =>
        current.modalPrice > best.modalPrice ? current : best,
      )
    : null;

  const data = {
    totalScans: count,
    healthyPlants: scans.filter((scan) => scan.status === "healthy").length,
    diseasesDetected: scans.filter((scan) => scan.status !== "healthy").length,
    averageConfidence: scans.length
      ? scans.reduce((total, scan) => total + scan.confidence, 0) / scans.length
      : 0,
    latestScan,
    topMandiPrice,
  };
  res.json(GetDashboardSummaryResponse.parse(data));
});

router.get("/mandi-prices", async (req, res): Promise<void> => {
  const parsed = GetMandiPricesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid mandi filters");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = await fetchMandiPrices(parsed.data);
  res.json(GetMandiPricesResponse.parse(data));
});

router.get("/scans", async (req, res): Promise<void> => {
  const parsed = ListScansQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const scans = await db
    .select()
    .from(scansTable)
    .orderBy(desc(scansTable.createdAt))
    .limit(parsed.data.limit);
  res.json(ListScansResponse.parse(scans.map((scan) => asScan(scan))));
});

router.post("/scans", async (req, res): Promise<void> => {
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid scan body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const diagnosis = await diagnoseCrop(parsed.data.imageData, parsed.data.crop);
    const [scan] = await db
      .insert(scansTable)
      .values({
        crop: diagnosis.crop,
        disease: diagnosis.disease,
        status: diagnosis.status,
        confidence: diagnosis.confidence,
        summary: diagnosis.summary,
        treatment: diagnosis.treatment,
        prevention: diagnosis.prevention,
      })
      .returning();

    res.status(201).json(CreateScanResponse.parse(asScan(scan, parsed.data.imageData)));
  } catch (error) {
    req.log.error({ err: error }, "Crop diagnosis failed");
    res.status(502).json({
      error:
        error instanceof Error
          ? error.message
          : "Crop diagnosis service is unavailable",
    });
  }
});

router.get("/scans/:id", async (req, res): Promise<void> => {
  const parsed = GetScanParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [scan] = await db
    .select()
    .from(scansTable)
    .where(eq(scansTable.id, parsed.data.id));
  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.json(GetScanResponse.parse(asScan(scan)));
});

export default router;