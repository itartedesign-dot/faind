/* =====================================================================
   FAIND GAME — News Rush: la grafica pixel art
   ---------------------------------------------------------------------
   Tutto è disegnato in codice a 180 × 240 pixel logici (nessuna immagine
   intera di sfondo): lo scenario fisso è composto una volta sola, mentre
   Faindo, i rotoli, i giornalisti, i tubi e gli effetti sono elementi
   separati e animati a ogni fotogramma. Il canvas è poi ingrandito dal
   browser senza sfocature (image-rendering: pixelated).
   ===================================================================== */
import { CONFIG as C } from './sim.js';

const P = {
  navy: '#15213A', navyD: '#0b1226', navyM: '#1d2d4f', navyL: '#2a4170',
  ivory: '#F3E9D2', ivoryL: '#fffaf0', ivoryS: '#cfc19f', ivoryD: '#a89a78',
  cyan: '#1E9BD7', cyanL: '#6fd3ff', cyanD: '#0f5f8f',
  brass: '#b8863b', brassL: '#e0b25c', brassD: '#7a5520',
  amber: '#ffb43a', amberL: '#ffd98a', amberD: '#c4761a',
  steel: '#4b5b78', steelD: '#2b3850', steelL: '#7d8fb0', steelDD: '#1a2538',
  red: '#ff5a4e', green: '#2f6b3a', greenL: '#4f9a54', wood: '#3b2f2a', woodL: '#5a4636', woodD: '#241c24'
};

const W = C.W, H = C.H;

function rect(g, col, x, y, w, h) { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); }

/* ------------------------------ Mini font 3×5 ------------------------------ */
const FONT = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001001001001', '8': '111101111101111', '9': '111101111001111',
  '+': '000010111010000', 'x': '000101010101000', '-': '000000111000000', '!': '010010010000010', '.': '000000000000010',
  A: '111101111101101', D: '110101101101110', E: '111100111100111', F: '111100111100100', I: '111010010010111', L: '100100100100111',
  M: '111111101101101', N: '101111111101101', O: '111101101101111', P: '111101111100100', R: '110101110101101', S: '111100111001111',
  U: '101101101101111', W: '101101111111101', ' ': '000000000000000'
};
function text(g, str, x, y, col, scale) {
  const s = scale || 1; let cx = x;
  for (const ch of String(str)) {
    const m = FONT[ch] || FONT[' '];
    for (let i = 0; i < 15; i++) if (m[i] === '1') rect(g, col, cx + (i % 3) * s, y + Math.floor(i / 3) * s, s, s);
    cx += 4 * s;
  }
  return cx - x - s;
}
function textW(str, s) { return String(str).length * 4 * (s || 1) - (s || 1); }

/* ------------------------------ Rotolo ------------------------------ */
// 8 × 14, in piedi: carta avorio, fascia ciano centrale, estremità arrotolata in cima e contorno scuro sottile.
// Lo stesso disegno vale per la caduta, il tubo, il braccio e il carico; le varianti inclinate spostano le righe (niente rotazioni sfocate)
const ROLL_MAP = [
  '..oooo..', '.oIIiSo.', 'oIiooiSo', 'oIiSSiSo', 'occccccO', 'oCCCCCCO', 'occccccO', 'oIiiiiSo', 'oIiiiiSo', 'oIiiiiSo', 'oIiiiiSo', 'oIiiiSSo', '.oSSSSo.', '..oooo..'
];
const ROLL_COL = { o: '#0b1226', O: '#0b1226', i: P.ivory, I: P.ivoryL, S: P.ivoryS, c: P.cyan, C: P.cyanL };
const RED_COL = { i: '#f2a99f', I: '#ffd0c8', S: '#c97367', c: '#d8261c', C: '#ff7a6a' };
const RX = 8, RY = 8;   // origine del rotolo nella sua tela 16 × 16: si disegna a (x - RX, y - RY)
function makeRoll(shear, red) {
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
  const g = cv.getContext('2d');
  ROLL_MAP.forEach((row, y) => {
    const off = Math.round((y - 7) * shear);
    for (let x = 0; x < 8; x++) { const ch = row[x]; if (ch !== '.') rect(g, red ? (RED_COL[ch] || ROLL_COL[ch]) : ROLL_COL[ch], 4 + x + off, 1 + y, 1, 1); }
  });
  return cv;
}
// versione orizzontale per i tubi: lo stesso disegno ruotato di 90°, 14 × 8
function makeRollH() {
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 10;
  const g = cv.getContext('2d');
  ROLL_MAP.forEach((row, y) => { for (let x = 0; x < 8; x++) { const ch = row[x]; if (ch !== '.') rect(g, ROLL_COL[ch], 1 + y, 1 + x, 1, 1); } });
  return cv;
}

