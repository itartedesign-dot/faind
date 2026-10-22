/* =====================================================================
   FAIND GAME — News Rush: regia del gioco
   ---------------------------------------------------------------------
   Collega il motore (sim.js), la grafica (art.js), l'audio (audio.js) e
   l'interfaccia HTML: schermate, pausa, comandi, classifica online.
   Tutti i ricevitori di eventi usano un unico AbortController e il ciclo di
   animazione è uno solo: uscendo dal gioco (shutdown) si libera tutto.
   ===================================================================== */
import { Sim, CONFIG as C, levelParams } from './sim.js?v=20261023a';
import { Scene } from './art.js?v=20261023a';
import { Audio8 } from './audio.js?v=20261023a';
import { pickLang, makeT } from './i18n.js?v=20261023a';

const $ = (id) => document.getElementById(id);
const lang = pickLang();
const t = makeT(lang);
const API = String(window.FAIND_GAME_API || '').replace(/\/+$/, '');
const STEP_MS = 1000 / C.TPS;
const COUNT_MS = 700;
const BEST_KEY = 'faind-game-best';

const ac = new AbortController();
const on = (el, ev, fn, opt) => el.addEventListener(ev, fn, Object.assign({ signal: ac.signal }, opt || {}));

const el = {
  app: $('app'), fit: $('fit'), frame: $('frame'), stage: $('stage'), cv: $('cv'), brand: $('brand'),
  score: $('hScore'), topIni: $('hTopIni'), topScore: $('hTopScore'), topCell: $('hTopCell'), level: $('hLevel'), loadN: $('hLoadN'), loadCell: $('hLoadCell'), slots: $('hSlots'),
  pauseBtn: $('btnPause'), live: $('liveMsg'), toast: $('toast'), count: $('count'),
  pStart: $('pStart'), pPause: $('pPause'), pOver: $('pOver'), pLb: $('pLb'), pCountry: $('pCountry'),
  offNote: $('offNote'), pauseAuto: $('pauseAuto'), controls: $('controls'), drag: $('drag'), btnL: $('btnL'), btnR: $('btnR')
};

/* ------------------------------ Testi ------------------------------ */
document.documentElement.lang = lang;
document.title = t('pageTitle');
function applyTexts() {
  document.querySelectorAll('[data-t]').forEach((n) => { n.textContent = t(n.getAttribute('data-t')); });
  document.querySelectorAll('[data-ta]').forEach((n) => {
    const v = t(n.getAttribute('data-ta'));
    n.setAttribute('aria-label', v);
    if (n.tagName === 'INPUT') n.setAttribute('placeholder', v);
  });
  el.brand.setAttribute('title', t('backToSite'));
  el.brand.setAttribute('aria-label', 'FAIND – ' + t('backToSite'));
  el.btnL.setAttribute('aria-label', t('left')); el.btnR.setAttribute('aria-label', t('right'));
  $('btnAgain').textContent = t('playAgain');
  updateSoundButtons();
}

/* ------------------------------ Stato ------------------------------ */
const scene = new Scene(el.cv);
// START si attiva a pose caricate (precaricate, così non spariscono al cambio di fotogramma); dopo 5 s parte comunque con il disegno di riserva
$('btnStart').disabled = true;
Promise.race([scene.ready, new Promise((r) => setTimeout(r, 5000))]).then(() => { $('btnStart').disabled = false; });
const audio = new Audio8();
let state = 'start';            // start | countdown | playing | paused | over
let pausedFrom = null;
let sim = null, session = null, sessionP = null;
let cdMs = 0, cdShown = -1;
let acc = 0, last = 0, raf = 0, dead = false;
let unit = 2;                   // pixel dello schermo per unità di gioco
let lbOpener = null;

function setState(s) {
  state = s; el.app.setAttribute('data-state', s);
  el.pStart.hidden = s !== 'start';
  el.pPause.hidden = s !== 'paused';
  el.pOver.hidden = s !== 'over';
  el.pauseBtn.hidden = !(s === 'playing' || s === 'countdown');
  if (s !== 'countdown') el.count.hidden = true;
  if (document.activeElement && document.activeElement !== document.body && !/INPUT/.test(document.activeElement.tagName)) {
    try { document.activeElement.blur(); } catch (e) {}
  }
}

