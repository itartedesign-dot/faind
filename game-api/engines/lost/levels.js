// COPIA GENERATA da lost-signal/levels.js con game-api/sync-engines.mjs: non modificare qui.
/* FAIND LOST SIGNAL — accesso alle mappe: quelle salvate (levels-data.js) e, oltre quelle, mappe generate e verificate. */
import { LEVEL_DATA } from './levels-data.js';
import { generate, parse, analyze, COLS, ROWS, liftCycle } from './levelgen.js';

export { COLS, ROWS };
const cache = new Map();

/** Mappa del livello n (1…): { rows, tiles:Set(idx), start:{c,r}, goal:{c,r}, news:[{c,r}], lifts:[{a,b,len,cycle,off}], rocks:[{axis,lane}] }. */
export function getLevel(n) {
  if (cache.has(n)) return cache.get(n);
  const E = n >= 1 && n <= LEVEL_DATA.length ? LEVEL_DATA[n - 1] : null;
  let rows = E ? E.rows : null;
  if (!rows) {
    // rete di sicurezza: oltre le mappe salvate (ce ne sono 50) una mappa nuova, senza ascensori né rocce
    const g = generate(Math.min(15, n), 1 + Math.floor(n / 15) + n * 31);
    rows = g ? g.rows : LEVEL_DATA[LEVEL_DATA.length - 1].rows;
  }
  const M = parse(rows), at = (i) => ({ c: i % COLS, r: (i / COLS) | 0 });
  const pt = (p) => ({ c: p[0], r: p[1] });
  const lifts = ((E && E.lifts) || []).map((l) => { const len = Math.abs(l.b[0] - l.a[0]) + Math.abs(l.b[1] - l.a[1]); return { a: pt(l.a), b: pt(l.b), len, cycle: liftCycle(len), off: l.off }; });
  const L = { n, rows, tiles: M.tiles, start: at(M.start), goal: at(M.goal), news: M.news.map(at), lifts, rocks: (E && E.rocks) || [] };
  cache.set(n, L); return L;
}
export { analyze };
