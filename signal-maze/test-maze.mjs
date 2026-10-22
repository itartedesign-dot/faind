/* Verifica delle mappe e del motore: node signal-maze/test-maze.mjs
   Controlla tutti i 15 livelli (tre chiavi e cinque documenti per colore, oggetti e uscita raggiungibili, otto aperture
   collegate a coppie, uffici a L o a T con una sola porta, nessun vicolo cieco) e fa giocare un robot automatico
   (senza nemici) per vedere che ogni livello si completa e quanto tempo richiede. */
import { W, H, T, LEVELS, OPEN_ROWS, OPEN_COLS, buildLevel, bfs, idx } from './maze.js';
import { Sim, CONFIG, levelData } from './sim.js';
let bad = 0; const fail = (m) => { bad++; console.log('KO ', m); };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

for (let n = 1; n <= LEVELS; n++) {
  const L = buildLevel(n), g = L.grid, tag = 'livello ' + n + ': ';
  const again = buildLevel(n); if (JSON.stringify([...again.grid]) !== JSON.stringify([...g]) || JSON.stringify(again.docs) !== JSON.stringify(L.docs)) fail(tag + 'mappa non deterministica');
  for (let c = 0; c < 3; c++) {
    if (L.keys.filter((k) => k.color === c).length !== 1) fail(tag + 'chiavi colore ' + c);
    if (L.docs.filter((d) => d.color === c).length !== 5) fail(tag + 'documenti colore ' + c);
  }
  if (L.keys.length !== 3 || L.docs.length !== 15) fail(tag + 'totali');
  if (new Set(L.offices.map((o) => o.color)).size !== 3) fail(tag + 'colori uffici');
  // aperture: due per lato, collegate a coppie
  const open = []; for (let i = 0; i < W * H; i++) if (g[i] === T.OPEN) open.push([i % W, (i / W) | 0]);
  if (open.length !== 8) fail(tag + 'aperture ' + open.length);
  for (const r of OPEN_ROWS) if (g[idx(0, r)] !== T.OPEN || g[idx(W - 1, r)] !== T.OPEN || g[idx(1, r)] !== T.FLOOR || g[idx(W - 2, r)] !== T.FLOOR) fail(tag + 'aperture laterali riga ' + r);
  for (const c of OPEN_COLS) if (g[idx(c, 0)] !== T.OPEN || g[idx(c, H - 1)] !== T.OPEN || g[idx(c, 1)] !== T.FLOOR || g[idx(c, H - 2)] !== T.FLOOR) fail(tag + 'aperture alto/basso colonna ' + c);
  // raggiungibilità
  const d = bfs(g, L.start[0], L.start[1]);
  for (const o of [...L.keys, ...L.docs]) if (d[idx(o.x, o.y)] < 0) fail(tag + 'oggetto non raggiungibile');
  if (d[idx(L.exitFront[0], L.exitFront[1])] < 0) fail(tag + 'uscita non raggiungibile');
  for (const r of L.robots) { if (d[idx(r[0], r[1])] < 0) fail(tag + 'spawn robot'); for (const o of L.offices) if (bfs(g, o.front[0], o.front[1])[idx(r[0], r[1])] < 6) fail(tag + 'robot troppo vicino a una porta'); }
  // uffici: forma, una sola porta, scrivania dentro, nessun accesso da corridoio tranne la porta
  for (const o of L.offices) {
    if (o.cells.length !== 5) fail(tag + 'ufficio senza 5 celle');
    const set = new Set(o.cells.map((c) => idx(c[0], c[1])));
    let doors = 0;
    for (const c of o.cells) for (const [dx, dy] of DIRS) { const t = g[idx(c[0] + dx, c[1] + dy)]; if (t === T.FLOOR || t === T.OPEN) fail(tag + 'ufficio a contatto col corridoio'); if (t === T.DOOR) doors++; }
    if (doors !== 1) fail(tag + 'porte ufficio ' + doors);
    if (g[idx(o.desk[0], o.desk[1])] !== T.DESK || !set.has(idx(o.desk[0], o.desk[1]))) fail(tag + 'scrivania');
    if (g[idx(o.front[0], o.front[1])] !== T.FLOOR) fail(tag + 'fronte porta');
    const xs = new Set(o.cells.map((c) => c[0])), ys = new Set(o.cells.map((c) => c[1]));
    if (xs.size !== 3 || ys.size !== 3) fail(tag + 'ufficio non 3x3');
  }
  if (g[idx(L.exit[0], L.exit[1])] !== T.EXIT) fail(tag + 'uscita');
}

