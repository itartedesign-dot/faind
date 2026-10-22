/* FAIND LOST SIGNAL — accesso alle mappe: quelle salvate (levels-data.js) e, oltre quelle, mappe generate e verificate. */
import { LEVEL_DATA } from './levels-data.js?v=20261022b';
import { generate, parse, analyze, COLS, ROWS } from './levelgen.js?v=20261022b';

export { COLS, ROWS };
const cache = new Map();

/** Mappa del livello n (1…): { rows, tiles:Set(idx), start:{c,r}, goal:{c,r}, news:[{c,r}] }. */
export function getLevel(n) {
  if (cache.has(n)) return cache.get(n);
  let rows = n >= 1 && n <= LEVEL_DATA.length ? LEVEL_DATA[n - 1].rows : null;
  if (!rows) {
    // ogni livello oltre le mappe salvate è una mappa nuova, con la stessa verifica; la difficoltà cresce fino al 15
    const g = generate(Math.min(15, n), 1 + Math.floor(n / 15) + n * 31);
    rows = g ? g.rows : LEVEL_DATA[LEVEL_DATA.length - 1].rows;
  }
  const M = parse(rows), at = (i) => ({ c: i % COLS, r: (i / COLS) | 0 });
  const L = { n, rows, tiles: M.tiles, start: at(M.start), goal: at(M.goal), news: M.news.map(at) };
  cache.set(n, L); return L;
}
export { analyze };
