// COPIA GENERATA da lost-signal/sim.js con game-api/sync-engines.mjs: non modificare qui.
/* =====================================================================
   FAIND LOST SIGNAL — il motore di gioco (nessun disegno, nessun audio)
   ---------------------------------------------------------------------
   Posizione logica a terra (c, r) separata dall'altezza del salto, che è solo grafica: collisioni e atterraggio usano
   sempre la casella. Tutti i tempi sono in millisecondi avanzati da update(dt): chi chiama non lo fa avanzare in pausa,
   a pagina nascosta o durante le schermate, così lampi e memorizzazione non si consumano mai da soli.
   Comandi: il registro `log` contiene solo quelli accettati, come [clock, codice] con codice 0-3 passo, 4-7 orientamento, 8 salto, 9 flash;
   il gioco avanza a passi fissi di 5 ms (game-api/verify.js rifà la stessa partita sul server).
   Fasi: memorize | play | step | jump | fall | arrive | between | over | won
   ===================================================================== */
import { getLevel, COLS, ROWS } from './levels.js';

export const CFG = {
  MEMORIZE_MS: 7000, FLASH_MS: 3000, FLASHES: 20, LIVES: 3, STEP_MS: 150, JUMP_MS: 400, FALL_MS: 900, ARRIVE_MS: 1700, BETWEEN_MS: 1500,
  SCORE: { ARRIVE: 1000, NEWS: 500 }
};
export const DIRV = [[0, -1], [1, 0], [0, 1], [-1, 0]];     // su, destra, giù, sinistra

export class Sim {
  constructor(levels = 15) {
    this.levels = Math.max(1, levels | 0);
    this.level = 1; this.lives = CFG.LIVES; this.flashes = CFG.FLASHES; this.score = 0;
    this.stats = { news: 0, falls: 0 };
    this.events = [];
    this.clock = 0; this.log = [];     // millisecondi avanzati e comandi accettati [clock, codice]: la verifica sul server rifà la partita da qui

    this.loadLevel(1);
  }

  loadLevel(n) {
    this.level = n; this.L = getLevel(n);
    this.pos = { c: this.L.start.c, r: this.L.start.r }; this.facing = 0;
    this.got = new Set(); this.scored = false;
    this.phase = 'memorize'; this.memMs = CFG.MEMORIZE_MS; this.flashMs = 0;
    this.mv = null; this.fallT = 0; this.arriveT = 0; this.betweenT = 0; this.stepFoot = 0; this.over = false;
    this.events.push({ type: 'level', level: n });
  }

  get collected() { return this.got.size; }
  /** le zolle si vedono durante la memorizzazione e mentre un flash è acceso */
  get tilesVisible() { return this.phase === 'memorize' || this.flashMs > 0; }
  get canAct() { return this.phase === 'play'; }
  isTile(c, r) { return c >= 0 && r >= 0 && c < COLS && r < ROWS && this.L.tiles.has(r * COLS + c); }
  newsAt(c, r) { return this.L.news.findIndex((n) => n.c === c && n.r === r); }

  /** Un passo di una casella nella direzione d (orienta e muove). */
  step(d) {
    if (this.phase !== 'play') return false;
    this.facing = d; this.log.push([this.clock, d]);
    const [dx, dy] = DIRV[d];
    this.mv = { kind: 'step', from: { c: this.pos.c, r: this.pos.r }, to: { c: this.pos.c + dx, r: this.pos.r + dy }, t: 0, dur: CFG.STEP_MS };
    this.phase = 'step'; this.stepFoot ^= 1; this.events.push({ type: 'step' });
    return true;
  }

  /** Solo orientamento, senza muoversi. */
  turn(d) {
    if (this.phase !== 'play') return false;
    if (this.facing !== d) { this.facing = d; this.log.push([this.clock, 4 + d]); this.events.push({ type: 'turn' }); }
    return true;
  }

  /** Salto di esattamente due caselle nella direzione in cui Faindo è rivolto. */
  jump() {
    if (this.phase !== 'play') return false;
    this.log.push([this.clock, 8]);
    const [dx, dy] = DIRV[this.facing];
    this.mv = { kind: 'jump', from: { c: this.pos.c, r: this.pos.r }, to: { c: this.pos.c + dx * 2, r: this.pos.r + dy * 2 }, t: 0, dur: CFG.JUMP_MS };
    this.phase = 'jump'; this.events.push({ type: 'jump' });
    return true;
  }

  /** Riaccende le zolle per 3 secondi. Non si può durante memorizzazione, transizioni, caduta o con un flash già acceso. */
  flash() {
    if (!(this.phase === 'play' || this.phase === 'step' || this.phase === 'jump')) return false;
    if (this.flashMs > 0 || this.flashes <= 0) return false;
    this.log.push([this.clock, 9]);
    this.flashes--; this.flashMs = CFG.FLASH_MS; this.events.push({ type: 'flash', left: this.flashes });
    return true;
  }

  update(dt) {
    dt = Math.max(0, Math.min(dt, 100)); this.clock += dt;
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
    const kind = this.mv.kind, to = this.mv.to;
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
    this.pos = { c: this.L.start.c, r: this.L.start.r }; this.facing = 0; this.phase = 'play'; this.events.push({ type: 'respawn' });
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
