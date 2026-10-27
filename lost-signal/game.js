/* =====================================================================
   FAIND LOST SIGNAL — regia del gioco
   ---------------------------------------------------------------------
   Collega il motore (sim.js), la grafica (art.js), l'audio (audio.js) e l'interfaccia HTML: schermate, pausa, comandi, barre.
   Stessa impostazione di News Rush e Signal Maze: un solo AbortController per tutti i ricevitori di eventi e un solo ciclo di
   animazione. Memorizzazione e flash vivono nel motore e scorrono solo quando il motore viene fatto avanzare: pausa,
   schede in background e schermate non li toccano e non regalano nuove accensioni.
   ===================================================================== */
import { Sim, CFG, DIRV } from './sim.js?v=20261025c';
import { Scene, CW, HUD, BAR, MIN_H, MAX_H, TS } from './art.js?v=20261027j';
import { Audio8 } from './audio.js?v=20261025c';
import { ROWS } from './levels.js?v=20261025c';
import { createBoard } from '../faind-game/board.js?v=20261024c';

const $ = (id) => document.getElementById(id);
const API = String(window.FAIND_LOST_API || '').replace(/\/+$/, '');
const LEVELS = Math.max(1, parseInt(window.FAIND_LOST_LEVELS || '50', 10) || 50);
const BEST_KEY = 'faind-lost-best';
const SAVE_KEY = 'faind-lost-save';   // partita salvata all'inizio di ogni livello: si riprende dalla schermata iniziale (non va in classifica)
const SWIPE_PX = 22, TAP_MS = 450;
const QUANTUM = 5;              // il motore avanza a passi fissi di 5 ms: il server rifà la partita con gli stessi passi
const RANKED_LEVELS = 50;       // la classifica vale solo per la partita da 50 livelli, quella che il server rifà

const ac = new AbortController();
const on = (el, ev, fn, opt) => el.addEventListener(ev, fn, Object.assign({ signal: ac.signal }, opt || {}));
const el = {
  app: $('app'), fit: $('fit'), frame: $('frame'), stage: $('stage'), cv: $('cv'), brand: $('brand'),
  score: $('hScore'), level: $('hLevel'), lives: $('hLives'), news: $('hNews'), timer: $('hTimer'), timerL: $('hTimerL'), timerV: $('hTimerV'),
  pauseBtn: $('btnPause'), live: $('liveMsg'), toast: $('toast'), hint: $('hint'), flashN: $('flashN'), btnFlash: $('btnFlash'), btnJump: $('btnJump'), memBar: $('memBar'), barMsg: $('barMsg'),
  btnLoad: $('btnLoad'), pStart: $('pStart'), pPause: $('pPause'), pOver: $('pOver'), pCont: $('pCont'), pLb: $('pLb'), pauseAuto: $('pauseAuto')
};

const board = createBoard({ api: LEVELS === RANKED_LEVELS ? API : '', game: 'lost', sessionTimeout: 8000, bestKey: BEST_KEY, signal: ac.signal, isOver: () => state === 'over' });
const scene = new Scene(el.cv);
const audio = new Audio8();
let state = 'start';            // start | running | paused | continue | over
let sim = new Sim(LEVELS);      // anteprima dietro alla schermata iniziale
let continued = false, contMs = 0, contShown = -1;   // continue: dopo l'uso la partita non è più valida per record e classifica
let acc = 0, last = 0, raf = 0, dead = false, tutorialDone = tutSeen(), memTut = '', hintStep = -1, hintT = 0, lastSec = -1;

$('btnStart').disabled = true;
Promise.race([scene.ready, new Promise((r) => setTimeout(r, 5000))]).then(() => { $('btnStart').disabled = false; });
try { if (document.fonts && document.fonts.load) document.fonts.load('8px Silkscreen'); } catch (e) {}

function setState(s) {
  state = s; el.app.setAttribute('data-state', s);
  el.pStart.hidden = s !== 'start'; el.pPause.hidden = s !== 'paused'; el.pOver.hidden = s !== 'over'; el.pCont.hidden = s !== 'continue';
  el.pauseBtn.hidden = s !== 'running'; if (s === 'start' && el.btnLoad) updateLoadBtn();
  if (document.activeElement && document.activeElement !== document.body) { try { document.activeElement.blur(); } catch (e) {} }
}

