/* =====================================================================
   FAIND SIGNAL MAZE — il motore di gioco (senza grafica né audio)
   ---------------------------------------------------------------------
   Passo fisso di 1/60 s. Le posizioni sono in tile (il centro della tile (c, r) è (c + .5, r + .5)) su un toro:
   uscendo da un lato si rientra dall'altro alla stessa altezza, quindi i passaggi sui bordi non hanno nessun
   teletrasporto, solo l'aritmetica modulo W / H. Tutte le regole stanno qui: il tempo di 9 minuti è uno solo per
   tutta la partita e scorre soltanto mentre si chiama step() (pausa, cambio livello e sfondo non lo toccano).
   ===================================================================== */
import { W, H, T, LEVELS, buildLevel, bfs, idx } from './maze.js';

export const CONFIG = {
  // tempo unico: 9:06 = tempo medio di un percorso completo (circa 506 s, test-maze.mjs) + 40 s
  TPS: 60, TOTAL_TIME: 538, LIVES: 3,
  FAINDO_SPEED: 3.9,          // tile al secondo
  SPAWN_ANIM: 0.8, POWER_TIME: 20, POWER_WARN: 3, INVULN: 2.0,
  HIT_DIST: 0.62, PICK_DIST: 0.5,
  FREE_LEVELS: 3,             // livelli 1-3: si raccoglie tutto; dal 4 un colore alla volta
  DOC_PER_COLOR: 5,
  SCORE: { DOC: 100, OFFICE: 500, ROBOT: 200, LEVEL: 1000, SECOND: 10 }
};
const C = CONFIG, DT = 1 / C.TPS;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const wrapX = (x) => ((x % W) + W) % W, wrapY = (y) => ((y % H) + H) % H;
/** differenza più corta sul toro */
const dW = (a, b) => { let d = a - b; if (d > W / 2) d -= W; else if (d < -W / 2) d += W; return d; };
const dH = (a, b) => { let d = a - b; if (d > H / 2) d -= H; else if (d < -H / 2) d += H; return d; };
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const levelCache = new Map();
export function levelData(n) { if (!levelCache.has(n)) levelCache.set(n, buildLevel(n)); return levelCache.get(n); }

/** Ritardo di ingresso dei quattro robot: nei primi livelli arrivano uno alla volta. */
export function robotDelays(level) {
  const step = level === 1 ? 6 : level === 2 ? 4 : level === 3 ? 2.5 : level <= 6 ? 1.2 : 0.5;
  return [0, 1, 2, 3].map((i) => i * step);
}
export function robotSpeed(level) { return C.FAINDO_SPEED * (0.58 + 0.026 * (level - 1)); }
const ROBOT_FACTOR = [1.0, 0.97, 0.9, 0.95];   // inseguitore, anticipatore, pattugliatore, alternato

function moveEntity(e, dist, choose) {
  let guard = 0;
  while (dist > 1e-9 && guard++ < 6) {
    const cx = Math.floor(e.x) + 0.5, cy = Math.floor(e.y) + 0.5;
    const atC = Math.abs(e.x - cx) < 1e-7 && Math.abs(e.y - cy) < 1e-7;
    if (atC) { e.x = cx; e.y = cy; choose(e); }
    if (!e.dx && !e.dy) return;
    let d, target;
    if (e.dx) {
      target = e.dx > 0 ? Math.floor(e.x - 0.5 + 1e-9) + 1.5 : Math.ceil(e.x - 0.5 - 1e-9) - 0.5;
      d = Math.abs(target - e.x);
    } else {
      target = e.dy > 0 ? Math.floor(e.y - 0.5 + 1e-9) + 1.5 : Math.ceil(e.y - 0.5 - 1e-9) - 0.5;
      d = Math.abs(target - e.y);
    }
    const s = Math.min(d, dist);
    if (s >= d - 1e-9) { if (e.dx) e.x = target; else e.y = target; } else { e.x += e.dx * s; e.y += e.dy * s; }
    dist -= s;
    e.x = wrapX(e.x); e.y = wrapY(e.y);
  }
}

