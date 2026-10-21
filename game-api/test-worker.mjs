// Prova del server della classifica con un D1 finto fatto con node:sqlite (stesse istruzioni SQL di schema.sql).
import assert from 'node:assert';
import { handle, romeWeek } from './worker.js';
import { Sim, CONFIG as C } from '../faind-game/sim.js';
import { makeDb } from './d1-shim.mjs';

const { db: DB, sqlite } = makeDb();
const env = { DB, SESSION_SECRET: 'prova-segreta' };
const T0 = Date.UTC(2026, 9, 21, 10, 0, 0);   // mercoledì 21 ottobre 2026
const call = async (m, p, body, now, ip) => { const r = await handle(new Request('https://x.test' + p, { method: m, headers: { 'Content-Type': 'application/json', Origin: 'https://faind.org', 'CF-Connecting-IP': ip || '1.1.1.1' }, body: body ? JSON.stringify(body) : undefined }), env, now); return { s: r.status, j: await r.json(), h: r.headers }; };

function bot(seed, lazy) {
  const s = new Sim(seed);
  while (!s.done) {
    let tg = s.target;
    if (!lazy) {
      if (s.load >= s.cap || (s.load > 0 && !s.rolls.length)) tg = C.DELIVER_X;
      else if (s.rolls.length) tg = s.rolls.slice().sort((a, b) => b.y - a.y)[0].x;
    } else tg = 20;
    s.input(tg); s.step(); s.events.length = 0;
  }
  return s;
}

// settimane: lunedì 00:00 ora di Roma (anche attorno al cambio ora legale del 25 ottobre 2026)
assert.equal(romeWeek(Date.UTC(2026, 9, 18, 22, 30)), '2026-10-19');   // lunedì 00:30 Roma → nuova settimana
assert.equal(romeWeek(Date.UTC(2026, 9, 18, 21, 59)), '2026-10-12');   // domenica 23:59 Roma → settimana precedente
assert.equal(romeWeek(Date.UTC(2026, 9, 25, 22, 30)), '2026-10-19');   // domenica 25 (cambio ora legale) 23:30 Roma, ancora la stessa
assert.equal(romeWeek(Date.UTC(2026, 9, 25, 23, 30)), '2026-10-26');   // lunedì 26 00:30 Roma
assert.equal(romeWeek(T0), '2026-10-19');

async function play(ip, now, lazy) {
  const se = await call('POST', '/session', {}, now, ip); assert.equal(se.s, 200);
  const seed = se.j.seed, sim = bot(seed, lazy);
  return { token: se.j.token, sim };
}

// partita regolare
let g = await play('2.2.2.2', T0, false);
let r = await call('POST', '/score', { token: g.token, inputs: g.sim.inputs }, T0 + 181000);
assert.equal(r.s, 200); assert.equal(r.j.score, g.sim.score); assert.ok(r.j.claim); assert.equal(r.j.weekly.rank, 1);
console.log('punteggio verificato', r.j.score, 'rank', r.j.weekly.rank, r.j.all.rank);
const claim1 = r.j.claim;
// doppio invio
r = await call('POST', '/score', { token: g.token, inputs: g.sim.inputs }, T0 + 182000); assert.equal(r.s, 409);
// gettone manomesso / altro segreto
r = await call('POST', '/score', { token: g.token.slice(0, -2) + 'xx', inputs: [] }, T0 + 182000); assert.equal(r.s, 400);
// troppo veloce
let g2 = await play('3.3.3.3', T0, false);
r = await call('POST', '/score', { token: g2.token, inputs: g2.sim.inputs }, T0 + 30000); assert.equal(r.s, 422); assert.equal(r.j.error, 'too_fast');
// comandi non validi
let g3 = await play('4.4.4.4', T0, false);
r = await call('POST', '/score', { token: g3.token, inputs: [[5, 9999]] }, T0 + 181000); assert.equal(r.s, 422);
// punteggio non inviato dal client: anche con comandi diversi il server calcola il suo (partita pigra = punteggio basso)
let g4 = await play('5.5.5.5', T0, true);
r = await call('POST', '/score', { token: g4.token, inputs: g4.sim.inputs, score: 999999 }, T0 + 181000);
assert.equal(r.s, 200); assert.equal(r.j.score, g4.sim.score); assert.ok(r.j.score < 5000);
// nome: iniziali valide, nazione dall'elenco, una volta sola
r = await call('POST', '/name', { claim: claim1, initials: 'ab1', country: 'IT' }, T0 + 183000); assert.equal(r.s, 400);
r = await call('POST', '/name', { claim: claim1, initials: 'abc', country: 'ZZ' }, T0 + 183000); assert.equal(r.s, 400);
r = await call('POST', '/name', { claim: claim1, initials: 'abc', country: 'it' }, T0 + 183000); assert.equal(r.s, 200);
r = await call('POST', '/name', { claim: claim1, initials: 'xyz', country: 'IT' }, T0 + 183000); assert.equal(r.s, 409);
r = await call('POST', '/name', { claim: 'c|zz|1.abc', initials: 'xyz', country: 'IT' }, T0 + 183000); assert.equal(r.s, 400);
let lb = await call('GET', '/leaderboard', null, T0 + 184000);
assert.equal(lb.j.weekly.length, 1); assert.deepEqual(lb.j.weekly[0], { initials: 'ABC', country: 'IT', score: g.sim.score });
assert.equal(lb.h.get('Access-Control-Allow-Origin'), 'https://faind.org');
// pari punteggio: precede il registrato prima (stessa partita giocata due volte con lo stesso seme non serve: forzo due righe)
sqlite.exec(`INSERT INTO scores VALUES ('t1',5000,1,0,${T0 + 1},'2026-10-19','TIE','FR'),('t2',5000,1,0,${T0 + 2},'2026-10-19','TWO','DE'),('old',900000,1,0,${T0 - 9 * 86400000},'2026-10-05','OLD','ES')`);
lb = await call('GET', '/leaderboard', null, T0 + 185000);
assert.deepEqual(lb.j.weekly.map(x => x.initials), ['ABC', 'TIE', 'TWO']);
assert.equal(lb.j.all[0].initials, 'OLD');
// la settimana dopo la classifica settimanale riparte da zero, quella assoluta no
lb = await call('GET', '/leaderboard', null, Date.UTC(2026, 9, 26, 10));
assert.equal(lb.j.weekly.length, 0); assert.equal(lb.j.all.length, 4);
// limite di richieste per IP
let last; for (let i = 0; i < 8; i++) last = await call('POST', '/session', {}, T0 + 500000, '9.9.9.9');
assert.equal(last.s, 429);
// CORS: origine non ammessa non riceve l'intestazione
const bad = await handle(new Request('https://x.test/leaderboard', { headers: { Origin: 'https://evil.example' } }), env, T0);
assert.equal(bad.headers.get('Access-Control-Allow-Origin'), null);
// senza configurazione
const nc = await handle(new Request('https://x.test/leaderboard'), {}, T0); assert.equal(nc.status, 503);
console.log('OK');