/* ------------------------------ Misure e schermo intero ------------------------------ */
function layout() {
  const cs = getComputedStyle(el.fit);
  const aw = el.fit.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = el.fit.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  // la tela è larga 352 pixel nativi; l'altezza segue lo schermo (da 612 a 780) e la griglia si ricentra
  const nh = Math.max(MIN_H, Math.min(MAX_H, Math.round((CW * ah) / Math.max(1, aw))));
  scene.setSize(nh);
  const cw = Math.max(200, Math.floor(Math.min(aw, (ah * CW) / scene.H))), ch = Math.round((cw * scene.H) / CW);
  const s = el.frame.style;
  s.setProperty('--cw', cw + 'px'); s.setProperty('--ch', ch + 'px'); s.setProperty('--fh', ch + 'px');
  document.documentElement.style.setProperty('--u', (cw / 180) + 'px');
  el.app.style.setProperty('--px', (cw / CW) + 'px');
}
function askFullscreen() {
  if (!window.matchMedia || !matchMedia('(pointer: coarse)').matches || document.fullscreenElement) return;
  const r = el.app.requestFullscreen || el.app.webkitRequestFullscreen; if (!r) return;
  try { const p = r.call(el.app, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
function leaveFullscreen() {
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (e) {}
}

/* ------------------------------ Audio ------------------------------ */
function updateSoundButtons() {
  for (const [b, i] of [[$('btnSound'), $('icoSound')], [$('btnSound2'), $('icoSound2')]]) {
    b.setAttribute('aria-pressed', String(audio.muted)); b.setAttribute('aria-label', audio.muted ? 'Sound off' : 'Sound on'); b.title = audio.muted ? 'Sound off' : 'Sound on';
    i.className = 'g-ico ' + (audio.muted ? 'g-ico--off' : 'g-ico--on');
  }
}
function toggleSound() {
  audio.unlock(); audio.setMuted(!audio.muted); updateSoundButtons();
  if (!audio.muted) { audio.sfx('click'); if (state === 'running') audio.startMusic(); } else audio.stopMusic();
}

/* ------------------------------ Partita ------------------------------ */
/** musica del livello: la prima fino al 9, la seconda dal 10 al 19, la prima dal 20 al 29 e così via ogni 10 livelli */
const trackFor = (level) => Math.floor(level / 10) % 2;
function readSave() {
  try { const o = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (o && o.level > 1 && o.level <= LEVELS && o.lives > 0) return o; } catch (e) {}
  return null;
}
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ level: sim.level, score: sim.score, lives: sim.lives, flashes: sim.flashes, news: sim.stats.news, falls: sim.stats.falls })); } catch (e) {} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
function updateLoadBtn() { const sv = readSave(); el.btnLoad.hidden = !sv; $('btnStart').textContent = sv ? 'NEW GAME' : 'START'; if (sv) el.btnLoad.textContent = 'CONTINUE · LEVEL ' + sv.level; }
function startGame(save) {
  audio.unlock(); audio.resume(); askFullscreen(); hideHint();
  continued = !!save;
  board.startSession();                       // il gettone può arrivare anche a partita iniziata: qui non c'è un seme da aspettare
  sim = new Sim(LEVELS);
  if (save) { sim.loadLevel(save.level); sim.score = save.score; sim.lives = save.lives; sim.flashes = save.flashes; sim.stats.news = save.news || 0; sim.stats.falls = save.falls || 0; sim.continues = 1; }
  sim.events.length = 0; audio.setTrack(trackFor(sim.level)); scene.vis = 1; scene.L = null; last = performance.now(); acc = 0; lastSec = -1;
  el.live.textContent = ''; updateHud(true); setState('running'); audio.startMusic();
  if (tutorialDone || sim.level !== 1) levelToast();
}
function levelToast() {
  toast('LEVEL ' + sim.level, 'REMEMBER THE PATH', true);
}
function localBest() { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) { return 0; } }
/** Ultima vita persa: per CONT_SECONDS secondi si può continuare dallo stesso livello; scaduto il tempo si chiude con il game over vero. */
const CONT_SECONDS = 10;
function offerContinue() {
  setState('continue'); audio.stopMusic(); audio.sfx('end'); hideHint(); gesture = null;
  contMs = CONT_SECONDS * 1000; contShown = -1;
  $('contInfo').textContent = 'Level ' + sim.level + ' restarts with ' + CFG.LIVES + ' lives. Flashes and newspapers are kept.';
  tickContinue(0);
  try { $('btnContinue').focus({ preventScroll: true }); } catch (e) {}
}
function tickContinue(dt) {
  contMs -= dt;
  const n = Math.max(0, Math.ceil(contMs / 1000));
  if (n !== contShown) { contShown = n; $('contNum').textContent = String(n); if (n > 0 && n <= 3 && dt) audio.sfx('tick'); }
  if (contMs <= 0) finish(false);
}
function takeContinue() {
  if (state !== 'continue' || !sim.revive()) return;
  continued = true; audio.resume(); gesture = null;
  setState('running'); audio.startMusic(); acc = 0; last = performance.now();
  handleEvents(); toast('CONTINUE', 'NO RECORD', true); updateHud(true);
}
function finish(won) {
  setState('over'); audio.stopMusic(); if (won) audio.sfx('win'); hideHint(); clearSave();
  const score = sim.score;
  $('overTitle').textContent = won ? 'YOU WIN' : 'GAME OVER';
  let best = localBest(); const isBest = !continued && score > best;
  if (isBest) { best = score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {} }
  $('rScore').textContent = String(score); $('rLevel').textContent = sim.level + '/' + LEVELS; $('rNews').textContent = String(sim.stats.news);
  $('rBestV').textContent = String(best); $('rBest').hidden = !isBest;
  $('rNote').textContent = (won ? 'You reached the newsroom on all ' + LEVELS + ' levels. ' : 'Level reached: ' + sim.level + '. ') + (continued ? 'Continued run: no record saved.' : isBest ? 'New record saved on this device.' : '');
  if (continued) board.unranked(); else board.finish(sim.log);
  setTimeout(() => { if (state === 'over' && !board.nameOpen) { try { $('btnAgain').focus({ preventScroll: true }); } catch (e) {} } }, 400);
}
function goHome(e) {
  if (e && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
  if (e) e.preventDefault();
  shutdown(); leaveFullscreen(); location.assign(el.brand.getAttribute('href'));
}
function shutdown() { dead = true; cancelAnimationFrame(raf); raf = 0; state = 'start'; audio.dispose(); ac.abort(); }

/* ------------------------------ Pausa ------------------------------ */
function pause(auto) {
  if (state !== 'running') return;
  setState('paused'); el.pauseAuto.hidden = !auto; gesture = null;
  audio.stopMusic(); if (audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend().catch(() => {});
  try { $('btnResume').focus({ preventScroll: true }); } catch (e) {}
}
function resume() {
  if (state !== 'paused') return;
  audio.resume(); setState('running'); last = performance.now(); audio.startMusic();
}
function togglePause() { if (state === 'paused') resume(); else pause(false); }

/* ------------------------------ Comandi ------------------------------ */
const canAct = () => state === 'running' && sim.phase === 'play';
// un comando rifiutato (ascensore a metà corsa o in arrivo) resta in attesa per 0,7 s di gioco: parte appena è possibile
let pend = null;
const later = (fn) => { if (!fn() && sim.phase === 'play') pend = { fn, until: sim.clock + 700 }; else pend = null; };
function doStep(d) { if (canAct()) { later(() => sim.step(d)); noteAction('step'); } }
function doTurn(d) { if (canAct()) { pend = null; sim.turn(d); noteAction('turn'); } }
function doJump() { if (canAct()) { later(() => sim.jump()); noteAction('jump'); } }
function doFlash() { if (state === 'running') { sim.flash(); noteAction('flash'); } }

// scorrimento: un gesto = un passo. Tocco breve: orienta Faindo verso il lato toccato, senza spostarlo.
let gesture = null;
on(el.cv, 'pointerdown', (e) => {
  e.preventDefault(); audio.resume();
  gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), fired: false };
  try { el.cv.setPointerCapture(e.pointerId); } catch (er) {}
});
on(el.cv, 'pointermove', (e) => {
  if (!gesture || e.pointerId !== gesture.id || gesture.fired) return;
  const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
  if (Math.hypot(dx, dy) < SWIPE_PX) return;
  gesture.fired = true;                              // un solo passo per gesto, anche se il dito continua
  doStep(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
});
const gEnd = (e) => {
  if (!gesture || e.pointerId !== gesture.id) return;
  const g = gesture; gesture = null;
  if (e.type !== 'pointerup' || g.fired || performance.now() - g.t > TAP_MS) return;
  // tocco: lato in cui cade rispetto a Faindo (asse dominante)
  const rect = el.cv.getBoundingClientRect(), k = rect.width / CW;
  const fx = rect.left + (scene.cellX(0) + sim.pos.c * TS + TS / 2) * k, fy = rect.top + (scene.cellY(0) + sim.pos.r * TS + TS / 2 - 4) * k;
  const dx = e.clientX - fx, dy = e.clientY - fy;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < TS * 0.45 * k) return;     // il tocco è su Faindo: niente
  doTurn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
};
on(el.cv, 'pointerup', gEnd); on(el.cv, 'pointercancel', gEnd);
on(el.cv, 'contextmenu', (e) => e.preventDefault());

