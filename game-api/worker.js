/* =====================================================================
   FAIND GAME — server della classifica condivisa (Cloudflare Worker + D1)
   ---------------------------------------------------------------------
   Il sito è statico (GitHub Pages): questo piccolo server è l'unico pezzo
   "vivo" e tiene le chiavi riservate (SESSION_SECRET) lontane dal browser.

   Come si impedisce di barare:
   1. POST /session  → il server inventa il seme dei rotoli e firma un gettone di partita.
   2. Il browser gioca e registra solo i comandi (tick, punto verso cui va Faindo).
   3. POST /score    → il server rifà la partita da zero con lo stesso motore (faind-game/sim.js)
      e calcola lui il punteggio: il totale inviato dal browser non esiste nemmeno. Controlla
      anche che sia passato il tempo di una partita vera (tanto quanto è durata), che il gettone sia suo e
      che non sia già stato usato (niente doppi invii).
   4. POST /name     → se il punteggio entra in una Top 10, con il "claim" firmato si registrano
      tre lettere A–Z e la nazione. Senza claim non si scrive in classifica.
   5. GET /leaderboard → Top 10 settimanale (da lunedì 00:00 a domenica, ora di Roma) e assoluta.
      A parità di punteggio precede chi è stato registrato prima dal server.

   Tre giochi, tre classifiche separate, le stesse quattro rotte:
     News Rush      /session /score /name /leaderboard                          (tabelle sessions e scores)
     Signal Maze    /maze/session /maze/score /maze/name /maze/leaderboard      (tabelle game_sessions e game_scores, game = 'maze')
     Lost Signal    /lost/session /lost/score /lost/name /lost/leaderboard      (come sopra, game = 'lost')
   Maze e Lost rifanno la partita con il proprio motore (verify.js); i comandi di Lost sono a passi fissi di 5 ms.
   ===================================================================== */
import { replay, cleanInputs } from '../faind-game/sim.js';
import { cleanMazeInputs, replayMaze, cleanLostInputs, replayLost } from './verify.js';

const COUNTRIES = new Set('IT FR DE ES GB US PT NL BE CH AT IE SE NO DK FI PL CZ GR RO HU BG HR RS UA TR CA MX BR AR CL CO PE JP KR CN IN ID TH VN PH SG MY AU NZ ZA EG MA NG KE IL AE SA PK BD RU SK SI LT LV EE LU MT CY IS AL BA MK ME'.split(' '));
const BLOCKED = new Set('ASS FUK FCK CUM SEX XXX KKK SS NAZ NZI HIV WTF TIT FAG GAY JEW CUL CAZ FIC MER STR TRO PUT PIS BUT GOD DIO'.split(' '));
const MAX_ELAPSED_MS = 6 * 3600 * 1000;      // un gettone vecchio di ore non vale
const LIMITS = { perMinute: 6, perHour: 60 };

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}
async function sign(secret, payload) { return payload + '.' + await hmac(secret, payload); }
async function verify(secret, token) {
  if (typeof token !== 'string' || token.length > 300) return null;
  const i = token.lastIndexOf('.'); if (i < 0) return null;
  const payload = token.slice(0, i), mac = token.slice(i + 1);
  const good = await hmac(secret, payload);
  if (good.length !== mac.length) return null;
  let d = 0; for (let k = 0; k < good.length; k++) d |= good.charCodeAt(k) ^ mac.charCodeAt(k);
  return d === 0 ? payload.split('|') : null;
}
async function ipHash(secret, request) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  return (await hmac(secret, 'ip|' + ip)).slice(0, 22);
}

/** Lunedì 00:00 (ora di Roma) della settimana che contiene l'istante dato, come YYYY-MM-DD. */
export function romeWeek(ms) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(new Date(ms));
  const g = (t) => parts.find((p) => p.type === t).value;
  const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(g('weekday'));
  const day = Date.UTC(+g('year'), +g('month') - 1, +g('day')) - idx * 86400000;
  return new Date(day).toISOString().slice(0, 10);
}

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || 'https://faind.org,https://www.faind.org,https://itartedesign-dot.github.io').split(',').map((s) => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return ok ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : { Vary: 'Origin' };
}
const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}) });

async function readJson(request) {
  const len = +(request.headers.get('Content-Length') || 0);
  if (len > 400000) return null;
  try { const txt = await request.text(); if (txt.length > 400000) return null; return JSON.parse(txt); } catch (e) { return null; }
}

