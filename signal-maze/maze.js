/* =====================================================================
   FAIND SIGNAL MAZE — le mappe
   ---------------------------------------------------------------------
   Griglia 15 × 18 tile. Lo scheletro è fisso: un reticolo di corridoi (righe 1, 7, 13, 16 e colonne 1, 7, 13) che
   lascia quattro riquadri 5 × 5. In tre riquadri nasce un ufficio a L o a T (tre tile di larghezza, una porta, una
   scrivania nel punto d'incontro dei bracci), il quarto è un riempimento. Da lì ogni livello cambia: forma e
   orientamento degli uffici, riempimento, tratti di corridoio tolti, specchiature, posto di chiavi e documenti.
   Il seme dipende solo dal numero del livello, quindi le mappe sono sempre le stesse e si possono verificare
   una volta per tutte (test-maze.mjs). Le otto aperture sui bordi stanno su due righe e due colonne simmetriche,
   così ogni specchiatura le lascia collegate a coppie.
   ===================================================================== */
export const W = 15, H = 18;
export const LEVELS = 15;
export const T = { WALL: 0, FLOOR: 1, OFFICE: 2, DESK: 3, DOOR: 4, EXIT: 5, OPEN: 6 };
export const COLORS = ['orange', 'yellow', 'cyan'];
export const OPEN_ROWS = [4, 13], OPEN_COLS = [4, 10];

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const wrapX = (x) => ((x % W) + W) % W, wrapY = (y) => ((y % H) + H) % H;
export const idx = (x, y) => wrapY(y) * W + wrapX(x);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const isCorr = (g, x, y) => { const t = g[idx(x, y)]; return t === T.FLOOR || t === T.OPEN; };

/** Distanze a piedi (solo corridoi, con i passaggi sui bordi) da una tile. -1 = non raggiungibile. */
export function bfs(g, sx, sy) {
  const d = new Int16Array(W * H).fill(-1); const q = [idx(sx, sy)]; d[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of DIRS) { const j = idx(x + dx, y + dy); if (d[j] < 0 && isCorr(g, x + dx, y + dy)) { d[j] = d[i] + 1; q.push(j); } }
  }
  return d;
}

/* ---- forme degli uffici: celle 3 × 3 interne (riga, colonna), scrivania, porte possibili (cella, direzione verso l'esterno) ---- */
function shapeL(k) {   // k: angolo 0 alto-sx, 1 alto-dx, 2 basso-sx, 3 basso-dx
  const cr = k < 2 ? 0 : 2, cc = k % 2 === 0 ? 0 : 2, hx = cc === 0 ? 1 : -1, vy = cr === 0 ? 1 : -1;
  const cells = [[cr, cc], [cr, cc + hx], [cr, cc + 2 * hx], [cr + vy, cc], [cr + 2 * vy, cc]];
  return { cells, desk: [cr, cc], doors: [{ cell: [cr, cc + 2 * hx], dir: [hx, 0] }, { cell: [cr + 2 * vy, cc], dir: [0, vy] }] };
}
function shapeT(k) {   // k: sbarra in alto, in basso, a sinistra, a destra
  const rot = ([r, c]) => k === 0 ? [r, c] : k === 1 ? [2 - r, c] : k === 2 ? [c, r] : [c, 2 - r];
  const rd = ([dx, dy]) => k === 0 ? [dx, dy] : k === 1 ? [dx, -dy] : k === 2 ? [dy, dx] : [-dy, dx];
  const cells = [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]].map(rot);
  return { cells, desk: rot([0, 1]), doors: [{ cell: rot([2, 1]), dir: rd([0, 1]) }, { cell: rot([2, 1]), dir: rd([0, 1]) }, { cell: rot([0, 0]), dir: rd([-1, 0]) }, { cell: rot([0, 2]), dir: rd([1, 0]) }] };
}
const SLOTS = [[2, 2], [8, 2], [2, 8], [8, 8]];   // [riga, colonna] dell'angolo alto-sinistro del riquadro 5 × 5