// pulsanti: scattano al tocco; chi usa la tastiera arriva dal clic
function press(btn, fn) {
  on(btn, 'pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio.resume(); fn(); });
  on(btn, 'click', (e) => { if (e.detail === 0) fn(); });
}
press(el.btnFlash, doFlash); press(el.btnJump, doJump);

const CODES = { ArrowUp: 0, KeyW: 0, ArrowRight: 1, KeyD: 1, ArrowDown: 2, KeyS: 2, ArrowLeft: 3, KeyA: 3 };
on(document, 'keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key, code = e.code;
  if (k === 'Escape') {
    if (board.escape()) { e.preventDefault(); return; }
    if (state === 'running') { pause(false); e.preventDefault(); } else if (state === 'paused') { resume(); e.preventDefault(); }
    return;
  }
  if (k === 'p' || k === 'P') { if (state === 'running' || state === 'paused') { togglePause(); e.preventDefault(); } return; }
  if ((k === 'Enter' || k === ' ') && state === 'continue' && document.activeElement !== $('btnEnd')) { takeContinue(); e.preventDefault(); return; }
  const onBtn = document.activeElement && document.activeElement !== document.body && /^(BUTTON|A)$/.test(document.activeElement.tagName);
  if (code in CODES) { if (state === 'running') { e.preventDefault(); if (!e.repeat) { if (e.shiftKey) doTurn(CODES[code]); else doStep(CODES[code]); } } return; }
  if (state === 'running' && !onBtn) {
    if (k === ' ' || code === 'Space') { e.preventDefault(); if (!e.repeat) doJump(); return; }
    if (k === 'f' || k === 'F') { e.preventDefault(); if (!e.repeat) doFlash(); return; }
  }
  if ((k === 'Enter' || k === ' ') && state === 'start' && el.pLb.hidden && !$('btnStart').disabled && document.activeElement === document.body) { startGame(); e.preventDefault(); }
});
on(document, 'pointerdown', () => { if (audio.ctx && state !== 'paused') audio.resume(); }, { capture: true });
on(window, 'blur', () => { gesture = null; });
on(document, 'visibilitychange', () => { gesture = null; if (document.hidden) pause(true); else last = performance.now(); });
on(window, 'pagehide', () => { audio.stopMusic(); pause(true); });
on(document, 'touchmove', (e) => { if (!e.target.closest || !e.target.closest('.g-panel')) e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange']) on(document, ev, (e) => e.preventDefault());
on(window, 'resize', layout); on(window, 'orientationchange', () => setTimeout(layout, 120));
if (window.visualViewport) on(window.visualViewport, 'resize', layout);
on(document, 'fullscreenchange', () => setTimeout(layout, 60));

/* ------------------------------ Dimostrazione nel primo livello ------------------------------ */
const TUT_KEY = 'faind-lost-tutorial-v1';
function tutSeen() { try { return localStorage.getItem(TUT_KEY) === '1'; } catch (e) { return false; } }
function tutFinish() { tutorialDone = true; try { localStorage.setItem(TUT_KEY, '1'); } catch (e) {} }
const HINTS = [
  { kind: 'swipe', dir: 0, text: 'SWIPE TO WALK' },
  { kind: 'tap', dir: 1, text: 'TAP TO TURN' },
  { kind: 'jump', text: 'JUMP THE GAPS' },
  { kind: 'flash', text: 'FLASH = PEEK' }
];
const HINT_MS = 1700;
function showHint(i) {
  hintStep = i; hintT = 0; memTut = ''; const h = HINTS[i];
  el.hint.textContent = ''; const a = document.createElement('b'); a.textContent = h.text; el.hint.appendChild(a); el.hint.hidden = false;
  el.hint.className = 'l-hint' + (h.kind === 'jump' || h.kind === 'flash' ? ' l-hint--key l-hint--' + h.kind : '');
  el.btnJump.classList.toggle('is-hint', h.kind === 'jump'); el.btnFlash.classList.toggle('is-hint', h.kind === 'flash');
  scene.hint = h.kind === 'swipe' || h.kind === 'tap' ? { kind: h.kind, dir: h.dir, t0: scene.clock } : null;
}
function hideHint() { hintStep = -1; memTut = ''; el.hint.hidden = true; el.btnJump.classList.remove('is-hint'); el.btnFlash.classList.remove('is-hint'); scene.hint = null; }
function tickHint(dt) {
  if (hintStep < 0) return;
  hintT += dt * 1000;
  if (hintT >= HINT_MS) { if (hintStep + 1 < HINTS.length) showHint(hintStep + 1); else { hideHint(); tutFinish(); } }
}
/** Primo livello, durante la memorizzazione: solo il numero grande al centro. */
function memNum(x) {
  memTut = 'n' + x; el.hint.textContent = '';
  const n = document.createElement('i'); n.textContent = String(x); el.hint.appendChild(n);
  el.hint.className = 'l-hint l-hint--num'; el.hint.hidden = false;
}
function noteAction() { /* le dimostrazioni non bloccano nulla: restano finché non finiscono */ }

/* ------------------------------ Barre ------------------------------ */
const hc = {};
function setText(n, key, v) { if (hc[key] !== v) { hc[key] = v; n.textContent = v; } }
function updateHud(force) {
  const s = sim;
  setText(el.score, 'score', String(s.score).padStart(5, '0'));
  setText(el.level, 'lv', Math.min(s.level, LEVELS) + '/' + LEVELS);
  setText(el.news, 'news', s.collected + '/3');
  if (hc.lives !== s.lives || force) {
    hc.lives = s.lives; el.lives.textContent = '';
    for (let i = 0; i < Math.max(CFG.LIVES, s.lives); i++) { const d = document.createElement('i'); d.className = 'l-life' + (i < s.lives ? '' : ' is-lost'); el.lives.appendChild(d); }
  }
  setText(el.flashN, 'fl', '×' + s.flashes);
  const flashOk = s.flashes > 0 && s.flashMs <= 0 && s.reviveMs <= 0 && (s.phase === 'play' || s.phase === 'step' || s.phase === 'jump');
  if (hc.fo !== flashOk) { hc.fo = flashOk; el.btnFlash.classList.toggle('is-off', !flashOk); el.btnFlash.setAttribute('aria-disabled', String(!flashOk)); }
  const jumpOk = s.phase === 'play' || s.phase === 'step';
  if (hc.jo !== jumpOk) { hc.jo = jumpOk; el.btnJump.classList.toggle('is-off', !jumpOk); el.btnJump.setAttribute('aria-disabled', String(!jumpOk)); }
  // piccolo contatore: secondi di memorizzazione o di flash rimasti (non è un limite di tempo di partita)
  let tl = '', tv = '';
  if (s.phase === 'memorize') { tl = 'MEMORIZE'; tv = String(Math.ceil(s.memMs / 1000)); }
  else if (s.flashMs > 0 || s.reviveMs > 0) { tl = 'LIT'; tv = String(Math.ceil(Math.max(s.flashMs, s.reviveMs) / 1000)); }
  if (hc.tl !== tl + tv) { hc.tl = tl + tv; el.timer.hidden = !tl; el.timerL.textContent = tl; el.timerV.textContent = tv; el.timer.classList.toggle('is-lit', tl === 'LIT'); }
  const mem = s.phase === 'memorize';
  if (mem && s.level === 1 && !tutorialDone && state === 'running') { const x = Math.ceil(s.memMs / 1000); if (memTut !== 'n' + x) memNum(x); }
  else if (memTut) hideHint();
  if (hc.mem !== mem) { hc.mem = mem; el.barMsg.classList.toggle('is-mem', mem); }
  if (mem) el.memBar.style.setProperty('--w', (s.memMs / CFG.MEMORIZE_MS * 100).toFixed(1) + '%');
}
function toast(title, sub, big) {
  el.toast.hidden = true; el.toast.classList.toggle('g-toast--lv', !!big); el.toast.textContent = '';
  const b = document.createElement('div'); b.textContent = title; el.toast.appendChild(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.toast.appendChild(s); }
  void el.toast.offsetWidth; el.toast.hidden = false;
  el.toast.addEventListener('animationend', () => { el.toast.hidden = true; }, { once: true });
}

/* ------------------------------ Ciclo principale ------------------------------ */
function handleEvents() {
  for (const e of sim.events) {
    switch (e.type) {
      case 'step': audio.sfx('step', sim.stepFoot); break;
      case 'turn': audio.sfx('turn'); break;
      case 'warn': audio.sfx('turn'); el.live.textContent = 'Edge ahead. Repeat the move to step off.'; break;
      case 'jump': audio.sfx('jump'); break;
      case 'land': audio.sfx('land'); break;
      case 'news': audio.sfx('news'); el.live.textContent = 'Newspaper ' + e.n + ' of 3'; scene.float('+' + e.pts, scene.cellX(e.c) + TS / 2, scene.cellY(e.r) + 2, '#ffd21f'); break;
      case 'bonusFlash': audio.sfx('bonus'); el.live.textContent = 'Bonus flash. ' + e.left + ' flashes'; scene.float('+1 FLASH', CW / 2, scene.cellY(ROWS - 2), '#6fe9ff', true); break;
      case 'flashPick': audio.sfx('bonus'); el.live.textContent = 'Flash collected. ' + e.left + ' flashes'; scene.float('+1 FLASH', scene.cellX(e.c) + TS / 2, scene.cellY(e.r) + 2, '#6fe9ff'); break;
      case 'lifePick': audio.sfx('news'); el.live.textContent = 'Extra life. ' + e.lives + ' lives'; scene.float('+1 LIFE', scene.cellX(e.c) + TS / 2, scene.cellY(e.r) + 2, '#ff8fb0'); break;
      case 'rockWarn': audio.sfx('rockWarn'); break;
      case 'hit': audio.sfx('hit'); break;
      case 'flash': audio.sfx('flash'); el.live.textContent = 'Flash. ' + e.left + ' left'; break;
      case 'flashEnd': audio.sfx('flashEnd'); break;
      case 'fall': audio.sfx('fall'); break;
      case 'life': audio.sfx('life'); el.live.textContent = e.lives > 0 ? (e.cause === 'rock' ? 'A rock hit you. ' : 'You fell. ') + e.lives + (e.lives === 1 ? ' life left' : ' lives left') : (e.cause === 'rock' ? 'A rock hit you. ' : 'You fell. ') + 'No lives left'; break;
      case 'arrive': audio.sfx('door'); break;
      case 'memorizeEnd': audio.sfx('ready'); el.live.textContent = 'The path is hidden. Go.'; if (sim.level === 1 && !tutorialDone) { hideHint(); showHint(0); scene.flicker = scene.clock; } break;
      case 'levelDone': { audio.sfx('clear'); const pts = CFG.SCORE.ARRIVE + CFG.SCORE.NEWS * e.news; toast('LEVEL ' + e.level + ' CLEAR', '+' + pts + (e.news ? '  ·  ' + e.news + '/3 NEWSPAPERS' : ''), true); break; }
      case 'level': if (e.level > 1 && state === 'running') { writeSave(); audio.setTrack(trackFor(e.level)); hideHint(); levelToast(); } else if (e.level > 1) hideHint(); break;
      case 'over': offerContinue(); break;
      case 'won': finish(true); break;
    }
  }
  sim.events.length = 0;
}
function frame(now) {
  if (dead) return;
  raf = requestAnimationFrame(frame);
  const dt = Math.min(100, now - (last || now)); last = now;
  if (state === 'running') {
    acc += dt; let n = 0;
    while (acc >= QUANTUM && n < 30) { sim.update(QUANTUM); acc -= QUANTUM; n++; if (pend) { if (sim.phase !== 'play' || sim.clock > pend.until || pend.fn()) pend = null; } }
    if (n >= 30) acc = 0;
    handleEvents();
    if (sim.phase === 'memorize') { const sec = Math.ceil(sim.memMs / 1000); if (sec !== lastSec) { lastSec = sec; if (sec <= 3 && sec > 0) audio.sfx('tick'); } } else lastSec = -1;
    if (state === 'running') { tickHint(dt / 1000); updateHud(); }
  }
  if (state === 'continue') tickContinue(dt);
  if (state !== 'paused') scene.update(dt / 1000);
  scene.draw(sim, state === 'paused');
}

/* ------------------------------ Condivisione ------------------------------ */
async function shareScore() {
  const url = new URL('./', location.href).href, text = 'I scored ' + sim.score + ' points in FAIND Lost Signal. Can you remember the path?', note = $('shareNote');
  if (navigator.share) { try { await navigator.share({ title: 'FAIND Lost Signal', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  let ok = false;
  try { await navigator.clipboard.writeText(text + ' ' + url); ok = true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text + ' ' + url; ta.style.cssText = 'position:fixed;opacity:0;left:-999px'; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove();
  }
  note.hidden = false; note.textContent = ok ? 'Link copied: ' + url : url;
}

/* ------------------------------ Collegamenti ------------------------------ */
on(el.brand, 'click', goHome);
on($('btnStart'), 'click', () => startGame());
on(el.btnLoad, 'click', () => { const sv = readSave(); if (sv) startGame(sv); });
on($('btnSound'), 'click', toggleSound); on($('btnSound2'), 'click', toggleSound);
on(el.pauseBtn, 'click', () => pause(false));
on($('btnResume'), 'click', resume);
on($('btnRestart'), 'click', () => { audio.resume(); setState('start'); startGame(); });
on($('btnHome'), 'click', () => goHome());
on($('btnContinue'), 'click', takeContinue);
on($('btnEnd'), 'click', () => { if (state === 'continue') finish(false); });
on($('btnAgain'), 'click', () => startGame());
on($('btnShare'), 'click', shareScore);
on($('btnNews'), 'click', () => { shutdown(); }); on($('btnMore'), 'click', () => { shutdown(); }); on($('btnGames'), 'click', () => { shutdown(); });

el.brand.setAttribute('title', 'Back to FAIND home'); el.brand.setAttribute('aria-label', 'FAIND – back to the home page');
updateSoundButtons(); updateLoadBtn(); layout(); updateHud(true);
requestAnimationFrame((n) => { last = n; raf = requestAnimationFrame(frame); });

// per le prove automatiche e la diagnosi
window.__faindLost = { get state() { return state; }, get sim() { return sim; }, get scene() { return scene; }, get audio() { return audio; }, shutdown, config: CFG, step: doStep, turn: doTurn, jump: doJump, flash: doFlash };
