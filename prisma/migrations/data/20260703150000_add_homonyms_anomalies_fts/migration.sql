-- Migration: Add BaseHomonym, InflectionAnomaly tables, hasAnomalies field, and FTS5 full-text search indexes
--
-- This migration:
-- 1. Adds hasAnomalies boolean to words table
-- 2. Creates base_homonyms table (prefix tree / hash map: base -> wordIds)
-- 3. Creates inflection_anomalies table (inflection anomalies per word)
-- 4. Creates FTS5 virtual tables and triggers for full-text search on all relevant tables

-- 1. Add hasAnomalies marker to words
ALTER TABLE "words" ADD COLUMN "hasAnomalies" INTEGER NOT NULL DEFAULT 0;

-- 2. Create base_homonyms table (hash map: base -> JSON array of word IDs)
CREATE TABLE IF NOT EXISTS "base_homonyms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "base" TEXT NOT NULL,
    "wordIds" TEXT NOT NULL DEFAULT '[]'
);
CREATE UNIQUE INDEX IF NOT EXISTS "base_homonyms_base_unique" ON "base_homonyms"("base");
CREATE INDEX IF NOT EXISTS "base_homonyms_base_idx" ON "base_homonyms"("base");

-- 3. Create inflection_anomalies table
CREATE TABLE IF NOT EXISTS "inflection_anomalies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "inflection" TEXT NOT NULL,
    "grammeme" TEXT NOT NULL,
    CONSTRAINT "inflection_anomalies_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "inflection_anomalies_wordId_idx" ON "inflection_anomalies"("wordId");
CREATE INDEX IF NOT EXISTS "inflection_anomalies_grammeme_idx" ON "inflection_anomalies"("grammeme");
