// Genera le mappe di Lost Signal con levelgen.js, le verifica e scrive levels-data.js. Uso: node tools/build-levels.mjs [numero-livelli]
import { generate, analyze, params } from '../levelgen.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const n = parseInt(process.argv[2] || '15', 10), out = [];
for (let level = 1; level <= n; level++) {
  const g = generate(level, 1);
  if (!g) { console.error('livello', level, 'non generato'); process.exit(1); }
  const a = analyze(g.rows), P = params(level);
  console.log(`\nLivello ${level}  zolle ${a.tiles}  salti ${a.jumpEdges}  salti per il portone ${a.jumpsToGoal}  salti per i giornali ${a.jumpsToNews}  (tentativo ${g.attempt}, rilassamento ${g.relax}, previsti ${P.jumps}+${P.branchJumps})`);
  console.log(g.rows.join('\n'));
  out.push({ rows: g.rows, jumps: g.jumps });
}
const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'levels-data.js');
writeFileSync(file, '/* Generato da tools/build-levels.mjs (levelgen.js). Non modificare a mano: rigenerare. */\nexport const LEVEL_DATA = ' + JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{') + ';\n');
console.log('\nscritto', file);
