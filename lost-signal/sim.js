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
   Fasi: memorize | play | step | jump | fall | arrive | between | over | won
   ===================================================================== */
import { getLevel, COLS, ROWS } from './levels.js?v=20261023b';

export const CFG = {
  MEMORIZE_MS: 7000, FLASH_MS: 3000, FLASHES: 20, LIVES: 3, STEP_MS: 150, JUMP_MS: 400, FALL_MS: 900, WARN_MS: 1500, REVIVE_MS: 2500, ARRIVE_MS: 1700, BETWEEN_MS: 1500,
  SCORE: { ARRIVE: 1000, NEWS: 500 }
};
export const DIRV = [[0, -1], [1, 0], [0, 1], [-1, 0]];     // su, destra, giù, sinistra

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
    this.got = new Set(); this.scored = false;
    this.phase = 'memorize'; this.memMs = CFG.MEMORIZE_MS; this.flashMs = 0;
    this.warnMs = 0; this.warnDir = -1; this.tested = new Map(); this.reviveMs = 0; this.safe = { c: this.pos.c, r: this.pos.r }; this.anchors = anchorSet(this.L, anchorCount(n));
    this.mv = null; this.fallT = 0; this.arriveT = 0; this.betweenT = 0; this.stepFoot = 0; this.over = false;
    this.events.push({ type: 'level', level: n });
  }

  get collected() { return this.got.size; }
  /** le zolle si vedono durante la memorizzazione e mentre un flash è acceso */
  get tilesVisible() { return this.phase === 'memorize' || this.flashMs > 0 || this.reviveMs > 0; }
  get canAct() { return this.phase === 'play'; }
  isTile(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS && this.L.tiles.has(r * COLS + c); }
  newsAt(c, r) { return this.L.news.findIndex((n) => n.c === c && n.r === r); }

  /** Un passo di una casella nella direzione d (orienta e muove). A percorso spento, verso il vuoto, la prima volta orienta soltanto e avvisa. */
  step(d) {
    if (this.phase !== 'play') return false;
    this.log.push([this.clock, d]);
    const [dx, dy] = DIRV[d];
    if (!this.tilesVisible && !this.isTile(this.pos.c + dx, this.pos.r + dy)) {
      const key = (this.pos.r * COLS + this.pos.c) * 4 + d, used = this.tested.get(key) || 0;
      if (used < (this.isTile(this.pos.c + dx * 2, this.pos.r + dy * 2) ? 2 : 1)) {   // bordo del salto: 2 prove, ogni altro bordo: 1
        this.tested.set(key, used + 1);
        this.facing = d; this.warnDir = d; this.warnMs = CFG.WARN_MS; this.events.push({ type: 'warn', dir: d });
        return true;
      }
    }
    this.facing = d; this.warnMs = 0;
    this.mv = { kind: 'step', from: { c: this.pos.c, r: this.pos.r }, to: { c: this.pos.c + dx, r: this.pos.r + dy }, t: 0, dur: CFG.STEP_MS };
    this.phase = 'step'; this.stepFoot ^= 1; this.events.push({ type: 'step' });
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
    this.log.push([this.clock, 8]); this.warnMs = 0;
    const [dx, dy] = DIRV[this.facing];
    this.mv = { kind: 'jump', from: { c: this.pos.c, r: this.pos.r }, to: { c: this.pos.c + dx * 2, r: this.pos.r + dy * 2 }, t: 0, dur: CFG.JUMP_MS };
    this.phase = 'jump'; this.events.push({ type: 'jump' });
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
  }

  _land() {
    const kind = this.mv.kind, to = this.mv.to; this.safe = { c: this.mv.from.c, r: this.mv.from.r };
    this.pos = { c: to.c, r: to.r }; this.mv = null;
    if (!this.isTile(to.c, to.r)) { this.phase = 'fall'; this.fallT = 0; this.events.push({ type: 'fall' }); return; }
    this.events.push({ type: 'land', kind });
    const k = this.newsAt(to.c, to.r);
    if (k >= 0 && !this.got.has(k)) { this.got.add(k); this.events.push({ type: 'news', n: this.got.size }); }
    if (to.c === this.L.goal.c && to.r === this.L.goal.r) { this.phase = 'arrive'; this.arriveT = 0; this.events.push({ type: 'arrive' }); return; }
    this.phase = 'play';
  }

  _lose() {
    this.lives--; this.stats.falls++; this.events.push({ type: 'life', lives: this.lives });
    if (this.lives <= 0) { this.phase = 'over'; this.over = true; this.events.push({ type: 'over' }); return; }
    this.pos = { c: this.safe.c, r: this.safe.r }; this.reviveMs = CFG.REVIVE_MS; this.warnMs = 0; this.tested.clear(); this.phase = 'play'; this.events.push({ type: 'respawn' });
  }

  /** Continue dopo l'ultima vita: stesso livello, tre vite nuove, Faindo sull'ultima zolla sicura con il percorso acceso. Flash residui e giornali raccolti restano. */
  revive() {
    if (this.phase !== 'over') return false;
    this.continues++; this.lives = CFG.LIVES; this.over = false;
    this.pos = { c: this.safe.c, r: this.safe.r }; this.reviveMs = CFG.REVIVE_MS; this.warnMs = 0; this.tested.clear(); this.phase = 'play';
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
