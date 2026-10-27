/* =====================================================================
   FAIND LOST SIGNAL — la grafica
   ---------------------------------------------------------------------
   Tela larga 352 pixel nativi (11 zolle da 32) e alta tra 612 e 780 secondo lo schermo; il browser la ingrandisce senza
   sfumature (image-rendering: pixelated). Barra superiore e barra dei comandi sono HTML sopra la tela. Palazzina, zolle,
   giornali e Faindo sono ritagli della tavola di riferimento (sprites/atlas.png, vedi sprites/build-atlas.py), già ridotti
   a misura di zolla: tutte le zolle sono lo stesso sprite di 32 × 40 px (faccia quadrata 32 × 32 più lo spessore).
   Quando il percorso è spento si vedono solo la palazzina con la zolla davanti al portone, i giornali e Faindo: niente
   ombre, contorni o particelle sotto le zolle nascoste.
   ===================================================================== */
import { ATLAS, BLDG_GAP, BLDG_FACE } from './sprites/atlas.js?v=20261025c';
import { COLS, ROWS } from './levels.js?v=20261025c';
import { CFG } from './sim.js?v=20261025c';

export const TS = 32, CW = COLS * TS, HUD = 54, BAR = 48, MIN_H = 632, MAX_H = 780;
const SOIL = 8, BLDG_ABOVE = 88;                 // altezza della palazzina sopra la riga 0 (la sua zolla d'ingresso è la zolla del portone)
const FACE = ['back', 'right', 'front', 'left'];  // verso: su, destra, giù, sinistra
const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

export class Scene {
  constructor(cv) {
    this.cv = cv; this.H = MIN_H; cv.width = CW; cv.height = this.H;
    this.g = cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
    this.atlas = new Image(); this.clock = 0; this.vis = 1; this.flicker = null; this.hint = null; this.L = null; this.variant = []; this.floaters = [];
    this.ready = new Promise((res) => { this.atlas.onload = () => { this.measure(); res(true); }; this.atlas.onerror = () => res(false); this.atlas.src = 'sprites/atlas.png?v=20261025c'; });
    this.setSize(MIN_H);
  }

  setSize(h) {
    this.H = Math.max(MIN_H, Math.min(MAX_H, Math.round(h)));
    if (this.cv.height !== this.H) { this.cv.height = this.H; this.g.imageSmoothingEnabled = false; }
    const avail = this.H - HUD - BAR, content = BLDG_ABOVE + ROWS * TS + SOIL + 10;
    this.gx = 0; this.gy = HUD + BLDG_ABOVE + Math.max(2, Math.floor((avail - content) / 2));
  }

  /** punta dell'antenna in ogni fotogramma (per la luce del flash) */
  measure() {
    this.tip = {}; this.buildLamp();
    const c = document.createElement('canvas'); c.width = this.atlas.width; c.height = this.atlas.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(this.atlas, 0, 0);
    for (const k of Object.keys(ATLAS)) {
      if (k.slice(0, 2) !== 'f_') continue;
      const [x, y, w, h] = ATLAS[k], d = g.getImageData(x, y, w, h).data; let sx = 0, n = 0, top = h;
      for (let j = 0; j < h && n < 3; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4; if (d[o + 3] > 200 && d[o + 2] > 200 && d[o + 1] > 150 && d[o] < 140) { sx += i; n++; top = Math.min(top, j); } }
      this.tip[k] = n ? [Math.round(sx / n), top + 1] : [w / 2, 2];
    }
  }

