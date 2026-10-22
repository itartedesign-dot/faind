/* =====================================================================
   FAIND SIGNAL MAZE — regia del gioco
   ---------------------------------------------------------------------
   Collega il motore (sim.js), la grafica (art.js), l'audio (audio.js) e l'interfaccia HTML: schermate, pausa, comandi,
   barra superiore. Stessa impostazione di News Rush: un solo AbortController per tutti i ricevitori di eventi e un solo
   ciclo di animazione. Il tempo di 9 minuti vive nel motore e scorre solo quando il motore viene fatto avanzare:
   pausa, cambio livello, scheda in background e conto alla rovescia non lo toccano.
   ===================================================================== */
import { Sim, CONFIG as C } from './sim.js?v=20261022c';
import { Scene, CW, CH } from './art.js?v=20261022c';
import { Audio8 } from './audio.js?v=20261022c';
import { LEVELS } from './maze.js?v=20261022c';

const $ = (id) => document.getElementById(id);
const API = String(window.FAIND_MAZE_API || '').replace(/\/+$/, '');
const STEP_MS = 1000 / C.TPS, COUNT_MS = 700;
const BEST_KEY = 'faind-maze-best';
const DIRV = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const NAMES = ['ORANGE', 'YELLOW', 'CYAN'];

const ac = new AbortController();
const on = (el, ev, fn, opt) => el.addEventListener(ev, fn, Object.assign({ signal: ac.signal }, opt || {}));
const el = {
  app: $('app'), fit: $('fit'), frame: $('frame'), stage: $('stage'), cv: $('cv'), brand: $('brand'), pad: $('pad'),
  score: $('hScore'), level: $('hLevel'), time: $('hTime'), timeCell: $('hTimeCell'), lives: $('hLives'),
  pauseBtn: $('btnPause'), live: $('liveMsg'), toast: $('toast'), count: $('count'),
  pStart: $('pStart'), pPause: $('pPause'), pOver: $('pOver'), pLb: $('pLb'), pauseAuto: $('pauseAuto'), controls: $('controls')
};
const chips = [...document.querySelectorAll('.m-chip')];

const scene = new Scene(el.cv);
const audio = new Audio8();
let state = 'start';            // start | countdown | playing | between | paused | over
let pausedFrom = null;
let sim = new Sim(1);           // anteprima dietro alla schermata iniziale
scene.setLevel(sim.L);
let cdMs = 0, cdShown = -1, betweenMs = 0, betweenFor = 0;
let acc = 0, last = 0, raf = 0, dead = false, lbOpener = null, lastTick = -1;

$('btnStart').disabled = true;
Promise.race([scene.ready, new Promise((r) => setTimeout(r, 5000))]).then(() => { $('btnStart').disabled = false; });
// il carattere pixel serve alla barra: lo si carica subito (la pagina non dipende da altro)
try { if (document.fonts && document.fonts.load) document.fonts.load('8px Silkscreen'); } catch (e) {}

function setState(s) {
  state = s; el.app.setAttribute('data-state', s);
  el.pStart.hidden = s !== 'start'; el.pPause.hidden = s !== 'paused'; el.pOver.hidden = s !== 'over';
  el.pauseBtn.hidden = !(s === 'playing' || s === 'countdown' || s === 'between');
  if (s !== 'countdown') el.count.hidden = true;
  if (document.activeElement && document.activeElement !== document.body) { try { document.activeElement.blur(); } catch (e) {} }
}

/* ------------------------------ Misure e schermo intero ------------------------------ */
function layout() {
  const cs = getComputedStyle(el.fit);
  const aw = el.fit.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = el.fit.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ctrlMin = Math.max(150, ah * 0.24);
  const cw = Math.max(200, Math.floor(Math.min(aw, ((ah - ctrlMin) * CW) / CH)));
  const ch = Math.round((cw * CH) / CW);
  const fh = Math.min(ah, ch + 340);
  const ctrlH = fh - ch;
  const s = el.frame.style;
  s.setProperty('--cw', cw + 'px'); s.setProperty('--ch', ch + 'px'); s.setProperty('--fh', fh + 'px');
  s.setProperty('--pad', Math.max(96, Math.min(ctrlH - 34, cw * 0.62, 230)) + 'px');
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
  if (!audio.muted) { audio.sfx('click'); if (state === 'playing') audio.startMusic(); } else audio.stopMusic();
}

