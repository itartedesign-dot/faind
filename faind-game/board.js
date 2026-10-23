/* =====================================================================
   FAIND GAME — classifica online di Signal Maze e Lost Signal (lato browser)
   ---------------------------------------------------------------------
   Stessa logica di News Rush, condivisa dai due giochi: sessione di partita sul server, invio dei comandi a fine partita (il punteggio
   lo ricalcola il server), tre lettere e nazione se si entra in una Top 10, classifica settimanale e assoluta. Testi nelle quattro
   lingue del sito (i18n.js). Se il server non risponde si gioca lo stesso: il record resta sul dispositivo, distinto per gioco.
   ===================================================================== */
import { pickLang, makeT } from './i18n.js?v=20261023a';
import { mountInitials } from './initials.js?v=20261024a';

const $ = (id) => document.getElementById(id);

/** cfg: { api, game: 'maze' | 'lost', bestKey, signal, isOver(), sessionTimeout (ms, facoltativo) } */
export function createBoard(cfg) {
  const lang = pickLang(), t = makeT(lang);
  const API = String(cfg.api || '').replace(/\/+$/, ''), P = '/' + cfg.game;
  const on = (el, ev, fn) => el.addEventListener(ev, fn, { signal: cfg.signal });
  let session = null, sessionP = null, committed = false, claim = null, run = 0;
  let flagsMod = null, lbTab = 'weekly', lbData = null, lbOpener = null, chosen = null;
  const ini = mountInitials($('nameIn'), cfg.signal);
  const pOver = $('pOver'), pLb = $('pLb'), pCountry = $('pCountry'), status = $('rStatus');

  document.documentElement.lang = lang;
  const translate = () => {
    document.querySelectorAll('[data-t]').forEach((n) => { n.textContent = t(n.getAttribute('data-t')); });
    document.querySelectorAll('[data-ta]').forEach((n) => { const v = t(n.getAttribute('data-ta')); n.setAttribute('aria-label', v); if (n.tagName === 'INPUT') n.setAttribute('placeholder', v); });
  };

  async function api(path, body, timeout) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), timeout || 8000);
    try {
      const r = await fetch(API + P + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal, cache: 'no-store' } : { signal: ctl.signal, cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (!r.ok) { const e = new Error((j && j.error) || 'http'); e.status = r.status; e.data = j; throw e; }
      return j;
    } finally { clearTimeout(to); }
  }

  const localBest = () => { try { return parseInt(localStorage.getItem(cfg.bestKey) || '0', 10) || 0; } catch (e) { return 0; } };

  /* ---------- sessione di partita ---------- */
  /** Da chiamare quando si preme START: il server dà il gettone e il seme. Se non risponde in tempo la partita è fuori classifica. */
  function startSession() {
    session = null; committed = false; run++;
    sessionP = API ? api('/session', {}, cfg.sessionTimeout || 2500).then((s) => { if (!committed) session = s; }).catch(() => {}) : null;
  }
  /** Da chiamare quando la partita parte davvero: dopo questo istante una sessione in ritardo non vale più. Ritorna il seme del server o null. */
  function commit() {
    committed = true;
    return session && Number.isInteger(session.seed) ? session.seed | 0 : null;
  }

  /* ---------- fine partita ---------- */
  function setStatus(txt) { status.hidden = !txt; status.textContent = txt || ''; }
  /** Da chiamare alla fine di una partita con i comandi registrati dal motore. */
  function finish(inputs) {
    const mine = ++run;
    claim = null; pOver.classList.remove('is-record'); $('rRank').hidden = true; $('nameForm').hidden = true; $('shareNote').hidden = true;
    if (!API || !session) { setStatus(t('resultOffline')); return; }
    setStatus(t('verifying'));
    submit(inputs, session.token, mine);
  }
  /** Partita con continue: niente invio e niente record. Chiude ogni invio in corso e pulisce i riquadri del risultato. */
  function unranked() {
    run++; claim = null; session = null; pOver.classList.remove('is-record'); $('rRank').hidden = true; $('nameForm').hidden = true; $('shareNote').hidden = true; setStatus('');
  }
  async function submit(inputs, token, mine) {
    let r = null, err = null;
    for (let attempt = 0; attempt < 2 && !r; attempt++) {
      try { r = await api('/score', { token, inputs }, 15000); } catch (e) { err = e; if (e && e.status) break; if (attempt === 0) await new Promise((ok) => setTimeout(ok, 1500)); }
    }
    if (mine !== run || !cfg.isOver()) return;
    if (!r) { setStatus(err && err.status === 422 ? t('rejected') : t('netError')); return; }
    if (r.score !== undefined && $('rScore').textContent !== String(r.score)) $('rScore').textContent = String(r.score);
    const lines = [];
    if (r.weekly && r.weekly.rank) lines.push(t('topWeekly', { n: r.weekly.rank }));
    if (r.all && r.all.rank) lines.push(t('topAll', { n: r.all.rank }));
    if (lines.length && r.claim) {
      claim = r.claim; pOver.classList.add('is-record');
      const rk = $('rRank'); rk.hidden = false; rk.textContent = t('top10') + '\n' + lines.join('\n'); rk.style.whiteSpace = 'pre-line';
      setStatus('');
      $('nameForm').hidden = false; $('nameErr').hidden = true; ini.reset(); setCountry(null);
      setTimeout(() => ini.focus(), 50);
    } else setStatus('');
  }

  /* ---------- bandiere e nazioni ---------- */
  const loadFlags = () => flagsMod ? Promise.resolve(flagsMod) : import('./flags.js?v=20261023a').then((m) => (flagsMod = m)).catch(() => null);
  function countryName(code) { try { return new Intl.DisplayNames([lang], { type: 'region' }).of(code) || code; } catch (e) { return code; } }
  function flagEl(code) {
    const s = document.createElement('span'); s.className = 'g-flag';
    if (flagsMod && flagsMod.FLAGS[code]) { s.style.backgroundImage = 'url("' + flagsMod.flagSrc(code) + '")'; s.title = code; s.setAttribute('role', 'img'); s.setAttribute('aria-label', countryName(code)); }
    return s;
  }
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
    $('coSearch').value = ''; pCountry.hidden = false;
    try { $('coSearch').focus({ preventScroll: true }); } catch (e) {}
  }
  function closeCountry() { pCountry.hidden = true; try { $('btnCountry').focus({ preventScroll: true }); } catch (e) {} }

  /* ---------- classifica ---------- */
  function renderLb() {
    const ol = $('lbList'); ol.textContent = '';
    const msg = (txt) => { const li = document.createElement('li'); li.className = 'g-msg'; li.textContent = txt; ol.appendChild(li); };
    $('btnLbRetry').hidden = true; $('lbBest').textContent = String(localBest());
    $('tabW').setAttribute('aria-selected', String(lbTab === 'weekly')); $('tabA').setAttribute('aria-selected', String(lbTab === 'all'));
    $('lbTabs').hidden = !API;
    if (!API) { msg(t('offline')); $('lbNote').textContent = ''; return; }
    if (lbData === 'loading') { msg(t('loading')); return; }
    if (lbData === 'error') { msg(t('netError')); $('btnLbRetry').hidden = false; return; }
    const rows = (lbData && lbData[lbTab]) || [];
    if (!rows.length) msg(t('empty')); else rows.forEach((r, i) => {
      const li = document.createElement('li');
      const a = document.createElement('span'); a.className = 'g-pos'; a.textContent = t('rank') + (t('rank') === '#' ? '' : ' ') + (i + 1);
      const b = document.createElement('span'); b.className = 'g-ini'; b.textContent = r.initials;
      const d = document.createElement('span'); d.className = 'g-sc'; d.textContent = String(r.score);
      li.append(a, b, flagEl(r.country), d); ol.appendChild(li);
    });
    $('lbNote').textContent = lbTab === 'weekly' ? t('weekNote') : '';
  }
  async function loadLb() {
    if (!API) { renderLb(); return; }
    lbData = 'loading'; renderLb();
    try { await loadFlags(); lbData = await api('/leaderboard', null, 8000); } catch (e) { lbData = 'error'; }
    if (!pLb.hidden) renderLb();
  }
  function openLb() {
    lbOpener = document.activeElement; pLb.hidden = false; renderLb(); loadLb();
    try { $('btnLbClose').focus({ preventScroll: true }); } catch (e) {}
  }
  function closeLb() {
    pLb.hidden = true;
    if (lbOpener && lbOpener.focus && document.body.contains(lbOpener)) { try { lbOpener.focus({ preventScroll: true }); } catch (e) {} }
  }
  /** Esc: chiude prima la scelta della nazione, poi la classifica. Ritorna true se c'era qualcosa da chiudere. */
  function escape() {
    if (!pCountry.hidden) { closeCountry(); return true; }
    if (!pLb.hidden) { closeLb(); return true; }
    return false;
  }

  /* ---------- collegamenti ---------- */
  on($('btnLb'), 'click', openLb); on($('btnLb2'), 'click', openLb); on($('btnLbClose'), 'click', closeLb); on($('btnLbRetry'), 'click', loadLb);
  on($('tabW'), 'click', () => { lbTab = 'weekly'; renderLb(); }); on($('tabA'), 'click', () => { lbTab = 'all'; renderLb(); });
  on($('btnCountry'), 'click', openCountry); on($('btnCoClose'), 'click', closeCountry);
  on($('coSearch'), 'input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    $('coList').querySelectorAll('li').forEach((li) => { li.hidden = q && li.firstChild.dataset.name.indexOf(q) < 0; });
  });
  on($('coList'), 'click', (e) => { const b = e.target.closest('button'); if (!b) return; setCountry(b.dataset.code); closeCountry(); });
  on($('nameForm'), 'submit', async (e) => {
    e.preventDefault();
    const ini = $('nameIn').value.toUpperCase(), err = $('nameErr');
    if (!/^[A-Z]{3}$/.test(ini) || !chosen) { err.hidden = false; err.textContent = !/^[A-Z]{3}$/.test(ini) ? t('nameBad') : t('chooseCountry'); return; }
    err.hidden = true; $('btnSave').disabled = true;
    try {
      await api('/name', { claim, initials: ini, country: chosen }, 8000);
      $('nameForm').hidden = true; setStatus(t('saved')); claim = null; pOver.classList.remove('is-record'); lbData = null;
    } catch (e2) { err.hidden = false; err.textContent = e2 && e2.status === 400 ? t('nameBad') : t('netError'); }
    $('btnSave').disabled = false;
  });
  on($('btnSkip'), 'click', () => { pOver.classList.remove('is-record'); $('nameForm').hidden = true; $('rRank').hidden = true; claim = null; });

  translate();
  return { enabled: !!API, t, translate, startSession, commit, finish, unranked, openLb, closeLb, escape, localBest, get nameOpen() { return !$('nameForm').hidden; } };
}