/* ------------------------------ Scenario fisso ------------------------------ */
function buildBackground() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  let seed = 12345; const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;

  // fondale a fasce con una leggera retinatura
  const bands = ['#0a1124', '#0c1429', '#0f1930', '#121e38', '#15233f', '#182847'];
  for (let y = 0; y < 160; y++) {
    const f = (y / 160) * (bands.length - 1), b = Math.floor(f), frac = f - b;
    const col = bands[b + (frac > 0.5 && (y + 1) % 2 ? 1 : 0)] || bands[bands.length - 1];
    rect(g, col, 0, y, W, 1);
  }
  // palazzi e strutture lontane con finestre ambra
  for (let i = 0; i < 9; i++) {
    const bx = i * 22 - 6 + Math.floor(rnd() * 8), bw = 16 + Math.floor(rnd() * 12), bh = 30 + Math.floor(rnd() * 50);
    rect(g, i % 2 ? '#0e1830' : '#101c36', bx, 136 - bh, bw, bh);
    for (let wy = 136 - bh + 4; wy < 130; wy += 6) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) {
      if (rnd() < 0.22) rect(g, rnd() < 0.5 ? '#24385f' : '#1c2c4c', wx, wy, 2, 3);   // finestre spente e fredde: niente macchie arancioni che sembrino oggetti
    }
  }
  // travi: diagonali e orizzontali con croci
  const beam = (x0, y0, x1, y1, w, col) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) rect(g, col, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, w, w);
  };
  rect(g, '#1a2a4a', 0, 64, W, 3); rect(g, '#223559', 0, 64, W, 1);
  rect(g, '#1a2a4a', 0, 104, W, 3); rect(g, '#223559', 0, 104, W, 1);
  for (let x = 0; x < W; x += 24) { beam(x, 67, x + 24, 104, 2, '#16233f'); beam(x + 24, 67, x, 104, 2, '#16233f'); }
  beam(0, 70, 72, 136, 3, '#1f3158'); beam(180, 74, 116, 136, 3, '#1f3158');
  rect(g, '#1a2a4a', 6, 40, 3, 96); rect(g, '#1a2a4a', 171, 40, 3, 96);
  // lampade appese (il bagliore si anima dopo)
  for (const lx of [32, 66, 112, 148]) {
    rect(g, P.steelD, lx, 44, 1, 14 + (lx % 3) * 6);
    const ly = 58 + (lx % 3) * 6;
    rect(g, P.steel, lx - 4, ly, 9, 2); rect(g, P.amber, lx - 3, ly + 2, 7, 2); rect(g, P.amberL, lx - 1, ly + 2, 3, 1);
  }

  // soffitto con tubi pneumatici trasparenti
  rect(g, P.navyD, 0, 16, W, 30);
  rect(g, '#10192e', 0, 16, W, 2);
  drawPipeStatic(g);

  // piattaforma di Faindo
  rect(g, P.steelL, 0, C.PLATFORM_Y, W, 1);
  rect(g, P.steel, 0, C.PLATFORM_Y + 1, W, 20);
  rect(g, P.steelD, 0, C.PLATFORM_Y + 21, W, 2);
  rect(g, P.steelDD, 0, C.PLATFORM_Y + 23, W, 1);
  for (let x = 0; x < W; x += 20) { rect(g, P.steelD, x, C.PLATFORM_Y + 4, 1, 14); rect(g, P.steelL, x + 1, C.PLATFORM_Y + 4, 1, 14); }
  for (let x = 4; x < W; x += 20) { rect(g, P.steelDD, x, C.PLATFORM_Y + 7, 3, 3); rect(g, P.steelL, x, C.PLATFORM_Y + 7, 1, 1); rect(g, P.steelDD, x, C.PLATFORM_Y + 13, 3, 3); }
  // strisce di sicurezza ai lati
  for (const [a, b] of [[0, 62], [118, 180]]) {
    rect(g, P.navyD, a, C.PLATFORM_Y + 1, b - a, 4);
    for (let x = a; x < b; x += 6) { rect(g, P.amber, x, C.PLATFORM_Y + 1, 3, 4); rect(g, P.amberD, x + 1, C.PLATFORM_Y + 3, 2, 2); }
  }
  // ringhiere
  for (const [a, b] of [[0, 60], [120, 180]]) {
    rect(g, '#0e1a30', a, 118, b - a, 18);
    for (let y = 120; y < 136; y += 2) for (let x = a + (y % 4 ? 1 : 0); x < b; x += 2) rect(g, '#1a2c4c', x, y, 1, 1);
    rect(g, P.brass, a, 117, b - a, 2); rect(g, P.brassL, a, 117, b - a, 1);
    rect(g, P.brassD, a, 134, b - a, 2);
  }
  for (const px of [2, 57, 121, 175]) { rect(g, P.brass, px, 112, 3, 24); rect(g, P.brassL, px, 112, 1, 24); rect(g, P.amberL, px, 108, 3, 3); rect(g, P.amber, px, 109, 3, 2); }

  // pannello UNLOAD e foro di consegna
  rect(g, P.brassD, 76, C.PLATFORM_Y + 1, 28, 20);
  rect(g, P.brass, 77, C.PLATFORM_Y + 1, 26, 19);
  rect(g, P.navyD, 79, C.PLATFORM_Y + 3, 22, 14);
  rect(g, P.cyanD, 79, C.PLATFORM_Y + 3, 22, 1);
  text(g, 'UNLOAD', 80, C.PLATFORM_Y + 5, P.cyanL);
  // freccia in giù
  rect(g, P.cyan, 89, C.PLATFORM_Y + 11, 2, 3); rect(g, P.cyan, 87, C.PLATFORM_Y + 13, 6, 1); rect(g, P.cyan, 88, C.PLATFORM_Y + 14, 4, 1); rect(g, P.cyan, 89, C.PLATFORM_Y + 15, 2, 1);

  drawNewsroomStatic(g, rnd);
  return cv;
}

function drawPipeStatic(g) {
  // tubo orizzontale in vetro
  const y0 = 22, h = 13;
  rect(g, '#3a5f8a', 0, y0 - 1, W, 1);
  rect(g, '#16304f', 0, y0, W, h);
  rect(g, '#1e4570', 0, y0 + 1, W, 2);
  rect(g, 'rgba(140,210,255,.55)', 0, y0 + 2, W, 1);
  rect(g, '#0f2038', 0, y0 + h - 3, W, 3);
  rect(g, '#3a5f8a', 0, y0 + h, W, 1);
  // collari in ottone ai giunti
  for (const cx of [4, 38, 72, 108, 142, 176]) {
    rect(g, P.brassD, cx, y0 - 3, 5, h + 6); rect(g, P.brass, cx + 1, y0 - 3, 3, h + 6); rect(g, P.brassL, cx + 1, y0 - 3, 1, h + 6);
  }
  // bocchette verticali
  for (const vx of C.VENTS) {
    rect(g, '#3a5f8a', vx - 6, y0 + h, 1, 5); rect(g, '#3a5f8a', vx + 6, y0 + h, 1, 5);
    rect(g, '#16304f', vx - 5, y0 + h, 11, 5);
    rect(g, 'rgba(140,210,255,.5)', vx - 4, y0 + h, 1, 5);
    rect(g, P.brassD, vx - 7, y0 + h + 4, 15, 3);
    rect(g, P.brass, vx - 6, y0 + h + 4, 13, 2);
    rect(g, P.steelD, vx - 5, y0 + h + 7, 11, 2);
    rect(g, P.navyD, vx - 3, y0 + h + 9, 7, 1);
  }
}

