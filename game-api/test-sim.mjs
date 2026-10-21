// Prova del motore: un "giocatore" automatico attraversa i cinque livelli; il replay deve dare lo stesso risultato.
import { Sim, replay, CONFIG as C, END_TICK, LEVEL_TICKS } from '../faind-game/sim.js';
import assert from 'node:assert';

function play(seed, skill) {
  const s = new Sim(seed), perLevel = {}, caps = new Set();
  let reaction = 0;
  while (!s.done) {
    // bersaglio: scaricare se pieno (o se resta poco tempo), altrimenti il rotolo più vicino al suolo che si raggiunge
    let tgt = s.target;
    if (s.load >= s.cap || (s.load > 0 && s.rolls.length === 0)) tgt = C.DELIVER_X;
    else if (s.rolls.length) {
      const r = s.rolls.slice().sort((a, b) => b.y - a.y)[0];
      tgt = r.x;
    } else if (s.load > 0) tgt = C.DELIVER_X;
    if (s.tick % skill === 0) s.input(tgt);
    s.step();
    for (const e of s.events) if (e.type === 'collect') caps.add(s.load);
    s.events.length = 0;
    const lv = s.level; perLevel[lv] = perLevel[lv] || { score: 0, lost: 0 };
  }
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
// capacità e livelli
const s = new Sim(5); const lv = [];
while (!s.done) { s.step(); for (const e of s.events) if (e.type === 'level') lv.push([s.tick, e.a, e.b]); s.events.length = 0; }
console.log('cambi livello', JSON.stringify(lv), 'fine tick', s.tick, END_TICK);
assert.equal(s.tick, 10800);
console.log('OK');
