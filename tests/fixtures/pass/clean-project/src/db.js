import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = dirname(fileURLToPath(import.meta.url));
const migrationDir = join(here, '..', 'migrations');

export const db = new Database(join(here, '..', 'data', 'member-hub.db'));
db.pragma('journal_mode = WAL');

export function migrate() {
  const files = readdirSync(migrationDir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    db.exec(readFileSync(join(migrationDir, f), 'utf-8'));
  }
  return files.length;
}

if (process.argv[2] === 'migrate') {
  console.log(`applied ${migrate()} migration files`);
}