function drawNewsroomStatic(g, rnd) {
  // parete della redazione, calda
  const y0 = 160;
  rect(g, '#1f1b2c', 0, y0, W, 80);
  for (let y = y0; y < 214; y += 2) rect(g, y % 4 ? '#241f31' : '#201c2d', 0, y, W, 1);
  // insegna NEWS
  rect(g, P.brassD, 6, 169, 34, 19); rect(g, '#15405f', 7, 170, 32, 17); rect(g, P.cyanD, 7, 170, 32, 1);
  text(g, 'NEWS', 11, 174, P.cyanL, 2);
  // orologio
  rect(g, P.steelD, 144, 168, 14, 14); rect(g, P.steelL, 145, 169, 12, 12); rect(g, '#cfd8e8', 146, 170, 10, 10);
  rect(g, P.navy, 150, 171, 1, 5); rect(g, P.navy, 150, 175, 4, 1);
  // bacheca con fogli
  rect(g, P.woodL, 160, 166, 18, 22); rect(g, '#6b5a4a', 161, 167, 16, 20);
  for (const [px, py, pc] of [[163, 169, P.ivory], [170, 170, P.ivoryS], [163, 177, P.ivoryS], [170, 178, P.ivory]]) { rect(g, pc, px, py, 5, 6); rect(g, P.steelD, px + 1, py + 2, 3, 1); }
  // lampade da scrivania appese
  for (const lx of [24, 90, 156]) {
    rect(g, P.steelD, lx, 160, 1, 6);
    rect(g, P.steel, lx - 6, 166, 13, 3); rect(g, P.amber, lx - 5, 169, 11, 2); rect(g, P.amberL, lx - 2, 169, 5, 1);
  }
  // pila di fogli e piante
  for (const sx of [3, 62, 121, 173]) {
    for (let i = 0; i < 4; i++) { rect(g, i % 2 ? P.ivory : P.ivoryS, sx - 1, 205 - i * 3, 9, 3); rect(g, P.ivoryD, sx - 1, 207 - i * 3, 9, 1); }
  }
  const plant = (px, py) => {
    rect(g, '#8a4b2a', px, py + 7, 7, 6); rect(g, '#6a3a20', px, py + 11, 7, 2);
    for (const [dx, dy, w, h] of [[0, 2, 3, 6], [2, 0, 3, 7], [4, 2, 3, 6], [-1, 4, 2, 3], [6, 4, 2, 3]]) rect(g, rnd() < 0.5 ? P.green : P.greenL, px + dx, py + dy, w, h);
  };
  plant(48, 200); plant(130, 200); plant(168, 196);
  // scrivanie
  rect(g, P.woodL, 0, 216, W, 1);
  rect(g, P.wood, 0, 217, W, 23);
  rect(g, P.woodD, 0, 237, W, 3);
  for (const cx of [30, 90, 150]) {
    for (const dx of [-27, 17]) {
      rect(g, P.woodD, cx + dx, 219, 11, 18); rect(g, P.woodL, cx + dx, 219, 11, 1);
      rect(g, P.steelD, cx + dx + 2, 222, 7, 5); rect(g, P.steelL, cx + dx + 4, 224, 3, 1);
      rect(g, P.steelD, cx + dx + 2, 229, 7, 5); rect(g, P.steelL, cx + dx + 4, 231, 3, 1);
    }
  }
  // tazze
  for (const [mx, my] of [[58, 211], [114, 211], [172, 211]]) { rect(g, P.ivory, mx, my, 4, 5); rect(g, P.ivoryS, mx + 4, my + 1, 1, 3); rect(g, '#6b3a1a', mx + 1, my, 2, 1); }

  // tubo di discesa e rami verso le scrivanie
  const tube = (x, y, w, h, vertical) => {
    rect(g, '#3a5f8a', x - 1, y - 1, w + 2, h + 2);
    rect(g, '#16304f', x, y, w, h);
    if (vertical) { rect(g, 'rgba(140,210,255,.5)', x + 2, y, 1, h); rect(g, '#0f2038', x + w - 3, y, 3, h); }
    else { rect(g, 'rgba(140,210,255,.5)', x, y + 2, w, 1); rect(g, '#0f2038', x, y + h - 3, w, 3); }
  };
  tube(84, 156, 12, 33, true);
  tube(44, 180, 40, 10, false); tube(96, 180, 40, 10, false);
  tube(41, 188, 10, 16, true); tube(129, 188, 10, 16, true);
  tube(84, 188, 12, 12, true);
  for (const [bx, by, bw, bh] of [[83, 156, 14, 3], [83, 184, 14, 3], [42, 180, 3, 10], [135, 180, 3, 10], [40, 202, 12, 3], [128, 202, 12, 3], [83, 198, 14, 3]]) {
    rect(g, P.brassD, bx, by, bw, bh); rect(g, P.brass, bx + 1, by, bw - 2, bh - 1); rect(g, P.brassL, bx + 1, by, bw - 2, 1);
  }
}

