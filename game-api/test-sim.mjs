// Prova del motore: un "giocatore" automatico attraversa i cinque livelli; il replay deve dare lo stesso risultato.
import { Sim, replay, CONFIG as C, END_TICK, LEVEL_TICKS } from '../faind-game/sim.js';
import assert from 'node:assert';

// giocatore automatico: insegue i rotoli buoni e si sposta se una rossa gli cade addosso
function aim(s) {
  let tg = s.target;
  const good = s.rolls.filter(r => !r.red);
  if (s.load >= s.cap || (s.load > 0 && !good.length)) tg = C.DELIVER_X; else if (good.length) tg = good.sort((a, b) => b.y - a.y)[0].x;
  const a = s.armState();   // il braccio: lo si insegue solo se nessun rotolo buono sta per arrivare
  if (a && !a.taken && s.load < s.cap && !good.some(r => r.y > 75)) tg = a.x;
  for (const r of s.rolls) if (r.red && r.y > 70 && Math.abs(r.x - s.x) < 22) { tg = r.x > s.x ? Math.max(C.FX_MIN, r.x - 34) : Math.min(C.FX_MAX, r.x + 34); }
  return tg;
}
function play(seed, skill) {
  const s = new Sim(seed);
  while (!s.done) { if (s.tick % skill === 0) s.input(aim(s)); s.step(); s.events.length = 0; }
  return s;
}
for (const skill of [1, 6, 12]) {
  const tot = [];
  for (let seed = 1; seed <= 20; seed++) {
    const s = play(seed * 7919, skill);
    const r = replay(s.seed, s.inputs);
    assert.equal(r.score, s.score); assert.equal(r.delivered, s.delivered); assert.equal(r.lost, s.lost);
    tot.push([s.score, s.delivered, s.lost]);
  }
  const avg = i => (tot.reduce((a, b) => a + b[i], 0) / tot.length).toFixed(1);
  console.log('reazione ogni', skill, 'tick -> punteggio medio', avg(0), 'consegnate', avg(1), 'perse', avg(2));
}
// capacità e livelli (giocatore automatico) e game over al terzo rotolo perso (nessun comando)
const s = new Sim(5); const lv = [];
while (!s.done) {
  s.input(aim(s)); s.step(); for (const e of s.events) if (e.type === 'level') lv.push([s.tick, e.a, e.b]); s.events.length = 0;
}
console.log('cambi livello', JSON.stringify(lv), 'fine tick', s.tick, END_TICK);
assert.equal(s.tick, 10800); assert.deepEqual(lv.map(x => x[2]), [4, 3, 2, 1]); assert.equal(s.over, false);
const idle = new Sim(5); while (!idle.done) { idle.step(); idle.events.length = 0; }
assert.ok(idle.over && idle.lost === 3 && idle.tick < 10800); console.log('game over a tick', idle.tick, 'score', idle.score);
console.log('OK');
