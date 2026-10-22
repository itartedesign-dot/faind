// Copia il motore di Lost Signal in game-api/engines/lost/ senza il "?v=..." degli import (esbuild di wrangler non li risolve).
// Lo lancia wrangler prima di ogni deploy ([build] in wrangler.toml). `node sync-engines.mjs --check` fallisce se la copia è vecchia.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = (f) => fileURLToPath(new URL('../lost-signal/' + f, import.meta.url));
const dstDir = fileURLToPath(new URL('./engines/lost/', import.meta.url));
const FILES = ['sim.js', 'levels.js', 'levelgen.js', 'levels-data.js'];
const check = process.argv.includes('--check');
let stale = 0;
mkdirSync(dstDir, { recursive: true });
for (const f of FILES) {
  const out = '// COPIA GENERATA da lost-signal/' + f + ' con game-api/sync-engines.mjs: non modificare qui.\n' + readFileSync(src(f), 'utf8').replace(/(from\s+'[^']+?)\?v=[^']*'/g, "$1'");
  const dst = dstDir + f;
  if (check) { if (!existsSync(dst) || readFileSync(dst, 'utf8') !== out) { stale++; console.error('copia non aggiornata: engines/lost/' + f); } }
  else writeFileSync(dst, out);
}
if (check && stale) { console.error('Esegui: node game-api/sync-engines.mjs'); process.exit(1); }