/* ------------------------------ Faindo, visto di schiena ------------------------------ */
const OL = '#0b1226';   // contorno scuro sottile
const IV = { base: '#ecdcb9', hi: P.ivoryL, sh: '#d3b98c', sh2: '#a98a5c' };   // avorio con ombre calde
const BR = { base: P.brass, hi: P.brassL, sh: P.brassD, sh2: P.brassD };
const NV = { base: '#2f4a7c', hi: '#5d82c4', sh: '#22365f', sh2: '#16233f' };   // blu notte, abbastanza chiaro da staccarsi dallo sfondo
/** Forma tondeggiante a righe (semilarghezza per riga) con contorno, luce da sinistra in alto e ombra calda a destra. */
function blob(g, cx, top, hws, c) {
  const n = hws.length;
  for (let r = 0; r < n; r++) rect(g, OL, cx - hws[r] - 1, top + r, hws[r] * 2 + 2, 1);
  rect(g, OL, cx - hws[0], top - 1, hws[0] * 2, 1); rect(g, OL, cx - hws[n - 1], top + n, hws[n - 1] * 2, 1);
  for (let r = 0; r < n; r++) {
    const hw = hws[r], w = hw * 2;
    rect(g, c.base, cx - hw, top + r, w, 1);
    rect(g, c.hi, cx - hw, top + r, Math.min(2, hw), 1);
    rect(g, c.sh, cx + hw - 3, top + r, 3, 1); rect(g, c.sh2, cx + hw - 1, top + r, 1, 1);
    if (r === 0) rect(g, c.hi, cx - hw + 1, top, Math.max(1, w - 4), 1);
    if (r === n - 1) { rect(g, c.sh, cx - hw, top + r, w, 1); rect(g, c.sh2, cx + 1, top + r, hw - 1, 1); }
  }
}
/** Rettangolo con contorno, riga chiara a sinistra e ombra a destra. */
function box(g, x, y, w, h, c) {
  rect(g, OL, x - 1, y - 1, w + 2, h + 2);
  rect(g, c.base, x, y, w, h);
  if (w > 1) { rect(g, c.hi, x, y, 1, h); rect(g, c.sh, x + w - 1, y, 1, h); }
  if (h > 2) rect(g, c.sh, x, y + h - 1, w, 1);
}
const HEAD_HW = [4, 6, 7, 8, 9, 9, 9, 9, 9, 9, 8, 7, 5], TORSO_HW = [6, 7, 7, 7, 7, 7, 7, 6, 6], FOOT_HW = [3, 4, 4, 4];

/** Faindo di schiena. st: {walk(-1|0|1), step(0..3), idle, collect(s), deliver(s), load, cap, blink, pulse}. fy = linea dei piedi. */
function drawFaindo(g, cx, fy, st) {
  const x = Math.round(cx), step = st.walk ? st.step : 0;
  const lf = step === 1 ? 2 : 0, rf = step === 3 ? 2 : 0;                       // piedi alternati: uno si solleva, l'altro resta a terra
  const up = st.collect > 0, dl = st.deliver > 0;
  const bob = st.walk ? (step % 2 ? -1 : 0) : (st.idle ? -1 : 0);               // passo: il corpo sale e scende; attesa: respira
  const by = fy - 1 + bob + (st.deliver > 0.35 ? 1 : 0) - (dl && st.deliver <= 0.35 ? 1 : 0) - (up ? 1 : 0);
  const sway = st.walk ? (step === 1 ? -1 : step === 3 ? 1 : 0) : 0;            // il busto oscilla sopra il piede in appoggio
  const tx = x + sway, hx = tx + st.walk;
  // piedi larghi con pannello ciano
  for (const [fx, lift] of [[x - 5, lf], [x + 5, rf]]) {
    const ox = fx + (st.walk && lift ? st.walk : 0), ft = fy - 4 - lift;
    blob(g, ox, ft, FOOT_HW, IV);
    rect(g, P.cyan, ox - 2, ft + 1, 4, 1); rect(g, P.navy, ox - 4, ft + 3, 8, 1);
  }
  // gambe: coscia blu notte, ginocchio in ottone, stinco avorio con feritoia ciano, caviglia in ottone
  for (const [lx, lift] of [[x - 7, lf], [x + 4, rf]]) {
    const bot = fy - 7 - lift, top = by - 8;
    if (bot - 1 > top) box(g, lx, top, 3, bot - 1 - top, NV);
    box(g, lx, bot - 1, 3, 1, BR);
    box(g, lx, bot, 3, 3, IV); rect(g, P.cyan, lx + 1, bot, 1, 2);
    if (lift) box(g, lx, bot + 3, 3, 1, BR);
  }
  // bacino blu notte con anelli in ottone
  box(g, tx - 6, by - 10, 12, 2, NV); rect(g, P.brass, tx - 5, by - 10, 2, 2); rect(g, P.brass, tx + 3, by - 10, 2, 2);
  // braccia: spalla blu notte con anello in ottone, braccio blu notte, gomito in ottone, avambraccio avorio con feritoia ciano, mano blu notte
  const swL = st.walk ? (step === 1 ? 2 : step === 3 ? -2 : 0) : (st.idle ? 1 : 0);
  for (const s of [-1, 1]) {
    const sx = s < 0 ? tx - 10 : tx + 6, sw = s < 0 ? swL : -swL;
    box(g, sx, by - 19, 4, 4, NV); rect(g, P.brass, sx + 1, by - 18, 2, 2);
    if (up) {                                                                  // raccolta: braccia alzate ad accogliere il rotolo
      const o = s * 2;
      box(g, sx + o, by - 20, 4, 3, NV); box(g, sx + o * 3 / 2 | 0, by - 24, 4, 4, IV); rect(g, P.cyan, (sx + o * 3 / 2 | 0) + 1, by - 23, 1, 2);
      box(g, (sx + o * 3 / 2 | 0), by - 27, 4, 2, NV);
    } else {
      const o = dl ? s * 2 : 0;                                                // consegna: braccia aperte
      box(g, sx + o, by - 15, 4, 3, NV); box(g, sx + o, by - 12, 4, 1, BR);
      const fl = Math.max(2, 4 + sw);
      box(g, sx + o, by - 11, 4, fl, IV); rect(g, P.cyan, sx + o + 1, by - 10, 1, Math.min(2, fl - 1));
      box(g, sx + o, by - 11 + fl, 4, 1, BR); box(g, sx + o, by - 10 + fl, 4, 2, NV);
    }
  }
  // busto compatto con il pannello di manutenzione sul dorso (con le spie del carico)
  blob(g, tx, by - 19, TORSO_HW, IV);
  rect(g, '#9a7a4c', tx - 5, by - 18, 11, 7); rect(g, '#dcc79e', tx - 4, by - 17, 9, 5);
  rect(g, '#16233f', tx - 4, by - 16, 9, 3);
  const n = st.cap, x0 = tx - Math.floor((n * 2 - 1) / 2);
  for (let i = 0; i < n; i++) rect(g, dl || i < st.load ? (st.load >= st.cap && st.pulse ? P.amberL : P.cyanL) : '#2a4170', x0 + i * 2, by - 16, 1, 2);
  for (const [dx, dy] of [[-5, -18], [5, -18], [-5, -12], [5, -12]]) rect(g, P.brassD, tx + dx, by + dy, 1, 1);
  // testa larga e schiacciata, con cuciture, dischi laterali in ottone e antenna ciano
  blob(g, hx, by - 34, HEAD_HW, IV);
  rect(g, '#b39868', hx - 4, by - 33, 1, 8); rect(g, '#b39868', hx + 3, by - 33, 1, 8);
  for (const [dx, dy] of [[-6, -30], [5, -31], [-1, -32], [-6, -26], [5, -27], [0, -27]]) rect(g, P.brassD, hx + dx, by + dy, 1, 1);
  for (const [dx, o] of [[-12, 0], [8, 1]]) {
    box(g, hx + dx, by - 31, 4, 8, BR);
    rect(g, P.cyan, hx + dx + (o ? 2 : 1), by - 28, 1, 3); rect(g, P.cyanL, hx + dx + (o ? 2 : 1), by - 28, 1, 1);
  }
  rect(g, OL, hx - 2, by - 21, 4, 1); rect(g, P.navy, hx - 2, by - 20, 4, 1); rect(g, P.brass, hx - 2, by - 20, 1, 1); rect(g, P.brass, hx + 1, by - 20, 1, 1);
  rect(g, P.steelL, hx - 4, by - 37, 1, 2);   // antenna rettangolare ciano, un po' a sinistra come nel riferimento
  rect(g, OL, hx - 6, by - 42, 5, 5); rect(g, dl || st.blink ? P.cyanL : P.cyan, hx - 5, by - 41, 3, 4); rect(g, '#d8f4ff', hx - 5, by - 41, 1, 2);
}

