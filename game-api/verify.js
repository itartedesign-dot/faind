/* =====================================================================
   FAIND GAME — verifica delle partite di Signal Maze e Lost Signal
   ---------------------------------------------------------------------
   Il browser invia solo i comandi del giocatore: qui la partita si rifà da zero con lo stesso motore del gioco e il punteggio lo
   calcola il server. Ogni funzione restituisce { error } oppure { score, level, detail, won, ms }, dove ms è la durata della
   partita al netto di pause e schermate (il server la confronta col tempo reale passato dal gettone).
   ===================================================================== */
import { Sim as MazeSim, CONFIG as MAZE } from '../signal-maze/sim.js';
import { Sim as LostSim } from './engines/lost/sim.js';

// tetti di sicurezza: il punteggio vero esce dal replay, questi bloccano solo valori impossibili
export const MAX_SCORE = { maze: 150000, lost: 37500 };   // maze: 15 livelli da circa 4800 + bonus tempo, con ampio margine; lost: 15 × (1000 + 3 × 500)
const MAZE_MAX_TICKS = MAZE.TOTAL_TIME * MAZE.TPS + 2;
const LOST_LEVELS = 15, LOST_QUANTUM = 5, LOST_MAX_MS = 40 * 60 * 1000, LOST_TAIL_MS = 30000;
const MAX_ENTRIES = 40000;

const isInt = (n) => Number.isInteger(n);

/** Signal Maze: inputs = [[tick, [direzioni 0-3, al massimo due]], ...] con tick crescenti. */
export function cleanMazeInputs(inputs) {
  if (!Array.isArray(inputs) || inputs.length > MAX_ENTRIES) return null;
  let prev = 0;
  for (const e of inputs) {
    if (!Array.isArray(e) || e.length !== 2 || !isInt(e[0]) || e[0] < prev || e[0] > MAZE_MAX_TICKS) return null;
    if (!Array.isArray(e[1]) || e[1].length > 2 || !e[1].every((d) => isInt(d) && d >= 0 && d <= 3)) return null;
    prev = e[0];
  }
  return inputs;
}
const MAZE_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function replayMaze(seed, inputs) {
  const sim = new MazeSim(seed);
  let i = 0;
  for (let guard = 0; sim.phase !== 'over' && guard < MAZE_MAX_TICKS + 100; guard++) {
    if (sim.phase === 'between') sim.advance();       // la pausa fra i livelli non fa scorrere il tempo di gioco
    while (i < inputs.length && inputs[i][0] <= sim.tick) sim.input(inputs[i++][1].map((d) => MAZE_DIRS[d]));
    sim.step(); sim.events.length = 0;
  }
  if (sim.phase !== 'over') return { error: 'bad_game' };
  if (sim.score > MAX_SCORE.maze) return { error: 'bad_score' };
  return { score: sim.score, level: sim.level, detail: sim.stats.delivered, won: !!sim.won, ms: sim.tick / MAZE.TPS * 1000 };
}

/** Lost Signal: inputs = [[ms, codice], ...] con ms multipli di 5 crescenti; codice 0-3 passo, 4-7 orientamento, 8 salto, 9 flash. */
export function cleanLostInputs(inputs) {
  if (!Array.isArray(inputs) || inputs.length > MAX_ENTRIES) return null;
  let prev = 0;
  for (const e of inputs) {
    if (!Array.isArray(e) || e.length !== 2 || !isInt(e[0]) || e[0] < prev || e[0] > LOST_MAX_MS || e[0] % LOST_QUANTUM !== 0) return null;
    if (!isInt(e[1]) || e[1] < 0 || e[1] > 9) return null;
    prev = e[0];
  }
  return inputs;
}

export function replayLost(inputs) {
  const sim = new LostSim(LOST_LEVELS);
  const end = Math.min(LOST_MAX_MS, (inputs.length ? inputs[inputs.length - 1][0] : 0) + LOST_TAIL_MS);
  let i = 0;
  while (!sim.over && sim.phase !== 'won' && sim.clock <= end) {
    while (i < inputs.length && inputs[i][0] <= sim.clock) {
      const [at, c] = inputs[i++];
      if (at !== sim.clock) return { error: 'bad_game' };
      const ok = c < 4 ? sim.step(c) : c < 8 ? sim.turn(c - 4) : c === 8 ? sim.jump() : sim.flash();
      if (!ok) return { error: 'bad_game' };            // un comando che il gioco non avrebbe accettato: la partita non è vera
    }
    sim.update(LOST_QUANTUM); sim.events.length = 0;
  }
  if (!sim.over && sim.phase !== 'won') return { error: 'bad_game' };
  if (sim.score > MAX_SCORE.lost) return { error: 'bad_score' };
  return { score: sim.score, level: sim.level, detail: sim.stats.news, won: sim.phase === 'won', ms: sim.clock };
}
