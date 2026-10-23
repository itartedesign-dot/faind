// Prova delle classifiche di Signal Maze e Lost Signal (stesso D1 finto di test-worker.mjs): `node --no-warnings game-api/test-games.mjs`
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { handle } from './worker.js';
import { MAX_SCORE, replayMaze, replayLost, cleanMazeInputs, cleanLostInputs } from './verify.js';
import { Sim as MazeSim } from '../signal-maze/sim.js';
import { W, H, T, idx } from '../signal-maze/maze.js';
import { Sim as LostSim, DIRV } from '../lost-signal/sim.js';
import { getLevel, COLS, ROWS } from '../lost-signal/levels.js';
import { makeDb } from './d1-shim.mjs';

execFileSync(process.execPath, [new URL('./sync-engines.mjs', import.meta.url).pathname, '--check'], { stdio: 'inherit' });   // la copia del motore di Lost deve essere aggiornata

const { db: DB, sqlite } = makeDb();
const env = { DB, SESSION_SECRET: 'prova-segreta' };
const T0 = Date.UTC(2026, 9, 21, 10, 0, 0);
const call = async (m, p, body, now, ip) => { const r = await handle(new Request('https://x.test' + p, { method: m, headers: { 'Content-Type': 'application/json', Origin: 'https://faind.org', 'CF-Connecting-IP': ip || '1.1.1.1' }, body: body ? JSON.stringify(body) : undefined }), env, now); return { s: r.status, j: await r.json(), h: r.headers }; };