/* ------------------------------ Giornalisti, di schiena ------------------------------ */
const STAFF = [
  { cx: 30, hair: '#5a3418', hairL: '#7a4a24', shirt: '#3f6fb8', shirtD: '#2c4f88', skin: '#d9a07a' },
  { cx: 90, hair: '#8a3a22', hairL: '#b0522e', shirt: '#b8483a', shirtD: '#8a3328', skin: '#e0b090', long: true },
  { cx: 150, hair: '#16131a', hairL: '#2a2430', shirt: '#4a6a3a', shirtD: '#34502a', skin: '#c88a64' }
];

function drawMonitor(g, cx, t, flash, tint) {
  rect(g, '#10182a', cx - 18, 187, 36, 26); rect(g, '#2a3550', cx - 18, 187, 36, 1);
  const bright = flash > 0;
  rect(g, bright ? '#ffffff' : '#cfe4f5', cx - 16, 189, 32, 22);
  rect(g, P.cyan, cx - 16, 189, 32, 3);
  const sc = Math.floor(t * 2.2 + cx) % 3;
  for (let i = 0; i < 4; i++) rect(g, '#6c7f99', cx - 14, 194 + i * 4, i === sc ? 10 : 14 - ((i * 3 + cx) % 5), 2);
  rect(g, tint ? '#7ac0e8' : '#8ec6e0', cx + 3, 194, 11, 9);
  rect(g, '#3f7a9a', cx + 5, 199, 3, 4); rect(g, '#2d5f7e', cx + 8, 197, 4, 6);
  rect(g, 'rgba(255,255,255,.35)', cx - 16, 189, 32, 1);
  if (bright) rect(g, 'rgba(255,255,255,.4)', cx - 16, 189, 32, 22);
}

function drawStaff(g, s, t, react, flash) {
  const cx = s.cx;
  drawMonitor(g, cx, t, flash, cx === 90);
  // testa e capelli (si vede la nuca)
  const nod = react > 0 ? -2 : (Math.floor(t * 3 + cx) % 5 === 0 ? 1 : 0);
  const hy = 203 + nod;
  rect(g, s.hair, cx - 6, hy, 12, 10); rect(g, s.hairL, cx - 5, hy, 8, 2); rect(g, s.hair, cx - 7, hy + 2, 1, 6); rect(g, s.hair, cx + 6, hy + 2, 1, 6);
  if (s.long) { rect(g, s.hair, cx - 7, hy + 5, 14, 11); rect(g, s.hairL, cx - 3, hy + 6, 2, 8); rect(g, '#6a2b18', cx + 2, hy + 8, 3, 7); }
  rect(g, s.skin, cx - 3, hy + 10, 6, 2);                              // collo
  // spalle e busto
  rect(g, s.shirt, cx - 11, 213, 22, 13); rect(g, s.shirtD, cx - 11, 213, 22, 1);
  rect(g, s.shirtD, cx - 1, 215, 2, 9);
  // braccia sulla tastiera: si muovono a turno mentre scrivono
  const fast = react > 0, k = Math.floor(t * (fast ? 20 : 5) + cx) % 2, amp = fast ? 2 : 1;   // alla consegna digita veloce
  rect(g, s.shirt, cx - 14, 216, 4, 8); rect(g, s.shirt, cx + 10, 216, 4, 8);
  rect(g, s.skin, cx - 14, 224 + (k ? 0 : amp), 4, 2); rect(g, s.skin, cx + 10, 224 + (k ? amp : 0), 4, 2);
  // sedia
  rect(g, P.navyD, cx - 9, 224, 18, 16); rect(g, P.navyM, cx - 9, 224, 18, 2); rect(g, P.navyL, cx - 8, 226, 1, 12);
}

