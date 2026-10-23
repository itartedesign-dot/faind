/* =====================================================================
   FAIND LOST SIGNAL — il motore di gioco (nessun disegno, nessun audio)
   ---------------------------------------------------------------------
   Posizione logica a terra (c, r) separata dall'altezza del salto, che è solo grafica: collisioni e atterraggio usano
   sempre la casella. Tutti i tempi sono in millisecondi avanzati da update(dt): chi chiama non lo fa avanzare in pausa,
   a pagina nascosta o durante le schermate, così lampi e memorizzazione non si consumano mai da soli.
   Comandi: il registro `log` contiene solo quelli accettati, come [clock, codice] con codice 0-3 passo, 4-7 orientamento, 8 salto, 9 flash;
   il gioco avanza a passi fissi di 5 ms (game-api/verify.js rifà la stessa partita sul server).
   Percorso spento: il primo comando verso una casella senza zolla orienta soltanto Faindo e accende un avviso (WARN_MS); se lo stesso
   bordo viene provato di nuovo Faindo cade. Il bordo da cui parte il salto (zolla a due caselle) si può provare 2 volte, alla terza cade. Dopo una caduta Faindo riparte dalla zolla da cui è caduto e per
   REVIVE_MS tutto il percorso è acceso. Quattro zolle (tre dal livello 6, due dall'11…) restano sempre accese.
   Ascensori (dal livello 10): piattaforme sempre accese che fanno la spola fra due fermate; si sale e si scende solo a piattaforma ferma, sopra si può
   solo girarsi (Faindo non cade). Rocce (dal 10): ognuna rotola lungo una riga o una colonna intera, entra da fuori schermo dopo un avviso di 1,3 s e
   toglie una vita se tocca Faindo; dopo ogni caduta o colpo le rocce non fanno male per REVIVE_MS. Dal 20: due ascensori e due rocce, e un flash in
   più all'inizio dei livelli 20, 23, 26… Tutto è funzione del tempo di gioco (nessun caso): il server rifà la stessa partita.
   Fasi: memorize | play | step | jump | fall | arrive | between | over | won
   ===================================================================== */
import { getLevel, COLS, ROWS } from './levels.js?v=20261024b';
import { LIFT_CELL_MS, LIFT_DWELL_MS } from './levelgen.js?v=20261024b';

export const CFG = {
  MEMORIZE_MS: 7000, FLASH_MS: 3000, FLASHES: 20, LIVES: 3, STEP_MS: 150, JUMP_MS: 400, FALL_MS: 900, WARN_MS: 1500, REVIVE_MS: 2500, ARRIVE_MS: 1700, BETWEEN_MS: 1500,
  SCORE: { ARRIVE: 1000, NEWS: 500 },
  MAX_LIVES: 5, ROCK_WARN_MS: 1300, ROCK_FIRST_MS: 3000, ROCK_HIT: 0.62, FLASH_BONUS_FROM: 20
};
export const DIRV = [[0, -1], [1, 0], [0, 1], [-1, 0]];     // su, destra, giù, sinistra

/** velocità delle rocce in caselle al secondo: moderata, da 3 al livello 10 a 4,2 al 50 */
export const rockSpeed = (n) => 3 + 0.03 * (Math.max(10, n) - 10);
const rockCache = new Map();
/** rocce del livello: corsia, tempi del ciclo (avviso, rotolamento, pausa) e partenza sfalsata */
function rockDefs(L) {
  if (rockCache.has(L.n)) return rockCache.get(L.n);
  const defs = L.rocks.map((k, i) => {
    const N = k.axis === 'h' ? COLS : ROWS, speed = rockSpeed(L.n) / 1000, travel = Math.round((N + 2) / speed);
    const idle = Math.max(1800, 4200 - (L.n - 10) * 45);
    return { i, axis: k.axis, lane: k.lane, N, speed, travel, period: CFG.ROCK_WARN_MS + travel + idle, delay: CFG.ROCK_FIRST_MS + i * 3500 };
  });
  rockCache.set(L.n, defs); return defs;
}
const sideOf = (L, def, k) => ((Math.imul(k + 1, 2654435761) ^ Math.imul(def.i + 1, 40503) ^ Math.imul(L.n, 69069)) >>> 16) & 1;

