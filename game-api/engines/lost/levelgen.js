// COPIA GENERATA da lost-signal/levelgen.js con game-api/sync-engines.mjs: non modificare qui.
/* =====================================================================
   FAIND LOST SIGNAL — mappe: analisi e generatore
   ---------------------------------------------------------------------
   Una mappa è una griglia COLS × ROWS di caratteri (riga 0 in alto, dove sta la palazzina):
     .  vuoto     #  zolla     S  partenza     G  zolla davanti al portone     N  zolla con un giornale
   Le 15 mappe del gioco sono state generate con questo stesso codice (tools/build-levels.mjs), controllate con analyze()
   e salvate in levels-data.js. Il generatore resta qui perché il numero dei livelli è configurabile: oltre le mappe
   salvate (config.js, FAIND_LOST_LEVELS) il gioco ne genera altre della stessa famiglia, già verificate.
   Regole di costruzione: due zolle non adiacenti non si toccano mai di lato e due zolle sulla stessa linea a distanza 2
   con vuoto in mezzo esistono solo dove c'è un salto voluto; così ogni salto obbligatorio è dichiarato e nessuna scorciatoia
   di salto nasce per caso.
   ===================================================================== */
export const COLS = 11, ROWS = 13;
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];   // 0 su, 1 destra, 2 giù, 3 sinistra

export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const idx = (c, r) => r * COLS + c;
const inb = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

/** Legge una mappa. */
export function parse(rows) {
  const tiles = new Set(), news = [];
  let start = null, goal = null, bad = '';
  if (rows.length !== ROWS) bad = 'righe: ' + rows.length;
  rows.forEach((row, r) => {
    if (row.length !== COLS) bad = bad || 'colonne riga ' + r;
    for (let c = 0; c < COLS; c++) {
      const ch = row[c];
      if (ch === '.' || ch === undefined) continue;
      if (!'#SGN'.includes(ch)) { bad = bad || 'carattere ' + ch; continue; }
      tiles.add(idx(c, r));
      if (ch === 'S') start = idx(c, r); else if (ch === 'G') goal = idx(c, r); else if (ch === 'N') news.push(idx(c, r));
    }
  });
  return { tiles, news, start, goal, bad };
}

/** Verifica una mappa: raggiungibilità con passi e salti da due caselle, giornali, salti obbligatori. */
export function analyze(rows) {
  const M = parse(rows), errors = [];
  if (M.bad) errors.push(M.bad);
  if (M.start === null) errors.push('manca la partenza');
  if (M.goal === null) errors.push('manca il portone');
  if (M.start !== null && Math.floor(M.start / COLS) !== ROWS - 1) errors.push('la partenza non è sulla riga in basso');
  if (M.goal !== null && Math.floor(M.goal / COLS) !== 0) errors.push('il portone non è sulla riga in alto');
  if (M.news.length !== 3) errors.push('giornali: ' + M.news.length);
  if (errors.length) return { ok: false, errors };
  // passi (costo 0) e salti da due caselle (costo 1) verso una zolla; il salto sorvola la casella di mezzo, qualunque cosa contenga
  const cost = new Map([[M.start, 0]]), queue = [M.start];
  const dq = [[0, M.start]];
  while (dq.length) {
    dq.sort((a, b) => a[0] - b[0]); const [d, cur] = dq.shift();
    if (d > (cost.get(cur) ?? 1e9)) continue;
    const c = cur % COLS, r = (cur / COLS) | 0;
    for (const [dx, dy] of DIRS) for (const k of [1, 2]) {
      const nc = c + dx * k, nr = r + dy * k;
      if (!inb(nc, nr) || !M.tiles.has(idx(nc, nr))) continue;
      const nd = d + (k === 2 ? 1 : 0), ni = idx(nc, nr);
      if (nd < (cost.get(ni) ?? 1e9)) { cost.set(ni, nd); dq.push([nd, ni]); }
    }
  }
  const unreachable = [...M.tiles].filter((t) => !cost.has(t));
  let jumpEdges = 0;                       // coppie di zolle in linea a distanza 2 con il vuoto in mezzo
  for (const t of M.tiles) {
    const c = t % COLS, r = (t / COLS) | 0;
    for (const [dx, dy] of [[1, 0], [0, 1]]) { if (inb(c + 2 * dx, r + 2 * dy) && M.tiles.has(idx(c + 2 * dx, r + 2 * dy)) && !M.tiles.has(idx(c + dx, r + dy))) jumpEdges++; }
  }
  // un passo da una zolla verso una cella vuota è una caduta: non fa parte del grafo. Le zolle adiacenti si possono percorrere a piedi.
  return {
    ok: unreachable.length === 0 && cost.has(M.goal), errors: unreachable.length ? ['zolle irraggiungibili: ' + unreachable.length] : [],
    tiles: M.tiles.size, jumpEdges, jumpsToGoal: cost.get(M.goal), jumpsToNews: M.news.map((n) => cost.get(n)), maxJumps: Math.max(...cost.values())
  };
}