/* ------------------------------ La scena animata ------------------------------ */
export class Scene {
  constructor(canvas) {
    this.cv = canvas; canvas.width = W; canvas.height = H;
    this.g = canvas.getContext('2d'); this.g.imageSmoothingEnabled = false;
    this.bg = buildBackground();
    this.rolls = [makeRoll(-0.25), makeRoll(0), makeRoll(0.25)];
    this.rollsRed = [makeRoll(-0.25, true), makeRoll(0, true), makeRoll(0.25, true)];
    this.rollH = makeRollH();
    this.rollsLean = [makeRoll(0.4), makeRoll(-0.4)];
    this.time = 0; this.fx = []; this.tube = []; this.react = [0, 0, 0]; this.flash = [0, 0, 0];
    this.shake = 0; this.collectT = 0; this.deliverT = 0; this.unloadFlash = 0; this.missFlash = 0; this.deskNext = 0;
    this.winFlash = [0, 0, 0]; this.faindoX = W / 2; this.walkDir = 0; this.walkClock = 0;
  }

  reset() { this.fx = []; this.tube = []; this.react = [0, 0, 0]; this.flash = [0, 0, 0]; this.shake = 0; this.collectT = 0; this.deliverT = 0; this.unloadFlash = 0; this.missFlash = 0; this.winFlash = [0, 0, 0]; }

  /** Un fatto accaduto nel motore (raccolta, consegna, rotolo perso, livello…). */
  event(e, sim) {
    if (e.type === 'collect') { this.collectT = 0.28; this.fx.push({ k: 'flash', x: e.a, y: Math.min(e.b, C.PLATFORM_Y - 14), t: 0 }); }
    else if (e.type === 'deliver') {
      this.deliverT = 0.5; this.unloadFlash = 0.5;
      for (let i = 0; i < e.a; i++) { this.tube.push({ t: -i * 0.16, desk: (this.deskNext++) % 3 }); }
      this.fx = this.fx.filter(f => f.k !== 'pop' || f.t < 0.4);                     // consegne ravvicinate: niente pile di scritte
      this.fx.push({ k: 'pop', txt: '+' + e.b, x: C.DELIVER_X, y: C.PLATFORM_Y - 48, t: 0 });
      this.fx.push({ k: 'ring', x: C.DELIVER_X, y: C.PLATFORM_Y, t: 0 });
    } else if (e.type === 'drop' || e.type === 'bad') {
      this.winFlash[Math.min(2, Math.max(0, (sim ? sim.lost : 1) - 1))] = 0.8;
      if (e.type === 'bad') return;
      this.missFlash = 0.35; this.shake = 0.3;
      this.fx.push({ k: 'miss', x: e.a, y: C.PLATFORM_Y, t: 0 });
    }
  }