export class Sim {
  constructor(seed) {
    this.rng = mulberry32((seed | 0) || 12345);
    this.level = 1; this.timeLeft = C.TOTAL_TIME; this.lives = C.LIVES; this.score = 0;
    this.phase = 'play';        // play | between | over
    this.won = false; this.reason = ''; this.bonus = 0;
    this.events = []; this.inputs = []; this.tick = 0; this.stats = { delivered: 0, offices: 0, robots: 0 };
    this.held = [];
    this.loadLevel(1);
  }

  loadLevel(n) {
    const L = this.L = levelData(n);
    this.level = n;
    this.f = { x: L.start[0] + 0.5, y: L.start[1] + 0.5, dx: 0, dy: 0, face: 0, inv: 0, spawn: 0 };
    this.keys = [false, false, false];           // chiave posseduta, per colore
    this.carried = [0, 0, 0];                    // documenti in mano, per colore
    this.unlocked = L.offices.map(() => false);  // porta sbloccata, per ufficio
    this.delivered = L.offices.map(() => 0);     // documenti consegnati, per ufficio
    this.done = L.offices.map(() => false);
    this.keyTaken = L.keys.map(() => false); this.docTaken = L.docs.map(() => false);
    this.active = null;                          // colore attivo (dal livello 4)
    this.power = 0; this.exitActive = false; this.deskLatch = -1; this.doorOpen = L.offices.map(() => 0);
    const delays = robotDelays(n);
    this.robots = L.robots.map((p, i) => ({ i, x: p[0] + 0.5, y: p[1] + 0.5, dx: 0, dy: 0, alive: true, delay: delays[i], mode: i === 3 ? 'patrol' : 'chase', modeT: 0, goal: null, face: 0 }));
    this.held = [];
    const rc = this.L.grid; let rb = null;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rc[idx(x, y)] === T.FLOOR) { const d = Math.abs(x - 7) + Math.abs(y - 8.5); if (!rb || d < rb.d) rb = { d, x, y }; }
    this.centerTile = [rb.x, rb.y];   // dove ricompare Faindo dopo un contatto: al centro della mappa
  }

  /** Passa al livello successivo (chiamato dall'interfaccia dopo la pausa tra i livelli). */
  advance() { if (this.phase !== 'between') return; this.loadLevel(this.level + 1); this.phase = 'play'; this.events.push({ type: 'level', a: this.level }); }

  /* ---------------- comandi ---------------- */
  /** dirs: elenco di direzioni tenute ([dx, dy], al massimo due: una diagonale vale come due direzioni). Faindo si muove solo mentre ce n'è almeno una
      e, al rilascio, si ferma al centro della tile in cui sta andando, così resta sempre allineato ai corridoi. Con una diagonale tenuta
      prosegue dritto e, al primo incrocio libero nell'altra direzione, ci gira da solo ("prenotazione"): niente fermate per cambiare corridoio. */
  input(dirs) {
    this.held = dirs && dirs.length ? dirs.slice(0, 2) : [];
    this.inputs.push([this.tick, this.held.map((d) => DIRS.findIndex((q) => q[0] === d[0] && q[1] === d[1]))]);   // registro dei comandi: servirà alla verifica lato server
  }

  /* ---------------- regole sul terreno ---------------- */
  officeAt(x, y) { return this.L.offices.find((o) => o.door[0] === x && o.door[1] === y); }
  canF(x, y) {
    const t = this.L.grid[idx(x, y)];
    if (t === T.WALL) return false;
    if (t === T.DOOR) { const o = this.officeAt(wrapX(x), wrapY(y)); return !!o && (this.unlocked[o.id] || this.keys[o.color]); }
    if (t === T.EXIT) return this.exitActive;
    return true;
  }
  canR(x, y) { const t = this.L.grid[idx(x, y)]; return t === T.FLOOR || t === T.OPEN; }

  /* ---------------- un passo ---------------- */
  step() {
    if (this.phase !== 'play') return;
    this.tick++;
    this.timeLeft -= DT;
    if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(false, 'time'); return; }
    if (this.power > 0) { this.power -= DT; if (this.power <= 0) { this.power = 0; this.events.push({ type: 'powerEnd' }); } }
    if (this.f.inv > 0) this.f.inv = Math.max(0, this.f.inv - DT);
    if (this.f.spawn > 0) this.f.spawn = Math.max(0, this.f.spawn - DT);
    this.moveFaindo();
    this.interact();
    if (this.phase !== 'play') return;
    this.moveRobots();
    this.contacts();
    // porte: si aprono quando Faindo è vicino e si richiudono dopo il passaggio
    this.L.offices.forEach((o) => {
      const near = this.unlocked[o.id] && Math.abs(dW(this.f.x, o.door[0] + 0.5)) < 1.35 && Math.abs(dH(this.f.y, o.door[1] + 0.5)) < 1.35;
      const v = this.doorOpen[o.id], tgt = near ? 1 : 0;
      this.doorOpen[o.id] = v < tgt ? Math.min(1, v + DT * 8) : Math.max(0, v - DT * 5);
    });
  }

  moveFaindo() {
    const f = this.f, held = this.held, has = (dx, dy) => held.some((h) => h[0] === dx && h[1] === dy);
    // inversione immediata: si può tornare indietro a metà corridoio
    if (held.length && (f.dx || f.dy) && has(-f.dx, -f.dy) && !has(f.dx, f.dy)) { f.dx = -f.dx; f.dy = -f.dy; }
    moveEntity(f, C.FAINDO_SPEED * DT, (e) => {
      const cx = Math.floor(e.x), cy = Math.floor(e.y);
      if (!held.length) { e.dx = 0; e.dy = 0; return; }                                       // rilasciato: si ferma qui
      const cur = e.dx || e.dy;
      if (cur) {
        for (let i = held.length - 1; i >= 0; i--) {                                          // svolta prenotata: direzione tenuta di traverso e libera
          const h = held[i]; if (h[0] === e.dx && h[1] === e.dy) continue; if (h[0] === -e.dx && h[1] === -e.dy) continue;
          if (this.canF(cx + h[0], cy + h[1])) { e.dx = h[0]; e.dy = h[1]; return; }
        }
        if (this.canF(cx + e.dx, cy + e.dy)) return;                                          // altrimenti dritto
      }
      for (const h of held) if (this.canF(cx + h[0], cy + h[1])) { e.dx = h[0]; e.dy = h[1]; return; }
      e.dx = 0; e.dy = 0;
    });
    if (f.dx || f.dy) f.face = f.dx > 0 ? 3 : f.dx < 0 ? 2 : f.dy < 0 ? 1 : 0;   // 0 giù, 1 su, 2 sinistra, 3 destra
  }

  pickAllowed(color) { return this.level <= C.FREE_LEVELS || this.active === null || this.active === color; }

  interact() {
    const f = this.f, tx = Math.floor(f.x), ty = Math.floor(f.y), t = this.L.grid[idx(tx, ty)];
    const nearC = Math.abs(f.x - (tx + 0.5)) + Math.abs(f.y - (ty + 0.5)) <= C.PICK_DIST - 0.05;
    if (!nearC) return;
    // chiavi e documenti
    for (let i = 0; i < this.L.keys.length; i++) {
      const k = this.L.keys[i];
      if (!this.keyTaken[i] && k.x === tx && k.y === ty && this.pickAllowed(k.color)) {
        this.keyTaken[i] = true; this.keys[k.color] = true; this.setActive(k.color); this.events.push({ type: 'key', color: k.color });
      }
    }
    for (let i = 0; i < this.L.docs.length; i++) {
      const d = this.L.docs[i];
      if (!this.docTaken[i] && d.x === tx && d.y === ty && this.pickAllowed(d.color)) {
        this.docTaken[i] = true; this.carried[d.color]++; this.setActive(d.color); this.events.push({ type: 'doc', color: d.color });
      }
    }
    if (t === T.DOOR) {
      const o = this.officeAt(tx, ty);
      if (o && !this.unlocked[o.id] && this.keys[o.color]) { this.unlocked[o.id] = true; this.keys[o.color] = false; this.events.push({ type: 'unlock', color: o.color }); }
    }
    if (t === T.DESK) {
      const o = this.L.offices.find((q) => q.desk[0] === tx && q.desk[1] === ty);
      if (o && this.deskLatch !== o.id) {
        this.deskLatch = o.id;
        const n = this.carried[o.color];
        if (n > 0 && !this.done[o.id]) {
          this.carried[o.color] = 0; this.delivered[o.id] += n; this.score += C.SCORE.DOC * n; this.stats.delivered += n;
          this.events.push({ type: 'deliver', color: o.color, n, total: this.delivered[o.id], x: tx, y: ty });
          if (this.delivered[o.id] >= C.DOC_PER_COLOR) this.completeOffice(o);
        }
      }
    } else this.deskLatch = -1;
    if (t === T.EXIT && this.exitActive) this.levelDone();
  }

  setActive(color) { if (this.level > C.FREE_LEVELS && this.active === null) { this.active = color; this.events.push({ type: 'active', color }); } }

  completeOffice(o) {
    this.done[o.id] = true; this.score += C.SCORE.OFFICE; this.stats.offices++;
    this.power = C.POWER_TIME;                    // nuova consegna completa: torna a 20 s, non si somma
    if (this.active === o.color) this.active = null;
    this.events.push({ type: 'office', color: o.color, x: o.desk[0], y: o.desk[1] });
    this.events.push({ type: 'power' });
    if (this.done.every(Boolean)) { this.exitActive = true; this.events.push({ type: 'exitOn' }); }
  }

  levelDone() {
    this.score += C.SCORE.LEVEL; this.events.push({ type: 'levelDone', a: this.level });
    if (this.level >= LEVELS) { this.bonus = Math.floor(this.timeLeft) * C.SCORE.SECOND; this.score += this.bonus; this.finish(true, 'won'); }
    else this.phase = 'between';
  }

  finish(won, reason) {
    this.phase = 'over'; this.won = won; this.reason = reason;
    this.events.push({ type: won ? 'win' : 'over', reason });
  }

  /* ---------------- robot ---------------- */
  /** tile di corridoio più vicina a un punto (anche se il punto è dentro un ufficio) */
  outsideTile(px, py) {
    const tx = Math.floor(wrapX(px)), ty = Math.floor(wrapY(py));
    if (this.canR(tx, ty)) return [tx, ty];
    let best = null, bd = 1e9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (this.canR(x, y)) {
      const d = dW(x + 0.5, px) ** 2 + dH(y + 0.5, py) ** 2;
      if (d < bd) { bd = d; best = [x, y]; }
    }
    return best;
  }

  goalFor(r) {
    const f = this.f, L = this.L;
    if (r.mode === 'patrol') {
      // zone con documenti ancora a terra: si va verso il più vicino di uno scelto a caso
      if (r.goal && r.goal.doc !== undefined && !this.docTaken[r.goal.doc] && !(Math.floor(r.x) === r.goal.x && Math.floor(r.y) === r.goal.y)) return [r.goal.x, r.goal.y];
      const left = []; L.docs.forEach((d, i) => { if (!this.docTaken[i]) left.push(i); });
      if (left.length) { const i = left[Math.floor(this.rng() * left.length)]; r.goal = { doc: i, x: L.docs[i].x, y: L.docs[i].y }; return [r.goal.x, r.goal.y]; }
      const fl = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (this.canR(x, y)) fl.push([x, y]);
      const p = fl[Math.floor(this.rng() * fl.length)]; r.goal = { x: p[0], y: p[1] }; return p;
    }
    if (r.i === 1) {   // anticipa: quattro tile davanti a Faindo
      const ahead = 4;
      const fd = f.dx || f.dy ? [f.dx, f.dy] : [[0, 1], [0, -1], [-1, 0], [1, 0]][f.face];
      return this.outsideTile(f.x + fd[0] * ahead, f.y + fd[1] * ahead);
    }
    return this.outsideTile(f.x, f.y);
  }

  moveRobots() {
    const f = this.f;
    for (const r of this.robots) {
      if (!r.alive) continue;
      if (r.delay > 0) { r.delay -= DT; continue; }
      if (r.i === 3) { r.modeT += DT; if (r.mode === 'patrol' && r.modeT > 6) { r.mode = 'chase'; r.modeT = 0; } else if (r.mode === 'chase' && r.modeT > 8) { r.mode = 'patrol'; r.modeT = 0; r.goal = null; } }
      const fleeing = this.power > 0;
      const speed = robotSpeed(this.level) * ROBOT_FACTOR[r.i] * (fleeing ? 0.72 : 1);
      moveEntity(r, speed * DT, (e) => this.chooseRobot(e, fleeing));
      if (r.dx || r.dy) r.face = r.dx > 0 ? 3 : r.dx < 0 ? 2 : r.dy < 0 ? 1 : 0;
    }
  }

  chooseRobot(r, fleeing) {
    const cx = Math.floor(r.x), cy = Math.floor(r.y);
    let opts = DIRS.filter(([dx, dy]) => this.canR(cx + dx, cy + dy));
    if (!opts.length) { r.dx = 0; r.dy = 0; return; }
    if (opts.length > 1) { const nr = opts.filter(([dx, dy]) => !(dx === -r.dx && dy === -r.dy)); if (nr.length) opts = nr; }
    if (opts.length === 1) { r.dx = opts[0][0]; r.dy = opts[0][1]; return; }
    let score;
    if (fleeing) {
      const ft = this.outsideTile(this.f.x, this.f.y), dist = bfs(this.L.grid, ft[0], ft[1]);
      score = ([dx, dy]) => -dist[idx(cx + dx, cy + dy)];
    } else {
      const g = this.goalFor(r), dist = bfs(this.L.grid, g[0], g[1]);
      score = ([dx, dy]) => { const d = dist[idx(cx + dx, cy + dy)]; return d < 0 ? 999 : d; };
    }
    let best = null, bs = Infinity;
    for (const o of opts) { const s = score(o) + this.rng() * 0.01; if (s < bs) { bs = s; best = o; } }
    // ogni tanto una svolta a caso, così non restano in fila indiana
    if (!fleeing && this.rng() < (r.i === 2 ? 0.2 : 0.05)) best = opts[Math.floor(this.rng() * opts.length)];
    r.dx = best[0]; r.dy = best[1];
  }

  contacts() {
    const f = this.f;
    for (const r of this.robots) {
      if (!r.alive || r.delay > 0) continue;
      if (Math.hypot(dW(r.x, f.x), dH(r.y, f.y)) >= C.HIT_DIST) continue;
      if (this.power > 0) {
        r.alive = false; this.score += C.SCORE.ROBOT; this.stats.robots++;
        this.events.push({ type: 'kill', x: r.x, y: r.y, face: r.face, i: r.i });
      } else if (f.inv <= 0) { this.hit(); return; }
    }
  }

  hit() {
    this.lives--; this.events.push({ type: 'hit', x: this.f.x, y: this.f.y });
    if (this.lives <= 0) { this.finish(false, 'lives'); return; }
    // ricompare al centro della mappa, ingrandito e lampeggiante (la grafica usa f.spawn)
    Object.assign(this.f, { x: this.centerTile[0] + 0.5, y: this.centerTile[1] + 0.5, dx: 0, dy: 0, inv: C.INVULN, spawn: C.SPAWN_ANIM });
    this.deskLatch = -1;
  }
}