function seedFor(level) { return 7001 + level * 7919; }

function carve(g, x, y, t) { g[idx(x, y)] = t === undefined ? T.FLOOR : t; }

/** Segmenti di corridoio che si possono togliere per rendere il labirinto meno aperto. */
function segments(extraCols) {
  const s = [];
  for (const r of [1, 7, 13, 16]) { s.push(range(2, 6).map((c) => [c, r])); s.push(range(8, 12).map((c) => [c, r])); }
  for (const c of [1, 7, 13]) { s.push(range(2, 6).map((r) => [c, r])); s.push(range(8, 12).map((r) => [c, r])); }
  for (const c of [1, 13].concat(extraCols)) s.push([[c, 14], [c, 15]]);
  return s;
}
const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };

function deadEndFree(g) {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (isCorr(g, x, y)) {
    let n = 0; for (const [dx, dy] of DIRS) if (isCorr(g, x + dx, y + dy)) n++;
    if (n < 2) return false;
  }
  return true;
}
function connected(g) {
  let first = -1, count = 0;
  for (let i = 0; i < W * H; i++) if (g[i] === T.FLOOR || g[i] === T.OPEN) { count++; if (first < 0) first = i; }
  const d = bfs(g, first % W, (first / W) | 0); let seen = 0; for (let i = 0; i < W * H; i++) if (d[i] >= 0) seen++;
  return seen === count;
}