  update(dt) {
    this.time += dt;
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < (f.k === 'pop' ? 1.1 : f.k === 'flash' ? 0.25 : 0.9));
    this.collectT = Math.max(0, this.collectT - dt); this.deliverT = Math.max(0, this.deliverT - dt);
    this.unloadFlash = Math.max(0, this.unloadFlash - dt); this.missFlash = Math.max(0, this.missFlash - dt);
    this.shake = Math.max(0, this.shake - dt);
    for (let i = 0; i < 3; i++) this.winFlash[i] = Math.max(0, this.winFlash[i] - dt);
    for (let i = 0; i < 3; i++) { this.react[i] = Math.max(0, this.react[i] - dt); this.flash[i] = Math.max(0, this.flash[i] - dt); }
    for (const r of this.tube) {
      r.t += dt;
      if (!r.done && r.t >= 1.15) { r.done = true; this.react[r.desk] = 0.55; this.flash[r.desk] = 0.25; this.fx.push({ k: 'paper', x: STAFF[r.desk].cx, y: 200, t: 0 }); }
    }
    this.tube = this.tube.filter(r => r.t < 1.3);
  }

  /** model: {x, dir, load, cap, rolls, pending, level, full, playing} */
  draw(m) {
    const g = this.g, t = this.time;
    g.save();
    if (this.shake > 0) g.translate(Math.round(Math.sin(t * 90) * 1.5), 0);
    g.drawImage(this.bg, 0, 0);

    // bagliore delle lampade che sfarfalla appena
    for (const [lx, ly] of [[32, 62], [66, 68], [112, 62], [148, 68]]) {
      const a = 0.10 + 0.04 * Math.sin(t * 3 + lx);
      g.fillStyle = 'rgba(255,180,58,' + a.toFixed(3) + ')';
      g.beginPath(); g.moveTo(lx - 3, ly + 4); g.lineTo(lx + 4, ly + 4); g.lineTo(lx + 16, ly + 40); g.lineTo(lx - 15, ly + 40); g.closePath(); g.fill();
    }
    for (const lx of [24, 90, 156]) { g.fillStyle = 'rgba(255,180,58,' + (0.10 + 0.03 * Math.sin(t * 2.4 + lx)).toFixed(3) + ')'; g.beginPath(); g.moveTo(lx - 5, 171); g.lineTo(lx + 6, 171); g.lineTo(lx + 22, 215); g.lineTo(lx - 21, 215); g.closePath(); g.fill(); }

    // rotoli che scorrono nel tubo sul soffitto
    for (let i = 0; i < 6; i++) {
      const px = ((t * 22 + i * 40) % 250) - 36;
      g.drawImage(this.rollH, Math.round(px), 23);
    }
    // luci dei collari
    for (const cx of [4, 38, 72, 108, 142, 176]) rect(g, ((Math.floor(t * 2) + cx) % 3) ? P.cyan : P.cyanL, cx + 2, 25, 1, 7);

    // bocchette: preavviso luminoso prima del rilascio
    if (m.pending) for (const p of m.pending) {
      const vx = C.VENTS[p.vent], left = p.at - m.tick, pulse = Math.floor(left / 4) % 2;
      rect(g, pulse ? (p.red ? '#ff9a8c' : P.amberL) : (p.red ? P.red : P.amber), vx - 4, 48, 9, 2);
      rect(g, p.red ? 'rgba(255,90,78,.45)' : 'rgba(255,200,90,.35)', vx - 6, 46, 13, 4);
      rect(g, p.red ? '#ff9a8c' : P.amberL, vx - 2, 51 + (left % 8 > 4 ? 1 : 0), 5, 1);
      g.fillStyle = p.red ? 'rgba(255,70,60,.22)' : 'rgba(255,180,58,.18)'; g.beginPath(); g.moveTo(vx - 5, 48); g.lineTo(vx + 6, 48); g.lineTo(vx + 14, 80); g.lineTo(vx - 13, 80); g.closePath(); g.fill();
      // il rotolo si affaccia alla bocchetta
      if (left < 12) g.drawImage((p.red ? this.rollsRed : this.rolls)[1], vx - RX, 28);
    }
    // lampade fisse delle bocchette
    for (const vx of C.VENTS) rect(g, P.amber, vx - 2, 50, 5, 1);

    // punto di scarico: pad che pulsa quando il carico è pieno
    const padOn = this.unloadFlash > 0 || (m.full && Math.floor(t * 2.5) % 2);
    rect(g, padOn ? P.cyanL : P.cyan, 80, C.PLATFORM_Y - 1, 20, 2);
    if (padOn) { g.fillStyle = 'rgba(111,211,255,.20)'; g.fillRect(78, C.PLATFORM_Y - 24, 24, 24); rect(g, 'rgba(111,211,255,.5)', 78, C.PLATFORM_Y - 1, 24, 1); }
    if (this.unloadFlash > 0) {                                                       // consegna: impulso ciano sulla bocchetta
      rect(g, P.cyanL, 79, C.PLATFORM_Y + 3, 22, 1);
      g.fillStyle = 'rgba(111,211,255,' + (this.unloadFlash * 0.5).toFixed(3) + ')'; g.fillRect(76, C.PLATFORM_Y + 1, 28, 20);
    }
    for (const f of this.fx) if (f.k === 'ring') {
      const k = f.t / 0.9, w = 14 + Math.round(k * 22);
      g.strokeStyle = 'rgba(111,211,255,' + (0.8 * (1 - k)).toFixed(3) + ')'; g.lineWidth = 1;
      g.strokeRect(f.x - w / 2 + 0.5, C.PLATFORM_Y - 3 - Math.round(k * 9) + 0.5, w, 5);
    }

    // tre finestrelle sulla barra, a destra di UNLOAD: si riempiono con ogni rotolo perso (rosso preso o notizia caduta)
    for (let i = 0; i < 3; i++) {
      const wx = 108 + i * 13, wy = C.PLATFORM_Y + 2, kind = m.lostLog ? m.lostLog[i] : null, fl = this.winFlash[i] > 0 && Math.floor(this.winFlash[i] * 12) % 2;
      rect(g, kind ? (fl ? P.ivoryL : P.red) : P.brassD, wx, wy, 12, 18);
      rect(g, kind ? '#8a2a24' : P.brass, wx + 1, wy + 1, 10, 16);
      rect(g, P.navyD, wx + 2, wy + 2, 8, 14);
      rect(g, '#0a1124', wx + 2, wy + 2, 8, 1);
      if (kind) {
        g.save(); if (kind === 'drop') g.globalAlpha = 0.75;
        g.drawImage((kind === 'red' ? this.rollsRed : this.rolls)[1], wx - 2, wy + 1); g.restore();
        if (kind === 'drop') for (const [dx, dy] of [[0, 0], [4, 0], [1, 1], [3, 1], [2, 2], [1, 3], [3, 3], [0, 4], [4, 4]]) rect(g, P.red, wx + 4 + dx, wy + 6 + dy, 1, 1);
      }
    }

    // totale guadagnato: sale e svanisce dietro ai rotoli in caduta (mai sopra gli oggetti da prendere)
    for (const f of this.fx) if (f.k === 'pop') {
      const k = f.t / 1.1, tx = f.txt, w = textW(tx, 2), px = Math.round(f.x - w / 2), py = Math.round(f.y - k * 14);
      g.globalAlpha = k < 0.6 ? 1 : Math.max(0, 1 - (k - 0.6) / 0.4);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) text(g, tx, px + dx, py + dy, OL, 2);
      text(g, tx, px, py, k < 0.5 ? P.cyanL : P.ivoryL, 2);
      g.globalAlpha = 1;
    }

    // rotoli che cadono
    if (m.rolls) for (const r of m.rolls) {
      const tilt = [1, 0, 1, 2][Math.floor(r.y / 16 + r.vent) % 4];   // oscilla appena, senza roteare
      const x = Math.round(r.x) - RX, y = Math.round(r.y) - RY;
      rect(g, 'rgba(160,220,255,.4)', Math.round(r.x), y - 4, 1, 4);                 // una sola linea di movimento
      g.drawImage((r.red ? this.rollsRed : this.rolls)[tilt], x, y);
    }

    // braccio umano (stile anni 80: manica a righe, fascia al polso) che porge una notizia nel pugno, inclinata verso Faindo
    if (m.arm) {
      const a = m.arm, dir = a.side, edge = dir > 0 ? W : 0, hx = Math.round(a.x), y = C.ARM_Y;
      const len = Math.max(1, Math.abs(hx - edge));
      const OL = '#3a2018', SK = '#e8a77a', SKL = '#f6c79b', SKD = '#b8744c';
      const lean = this.rollsLean[dir > 0 ? 0 : 1];   // la cima del rotolo punta verso Faindo
      if (!a.taken && a.prog > 0.05) {
        if (Math.floor(t * 8) % 2) { g.fillStyle = 'rgba(255,217,138,.28)'; g.fillRect(hx - 9, y - 20, 18, 26); }
        g.drawImage(lean, hx - RX - dir * 1, y - 13);
      }
      // l'avambraccio sale leggermente dalla spalla al pugno; si disegna una colonna alla volta
      for (let i = 0; i <= len; i++) {
        const x = edge + (dir > 0 ? -i : i - 1), rise = Math.round((1 - i / len) * 7), top = y - 3 + rise;
        const sleeve = i < 16, band = !sleeve && i > len - 14 && i < len - 8;
        rect(g, OL, x, top - 1, 1, 8);
        if (sleeve) { const stripe = i % 6 < 2; rect(g, stripe ? '#ff5ab0' : '#7b3fa0', x, top, 1, 6); rect(g, stripe ? '#ffa0d0' : '#a56ac8', x, top, 1, 1); }
        else if (band) { rect(g, ((i - (len - 14)) % 2) ? P.cyan : P.ivoryL, x, top, 1, 6); }
        else { rect(g, SK, x, top, 1, 6); rect(g, SKL, x, top, 1, 1); rect(g, SKD, x, top + 5, 1, 1); }
      }
      // pugno: nocche, dita che avvolgono il rotolo, pollice sopra
      const fx = hx - (dir > 0 ? 2 : 4);
      rect(g, OL, fx - 1, y - 5, 8, 10); rect(g, SK, fx, y - 4, 6, 8);
      rect(g, SKL, fx, y - 4, 6, 1);
      for (const fy of [-2, 0, 2]) rect(g, SKD, fx + (dir > 0 ? 0 : 2), y + fy, 4, 1);
      rect(g, SKD, fx, y + 3, 6, 1);
      rect(g, SKL, fx + (dir > 0 ? 4 : 0), y - 5, 2, 2); rect(g, OL, fx + (dir > 0 ? 3 : 1), y - 6, 3, 1);   // pollice
    }

    // Faindo
    const st = {
      walk: m.dir, step: Math.floor(this.walkClock * 9) % 4, idle: Math.floor(t * 1.6) % 2, collect: this.collectT, deliver: this.deliverT,
      load: m.load, cap: m.cap, blink: Math.floor(t * 2.2) % 3 === 0, pulse: Math.floor(t * 5) % 2
    };
    drawFaindo(g, m.x, C.PLATFORM_Y, st);

    // redazione: rotoli che attraversano il tubo e scrivanie
    for (let i = 0; i < 3; i++) drawStaff(g, STAFF[i], t, this.react[i], this.flash[i]);
    for (const r of this.tube) if (r.t > 0) {
      const p = r.t, desk = r.desk;
      let px, py, vert = true;
      if (p < 0.4) { px = 90; py = 150 + (p / 0.4) * 36; }
      else if (desk === 1) { px = 90; py = 186 + ((p - 0.4) / 0.75) * 18; }
      else {
        const dx = desk === 0 ? -1 : 1, q = (p - 0.4) / 0.75;
        if (q < 0.55) { px = 90 + dx * (q / 0.55) * 46; py = 185; vert = false; } else { px = 90 + dx * 46; py = 185 + ((q - 0.55) / 0.45) * 17; }
      }
      if (vert) g.drawImage(this.rolls[1], Math.round(px) - RX, Math.round(py) - RY); else g.drawImage(this.rollH, Math.round(px) - 8, Math.round(py) - 5);
    }
    if (this.missFlash > 0) { g.fillStyle = 'rgba(255,60,50,' + (this.missFlash * 0.45).toFixed(3) + ')'; g.fillRect(0, C.PLATFORM_Y - 6, W, 8); }

    // effetti: scintille, punti, rotolo perso, fogli
    for (const f of this.fx) {
      const k = f.t / 0.9;
      if (f.k === 'flash') {                                                         // raccolta: piccolo lampo ciano
        const q = f.t / 0.25, r = 2 + Math.round(q * 4);
        g.globalAlpha = 1 - q;
        rect(g, P.cyanL, f.x - r, f.y - 1, r * 2 + 1, 3); rect(g, P.cyanL, f.x - 1, f.y - r, 3, r * 2 + 1); rect(g, '#ffffff', f.x - 1, f.y - 1, 3, 3);
        g.globalAlpha = 1;
      } else if (f.k === 'miss') {
        for (let i = 0; i < 5; i++) { rect(g, i % 2 ? P.red : P.ivoryL, f.x - 6 + i * 3 + Math.sin(i * 7) * f.t * 6, f.y - f.t * 22 * (0.6 + (i % 3) * 0.3), 2, 2); }
        text(g, 'X', f.x - 1, f.y - 12 - f.t * 6, P.red, 1);
      } else if (f.k === 'paper') {
        rect(g, P.ivoryL, f.x - 8 + k * 12, f.y - k * 12, 3, 2); rect(g, P.ivory, f.x + 6 - k * 10, f.y + 2 - k * 9, 3, 2);
      }
    }
    // pausa tra un livello e l'altro: campo oscurato con un lampo all'inizio
    if (m.rest > 0) {
      const k = 1 - m.rest / C.LEVEL_REST_TICKS;
      g.fillStyle = 'rgba(8,14,30,' + Math.min(0.55, 0.15 + k * 2).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
      if (k < 0.12) { g.fillStyle = 'rgba(255,250,240,' + (0.5 * (1 - k / 0.12)).toFixed(3) + ')'; g.fillRect(0, 0, W, H); }
      for (let i = 0; i < 5; i++) rect(g, i < m.lv ? P.cyanL : P.steelD, 90 - 20 + i * 8, 120, 6, 3);
    }
    g.restore();
  }
}