/* ------------------------------ Partita ------------------------------ */
function randomSeed() { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] | 0; } catch (e) { return (Math.random() * 4294967296) | 0; } }
function startGame() {
  audio.unlock(); audio.resume(); askFullscreen(); releaseInputs();
  sim = new Sim(randomSeed()); scene.setLevel(sim.L); scene.fx = []; acc = 0; lastTick = -1;
  cdMs = 0; cdShown = -1; el.live.textContent = '';
  updateHud(true); setState('countdown');
}
function beginPlay() { setState('playing'); audio.startMusic(); showLevelToast(1); updateHud(true); }

function showLevelToast(n) {
  const sub = n === 1 ? 'COLLECT FREELY' : n === C.FREE_LEVELS + 1 ? 'ONE COLOUR AT A TIME' : '';
  toast('LEVEL ' + n, sub, true);
}

function localBest() { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) { return 0; } }
function finish() {
  const won = sim.won;
  setState('over'); audio.stopMusic(); audio.sfx(won ? 'win' : 'end'); releaseInputs();
  const score = sim.score;
  $('overTitle').textContent = won ? 'YOU WIN' : sim.reason === 'lives' ? 'GAME OVER' : 'TIME UP';
  let best = localBest(); const isBest = score > best;
  if (isBest) { best = score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {} }
  $('rScore').textContent = String(score); $('rLevel').textContent = sim.level + '/' + LEVELS;
  $('rDel').textContent = String(sim.stats.delivered); $('rBestV').textContent = String(best); $('rBest').hidden = !isBest;
  $('rNote').textContent = (won ? 'All 15 levels done, +' + sim.bonus + ' time bonus. ' : '') + (isBest ? 'New record saved on this device. ' : '') + 'The online leaderboard is not available yet.';
  setTimeout(() => { if (state === 'over') { try { $('btnAgain').focus({ preventScroll: true }); } catch (e) {} } }, 400);
}
function goHome(e) {
  if (e && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
  if (e) e.preventDefault();
  shutdown(); leaveFullscreen(); location.assign(el.brand.getAttribute('href'));
}
function shutdown() { dead = true; cancelAnimationFrame(raf); raf = 0; state = 'start'; audio.dispose(); ac.abort(); }

/* ------------------------------ Pausa ------------------------------ */
function pause(auto) {
  if (state !== 'playing' && state !== 'countdown' && state !== 'between') return;
  pausedFrom = state; releaseInputs(); setState('paused'); el.pauseAuto.hidden = !auto;
  audio.stopMusic(); if (audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend().catch(() => {});
  try { $('btnResume').focus({ preventScroll: true }); } catch (e) {}
}
function resume() {
  if (state !== 'paused') return;
  audio.resume(); setState(pausedFrom || 'playing'); if (pausedFrom === 'countdown') el.count.hidden = false;
  last = performance.now(); acc = 0; if (state === 'playing' || state === 'between') audio.startMusic();
}
function togglePause() { if (state === 'paused') resume(); else pause(false); }

/* ------------------------------ Comandi ------------------------------ */
let padDir = -1, keyDir = -1;
function send(d) { if (sim && state === 'playing') sim.input(DIRV[d]); }
function releaseInputs() {
  padDir = -1; keyDir = -1; el.pad.querySelectorAll('.is-down').forEach((b) => b.classList.remove('is-down'));
  if (sim && sim.phase === 'play') sim.input(null);
}
function setPad(d) {
  if (d === padDir) return; padDir = d;
  el.pad.querySelectorAll('.m-arrow').forEach((b) => b.classList.toggle('is-down', +b.dataset.dir === d));
  if (d >= 0) send(d); else if (sim) sim.input(null);
}
function dirFromPointer(e) {
  const r = el.pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < r.width * 0.14) return -1;   // al centro della croce: ferma
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 1) : (dy > 0 ? 2 : 3);
}
let padId = null;
on(el.pad, 'pointerdown', (e) => { e.preventDefault(); padId = e.pointerId; try { el.pad.setPointerCapture(e.pointerId); } catch (er) {} setPad(dirFromPointer(e)); });
on(el.pad, 'pointermove', (e) => { if (e.pointerId === padId) setPad(dirFromPointer(e)); });
const padUp = (e) => { if (e.pointerId !== padId) return; padId = null; setPad(-1); };
on(el.pad, 'pointerup', padUp); on(el.pad, 'pointercancel', padUp); on(el.pad, 'lostpointercapture', padUp);
on(el.pad, 'contextmenu', (e) => e.preventDefault());