function generate(level, attempt) {
  const rng = mulberry32(seedFor(level) + attempt * 104729);
  const ri = (n) => Math.floor(rng() * n), pick = (a) => a[ri(a.length)];
  const g = new Uint8Array(W * H);
  // reticolo di corridoi
  for (const r of [1, 7, 13, 16]) for (let c = 1; c <= 13; c++) carve(g, c, r);
  for (const c of [1, 7, 13]) for (let r = 1; r <= 16; r++) { if (c === 7 && (r === 14 || r === 15)) continue; carve(g, c, r); }
  for (const c of [4, 10]) { carve(g, c, 0, T.OPEN); carve(g, c, H - 1, T.OPEN); }
  for (const r of OPEN_ROWS) { carve(g, 0, r, T.OPEN); carve(g, W - 1, r, T.OPEN); }
  // sotto: due righe di blocchi con qualche varco
  const gapPool = [3, 4, 5, 6, 8, 9, 10, 11]; const extraCols = [];
  const ng = 1 + ri(2);
  while (extraCols.length < ng) { const c = pick(gapPool); if (extraCols.every((e) => Math.abs(e - c) > 2)) extraCols.push(c); }
  for (const c of extraCols) { carve(g, c, 14); carve(g, c, 15); }
  // c'è sempre la colonna centrale solo se estratta: la 7 non ha i varchi di default
  // riquadri: tre uffici e un riempimento
  const order = SLOTS.map((s, i) => [rng(), i]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const fillerSlot = order[0], officeSlots = order.slice(1);
  const colorPerm = [0, 1, 2].sort(() => rng() - 0.5);
  const offices = [];
  officeSlots.forEach((si, n) => {
    const [r0, c0] = SLOTS[si];
    const isL = level <= 2 ? n !== 1 : rng() < 0.5;   // nei primi livelli due L e una T
    const sh = isL ? shapeL(ri(4)) : shapeT(ri(4));
    const dr = pick(sh.doors);
    const gx = (cell) => c0 + 1 + cell[1], gy = (cell) => r0 + 1 + cell[0];
    for (const cell of sh.cells) carve(g, gx(cell), gy(cell), T.OFFICE);
    carve(g, gx(sh.desk), gy(sh.desk), T.DESK);
    const door = [gx(dr.cell) + dr.dir[0], gy(dr.cell) + dr.dir[1]];
    carve(g, door[0], door[1], T.DOOR);
    offices.push({
      id: n, color: colorPerm[n], shape: isL ? 'L' : 'T',
      cells: sh.cells.map((c) => [gx(c), gy(c)]), desk: [gx(sh.desk), gy(sh.desk)], door,
      inside: [gx(dr.cell), gy(dr.cell)], front: [door[0] + dr.dir[0], door[1] + dr.dir[1]], dir: dr.dir
    });
  });
  // riempimento del quarto riquadro
  {
    const [r0, c0] = SLOTS[fillerSlot], kind = ri(4);
    if (kind === 1 || kind === 3) for (let r = 0; r < 5; r++) carve(g, c0 + 2, r0 + r);
    if (kind === 2 || kind === 3) for (let c = 0; c < 5; c++) carve(g, c0 + c, r0 + 2);
  }
  // tratti tolti: più numerosi salendo di livello
  const want = level <= 2 ? 0 : level <= 5 ? 1 : level <= 9 ? 2 : level <= 12 ? 3 : 4;
  const keep = new Set(); for (const o of offices) keep.add(idx(o.front[0], o.front[1]));
  let removed = 0;
  const segs = segments(extraCols).map((s) => [rng(), s]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  for (const s of segs) {
    if (removed >= want) break;
    if (s.some(([x, y]) => keep.has(idx(x, y)) || g[idx(x, y)] !== T.FLOOR)) continue;
    const saved = s.map(([x, y]) => g[idx(x, y)]);
    s.forEach(([x, y]) => { g[idx(x, y)] = T.WALL; });
    if (deadEndFree(g) && connected(g)) removed++; else s.forEach(([x, y], i) => { g[idx(x, y)] = saved[i]; });
  }
  // specchiature (conservano le aperture accoppiate)
  const mx = rng() < 0.5, my = rng() < 0.5;
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out[idx(x, y)] = g[idx(mx ? W - 1 - x : x, my ? H - 1 - y : y)];
  const fx = (p) => [mx ? W - 1 - p[0] : p[0], my ? H - 1 - p[1] : p[1]];
  for (const o of offices) { o.cells = o.cells.map(fx); o.desk = fx(o.desk); o.door = fx(o.door); o.inside = fx(o.inside); o.front = fx(o.front); o.dir = [mx ? -o.dir[0] : o.dir[0], my ? -o.dir[1] : o.dir[1]]; }
  return { rng, g: out, offices, level };
}

export function buildLevel(level) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const { rng, g, offices } = generate(level, attempt);
    if (!deadEndFree(g) || !connected(g)) continue;
    // Faindo parte vicino al centro in basso, nel corridoio più vicino
    let best = null;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[idx(x, y)] === T.FLOOR) {
      let n = 0; for (const [dx, dy] of DIRS) if (isCorr(g, x + dx, y + dy)) n++;
      const s = Math.abs(x - 7) * 1.5 + Math.abs(y - 13) - (n >= 3 ? 1.2 : 0);
      if (!best || s < best.s) best = { s, x, y };
    }
    const start = [best.x, best.y];
    const dS = bfs(g, start[0], start[1]);
    const doorFronts = offices.map((o) => bfs(g, o.front[0], o.front[1]));
    const nearDoor = (i) => Math.min(...doorFronts.map((d) => d[i]));
    // uscita: sempre in alto al centro (muro in alto, colonna 7), davanti c'è il corridoio centrale
    const exit = [7, 0], exitFront = [7, 1];
    if (g[idx(7, 0)] !== T.WALL || g[idx(7, 1)] !== T.FLOOR) continue;
    g[idx(7, 0)] = T.EXIT;
    // punti dove ricompaiono i robot: lontani da Faindo e dalle porte
    const floors = []; for (let i = 0; i < W * H; i++) if (g[i] === T.FLOOR && dS[i] >= 9 && nearDoor(i) >= 6) floors.push(i);
    if (floors.length < 4) continue;
    const spawns = [];
    let cur = floors[Math.floor(rng() * floors.length)]; spawns.push(cur);
    while (spawns.length < 4) {   // il successivo massimizza la distanza minima dai già scelti
      let bi = -1, bs = -1;
      for (const f of floors) { if (spawns.includes(f)) continue; const m = Math.min(...spawns.map((s) => { const d = bfs(g, s % W, (s / W) | 0); return d[f]; })); if (m > bs) { bs = m; bi = f; } }
      if (bi < 0) break; spawns.push(bi);
    }
    if (spawns.length < 4) continue;
    const robots = spawns.map((s) => [s % W, (s / W) | 0]);
    // chiavi e documenti: nei corridoi, a distanza crescente dalle porte, mai su partenza, uscite, porte o aperture
    const taken = new Set([idx(start[0], start[1]), idx(exitFront[0], exitFront[1]), ...robots.map((r) => idx(r[0], r[1])), ...offices.map((o) => idx(o.front[0], o.front[1]))]);
    const keys = [], docs = [], placed = [];
    const far = (x, y, mind) => placed.every((p) => Math.abs(p[0] - x) + Math.abs(p[1] - y) >= mind);
    let ok = true;
    // per ogni ufficio: un punto di raccolta a 3-7 passi dalla porta (più lontano salendo di livello) e, attorno,
    // la chiave e i cinque documenti dello stesso colore, a pochi passi uno dall'altro: percorsi brevi
    const radius = Math.min(8, 5 + Math.round(level * 0.2));
    for (const o of offices) {
      const d = doorFronts[o.id], lo = 3, hi = Math.min(10, 4 + Math.round(level * 0.4));
      const anchors = []; for (let i = 0; i < W * H; i++) if (g[i] === T.FLOOR && !taken.has(i) && d[i] >= lo && d[i] <= hi) anchors.push(i);
      if (!anchors.length) { ok = false; break; }
      const a = anchors[Math.floor(rng() * anchors.length)], da = bfs(g, a % W, (a / W) | 0);
      const cand = []; for (let i = 0; i < W * H; i++) if (g[i] === T.FLOOR && !taken.has(i) && da[i] >= 0 && da[i] <= radius && d[i] >= 2) cand.push(i);
      const pickN = (n, mind) => {
        const got = [];
        for (let t = 0; t < 120 && got.length < n; t++) {
          const i = cand[Math.floor(rng() * cand.length)], x = i % W, y = (i / W) | 0;
          if (!taken.has(i) && far(x, y, mind)) { taken.add(i); placed.push([x, y]); got.push([x, y]); }
        }
        return got;
      };
      const dd = pickN(5, 2), k = pickN(1, 2);
      if (!k.length || dd.length < 5) { ok = false; break; }
      keys.push({ x: k[0][0], y: k[0][1], color: o.color }); dd.forEach(([x, y]) => docs.push({ x, y, color: o.color }));
    }
    if (!ok) continue;
    return { level, w: W, h: H, grid: g, offices, exit, exitFront, start, robots, keys, docs };
  }
  throw new Error('nessuna mappa valida per il livello ' + level);
}

export function asciiMap(L) {
  const rows = [];
  for (let y = 0; y < H; y++) {
    let s = '';
    for (let x = 0; x < W; x++) {
      const t = L.grid[idx(x, y)]; let ch = ' #.o$Dx.'.charAt(t === 0 ? 1 : t === 1 ? 2 : t === 2 ? 3 : t === 3 ? 4 : t === 4 ? 5 : t === 5 ? 6 : 7);
      const o = L.offices.find((q) => (q.door[0] === x && q.door[1] === y)); if (o) ch = 'abc'[o.id];
      if (L.start[0] === x && L.start[1] === y) ch = 'F';
      if (L.robots.some((r) => r[0] === x && r[1] === y)) ch = 'R';
      const k = L.keys.find((q) => q.x === x && q.y === y); if (k) ch = 'k';
      const d = L.docs.find((q) => q.x === x && q.y === y); if (d) ch = 'd';
      s += ch;
    }
    rows.push(s);
  }
  return rows.join('\n');
}
