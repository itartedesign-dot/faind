/* =====================================================================
   FAIND — immagini generate in automatico
   ---------------------------------------------------------------------
   • shot(): trasforma una pagina HTML in un'immagine PNG usando il browser
     Chrome già presente sulle macchine di GitHub (nessuna installazione).
   • buildCards(): per ogni pagina notizia crea la "card" 1200×630 con il
     marchio FAIND (cartella og/), quella che compare quando il link viene
     condiviso su Telegram, WhatsApp, LinkedIn, Facebook…

   Le card già fatte vengono riprese dal sito online; a ogni giro se ne
   disegnano al massimo CARDS_PER_RUN nuove, così l'aggiornamento resta
   veloce. Se Chrome non è disponibile non succede nulla di grave: le
   pagine usano l'immagine della fonte o il logo, come prima.
   ===================================================================== */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import zlib from 'node:zlib';
import path from 'node:path';

const CARDS_PER_RUN = 60;
const PARALLEL = 4;
const EXTRA = 240;   // Chrome a volte cattura un'area più bassa della finestra: catturo di più e poi ritaglio

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));

/* ---------- PNG: ritaglio in altezza senza librerie ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
export function cropPng(buf, height) {
  if (buf.readUInt32BE(0) !== 0x89504E47) throw new Error('non è un PNG');
  let pos = 8, ihdr = null; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = Buffer.from(data); else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4), depth = ihdr[8], color = ihdr[9];
  if (depth !== 8 || ihdr[12] !== 0 || ![2, 6].includes(color)) throw new Error('formato PNG non previsto');
  if (height >= h) return buf;
  const bpp = color === 6 ? 4 : 3, stride = w * bpp;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc((stride + 1) * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let add = 0;
      if (f === 1) add = a; else if (f === 2) add = b; else if (f === 3) add = (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = (line[x] + add) & 255;
    }
    out[y * (stride + 1)] = 0; line.copy(out, y * (stride + 1) + 1);
    prev = line;
  }
  ihdr.writeUInt32BE(height, 4);
  return Buffer.concat([buf.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(out, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- Cattura di una pagina HTML ---------- */
let chromeBin;   // undefined = da cercare, null = non disponibile
function run(bin, args) {
  return new Promise((resolve, reject) => execFile(bin, args, { timeout: 45000 }, (err) => err ? reject(err) : resolve()));
}
export async function shot(htmlFile, pngFile, w, h) {
  if (chromeBin === null) throw new Error('browser non disponibile');
  const args = ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${w},${h + EXTRA}`, '--virtual-time-budget=4000', `--screenshot=${pngFile}`, pathToFileURL(htmlFile).href];
  const bins = chromeBin ? [chromeBin] : [process.env.CHROME_BIN, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean);
  let last = new Error('browser non trovato');
  for (const bin of bins) {
    try { await run(bin, args); chromeBin = bin; await writeFile(pngFile, cropPng(await readFile(pngFile), h)); return; }
    catch (e) { last = e; }
  }
  if (!chromeBin) chromeBin = null;
  throw last;
}

/* ---------- Card di condivisione ---------- */
function cardHtml(n, cat, up) {
  const title = tx(n.title);
  const size = title.length > 120 ? 50 : title.length > 80 ? 58 : title.length > 45 ? 68 : 80;
  const more = (n.also || []).length;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${up}assets/fonts/archivo.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{background:#0E1222}
body{width:1200px;height:630px;overflow:hidden;background:#0E1222;color:#fff;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;position:relative}
.top{position:absolute;left:64px;right:64px;top:44px;display:flex;align-items:center;justify-content:space-between}
.top img{height:78px;border-radius:8px}
.cat{font-size:24px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0E1222;background:#8FD0F0;padding:8px 18px;border-radius:8px}
h1{position:absolute;left:64px;right:64px;top:160px;height:340px;display:flex;align-items:center;font-size:${size}px;line-height:1.08;font-weight:800;font-stretch:80%;letter-spacing:-.01em}
h1 span{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${size >= 68 ? 4 : 5};overflow:hidden}
.bar{position:absolute;left:0;right:0;top:536px;height:94px;background:#4293B9;display:flex;align-items:center;justify-content:space-between;padding:0 64px;font-size:27px;font-weight:700}
.bar b{font-weight:800;color:#0E1222}
</style></head><body>
<div class="top"><img src="${up}assets/logo.webp" alt=""><span class="cat">${esc(cat)}</span></div>
<h1><span>${esc(title)}</span></h1>
<div class="bar"><span>Fonte: ${esc(n.source.name)}${more ? ` + ${more === 1 ? 'un\'altra testata' : 'altre ' + more}` : ''}</span><b>Flash AI News Daily</b></div>
</body></html>`;
}

async function pool(list, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (i < list.length) { const x = list[i++]; await fn(x); } }));
}

// news: notizie con campo "page" (n/xxx.html). Imposta n.og = "og/xxx.png" dove la card esiste.
export async function buildCards(news, root, { cats = {}, liveBase = '', important = () => false } = {}) {
  const dir = path.join(root, 'og');
  await mkdir(dir, { recursive: true });
  const fileOf = (n) => 'og/' + path.basename(n.page, '.html') + '.png';
  let reused = 0, made = 0;

  // 1) Card già pubblicate: le riprendo dal sito online
  const known = news.filter(n => n.og && liveBase);
  await pool(known, 8, async (n) => {
    try {
      const res = await fetch(liveBase.replace(/\/$/, '') + '/' + n.og, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000 || buf.readUInt32BE(0) !== 0x89504E47) throw new Error('file non valido');
      await writeFile(path.join(root, n.og), buf); reused++;
    } catch { delete n.og; }
  });
  news.forEach(n => { if (n.og && !liveBase) delete n.og; });

  // 2) Card nuove: prima le importanti, poi le più recenti
  const todo = news.filter(n => !n.og && n.page && n.source && tx(n.title))
    .sort((a, b) => (important(b) - important(a)) || String(b.date).localeCompare(String(a.date))).slice(0, CARDS_PER_RUN);
  await pool(todo, PARALLEL, async (n) => {
    if (chromeBin === null) return;
    const rel = fileOf(n), tmp = path.join(dir, '_' + path.basename(rel, '.png') + '.html');
    try {
      await writeFile(tmp, cardHtml(n, cats[n.category] || 'Notizie AI', '../'));
      await shot(tmp, path.join(root, rel), 1200, 630);
      n.og = rel; made++;
    } catch (e) { if (chromeBin === null) console.warn('  card non generate:', e.message); }
    finally { await rm(tmp, { force: true }); }
  });
  console.log(`🖼  card di condivisione: ${reused} riprese, ${made} nuove, ${news.filter(n => !n.og).length} in attesa`);
}
