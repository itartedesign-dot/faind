// COPIA GENERATA da lost-signal/levels.js con game-api/sync-engines.mjs: non modificare qui.
/* FAIND LOST SIGNAL — accesso alle mappe: quelle salvate (levels-data.js) e, oltre quelle, mappe generate e verificate. */
import { LEVEL_DATA } from './levels-data.js';
import { generate, parse, analyze, COLS, ROWS, liftCycle, mulberry } from './levelgen.js';

export { COLS, ROWS };
const cache = new Map();

/** Mappa del livello n (1…): { rows, tiles:Set(idx), start:{c,r}, goal:{c,r}, news:[{c,r}], flashes:[{c,r}], life:{c,r}|null, deco:Map(idx→'wood'|'lantern'|'fall'|'bridge'), lifts:[{a,b,len,cycle,off}], rocks:[{axis,lane}] }. */
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
  // da raccogliere (zolle scelte con un seme fisso del livello): flash dal 10 (4, uno in più ogni 2 livelli fino al 13; dopo il 13 due, un livello sì e due no)
  // e mini Faindo con il più verde ogni 5 livelli (si prende solo con meno di tre vite)
  L.flashes = []; L.life = null; L.deco = new Map();
  const rnd = mulberry(n * 2654435761 + 12345), taken = new Set([M.start, M.goal, ...M.news]);
  const pool = [...M.tiles].filter((i) => !taken.has(i)).sort((a, b) => a - b);
  const pick = () => at(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  if (n % 5 === 0) L.life = pick();
  if (n >= 10) { const k = n <= 13 ? 4 + Math.floor((n - 10) / 2) : (n - 14) % 3 === 0 ? 2 : 0; for (let j = 0; j < k; j++) L.flashes.push(pick()); }
  // zolle speciali (solo grafica, la mappa non cambia): cascata sempre accesa, lampione sempre visibile con alone, legno, ponte tibetano di 1-3 pezzi
  if (n >= 3) {
    const r2 = mulberry(n * 40503 + 977), free = [...M.tiles].filter((i) => i !== M.start && i !== M.goal).sort((a, b) => a - b), used = new Set();
    const take = () => { for (let t = 0; t < 40 && free.length; t++) { const i = free[Math.floor(r2() * free.length)]; if (!used.has(i)) { used.add(i); return i; } } return -1; };
    if (n >= 5 && n % 3 === 2) { const i = take(); if (i >= 0) L.deco.set(i, 'lantern'); }
    if (n >= 8 && n % 2 === 0) { for (let k = n >= 30 ? 2 : 1; k > 0; k--) { const i = take(); if (i >= 0) L.deco.set(i, 'fall'); } }
    if (n >= 6 && n % 4 !== 0) {         // ponte: fila dritta di 1-3 zolle consecutive
      const len = 1 + Math.floor(r2() * 3), h = r2() < 0.5;
      for (let t = 0; t < 60; t++) {
        const i0 = free[Math.floor(r2() * free.length)], cs = []; let ok = true;
        for (let k = 0; k < len; k++) { const c = i0 % COLS + (h ? k : 0), r = ((i0 / COLS) | 0) + (h ? 0 : k), i = r * COLS + c; if (c >= COLS || r >= ROWS || !M.tiles.has(i) || used.has(i) || i === M.start || i === M.goal) { ok = false; break; } cs.push(i); }
        if (ok) { for (const i of cs) { used.add(i); L.deco.set(i, 'bridge'); } break; }
      }
    }
    if (n >= 3) for (const i of free) if (!used.has(i) && r2() < 0.2) L.deco.set(i, 'wood');
  }
  cache.set(n, L); return L;
}
export { analyze };