/* ---- robot automatico: nessun nemico, controlla le regole e misura i tempi ---- */
function plan(sim, tx, ty) {
  const f = sim.f, sx = Math.floor(f.x), sy = Math.floor(f.y);
  const prev = new Map([[idx(sx, sy), null]]), q = [[sx, sy]];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h]; if (x === tx && y === ty) break;
    for (const [dx, dy] of DIRS) {
      const nx = (x + dx + W) % W, ny = (y + dy + H) % H, j = idx(nx, ny);
      if (prev.has(j)) continue;
      const t = sim.L.grid[j];
      const ok = sim.canF(nx, ny) || (t === T.DOOR && sim.keys[sim.officeAt(nx, ny).color]);
      if (!ok) continue; prev.set(j, [x, y, dx, dy]); q.push([nx, ny]);
    }
  }
  let cur = prev.get(idx(tx, ty)); if (cur === undefined) return null;
  let first = null; let x = tx, y = ty;
  while (true) { const p = prev.get(idx(x, y)); if (!p) break; first = [p[2], p[3]]; x = p[0]; y = p[1]; }
  return first;
}
function goTo(sim, tx, ty, limit) {
  for (let i = 0; i < limit; i++) {
    if (Math.floor(sim.f.x) === tx && Math.floor(sim.f.y) === ty && Math.abs(sim.f.x - tx - 0.5) + Math.abs(sim.f.y - ty - 0.5) <= 0.44) return true;
    let d = plan(sim, tx, ty); if (!d) d = [sim.f.dx, sim.f.dy]; if (!d[0] && !d[1]) return false;
    sim.input(d); sim.step(); if (sim.phase !== 'play') return sim.phase === 'between';
  }
  return false;
}
let total = 0;
for (let n = 1; n <= LEVELS; n++) {
  const sim = new Sim(1); sim.loadLevel(n); sim.level = n;
  sim.robots.forEach((r) => { r.delay = 1e9; });
  const L = sim.L, t0 = sim.timeLeft; let ok = true;
  // un colore alla volta (dal livello 4 è obbligatorio, prima è comunque una buona strategia): chiave, documenti più vicini, scrivania
  let guard = 0;
  while (ok && !sim.done.every(Boolean) && guard++ < 40) {
    const dist = (x, y) => Math.abs(sim.f.x - x - 0.5) + Math.abs(sim.f.y - y - 0.5);
    const open = L.offices.filter((o) => !sim.done[o.id]);
    const o = (sim.active !== null && open.find((q) => q.color === sim.active)) || open.sort((p, q) => { const kp = L.keys[L.keys.findIndex((k) => k.color === p.color)], kq = L.keys[L.keys.findIndex((k) => k.color === q.color)]; return dist(kp.x, kp.y) - dist(kq.x, kq.y); })[0];
    const ki = L.keys.findIndex((k) => k.color === o.color);
    if (!sim.unlocked[o.id] && !sim.keys[o.color]) { if (!sim.keyTaken[ki]) ok = goTo(sim, L.keys[ki].x, L.keys[ki].y, 4000); if (!ok) break; if (sim.active !== null && sim.active !== o.color) continue; }
    let left = L.docs.map((d, i) => i).filter((i) => L.docs[i].color === o.color && !sim.docTaken[i]);
    while (left.length && ok) { left.sort((p, q) => dist(L.docs[p].x, L.docs[p].y) - dist(L.docs[q].x, L.docs[q].y)); ok = goTo(sim, L.docs[left[0]].x, L.docs[left[0]].y, 4000); left = left.filter((i) => !sim.docTaken[i]); }
    if (ok) ok = goTo(sim, o.desk[0], o.desk[1], 4000);
    if (!ok) fail('livello ' + n + ': il robot non completa l\'ufficio ' + o.color);
  }
  if (ok) { if (!sim.exitActive) fail('livello ' + n + ': uscita non attiva'); else if (!goTo(sim, L.exit[0], L.exit[1], 4000) && sim.phase !== 'between' && sim.phase !== 'over') fail('livello ' + n + ': uscita non raggiunta'); }
  const used = t0 - sim.timeLeft; total += used;
  console.log('livello ' + n + ': ' + used.toFixed(1) + ' s, punti ' + sim.score + ', fase ' + sim.phase + (sim.level >= 4 ? ' (colore dal 4)' : ''));
}
console.log('tempo totale del percorso (senza nemici): ' + total.toFixed(0) + ' s su ' + CONFIG.TOTAL_TIME);

