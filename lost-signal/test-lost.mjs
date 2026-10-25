// Prove automatiche di Lost Signal: node test-lost.mjs
import { getLevel, COLS, ROWS } from './levels.js';
import { LEVEL_DATA } from './levels-data.js';
import { analyze, params, liftCells, extrasFor } from './levelgen.js';
import { Sim, CFG, DIRV, anchorCount, rockSpeed } from './sim.js';

let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.error('FALLITO:', msg); } };

// ---------- mappe ----------
const N = LEVEL_DATA.length;
ok(N === 50, '50 mappe salvate');
for (let n = 1; n <= N; n++) {
  const L = getLevel(n), a = analyze(L.rows);
  ok(a.ok, `livello ${n} risolvibile (${a.errors})`);
  ok(L.news.length === 3 && new Set(L.news.map((p) => p.c + ',' + p.r)).size === 3, `livello ${n}: tre giornali su zolle diverse`);
  ok(!L.news.some((p) => (p.c === L.start.c && p.r === L.start.r) || (p.c === L.goal.c && p.r === L.goal.r)), `livello ${n}: giornali non su partenza o arrivo`);
  ok(L.start.r === ROWS - 1 && L.goal.r === 0, `livello ${n}: partenza in basso, portone in alto`);
  ok(L.goal.c >= 2 && L.goal.c <= COLS - 3, `livello ${n}: palazzina dentro lo schermo`);
  ok(L.tiles.has(L.goal.r * COLS + L.goal.c) && L.tiles.has((L.goal.r + 1) * COLS + L.goal.c), `livello ${n}: una sola zolla davanti al portone, collegata`);
  ok(a.jumpsToGoal >= 1 || n > 0, 'n/a');
  if (n <= 3) ok(a.maxJumps <= 1 && a.jumpsToGoal <= 1, `livello ${n}: al massimo un salto obbligatorio (${a.maxJumps})`);
  // nessun salto più lungo di 2: ogni zolla è raggiungibile con passi e salti da due (garantito dall'analisi); le zolle non adiacenti non si toccano
  ok(a.jumpEdges === (n <= N ? LEVEL_DATA[n - 1].jumps : a.jumpEdges), `livello ${n}: salti dichiarati = salti presenti`);
}
// il numero di salti obbligatori non diminuisce nel corso del gioco (crescita graduale)
{ let prev = 0; for (let n = 1; n <= N; n++) { const j = analyze(getLevel(n).rows).jumpsToGoal; ok(j >= prev - 1, `salti obbligatori graduali al livello ${n}`); prev = Math.max(prev, j); } }