/* ------------------------------ Misure e schermo intero ------------------------------ */
function layout() {
  const cs = getComputedStyle(el.fit);
  const aw = el.fit.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const ah = el.fit.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ctrlMin = Math.max(84, Math.min(120, ah * 0.13));
  const cw = Math.max(200, Math.floor(Math.min(aw, ((ah - ctrlMin) * 3) / 4)));
  const ch = Math.round((cw * 4) / 3);
  const fh = ah - ch <= 260 ? ah : ch + 260;
  unit = cw / C.W;
  const s = el.frame.style;
  s.setProperty('--cw', cw + 'px'); s.setProperty('--ch', ch + 'px'); s.setProperty('--fh', fh + 'px');
  document.documentElement.style.setProperty('--u', unit + 'px');
}
function askFullscreen() {
  // solo su dispositivi touch, una volta per partita, da un gesto dell'utente; se non c'è o viene rifiutato resta la vista a tutto schermo della pagina
  if (!window.matchMedia || !matchMedia('(pointer: coarse)').matches || document.fullscreenElement) return;
  const r = el.app.requestFullscreen || el.app.webkitRequestFullscreen;
  if (!r) return;
  try { const p = r.call(el.app, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}
function leaveFullscreen() {
  try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (e) {}
}

/* ------------------------------ Audio ------------------------------ */
function updateSoundButtons() {
  for (const [b, i] of [[$('btnSound'), $('icoSound')], [$('btnSound2'), $('icoSound2')]]) {
    b.setAttribute('aria-pressed', String(audio.muted));
    b.setAttribute('aria-label', audio.muted ? t('soundOff') : t('soundOn'));
    b.title = audio.muted ? t('soundOff') : t('soundOn');
    i.className = 'g-ico ' + (audio.muted ? 'g-ico--off' : 'g-ico--on');
  }
}
function toggleSound() {
  audio.unlock(); audio.setMuted(!audio.muted); updateSoundButtons();
  if (!audio.muted) { audio.sfx('click'); if (state === 'playing') audio.startMusic(); } else audio.stopMusic();
}

/* ------------------------------ Partita ------------------------------ */
function randomSeed() {
  try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] | 0; } catch (e) { return (Math.random() * 4294967296) | 0; }
}
async function api(path, body, timeout) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), timeout || 8000);
  try {
    const r = await fetch(API + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal, cache: 'no-store' } : { signal: ctl.signal, cache: 'no-store' });
    const j = await r.json().catch(() => null);
    if (!r.ok) { const e = new Error((j && j.error) || 'http'); e.status = r.status; e.data = j; throw e; }
    return j;
  } finally { clearTimeout(to); }
}

function startGame() {
  audio.unlock(); audio.resume();
  askFullscreen();
  scene.reset();
  loadTop();
  sim = null; session = null; acc = 0;
  // sessione di partita sul server: il seme dei rotoli lo decide lui; se non risponde si gioca comunque, fuori classifica
  sessionP = null;
  if (API) sessionP = api('/session', {}, 2500).then((s) => { session = s; }).catch(() => { session = null; });
  cdMs = 0; cdShown = -1;
  setState('countdown');
  el.live.textContent = '';
}

function beginPlay() {
  const seed = session && Number.isInteger(session.seed) ? session.seed | 0 : randomSeed();
  sim = new Sim(seed); acc = 0;
  setState('playing');
  audio.startMusic();
  updateHud(true);
}

function finish() {
  setState('over'); $('pOver').classList.remove('is-record');
  audio.stopMusic(); audio.sfx('end');
  releaseInputs();
  const score = sim.score;
  const ot = $('overTitle'); ot.setAttribute('data-t', sim.over ? 'gameOverLost' : 'gameOver'); ot.textContent = t(sim.over ? 'gameOverLost' : 'gameOver');
  let best = 0; try { best = parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) {}
  const isBest = score > best;
  if (isBest) { best = score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) {} }
  $('rScore').textContent = String(score);
  $('rDel').textContent = String(sim.delivered); $('rLost').textContent = String(sim.lost); $('rBestV').textContent = String(best);
  $('rBest').hidden = !isBest;
  $('rRank').hidden = true; $('nameForm').hidden = true; $('shareNote').hidden = true;
  const note = $('rNote');
  note.hidden = false;
  if (!API) note.textContent = t('resultOffline');
  else if (!session) note.textContent = t('resultOffline');
  else note.textContent = t('verifying');
  if (API && session) submitScore();
  setTimeout(() => { if (state === 'over') { try { $('btnAgain').focus({ preventScroll: true }); } catch (e) {} } }, 400);
}

