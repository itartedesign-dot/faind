/* =====================================================================
   FAIND SIGNAL MAZE — la grafica
   ---------------------------------------------------------------------
   Tutto è disegnato su una tela di 240 × 324 pixel nativi (tile = 16 px, mappa 15 × 18 tile da y = 36 in giù; in alto
   sta la barra HTML) che il browser ingrandisce senza sfumature (image-rendering: pixelated). Pavimenti, muri,
   uffici e portali sono disegnati qui in codice; Faindo, robot, scrivanie, porte, chiavi, documenti e scariche sono
   ritagli del foglio di riferimento (sprites/atlas.png, vedi sprites/build-atlas.py) già ridotti a misura di tile.
   Il mondo è un toro: gli sprite vicini ai bordi vengono disegnati anche sul lato opposto, così un passaggio sul bordo
   è continuo, senza salti.
   ===================================================================== */
import { W, H, T, COLORS, idx, cur } from './maze.js?v=20261025a';
import { CONFIG } from './sim.js?v=20261025a';
import { ATLAS } from './sprites/atlas.js?v=20261025a';

export const TS = 16, CW = 240, CH = 332, OY = 44, MH = H * TS;
export const HEX = ['#ff8a1f', '#ffd21f', '#29d6ff'];
const DARK = ['#8a3d00', '#8a6e00', '#0b6f8a'];
const HEART = ['..KKK.KKK..', '.KRRRKRRRK.', 'KRRWWRRRRRK', 'KRWRRRRRRRK', 'KRRRRRRRRRK', 'KDRRRRRRRDK', '.KDRRRRRDK.', '..KDRRRDK..', '...KDRDK...', '....KKK....'];
const HEART_COL = { K: '#16101a', R: '#e0332f', D: '#9c1f26', W: '#ffffff' };
const hash = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + (k || 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* cifre 3 × 5 per i numeri dentro alla scena (restano nitide a qualsiasi ingrandimento) */
const GLYPH = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001010010', 8: '111101111101111', 9: '111101111001111', '/': '001001010100100', '+': '000010111010000', 'x': '000101010101000', E: '111100110100111', X: '101101010101101', I: '111010010010111', T: '111010010010010' };
function text(g, s, x, y, color, scale, outline) {
  const sc = scale || 1;
  const put = (ox, oy, col) => {
    g.fillStyle = col; let cx = x + ox;
    for (const ch of String(s)) {
      const gl = GLYPH[ch]; if (gl) for (let i = 0; i < 15; i++) if (gl[i] === '1') g.fillRect(cx + (i % 3) * sc, y + oy + ((i / 3) | 0) * sc, sc, sc);
      cx += 4 * sc;
    }
  };
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(ox, oy, outline);
  put(0, 0, color);
}
const textW = (s, sc) => String(s).length * 4 * (sc || 1) - (sc || 1);

export class Scene {
  constructor(cv) {
    this.cv = cv; cv.width = CW; cv.height = CH;
    this.g = cv.getContext('2d'); this.g.imageSmoothingEnabled = false;
    this.atlas = new Image(); this.fx = []; this.lit = {}; this.clock = 0; this.flash = 0; this.L = null; this.walk = 0;
    this.ready = new Promise((res) => { this.atlas.onload = () => { this.tint(); res(true); }; this.atlas.onerror = () => res(false); this.atlas.src = 'sprites/atlas.png?v=20261025a'; });
  }

  /** copia azzurrina dei robot per il potere di Faindo */
  tint() {
    const c = document.createElement('canvas'); c.width = this.atlas.width; c.height = this.atlas.height;
    const g = c.getContext('2d'); g.drawImage(this.atlas, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(70,120,255,.62)';
    for (let i = 0; i < 4; i++) { const r = ATLAS['robot' + i]; g.fillRect(r[0], r[1], r[2], r[3]); }
    this.blue = c;
  }

  setLevel(L) {
    cur.w = L.w; this.L = L; this.fx = []; this.lit = {}; this.MW = L.w * TS;
    const c = document.createElement('canvas'); c.width = this.MW; c.height = MH; this.stat = c;
    this.renderStatic(c.getContext('2d'), L);
  }

  /* ---------------- livello statico: pavimenti, muri, uffici ---------------- */
  renderStatic(g, L) {
    g.imageSmoothingEnabled = false;
    const tile = (x, y) => L.grid[idx(x, y)];
    const officeOf = new Map();
    for (const o of L.offices) for (const c of o.cells) officeOf.set(idx(c[0], c[1]), o);
    const isWallT = (t) => t === T.WALL || t === T.EXIT;
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    for (let y = 0; y < H; y++) for (let x = 0; x < L.w; x++) {
      const t = tile(x, y), px = x * TS, py = y * TS;
      if (isWallT(t)) {
        R(px, py, TS, TS, '#0a1c44'); R(px + 1, py + 1, TS - 2, TS - 2, '#1a3b7d');
        R(px + 1, py + 1, TS - 2, 1, '#2f5cb0'); R(px + 1, py + 1, 1, TS - 2, '#2f5cb0'); R(px + 1, py + TS - 2, TS - 2, 1, '#112a5e'); R(px + TS - 2, py + 1, 1, TS - 2, '#112a5e');
        R(px + 3, py + 3, TS - 6, TS - 6, '#0f2a62'); R(px + 3, py + 3, TS - 6, 1, '#0a1c44');
        const k = hash(x, y);
        if (k < 0.55) { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(px + 4 + i * 3, py + 5 + j * 4, 2, 2, hash(x + i, y + j, 5) < 0.45 ? '#ffb43a' : '#3a73c4'); }
        else if (k < 0.8) { R(px + 4, py + 4, TS - 8, 2, '#2aa6ea'); R(px + 4, py + 8, TS - 8, 1, '#2f5cb0'); R(px + 4, py + 10, TS - 8, 1, '#2f5cb0'); }
        else { for (let i = 0; i < 4; i++) R(px + 4 + i * 2, py + 4, 1, 8, '#2f5cb0'); R(px + 4, py + 7, 8, 2, '#0a1c44'); }
      } else if (t === T.OFFICE || t === T.DESK || t === T.DOOR) {
        const o = officeOf.get(idx(x, y));
        R(px, py, TS, TS, '#7f838f');
        R(px, py, 8, 8, '#8d919d'); R(px + 8, py + 8, 8, 8, '#8d919d');
        R(px, py + TS - 1, TS, 1, '#6a6e7a'); R(px + TS - 1, py, 1, TS, '#6a6e7a');
      } else {
        R(px, py, TS, TS, '#0b1630');
        if (hash(x, y, 2) < 0.3) R(px + 3 + ((hash(x, y, 3) * 9) | 0), py + 3 + ((hash(x, y, 4) * 9) | 0), 2, 2, '#14284f');
        if (hash(x, y, 7) < 0.1) R(px + 2, py + 2, 1, 1, '#1b3a74');
      }
    }
    // bordi luminosi dei muri verso i corridoi (azzurro) e verso gli uffici (colore dell'ufficio)
    for (let y = 0; y < H; y++) for (let x = 0; x < L.w; x++) {
      if (!isWallT(tile(x, y))) continue;
      const px = x * TS, py = y * TS;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= L.w || ny >= H) continue;
        const nt = tile(nx, ny); if (isWallT(nt) || nt === T.DOOR) continue;
        const o = officeOf.get(idx(nx, ny)), col = o ? HEX[o.color] : '#2aa6ea', th = o ? 2 : 1;
        if (dx === 1) g.fillStyle = col, g.fillRect(px + TS - th, py, th, TS);
        if (dx === -1) g.fillStyle = col, g.fillRect(px, py, th, TS);
        if (dy === 1) g.fillStyle = col, g.fillRect(px, py + TS - th, TS, th);
        if (dy === -1) g.fillStyle = col, g.fillRect(px, py, TS, th);
      }
    }
    // borchie dorate agli spigoli dei blocchi
    for (let y = 0; y < H; y++) for (let x = 0; x < L.w; x++) {
      if (tile(x, y) !== T.WALL) continue;
      const nw = (dx, dy) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= L.w || ny >= H || isWallT(tile(nx, ny)); };
      const px = x * TS, py = y * TS;
      const rv = (ax, ay) => { g.fillStyle = '#d9a63b'; g.fillRect(px + ax, py + ay, 2, 2); g.fillStyle = '#fff0a8'; g.fillRect(px + ax, py + ay, 1, 1); };
      if (!nw(-1, 0) && !nw(0, -1)) rv(0, 0); if (!nw(1, 0) && !nw(0, -1)) rv(TS - 2, 0);
      if (!nw(-1, 0) && !nw(0, 1)) rv(0, TS - 2); if (!nw(1, 0) && !nw(0, 1)) rv(TS - 2, TS - 2);
    }
    // piante negli uffici: sul braccio più lontano dalla porta
    for (const o of L.offices) {
      let best = null, bd = -1;
      for (const c of o.cells) { if (c[0] === o.desk[0] && c[1] === o.desk[1]) continue; const d = Math.abs(c[0] - o.inside[0]) + Math.abs(c[1] - o.inside[1]); if (d > bd) { bd = d; best = c; } }
      const px = best[0] * TS, py = best[1] * TS;
      R(px + 5, py + 10, 6, 4, '#7b4a1e'); R(px + 5, py + 10, 6, 1, '#a46a2c');
      R(px + 7, py + 4, 2, 6, '#2f8a3a'); R(px + 4, py + 5, 3, 3, '#3fb04e'); R(px + 9, py + 4, 3, 3, '#3fb04e'); R(px + 5, py + 2, 3, 3, '#58d068');
    }
  }

  /* ---------------- sprite ---------------- */
  spr(img, name, cx, by, flip, alpha, scale) {
    const r = ATLAS[name]; if (!r) return;
    const g = this.g, w = r[2], h = r[3], sw = scale ? Math.round(w * scale) : w, sh = scale ? Math.round(h * scale) : h, dx = Math.round(cx - sw / 2), dy = Math.round(by - sh);
    if (alpha !== undefined && alpha !== 1) g.globalAlpha = alpha;
    if (flip) { g.save(); g.translate(dx + sw, dy); g.scale(-1, 1); g.drawImage(img, r[0], r[1], w, h, 0, 0, sw, sh); g.restore(); }
    else g.drawImage(img, r[0], r[1], w, h, dx, dy, sw, sh);
    if (alpha !== undefined && alpha !== 1) g.globalAlpha = 1;
  }
  /** disegna dove serve anche l'immagine sul lato opposto in alto o in basso (passaggi sui bordi) */
  wrapped(px, py, hw, hh, fn) {
    for (const oy of [0, -MH, MH]) { if (py + oy + hh < OY || py + oy - hh > CH) continue; fn(0, oy); }   // i lati sinistro e destro li copre draw() ridisegnando il mondo accanto a sé
  }

  /* ---------------- eventi → effetti ---------------- */
  event(e, sim) {
    const tx = (e.x !== undefined ? e.x : sim.f.x) * TS, ty = OY + (e.y !== undefined ? e.y : sim.f.y) * TS;
    const burst = (n, cols, sp) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (0.4 + Math.random()) * (sp || 40); this.fx.push({ k: 'p', x: tx, y: ty, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.5 + Math.random() * 0.3, c: cols[i % cols.length] }); } };
    if (e.type === 'deliver') { this.fx.push({ k: 't', s: '+' + (e.n * 100), x: tx, y: ty - 8, t: 0, life: 1, c: HEX[e.color] }); burst(8, [HEX[e.color], '#ffffff']); }
    else if (e.type === 'office') { this.fx.push({ k: 't', s: '+500', x: tx, y: ty - 18, t: 0, life: 1.3, c: '#ffffff' }); burst(18, [HEX[e.color], '#ffffff', '#6fd3ff'], 60); this.flash = 0.25; }
    else if (e.type === 'kill') { this.fx.push({ k: 't', s: '+200', x: tx, y: ty - 8, t: 0, life: 1, c: '#ff8a1f' }); burst(14, ['#ff8a1f', '#ffd21f', '#ffffff'], 55); this.fx.push({ k: 'b', x: e.x * TS, y: OY + e.y * TS, face: e.face, t: 0, life: 0.9 }); }
    else if (e.type === 'key' || e.type === 'doc') burst(5, [HEX[e.color], '#ffffff'], 25);
    else if (e.type === 'unlock') { burst(10, [HEX[e.color], '#ffffff'], 35); const o = this.L.offices.find((q) => q.color === e.color); if (o) this.lit[o.id] = this.clock; }
    else if (e.type === 'life') { this.fx.push({ k: 't', s: '+1', x: tx, y: ty - 8, t: 0, life: 1, c: '#ff5a6e' }); burst(12, ['#e0332f', '#ff8a96', '#ffffff'], 45); }
    else if (e.type === 'hit') { burst(16, ['#ff5a4e', '#ffffff'], 60); this.flash = -0.35; }
  }

  update(dt) {
    this.clock += dt;
    this.fx = this.fx.filter((p) => { p.t += dt; if (p.k === 'p') { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 60 * dt; } else if (p.k === 't') p.y -= 14 * dt; return p.t < p.life; });
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt); else if (this.flash < 0) this.flash = Math.min(0, this.flash + dt);
  }

  /* ---------------- un fotogramma ---------------- */
  draw(sim, paused) {
    const g = this.g, L = this.L; if (!L || !this.stat || !this.atlas.complete) return;
    const t = this.clock;
    g.fillStyle = '#04070f'; g.fillRect(0, 0, CW, CH);
    // il mondo è un toro: lo si disegna accanto a sé quanto serve; nei livelli doppi la vista segue la metà in cui sta Faindo
    const MW = this.MW, cam = this.camX(sim);
    for (const k of [-1, 0, 1]) {
      const ox = k * MW - cam; if (ox >= CW + 16 || ox + MW <= -16) continue;
      g.save(); g.beginPath(); g.rect(0, OY, CW, CH - OY); g.clip(); g.translate(ox, 0); this.drawWorld(g, sim, t); g.restore();
    }
    // barra del potere sotto la barra superiore
    if (sim.power > 0) {
      const frac = sim.power / CONFIG.POWER_TIME, warn = sim.power <= 3 && Math.floor(t * 6) % 2 === 0;
      g.fillStyle = '#082a40'; g.fillRect(0, OY - 3, CW, 3); g.fillStyle = warn ? '#ffffff' : '#29d6ff'; g.fillRect(0, OY - 3, Math.round(CW * frac), 3);
    }
    if (this.flash) { g.fillStyle = this.flash > 0 ? 'rgba(255,255,255,' + this.flash * 1.2 + ')' : 'rgba(255,60,50,' + (-this.flash) * 1.1 + ')'; g.fillRect(0, OY, CW, CH - OY); }
    if (paused) { g.fillStyle = 'rgba(4,7,15,.35)'; g.fillRect(0, OY, CW, CH - OY); }
  }

  /** scorrimento orizzontale in pixel: fermo nei livelli singoli; nei doppi sta sulla metà di Faindo e scivola mentre lui passa dalle porte laterali */
  camX(sim) {
    const L = this.L; if (L.w === W) return 0;
    let u = sim.f.x; if (u < 1.5) u += L.w;
    const ss = (a) => a * a * (3 - 2 * a);
    const c = u < 13.5 ? 0 : u < 16.5 ? W * ss((u - 13.5) / 3) : u < 28.5 ? W : W + W * ss((u - 28.5) / 3);
    return Math.round(c * TS) % this.MW;
  }

  drawWorld(g, sim, t) {
    const L = this.L;
    g.drawImage(this.stat, 0, OY);
    const P = (x, y) => [x * TS, OY + y * TS];
    // portali sui bordi
    this.drawOpenings(g, L, t);
    // porte
    for (const o of L.offices) this.drawDoor(g, o, sim, t);
    // uffici: neri finché la porta è chiusa a chiave; si accendono con un breve sfarfallio e restano accesi
    for (const o of L.offices) {
      const on = sim.unlocked[o.id], age = t - (this.lit[o.id] === undefined ? -9 : this.lit[o.id]);
      const dark = !on || (age < 0.45 && Math.floor(age / 0.08) % 2 === 0);
      if (dark) { this.drawDesk(g, o, sim, t); g.fillStyle = 'rgba(3,5,11,.68)'; for (const c of o.cells) g.fillRect(c[0] * TS, OY + c[1] * TS, TS, TS); }
      else this.drawDesk(g, o, sim, t);
    }
    // uscita
    this.drawExit(g, L, sim, t);
    // cuore (una vita in più)
    if (L.heart && !sim.heartTaken) this.drawHeart(g, L.heart, t);
    // chiavi e documenti
    const dim = sim.level > 3 && sim.active !== null;
    L.docs.forEach((d, i) => { if (sim.docTaken[i]) return; const bob = Math.round(Math.sin(t * 4 + i) * 1), [px, py] = P(d.x + 0.5, d.y + 0.5); this.spr(this.atlas, 'doc' + d.color, px, py + 7 + bob, false, dim && sim.active !== d.color ? 0.38 : 1); });
    L.keys.forEach((k, i) => { if (sim.keyTaken[i]) return; const bob = Math.round(Math.sin(t * 4 + 2 + i) * 1), [px, py] = P(k.x + 0.5, k.y + 0.5); this.spr(this.atlas, 'key' + k.color, px, py + 7 + bob, false, dim && sim.active !== k.color ? 0.38 : 1); });
    // robot e Faindo, in ordine di profondità
    const ents = sim.robots.filter((r) => r.alive).map((r) => ({ y: r.y, r })); ents.push({ y: sim.f.y + 0.001, f: true });
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) { if (e.f) this.drawFaindo(g, sim, t); else this.drawRobot(g, e.r, sim, t); }
    // effetti
    for (const p of this.fx) {
      if (p.k === 'b') { this.drawBurn(g, p); continue; }
      if (p.k === 'p') { g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.t / p.life); g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); g.globalAlpha = 1; }
      else { const w = textW(p.s, 2); g.globalAlpha = Math.min(1, (p.life - p.t) * 2.5); text(g, p.s, Math.round(p.x - w / 2), Math.round(p.y), p.c, 2, '#000'); g.globalAlpha = 1; }
    }
  }

  drawOpenings(g, L, t) {
    const ph = Math.floor(t * 4) % 3;
    for (let y = 0; y < H; y++) for (let x = 0; x < L.w; x++) {
      if (L.grid[idx(x, y)] !== T.OPEN) continue;
      const px = x * TS, py = OY + y * TS;
      // direzione verso il vuoto
      const dx = x === 0 || x === W ? -1 : x === W - 1 || x === L.w - 1 ? 1 : 0, dy = y === 0 ? -1 : y === H - 1 ? 1 : 0;
      g.fillStyle = '#030611'; g.fillRect(px, py, TS, TS);
      for (let i = 0; i < 3; i++) {   // tre frecce che corrono verso il bordo
        const k = (i + ph) % 3, d = k * 5;
        g.fillStyle = k === 0 ? '#29d6ff' : k === 1 ? '#1b86b8' : '#0f4a6e';
        if (dx) this.chev(g, dx < 0 ? px + TS - 5 - d : px + 3 + d, py + 8, dx, 0);
        else this.chev(g, px + 8, dy < 0 ? py + TS - 5 - d : py + 3 + d, 0, dy);
      }
      // bordo luminoso sul lato del vuoto
      g.fillStyle = '#29d6ff';
      if (dx < 0) g.fillRect(px, py, 1, TS); if (dx > 0) g.fillRect(px + TS - 1, py, 1, TS);
      if (dy < 0) g.fillRect(px, py, TS, 1); if (dy > 0) g.fillRect(px, py + TS - 1, TS, 1);
      g.fillStyle = '#d9a63b';
      if (dx) { g.fillRect(px, py, TS, 2); g.fillRect(px, py + TS - 2, TS, 2); } else { g.fillRect(px, py, 2, TS); g.fillRect(px + TS - 2, py, 2, TS); }
    }
  }
  chev(g, cx, cy, dx, dy) {   // freccia a punta di 4 px: la punta guarda verso il vuoto
    for (let j = -3; j <= 3; j++) { const a = 3 - Math.abs(j); if (dx) g.fillRect(cx + dx * a, cy + j, 1, 1); else g.fillRect(cx + j, cy + dy * a, 1, 1); }
  }

  /** cuore pixel-art: pulsa di un pixel (una riga e una colonna in più, ricavate raddoppiando il centro) */
  drawHeart(g, h, t) {
    const big = Math.floor(t * 3) % 2 === 1, rows = HEART.slice();
    let map = rows.map((r) => r);
    if (big) { map = map.flatMap((r, i) => { const rr = r.slice(0, 5) + r[5] + r.slice(5); return i === 4 ? [rr, rr] : [rr]; }); }
    const w = map[0].length, hh = map.length, x0 = h[0] * TS + Math.round((TS - w) / 2), y0 = OY + h[1] * TS + Math.round((TS - hh) / 2);
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) { const c = HEART_COL[map[y][x]]; if (c) { g.fillStyle = c; g.fillRect(x0 + x, y0 + y, 1, 1); } }
  }

  drawDoor(g, o, sim, t) {
    const L = this.L, x = o.door[0], y = o.door[1], px = x * TS, py = OY + y * TS;
    const horiz = L.grid[idx(x - 1, y)] === T.WALL && L.grid[idx(x + 1, y)] === T.WALL;   // porta in un muro orizzontale
    const open = sim.doorOpen[o.id] > 0.5;
    this.spr(this.atlas, 'door' + o.color + '_' + (horiz ? (open ? 1 : 0) : (open ? 3 : 2)), px + 8, py + 16);
    // spia: spenta con la porta chiusa a chiave, accesa (colore dell'ufficio) quando è sbloccata
    const on = sim.unlocked[o.id];
    g.fillStyle = on ? (Math.floor(t * 3) % 2 ? HEX[o.color] : '#ffffff') : '#3a1a1a'; g.fillRect(px + 7, py + (horiz ? 1 : 7), 2, 2);
    if (!on && sim.keys[o.color] && Math.floor(t * 4) % 2) { g.fillStyle = HEX[o.color]; g.fillRect(px + 6, py + (horiz ? 0 : 6), 4, 4); }
  }

  drawDesk(g, o, sim, t) {
    const px = o.desk[0] * TS + 8, py = OY + o.desk[1] * TS + 8, done = sim.done[o.id];
    this.spr(this.atlas, 'desk0', px, py + 7);
    // schermo animato: righe che scorrono; a 5/5 lampeggia (breve animazione di completamento)
    const sx = px - 12 + 3, sy = py + 7 - 14 + 2;
    g.fillStyle = done ? (Math.floor(t * 6) % 2 ? '#c8ffd8' : '#3fe07a') : '#0e3f78'; g.fillRect(sx, sy, 7, 5);
    g.fillStyle = done ? '#0b5a2a' : '#6fd3ff'; const ln = Math.floor(t * 3) % 3;
    for (let i = 0; i < 3; i++) if (done || i !== ln) g.fillRect(sx + 1, sy + 1 + i * 2 - (done ? 0 : 0), done ? 5 : 3 + (i % 2) * 2, 1);
    // conteggio consegne sulla scrivania
    const s = sim.delivered[o.id] + '/5', w = textW(s, 1), cx = px - Math.round(w / 2), cy = py + 7 - 5;
    g.fillStyle = 'rgba(0,0,0,.72)'; g.fillRect(cx - 1, cy - 1, w + 2, 7);
    text(g, s, cx, cy, done ? '#7dffb0' : HEX[o.color], 1);
  }

  drawExit(g, L, sim, t) {
    const x = L.exit[0], y = L.exit[1], px = x * TS + 8, py = OY + y * TS + 16, on = sim.exitActive, ty = OY + y * TS;
    // alone sempre visibile (ambra a uscita chiusa, azzurro a uscita aperta) e freccia che indica la porta
    const col = on ? '41,214,255' : '255,196,64', a = on ? 0.4 + 0.25 * Math.sin(t * 6) : 0.22 + 0.1 * Math.sin(t * 3);
    const gr = g.createRadialGradient(px, ty + 10, 2, px, ty + 10, 30); gr.addColorStop(0, 'rgba(' + col + ',' + (a + 0.25) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr; g.fillRect(px - 32, ty - 2, 64, 56);
    g.fillStyle = 'rgba(' + col + ',' + a + ')'; g.fillRect(x * TS - 2, ty - 1, TS + 4, TS + 3);
    this.spr(this.atlas, on ? 'exit_on' : 'exit_off', px, py);
    g.strokeStyle = 'rgb(' + col + ')'; g.lineWidth = 1; g.strokeRect(x * TS - 1.5, ty + 0.5, TS + 3, TS - 1);
    const w = textW('EXIT', 1), lx = Math.round(px - w / 2), ly = ty + TS + 3 + (on ? Math.round(Math.sin(t * 7)) : 0);
    g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(lx - 2, ly - 1, w + 4, 7);
    text(g, 'EXIT', lx, ly, on ? '#9ff0ff' : '#ffc440', 1);
  }

  /** fiammella anni '80 sul robot appena distrutto: il robot lampeggia e brucia, poi sparisce */
  drawBurn(g, p) {
    const cx = Math.round(p.x), by = Math.round(p.y) + 7, k = Math.floor(p.t * 14), R = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(cx + x, by + y, w, h); };
    if (p.t < 0.5 && k % 2 === 0) this.spr(this.atlas, p.face === 0 ? 'robot0' : p.face === 1 ? 'robot2' : 'robot1', cx, by + 1, false, 0.7 - p.t);
    const fade = p.t > 0.65 ? 1 - (p.t - 0.65) / 0.25 : 1, sh = (k % 2) * 1, hgt = Math.round((7 + sh) * fade);
    if (hgt <= 0) return;
    R('#d4281c', -3, -3, 6, 3); R('#d4281c', -2, -3 - 2, 4, 2); R('#ff9a1a', -2, -3, 4, 2); R('#ff9a1a', -1, -3 - Math.max(2, hgt - 3), 2, Math.max(2, hgt - 3));
    R('#ffe36b', -1, -2, 2, 2); R(k % 3 === 0 ? '#ff9a1a' : '#d4281c', k % 2 ? 1 : -2, -3 - hgt, 1, 2);
  }

  drawFaindo(g, sim, t) {
    const f = sim.f, px = f.x * TS, py = OY + f.y * TS, moving = f.dx || f.dy;
    if (moving) this.walk += 1; else this.walk = 0;
    const frame = moving ? [0, 1, 0, 2][Math.floor(this.walk / 6) % 4] : 0;
    const name = 'faindo' + f.face + '_' + frame;
    const blink = f.inv > 0 && Math.floor(t * (f.spawn > 0 ? 18 : 12)) % 2 === 0, sc = f.spawn > 0 ? 1 + f.spawn / 0.8 : 0;
    this.wrapped(px, py, 12, 14, (ox, oy) => {
      const cx = px + ox, cy = py + oy;
      if (sim.power > 0) {   // aura azzurra; negli ultimi tre secondi lampeggia
        const warn = sim.power <= 3, vis = !warn || Math.floor(t * 8) % 2 === 0;
        if (vis) {
          const r = 13 + Math.sin(t * 8) * 1.5, gr = g.createRadialGradient(cx, cy, 2, cx, cy, r);
          gr.addColorStop(0, 'rgba(120,235,255,.55)'); gr.addColorStop(0.7, 'rgba(41,214,255,.35)'); gr.addColorStop(1, 'rgba(41,214,255,0)');
          g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2);
          g.strokeStyle = warn ? '#ffffff' : '#29d6ff'; g.lineWidth = 1; g.strokeRect(Math.round(cx - 9) + 0.5, Math.round(cy - 9) + 0.5, 18, 18);
        }
        const n = String(Math.ceil(sim.power)), w = textW(n, 1); text(g, n, Math.round(cx - w / 2), Math.round(cy - 21), warn ? '#ffffff' : '#29d6ff', 1, '#000');
      }
      if (f.inv > 0) { g.strokeStyle = blink ? 'rgba(255,255,255,.9)' : 'rgba(255,90,78,.8)'; g.strokeRect(Math.round(cx - 8) + 0.5, Math.round(cy - 8) + 0.5, 16, 16); }
      if (f.spawn > 0) { g.strokeStyle = 'rgba(255,255,255,' + (f.spawn / 0.8) + ')'; const rr = 8 + (1 - f.spawn / 0.8) * 0 + f.spawn * 22; g.strokeRect(Math.round(cx - rr) + 0.5, Math.round(cy - rr) + 0.5, rr * 2, rr * 2); }
      this.spr(this.atlas, name, cx, cy + 7 + (sc ? Math.round(sc * 3) : 0), false, blink ? 0.3 : 1, sc || undefined);
    });
  }

  drawRobot(g, r, sim, t) {
    const px = r.x * TS, py = OY + r.y * TS, fl = sim.power > 0, dormant = r.delay > 0;
    const step = Math.floor((t + r.i * 0.07) * 8) % 2;
    const name = r.face === 0 ? 'robot' + step : r.face === 1 ? 'robot' + (2 + step) : 'robot' + (step ? 1 : 3);
    const img = fl && this.blue && !(sim.power <= 3 && Math.floor(t * 8) % 2) ? this.blue : this.atlas;
    this.wrapped(px, py, 12, 14, (ox, oy) => {
      const cx = px + ox, cy = py + oy;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.round(cx - 6), Math.round(cy + 5), 12, 3);
      this.spr(img, name, cx, cy + 8, r.face === 3, dormant ? 0.4 + 0.2 * Math.sin(t * 10) : 1);
      // scariche: compaiono e spariscono a ritmo, scegliendo ogni volta una posizione diversa sul corpo
      const ph = (Math.floor(t * 60) + r.i * 17) % 52;
      if (!dormant && ph < 20) {
        const seed = Math.floor(t * 12) + r.i * 7;
        for (let i = 0; i < 2; i++) { const n = 'spark' + Math.floor(hash(seed, i, r.i) * 4), ax = (hash(seed, i, 9) - 0.5) * 16, ay = -2 - hash(seed, i, 3) * 9; this.spr(this.atlas, n, cx + ax, cy + 8 + ay + 3); }
      }
    });
  }
}
