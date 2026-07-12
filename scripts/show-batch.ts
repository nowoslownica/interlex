import Database from 'better-sqlite3';
import fs from 'fs';

const CSV = '/Users/georgecarpow/Documents/own/interlex/meanings_definitions.csv';
const DB = process.env.SQLITE_DB || '/Users/georgecarpow/Documents/own/interlex/interlex.db';

const batchIdx = parseInt(process.argv[2], 10);
const batchSize = parseInt(process.argv[3], 10) || 100;
const mode = process.argv[4] || 'show';

if (isNaN(batchIdx) || batchIdx < 0) {
  console.error('Usage: npx tsx scripts/show-batch.ts <BATCH_IDX> [BATCH_SIZE=100] [show|append]');
  console.error('  npx tsx scripts/show-batch.ts 0      # show 100 items');
  console.error('  npx tsx scripts/show-batch.ts 0 200   # show 200 items');
  console.error('  BATCH_SIZE=300 npx tsx scripts/show-batch.ts 0  | ...');
  process.exit(1);
}

const doneIds = new Set<number>();
if (fs.existsSync(CSV)) {
  const raw = fs.readFileSync(CSV, 'utf-8');
  const lines = raw.trim().split('\n').slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const id = parseInt(line.split(';')[0], 10);
    if (!isNaN(id)) doneIds.add(id);
  }
}

const db = new Database(DB);
const allEmpty = db.prepare(`
  SELECT m.id, l.value
  FROM meanings m
  JOIN lexemes l ON m.lexemeId = l.id
  WHERE (m.meaning IS NULL OR m.meaning = '')
    AND m.id NOT IN (${[...doneIds].join(',') || '0'})
  ORDER BY m.id ASC
`).all() as { id: number; value: string }[];

const totalRemaining = allEmpty.length;
const offset = batchIdx * batchSize;
const rows = allEmpty.slice(offset, offset + batchSize);

if (mode === 'show') {
  console.log(JSON.stringify(rows, null, 2));
  console.error(`Batch ${batchIdx}: ${rows.length} meanings (offset ${offset}, ${totalRemaining} remaining)`);
} else if (mode === 'append') {
  let csvLines: string[] = [];
  const rl = fs.readFileSync('/dev/stdin', 'utf-8');
  csvLines = rl.trim().split('\n').filter(l => l.trim());
  const existing = fs.readFileSync(CSV, 'utf-8');
  const clean = existing.endsWith('\n') ? existing : existing + '\n';
  fs.writeFileSync(CSV, clean + csvLines.join('\n') + '\n');
  console.error(`Appended ${csvLines.length} lines to CSV`);
} else {
  console.error(`Unknown mode: ${mode}`);
  process.exit(1);
}