let claim = null;
async function submitScore() {
  const mySession = session, note = $('rNote');
  try {
    const r = await api('/score', { token: mySession.token, inputs: sim.inputs }, 12000);
    if (state !== 'over' || mySession !== session) return;
    if (r.score !== sim.score) $('rScore').textContent = String(r.score);
    const lines = [];
    if (r.weekly && r.weekly.rank) lines.push(t('topWeekly', { n: r.weekly.rank }));
    if (r.all && r.all.rank) lines.push(t('topAll', { n: r.all.rank }));
    if (lines.length && r.claim) {
      claim = r.claim; $('pOver').classList.add('is-record');
      $('rRank').hidden = false; $('rRank').textContent = t('top10') + '\n' + lines.join('\n'); $('rRank').style.whiteSpace = 'pre-line';
      note.hidden = true;
      $('nameForm').hidden = false; $('nameErr').hidden = true;
      $('nameIn').value = ''; setCountry(null);
      setTimeout(() => { try { $('nameIn').focus({ preventScroll: true }); } catch (e) {} }, 50);
    } else note.hidden = true;
  } catch (e) {
    if (state !== 'over') return;
    note.hidden = false; note.textContent = e && e.status === 422 ? t('rejected') : t('netError');
  }
}

function goHome(e) {
  if (e && (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;   // nuova scheda: il comportamento normale del link
  if (e) e.preventDefault();
  shutdown();
  leaveFullscreen();
  location.assign(el.brand.getAttribute('href'));
}

function shutdown() {
  dead = true;
  cancelAnimationFrame(raf); raf = 0;
  state = 'start'; sim = null; session = null; sessionP = null;     // niente partita abbandonata salvata
  audio.dispose();
  ac.abort();                                                       // toglie tutti i ricevitori di eventi
}

/* ------------------------------ Pausa ------------------------------ */
function pause(auto) {
  if (state !== 'playing' && state !== 'countdown') return;
  pausedFrom = state; releaseInputs();
  setState('paused');
  el.pauseAuto.hidden = !auto;
  audio.stopMusic(); if (audio.ctx && audio.ctx.state === 'running') audio.ctx.suspend().catch(() => {});
  try { $('btnResume').focus({ preventScroll: true }); } catch (e) {}
}
function resume() {
  if (state !== 'paused') return;
  audio.resume();
  setState(pausedFrom || 'playing'); if (pausedFrom === 'countdown') el.count.hidden = false;
  last = performance.now(); acc = 0;
  if (state === 'playing') audio.startMusic();
}
function togglePause() { if (state === 'paused') resume(); else pause(false); }

/* ------------------------------ Comandi ------------------------------ */
const inp = { left: false, right: false, keyL: false, keyR: false, drag: false, dragX0: 0, dragBase: 0, dragTarget: 0 };
function applyTarget() {
  if (!sim || state !== 'playing') return;
  const l = inp.left || inp.keyL, r = inp.right || inp.keyR;
  let tg;
  if (inp.drag) tg = inp.dragTarget;
  else if (l && !r) tg = C.FX_MIN;
  else if (r && !l) tg = C.FX_MAX;
  else tg = Math.round(sim.x);                 // rilasciato: Faindo si ferma dov'è
  sim.input(tg);
}
function releaseInputs() {
  inp.left = inp.right = inp.keyL = inp.keyR = inp.drag = false;
  el.btnL.classList.remove('is-down'); el.btnR.classList.remove('is-down'); el.drag.classList.remove('is-down');
  applyTarget();
}
function hold(btn, key) {
  on(btn, 'pointerdown', (e) => {
    e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (er) {}
    inp[key] = true; btn.classList.add('is-down'); applyTarget();
  });
  const up = () => { inp[key] = false; btn.classList.remove('is-down'); applyTarget(); };
  on(btn, 'pointerup', up); on(btn, 'pointercancel', up); on(btn, 'lostpointercapture', up);
  on(btn, 'contextmenu', (e) => e.preventDefault());
}
hold(el.btnL, 'left'); hold(el.btnR, 'right');

// trascinamento col dito: sulla zona dei comandi in basso oppure direttamente sul campo di gioco
let dragId = null;
function bindDrag(target) {
  on(target, 'pointerdown', (e) => {
    if (inp.drag) return;
    e.preventDefault(); dragId = e.pointerId; try { target.setPointerCapture(e.pointerId); } catch (er) {}
    inp.drag = true; inp.dragX0 = e.clientX; inp.dragBase = sim ? sim.x : C.W / 2; inp.dragTarget = inp.dragBase;
    el.drag.classList.add('is-down'); applyTarget();
  });
  on(target, 'pointermove', (e) => {
    if (!inp.drag || e.pointerId !== dragId) return;
    inp.dragTarget = Math.max(C.FX_MIN, Math.min(C.FX_MAX, inp.dragBase + ((e.clientX - inp.dragX0) / unit) * 1.35));
    applyTarget();
  });
  const end = (e) => { if (e && e.pointerId !== dragId) return; inp.drag = false; dragId = null; el.drag.classList.remove('is-down'); applyTarget(); };
  on(target, 'pointerup', end); on(target, 'pointercancel', end); on(target, 'lostpointercapture', end);
  on(target, 'contextmenu', (e) => e.preventDefault());
}
bindDrag(el.drag); bindDrag(el.cv);

on(document, 'keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const k = e.key;
  const typing = e.target && /INPUT|TEXTAREA/.test(e.target.tagName);
  if (k === 'Escape') {
    if (!el.pCountry.hidden) { closeCountry(); e.preventDefault(); return; }
    if (!el.pLb.hidden) { closeLb(); e.preventDefault(); return; }
    if (state === 'playing' || state === 'countdown') { pause(false); e.preventDefault(); } else if (state === 'paused') { resume(); e.preventDefault(); }
    return;
  }
  if (typing) return;
  if (k === 'p' || k === 'P') { if (state === 'playing' || state === 'countdown' || state === 'paused') { togglePause(); e.preventDefault(); } return; }
  if (state !== 'playing') return;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { inp.keyL = true; applyTarget(); e.preventDefault(); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { inp.keyR = true; applyTarget(); e.preventDefault(); }
});
on(document, 'keyup', (e) => {
  const k = e.key;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { inp.keyL = false; applyTarget(); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { inp.keyR = false; applyTarget(); }
});
on(document, 'pointerdown', () => { if (audio.ctx && state !== 'paused') audio.resume(); }, { capture: true });
on(window, 'blur', releaseInputs);
on(document, 'visibilitychange', () => { releaseInputs(); if (document.hidden) pause(true); else last = performance.now(); });
on(window, 'pagehide', () => { audio.stopMusic(); if (state === 'playing' || state === 'countdown') pause(true); });
// nessuno scorrimento della pagina durante i gesti (salvo nei pannelli che scorrono)
on(document, 'touchmove', (e) => { if (!e.target.closest || !e.target.closest('.g-panel, .g-countries')) e.preventDefault(); }, { passive: false });
for (const ev of ['gesturestart', 'gesturechange']) on(document, ev, (e) => e.preventDefault());
on(window, 'resize', layout); on(window, 'orientationchange', () => setTimeout(layout, 120));
if (window.visualViewport) on(window.visualViewport, 'resize', layout);
on(document, 'fullscreenchange', () => setTimeout(layout, 60));

/* ------------------------------ HUD ------------------------------ */
const hc = {};
// in alto: sigla e punteggio del primo della classifica assoluta (se la classifica non risponde, il record di questo dispositivo)
let topInfo = null;
function localBest() { try { return parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0; } catch (e) { return 0; } }
function setTop() {
  const ini = topInfo ? topInfo.initials : t('topBest'), score = topInfo ? topInfo.score : localBest();
  setText(el.topIni, 'topIni', ini); setText(el.topScore, 'topScore', String(score));
  el.topCell.title = topInfo ? t('topTitle') : t('bestTitle');
}
async function loadTop() {
  if (!API) return;
  try { const r = await api('/leaderboard', null, 6000); const f = r && r.all && r.all[0]; topInfo = f && /^[A-Z]{3}$/.test(f.initials) ? { initials: f.initials, score: f.score | 0 } : null; } catch (e) { /* resta il record locale */ }
  setTop();
}
function setText(n, key, v) { if (hc[key] !== v) { hc[key] = v; n.textContent = v; } }
function updateHud(force) {
  const s = sim;
  const score = s ? s.score : 0, load = s ? s.load : 0, cap = s ? s.cap : levelParams(1).cap, lv = s ? s.level : 1;
  setText(el.score, 'score', String(score).padStart(5, '0'));
  setTop();
  setText(el.level, 'lv', String(lv));
  const full = load >= cap && load > 0;
  setText(el.loadN, 'load', full ? t('full') : load + '/' + cap);
  el.loadCell.classList.toggle('is-full', full);
  const key = cap + ':' + load;
  if (hc.slots !== key || force) {
    hc.slots = key;
    el.slots.textContent = '';
    for (let i = 0; i < cap; i++) { const d = document.createElement('i'); d.className = 'g-slot' + (i < load ? ' on' : ''); el.slots.appendChild(d); }
  }
}
function toast(title, sub, big) {
  el.toast.hidden = true; el.toast.classList.toggle('g-toast--lv', !!big); el.toast.textContent = '';
  const b = document.createElement('div'); b.textContent = title; el.toast.appendChild(b);
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.toast.appendChild(s); }
  void el.toast.offsetWidth; el.toast.hidden = false;
  el.toast.addEventListener('animationend', () => { el.toast.hidden = true; }, { once: true });
}

/* ------------------------------ Ciclo principale ------------------------------ */
function stepSim() {
  sim.step();
  for (const e of sim.events) {
    scene.event(e, sim);
    if (e.type === 'collect') audio.sfx('collect');
    else if (e.type === 'deliver') { audio.sfx('deliver', e.a); el.live.textContent = '+' + e.b; }
    else if (e.type === 'drop' || e.type === 'bad') { audio.sfx('drop'); el.live.textContent = t('lost'); if (!sim.over) toast(t('missed', { n: sim.lost }), ''); }
    else if (e.type === 'release') audio.sfx('puff');
    else if (e.type === 'full') { audio.sfx('full'); el.live.textContent = t('full'); }
    else if (e.type === 'level') { audio.sfx('newlevel'); el.live.textContent = t('levelUp', { n: e.a }); toast(t('levelUp', { n: e.a }), t('capacity', { n: e.b }), true); }
    else if (e.type === 'arm') audio.sfx('arm');
  }
  sim.events.length = 0;
  if (sim.done) finish();
}

function frame(now) {
  if (dead) return;
  raf = requestAnimationFrame(frame);
  const dt = Math.min(100, now - (last || now)); last = now;
  if (state === 'playing' && sim) {
    acc += dt; let n = 0;
    while (acc >= STEP_MS && n < 8 && state === 'playing') { stepSim(); acc -= STEP_MS; n++; }
    if (n >= 8) acc = 0;
    updateHud();
  } else if (state === 'countdown') {
    cdMs += dt;
    const idx = Math.floor(cdMs / COUNT_MS);
    if (idx !== cdShown && idx < 4) {
      cdShown = idx; el.count.hidden = false;
      el.count.textContent = idx < 3 ? String(3 - idx) : t('go');
      el.count.classList.remove('pop'); void el.count.offsetWidth; el.count.classList.add('pop');
      audio.sfx(idx < 3 ? 'beep' : 'go');
    }
    if (idx >= 4) beginPlay();
  }
  const moving = sim && state === 'playing' && sim.dir !== 0;
  scene.update(state === 'paused' ? 0 : dt / 1000);
  if (moving) scene.walkClock += dt / 1000; else scene.walkClock = 0;
  const k = state === 'playing' ? acc / STEP_MS : 0;
  const m = sim ? {
    x: sim.dir ? sim.x + sim.dir * Math.min(Math.abs(sim.target - sim.x), (C.MOVE_SPEED / C.TPS) * k) : sim.x,
    dir: state === 'playing' ? sim.dir : 0, load: sim.load, cap: sim.cap, tick: sim.tick, full: sim.load >= sim.cap && sim.load > 0,
    rolls: sim.rolls.map((r) => ({ x: r.x, y: r.y + r.vy * k, vent: r.vent, vy: r.vy, red: r.red })), pending: sim.pending,
    arm: sim.armState(), rest: sim.rest, lv: sim.level, lostLog: sim.lostLog
  } : { x: C.W / 2, dir: 0, load: 0, cap: levelParams(1).cap, tick: 0, full: false, rolls: [], pending: [], arm: null, rest: 0, lv: 1 };
  scene.draw(m);
}

/* ------------------------------ Classifica ------------------------------ */
let flagsMod = null;
const loadFlags = () => flagsMod ? Promise.resolve(flagsMod) : import('./flags.js?v=20261023a').then((m) => (flagsMod = m)).catch(() => null);
let lbTab = 'weekly', lbData = null;

function flagEl(code) {
  const s = document.createElement('span'); s.className = 'g-flag';
  if (flagsMod && flagsMod.FLAGS[code]) { s.style.backgroundImage = 'url("' + flagsMod.flagSrc(code) + '")'; s.title = code; s.setAttribute('role', 'img'); s.setAttribute('aria-label', countryName(code)); }
  return s;
}
function countryName(code) {
  try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code) || code; } catch (e) { return code; }
}
function renderLb() {
  const ol = $('lbList'); ol.textContent = '';
  const msg = (txt) => { const li = document.createElement('li'); li.className = 'g-msg'; li.textContent = txt; ol.appendChild(li); };
  $('btnLbRetry').hidden = true;
  $('tabW').setAttribute('aria-selected', String(lbTab === 'weekly')); $('tabA').setAttribute('aria-selected', String(lbTab === 'all'));
  if (!API) { msg(t('offline')); $('lbNote').textContent = ''; return; }
  if (lbData === 'loading') { msg(t('loading')); return; }
  if (lbData === 'error') { msg(t('netError')); $('btnLbRetry').hidden = false; return; }
  const rows = (lbData && lbData[lbTab]) || [];
  if (!rows.length) { msg(t('empty')); } else rows.forEach((r, i) => {
    const li = document.createElement('li');
    const a = document.createElement('span'); a.className = 'g-pos'; a.textContent = t('rank') + (t('rank') === '#' ? '' : ' ') + (i + 1);
    const b = document.createElement('span'); b.className = 'g-ini'; b.textContent = r.initials;
    const c = flagEl(r.country);
    const d = document.createElement('span'); d.className = 'g-sc'; d.textContent = String(r.score);
    li.append(a, b, c, d); ol.appendChild(li);
  });
  $('lbNote').textContent = lbTab === 'weekly' ? t('weekNote') : '';
}
async function loadLb() {
  if (!API) { renderLb(); return; }
  lbData = 'loading'; renderLb();
  try { await loadFlags(); lbData = await api('/leaderboard', null, 8000); } catch (e) { lbData = 'error'; }
  if (!el.pLb.hidden) renderLb();
}
function openLb() {
  lbOpener = document.activeElement; el.pLb.hidden = false; renderLb(); loadLb();
  try { $('btnLbClose').focus({ preventScroll: true }); } catch (e) {}
}
function closeLb() { el.pLb.hidden = true; if (lbOpener && lbOpener.focus && document.body.contains(lbOpener)) { try { lbOpener.focus({ preventScroll: true }); } catch (e) {} } }