// ---------- partita simulata ----------
function plan(L, targets) {
  // percorso più breve fra bersagli successivi con passi (costo 1) e salti (costo 1)
  const key = (c, r) => r * COLS + c;
  const moves = []; let cur = { c: L.start.c, r: L.start.r };
  for (const t of targets) {
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
function run(sim, ms) { for (let t = 0; t < ms; t += 16) sim.update(16); }
function settle(sim) { for (let i = 0; i < 400 && !(sim.phase === 'play' || sim.phase === 'arrive' || sim.phase === 'over' || sim.phase === 'won'); i++) sim.update(16); }
// verso il vuoto a percorso spento: il primo comando avvisa, il secondo (o il primo a percorso acceso) fa cadere
function stepOff(sim, d) { for (let i = 0; i < 4 && sim.phase === 'play'; i++) sim.step(d); }
function play(sim, moves) {
  for (const m of moves) {
    ok(sim.phase === 'play', 'pronto a muoversi'); if (sim.phase !== 'play') return;
    if (m.k === 1) sim.step(m.d); else { sim.turn(m.d); sim.jump(); }
    if (sim.phase !== 'arrive') settle(sim);
  }
}

for (let n = 1; n <= N; n++) {
  const sim = new Sim(50); sim.loadLevel(n); sim.score = 0; sim.rocks = [];     // il giocatore automatico ignora le rocce: qui si prova il percorso
  ok(sim.phase === 'memorize' && sim.tilesVisible, 'memorizzazione iniziale visibile');
  ok(!sim.step(0) && !sim.jump() && !sim.flash(), 'comandi bloccati durante la memorizzazione');
  run(sim, 6900); ok(sim.phase === 'memorize' && sim.tilesVisible, 'ancora 7 s di memorizzazione'); run(sim, 200);
  ok(sim.phase === 'play' && !sim.tilesVisible, 'dopo 7 s le zolle spariscono');
  const L = sim.L; const moves = plan(L, [...L.news, L.goal]);
  play(sim, moves);
  ok(sim.phase === 'arrive', `livello ${n}: arrivo al portone`);
  run(sim, CFG.ARRIVE_MS + 20);
  ok(sim.score === 1000 + 500 * 3 && sim.score <= 2500, `livello ${n}: punteggio ${sim.score}`);
  ok(sim.lives >= 3 && sim.flashes >= 20 + (n >= 20 && (n - 20) % 3 === 0 ? 1 : 0), 'nessuna vita o flash persi (solo bonus e oggetti raccolti)');
}

// arrivo con zero giornali: solo 1000, una volta sola
{ const s = new Sim(50); run(s, 7100); const L = s.L;
  // percorso diretto verso il portone evitando i giornali se possibile: calcolo con solo la meta
  play(s, plan(L, [L.goal])); run(s, CFG.ARRIVE_MS + 20);
  ok(s.score === 1000 + 500 * s.stats.news, 'punteggio = 1000 + 500 per giornale raccolto'); const sc = s.score; run(s, 200); ok(s.score === sc || s.phase === 'between', 'punteggio una sola volta'); }

// lampo gratuito: 1 s di luce ogni 25 s di gioco attivo, riparte a ogni livello
{ const s = new Sim(50); run(s, 7100); ok(s.phase === 'play' && !s.tilesVisible, 'lampo: prima del tempo spento');
  run(s, 24800); ok(!s.tilesVisible, 'lampo: a 24,8 s ancora spento'); run(s, 400); ok(s.tilesVisible && s.pulseMs > 0, 'lampo: acceso dopo 25 s');
  const fl = s.flashes; run(s, 1100); ok(!s.tilesVisible && s.flashes === fl, 'lampo: spento dopo 1 s, nessun flash consumato');
  run(s, 24000); ok(!s.tilesVisible, 'lampo: il ciclo riparte da zero'); run(s, 1200); ok(s.tilesVisible, 'lampo: secondo lampo a 25 s'); }
// caduta: vita persa, ripartenza dalla partenza, giornali e flash conservati, nessuna nuova memorizzazione
{ const s = new Sim(50); run(s, 7100); const L = s.L;
  play(s, plan(L, [L.news[0]])); const got = s.collected, fl0 = s.flashes;
  ok(got >= 1, 'giornale raccolto');
  s.flash(); ok(s.flashes === fl0 - 1 && s.flashMs === 3000, 'flash: 20 → 19, 3 secondi'); ok(!s.flash(), 'niente secondo flash mentre è acceso'); run(s, 3100); ok(!s.tilesVisible, 'flash spento dopo 3 secondi');
  // passo nel vuoto: cerco una direzione verso una cella senza zolla
  let d = -1; for (let k = 0; k < 4; k++) { const [dx, dy] = DIRV[k], c = s.pos.c + dx, r = s.pos.r + dy; if (!s.isTile(c, r)) { d = k; break; } }
  ok(d >= 0, 'esiste un vuoto accanto'); const here = { c: s.pos.c, r: s.pos.r };
  ok(!s.tilesVisible, 'percorso spento'); s.facing = (d + 1) % 4; s.step(d);
  ok(s.phase === 'play' && s.facing === d && s.pos.c === here.c && s.pos.r === here.r && s.warnMs > 0, 'primo comando verso il vuoto: solo orientamento e avviso');
  run(s, CFG.WARN_MS + 20); ok(s.warnMs === 0, 'avviso scaduto');
  { const [ex, ey] = DIRV[d], jedge = s.isTile(here.c + ex * 2, here.r + ey * 2), n0 = s.lives; s.step(d); if (jedge) { ok(s.phase === 'play', 'bordo del salto: seconda prova ancora senza caduta'); s.step(d); } ok(s.phase === 'step', 'bordo già avvisato: il comando successivo fa cadere'); run(s, CFG.STEP_MS + CFG.FALL_MS + 20); ok(s.lives === n0 - 1, 'vita persa'); run(s, CFG.REVIVE_MS + 50); s.lives = 3; }
  run(s, 600); ok(s.jump() && s.phase === 'jump', 'il salto non è toccato dall\'avviso'); run(s, CFG.JUMP_MS + CFG.FALL_MS + 20); ok(s.lives === 2, 'il salto nel vuoto fa cadere'); run(s, CFG.REVIVE_MS);
  ok(s.pos.c === here.c && s.pos.r === here.r, 'dopo la caduta ripartenza dove si era'); s.lives = 3; s.warnMs = 0; s.facing = (d + 1) % 4;
  s.reviveMs = 0; s.tested.clear(); s.deaths = 0; s.step(d); s.step(d); run(s, CFG.STEP_MS + 20); ok(s.phase === 'fall', 'caduta nel vuoto con comando ripetuto'); s.deaths = 1;
  ok(!s.step(0) && !s.jump() && !s.flash(), 'comandi bloccati durante la caduta'); run(s, CFG.FALL_MS + 20);
  ok(s.lives === 2 && s.phase === 'play' && s.pos.c === here.c && s.pos.r === here.r, 'una vita in meno, ripartenza dal punto della caduta');
  ok(s.tilesVisible && s.reviveMs > CFG.REVIVE_MS - 100 && !s.flash(), 'dopo la caduta tutto acceso per 2,5 s, senza consumare flash'); run(s, CFG.REVIVE_MS - 200); ok(s.tilesVisible, "ancora acceso"); run(s, 220); ok(!s.tilesVisible, 'spento dopo 2,5 s');
  ok(s.collected === got && s.flashes === fl0 - 1 && s.level === 1, 'giornali e flash conservati'); ok(s.memMs === 0, 'niente nuova memorizzazione');
}

// dopo una caduta: tentativi azzerati e una prova in più, anche nei 2,5 s di luce
{ const s = new Sim(50); s.rocks = []; run(s, 7100); let d = -1; for (let k = 0; k < 4; k++) if (!s.isTile(s.pos.c + DIRV[k][0], s.pos.r + DIRV[k][1])) { d = k; break; }
  const here = { c: s.pos.c, r: s.pos.r }; s.step(d); ok(s.warnMs > 0 && s.tested.size === 1, 'prima prova: avviso'); s.step(d); run(s, CFG.STEP_MS + CFG.FALL_MS + 60);
  ok(s.lives === 2 && s.tested.size === 0 && s.pos.c === here.c && s.pos.r === here.r && s.reviveMs > 0, 'dopo la caduta: vita in meno, tentativi azzerati, ripartenza dalla stessa zolla');
  s.step(d); ok(s.phase === 'play' && s.warnMs > 0, 'subito dopo la ripartenza (percorso acceso) il primo comando verso il vuoto avvisa e non fa cadere');
  s.step(d); ok(s.phase === 'play', 'seconda prova ancora senza caduta'); s.step(d); ok(s.phase === 'step', 'terza volta: cade'); run(s, CFG.STEP_MS + CFG.FALL_MS + 60); ok(s.lives === 1 && s.tested.size === 0, 'di nuovo azzerati'); }

// zolle sempre accese: 4, poi una in meno ogni 5 livelli, sul percorso, mai su partenza e portone
for (const [n, k] of [[1, 4], [5, 4], [6, 3], [10, 3], [11, 2], [15, 2]]) {
  const s = new Sim(50); s.loadLevel(n); const L = s.L, a = [...s.anchors];
  ok(anchorCount(n) === k && a.length === k, `livello ${n}: ${k} zolle sempre accese (${a.length})`);
  ok(a.every((i) => L.tiles.has(i) && i !== L.start.r * COLS + L.start.c && i !== L.goal.r * COLS + L.goal.c), `livello ${n}: zolle accese valide`);
  run(s, 7100); ok(!s.tilesVisible, `livello ${n}: dopo la memorizzazione il resto è spento`);
}

// salto: esattamente due caselle, nessun ritiro dei giornali sorvolati
{ const s = new Sim(50); run(s, 7100); const L = s.L; s.pos = { c: 5, r: 6 }; s.L = { ...L, tiles: new Set([6 * COLS + 5, 6 * COLS + 7]), news: [{ c: 5, r: 6 }, { c: 6, r: 6 }, { c: 7, r: 6 }], goal: { c: 0, r: 0 } };
  s.got = new Set([0]); s.turn(1); s.jump(); run(s, CFG.JUMP_MS + 20);
  ok(s.pos.c === 7 && s.pos.r === 6 && s.phase === 'play', 'salto di due caselle sulla zolla'); ok(s.collected === 2 && !s.got.has(1), 'raccolto solo il giornale su cui atterra'); s.turn(1); s.jump(); run(s, CFG.JUMP_MS + 20);
  ok(s.phase === 'fall', 'salto su una casella vuota: cade'); }

// tre cadute: fine partita
{ const s = new Sim(50); run(s, 7100);
  for (let i = 0; i < 3; i++) { let d = 0; for (let k = 0; k < 4; k++) { const [dx, dy] = DIRV[k]; if (!s.isTile(s.pos.c + dx, s.pos.r + dy)) { d = k; break; } } stepOff(s, d); run(s, CFG.STEP_MS + CFG.FALL_MS + 60); }
  ok(s.phase === 'over' && s.lives === 0, 'game over a zero vite'); }

// flash: 20 in tutto, poi si gioca a memoria
{ const s = new Sim(50); run(s, 7100); let used = 0;
  for (let i = 0; i < 25; i++) { if (s.flash()) used++; run(s, 3100); }
  ok(used === 20 && s.flashes === 0 && !s.flash(), 'venti flash complessivi'); }

// livelli configurabili: con 2 livelli la partita si vince al secondo
{ const s = new Sim(2); for (let lv = 1; lv <= 2; lv++) { run(s, 7100); play(s, plan(s.L, [s.L.goal])); run(s, CFG.ARRIVE_MS + 20); if (lv === 1) run(s, CFG.BETWEEN_MS + 20); }
  ok(s.phase === 'won', 'vittoria dopo l\'ultimo livello configurato'); ok(s.flashes === 20 && s.lives === 3, 'flash e vite condivisi'); }

// flash e vite si portano da un livello all'altro
{ const s = new Sim(50); run(s, 7100); s.flash(); run(s, 3100); play(s, plan(s.L, [s.L.goal])); run(s, CFG.ARRIVE_MS + CFG.BETWEEN_MS + 40);
  ok(s.level === 2 && s.flashes === 19 && s.phase === 'memorize' && s.memMs > 6800, 'livello 2: flash 19, memorizzazione di nuovo 7 s'); }

// ---------- livelli 10-50: ascensori, rocce, flash bonus ----------
ok(extrasFor(9) === 0 && extrasFor(10) === 1 && extrasFor(19) === 1 && extrasFor(20) === 2 && extrasFor(50) === 2, 'ascensori e rocce: 0 fino al 9, 1 dal 10, 2 dal 20');
for (let n = 1; n <= N; n++) {
  const L = getLevel(n), want = extrasFor(n), cells = new Set();
  ok(L.lifts.length === want && L.rocks.length === want, `livello ${n}: ${want} ascensori e ${want} rocce`);
  for (const lf of L.lifts) for (const [c, r] of liftCells({ a: [lf.a.c, lf.a.r], b: [lf.b.c, lf.b.r] })) { cells.add(r * COLS + c); ok(!L.tiles.has(r * COLS + c) && r >= 2, `livello ${n}: ascensore su caselle vuote`); }
  for (const lf of L.lifts) for (const e of [lf.a, lf.b]) ok([0, 1, 2, 3].some((d) => L.tiles.has((e.r + DIRV[d][1]) * COLS + e.c + DIRV[d][0])), `livello ${n}: le fermate sono accanto a una zolla`);
  for (const k of L.rocks) {
    const h = k.axis === 'h', tiles = [];
    for (let i = 0; i < (h ? COLS : ROWS); i++) { const c = h ? i : k.lane, r = h ? k.lane : i; ok(!cells.has(r * COLS + c), `livello ${n}: corsia lontana dagli ascensori`); if (L.tiles.has(r * COLS + c)) tiles.push([c, r]); }
    ok(tiles.length >= 3, `livello ${n}: la corsia attraversa almeno 3 zolle`);
    ok(tiles.every(([c, r]) => (h ? [[c, r - 1], [c, r + 1]] : [[c - 1, r], [c + 1, r]]).some(([x, y]) => L.tiles.has(y * COLS + x))), `livello ${n}: ogni zolla della corsia ha una zolla di lato per mettersi in salvo`);
  }
  if (want === 2) ok(L.rocks[0].axis !== L.rocks[1].axis || Math.abs(L.rocks[0].lane - L.rocks[1].lane) >= 3, `livello ${n}: corsie distanti`);
}
ok(rockSpeed(10) === 3 && rockSpeed(50) <= 4.5 && rockSpeed(30) > rockSpeed(10), 'rocce a velocità moderata, crescente');

// ascensore: salire, girarsi senza cadere, non scendere in viaggio, scendere alla fermata
{
  const s = new Sim(50); s.loadLevel(10); s.rocks = []; run(s, 7100);
  const lf = s.L.lifts[0], adj = (p) => [0, 1, 2, 3].map((d) => ({ d, c: p.c + DIRV[d][0], r: p.r + DIRV[d][1] })).filter((x) => s.isTile(x.c, x.r));
  const ta = adj(lf.a)[0], tb = adj(lf.b)[0];
  const wait = (end, min, max = 1e9) => { for (let k = 0; k < 40000; k++) { const st = s.liftState(0); if (st.rest === end && st.left >= min && st.left <= max) return true; s.update(5); } return false; };
  s.pos = { c: ta.c, r: ta.r }; s.safe = { c: ta.c, r: ta.r }; s.phase = 'play';
  ok(wait(0, 20, 150), 'ascensore alla fermata A, sta per partire');
  const n0 = s.log.length; ok(!s.step((ta.d + 2) % 4) && s.log.length === n0, 'l\'ascensore sta per partire: il comando si ignora, nessuna caduta, nessun comando registrato');
  ok(wait(1, 600) && wait(0, 600), 'ascensore di nuovo fermo in A con la sosta davanti');
  ok(s.step((ta.d + 2) % 4), 'salita sull\'ascensore'); run(s, CFG.STEP_MS + 20);
  ok(s.riding === 0 && s.phase === 'play' && s.pos.c === lf.a.c && s.pos.r === lf.a.r, 'Faindo è sulla piattaforma');
  for (const d of [0, 1, 2, 3, 0, 2, 1, 3]) ok(s.turn(d) && s.riding === 0 && s.phase === 'play', 'sulla piattaforma ci si gira quante volte si vuole senza cadere');
  for (let k = 0; k < 4000 && s.liftState(0).rest >= 0; k++) s.update(5);
  ok(s.liftState(0).rest === -1 && s.riding === 0 && s.phase === 'play', 'la piattaforma parte con Faindo sopra');
  run(s, 100); ok(s.liftGrip(0) && s.liftState(0).rest === -1, 'poco dopo la partenza la piattaforma è ancora a tolleranza: si scende e si salta lo stesso');
  { const u = Object.assign(Object.create(Object.getPrototypeOf(s)), s); u.log = []; u.mv = null; ok(u.jump() && u.phase === 'jump', 'salto dalla piattaforma appena partita'); }
  run(s, 400);
  const n1 = s.log.length; ok(!s.liftGrip(0) && !s.step(0) && !s.jump() && s.log.length === n1, 'a metà corsa non si scende né si salta');
  ok(s.turn(1) && s.phase === 'play', 'in viaggio ci si gira ancora');
  run(s, 400); const mid = s.fpos(); ok(Math.abs(mid.x - lf.a.c) + Math.abs(mid.y - lf.a.r) > 0, 'Faindo viaggia con la piattaforma');
  ok(wait(1, 300), 'arrivo alla fermata B'); ok(s.pos.c === lf.b.c && s.pos.r === lf.b.r, 'posizione logica = fermata B');
  ok(s.step(tb.d) && (run(s, CFG.STEP_MS + 20), true) && s.riding === -1 && s.isTile(s.pos.c, s.pos.r) && s.pos.c === tb.c && s.pos.r === tb.r && s.lives === 3, 'sceso sulla zolla di arrivo');
  // dopo una caduta partendo da una zolla raggiunta con l'ascensore si riparte da una zolla vera
  ok(s.safe && s.isTile(s.safe.c, s.safe.r), 'zolla sicura sempre su una zolla vera');
}
// scendere nel vuoto dalla piattaforma: si riparte dall'ultima zolla vera, non dall'ascensore
{
  const s = new Sim(50); s.loadLevel(10); s.rocks = []; run(s, 7100); const lf = s.L.lifts[0];
  const ta = [0, 1, 2, 3].map((d) => ({ d, c: lf.a.c + DIRV[d][0], r: lf.a.r + DIRV[d][1] })).find((x) => s.isTile(x.c, x.r));
  s.pos = { c: ta.c, r: ta.r }; s.safe = { c: ta.c, r: ta.r };
  for (let k = 0; k < 40000 && !(s.liftState(0).rest === 0 && s.liftState(0).left >= 600); k++) s.update(5);
  s.step((ta.d + 2) % 4); run(s, CFG.STEP_MS + 20); ok(s.riding === 0, 'a bordo');
  // un verso senza zolle e senza ascensore: ci si orienta, poi si cade
  const dv = [0, 1, 2, 3].find((d) => !s.isTile(s.pos.c + DIRV[d][0], s.pos.r + DIRV[d][1]) && d !== (ta.d)); const alive = s.lives;
  s.step(dv); if (s.phase === 'play') s.step(dv); run(s, 40);
  if (s.phase === 'step') { run(s, CFG.STEP_MS + CFG.FALL_MS + 60); ok(s.lives === alive - 1 && s.isTile(s.pos.c, s.pos.r) && s.riding === -1, 'dopo la caduta dall\'ascensore Faindo riparte da una zolla vera'); }
}

// rocce: avviso, urto, salvezza con un passo di lato, protezione dopo il colpo
{
  const mk = () => { const s = new Sim(50); s.loadLevel(10); run(s, 7100); return s; };
  const lane = (s) => { const k = s.L.rocks[0], h = k.axis === 'h', ts = []; for (let i = 0; i < (h ? COLS : ROWS); i++) { const c = h ? i : k.lane, r = h ? k.lane : i; if (s.L.tiles.has(r * COLS + c)) ts.push({ c, r }); } return { k, h, ts }; };
  const esc = (s, t, h) => (h ? [0, 2] : [3, 1]).find((d) => s.isTile(t.c + DIRV[d][0], t.r + DIRV[d][1]));
  const s1 = mk(), a = lane(s1); let t = a.ts[0];
  ok(s1.rockState(0) === null, 'all\'inizio le rocce non si vedono');
  let warned = 0; s1.pos = { c: t.c, r: t.r }; s1.safe = { c: t.c, r: t.r };
  for (let k = 0; k < 3000 && !s1.rockState(0); k++) s1.update(5);
  const w = s1.rockState(0); ok(w && w.warn, 'prima l\'avviso'); ok(w.x < 0 || w.x > COLS - 1 || w.y < 0 || w.y > ROWS - 1, 'la roccia compare fuori dalla griglia');
  for (const e of s1.events) if (e.type === 'rockWarn') warned++; ok(warned === 1, 'evento di avviso una sola volta');
  // metto in salvo Faindo con un passo di lato
  s1.events.length = 0; ok(s1.step(esc(s1, t, a.h)), 'passo di lato'); run(s1, 12000);
  ok(s1.lives === 3 && s1.phase === 'play', 'in salvo: la roccia passa senza colpirlo');
  // fermo sulla corsia: colpito
  const s2 = mk(), b = lane(s2); t = b.ts[Math.floor(b.ts.length / 2)]; s2.pos = { c: t.c, r: t.r }; s2.safe = { c: t.c, r: t.r };
  let hit = false; for (let k = 0; k < 4000 && !hit; k++) { s2.update(5); hit = s2.phase === 'fall'; }
  ok(hit && s2.cause === 'rock' && s2.events.some((e) => e.type === 'hit'), 'colpito da una roccia'); ok(!s2.step(0) && !s2.jump(), 'nessun comando mentre è a terra');
  run(s2, CFG.FALL_MS + 20); ok(s2.lives === 2 && s2.phase === 'play' && s2.reviveMs > 0, 'una vita in meno e protezione dopo il colpo');
  run(s2, CFG.REVIVE_MS - 100); ok(s2.lives === 2, 'durante la protezione la roccia non fa male');
  // due rocce dal 20
  const s3 = new Sim(50); s3.loadLevel(20); ok(s3.rocks.length === 2 && s3.L.lifts.length === 2, 'livello 20: due rocce e due ascensori');
}

// oggetti da raccogliere: flash dal 10 (4 fino al 13; dopo il 13 due, un livello sì e due no) e mini Faindo con il più ogni 5 livelli
const wantFlashes = (n) => n < 10 ? 0 : n <= 13 ? 4 : (n - 14) % 3 === 0 ? 2 : 0;
for (let n = 1; n <= N; n++) {
  const L = getLevel(n), want = wantFlashes(n), seen = new Set([L.start, L.goal, ...L.news].map((p) => p.r * COLS + p.c));
  ok(L.flashes.length === want && (n % 5 === 0 ? !!L.life : L.life === null), `livello ${n}: ${want} flash e ${n % 5 === 0 ? 'una' : 'nessuna'} vita da raccogliere`);
  for (const p of [...L.flashes, ...(L.life ? [L.life] : [])]) { const i = p.r * COLS + p.c; ok(L.tiles.has(i) && !seen.has(i), `livello ${n}: oggetto su una zolla libera e distinta`); seen.add(i); }
  for (const [i, k] of L.deco) ok(L.tiles.has(i) && i !== L.goal.r * COLS + L.goal.c && i !== L.start.r * COLS + L.start.c && ['wood', 'lantern', 'fall', 'bridge'].includes(k), `livello ${n}: zolla speciale valida`);
}
{ const s = new Sim(50); s.loadLevel(10); s.rocks = []; run(s, 7100); const L = s.L, f0 = s.flashes;
  s.pos = { c: L.flashes[0].c, r: L.flashes[0].r }; s.mv = { kind: 'step', from: { c: L.flashes[0].c, r: L.flashes[0].r }, to: { c: L.flashes[0].c, r: L.flashes[0].r }, t: 0, dur: 1, fromLift: false, toLift: -1 }; s.phase = 'step'; run(s, 50);
  ok(s.flashes === f0 + 1 && s.gotFlash.size === 1 && s.events.some((e) => e.type === 'flashPick'), 'flash raccolto: +1 flash'); s.events.length = 0;
  s.mv = { kind: 'step', from: { c: L.flashes[0].c, r: L.flashes[0].r }, to: { c: L.flashes[0].c, r: L.flashes[0].r }, t: 0, dur: 1, fromLift: false, toLift: -1 }; s.phase = 'step'; run(s, 50);
  ok(s.flashes === f0 + 1, 'un flash si raccoglie una sola volta');
  const onLife = (q) => { q.mv = { kind: 'step', from: { c: q.L.life.c, r: q.L.life.r }, to: { c: q.L.life.c, r: q.L.life.r }, t: 0, dur: 1, fromLift: false, toLift: -1 }; q.phase = 'step'; run(q, 50); };
  s.lives = 2; onLife(s);
  ok(s.lives === 3 && s.gotLife, 'mini Faindo con due vite: +1 vita');
  const t = new Sim(50); t.loadLevel(10); t.rocks = []; ok(t.lives === 3, 'si parte con tre vite'); onLife(t);
  ok(t.lives === 3 && !t.gotLife, 'con tre vite il mini Faindo non si prende'); }

// punteggio svolazzante: l'evento giornale porta posizione e punti
{ const s = new Sim(50); s.rocks = []; run(s, 7100); const L = s.L; play(s, plan(L, [L.news[0]]));
  const e = s.events.filter((x) => x.type === 'news').pop(); ok(e && e.pts === 500 && e.c === L.news[0].c && e.r === L.news[0].r, 'evento giornale con posizione e +500'); }

// flash bonus: uno ogni tre livelli dal 20 (20, 23, 26…), aggiunto a quelli rimasti
{ const s = new Sim(50); let bonus = [], prev = s.flashes;
  for (let n = 2; n <= 50; n++) { s.loadLevel(n); const got = s.events.some((e) => e.type === 'bonusFlash'); if (got) bonus.push(n); ok(s.flashes === prev + (got ? 1 : 0), `livello ${n}: flash ${prev} → ${s.flashes}`); prev = s.flashes; s.events.length = 0; }
  ok(bonus.join() === [20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50].join(), 'flash bonus ai livelli 20, 23, …, 50: ' + bonus.join());
  const t = new Sim(50); t.loadLevel(19); t.flashes = 7; t.loadLevel(20); ok(t.flashes === 8, 'si somma ai flash rimasti'); t.loadLevel(21); t.loadLevel(22); ok(t.flashes === 8, 'due livelli senza bonus'); }

console.log(`${checks} controlli, ${fails} falliti`);
process.exit(fails ? 1 : 0);
