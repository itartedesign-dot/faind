// Genera le mappe di Lost Signal con levelgen.js, le verifica e scrive levels-data.js. Uso: node tools/build-levels.mjs [numero-livelli]
// Dal livello 10 ogni mappa riceve anche ascensori e corsie delle rocce (makeExtras); se la mappa non li ammette si prova il seme dopo.
// Oltre il livello 15 la mappa ha la difficoltà del 15 (params è già limitato) e un seme diverso per ogni livello.
import { generate, analyze, params, makeExtras, mulberry, extrasFor } from '../levelgen.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const n = parseInt(process.argv[2] || '50', 10), out = [];
for (let level = 1; level <= n; level++) {
  let g = null, ex = null, seed = 1;
  for (; seed < 400 && !ex; seed++) {
    g = generate(Math.min(15, level), seed + (level > 15 ? level * 977 : 0));
    if (!g) continue;
    ex = makeExtras(g.rows, level, mulberry(level * 7919 + seed * 104729));
  }
  if (!g || !ex) { console.error('livello', level, 'non generato'); process.exit(1); }
  const a = analyze(g.rows), P = params(level);
  console.log(`\nLivello ${level}  seme ${seed - 1}  zolle ${a.tiles}  salti ${a.jumpEdges}  salti per il portone ${a.jumpsToGoal}  salti per i giornali ${a.jumpsToNews}  (tentativo ${g.attempt}, rilassamento ${g.relax}, previsti ${P.jumps}+${P.branchJumps})  ascensori ${ex.lifts.length}  rocce ${ex.rocks.length}`);
  console.log(g.rows.join('\n'));
  const e = { rows: g.rows, jumps: g.jumps };
  if (extrasFor(level)) { e.lifts = ex.lifts; e.rocks = ex.rocks; }
  out.push(e);
}
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'levels-data.js');
writeFileSync(file, '/* Generato da tools/build-levels.mjs (levelgen.js). Non modificare a mano: rigenerare. */\nexport const LEVEL_DATA = ' + JSON.stringify(out, null, 0).replace(/\},\{"rows"/g, '},\n{"rows"') + ';\n');
console.log('\nscritto', file);