/** Parametri di difficoltà per livello (1 è il più facile). */
export function params(level) {
  const d = Math.min(14, Math.max(0, level - 1));
  const at = (a) => a[Math.min(a.length - 1, d)];
  return {
    steps: [13, 15, 16, 18, 19, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31][Math.min(14, d)],
    turnsMin: 3 + Math.floor(d * 0.7),
    jumps: at([1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4]),
    branchJumps: at([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2]),
    branches: at([1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5]),
    branchLen: [2 + Math.floor(d / 5), 3 + Math.floor(d / 3)],
    turnProb: 0.28 + d * 0.02
  };
}

function make(P, rnd) {
  const occ = new Map();                     // idx -> 'tile' | 'void'
  const tileAt = (c, r) => occ.get(idx(c, r)) === 'tile';
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const free = (c, r, fc, fr) => {           // la zolla (c, r) si può mettere, a partire da (fc, fr)
    if (!inb(c, r) || occ.has(idx(c, r)) || r === 0) return false;
    for (const [dx, dy] of DIRS) { const nc = c + dx, nr = r + dy; if (tileAt(nc, nr) && !(nc === fc && nr === fr)) return false; }
    for (const [dx, dy] of DIRS) {
      const nc = c + dx * 2, nr = r + dy * 2;
      if (tileAt(nc, nr) && !(nc === fc && nr === fr) && !tileAt(c + dx, r + dy)) return false;
    }
    return true;
  };
  const put = (c, r) => occ.set(idx(c, r), 'tile');
  const sc = 2 + Math.floor(rnd() * (COLS - 4)), gc = 2 + Math.floor(rnd() * (COLS - 4));
  const main = [[sc, ROWS - 1]]; put(sc, ROWS - 1);
  let jumpsLeft = P.jumps, turns = 0, dir = 0, run = 0, steps = 0, lastJump = -9;
  const maxSteps = P.steps + 8;
  const target = [gc, 1];
  let done = false;
  while (!done && steps < maxSteps + 6) {
    const [c, r] = main[main.length - 1];
    if (c === target[0] && r === target[1]) { if (steps >= P.steps - 3) { done = true; break; } }
    const rem = maxSteps - steps, dist = Math.abs(c - target[0]) + (r - target[1]);
    const needHome = dist >= rem - 4;
    const wantJump = jumpsLeft > 0 && steps - lastJump >= 3 && steps >= 2 && rnd() < 0.3 + (steps / maxSteps) * 0.4;
    const cands = [];
    for (let d = 0; d < 4; d++) {
      const [dx, dy] = DIRS[d];
      if (d === (dir + 2) % 4 && steps > 0) { /* niente inversioni secche, serve comunque una cella libera */ }
      const reserved = (nc, nr) => nc === target[0] && nr === target[1] && steps < P.steps - 3;
      if (!wantJump) {
        const nc = c + dx, nr = r + dy;
        if (free(nc, nr, c, r) && !reserved(nc, nr)) cands.push({ d, cells: [[nc, nr]], jump: false });
      } else {
        const mc = c + dx, mr = r + dy, nc = c + dx * 2, nr = r + dy * 2;
        if (inb(mc, mr) && !occ.has(idx(mc, mr)) && mr > 0 && free(nc, nr, c, r) && !reserved(nc, nr)) {
          // la casella di mezzo non deve toccare altre zolle (altrimenti il salto non sarebbe obbligatorio)
          let touch = false; for (const [ex, ey] of DIRS) if (tileAt(mc + ex, mr + ey) && !(mc + ex === c && mr + ey === r) && !(mc + ex === nc && mr + ey === nr)) touch = true;
          if (!touch) cands.push({ d, cells: [[nc, nr]], jump: true, mid: [mc, mr] });
        }
      }
    }
    if (!cands.length) { if (wantJump) { lastJump = steps - 2; continue; } return null; }
    for (const k of cands) {
      const [nc, nr] = k.cells[0], nd = Math.abs(nc - target[0]) + (nr - target[1]);
      let w = 1;
      if (needHome) w = nd < dist ? 6 : 0.2; else {
        w = nd < dist ? 1.6 : 1;
        if (k.d === dir && run < 3) w *= 2.4; else if (k.d !== dir) w *= run >= 1 ? (rnd() < P.turnProb ? 3 : 0.5) : 0.3;
        if (nr < r) w *= 1.2;
      }
      if (k.d === (dir + 2) % 4) w *= 0.15;
      k.w = w;
    }
    const tot = cands.reduce((s, k) => s + k.w, 0); let x = rnd() * tot, ch = cands[0];
    for (const k of cands) { x -= k.w; if (x <= 0) { ch = k; break; } }
    if (ch.d !== dir) { if (steps > 0) turns++; dir = ch.d; run = 0; }
    if (ch.jump) { occ.set(idx(ch.mid[0], ch.mid[1]), 'void'); jumpsLeft--; lastJump = steps; }
    const [nc, nr] = ch.cells[0]; put(nc, nr); main.push([nc, nr]); steps++; run++;
    if (nc === target[0] && nr === target[1] && steps >= P.steps - 3) { done = true; }
  }
  if (!done || jumpsLeft > 0 || turns < P.turnsMin) return null;
  put(gc, 0); main.push([gc, 0]);
  // il vano davanti al portone: nessuna altra zolla sulla riga 1 accanto a (gc,1) è ammessa dal vincolo di adiacenza; controllo la riga 0
  // ----- deviazioni -----
  const all = main.map((p) => ({ p, br: -1 }));
  const tips = []; const branches = [];
  let bj = P.branchJumps;
  for (let b = 0; b < P.branches; b++) {
    let ok = false;
    for (let attempt = 0; attempt < 60 && !ok; attempt++) {
      const pool = all.filter((o, i) => o.br === -1 ? (i > 1 && i < main.length - 3) : true);
      const base = pick(pool), [bc, br] = base.p;
      const d0 = Math.floor(rnd() * 4), [dx, dy] = DIRS[d0];
      const len = P.branchLen[0] + Math.floor(rnd() * (P.branchLen[1] - P.branchLen[0] + 1));
      const useJump = bj > 0 && len >= 3 && rnd() < 0.7;
      const cells = [], mids = []; let cc = bc, cr = br, dd = d0, okb = true, jumpedHere = false;
      const tmp = [];
      const save = new Map(occ);
      for (let i = 0; i < len && okb; i++) {
        let moved = false;
        const tryDirs = i === 0 ? [d0] : [dd, ...[0, 1, 2, 3].filter((x) => x !== dd && x !== (dd + 2) % 4).sort(() => rnd() - 0.5)];
        for (const d of tryDirs) {
          if (i > 0 && d !== dd && rnd() > 0.45) continue;
          const [ex, ey] = DIRS[d];
          if (useJump && !jumpedHere && i === Math.max(1, len - 2)) {
            const mc = cc + ex, mr = cr + ey, nc = cc + ex * 2, nr = cr + ey * 2;
            if (inb(mc, mr) && !occ.has(idx(mc, mr)) && mr > 0 && free(nc, nr, cc, cr)) {
              let touch = false; for (const [fx, fy] of DIRS) if (tileAt(mc + fx, mr + fy) && !(mc + fx === cc && mr + fy === cr) && !(mc + fx === nc && mr + fy === nr)) touch = true;
              if (!touch) { occ.set(idx(mc, mr), 'void'); put(nc, nr); cells.push([nc, nr]); cc = nc; cr = nr; dd = d; moved = true; jumpedHere = true; break; }
            }
            continue;
          }
          const nc = cc + ex, nr = cr + ey;
          if (free(nc, nr, cc, cr)) { put(nc, nr); cells.push([nc, nr]); cc = nc; cr = nr; dd = d; moved = true; break; }
        }
        if (!moved) okb = false;
      }
      if (okb && cells.length >= 2 && (!useJump || jumpedHere)) { ok = true; if (jumpedHere) bj--; branches.push(cells); tips.push(cells[cells.length - 1]); cells.forEach((p) => all.push({ p, br: b })); }
      else { occ.clear(); for (const [k, v] of save) occ.set(k, v); }
    }
    if (!ok) return null;
  }
  if (bj > 0) return null;
  // ----- giornali -----
  const taken = new Set(), news = [];
  const farTips = tips.slice().sort((a, b) => Math.abs(b[0] - sc) + (ROWS - b[1]) - (Math.abs(a[0] - sc) + (ROWS - a[1])));
  const wantTips = P.branches >= 3 ? 3 : P.branches >= 2 ? 2 : 1;
  for (const t of farTips) { if (news.length >= wantTips) break; news.push(t); taken.add(idx(t[0], t[1])); }
  const mids = main.slice(3, main.length - 3);
  for (const frac of [0.62, 0.4, 0.78, 0.25, 0.5]) {
    if (news.length >= 3) break;
    const cand = mids[Math.min(mids.length - 1, Math.floor(mids.length * frac))];
    if (cand && !taken.has(idx(cand[0], cand[1])) && !(cand[0] === sc && cand[1] === ROWS - 1)) { news.push(cand); taken.add(idx(cand[0], cand[1])); }
  }
  for (const t of tips) { if (news.length >= 3) break; if (!taken.has(idx(t[0], t[1]))) { news.push(t); taken.add(idx(t[0], t[1])); } }
  if (news.length !== 3) return null;
  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    let s = '';
    for (let c = 0; c < COLS; c++) {
      if (!tileAt(c, r)) { s += '.'; continue; }
      s += (c === sc && r === ROWS - 1) ? 'S' : (c === gc && r === 0) ? 'G' : taken.has(idx(c, r)) ? 'N' : '#';
    }
    rows.push(s);
  }
  return { rows, meta: { turns, mainLen: main.length, branches: branches.length } };
}

/** Genera la mappa di un livello (deterministica per livello e seme) e la verifica. */
export function generate(level, seed = 1) {
  let P = params(level);
  for (let relax = 0; relax < 6; relax++) {
    for (let a = 0; a < 3000; a++) {
      const rnd = mulberry(((seed * 7919 + level * 104729 + a * 15485863) ^ 0x5bd1e995) >>> 0);
      const m = make(P, rnd); if (!m) continue;
      const an = analyze(m.rows);
      if (!an.ok || an.jumpEdges !== P.jumps + P.branchJumps) continue;
      if (level <= 3 && an.maxJumps > 1) continue;
      return { rows: m.rows, jumps: an.jumpEdges, level, attempt: a, relax };
    }
    P = Object.assign({}, P, { steps: P.steps - 2, branches: Math.max(1, P.branches - 1), turnsMin: Math.max(2, P.turnsMin - 1), branchJumps: Math.max(0, P.branchJumps - (relax >= 2 ? 1 : 0)) });
  }
  return null;
}