/* ---- regole: inventario libero nei livelli 1-3, vincolo di colore dal 4 ---- */
{
  const s1 = new Sim(1); s1.loadLevel(2); s1.level = 2;
  const a = s1.L.docs.find((d) => d.color === 0), b = s1.L.docs.find((d) => d.color === 1);
  s1.f.x = a.x + 0.5; s1.f.y = a.y + 0.5; s1.interact(); s1.f.x = b.x + 0.5; s1.f.y = b.y + 0.5; s1.interact();
  if (s1.carried[0] !== 1 || s1.carried[1] !== 1) fail('livello 2: l\'inventario dovrebbe essere libero');
  const s4 = new Sim(1); s4.loadLevel(5); s4.level = 5;
  const a4 = s4.L.docs.find((d) => d.color === 0), b4 = s4.L.docs.find((d) => d.color === 1);
  s4.f.x = a4.x + 0.5; s4.f.y = a4.y + 0.5; s4.interact(); s4.f.x = b4.x + 0.5; s4.f.y = b4.y + 0.5; s4.interact();
  if (s4.carried[0] !== 1 || s4.carried[1] !== 0 || s4.active !== 0) fail('livello 5: vincolo di colore non applicato');
}
/* ---- potere: 20 s, non si somma; timer generale distinto ---- */
{
  const s = new Sim(1); s.loadLevel(1); const o = s.L.offices[0];
  s.carried[o.color] = 5; s.f.x = o.desk[0] + 0.5; s.f.y = o.desk[1] + 0.5; s.robots.forEach((r) => { r.delay = 1e9; }); s.interact();
  if (!s.done[0] || Math.abs(s.power - 20) > 0.01) fail('potere non partito a 20 s');
  for (let i = 0; i < 600; i++) s.step();
  if (Math.abs(s.power - 10) > 0.1 || Math.abs(s.timeLeft - (CONFIG.TOTAL_TIME - 10)) > 0.1) fail('timer potere e timer generale non distinti: ' + s.power + ' ' + s.timeLeft);
  const o2 = s.L.offices[1]; s.carried[o2.color] = 5; s.f.x = o2.desk[0] + 0.5; s.f.y = o2.desk[1] + 0.5; s.interact();
  if (Math.abs(s.power - 20) > 0.01) fail('il potere si è sommato');
}
/* ---- robot: mai dentro agli uffici, anche dopo una partita lunga; una vita sola per contatto ---- */
{
  const s = new Sim(7); s.loadLevel(10); s.level = 10; let inside = 0, lostMax = 0;
  s.robots.forEach((r) => { r.delay = 0; });
  const offTiles = new Set(); s.L.offices.forEach((o) => { o.cells.forEach((c) => offTiles.add(idx(c[0], c[1]))); offTiles.add(idx(o.door[0], o.door[1])); });
  for (let i = 0; i < 60 * 120 && s.phase === 'play'; i++) {
    s.f.inv = 99;   // invulnerabile: si osservano solo i robot
    s.step(); for (const r of s.robots) if (offTiles.has(idx(Math.floor(r.x), Math.floor(r.y)))) inside++;
  }
  if (inside) fail('robot dentro gli uffici: ' + inside);
  const s2 = new Sim(3); s2.loadLevel(3); const r0 = s2.robots[0]; r0.delay = 0; s2.f.x = r0.x; s2.f.y = r0.y; s2.step(); s2.step(); s2.step();
  if (s2.lives !== 2) fail('contatto: vite ' + s2.lives + ' (attese 2)');
}
console.log(bad ? bad + ' controlli falliti' : 'tutti i controlli superati');
process.exit(bad ? 1 : 0);
