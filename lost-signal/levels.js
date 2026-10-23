/* FAIND LOST SIGNAL — accesso alle mappe: quelle salvate (levels-data.js) e, oltre quelle, mappe generate e verificate. */
import { LEVEL_DATA } from './levels-data.js?v=20261024c';
import { generate, parse, analyze, COLS, ROWS, liftCycle, mulberry } from './levelgen.js?v=20261024c';

export { COLS, ROWS };
const cache = new Map();

/** Mappa del livello n (1…): { rows, tiles:Set(idx), start:{c,r}, goal:{c,r}, news:[{c,r}], flashes:[{c,r}], life:{c,r}|null, lifts:[{a,b,len,cycle,off}], rocks:[{axis,lane}] }. */
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
  // dal livello 10: flash da raccogliere (4, uno in più ogni 2 livelli, al massimo 8) e un mini Faindo che regala una vita, su zolle scelte con un seme fisso del livello
  L.flashes = []; L.life = null;
  if (n >= 10) {
    const rnd = mulberry(n * 2654435761 + 12345), taken = new Set([M.start, M.goal, ...M.news]);
    const pool = [...M.tiles].filter((i) => !taken.has(i)).sort((a, b) => a - b);
    const pick = () => at(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    L.life = pick();
    for (let k = Math.min(8, 4 + Math.floor((n - 10) / 2)); k > 0; k--) L.flashes.push(pick());
  }
  cache.set(n, L); return L;
}
export { analyze };