/** quante zolle restano sempre accese: 4 fino al livello 5, una in meno ogni 5 livelli, mai meno di una */
export const anchorCount = (n) => Math.max(1, 4 - Math.floor((Math.max(1, n) - 1) / 5));
const anchorCache = new Map();
/** zolle sempre accese: distribuite con regolarità sul percorso più breve (passi e salti da due) fra partenza e portone, escluse partenza e portone */
function anchorSet(L, count) {
  const ck = L.n + ':' + count; if (anchorCache.has(ck)) return anchorCache.get(ck);
  const key = (c, r) => r * COLS + c, from = key(L.start.c, L.start.r), goal = key(L.goal.c, L.goal.r);
  const prev = new Map([[from, -1]]), q = [from];
  for (let h = 0; h < q.length && !prev.has(goal); h++) {
    const c = q[h] % COLS, r = (q[h] / COLS) | 0;
    for (let d = 0; d < 4; d++) for (const k of [1, 2]) {
      const nc = c + DIRV[d][0] * k, nr = r + DIRV[d][1] * k, i = key(nc, nr);
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || !L.tiles.has(i) || prev.has(i)) continue;
      prev.set(i, q[h]); q.push(i);
    }
  }
  const path = []; for (let i = prev.get(goal); i >= 0 && i !== from; i = prev.get(i)) path.unshift(i);
  const pool = path.length >= count ? path : path.concat([...L.tiles].filter((i) => i !== from && i !== goal && !path.includes(i)).sort((a, b) => a - b));
  const out = new Set(); for (let k = 0; k < count && k < pool.length; k++) out.add(pool[Math.floor(((k + 0.5) * pool.length) / count)]);
  anchorCache.set(ck, out); return out;
}

export class Sim {
  constructor(levels = 15) {
    this.levels = Math.max(1, levels | 0);
    this.level = 1; this.lives = CFG.LIVES; this.flashes = CFG.FLASHES; this.score = 0;
    this.stats = { news: 0, falls: 0 }; this.continues = 0;   // una partita con continue non può andare in classifica
    this.events = [];
    this.clock = 0; this.log = [];     // millisecondi avanzati e comandi accettati [clock, codice]: la verifica sul server rifà la partita da qui

    this.loadLevel(1);
  }

  loadLevel(n) {
    this.level = n; this.L = getLevel(n);
    this.pos = { c: this.L.start.c, r: this.L.start.r }; this.facing = 0;
    this.got = new Set(); this.gotFlash = new Set(); this.gotLife = false; this.scored = false;
    this.phase = 'memorize'; this.memMs = CFG.MEMORIZE_MS; this.flashMs = 0;
    this.warnMs = 0; this.warnDir = -1; this.tested = new Map(); this.reviveMs = 0; this.safe = { c: this.pos.c, r: this.pos.r }; this.anchors = anchorSet(this.L, anchorCount(n));
    this.mv = null; this.fallT = 0; this.arriveT = 0; this.betweenT = 0; this.stepFoot = 0; this.over = false;
    this.liftClock = 0; this.rockClock = 0; this.riding = -1; this.cause = ''; this.hitAt = null; this.rocks = rockDefs(this.L); this.rockSeen = this.rocks.map(() => -1);
    this.events.push({ type: 'level', level: n });
    // dal livello 20, uno ogni tre (20, 23, 26…): un flash in più, che si somma a quelli rimasti
    if (n >= CFG.FLASH_BONUS_FROM && (n - CFG.FLASH_BONUS_FROM) % 3 === 0) { this.flashes++; this.events.push({ type: 'bonusFlash', left: this.flashes }); }
  }

  get collected() { return this.got.size; }
  /** le zolle si vedono durante la memorizzazione e mentre un flash è acceso */
  get tilesVisible() { return this.phase === 'memorize' || this.flashMs > 0 || this.reviveMs > 0; }
  get canAct() { return this.phase === 'play'; }
  isTile(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS && this.L.tiles.has(r * COLS + c); }
  newsAt(c, r) { return this.L.news.findIndex((n) => n.c === c && n.r === r); }