/* ---------- giocatori automatici ---------- */
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function mazePlan(sim, tx, ty) {
  const f = sim.f, sx = Math.floor(f.x), sy = Math.floor(f.y);
  const prev = new Map([[idx(sx, sy), null]]), q = [[sx, sy]];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h]; if (x === tx && y === ty) break;
    for (const [dx, dy] of DIRS) {
      const nx = (x + dx + W) % W, ny = (y + dy + H) % H, j = idx(nx, ny);
      if (prev.has(j)) continue;
      const t = sim.L.grid[j];
      if (!(sim.canF(nx, ny) || (t === T.DOOR && sim.keys[sim.officeAt(nx, ny).color]))) continue;
      prev.set(j, [x, y, dx, dy]); q.push([nx, ny]);
    }
  }
  if (prev.get(idx(tx, ty)) === undefined) return null;
  let first = null, x = tx, y = ty;
  while (true) { const p = prev.get(idx(x, y)); if (!p) break; first = [p[2], p[3]]; x = p[0]; y = p[1]; }
  return first;
}
// scansa i robot vicini: fra le direzioni libere sceglie quella che li tiene più lontani (sul toro)
const torus = (a, b, n) => { const d = Math.abs(a - b); return Math.min(d, n - d); };
function dodge(sim, d) {
  const near = (x, y) => Math.min(99, ...sim.robots.filter((r) => r.alive && r.delay <= 0).map((r) => Math.hypot(torus(r.x, x, W), torus(r.y, y, H))));
  if (near(sim.f.x, sim.f.y) > 3.2) return d;
  const sx = Math.floor(sim.f.x), sy = Math.floor(sim.f.y); let best = d, bs = -1;
  for (const v of DIRS) { const nx = (sx + v[0] + W) % W, ny = (sy + v[1] + H) % H; if (!sim.canF(nx, ny)) continue; const sc = near(nx + 0.5, ny + 0.5) + (v[0] === d[0] && v[1] === d[1] ? 0.3 : 0); if (sc > bs) { bs = sc; best = v; } }
  return best;
}
/** Maze: raccoglie la chiave e i documenti del primo ufficio e li consegna; poi sta fermo finché i robot (o il tempo) chiudono la partita. */
function mazeBot(seed, idle) {
  const sim = new MazeSim(seed);
  const goTo = (tx, ty) => {
    for (let i = 0; i < 4000 && sim.phase === 'play'; i++) {
      if (Math.floor(sim.f.x) === tx && Math.floor(sim.f.y) === ty && Math.abs(sim.f.x - tx - 0.5) + Math.abs(sim.f.y - ty - 0.5) <= 0.44) return true;
      let d = mazePlan(sim, tx, ty); if (!d) return false;
      d = dodge(sim, d);
      sim.input([d]); sim.step(); sim.events.length = 0;
    }
    return false;
  };
  if (!idle) {
    const L = sim.L, o = L.offices[0], ki = L.keys.findIndex((k) => k.color === o.color);
    goTo(L.keys[ki].x, L.keys[ki].y);
    for (const d of L.docs.filter((d) => d.color === o.color)) goTo(d.x, d.y);
    goTo(o.desk[0], o.desk[1]);
  }
  sim.input([]);
  while (sim.phase === 'play') { sim.step(); sim.events.length = 0; }
  return sim;
}
/** Lost: percorre i primi livelli (giornali e portone) a passi e salti, con la tela a passi di 5 ms; poi cade nel vuoto tre volte. */
function lostPlan(L) {
  const key = (c, r) => r * COLS + c, moves = []; let cur = { c: L.start.c, r: L.start.r };
  for (const t of [...L.news, L.goal]) {
    const prev = new Map([[key(cur.c, cur.r), null]]), q = [cur];
    while (q.length) {
      const p = q.shift(); if (p.c === t.c && p.r === t.r) break;
      for (let d = 0; d < 4; d++) for (const k of [1, 2]) {
        const nc = p.c + DIRV[d][0] * k, nr = p.r + DIRV[d][1] * k;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || !L.tiles.has(key(nc, nr)) || prev.has(key(nc, nr))) continue;
        prev.set(key(nc, nr), { p, d, k }); q.push({ c: nc, r: nr });
      }
    }
    const seg = []; let at = { c: t.c, r: t.r };
    while (prev.get(key(at.c, at.r))) { const s = prev.get(key(at.c, at.r)); seg.unshift({ d: s.d, k: s.k }); at = s.p; }
    moves.push(...seg); cur = t;
  }
  return moves;
}
function lostBot(levels) {
  const sim = new LostSim(50);
  const run = (ms) => { for (let t = 0; t < ms; t += 5) { sim.update(5); sim.events.length = 0; } };
  const until = (ph) => { for (let i = 0; i < 4000 && !ph.includes(sim.phase); i++) { sim.update(5); sim.events.length = 0; } };
  for (let n = 1; n <= levels; n++) {
    until(['play']);
    for (const m of lostPlan(sim.L)) { if (m.k === 1) sim.step(m.d); else { sim.turn(m.d); sim.jump(); } until(['play', 'arrive']); if (sim.phase === 'arrive') break; }
    run(0); until(['memorize', 'over', 'won']);
  }
  until(['play']);
  while (!sim.over && sim.phase !== 'won') { sim.step(2); until(['play', 'over']); sim.flash(); }   // dalla riga più bassa un passo in giù è il vuoto
  return sim;
}

/* ---------- replay del motore ---------- */
const mb = mazeBot(1, false);
assert.ok(mb.score > 0, 'il giocatore automatico di Maze deve fare punti: ' + mb.score);
let r = replayMaze(1, cleanMazeInputs(mb.inputs));
assert.equal(r.score, mb.score); assert.equal(r.level, mb.level); assert.equal(r.detail, mb.stats.delivered); assert.equal(r.ms, mb.tick / 60 * 1000);
const lb = lostBot(2);
assert.ok(lb.score >= 2000 && lb.over, 'il giocatore automatico di Lost completa due livelli e poi perde: ' + lb.score + ' ' + lb.phase);
let rl = replayLost(cleanLostInputs(lb.log));
{ const l10 = lostBot(10), r10 = replayLost(cleanLostInputs(l10.log));     // fino al livello 10: ascensori e rocce rifatti identici dal server
  assert.ok(l10.level >= 10, 'il giocatore automatico arriva al livello 10: ' + l10.level);
  assert.equal(r10.score, l10.score); assert.equal(r10.level, l10.level); assert.equal(r10.detail, l10.stats.news); assert.equal(r10.ms, l10.clock); }