/** Descrizione dei giochi: tabelle, filtro sul gioco, verifica della partita ({ error } oppure il risultato) e scrittura del punteggio. */
const GAMES = {
  news: {
    sessions: 'sessions', scores: 'scores', game: null,
    verify(seed, body, elapsed) {
      const inputs = cleanInputs(body.inputs);
      if (!inputs) return { error: 'bad_inputs' };
      // la partita si rifà prima di usare il gettone; finisce al terzo rotolo perso (o al tetto di sicurezza)
      const sim = replay(seed, inputs);
      if (!sim.done) return { error: 'bad_game' };
      // il tempo reale passato deve bastare per quanto è durata la partita (con un po' di margine)
      if (elapsed < (sim.steps / 60) * 1000 * 0.95 - 3000) return { error: 'too_fast' };
      return { score: sim.score, cols: [sim.delivered, sim.lost], out: { delivered: sim.delivered, lost: sim.lost } };
    },
    insert: (db, id, r, now, week) => db.prepare('INSERT INTO scores (id, score, delivered, lost, created_at, week, initials, country) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)').bind(id, r.score, r.cols[0], r.cols[1], now, week).run()
  },
  maze: {
    sessions: 'game_sessions', scores: 'game_scores', game: 'maze',
    verify(seed, body, elapsed) {
      if (body.continued) return { error: 'bad_game' };   // il browser non invia partite con continue; se lo dichiara, non è in classifica
      const inputs = cleanMazeInputs(body.inputs);
      if (!inputs) return { error: 'bad_inputs' };
      const r = replayMaze(seed, inputs);
      if (r.error) return r;
      if (elapsed < r.ms * 0.95 - 3000) return { error: 'too_fast' };
      return { score: r.score, cols: [r.level, r.detail], out: { level: r.level, delivered: r.detail, won: r.won } };
    }
  },
  lost: {
    sessions: 'game_sessions', scores: 'game_scores', game: 'lost',
    verify(seed, body, elapsed) {
      if (body.continued) return { error: 'bad_game' };
      const inputs = cleanLostInputs(body.inputs);
      if (!inputs) return { error: 'bad_inputs' };
      const r = replayLost(inputs);
      if (r.error) return r;
      if (elapsed < r.ms * 0.95 - 3000) return { error: 'too_fast' };
      return { score: r.score, cols: [r.level, r.detail], out: { level: r.level, news: r.detail, won: r.won } };
    }
  }
};
for (const k of ['maze', 'lost']) {
  GAMES[k].insert = (db, id, r, now, week) => db.prepare('INSERT INTO game_scores (id, game, score, level, detail, created_at, week, initials, country) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)').bind(id, k, r.score, r.cols[0], r.cols[1], now, week).run();
}
/** Frammento SQL e valori da aggiungere alle query per restringerle al gioco (News Rush non ha la colonna). */
const only = (G) => (G.game ? { sql: ' AND game = ?', args: [G.game] } : { sql: '', args: [] });

/** Gettoni e claim: News Rush li firma come prima ('s|id|seed|ora', 'c|id|punti'); Maze e Lost aggiungono il nome del gioco dopo la lettera, così non valgono per un altro gioco. */
const tag = (G) => (G.game ? [G.game] : []);
const mine = (tk, kind, G, n) => tk[0] === kind && tk.length === 1 + tag(G).length + n && (!G.game || tk[1] === G.game);

async function rankIn(db, G, score, week) {
  const f = only(G);
  const q = week
    ? db.prepare(`SELECT COUNT(*) AS n FROM ${G.scores} WHERE initials IS NOT NULL AND week = ? AND score >= ?${f.sql}`).bind(week, score, ...f.args)
    : db.prepare(`SELECT COUNT(*) AS n FROM ${G.scores} WHERE initials IS NOT NULL AND score >= ?${f.sql}`).bind(score, ...f.args);
  const r = await q.first();
  return 1 + (r ? r.n : 0);            // a parità precede chi è già stato registrato
}

