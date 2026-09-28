import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const scansTable = pgTable("scans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  crop: text("crop").notNull().default("Unknown crop"),
  disease: text("disease").notNull(),
  status: text("status").notNull(),
  confidence: real("confidence").notNull(),
  summary: text("summary").notNull(),
  treatment: text("treatment").array().notNull(),
  prevention: text("prevention").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;