/* ------------------------------ Nome e nazione ------------------------------ */
let chosen = null;
function setCountry(code) {
  chosen = code;
  const f = $('cFlag'), n = $('cName');
  if (!code) { f.style.backgroundImage = ''; n.setAttribute('data-t', 'chooseCountry'); n.textContent = t('chooseCountry'); return; }
  n.removeAttribute('data-t'); n.textContent = countryName(code);
  if (flagsMod) f.style.backgroundImage = 'url("' + flagsMod.flagSrc(code) + '")';
}
async function openCountry() {
  await loadFlags();
  const ul = $('coList'); ul.textContent = '';
  const items = (flagsMod ? flagsMod.COUNTRY_CODES : []).map((c) => ({ c, n: countryName(c) })).sort((a, b) => a.n.localeCompare(b.n, lang));
  for (const it of items) {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.dataset.code = it.c; b.dataset.name = it.n.toLowerCase(); b.setAttribute('role', 'option');
    b.append(flagEl(it.c), document.createTextNode(it.n));
    li.appendChild(b); ul.appendChild(li);
  }
  $('coSearch').value = ''; el.pCountry.hidden = false;
  try { $('coSearch').focus({ preventScroll: true }); } catch (e) {}
}
function closeCountry() { el.pCountry.hidden = true; try { $('btnCountry').focus({ preventScroll: true }); } catch (e) {} }
on($('coSearch'), 'input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  $('coList').querySelectorAll('li').forEach((li) => { li.hidden = q && li.firstChild.dataset.name.indexOf(q) < 0; });
});
on($('coList'), 'click', (e) => { const b = e.target.closest('button'); if (!b) return; setCountry(b.dataset.code); closeCountry(); });
on($('nameIn'), 'input', (e) => { e.target.value = e.target.value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 3); });
on($('nameForm'), 'submit', async (e) => {
  e.preventDefault();
  const ini = $('nameIn').value.toUpperCase(), err = $('nameErr');
  if (!/^[A-Z]{3}$/.test(ini) || !chosen) { err.hidden = false; err.textContent = !/^[A-Z]{3}$/.test(ini) ? t('nameBad') : t('chooseCountry'); return; }
  err.hidden = true; $('btnSave').disabled = true;
  try {
    await api('/name', { claim, initials: ini, country: chosen }, 8000);
    $('nameForm').hidden = true; $('rNote').hidden = false; $('rNote').textContent = t('saved'); claim = null; $('pOver').classList.remove('is-record');
    lbData = null; loadTop();
  } catch (e2) { err.hidden = false; err.textContent = e2 && e2.status === 400 ? t('nameBad') : t('netError'); }
  $('btnSave').disabled = false;
});
on($('btnSkip'), 'click', () => { $('pOver').classList.remove('is-record'); $('nameForm').hidden = true; $('rRank').hidden = true; claim = null; });
on($('btnCountry'), 'click', openCountry);
on($('btnCoClose'), 'click', closeCountry);