  /** stato dell'ascensore i: posizione in caselle (x, y), fermata (0 = A, 1 = B, -1 in viaggio) e millisecondi di sosta rimasti */
  liftState(i) {
    const L = this.L.lifts[i], D = LIFT_DWELL_MS, T = L.len * LIFT_CELL_MS, t = (this.liftClock + L.off) % L.cycle;
    if (t < D) return { x: L.a.c, y: L.a.r, rest: 0, left: D - t };
    if (t < D + T) { const f = (t - D) / T; return { x: L.a.c + (L.b.c - L.a.c) * f, y: L.a.r + (L.b.r - L.a.r) * f, rest: -1, left: 0 }; }
    if (t < 2 * D + T) return { x: L.b.c, y: L.b.r, rest: 1, left: 2 * D + T - t };
    const f = (t - 2 * D - T) / T;
    return { x: L.b.c + (L.a.c - L.b.c) * f, y: L.b.r + (L.a.r - L.b.r) * f, rest: -1, left: 0 };
  }
  /** ascensore fermo nella casella (c, r) con almeno minLeft ms di sosta davanti, oppure -1 */
  liftAtRest(c, r, minLeft) {
    for (let i = 0; i < this.L.lifts.length; i++) { const s = this.liftState(i); if (s.rest >= 0 && s.x === c && s.y === r && s.left >= minLeft) return i; }
    return -1;
  }
  /** vero se un ascensore sta per arrivare o partire dalla fermata (c, r): il comando verso di lui si ignora invece di far cadere */
  liftBusyAt(c, r) {
    return this.L.lifts.some((L, i) => (L.a.c === c && L.a.r === r || L.b.c === c && L.b.r === r) && Math.abs(this.liftState(i).x - c) + Math.abs(this.liftState(i).y - r) < 1.01);
  }
  /** ascensore che copre la casella (c, r) in questo istante (atterraggio di un salto), oppure -1 */
  liftCovering(c, r) {
    for (let i = 0; i < this.L.lifts.length; i++) { const s = this.liftState(i); if (Math.abs(s.x - c) < 0.5 && Math.abs(s.y - r) < 0.5) return i; }
    return -1;
  }
  /** roccia k: null se non c'è, altrimenti { warn, x, y, side, k } con x,y in caselle (fuori schermo a -1,5 o N+0,5 all'ingresso) */
  rockState(j) {
    const d = this.rocks[j], t = this.rockClock - d.delay; if (t < 0) return null;
    const k = Math.floor(t / d.period); let u = t - k * d.period;
    const side = sideOf(this.L, d, k), edge = side ? d.N + 0.5 : -1.5, h = d.axis === 'h';
    if (u < CFG.ROCK_WARN_MS) return { warn: true, prog: u / CFG.ROCK_WARN_MS, x: h ? edge : d.lane, y: h ? d.lane : edge, side, k, axis: d.axis };
    u -= CFG.ROCK_WARN_MS; if (u >= d.travel) return null;
    const p = side ? edge - (d.N + 2) * (u / d.travel) : edge + (d.N + 2) * (u / d.travel);
    return { warn: false, prog: u / d.travel, x: h ? p : d.lane, y: h ? d.lane : p, side, k, axis: d.axis };
  }
  /** posizione di Faindo in caselle, con decimali durante un passo o su un ascensore */
  fpos() {
    if (this.riding >= 0) { const s = this.liftState(this.riding); return { x: s.x, y: s.y }; }
    const mv = this.mv; if (!mv) return { x: this.pos.c, y: this.pos.r };
    const p = Math.min(1, mv.t / mv.dur);
    return { x: mv.from.c + (mv.to.c - mv.from.c) * p, y: mv.from.r + (mv.to.r - mv.from.r) * p };
  }

  /** Un passo di una casella nella direzione d (orienta e muove). A percorso spento, verso il vuoto, la prima volta orienta soltanto e avvisa. */
  step(d) {
    if (this.phase !== 'play') return false;
    if (this.riding >= 0 && this.liftState(this.riding).rest < 0) return false;                // su una piattaforma in viaggio ci si può solo girare
    const [dx, dy] = DIRV[d], tc = this.pos.c + dx, tr = this.pos.r + dy;
    let toLift = -1;
    if (!this.isTile(tc, tr)) {
      toLift = this.liftAtRest(tc, tr, CFG.STEP_MS + 100);
      if (toLift < 0 && this.liftBusyAt(tc, tr)) return false;                                  // l'ascensore sta arrivando o partendo: si aspetta
    }
    this.log.push([this.clock, d]);
    if (toLift < 0 && !this.tilesVisible && !this.isTile(tc, tr)) {
      const key = (this.pos.r * COLS + this.pos.c) * 4 + d, used = this.tested.get(key) || 0;
      if (used < (this.isTile(this.pos.c + dx * 2, this.pos.r + dy * 2) ? 2 : 1)) {   // bordo del salto: 2 prove, ogni altro bordo: 1
        this.tested.set(key, used + 1);
        this.facing = d; this.warnDir = d; this.warnMs = CFG.WARN_MS; this.events.push({ type: 'warn', dir: d });
        return true;
      }
    }
    this.facing = d; this.warnMs = 0;
    this.mv = { kind: 'step', from: { c: this.pos.c, r: this.pos.r }, to: { c: tc, r: tr }, t: 0, dur: CFG.STEP_MS, fromLift: this.riding >= 0, toLift };
    this.riding = -1; this.phase = 'step'; this.stepFoot ^= 1; this.events.push({ type: 'step' });
    return true;
  }