assert.equal(rl.score, lb.score); assert.equal(rl.level, lb.level); assert.equal(rl.detail, lb.stats.news); assert.equal(rl.ms, lb.clock);
console.log('replay Maze', r.score, 'punti,', Math.round(r.ms / 1000), 's di gioco; replay Lost', rl.score, 'punti,', Math.round(rl.ms / 1000), 's di gioco');
// comandi non validi o contraffatti
assert.equal(cleanMazeInputs([[5, [0]], [3, [1]]]), null);          // tick non crescenti
assert.equal(cleanMazeInputs([[1, [0, 1, 2]]]), null);              // tre direzioni
assert.equal(cleanMazeInputs([[1, [4]]]), null);
assert.equal(cleanLostInputs([[7, 0]]), null);                      // non multiplo di 5 ms
assert.equal(cleanLostInputs([[5, 10]]), null);
assert.equal(replayLost([[0, 0]]).error, 'bad_game');               // passo durante la memorizzazione: il gioco non lo accetta
assert.equal(replayLost([[7000, 8], [7005, 9]]).error, 'bad_game'); // una partita che non finisce non è una partita
assert.equal(replayMaze(1, []).score, 0);                           // chi sta fermo perde per tempo o per robot con 0 punti, senza errori

/* ---------- continue: la partita prosegue ma il server la rifiuta ---------- */
{
  const mc = mazeBot(1, true), tickOver = mc.tick, wasTime = mc.reason === 'time';
  assert.equal(mc.phase, 'over'); assert.ok(mc.revive(), 'Maze: il continue riparte dopo la sconfitta');
  assert.equal(mc.phase, 'play'); assert.equal(mc.lives, 3); assert.ok(mc.timeLeft >= 60); assert.equal(mc.continues, 1); assert.ok(mc.f.inv > 0);
  if (wasTime) assert.equal(mc.timeLeft, 60);
  mc.input([[1, 0]]); for (let i = 0; i < 30; i++) { mc.step(); mc.events.length = 0; }
  assert.ok(mc.tick > tickOver);
  assert.equal(replayMaze(1, cleanMazeInputs(mc.inputs)).error, 'bad_game');
  const wonSim = mazeBot(1, true); wonSim.won = true; assert.equal(wonSim.revive(), false, 'Maze: dopo una vittoria non c\'è continue');
  const lc = lostBot(1), levelBefore = lc.level, flashesBefore = lc.flashes;
  assert.ok(lc.over); assert.ok(lc.revive(), 'Lost: il continue riparte dopo l\'ultima vita');
  assert.equal(lc.lives, 3); assert.equal(lc.phase, 'play'); assert.equal(lc.level, levelBefore); assert.equal(lc.flashes, flashesBefore); assert.equal(lc.continues, 1);
  lc.jump(); lc.update(5);
  assert.equal(replayLost(cleanLostInputs(lc.log)).error, 'bad_game');
  assert.equal(new LostSim(15).revive(), false);
}

