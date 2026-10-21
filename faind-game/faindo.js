/* =====================================================================
   FAIND GAME — News Rush: lo sprite di Faindo (visto da dietro)
   ---------------------------------------------------------------------
   Griglia logica di 48 × 64 pixel su sfondo trasparente, disegnata in
   codice con rettangoli (nessuna immagine). Si disegna su una tela propria
   di 48 × 64 che il browser ingrandisce senza sfocature (imageSmoothingEnabled
   = false, image-rendering: pixelated): i piedi poggiano sul bordo inferiore,
   quindi l'ancoraggio è identico in tutti i fotogrammi. Il disegno è separato
   dalla collisione: la zona di raccolta resta quella del motore (sim.js).

   Palette (10 colori): avorio, luce avorio, ombra sabbia, ottone, ottone chiaro,
   blu scuro, blu scuro chiaro (solo per i bordi luminosi dei giunti), contorno,
   ciano, ciano chiaro.
   ===================================================================== */
export const SPRITE_W = 48, SPRITE_H = 64;

const K = {
  OL: '#0A1022', IV: '#F3E9D2', IVL: '#FFF6DF', SD: '#C7AC79', BR: '#A77B37', BRL: '#D5AE59',
  NV: '#15213A', NVL: '#2A4170', CY: '#1E9BD7', CYL: '#7DE3FA'
};

const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

/** Guscio tondeggiante a gradini: semilarghezza per riga, contorno scuro, luce a sinistra/in alto, ombra sabbia a destra/in basso. */
function shell(g, cx, top, hws, base, hi, sd) {
  const n = hws.length;
  for (let r = 0; r < n; r++) R(g, cx - hws[r] - 1, top + r, hws[r] * 2 + 3, 1, K.OL);
  R(g, cx - hws[0], top - 1, hws[0] * 2 + 1, 1, K.OL); R(g, cx - hws[n - 1], top + n, hws[n - 1] * 2 + 1, 1, K.OL);
  for (let r = 0; r < n; r++) {
    const hw = hws[r], x0 = cx - hw, w = hw * 2 + 1;
    R(g, x0, top + r, w, 1, base);
    if (r < n - 3) R(g, x0, top + r, 1, 1, hi);
    R(g, cx + hw - 1, top + r, 2, 1, sd);
    if (r === 0) R(g, x0 + 1, top, Math.max(1, w - 5), 1, hi);
    if (r === 1) R(g, x0 + 2, top + 1, Math.max(1, w - 8), 1, hi);
    if (r >= n - 2) R(g, x0 + (r === n - 1 ? 0 : 2), top + r, w - (r === n - 1 ? 0 : 2), 1, sd);
  }
}
/** Rettangolo con contorno e una riga chiara a sinistra / scura a destra. */
function slab(g, x, y, w, h, base, hi, sd) {
  R(g, x - 1, y - 1, w + 2, h + 2, K.OL); R(g, x, y, w, h, base);
  if (hi) R(g, x, y, 1, h, hi);
  if (sd && w > 2) R(g, x + w - 1, y, 1, h, sd);
}

const HEAD = [8, 11, 12, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 12, 10, 8, 6];   // 21 righe, 29 pixel nel punto più largo
const TORSO = [7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 8, 7];                                     // 14 righe, 19 pixel
const FOOT = [4, 6, 6, 6, 6];                                                                  // 5 righe, 13 pixel

