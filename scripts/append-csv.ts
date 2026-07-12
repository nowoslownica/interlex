import fs from 'fs';

const CSV = '/Users/georgecarpow/Documents/own/interlex/meanings_definitions.csv';

let input = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk: string) => { input += chunk; });
process.stdin.on('end', () => {
  const newLines = input.trim().split('\n').filter(l => l.trim());
  const existing = fs.readFileSync(CSV, 'utf-8');
  const clean = existing.endsWith('\n') ? existing : existing + '\n';
  fs.writeFileSync(CSV, clean + newLines.join('\n') + '\n');
  process.stderr.write(`Appended ${newLines.length} lines to CSV\n`);
});