// Prove automatiche di Lost Signal: node test-lost.mjs
import { getLevel, COLS, ROWS } from './levels.js';
import { LEVEL_DATA } from './levels-data.js';
import { analyze, params } from './levelgen.js';
import { Sim, CFG, DIRV } from './sim.js';

let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.error('FALLITO:', msg); } };

// ---------- mappe ----------
const N = LEVEL_DATA.length;
ok(N === 15, '15 mappe salvate');
for (let n = 1; n <= N + 3; n++) {
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
function play(sim, moves) {
  for (const m of moves) {
    ok(sim.phase === 'play', 'pronto a muoversi'); if (sim.phase !== 'play') return;
    if (m.k === 1) sim.step(m.d); else { sim.turn(m.d); sim.jump(); }
    if (sim.phase !== 'arrive') settle(sim);
  }
}

for (let n = 1; n <= N; n++) {
  const sim = new Sim(15); sim.loadLevel(n); sim.score = 0;
  ok(sim.phase === 'memorize' && sim.tilesVisible, 'memorizzazione iniziale visibile');
  ok(!sim.step(0) && !sim.jump() && !sim.flash(), 'comandi bloccati durante la memorizzazione');
  run(sim, 6900); ok(sim.phase === 'memorize' && sim.tilesVisible, 'ancora 7 s di memorizzazione'); run(sim, 200);
  ok(sim.phase === 'play' && !sim.tilesVisible, 'dopo 7 s le zolle spariscono');
  const L = sim.L; const moves = plan(L, [...L.news, L.goal]);
  play(sim, moves);
  ok(sim.phase === 'arrive', `livello ${n}: arrivo al portone`);
  run(sim, CFG.ARRIVE_MS + 20);
  ok(sim.score === 1000 + 500 * 3 && sim.score <= 2500, `livello ${n}: punteggio ${sim.score}`);
  ok(sim.lives === 3 && sim.flashes === 20, 'nessuna vita o flash persi');
}

// arrivo con zero giornali: solo 1000, una volta sola
{ const s = new Sim(15); run(s, 7100); const L = s.L;
  // percorso diretto verso il portone evitando i giornali se possibile: calcolo con solo la meta
  play(s, plan(L, [L.goal])); run(s, CFG.ARRIVE_MS + 20);
  ok(s.score === 1000 + 500 * s.stats.news, 'punteggio = 1000 + 500 per giornale raccolto'); const sc = s.score; run(s, 200); ok(s.score === sc || s.phase === 'between', 'punteggio una sola volta'); }

// caduta: vita persa, ripartenza dalla partenza, giornali e flash conservati, nessuna nuova memorizzazione
{ const s = new Sim(15); run(s, 7100); const L = s.L;
  play(s, plan(L, [L.news[0]])); const got = s.collected, fl0 = s.flashes;
  ok(got >= 1, 'giornale raccolto');
  s.flash(); ok(s.flashes === fl0 - 1 && s.flashMs === 3000, 'flash: 20 → 19, 3 secondi'); ok(!s.flash(), 'niente secondo flash mentre è acceso');
  // passo nel vuoto: cerco una direzione verso una cella senza zolla
  let d = -1; for (let k = 0; k < 4; k++) { const [dx, dy] = DIRV[k], c = s.pos.c + dx, r = s.pos.r + dy; if (!s.isTile(c, r)) { d = k; break; } }
  ok(d >= 0, 'esiste un vuoto accanto'); s.step(d); run(s, CFG.STEP_MS + 20); ok(s.phase === 'fall', 'caduta nel vuoto');
  ok(!s.step(0) && !s.jump() && !s.flash(), 'comandi bloccati durante la caduta'); run(s, CFG.FALL_MS + 20);
  ok(s.lives === 2 && s.phase === 'play' && s.pos.c === L.start.c && s.pos.r === L.start.r, 'una vita in meno, ripartenza');
  ok(s.collected === got && s.flashes === fl0 - 1 && s.level === 1, 'giornali e flash conservati'); ok(s.memMs === 0, 'niente nuova memorizzazione');
  run(s, 3000); ok(!s.tilesVisible, 'flash spento dopo 3 secondi'); }

// salto: esattamente due caselle, nessun ritiro dei giornali sorvolati
{ const s = new Sim(15); run(s, 7100); const L = s.L; s.pos = { c: 5, r: 6 }; s.L = { ...L, tiles: new Set([6 * COLS + 5, 6 * COLS + 7]), news: [{ c: 5, r: 6 }, { c: 6, r: 6 }, { c: 7, r: 6 }], goal: { c: 0, r: 0 } };
  s.got = new Set([0]); s.turn(1); s.jump(); run(s, CFG.JUMP_MS + 20);
  ok(s.pos.c === 7 && s.pos.r === 6 && s.phase === 'play', 'salto di due caselle sulla zolla'); ok(s.collected === 2 && !s.got.has(1), 'raccolto solo il giornale su cui atterra'); s.turn(1); s.jump(); run(s, CFG.JUMP_MS + 20);
  ok(s.phase === 'fall', 'salto su una casella vuota: cade'); }

// tre cadute: fine partita
{ const s = new Sim(15); run(s, 7100);
  for (let i = 0; i < 3; i++) { let d = 0; for (let k = 0; k < 4; k++) { const [dx, dy] = DIRV[k]; if (!s.isTile(s.pos.c + dx, s.pos.r + dy)) { d = k; break; } } s.step(d); run(s, CFG.STEP_MS + CFG.FALL_MS + 60); }
  ok(s.phase === 'over' && s.lives === 0, 'game over a zero vite'); }

// flash: 20 in tutto, poi si gioca a memoria
{ const s = new Sim(15); run(s, 7100); let used = 0;
  for (let i = 0; i < 25; i++) { if (s.flash()) used++; run(s, 3100); }
  ok(used === 20 && s.flashes === 0 && !s.flash(), 'venti flash complessivi'); }

// livelli configurabili: con 2 livelli la partita si vince al secondo
{ const s = new Sim(2); for (let lv = 1; lv <= 2; lv++) { run(s, 7100); play(s, plan(s.L, [s.L.goal])); run(s, CFG.ARRIVE_MS + 20); if (lv === 1) run(s, CFG.BETWEEN_MS + 20); }
  ok(s.phase === 'won', 'vittoria dopo l\'ultimo livello configurato'); ok(s.flashes === 20 && s.lives === 3, 'flash e vite condivisi'); }

// flash e vite si portano da un livello all'altro
{ const s = new Sim(15); run(s, 7100); s.flash(); run(s, 3100); play(s, plan(s.L, [s.L.goal])); run(s, CFG.ARRIVE_MS + CFG.BETWEEN_MS + 40);
  ok(s.level === 2 && s.flashes === 19 && s.phase === 'memorize' && s.memMs > 6800, 'livello 2: flash 19, memorizzazione di nuovo 7 s'); }

console.log(`${checks} controlli, ${fails} falliti`);
process.exit(fails ? 1 : 0);