/** Un piede (centro cx), alzato di lift pixel. */
function foot(g, cx, lift) {
  const top = 58 - lift;
  shell(g, cx, top, FOOT, K.IV, K.IVL, K.SD);
  R(g, cx - 6, top + 4, 13, 1, K.NV);                    // suola blu scuro
  R(g, cx - 1, top + 1, 3, 1, K.CY);                     // piccolo accento ciano
}
/** Una gamba: ginocchio blu scuro con barretta in ottone, protezione avorio, caviglia in ottone. */
function leg(g, x, lift) {
  const kb = 52 - lift;
  slab(g, x, 50, 6, kb - 50 + 1, K.NV, K.NVL, null); R(g, x + 1, 51, 4, 1, K.BR);
  slab(g, x, 53 - lift, 6, 4, K.IV, K.IVL, K.SD);
  R(g, x, 57 - lift, 6, 1, K.BR);
}
/** Un braccio (side -1 sinistro, +1 destro). o = {up: 0|1|2 braccio sollevato, dy: oscillazione dell'avambraccio, dx: spostamento orizzontale}. */
function arm(g, side, o) {
  const mx = (x, w) => side < 0 ? x : 47 - x - w + 1;   // il braccio destro è lo specchio del sinistro
  const dx = -(o.dx || 0) * side;   // dx > 0: verso il centro
  const px = (x, w) => mx(x, w) + dx;
  // spalla avorio
  slab(g, px(10, 5), 33, 5, 5, K.IV, K.IVL, K.SD);
  if (o.up) {                                            // sollevato: gomito a lato, avambraccio verso l'alto
    const ex = o.up === 1 ? [8, 4] : [6, 4], ey = o.up === 1 ? 37 : 35;
    slab(g, px(ex[0], 4), ey, 4, 3, K.NV, K.NVL, null); R(g, px(ex[0] + 1, 2), ey + 1, 2, 1, K.BR);
    slab(g, px(ex[0] - 1, 5), ey - 6, 5, 6, K.IV, K.IVL, K.SD);
    slab(g, px(ex[0] - 1, 4), ey - 9, 4, 3, K.NV, K.NVL, null);
    return;
  }
  const dy = o.dy || 0, ey = 38 + dy;
  if (dy > 0) R(g, px(10, 4), 38, 4, dy, K.IV);          // il braccio si allunga
  slab(g, px(9, 4), ey, 4, 3, K.NV, K.NVL, null); R(g, px(10, 2), ey + 1, 2, 1, K.BR);
  slab(g, px(8, 5), ey + 3, 5, 6, K.IV, K.IVL, K.SD);
  slab(g, px(7, 4), ey + 9, 4, 3, K.NV, K.NVL, null);
}

/**
 * Disegna un fotogramma. p = {bob (0 | -1: il corpo sale di un pixel), lean (-1|0|1: la testa si inclina di un pixel),
 * lift: [sx, dx] (piedi alzati di 0..2 px), armL, armR (vedi arm), blink, lamp (0 spenta, 1 accesa, 2 carico pieno)}.
 */
export function drawFaindoSprite(g, p) {
  g.clearRect(0, 0, SPRITE_W, SPRITE_H);
  const ub = p.bob || 0, lean = p.lean || 0, cx = 24;
  // piedi e gambe (restano a terra, solo il piede in appoggio al passo cambia)
  foot(g, 15 + (p.lift[0] ? p.lean : 0), p.lift[0]); foot(g, 33 + (p.lift[1] ? p.lean : 0), p.lift[1]);
  leg(g, 15, p.lift[0]); leg(g, 27, p.lift[1]);
  // bacino blu scuro con i giunti in ottone
  slab(g, 15, 47, 18, 3, K.NV, null, null); R(g, 15, 47, 18, 1, K.NVL);
  R(g, 17, 48, 2, 2, K.BR); R(g, 17, 48, 1, 1, K.BRL); R(g, 29, 48, 2, 2, K.BR); R(g, 29, 48, 1, 1, K.BRL);
  // busto compatto, più stretto della testa
  shell(g, cx, 33 + ub, TORSO, K.IV, K.IVL, K.SD);
  // pannello di manutenzione: copertura avorio bordata di sabbia, due rivetti, una spia ciano
  const py = 36 + ub;
  R(g, cx - 6, py, 13, 9, K.SD); R(g, cx - 5, py + 1, 11, 7, K.IVL);
  R(g, cx - 5, py + 1, 2, 2, K.BR); R(g, cx + 4, py + 1, 2, 2, K.BR); R(g, cx - 5, py + 1, 1, 1, K.BRL); R(g, cx + 4, py + 1, 1, 1, K.BRL);
  R(g, cx - 4, py + 4, 9, 1, K.SD);
  R(g, cx - 1, py + 5, 3, 2, p.lamp === 2 ? K.CYL : K.CY); R(g, cx - 1, py + 5, 3, 1, K.CYL);
  // braccia corte, appena aperte
  g.save(); g.translate(0, ub);
  arm(g, -1, p.armL); arm(g, 1, p.armR);
  g.restore();
  // collo corto blu scuro con il raccordo in ottone
  R(g, 19, 30 + ub, 10, 1, K.OL); R(g, 20, 30 + ub, 8, 1, K.BR); R(g, 20, 31 + ub, 8, 2, K.NV); R(g, 19, 31 + ub, 1, 2, K.OL); R(g, 28, 31 + ub, 1, 2, K.OL);
  // orecchie in ottone con un inserto ciano su ciascun lato (dietro alla testa)
  const hx = cx + lean, hy = ub;
  for (const s of [-1, 1]) {
    const ex = s < 0 ? hx - 19 : hx + 14;
    R(g, ex - 1, 13 + hy, 8, 13, K.OL); R(g, ex, 14 + hy, 6, 11, K.BR);
    R(g, s < 0 ? ex : ex + 5, 14 + hy, 1, 11, s < 0 ? K.BRL : K.NV);
    R(g, ex, 14 + hy, 6, 1, K.BRL);
    R(g, s < 0 ? ex + 1 : ex + 3, 17 + hy, 2, 6, K.CY); R(g, s < 0 ? ex + 1 : ex + 3, 17 + hy, 2, 1, K.CYL);
  }
  // testa larga e schiacciata: guscio avorio, una giuntura verticale e due rivetti, niente viso
  shell(g, hx, 8 + hy, HEAD, K.IV, K.IVL, K.SD);
  R(g, hx, 11 + hy, 1, 15, K.SD);
  R(g, hx - 8, 15 + hy, 2, 2, K.BR); R(g, hx + 7, 15 + hy, 2, 2, K.BR); R(g, hx - 8, 15 + hy, 1, 1, K.BRL); R(g, hx + 7, 15 + hy, 1, 1, K.BRL);
  // antenna corta, decentrata, con la punta rettangolare ciano
  R(g, hx - 8, 5 + hy, 1, 3, K.OL); R(g, hx - 6, 5 + hy, 1, 3, K.OL); R(g, hx - 7, 4 + hy, 1, 4, K.BRL);
  R(g, hx - 9, hy, 5, 5, K.OL); R(g, hx - 8, 1 + hy, 3, 3, p.blink ? K.CYL : K.CY); R(g, hx - 8, 1 + hy, 1, 1, K.IVL);
}