export async function handle(request, env, now) {
  now = now || Date.now();
  const url = new URL(request.url);
  let path = url.pathname.replace(/\/+$/, '') || '/', G = GAMES.news;
  const pre = /^\/(maze|lost)(\/.*)$/.exec(path);
  if (pre) { G = GAMES[pre[1]]; path = pre[2]; }
  const headers = cors(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const reply = (obj, status) => json(obj, status, headers);
  const secret = env.SESSION_SECRET;
  if (!secret || !env.DB) return reply({ error: 'not_configured' }, 503);

  try {
    const f = only(G);
    if (request.method === 'GET' && path === '/leaderboard') {
      const week = romeWeek(now);
      const cols = 'initials, country, score';
      const w = await env.DB.prepare(`SELECT ${cols} FROM ${G.scores} WHERE initials IS NOT NULL AND week = ?${f.sql} ORDER BY score DESC, created_at ASC, id ASC LIMIT 10`).bind(week, ...f.args).all();
      const a = await env.DB.prepare(`SELECT ${cols} FROM ${G.scores} WHERE initials IS NOT NULL${f.sql} ORDER BY score DESC, created_at ASC, id ASC LIMIT 10`).bind(...f.args).all();
      return json({ weekly: w.results, all: a.results, weekStart: week }, 200, Object.assign({}, headers, { 'Cache-Control': 'public, max-age=10' }));
    }

    if (request.method === 'POST' && path === '/session') {
      const ip = await ipHash(secret, request);
      const m = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${G.sessions} WHERE ip = ? AND created_at > ?${f.sql}`).bind(ip, now - 60000, ...f.args).first();
      const h = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${G.sessions} WHERE ip = ? AND created_at > ?${f.sql}`).bind(ip, now - 3600000, ...f.args).first();
      if (m.n >= LIMITS.perMinute || h.n >= LIMITS.perHour) return reply({ error: 'rate_limited' }, 429);
      const rnd = crypto.getRandomValues(new Uint32Array(3));
      const seed = rnd[0] | 0, id = rnd[1].toString(36) + rnd[2].toString(36);
      if (G.game) await env.DB.prepare(`INSERT INTO ${G.sessions} (id, game, seed, created_at, ip, submitted) VALUES (?, ?, ?, ?, ?, 0)`).bind(id, G.game, seed, now, ip).run();
      else await env.DB.prepare(`INSERT INTO ${G.sessions} (id, seed, created_at, ip, submitted) VALUES (?, ?, ?, ?, 0)`).bind(id, seed, now, ip).run();
      if (rnd[2] % 50 === 0) await env.DB.prepare(`DELETE FROM ${G.sessions} WHERE created_at < ?`).bind(now - 2 * 86400000).run();
      return reply({ token: await sign(secret, ['s'].concat(tag(G), id, seed, now).join('|')), seed });
    }

    if (request.method === 'POST' && path === '/score') {
      const body = await readJson(request);
      if (!body) return reply({ error: 'bad_request' }, 400);
      const tk = await verify(secret, body.token);
      if (!tk || !mine(tk, 's', G, 3)) return reply({ error: 'bad_token' }, 400);
      const k = tag(G).length, id = tk[1 + k], seed = parseInt(tk[2 + k], 10), created = parseInt(tk[3 + k], 10);
      const elapsed = now - created;
      if (elapsed > MAX_ELAPSED_MS) return reply({ error: 'expired' }, 422);
      const r = G.verify(seed, body, elapsed);
      if (r.error) return reply({ error: r.error }, 422);
      // un gettone si usa una volta sola: l'aggiornamento è atomico, quindi due invii insieme non passano entrambi
      const used = await env.DB.prepare(`UPDATE ${G.sessions} SET submitted = 1 WHERE id = ? AND submitted = 0`).bind(id).run();
      if (!used.meta || used.meta.changes !== 1) return reply({ error: 'already_submitted' }, 409);
      const week = romeWeek(now), score = r.score;
      await G.insert(env.DB, id, r, now, week);
      const rw = score > 0 ? await rankIn(env.DB, G, score, week) : 99, ra = score > 0 ? await rankIn(env.DB, G, score, null) : 99;
      const out = Object.assign({ score }, r.out, { weekly: { rank: rw <= 10 ? rw : null }, all: { rank: ra <= 10 ? ra : null } });
      if (rw <= 10 || ra <= 10) out.claim = await sign(secret, ['c'].concat(tag(G), id, score).join('|'));
      return reply(out);
    }

    if (request.method === 'POST' && path === '/name') {
      const body = await readJson(request);
      if (!body) return reply({ error: 'bad_request' }, 400);
      const tk = await verify(secret, body.claim);
      if (!tk || !mine(tk, 'c', G, 2)) return reply({ error: 'bad_token' }, 400);
      const initials = String(body.initials || '').toUpperCase(), country = String(body.country || '').toUpperCase();
      if (!/^[A-Z]{3}$/.test(initials) || !COUNTRIES.has(country) || BLOCKED.has(initials)) return reply({ error: 'bad_name' }, 400);
      const u = await env.DB.prepare(`UPDATE ${G.scores} SET initials = ?, country = ? WHERE id = ? AND initials IS NULL`).bind(initials, country, tk[1 + tag(G).length]).run();
      if (!u.meta || u.meta.changes !== 1) return reply({ error: 'already_named' }, 409);
      return reply({ ok: true });
    }

    return reply({ error: 'not_found' }, 404);
  } catch (e) {
    return reply({ error: 'server_error' }, 500);
  }
}

export default { fetch: (request, env) => handle(request, env) };