  /** Solo orientamento, senza muoversi. */
  turn(d) {
    if (this.phase !== 'play') return false;
    if (this.warnDir !== d) this.warnMs = 0;
    if (this.facing !== d) { this.facing = d; this.log.push([this.clock, 4 + d]); this.events.push({ type: 'turn' }); }
    return true;
  }

  /** Salto di esattamente due caselle nella direzione in cui Faindo è rivolto. */
  jump() {
    if (this.phase !== 'play') return false;
    if (this.riding >= 0 && this.liftState(this.riding).rest < 0) return false;
    this.log.push([this.clock, 8]); this.warnMs = 0;
    const [dx, dy] = DIRV[this.facing];
    this.mv = { kind: 'jump', from: { c: this.pos.c, r: this.pos.r }, to: { c: this.pos.c + dx * 2, r: this.pos.r + dy * 2 }, t: 0, dur: CFG.JUMP_MS, fromLift: this.riding >= 0, toLift: -1 };
    this.riding = -1; this.phase = 'jump'; this.events.push({ type: 'jump' });
    return true;
  }

  /** Riaccende le zolle per 3 secondi. Non si può durante memorizzazione, transizioni, caduta o con un flash già acceso. */
  flash() {
    if (!(this.phase === 'play' || this.phase === 'step' || this.phase === 'jump')) return false;
    if (this.flashMs > 0 || this.reviveMs > 0 || this.flashes <= 0) return false;
    this.log.push([this.clock, 9]);
    this.flashes--; this.flashMs = CFG.FLASH_MS; this.events.push({ type: 'flash', left: this.flashes });
    return true;
  }

  update(dt) {
    dt = Math.max(0, Math.min(dt, 100)); this.clock += dt;
    this.liftClock += dt; if (this.phase !== 'memorize') this.rockClock += dt;
    if (this.riding >= 0) { const s = this.liftState(this.riding); this.pos = { c: Math.round(s.x), r: Math.round(s.y) }; }
    if (this.warnMs > 0) this.warnMs = Math.max(0, this.warnMs - dt);
    if (this.reviveMs > 0) this.reviveMs = Math.max(0, this.reviveMs - dt);
    if (this.flashMs > 0) { this.flashMs = Math.max(0, this.flashMs - dt); if (this.flashMs === 0) this.events.push({ type: 'flashEnd' }); }
    switch (this.phase) {
      case 'memorize':
        this.memMs -= dt;
        if (this.memMs <= 0) { this.memMs = 0; this.phase = 'play'; this.events.push({ type: 'memorizeEnd' }); }
        break;
      case 'step': case 'jump':
        this.mv.t += dt;
        if (this.mv.t >= this.mv.dur) this._land();
        break;
      case 'fall':
        this.fallT += dt;
        if (this.fallT >= CFG.FALL_MS) this._lose();
        break;
      case 'arrive':
        this.arriveT += dt;
        if (this.arriveT >= CFG.ARRIVE_MS) this._complete();
        break;
      case 'between':
        this.betweenT += dt;
        if (this.betweenT >= CFG.BETWEEN_MS) this.loadLevel(this.level + 1);
        break;
    }
    if (this.rocks.length) this._rocks();
  }