  /** luce del lampione: quattro stati di fiamma (macchia a gradini di pixel con contorno irregolare, tre tonalità, maschera per le zolle vere) e quattro vetri */
  buildLamp() {
    const R = 46, S = 2 * R + 1, DR = [0, 2, -1, 1], INT = [1, 0.84, 1.12, 0.92], N = 24;
    const cvs = () => { const c = document.createElement('canvas'); c.width = S; c.height = S; return c; };
    this.lamp = { R, S, ov: [], mask: [], glass: [], lit: cvs() };
    for (let s = 0; s < 4; s++) {
      const ov = cvs(), mk = cvs(), go = ov.getContext('2d'), gm = mk.getContext('2d'), io = go.createImageData(S, S), im = gm.createImageData(S, S), jit = [];
      for (let k = 0; k < N; k++) jit.push(Math.floor(hash(s, k, 11) * 4) - 1);          // margine: da -1 a +2 pixel per settore
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x - R, dy = y - R, d = Math.hypot(dx, dy), k = Math.floor((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI) * N) % N, f = d / (R - 6 + DR[s] + jit[k]);
        if (f >= 1) continue;
        const o = (y * S + x) * 4, tone = f < 0.28 ? [255, 228, 120, 0.5] : f < 0.6 ? [255, 168, 40, 0.32] : (x + y) % 2 ? [255, 112, 30, 0.32] : [0, 0, 0, 0];   // margine a scacchiera di pixel
        io.data[o] = tone[0]; io.data[o + 1] = tone[1]; io.data[o + 2] = tone[2]; io.data[o + 3] = Math.round(255 * Math.min(1, tone[3] * INT[s]));
        im.data[o + 3] = Math.round(255 * Math.min(1, (f < 0.35 ? 0.92 : f < 0.55 ? 0.68 : f < 0.78 ? 0.42 : 0.2) * INT[s]));
      }
      go.putImageData(io, 0, 0); gm.putImageData(im, 0, 0); this.lamp.ov.push(ov); this.lamp.mask.push(mk);
      // vetro: giallo, avorio, giallo più vivo, avorio a metà
      const a = ATLAS.lantern, gc = document.createElement('canvas'); gc.width = a[2]; gc.height = a[3];
      const gg = gc.getContext('2d'); gg.drawImage(this.atlas, a[0], a[1], a[2], a[3], 0, 0, a[2], a[3]);
      const gd = gg.getImageData(0, 0, a[2], a[3]), dd = gd.data, IV = [255, 246, 218], mix = [0, 0.85, 0, 0.45][s], br = [1, 1, 1.08, 1][s];
      for (let o = 0; o < dd.length; o += 4) if (dd[o + 3] > 0 && dd[o] > 200 && dd[o + 1] > 140 && dd[o + 2] < 150) for (let q = 0; q < 3; q++) dd[o + q] = Math.min(255, (dd[o + q] * (1 - mix) + IV[q] * mix) * br);
      gg.putImageData(gd, 0, 0); this.lamp.glass.push(gc);
    }
  }
  /** stato di fiamma (0-3) del lampione dopo tempi irregolari di 100-200 ms; ogni lampione ha la sua fase */
  lampState(lc) {
    const D = [130, 170, 110, 190, 150, 120, 180, 140, 160, 200, 100, 175], Q = [0, 2, 1, 3, 2, 0, 3, 1, 2, 3, 0, 1], T = 1725;
    let t = (this.clock * 1000 + lc * 313) % T, k = 0; while (t >= D[k]) { t -= D[k]; k++; }
    return Q[k];
  }
  /** una zolla con il suo sprite (cascata, lampione, ponte, legno o terra) su un contesto qualsiasi */
  drawTileOn(ctx, L, i, x, y, a, fall) {
    const kind = L.deco.get(i);
    if (kind === 'fall') this.spr(fall, x, y, a, ctx);
    else if (kind === 'lantern') { const gl = this.lamp && this.lamp.glass[this.lampState(i % COLS)]; if (gl) { ctx.globalAlpha = a; ctx.drawImage(gl, Math.round(x), Math.round(y - 4)); ctx.globalAlpha = 1; } else this.spr('lantern', x, y - 4, a, ctx); }
    else if (kind === 'bridge') {
      const hz = L.deco.get(i - 1) === 'bridge' || L.deco.get(i + 1) === 'bridge' || (L.deco.get(i - COLS) !== 'bridge' && L.deco.get(i + COLS) !== 'bridge' && !L.tiles.has(i - COLS) && !L.tiles.has(i + COLS));
      this.spr(hz ? 'bridge_h' : 'bridge_v', x, y, a, ctx);
    } else this.spr(kind === 'wood' ? 'tile4' : 'tile' + this.variant[i], x, y, a, ctx);
  }

  setLevel(L) {
    this.L = L; this.hint = null; this.variant = []; this.floaters = [];
    for (let i = 0; i < COLS * ROWS; i++) this.variant[i] = Math.floor(hash(L.n, i, 7) * 4) % 4;
    // ogni livello mostra tutte e quattro le varianti decorative
    const ts = [...L.tiles]; for (let k = 0; k < 4 && k < ts.length; k++) this.variant[ts[(k * 5 + L.n) % ts.length]] = k;
  }

  update(dt) {
    this.clock += dt;
    this.floaters = this.floaters.filter((f) => this.clock - f.t0 < f.life);
  }

  /** scritta arcade che svolazza e svanisce: (x, y) in pixel della tela, partenza al centro della scritta */
  float(text, x, y, color, big) { this.floaters.push({ text, x, y, color, big: !!big, t0: this.clock, life: big ? 1.9 : 1.25 }); }
  drawFloaters() {
    const g = this.g; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const f of this.floaters) {
      const p = (this.clock - f.t0) / f.life, rise = f.big ? 26 : 22, x = Math.round(f.x + Math.sin(p * 11 + f.t0 * 5) * (f.big ? 4 : 3) * (0.4 + p)), y = Math.round(f.y - rise * (1 - (1 - p) * (1 - p)));
      g.globalAlpha = p < 0.65 ? 1 : Math.max(0, 1 - (p - 0.65) / 0.35);
      g.font = (f.big ? '16px ' : '12px ') + 'Silkscreen, "Courier New", monospace';
      g.fillStyle = '#05080f'; for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) g.fillText(f.text, x + ox, y + oy);
      g.fillStyle = f.color; g.fillText(f.text, x, y);
    }
    g.globalAlpha = 1; g.textAlign = 'start'; g.textBaseline = 'alphabetic';
  }

  cellX(c) { return this.gx + c * TS; }
  cellY(r) { return this.gy + r * TS; }
  spr(name, x, y, alpha, ctx) {
    const a = ATLAS[name], g = ctx || this.g; if (!a) return;
    if (alpha !== undefined && alpha < 1) g.globalAlpha = Math.max(0, alpha);
    g.drawImage(this.atlas, a[0], a[1], a[2], a[3], Math.round(x), Math.round(y), a[2], a[3]);
    if (g.globalAlpha !== 1) g.globalAlpha = 1;
  }
  disc(cx, cy, r, color) {
    const g = this.g; g.fillStyle = color;
    for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r + 0.5 - j * j)); g.fillRect(Math.round(cx) - w, Math.round(cy) + j, w * 2 + 1, 1); }
  }

  /** posizione di Faindo in celle (c, r), altezza del salto in pixel e opacità, secondo la fase del motore */
  pose(sim) {
    let c = sim.pos.c, r = sim.pos.r, z = 0, alpha = 1, frame = 0, dy = 0;
    const mv = sim.mv;
    if (sim.riding >= 0) { const f = sim.fpos(); c = f.x; r = f.y; }
    if (mv) {
      const p = Math.min(1, mv.t / mv.dur);
      c = mv.from.c + (mv.to.c - mv.from.c) * p; r = mv.from.r + (mv.to.r - mv.from.r) * p;
      if (mv.kind === 'step') { frame = sim.stepFoot ? 1 : 2; z = Math.sin(p * Math.PI) * 2; }
      else { z = Math.sin(p * Math.PI) * 17; frame = p > 0.15 && p < 0.85 ? (sim.stepFoot ? 1 : 2) : 0; }
    } else if (sim.phase === 'fall' && sim.cause === 'rock' && sim.hitAt) {
      // colpito da una roccia: sbalzato nel verso del rotolamento, un salto e dissolvenza
      const p = Math.min(1, sim.fallT / CFG.FALL_MS), h = sim.hitAt, dir = h.side ? -1 : 1;
      c = h.x + (h.axis === 'h' ? dir * p * 1.3 : 0); r = h.y + (h.axis === 'v' ? dir * p * 1.3 : 0);
      z = Math.sin(Math.min(1, p * 1.6) * Math.PI) * 12; alpha = p < 0.5 ? (Math.floor(p * 24) % 2 ? 0.45 : 1) : 1 - (p - 0.5) / 0.5; frame = 1;
    } else if (sim.phase === 'fall') {
      const p = Math.min(1, sim.fallT / CFG.FALL_MS); dy = p * p * 80; alpha = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45; frame = 1;
    } else if (sim.phase === 'arrive') {
      const t = sim.arriveT, p = Math.max(0, Math.min(1, (t - 420) / 900)); dy = -p * 24; alpha = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45; frame = p > 0 && p < 1 ? (Math.floor(t / 150) % 2 ? 1 : 2) : 0;
    } else if (sim.phase === 'between' || sim.phase === 'won') alpha = 0;
    return { c, r, z, alpha, frame, dy };
  }

  draw(sim, paused) {
    const g = this.g, L = sim.L, H = this.H;
    if (this.L !== L) this.setLevel(L);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    g.fillStyle = '#060b18'; g.fillRect(0, 0, CW, H);
    const dt = this.clock - (this._last || this.clock); this._last = this.clock;
    // opacità delle zolle: piena finché il percorso è acceso, dissolvenza morbida (circa 0,25 s) quando si spegne
    const target = sim.tilesVisible ? 1 : 0;
    const rate = target > this.vis ? 12 : 4.5;
    this.vis += (target - this.vis) * Math.min(1, Math.max(0, dt) * rate); if (Math.abs(this.vis - target) < 0.01) this.vis = target;
    // luce che muore: 4 accensioni a intermittenza, ogni volta più deboli, fino allo spegnimento totale (2 s, solo nel tutorial)
    if (this.flicker != null) {
      const ft = this.clock - this.flicker;
      if (ft >= 2 || sim.tilesVisible) this.flicker = null;
      else { const k = Math.floor(ft / 0.5), p = (ft % 0.5) / 0.5; this.vis = p < 0.5 ? [1, 0.7, 0.45, 0.25][k] * (1 - p * 0.5) : 0; }
    }
    // palazzina: porta chiusa durante il livello, aperta quando Faindo ha raggiunto la zolla davanti al portone
    const open = sim.phase === 'arrive' && sim.arriveT > 180 || sim.phase === 'between' || sim.phase === 'won';
    const name = open ? 'bldg_open' : 'bldg_closed';
    const gx = this.cellX(L.goal.c) + TS / 2, bx = gx - BLDG_GAP[name], by = this.cellY(0) + 3 - BLDG_FACE[name];
    this.spr(name, bx, by);
    // zolle, dall'alto verso il basso: lo spessore di una zolla finisce sotto la faccia di quella di sotto.
    // Speciali: cascata (animata) e lampione sempre accesi, legno e ponte come le altre; l'alone del lampione lascia intravedere le zolle vicine
    const lamps = []; for (const [i, k] of L.deco) if (k === 'lantern') lamps.push([i % COLS, (i / COLS) | 0]);
    const fall = 'fall' + (Math.floor(this.clock * 6) % 3);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c; if (!L.tiles.has(i)) continue;
      if (c === L.goal.c && r === L.goal.r) continue;                // la zolla del portone è quella d'ingresso della palazzina
      const kind = L.deco.get(i), a = sim.anchors.has(i) || kind === 'fall' || kind === 'lantern' ? 1 : this.vis; if (a <= 0) continue;
      this.drawTileOn(g, L, i, this.cellX(c), this.cellY(r), a, fall);
    }
    // luce del lampione: a percorso spento rivela, con una maschera, gli sprite veri delle zolle entro circa 1,5 zolle; il FLASH la lascia sotto la luce piena
    if (this.lamp) for (const [lc, lr] of lamps) {
      const { R, S, ov, mask, lit } = this.lamp, st = this.lampState(lc), cx = Math.round(this.cellX(lc) + TS - 8), cy = Math.round(this.cellY(lr) + 8), ox = cx - R, oy = cy - R;
      if (this.vis < 0.99) {
        const q = lit.getContext('2d'); q.clearRect(0, 0, S, S); q.globalCompositeOperation = 'source-over';
        for (let r = Math.max(0, lr - 2); r <= Math.min(ROWS - 1, lr + 2); r++) for (let c = Math.max(0, lc - 2); c <= Math.min(COLS - 1, lc + 2); c++) {
          const i = r * COLS + c; if (!L.tiles.has(i) || i === lr * COLS + lc || (c === L.goal.c && r === L.goal.r)) continue;
          const kd = L.deco.get(i); if (sim.anchors.has(i) || kd === 'fall') continue;
          this.drawTileOn(q, L, i, this.cellX(c) - ox, this.cellY(r) - oy, 1, fall);
        }
        q.globalCompositeOperation = 'destination-in'; q.drawImage(mask[st], 0, 0); q.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1 - this.vis; g.drawImage(lit, ox, oy); g.globalAlpha = 1;
      }
      g.globalCompositeOperation = 'lighter'; g.drawImage(ov[st], ox, oy); g.globalCompositeOperation = 'source-over';
    }
    this.drawLifts(sim);
    // giornali non ancora raccolti (restano visibili anche a percorso spento)
    L.news.forEach((n, k) => {
      if (sim.got.has(k)) return;
      const bob = Math.round(Math.sin(this.clock * 3 + k * 2) * 1.4);
      this.spr('scroll', this.cellX(n.c) + (TS - 24) / 2, this.cellY(n.r) + 6 + bob);
    });
    // boccette (flash) e mini Faindo con il più verde (vita) da raccogliere: sempre visibili, come i giornali
    L.flashes.forEach((f, k) => {
      if (sim.gotFlash.has(k)) return;
      const bob = Math.round(Math.sin(this.clock * 3.4 + k * 1.7) * 1.4);
      this.spr('vial', this.cellX(f.c) + (TS - 22) / 2, this.cellY(f.r) + 5 + bob);
    });
    if (L.life && !sim.gotLife && sim.lives < CFG.MAX_LIVES) {
      const bob = Math.round(Math.sin(this.clock * 3 + 1) * 1.6);
      this.spr('life_plus', this.cellX(L.life.c) + (TS - 24) / 2, this.cellY(L.life.r) + 3 + bob);
    }
    // Faindo
    const P = this.pose(sim);
    if (P.alpha > 0) {
      const key = 'f_' + FACE[sim.facing] + '_' + P.frame, a = ATLAS[key];
      const cx = this.cellX(0) + P.c * TS + TS / 2, cy = this.cellY(0) + P.r * TS + TS / 2;
      const fx = Math.round(cx - a[2] / 2), fy = Math.round(cy + 11 - a[3] - P.z + P.dy);
      this.spr(key, fx, fy, P.alpha);
      if (sim.flashMs > 0) {
        const tip = this.tip[key] || [a[2] / 2, 2], env = Math.min(1, sim.flashMs / 250, (CFG.FLASH_MS - sim.flashMs) / 120 + 0.35), pulse = 0.75 + 0.25 * Math.sin(this.clock * 7);
        g.globalAlpha = 0.34 * env * pulse; this.disc(fx + tip[0], fy + tip[1], 8, '#6fe9ff');
        g.globalAlpha = 0.5 * env; this.disc(fx + tip[0], fy + tip[1], 4, '#c8f6ff'); g.globalAlpha = 1;
      }
    }
    if (sim.warnMs > 0 && sim.phase === 'play') {     // avviso morbido: bordo della zolla verso il vuoto che pulsa piano, nessun lampo
      const [wx, wy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][sim.warnDir], x0 = this.cellX(sim.pos.c), y0 = this.cellY(sim.pos.r);
      const k = Math.min(1, sim.warnMs / 300), pul = (0.5 + 0.5 * Math.sin(this.clock * 9)) * 0.35 + 0.4;
      g.globalAlpha = pul * k; g.fillStyle = '#ff8a6b';
      if (wx) g.fillRect(wx > 0 ? x0 + TS - 3 : x0, y0 + 4, 3, TS - 8); else g.fillRect(x0 + 4, wy > 0 ? y0 + TS - 3 : y0, TS - 8, 3);
      g.globalAlpha = 1;
    }
    this.drawRocks(sim);
    this.drawFloaters();
    if (this.hint && !paused) this.drawHint(sim, this.hint);
  }

  /** ascensori: una corda al centro lungo tutto il percorso (sempre visibile) e, sopra, la piattaforma */
  drawLifts(sim) {
    const L = sim.L;
    L.lifts.forEach((lf, i) => {
      const v = lf.a.c === lf.b.c, r0 = Math.min(lf.a.r, lf.b.r), c0 = Math.min(lf.a.c, lf.b.c);
      for (let k = 0; k < lf.len; k++) {
        if (v) this.spr('rope_v', this.cellX(lf.a.c) + (TS - 9) / 2, this.cellY(r0) + TS / 2 + k * TS);
        else this.spr('rope_h', this.cellX(c0) + TS / 2 + k * TS, this.cellY(lf.a.r) + (TS - 9) / 2);
      }
      const s = sim.liftState(i);
      this.spr('tile2', this.cellX(s.x), this.cellY(s.y));
    });
  }

  /** rocce: la roccia che rotola (quattro fotogrammi) con ombra */
  drawRocks(sim) {
    const g = this.g;
    for (let j = 0; j < sim.rocks.length; j++) {
      const r = sim.rockState(j); if (!r) continue;
      const d = sim.rocks[j], h = r.axis === 'h';
      if (r.warn) continue;                       // nessun segnale: la roccia compare dal bordo dello schermo
      const cells = r.prog * (d.N + 2), fade = Math.min(1, cells / 0.9, (d.N + 2 - cells) / 0.9);
      const frame = Math.floor(cells * 3.2) % 4, f = r.side ? 3 - frame : frame, x = this.cellX(r.x) + TS / 2, y = this.cellY(r.y) + TS / 2, bob = Math.round(Math.abs(Math.sin(cells * 5)) * 1.5);
      g.globalAlpha = 0.32 * fade; g.fillStyle = '#000'; g.fillRect(Math.round(x) - 11, Math.round(y) + 10, 22, 3); g.globalAlpha = 1;
      this.spr('rock' + f, x - 14, y - 14 - bob, fade);
    }
    g.globalAlpha = 1;
  }

  /** mano pixel animata per la breve dimostrazione del primo livello (swipe o tocco accanto a Faindo) */
  drawHint(sim, h) {
    const g = this.g, c = this.cellX(0) + sim.pos.c * TS + TS / 2, r = this.cellY(0) + sim.pos.r * TS + TS / 2, t = (this.clock - h.t0) % 1.6 / 1.6;
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][h.dir];
    let ox = 0, oy = 0, press = true;
    if (h.kind === 'swipe') { const p = t < 0.75 ? t / 0.75 : 1; ox = dx * (8 + 40 * p); oy = dy * (8 + 40 * p); press = t < 0.85; }
    else { ox = dx * 30; oy = dy * 30; press = (t % 0.5) < 0.28; }
    const x = Math.round(c + ox), y = Math.round(r + oy);
    if (h.kind === 'swipe') { g.globalAlpha = 0.55; g.fillStyle = '#6fd3ff'; for (let k = 0; k < 5; k++) { const q = (t < 0.75 ? t / 0.75 : 1) * 40 * (k / 5); g.fillRect(Math.round(c + dx * (8 + q)) - 1, Math.round(r + dy * (8 + q)) - 1, 3, 3); } g.globalAlpha = 1; }
    else if (press) { g.globalAlpha = 0.6; this.disc(x, y, 9, '#6fd3ff'); g.globalAlpha = 1; }
    // mano (indice teso)
    const HAND = ['..11....', '.1221...', '.1221...', '.1221...', '.122211.', '.1222221', '1122222.', '1222222.', '.122222.', '..12221.', '...1111.'];
    const px = x - 3, py = y - 1;
    HAND.forEach((row, j) => { for (let i = 0; i < 8; i++) { const ch = row[i]; if (ch === '.') continue; g.fillStyle = ch === '1' ? '#0b1226' : (press ? '#ffe6c2' : '#f3e9d2'); g.fillRect(px + i, py + j, 1, 1); } });
  }
}
