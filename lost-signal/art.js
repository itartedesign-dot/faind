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
import { ATLAS, BLDG_GAP } from './sprites/atlas.js?v=20261022c';
import { COLS, ROWS } from './levels.js?v=20261022c';
import { CFG } from './sim.js?v=20261022c';

export const TS = 32, CW = COLS * TS, HUD = 54, BAR = 48, MIN_H = 612, MAX_H = 780;
const SOIL = 8, BLDG_ABOVE = 80;                 // altezza della palazzina sopra la riga 0
const FACE = ['back', 'right', 'front', 'left'];  // verso: su, destra, giù, sinistra
const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

export class Scene {
  constructor(cv) {
    this.cv = cv; this.H = MIN_H; cv.width = CW; cv.height = this.H;
    this.g = cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
    this.atlas = new Image(); this.clock = 0; this.vis = 1; this.hint = null; this.L = null; this.variant = [];
    this.ready = new Promise((res) => { this.atlas.onload = () => { this.measure(); res(true); }; this.atlas.onerror = () => res(false); this.atlas.src = 'sprites/atlas.png?v=20261022c'; });
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
    this.tip = {};
    const c = document.createElement('canvas'); c.width = this.atlas.width; c.height = this.atlas.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(this.atlas, 0, 0);
    for (const k of Object.keys(ATLAS)) {
      if (k.slice(0, 2) !== 'f_') continue;
      const [x, y, w, h] = ATLAS[k], d = g.getImageData(x, y, w, h).data; let sx = 0, n = 0, top = h;
      for (let j = 0; j < h && n < 3; j++) for (let i = 0; i < w; i++) { const o = (j * w + i) * 4; if (d[o + 3] > 200 && d[o + 2] > 200 && d[o + 1] > 150 && d[o] < 140) { sx += i; n++; top = Math.min(top, j); } }
      this.tip[k] = n ? [Math.round(sx / n), top + 1] : [w / 2, 2];
    }
  }

  setLevel(L) {
    this.L = L; this.hint = null; this.variant = [];
    for (let i = 0; i < COLS * ROWS; i++) this.variant[i] = Math.floor(hash(L.n, i, 7) * 4) % 4;
    // ogni livello mostra tutte e quattro le varianti decorative
    const ts = [...L.tiles]; for (let k = 0; k < 4 && k < ts.length; k++) this.variant[ts[(k * 5 + L.n) % ts.length]] = k;
  }

  update(dt) {
    this.clock += dt;
  }

  cellX(c) { return this.gx + c * TS; }
  cellY(r) { return this.gy + r * TS; }
  spr(name, x, y, alpha) {
    const a = ATLAS[name], g = this.g; if (!a) return;
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
    if (mv) {
      const p = Math.min(1, mv.t / mv.dur);
      c = mv.from.c + (mv.to.c - mv.from.c) * p; r = mv.from.r + (mv.to.r - mv.from.r) * p;
      if (mv.kind === 'step') { frame = sim.stepFoot ? 1 : 2; z = Math.sin(p * Math.PI) * 2; }
      else { z = Math.sin(p * Math.PI) * 17; frame = p > 0.15 && p < 0.85 ? (sim.stepFoot ? 1 : 2) : 0; }
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
    // palazzina: porta chiusa durante il livello, aperta quando Faindo ha raggiunto la zolla davanti al portone
    const open = sim.phase === 'arrive' && sim.arriveT > 180 || sim.phase === 'between' || sim.phase === 'won';
    const name = open ? 'bldg_open' : 'bldg_closed';
    const gx = this.cellX(L.goal.c) + TS / 2, bx = gx - BLDG_GAP[name], by = this.cellY(0) - BLDG_ABOVE;
    this.spr(name, bx, by);
    // zolle, dall'alto verso il basso: lo spessore di una zolla finisce sotto la faccia di quella di sotto
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c; if (!L.tiles.has(i)) continue;
      const isGoal = c === L.goal.c && r === L.goal.r;
      const a = isGoal || sim.anchors.has(i) ? 1 : this.vis; if (a <= 0) continue;
      this.spr('tile' + (isGoal ? 0 : this.variant[i]), this.cellX(c), this.cellY(r), a);
    }
    // giornali non ancora raccolti (restano visibili anche a percorso spento)
    L.news.forEach((n, k) => {
      if (sim.got.has(k)) return;
      const bob = Math.round(Math.sin(this.clock * 3 + k * 2) * 1.4);
      this.spr('scroll', this.cellX(n.c) + (TS - 24) / 2, this.cellY(n.r) + 6 + bob);
    });
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
    if (this.hint && !paused) this.drawHint(sim, this.hint);
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