  /** avvisi delle rocce (evento una volta per ciclo) e urti: una roccia che tocca Faindo (distanza minore di ROCK_HIT su entrambi gli assi) gli toglie una vita */
  _rocks() {
    const live = this.reviveMs <= 0 && (this.phase === 'play' || this.phase === 'step' || this.phase === 'jump'), f = live ? this.fpos() : null;
    for (let j = 0; j < this.rocks.length; j++) {
      const r = this.rockState(j); if (!r) continue;
      if (r.warn) { if (this.rockSeen[j] !== r.k) { this.rockSeen[j] = r.k; this.events.push({ type: 'rockWarn', j }); } continue; }
      if (live && Math.abs(r.x - f.x) < CFG.ROCK_HIT && Math.abs(r.y - f.y) < CFG.ROCK_HIT) { this._hit(f, r); return; }
    }
  }
  _hit(f, rock) {
    const mv = this.mv;
    if (mv) { if (!mv.fromLift) this.safe = { c: mv.from.c, r: mv.from.r }; this.pos = { c: mv.from.c, r: mv.from.r }; }
    this.mv = null; this.riding = -1; this.warnMs = 0; this.phase = 'fall'; this.fallT = 0; this.cause = 'rock'; this.hitAt = { x: f.x, y: f.y, side: rock.side, axis: rock.axis };
    this.events.push({ type: 'hit' });
  }

  _land() {
    const mv = this.mv, kind = mv.kind, to = mv.to; if (!mv.fromLift) this.safe = { c: mv.from.c, r: mv.from.r };   // dopo un ascensore resta l'ultima zolla vera
    this.pos = { c: to.c, r: to.r }; this.mv = null;
    if (!this.isTile(to.c, to.r)) {
      const lf = mv.toLift >= 0 ? mv.toLift : this.liftCovering(to.c, to.r);
      if (lf >= 0) { this.riding = lf; this.phase = 'play'; this.events.push({ type: 'land', kind }); return; }
      this.phase = 'fall'; this.fallT = 0; this.cause = ''; this.events.push({ type: 'fall' }); return;
    }
    this.events.push({ type: 'land', kind });
    const k = this.newsAt(to.c, to.r);
    const fk = this.L.flashes.findIndex((f) => f.c === to.c && f.r === to.r);
    if (fk >= 0 && !this.gotFlash.has(fk)) { this.gotFlash.add(fk); this.flashes++; this.events.push({ type: 'flashPick', c: to.c, r: to.r, left: this.flashes }); }
    const lf = this.L.life;
    if (lf && !this.gotLife && lf.c === to.c && lf.r === to.r) { this.gotLife = true; if (this.lives < CFG.MAX_LIVES) this.lives++; this.events.push({ type: 'lifePick', c: to.c, r: to.r, lives: this.lives }); }
    if (k >= 0 && !this.got.has(k)) { this.got.add(k); this.events.push({ type: 'news', n: this.got.size, c: to.c, r: to.r, pts: CFG.SCORE.NEWS }); }
    if (to.c === this.L.goal.c && to.r === this.L.goal.r) { this.phase = 'arrive'; this.arriveT = 0; this.events.push({ type: 'arrive' }); return; }
    this.phase = 'play';
  }

  _lose() {
    this.lives--; this.stats.falls++; this.events.push({ type: 'life', lives: this.lives, cause: this.cause });
    if (this.lives <= 0) { this.phase = 'over'; this.over = true; this.events.push({ type: 'over' }); return; }
    this.pos = { c: this.safe.c, r: this.safe.r }; this.reviveMs = CFG.REVIVE_MS; this.warnMs = 0; this.tested.clear(); this.phase = 'play'; this.cause = ''; this.hitAt = null; this.riding = -1; this.events.push({ type: 'respawn' });
  }

  /** Continue dopo l'ultima vita: stesso livello, tre vite nuove, Faindo sull'ultima zolla sicura con il percorso acceso. Flash residui e giornali raccolti restano. */
  revive() {
    if (this.phase !== 'over') return false;
    this.continues++; this.lives = CFG.LIVES; this.over = false;
    this.pos = { c: this.safe.c, r: this.safe.r }; this.reviveMs = CFG.REVIVE_MS; this.warnMs = 0; this.tested.clear(); this.phase = 'play'; this.cause = ''; this.hitAt = null; this.riding = -1;
    this.events.push({ type: 'respawn' });
    return true;
  }

  _complete() {
    if (!this.scored) {
      this.scored = true;
      this.score += CFG.SCORE.ARRIVE + CFG.SCORE.NEWS * this.got.size; this.stats.news += this.got.size;
      this.events.push({ type: 'levelDone', level: this.level, news: this.got.size });
    }
    if (this.level >= this.levels) { this.phase = 'won'; this.events.push({ type: 'won' }); }
    else { this.phase = 'between'; this.betweenT = 0; }
  }
}