/* ------------------------------ Condivisione ------------------------------ */
async function shareScore() {
  const score = sim ? sim.score : 0;
  const url = new URL('./', location.href).href;
  const text = t('shareMsg', { score });
  const note = $('shareNote');
  if (navigator.share) {
    try { await navigator.share({ title: 'FAIND – News Rush', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  let ok = false;
  try { await navigator.clipboard.writeText(text + ' ' + url); ok = true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text + ' ' + url; ta.style.cssText = 'position:fixed;opacity:0;left:-999px'; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove();
  }
  note.hidden = false; note.textContent = ok ? t('copied') + ': ' + url : url;
}

/* ------------------------------ Collegamenti ------------------------------ */
on(el.brand, 'click', goHome);
on($('btnStart'), 'click', startGame);
on($('btnLb'), 'click', openLb); on($('btnLb2'), 'click', openLb); on($('btnLbClose'), 'click', closeLb);
on($('btnLbRetry'), 'click', loadLb);
on($('tabW'), 'click', () => { lbTab = 'weekly'; renderLb(); }); on($('tabA'), 'click', () => { lbTab = 'all'; renderLb(); });
on($('btnSound'), 'click', toggleSound); on($('btnSound2'), 'click', toggleSound);
on(el.pauseBtn, 'click', () => pause(false));
on($('btnResume'), 'click', resume);
on($('btnRestart'), 'click', () => { audio.resume(); setState('start'); startGame(); });
on($('btnHome'), 'click', () => goHome());
on($('btnAgain'), 'click', () => startGame());
on($('btnShare'), 'click', shareScore);
on($('btnNews'), 'click', () => { shutdown(); });   // il link apre le notizie nella stessa scheda: prima si ferma tutto

applyTexts();
layout();
if (!API) { el.offNote.hidden = false; el.offNote.textContent = t('offline'); }
updateHud(true);
loadTop();
requestAnimationFrame((n) => { last = n; raf = requestAnimationFrame(frame); });

// per le prove automatiche e la diagnosi
window.__faindGame = { get state() { return state; }, get sim() { return sim; }, get scene() { return scene; }, get audio() { return audio; }, shutdown, config: C };
