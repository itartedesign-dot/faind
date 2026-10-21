// D1 finto per le prove in locale: stessa interfaccia (prepare → bind → run/first/all) sopra node:sqlite.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

export function makeDb() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const db = { prepare: (sql) => ({ bind: (...a) => ({
    run: async () => { const r = sqlite.prepare(sql).run(...a); return { meta: { changes: Number(r.changes) } }; },
    first: async () => sqlite.prepare(sql).get(...a) || null,
    all: async () => ({ results: sqlite.prepare(sql).all(...a) }) }) }) };
  return { db, sqlite };
}