/** Traduce lo stato di gioco in un fotogramma. st: {walk(-1|0|1), step(0..3), idle, collect(s), deliver(s), load, cap, blink, pulse}. */
export function poseFor(st) {
  const p = { bob: 0, lean: 0, lift: [0, 0], armL: { dy: 0 }, armR: { dy: 0 }, blink: !!st.blink, lamp: st.load > 0 ? 1 : 0 };
  if (st.load >= st.cap && st.load > 0 && st.pulse) p.lamp = 2;
  if (st.collect > 0) {                                              // raccolta: due fotogrammi, le braccia si sollevano
    const hi = st.collect > 0.14;
    p.armL = { up: hi ? 2 : 1 }; p.armR = { up: hi ? 2 : 1 }; p.bob = -1; p.blink = true;
    return p;
  }
  if (st.deliver > 0) {                                              // scarico: le braccia vanno verso il tubo centrale, poi tornano
    const inward = st.deliver > 0.18;
    p.armL = { dx: inward ? 3 : 1, dy: inward ? 2 : 0 }; p.armR = { dx: inward ? 3 : 1, dy: inward ? 2 : 0 };
    p.bob = inward ? 0 : -1; p.blink = true; p.lamp = 2;
    return p;
  }
  if (st.walk) {                                                     // spostamento: quattro fotogrammi, piedi e braccia alternati
    const s = st.step % 4;
    p.lean = st.walk;
    p.lift = [s === 1 ? 2 : 0, s === 3 ? 2 : 0];
    p.bob = s % 2 ? -1 : 0;
    const sw = s === 1 ? 2 : s === 3 ? -2 : 0;
    p.armL = { dy: sw }; p.armR = { dy: -sw };
    return p;
  }
  p.bob = st.idle ? -1 : 0;                                          // riposo: due fotogrammi, il corpo respira di un pixel
  return p;
}

/** Chiave del fotogramma: si ridisegna la tela solo quando cambia. */
export function poseKey(p) {
  return [p.bob, p.lean, p.lift[0], p.lift[1], p.armL.up || 0, p.armL.dy || 0, p.armL.dx || 0, p.armR.up || 0, p.armR.dy || 0, p.armR.dx || 0, p.blink ? 1 : 0, p.lamp].join(',');
}
