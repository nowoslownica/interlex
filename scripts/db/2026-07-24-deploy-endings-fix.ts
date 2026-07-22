import { execFileSync } from "child_process"
import path from "path"
import Database from "better-sqlite3"

// Deploys the Phase 3 grammar-endings fix (2026-07-24) to any environment.
// Idempotent — safe to re-run.
//
// Usage:
//   SQLITE_DB=/path/to/interlex.db npx tsx scripts/db/2026-07-24-deploy-endings-fix.ts
//
// What it does:
//   1. Re-runs scripts/db/seed-endings.ts (unmodified — reused as-is, not
//      duplicated here) to upsert the corrected modern-ISV values: full noun
//      registry, one adjective fix, numeral_three/four, present-active
//      participle -ųšti/-ųťa/-ųťe/-ųťi, and the a_hard/a_soft feminine
//      overrides. Uses `ON CONFLICT ... DO UPDATE`, so already-correct rows
//      (most of the noun/adjective matrix, per the 2026-07-24 audit) are
//      harmless no-ops.
//   2. Deletes the legacy short-format grammeme rows (`SgNom`, `PlAcc`, ...)
//      that predate the current `buildGrammeme()` key format and that no
//      code path reads anymore (confirmed by grep across the whole repo).
//   3. Reports the before/after row counts.
//
// Take a filesystem backup of the target .db file before running this
// against a production database you care about, same as any other DDL/DML
// script in this repo.

const DB_PATH = process.env.SQLITE_DB || path.resolve(process.cwd(), "interlex.db")
console.log(`Target DB: ${DB_PATH}\n`)

console.log("--- Step 1: re-seeding corrected endings (scripts/db/seed-endings.ts) ---")
execFileSync("npx", ["tsx", "scripts/db/seed-endings.ts"], {
    stdio: "inherit",
    env: { ...process.env, SQLITE_DB: DB_PATH },
})

console.log("\n--- Step 2: cleaning up legacy short-format rows ---")
const db = new Database(DB_PATH)

const before = (db.prepare("SELECT COUNT(*) c FROM ending_allophones").get() as { c: number }).c
const legacy = (db.prepare(
    "SELECT COUNT(*) c FROM ending_allophones WHERE grammeme LIKE 'Sg%' OR grammeme LIKE 'Pl%' OR grammeme LIKE 'Du%'"
).get() as { c: number }).c
console.log(`Total rows before cleanup: ${before} (of which ${legacy} legacy short-format)`)

const del = db.prepare(
    "DELETE FROM ending_allophones WHERE grammeme LIKE 'Sg%' OR grammeme LIKE 'Pl%' OR grammeme LIKE 'Du%'"
).run()
console.log(`Deleted: ${del.changes} legacy rows`)

const after = (db.prepare("SELECT COUNT(*) c FROM ending_allophones").get() as { c: number }).c
console.log(`Total rows after cleanup: ${after}`)

db.close()
console.log("\nDone.")
