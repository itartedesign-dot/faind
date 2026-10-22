// Prova del motore: un "giocatore" automatico attraversa i cinque livelli; il replay deve dare lo stesso risultato.
import { Sim, replay, CONFIG as C } from '../faind-game/sim.js';
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
    tot.push([s.score, s.delivered, s.lost, s.level, s.tick]);
  }
  const avg = i => (tot.reduce((a, b) => a + b[i], 0) / tot.length).toFixed(1);
  console.log('reazione ogni', skill, 'tick -> punteggio medio', avg(0), 'consegnate', avg(1), 'perse', avg(2), 'livello medio', (tot.reduce((a, b) => a + b[3], 0) / tot.length).toFixed(1), 'minuti', (tot.reduce((a, b) => a + b[4], 0) / tot.length / 3600).toFixed(1));
}
// livelli senza fine: nessun limite di tempo, si sale ogni LEVEL_SCROLLS consegne, si finisce solo al terzo rotolo perso
const s = new Sim(5); const lv = [];
while (!s.done) {
  s.input(aim(s)); s.step(); for (const e of s.events) if (e.type === 'level') lv.push([s.tick, e.a, e.b]); s.events.length = 0;
}
console.log('cambi livello (tick, livello, capacità)', JSON.stringify(lv.slice(0, 8)), '... ultimo', JSON.stringify(lv[lv.length - 1]), 'fine tick', s.tick, 'consegnate', s.delivered);
assert.ok(lv.length >= 4 && lv[0][1] === 2 && lv[0][2] === 4 && lv[3][2] === 1, 'la capacità scende fino a 1');
assert.ok(lv.every((x, i) => x[1] === i + 2), 'un livello alla volta');
assert.equal(s.level, Math.floor(s.delivered / C.LEVEL_SCROLLS) + 1);
const idle = new Sim(5); while (!idle.done) { idle.step(); idle.events.length = 0; }
assert.ok(idle.over && idle.lost === 3 && idle.tick < 1500); console.log('game over a tick', idle.tick, 'score', idle.score);
// la notizia del braccio vale 1000 fissi, le altre 100 × moltiplicatore
const sc = new Sim(1); sc.load = 3; sc.armLoad = 1; sc.x = C.DELIVER_X; sc.target = C.DELIVER_X; sc.step();
assert.equal(sc.score, 1000 + 100 + 100); assert.equal(sc.armLoad, 0); assert.equal(sc.delivered, 3);
// difficoltà crescente: parametri monotoni
import { levelParams } from '../faind-game/sim.js';
for (let l = 4; l <= 30; l++) { const a = levelParams(l - 1), b = levelParams(l); assert.ok(b.fall >= a.fall && b.gap <= a.gap && b.reach >= a.reach && b.cap <= a.cap); }
console.log('OK');
