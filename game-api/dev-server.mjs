// Server di prova in locale (non è quello di produzione): `node --no-warnings game-api/dev-server.mjs [porta]`
// Poi in faind-game/config.js (solo sul tuo computer): window.FAIND_GAME_API = 'http://localhost:8124';
import http from 'node:http';
import { handle } from './worker.js';
import { makeDb } from './d1-shim.mjs';

const { db } = makeDb();
const env = { DB: db, SESSION_SECRET: 'solo-per-prove-in-locale' };
const port = +(process.argv[2] || 8124);
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const r = await handle(new Request('http://localhost:' + port + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env, Date.now() + (process.env.DEV_SKIP_WAIT && /^\/(maze\/|lost\/)?score/.test(req.url) ? 181000 : 0));   // DEV_SKIP_WAIT=1: salta i 180 s d'attesa (solo prove)
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log('classifica di prova su http://localhost:' + port));