/* ---------- rotte del server ---------- */
// il seme lo decide il server a caso: per le prove lo fisso (e rendo diversi gli id di sessione)
const realRandom = globalThis.crypto.getRandomValues.bind(globalThis.crypto); let ctr = 0;
async function session(game, now, ip, seed) {
  globalThis.crypto.getRandomValues = (a) => { realRandom(a); if (seed !== undefined) a[0] = seed >>> 0; a[1] = ++ctr; a[2] = ctr * 2 + 1; return a; };
  try { const s = await call('POST', '/' + game + '/session', {}, now, ip); assert.equal(s.s, 200); return s.j; } finally { globalThis.crypto.getRandomValues = realRandom; }
}
// partite di Maze che danno punti (con il seme 1 il giocatore automatico consegna un ufficio)
async function mazeGame(ip, now) { const se = await session('maze', now, ip, 1); return { token: se.token, sim: mazeBot(1, false) }; }
const MZ = await mazeGame('10.0.0.1', T0);
let res = await call('POST', '/maze/score', { token: MZ.token, inputs: MZ.sim.inputs, score: 999999 }, T0 + 700000);
assert.equal(res.s, 200); assert.equal(res.j.score, MZ.sim.score); assert.ok(res.j.claim); assert.equal(res.j.weekly.rank, 1); assert.equal(res.j.all.rank, 1); assert.equal(res.j.delivered, MZ.sim.stats.delivered);
const mazeClaim = res.j.claim;
res = await call('POST', '/maze/score', { token: MZ.token, inputs: MZ.sim.inputs }, T0 + 700500); assert.equal(res.s, 409);       // un solo invio
// troppo veloce, comandi non validi, gettone manomesso, gettone di un altro gioco
const MZ2 = await mazeGame('11.0.0.1', T0);
res = await call('POST', '/maze/score', { token: MZ2.token, inputs: MZ2.sim.inputs }, T0 + 20000); assert.equal(res.s, 422); assert.equal(res.j.error, 'too_fast');
res = await call('POST', '/maze/score', { token: MZ2.token, inputs: [[9999999, [0]]] }, T0 + 700000); assert.equal(res.s, 422); assert.equal(res.j.error, 'bad_inputs');
res = await call('POST', '/maze/score', { token: MZ2.token.slice(0, -2) + 'xx', inputs: [] }, T0 + 700000); assert.equal(res.s, 400);
res = await call('POST', '/lost/score', { token: MZ2.token, inputs: [] }, T0 + 700000); assert.equal(res.s, 400);
res = await call('POST', '/score', { token: MZ2.token, inputs: [] }, T0 + 700000); assert.equal(res.s, 400);
res = await call('POST', '/maze/score', { token: MZ2.token, inputs: MZ2.sim.inputs, continued: true }, T0 + 700000); assert.equal(res.s, 422); assert.equal(res.j.error, 'bad_game');   // dichiara un continue: respinta, il gettone resta valido
res = await call('POST', '/maze/score', { token: MZ2.token, inputs: MZ2.sim.inputs }, T0 + 700000); assert.equal(res.s, 200);   // dopo i rifiuti il gettone vale ancora (il tentativo respinto non lo consuma)
// partita ferma: finisce senza errori e senza punti, nessun claim
const se0 = await session('maze', T0, '12.0.0.1');
const idle = mazeBot(se0.seed, true);
res = await call('POST', '/maze/score', { token: se0.token, inputs: idle.inputs }, T0 + 700000); assert.equal(res.s, 200); assert.equal(res.j.score, 0); assert.equal(res.j.claim, undefined);

// Lost
const lostMs = lb.clock;
let sl = await session('lost', T0, '20.0.0.1');
res = await call('POST', '/lost/score', { token: sl.token, inputs: lb.log }, T0 + 30000); assert.equal(res.s, 422); assert.equal(res.j.error, 'too_fast');
res = await call('POST', '/lost/score', { token: sl.token, inputs: lb.log.slice(0, 5) }, T0 + lostMs + 60000); assert.equal(res.s, 422); assert.equal(res.j.error, 'bad_game');   // partita troncata
res = await call('POST', '/lost/score', { token: sl.token, inputs: lb.log, score: 99999 }, T0 + lostMs + 60000);
assert.equal(res.s, 200); assert.equal(res.j.score, lb.score); assert.equal(res.j.news, lb.stats.news); assert.equal(res.j.level, lb.level); assert.ok(res.j.claim);
const lostClaim = res.j.claim;
res = await call('POST', '/lost/score', { token: sl.token, inputs: lb.log }, T0 + lostMs + 61000); assert.equal(res.s, 409);
// comando inventato (flash durante la memorizzazione) o tempi a 7 ms: respinti
sl = await session('lost', T0, '21.0.0.1');
res = await call('POST', '/lost/score', { token: sl.token, inputs: [[0, 9]] }, T0 + 700000); assert.equal(res.s, 422); assert.equal(res.j.error, 'bad_game');
res = await call('POST', '/lost/score', { token: sl.token, inputs: [[7, 0]] }, T0 + 700000); assert.equal(res.s, 422); assert.equal(res.j.error, 'bad_inputs');