// dito sul campo di gioco: la direzione dello scorrimento vale finché il dito resta appoggiato; sollevandolo Faindo si ferma
let sw = null;
on(el.cv, 'pointerdown', (e) => { e.preventDefault(); sw = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { el.cv.setPointerCapture(e.pointerId); } catch (er) {} });
on(el.cv, 'pointermove', (e) => {
  if (!sw || e.pointerId !== sw.id) return;
  const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
  if (Math.hypot(dx, dy) < 14) return;
  send(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 0 : 1) : (dy > 0 ? 2 : 3));
  sw.x = e.clientX; sw.y = e.clientY;
});
const swEnd = (e) => { if (sw && e.pointerId === sw.id) { sw = null; if (sim && sim.phase === 'play') sim.input(null); } };
on(el.cv, 'pointerup', swEnd); on(el.cv, 'pointercancel', swEnd); on(el.cv, 'lostpointercapture', swEnd);
on(el.cv, 'contextmenu', (e) => e.preventDefault());

const KEYS = { ArrowRight: 0, d: 0, D: 0, ArrowLeft: 1, a: 1, A: 1, ArrowDown: 2, s: 2, S: 2, ArrowUp: 3, w: 3, W: 3 };
on(document, 'keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key;
  if (k === 'Escape') {
    if (!el.pLb.hidden) { closeLb(); e.preventDefault(); return; }
    if (state === 'playing' || state === 'countdown' || state === 'between') { pause(false); e.preventDefault(); } else if (state === 'paused') { resume(); e.preventDefault(); }
    return;
  }
  if (k === 'p' || k === 'P') { if (state === 'playing' || state === 'countdown' || state === 'paused' || state === 'between') { togglePause(); e.preventDefault(); } return; }
  if (k in KEYS) { e.preventDefault(); if (state === 'playing') { keyDir = KEYS[k]; send(keyDir); } return; }
  if ((k === 'Enter' || k === ' ') && state === 'start' && el.pLb.hidden && !$('btnStart').disabled && document.activeElement === document.body) { startGame(); e.preventDefault(); }
});
on(document, 'keyup', (e) => { if (e.key in KEYS && KEYS[e.key] === keyDir) { keyDir = -1; if (sim && sim.phase === 'play') sim.input(null); } });
on(document, 'pointerdown', () => { if (audio.ctx && state !== 'paused') audio.resume(); }, { capture: true });
on(window, 'blur', releaseInputs);
on(document, 'visibilitychange', () => { releaseInputs(); if (document.hidden) pause(true); else last = performance.now(); });
on(window, 'pagehide', () => { audio.stopMusic(); if (state === 'playing' || state === 'countdown' || state === 'between') pause(true); });
on(document, 'touchmove', (e) => { if (!e.target.closest || !e.target.closest('.g-panel')) e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange']) on(document, ev, (e) => e.preventDefault());
on(window, 'resize', layout); on(window, 'orientationchange', () => setTimeout(layout, 120));
if (window.visualViewport) on(window.visualViewport, 'resize', layout);
on(document, 'fullscreenchange', () => setTimeout(layout, 60));

/* ------------------------------ Barra superiore ------------------------------ */
const hc = {};
function setText(n, key, v) { if (hc[key] !== v) { hc[key] = v; n.textContent = v; } }
const fmtTime = (s) => { const t = Math.max(0, Math.ceil(s)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
function updateHud(force) {
  const s = sim;
  setText(el.score, 'score', String(s.score).padStart(5, '0'));
  setText(el.level, 'lv', s.level + '/' + LEVELS);
  setText(el.time, 'time', fmtTime(s.timeLeft));
  const low = s.timeLeft <= 30 && s.phase === 'play' && state === 'playing';
  if (hc.low !== low) { hc.low = low; el.timeCell.classList.toggle('is-low', low); }
  if (hc.lives !== s.lives || force) {
    hc.lives = s.lives; el.lives.textContent = '';
    for (let i = 0; i < C.LIVES; i++) { const d = document.createElement('i'); d.className = 'm-life' + (i < s.lives ? '' : ' is-lost'); el.lives.appendChild(d); }
  }
  const restricted = s.level > C.FREE_LEVELS;
  chips.forEach((ch, c) => {
    const o = s.L.offices.find((q) => q.color === c), key = hc['k' + c] = [s.keys[c], o ? s.unlocked[o.id] : false, s.carried[c], o ? s.delivered[o.id] : 0, s.active, restricted].join();
    if (ch._k === key && !force) return; ch._k = key;
    ch.classList.toggle('has-key', s.keys[c]); ch.classList.toggle('is-open', !!o && s.unlocked[o.id]);
    ch.classList.toggle('has-docs', s.carried[c] > 0); ch.classList.toggle('is-done', !!o && s.done[o.id]);
    ch.classList.toggle('is-active', restricted && s.active === c); ch.classList.toggle('is-locked', restricted && s.active !== null && s.active !== c);
    ch.querySelector('.m-carry').textContent = '×' + s.carried[c]; ch.querySelector('.m-del').textContent = (o ? s.delivered[o.id] : 0) + '/5';
    ch.setAttribute('aria-label', NAMES[c] + ': key ' + (o && s.unlocked[o.id] ? 'used, office open' : s.keys[c] ? 'held' : 'not found') + ', ' + s.carried[c] + ' documents carried, ' + (o ? s.delivered[o.id] : 0) + ' of 5 delivered');
  });
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
    scene.event(e, sim);
    switch (e.type) {
      case 'key': audio.sfx('key'); break;
      case 'doc': audio.sfx('doc'); break;
      case 'unlock': audio.sfx('unlock'); el.live.textContent = NAMES[e.color] + ' office unlocked'; break;
      case 'deliver': audio.sfx('deliver', e.n); el.live.textContent = '+' + e.n * 100; break;
      case 'office': audio.sfx('office'); el.live.textContent = NAMES[e.color] + ' office complete'; break;
      case 'power': audio.sfx('power'); break;
      case 'powerEnd': audio.sfx('powerEnd'); break;
      case 'kill': audio.sfx('kill'); break;
      case 'hit': audio.sfx('hit'); el.live.textContent = sim.lives + ' lives left'; break;
      case 'exitOn': audio.sfx('exitOn'); toast('EXIT OPEN', '', false); break;
      case 'active': toast(NAMES[e.color] + ' ACTIVE', 'FINISH IT TO CHANGE', false); break;
      case 'levelDone': audio.sfx('exit'); break;
    }
  }
  sim.events.length = 0;
}
function stepSim() {
  sim.step(); handleEvents();
  if (sim.power > 0 && sim.power <= 3 && Math.ceil(sim.power) !== lastTick) { lastTick = Math.ceil(sim.power); audio.sfx('tick'); }
  if (sim.phase === 'between') { betweenFor = sim.level + 1 === C.FREE_LEVELS + 1 ? 3200 : 1900; betweenMs = 0; setState('between'); releaseInputs(); toast('LEVEL ' + sim.level + ' CLEAR', '+' + C.SCORE.LEVEL, true); }
  else if (sim.phase === 'over') finish();
}

function frame(now) {
  if (dead) return;
  raf = requestAnimationFrame(frame);
  const dt = Math.min(100, now - (last || now)); last = now;
  if (state === 'playing') {
    acc += dt; let n = 0;
    while (acc >= STEP_MS && n < 8 && state === 'playing') { stepSim(); acc -= STEP_MS; n++; }
    if (n >= 8) acc = 0;
    updateHud();
  } else if (state === 'between') {
    betweenMs += dt;
    if (betweenMs >= betweenFor) { sim.advance(); scene.setLevel(sim.L); lastTick = -1; setState('playing'); acc = 0; handleEvents(); showLevelToast(sim.level); updateHud(true); }
  } else if (state === 'countdown') {
    cdMs += dt;
    const idx = Math.floor(cdMs / COUNT_MS);
    if (idx !== cdShown && idx < 4) {
      cdShown = idx; el.count.hidden = false; el.count.textContent = idx < 3 ? String(3 - idx) : 'GO!';
      el.count.classList.remove('pop'); void el.count.offsetWidth; el.count.classList.add('pop');
      audio.sfx(idx < 3 ? 'beep' : 'go');
    }
    if (idx >= 4) beginPlay();
  }
  scene.update(state === 'paused' ? 0 : dt / 1000);
  scene.draw(sim, state === 'paused');
}

/* ------------------------------ Classifica ------------------------------ */
function openLb() {
  lbOpener = document.activeElement; el.pLb.hidden = false;
  $('lbBest').textContent = String(localBest());
  $('lbNote').textContent = API ? 'Loading…' : 'The online leaderboard for Signal Maze is not available yet. Your best score is saved on this device.';
  try { $('btnLbClose').focus({ preventScroll: true }); } catch (e) {}
}
function closeLb() { el.pLb.hidden = true; if (lbOpener && lbOpener.focus && document.body.contains(lbOpener)) { try { lbOpener.focus({ preventScroll: true }); } catch (e) {} } }

/* ------------------------------ Condivisione ------------------------------ */
async function shareScore() {
  const url = new URL('./', location.href).href, text = 'I scored ' + sim.score + ' points in FAIND Signal Maze. Can you beat that?', note = $('shareNote');
  if (navigator.share) { try { await navigator.share({ title: 'FAIND Signal Maze', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  let ok = false;
  try { await navigator.clipboard.writeText(text + ' ' + url); ok = true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text + ' ' + url; ta.style.cssText = 'position:fixed;opacity:0;left:-999px'; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove();
  }
  note.hidden = false; note.textContent = ok ? 'Link copied: ' + url : url;
}

/* ------------------------------ Collegamenti ------------------------------ */
on(el.brand, 'click', goHome);
on($('btnStart'), 'click', startGame);
on($('btnLb'), 'click', openLb); on($('btnLbClose'), 'click', closeLb);
on($('btnSound'), 'click', toggleSound); on($('btnSound2'), 'click', toggleSound);
on(el.pauseBtn, 'click', () => pause(false));
on($('btnResume'), 'click', resume);
on($('btnRestart'), 'click', () => { audio.resume(); setState('start'); startGame(); });
on($('btnHome'), 'click', () => goHome());
on($('btnAgain'), 'click', () => startGame());
on($('btnShare'), 'click', shareScore);
on($('btnNews'), 'click', () => { shutdown(); }); on($('btnMore'), 'click', () => { shutdown(); }); on($('btnGames'), 'click', () => { shutdown(); });

el.brand.setAttribute('title', 'Back to FAIND home'); el.brand.setAttribute('aria-label', 'FAIND – back to the home page');
updateSoundButtons(); layout(); updateHud(true);
requestAnimationFrame((n) => { last = n; raf = requestAnimationFrame(frame); });

// per le prove automatiche e la diagnosi
window.__faindMaze = { get state() { return state; }, get sim() { return sim; }, get scene() { return scene; }, get audio() { return audio; }, shutdown, config: C };