/* ---------- nome e classifiche separate ---------- */
// il claim di un gioco non vale per un altro
res = await call('POST', '/lost/name', { claim: mazeClaim, initials: 'ABC', country: 'IT' }, T0 + 800000); assert.equal(res.s, 400);
res = await call('POST', '/name', { claim: mazeClaim, initials: 'ABC', country: 'IT' }, T0 + 800000); assert.equal(res.s, 400);
res = await call('POST', '/maze/name', { claim: lostClaim, initials: 'ABC', country: 'IT' }, T0 + 800000); assert.equal(res.s, 400);
res = await call('POST', '/maze/name', { claim: mazeClaim, initials: 'AB1', country: 'IT' }, T0 + 800000); assert.equal(res.s, 400);
res = await call('POST', '/maze/name', { claim: mazeClaim, initials: 'abc', country: 'it' }, T0 + 800000); assert.equal(res.s, 200);
res = await call('POST', '/maze/name', { claim: mazeClaim, initials: 'xyz', country: 'IT' }, T0 + 800000); assert.equal(res.s, 409);
res = await call('POST', '/lost/name', { claim: lostClaim, initials: 'LOS', country: 'FR' }, T0 + 800000); assert.equal(res.s, 200);
let m = await call('GET', '/maze/leaderboard', null, T0 + 810000), l = await call('GET', '/lost/leaderboard', null, T0 + 810000), n = await call('GET', '/leaderboard', null, T0 + 810000);
assert.deepEqual(m.j.weekly, [{ initials: 'ABC', country: 'IT', score: MZ.sim.score }]);
assert.deepEqual(l.j.weekly, [{ initials: 'LOS', country: 'FR', score: lb.score }]); assert.deepEqual(l.j.all, l.j.weekly);
assert.equal(n.j.weekly.length, 0); assert.equal(n.j.all.length, 0);       // News Rush non vede i punteggi degli altri giochi
assert.equal(m.h.get('Access-Control-Allow-Origin'), 'https://faind.org');
// pari punteggio, settimana precedente e posizioni: per gioco
sqlite.exec(`INSERT INTO game_scores VALUES ('t1','maze',${MZ.sim.score},1,0,${T0 + 2000000},'2026-10-19','TIE','FR'),('t2','lost',${MZ.sim.score},1,0,${T0 + 2000000},'2026-10-19','OTH','DE'),('old','maze',900000,1,0,${T0 - 9 * 86400000},'2026-10-05','OLD','ES')`);
m = await call('GET', '/maze/leaderboard', null, T0 + 820000);
assert.deepEqual(m.j.weekly.map((x) => x.initials), ['ABC', 'TIE']); assert.equal(m.j.all[0].initials, 'OLD');
l = await call('GET', '/lost/leaderboard', null, T0 + 820000); assert.deepEqual(l.j.weekly.map((x) => x.initials).sort(), ['LOS', 'OTH']);
m = await call('GET', '/maze/leaderboard', null, Date.UTC(2026, 9, 26, 10)); assert.equal(m.j.weekly.length, 0); assert.equal(m.j.all.length, 3);   // nuova settimana: settimanale vuota, assoluta no
// la posizione in classifica tiene conto solo del proprio gioco: un punteggio di Lost non sposta Maze
const se1 = await session('maze', T0 + 900000, '30.0.0.1'), g1 = mazeBot(se1.seed, true);
res = await call('POST', '/maze/score', { token: se1.token, inputs: g1.inputs }, T0 + 1600000, '30.0.0.1'); assert.equal(res.s, 200); assert.equal(res.j.weekly.rank, null);

/* ---------- limiti di richieste per gioco ---------- */
let last; for (let i = 0; i < 8; i++) last = await call('POST', '/lost/session', {}, T0 + 500000, '9.9.9.9');
assert.equal(last.s, 429);
res = await call('POST', '/maze/session', {}, T0 + 500000, '9.9.9.9'); assert.equal(res.s, 200);   // l'altro gioco ha il suo conteggio
res = await call('POST', '/session', {}, T0 + 500000, '9.9.9.9'); assert.equal(res.s, 200);
assert.equal((await call('GET', '/maze/altro', null, T0)).s, 404);
assert.equal((await call('GET', '/mazes/leaderboard', null, T0)).s, 404);
// tetti di punteggio plausibile
assert.ok(MAX_SCORE.lost === 50 * (1000 + 3 * 500) && MAX_SCORE.maze > 15 * 4800);
console.log('OK');
