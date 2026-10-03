/* =====================================================================
   FAIND — raccolta automatica delle notizie
   ---------------------------------------------------------------------
   Eseguito dalla GitHub Action ogni ora. Nessuna dipendenza (Node 20+).
   1. legge i feed RSS/Atom elencati in scripts/feeds.json
   2. tiene solo le notizie sull'AI degli ultimi N giorni
   3. assegna tipo (news/tool/prezzi/download/guide) e settore
   4. raggruppa la stessa notizia data da più fonti → "coverage"
   4b. recupera l'immagine di copertina (feed o anteprima social)
   5. unisce lo storico già pubblicato e scrive news.json
   Ogni voce conserva sempre fonte e link originale.
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildSite } from './build-pages.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------ XML ------------------------------ */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', egrave: 'è', eacute: 'é', agrave: 'à', ograve: 'ò', ugrave: 'ù', igrave: 'ì', uuml: 'ü', ouml: 'ö', auml: 'ä', szlig: 'ß', ccedil: 'ç' };

export function decode(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
export function stripHtml(s = '') {
  // due passaggi: alcuni feed contengono HTML codificato come entità
  return decode(decode(s).replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function tag(block, names) {
  for (const n of names) {
    const m = block.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
}
function atomLink(block) {
  const links = [...block.matchAll(/<link\b([^>]*)\/?>/gi)].map(m => m[1]);
  const pick = links.find(a => /rel=["']alternate["']/i.test(a)) || links.find(a => !/rel=/i.test(a)) || links[0];
  const href = pick && pick.match(/href=["']([^"']+)["']/i);
  return href ? decode(href[1]) : '';
}

/* ------------------------------ Immagini ------------------------------ */
// Scarta pixel di tracciamento, icone, avatar e loghi
const BAD_IMG = /(\.svg(\?|$)|gravatar|pixel|spacer|blank\.gif|feedburner|\/emoji\/|favicon|logo[^/]*\.(png|gif)|1x1|avatar)/i;
export function cleanImage(src, base) {
  if (!src) return '';
  try {
    const u = new URL(decode(src).trim(), base);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    u.protocol = 'https:';
    const s = u.toString();
    return BAD_IMG.test(s) ? '' : s;
  } catch { return ''; }
}
function attr(tagSrc, name) {
  const m = tagSrc.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
  return m ? m[1] : '';
}
export function feedImage(block, base) {
  const found = [];
  // <media:content> / <media:thumbnail>: preferisco la più larga
  for (const [t] of block.matchAll(/<media:(content|thumbnail)\b[^>]*>/gi)) {
    const url = attr(t, 'url'), medium = attr(t, 'medium'), type = attr(t, 'type');
    if (!url || (medium && medium !== 'image') || (type && !/^image\//i.test(type))) continue;
    found.push({ url, w: +attr(t, 'width') || 0 });
  }
  found.sort((a, b) => b.w - a.w);
  for (const f of found) { const c = cleanImage(f.url, base); if (c) return c; }
  // <enclosure type="image/...">
  for (const [t] of block.matchAll(/<enclosure\b[^>]*>/gi)) {
    if (/image\//i.test(attr(t, 'type'))) { const c = cleanImage(attr(t, 'url'), base); if (c) return c; }
  }
  // prima <img> dentro il testo dell'articolo (spesso codificata come entità)
  const html = decode(decode(block));
  for (const [t] of html.matchAll(/<img\b[^>]*>/gi)) {
    const w = +attr(t, 'width');
    if (w && w < 200) continue;
    const c = cleanImage(attr(t, 'src') || attr(t, 'data-src'), base);
    if (c) return c;
  }
  return '';
}
// Anteprima social della pagina (og:image), usata quando il feed non ha immagini
export function pageImage(html, base) {
  const head = html.slice(0, 300000);
  for (const [t] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(t, 'property') || attr(t, 'name')).toLowerCase();
    if (key === 'og:image' || key === 'og:image:url' || key === 'og:image:secure_url' || key === 'twitter:image') {
      const c = cleanImage(attr(t, 'content'), base);
      if (c) return c;
    }
  }
  return '';
}

/* ---------- Logo della fonte, per le notizie senza foto ---------- */
// Misure di un'immagine lette dall'intestazione del file (PNG, JPEG, GIF, WebP; SVG = vettoriale)
export function imageSize(buf) {
  try {
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504E47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const kind = buf.toString('ascii', 12, 16);
      if (kind === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (kind === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
      if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3FFF), h: 1 + ((b >> 14) & 0x3FFF) }; }
    }
    if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
      let p = 2;
      while (p + 9 < buf.length) {
        if (buf[p] !== 0xFF) { p++; continue; }
        const m = buf[p + 1];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { w: buf.readUInt16BE(p + 7), h: buf.readUInt16BE(p + 5) };
        if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { p += 2; continue; }
        p += 2 + buf.readUInt16BE(p + 2);
      }
    }
    if (/<svg[\s>]/i.test(buf.toString('utf8', 0, Math.min(buf.length, 2000)))) return { w: 512, h: 512, svg: true };
  } catch { /* file non leggibile */ }
  return null;
}
// Non un'icona: almeno 160×60, al massimo 2400 px per lato
export const LOGO_MIN_W = 160, LOGO_MIN_H = 60, LOGO_MAX = 2400, LOGO_MAX_BYTES = 700000;
export const logoSizeOk = (s) => !!s && s.w >= LOGO_MIN_W && s.h >= LOGO_MIN_H && s.w <= LOGO_MAX && s.h <= LOGO_MAX;
// Candidati dalla home della testata, dal migliore al peggiore: logo dichiarato, anteprima social, icona grande
export function logoCandidates(html, base) {
  const head = html.slice(0, 400000), out = [];
  // qui i file chiamati "logo" vanno bene (cleanImage li scarterebbe)
  const add = (u) => {
    if (!u) return;
    try { const x = new URL(decode(u).trim(), base); if (!/^https?:$/.test(x.protocol)) return; x.protocol = 'https:'; if (!out.includes(x.toString())) out.push(x.toString()); } catch { /* indirizzo non valido */ }
  };
  for (const m of head.matchAll(/"logo"\s*:\s*(?:"([^"]+)"|\{[^{}]*?"url"\s*:\s*"([^"]+)")/g)) add((m[1] || m[2]).replace(/\\\//g, '/'));
  for (const [t] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(t, 'property') || attr(t, 'name')).toLowerCase();
    if (key === 'og:image' || key === 'og:image:secure_url' || key === 'twitter:image') add(attr(t, 'content'));
  }
  const icons = [];
  for (const [t] of head.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(t, 'rel').toLowerCase();
    if (!/apple-touch-icon|(^|\s)icon(\s|$)/.test(rel)) continue;
    const size = parseInt((attr(t, 'sizes').match(/\d+/) || [rel.includes('apple') ? '180' : '0'])[0], 10);
    if (size >= LOGO_MIN_W) icons.push([size, attr(t, 'href')]);
  }
  icons.sort((a, b) => b[0] - a[0]).forEach(([, h]) => add(h));
  return out.slice(0, 6);
}
async function getBuf(url, ms = 8000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { 'user-agent': 'Mozilla/5.0 (compatible; FAIND-news-bot/1.0; +https://itartedesign-dot.github.io/faind/)' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > LOGO_MAX_BYTES) throw new Error('file troppo grande');
  return buf;
}
async function findSourceLogo(origin) {
  const html = await get(origin + '/', 8000);
  for (const url of logoCandidates(html, origin + '/')) {
    if (!/^https:\/\//.test(url)) continue;
    try { if (logoSizeOk(imageSize(await getBuf(url)))) return url; } catch { /* provo il candidato successivo */ }
  }
  return '';
}
// Assegna srcLogo alle notizie senza foto. Ogni testata viene controllata al massimo ogni 14 giorni, 12 per giro.
async function sourceLogos(items, cache, now) {
  const originOf = (it) => { try { return new URL(it.link.url).origin; } catch { return ''; } };
  const need = [...new Set(items.filter(i => !i.image).map(originOf).filter(o => /^https:/.test(o)))];
  const todo = need.filter(o => !cache[o] || now - cache[o].t > 14 * 864e5).slice(0, 12);
  let found = 0;
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (o) => {
      let url = '';
      try { url = await findSourceLogo(o); } catch { /* home non raggiungibile */ }
      cache[o] = { url, t: now }; if (url) found++;
    }));
  }
  for (const it of items) {
    const c = !it.image && cache[originOf(it)];
    if (c && c.url) it.srcLogo = c.url; else delete it.srcLogo;
  }
  if (todo.length) console.log(`🏷  loghi delle fonti: ${found}/${todo.length} trovati`);
  return cache;
}

export function parseFeed(xml) {
  const items = [];
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const re = isAtom ? /<entry\b[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi;
  for (const [block] of xml.matchAll(re)) {
    const title = stripHtml(tag(block, ['title']));
    let link = isAtom ? atomLink(block) : decode(tag(block, ['link'])).trim();
    if (!link) link = decode(tag(block, ['guid', 'id'])).trim();
    const date = tag(block, ['pubDate', 'published', 'updated', 'dc:date']);
    const summary = stripHtml(tag(block, ['description', 'summary', 'content']));
    const image = feedImage(block, link);
    if (title && /^https?:\/\//.test(link)) items.push({ title, link, date: decode(date), summary, image });
  }
  return items;
}

/* --------------------------- Classificazione --------------------------- */
// "AI" maiuscolo: evita la preposizione italiana "ai"
const AI_CASE = /\b(AI|IA|KI|LLMs?|GPT|AGI)\b/;
const AI_WORDS = /(intelligenza artificiale|intelligence artificielle|künstliche intelligenz|artificial intelligence|machine learning|apprendimento automatico|chatgpt|openai|anthropic|\bclaude\b|gemini|copilot|mistral|llama|deepseek|qwen|midjourney|stable diffusion|\bsora\b|perplexity|chatbot|generativ|neural|deep learning|\bgrok\b|hugging ?face|nvidia)/i;
export const isAI = (t) => AI_CASE.test(t) || AI_WORDS.test(t);

const CATEGORIES = [
  ['regole',     /(regulat|regolament|\blaw\b|\blegge|lawsuit|causa legale|\bsue[sd]?\b|court|tribunal|antitrust|copyright|ai act|garante|privacy|senat|congress|parlament|ban\b|divieto|gesetz|policy|polic)/i],
  ['musica',     /(music|musica|musique|musik|\bsongs?\b|canzon|\baudio\b|speech|podcast|\bsuno\b|\budio\b|elevenlabs|text-to-speech|\btts\b|voice clon|sintesi vocale)/i],
  ['video',      /(video|vidéo|\bsora\b|\bveo\b|runway|kling|pika|film|movie|cinema|animation)/i],
  ['immagini',   /(image|immagin|imagen|bild|photo|foto|midjourney|stable diffusion|dall-?e|flux|firefly|design|grafic|graphi|illustra|art\b|arte\b|canva|figma)/i],
  ['codice',     /(code|coding|codice|developer|sviluppator|programm|\bapi\b|github|cursor|copilot|\bide\b|software engineer|agentic coding|claude code|codex)/i],
  ['hardware',   /(chip|gpu|tpu|nvidia|\bamd\b|intel|semiconduct|data ?cent|datacenter|server|hardware|compute|rechenzentr|puce|robot)/i],
  ['ricerca',    /(research|ricerca|recherche|forschung|paper|arxiv|study|studio|scientist|scienz|benchmark|model card|university|universit|medic|biolog|protein)/i],
  ['produttivita', /(productivity|produttivit|workspace|office|excel|email|gmail|notion|calendar|agent|agente|assistant|assistente|workflow|automation|automazion)/i],
  ['chatbot',    /(chatgpt|claude|gemini|chatbot|\bllm|language model|modello linguistic|gpt-|grok|mistral|llama|deepseek|qwen|perplexity)/i]
];
export function categorize(text) {
  for (const [cat, re] of CATEGORIES) if (re.test(text)) return cat;
  return 'altro';
}
export function typeOf(text) {
  if (/(pric|prezz|prix|preis|abbonament|subscription|abonnement|\$\s?\d|\d\s?\$|€\s?\d|\d\s?€|per month|al mese|sconto|discount|cheaper|più economic|costs? )/i.test(text)) return 'prezzi';
  if (/(how to|guida|guide|tutorial|come usare|come fare|step by step|anleitung|tips)/i.test(text)) return 'guide';
  if (/(download|scarica|open[- ]source|open weights|open-weight|télécharg|herunterlad|github\.com)/i.test(text)) return 'download';
  if (/(launch|lancia|releases?|rilascia|introduc|unveil|presenta|announces new|new (app|tool|model|feature)|nuov[oa] (app|tool|modello|funzion)|available now|disponibile|rolls out|debutta)/i.test(text)) return 'tool';
  return 'news';
}

/* ------------------------------ Raggruppamento ------------------------------ */
const STOP = new Set('the and for with from that this into over what will have has are its new your their about after says said della delle degli dello nella nelle sulla sulle come anche sono dopo nuovo nuova ecco perché pour avec dans sont plus mais nach eine einer eines mit über sich wird'.split(' '));
function tokens(title) {
  return new Set(title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ').split(' ').filter(w => w.length > 3 && !STOP.has(w)));
}
function similar(a, b) {
  let inter = 0; for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}
export function cluster(items) {
  const out = [];
  for (const it of items) {                           // items già ordinati per priorità fonte
    const tk = tokens(it.title);
    const host = out.find(o => o.source.name !== it.source.name && similar(o._tk, tk) >= 0.45);
    if (host && host.also.some(a => a.name === it.source.name)) continue;   // già conteggiata
    if (host) {
      host.also.push({ name: it.source.name, url: it.link.url });
      host.coverage = 1 + host.also.length;
      if (!host.image && it.image) host.image = it.image;
      if (it.tg && !host.tg) host.tg = it.tg;             // già uscita su Telegram con un'altra fonte
      if (it.date < host.date) host.date = it.date;     // la notizia è uscita alla prima segnalazione
    } else out.push({ ...it, also: it.also ? [...it.also] : [], coverage: it.coverage || 1, _tk: tk });
  }
  return out.map(({ _tk, ...rest }) => rest);
}

/* ------------------------------ Utility ------------------------------ */
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);
export function excerpt(s, max = 220) {
  if (!s || s.length <= max) return s || '';
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}
function cleanUrl(u) {
  try {
    const url = new URL(u);
    [...url.searchParams.keys()].forEach(k => { if (/^(utm_|fbclid|gclid|mc_)/i.test(k)) url.searchParams.delete(k); });
    return url.toString();
  } catch { return u; }
}

async function get(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (compatible; FAIND-news-bot/1.0; +https://itartedesign-dot.github.io/faind/)', accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally { clearTimeout(t); }
}

export function normalize(raw, feed, now = Date.now(), maxAgeDays = 7) {
  const d = new Date(raw.date);
  if (isNaN(d)) return null;
  const age = now - d.getTime();
  if (age > maxAgeDays * 864e5 || age < -864e5) return null;
  const text = raw.title + ' ' + raw.summary;
  if (feed.filter && !isAI(text)) return null;
  const url = cleanUrl(raw.link);
  const type = typeOf(text);
  return {
    id: 'a-' + hash(url),
    date: d.toISOString(),
    tag: type,
    category: categorize(text),
    title: raw.title,
    summary: excerpt(raw.summary),
    lang: feed.lang,
    official: !!feed.official || undefined,
    image: raw.image || undefined,
    source: { name: feed.name, url: new URL(url).origin },
    link: { type: type === 'download' ? 'download' : 'read', url },
    auto: true
  };
}

/* ------------------------------ Video YouTube ------------------------------ */
// Ogni canale ha un feed pubblico: https://www.youtube.com/feeds/videos.xml?channel_id=UC...
// Nella configurazione basta l'id del canale ("UC...") oppure il nome con la chiocciola ("@nome").
export function parseYouTube(xml) {
  const out = [];
  for (const [block] of xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)) {
    const videoId = (block.match(/<yt:videoId>([\w-]{6,})<\/yt:videoId>/) || [])[1];
    if (!videoId) continue;
    const link = atomLink(block) || `https://www.youtube.com/watch?v=${videoId}`;
    if (/\/shorts\//.test(link)) continue;                       // niente Shorts
    out.push({
      videoId,
      title: stripHtml(tag(block, ['media:title', 'title'])),
      date: tag(block, ['published', 'updated']),
      summary: stripHtml(tag(block, ['media:description'])),
      link: `https://www.youtube.com/watch?v=${videoId}`
    });
  }
  return out;
}
export function channelIdFromHtml(html) {
  const m = html.match(/feeds\/videos\.xml\?channel_id=(UC[\w-]{22})/) ||
            html.match(/"externalId":"(UC[\w-]{22})"/) ||
            html.match(/<meta itemprop="identifier" content="(UC[\w-]{22})"/) ||
            html.match(/"channelId":"(UC[\w-]{22})"/);
  return m ? m[1] : '';
}
async function resolveChannel(ch, cache) {
  if (/^UC[\w-]{22}$/.test(ch.id || '')) return ch.id;
  const handle = ch.handle;
  if (cache[handle]) return cache[handle];
  const id = channelIdFromHtml(await get(`https://www.youtube.com/${handle}`, 12000));
  if (!id) throw new Error('id del canale non trovato');
  cache[handle] = id;
  return id;
}
export function normalizeVideo(raw, ch, now, maxAgeDays) {
  const d = new Date(raw.date);
  if (isNaN(d) || now - d.getTime() > maxAgeDays * 864e5 || !raw.title) return null;
  const text = raw.title + ' ' + raw.summary;
  if (ch.filter && !isAI(text)) return null;
  return {
    id: 'v-' + raw.videoId,
    kind: 'video',
    videoId: raw.videoId,
    date: d.toISOString(),
    tag: 'video',
    category: categorize(text.replace(/\b(video|videos|vid[eé]o)\b/gi, ' ')),   // "in questo video" non è il settore Video
    title: raw.title,
    summary: excerpt(raw.summary, 180),
    lang: ch.lang,
    official: !!ch.official || undefined,
    group: ch.group,
    source: { name: ch.name, url: ch.handle ? `https://www.youtube.com/${ch.handle}` : `https://www.youtube.com/channel/${ch.id}` },
    link: { type: 'watch', url: raw.link },
    image: `https://i.ytimg.com/vi/${raw.videoId}/hqdefault.jpg`,
    auto: true
  };
}
async function collectVideos(cfg, prevJson, now) {
  const list = cfg.youtube || [];
  const maxAge = cfg.videoMaxAgeDays || 21;
  const cache = { ...(prevJson.channels || {}) };
  const results = await Promise.allSettled(list.map(async (ch) => {
    const id = await resolveChannel(ch, cache);
    const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    return parseYouTube(xml).map(r => normalizeVideo(r, ch, now, maxAge)).filter(Boolean);
  }));
  const byId = new Map();
  for (const v of prevJson.videos || []) if (now - new Date(v.date).getTime() <= maxAge * 864e5) byId.set(v.id, v);
  results.forEach((r, i) => {
    const name = list[i].name;
    if (r.status === 'fulfilled') {
      console.log(`✓ ▶ ${name}: ${r.value.length}`);
      for (const v of r.value) byId.set(v.id, { ...(byId.get(v.id) || {}), ...v, tg: byId.get(v.id)?.tg });
    } else console.warn(`✗ ▶ ${name}: ${r.reason?.message || r.reason}`);
  });
  const videos = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, cfg.maxVideos || 60);
  return { videos, channels: cache };
}

/* ------------------------------ Focus (robot, medicina, lavoro, clima) ------------------------------ */
// Per ogni tema: 1 video (il più recente, anche più vecchio se non ce ne sono di nuovi)
// e 1 notizia (la più ripresa dalle testate). Mai lo stesso contenuto in due temi.
export function pickSpotlight(topics, newsPool, videoPool, now) {
  const usedN = new Set(), usedV = new Set(), out = [];
  for (const t of topics) {
    const re = new RegExp(t.keywords, 'i');
    const text = (n) => `${n.title} ${n.summary || ''}`;
    const news = newsPool.filter(n => !usedN.has(n.link.url) && (n._topic === t.key || re.test(text(n))))
      .sort((a, b) => (b.coverage || 1) - (a.coverage || 1) || (!!b.image - !!a.image) || b.date.localeCompare(a.date));
    const videos = videoPool.filter(v => !usedV.has(v.id) && (v._topic === t.key || re.test(text(v))))
      .sort((a, b) => b.date.localeCompare(a.date));
    const n = news[0] || null, v = videos[0] || null;
    if (n) usedN.add(n.link.url);
    if (v) usedV.add(v.id);
    const clean = (x) => { if (!x) return null; const { _topic, ...rest } = x; return rest; };
    out.push({ key: t.key, news: clean(n), video: clean(v) });
  }
  return out;
}

let TOPIC_POOL = null;
async function collectSpotlight(cfg, items, videos, prevJson, now) {
  const sp = cfg.spotlight;
  if (!sp || !sp.topics) return [];
  const cache = prevJson.channels || {};
  const extraNews = [], extraVideos = [];
  for (const t of sp.topics) {
    const re = new RegExp(t.keywords, 'i');
    const res = await Promise.allSettled((t.feeds || []).map(async (feed) => {
      const xml = await get(feed.url);
      return parseFeed(xml).map(r => normalize(r, { ...feed, filter: false }, now, sp.newsMaxAgeDays || 14)).filter(Boolean)
        .filter(n => re.test(n.title + ' ' + n.summary) || /robot|carbon|climate|grist/i.test(feed.name))
        .filter(n => !t.requireAI || isAI(n.title + ' ' + n.summary))
        .map(n => ({ ...n, _topic: t.key, also: [], coverage: 1 }));
    }));
    res.forEach((r, i) => r.status === 'fulfilled'
      ? (extraNews.push(...r.value), console.log(`✓ ★ ${t.key} · ${t.feeds[i].name}: ${r.value.length}`))
      : console.warn(`✗ ★ ${t.key} · ${t.feeds[i].name}: ${r.reason?.message || r.reason}`));
    const vres = await Promise.allSettled((t.youtube || []).map(async (ch) => {
      const id = await resolveChannel(ch, cache);
      const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
      return parseYouTube(xml).map(r => normalizeVideo(r, { ...ch, group: 'focus' }, now, sp.videoMaxAgeDays || 120))
        .filter(Boolean).map(v => ({ ...v, _topic: t.key }));
    }));
    vres.forEach((r, i) => r.status === 'fulfilled'
      ? (extraVideos.push(...r.value), console.log(`✓ ★▶ ${t.key} · ${t.youtube[i].name}: ${r.value.length}`))
      : console.warn(`✗ ★▶ ${t.key} · ${t.youtube[i].name}: ${r.reason?.message || r.reason}`));
  }
  // Se un feed tematico non risponde, si recuperano i contenuti del giro precedente
  for (const s of prevJson.spotlight || []) {
    if (s.news && !extraNews.some(n => n.id === s.news.id) && now - new Date(s.news.date).getTime() < (sp.newsMaxAgeDays || 14) * 864e5)
      extraNews.push({ ...s.news, _topic: s.key });
    if (s.video && !extraVideos.some(v => v.id === s.video.id)) extraVideos.push({ ...s.video, _topic: s.key });
  }
  // La "più ripresa": raggruppo le notizie tematiche con quelle principali
  const pool = cluster([...items.map(i => ({ ...i, also: [...(i.also || [])] })), ...extraNews]);
  TOPIC_POOL = { news: pool, videos: [...videos, ...extraVideos] };   // serve alle pagine tematiche (temi/)
  const picks = pickSpotlight(sp.topics, pool, [...videos, ...extraVideos], now);
  console.log('★ focus:', picks.map(p => `${p.key}=${p.news ? 'N' : '-'}${p.video ? 'V' : '-'}`).join(' '));
  return picks;
}

/* ------------------------------ Job: ruoli AI più richiesti ------------------------------ */
// Fonti pubbliche e gratuite pensate per essere riprese (citate sul sito).
// Ogni offerta porta al suo annuncio originale, dove ci si candida.
export const ROLES = [
  ['ml', /machine learning|\bml\b|mlops|deep learning/i],
  ['ai', /\bai\b.*(engineer|developer|ingegner|sviluppator|ingénieur|entwickler)|genai|generative ai|\bllm|gen ai|künstliche intelligenz|intelligenza artificiale|intelligence artificielle/i],
  ['ds', /data scien|datenwissenschaft/i],
  ['de', /data engineer|analytics engineer|daten ?ingenieur/i],
  ['da', /data analyst|business intelligence|\bbi (analyst|developer)|datenanalyst|analista dati/i],
  ['research', /research (scientist|engineer)|ricercator|chercheur|forscher/i],
  ['cv', /computer vision|vision engineer|bildverarbeitung/i],
  ['nlp', /\bnlp\b|natural language|linguistic/i],
  ['pm', /product (manager|owner|lead).*\b(ai|ml|data)\b|\b(ai|ml|data)\b.*product (manager|owner|lead)/i],
  ['arch', /(solutions?|cloud|data|ai) architect/i],
  ['prompt', /prompt/i],
  ['consult', /\b(ai|ml|data)\b.*(consultant|consulente|berater|sales|account)|(consultant|consulente|berater).*\b(ai|ml)\b/i]
];
export function roleOf(title) {
  for (const [key, re] of ROLES) if (re.test(title)) return key;
  return '';
}
function job(src, o) {
  const title = stripHtml(o.title || '');
  const role = roleOf(title);
  if (!role || !/^https?:\/\//.test(o.url || '')) return null;
  return {
    id: 'j-' + hash(o.url), role, title, company: stripHtml(o.company || ''),
    where: stripHtml(o.where || ''), lang: o.lang, url: o.url, source: src,
    date: new Date(o.date || Date.now()).toISOString()
  };
}
async function collectJobs(cfg, prevJson, now) {
  const jc = cfg.jobs;
  if (!jc) return { jobs: [], jobsUpdated: null };
  if (prevJson.jobsUpdated && prevJson.jobs && now - new Date(prevJson.jobsUpdated).getTime() < (jc.refreshHours || 6) * 36e5) {
    return { jobs: prevJson.jobs, jobsUpdated: prevJson.jobsUpdated };
  }
  const tasks = [];
  for (const g of jc.jobicy || []) tasks.push(['Jobicy ' + g.geo, async () => {
    const data = JSON.parse(await get(`https://jobicy.com/api/v2/remote-jobs?count=100&geo=${encodeURIComponent(g.geo)}`));
    return (data.jobs || []).map(j => job('Jobicy', { title: j.jobTitle, company: j.companyName, where: j.jobGeo, url: j.url, date: j.pubDate, lang: g.lang }));
  }]);
  if (jc.arbeitnow) tasks.push(['Arbeitnow', async () => {
    const data = JSON.parse(await get(jc.arbeitnow.url));
    return (data.data || []).map(j => job('Arbeitnow', { title: j.title, company: j.company_name, where: j.remote ? 'Remote' : j.location, url: j.url, date: j.created_at ? j.created_at * 1000 : null, lang: jc.arbeitnow.lang }));
  }]);
  if (jc.remotive) tasks.push(['Remotive', async () => {
    const data = JSON.parse(await get(jc.remotive.url));
    return (data.jobs || []).map(j => job('Remotive', { title: j.title, company: j.company_name, where: j.candidate_required_location, url: j.url, date: j.publication_date, lang: jc.remotive.lang }));
  }]);
  const res = await Promise.allSettled(tasks.map(([, fn]) => fn()));
  const byId = new Map();
  let ok = 0;
  res.forEach((r, i) => {
    if (r.status === 'fulfilled') { ok++; const list = r.value.filter(Boolean); list.forEach(j => byId.set(j.id, j)); console.log(`✓ 💼 ${tasks[i][0]}: ${list.length}`); }
    else console.warn(`✗ 💼 ${tasks[i][0]}: ${r.reason?.message || r.reason}`);
  });
  if (!ok && prevJson.jobs) return { jobs: prevJson.jobs, jobsUpdated: prevJson.jobsUpdated };
  const jobs = [...byId.values()]
    .filter(j => now - new Date(j.date).getTime() < (jc.maxAgeDays || 30) * 864e5)
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 500);
  return { jobs, jobsUpdated: new Date(now).toISOString() };
}

/* ------------------------------ Main ------------------------------ */
async function main() {
  const cfg = JSON.parse(await readFile(path.join(ROOT, 'scripts/feeds.json'), 'utf8'));
  const now = Date.now();
  const order = new Map(cfg.feeds.map((f, i) => [f.name, i]));

  const results = await Promise.allSettled(cfg.feeds.map(async (feed) => {
    const xml = await get(feed.url);
    const items = parseFeed(xml).map(r => normalize(r, feed, now, cfg.maxAgeDays)).filter(Boolean);
    return { feed, items };
  }));

  let fresh = [], ok = 0;
  results.forEach((r, i) => {
    const name = cfg.feeds[i].name;
    if (r.status === 'fulfilled') { ok++; fresh.push(...r.value.items); console.log(`✓ ${name}: ${r.value.items.length}`); }
    else console.warn(`✗ ${name}: ${r.reason?.message || r.reason}`);
  });

  // Storico: la versione già online, così la settimana resta completa anche se i feed sono corti
  let previous = [], prevJson = {};
  const prevUrl = process.env.PREVIOUS_URL;
  if (prevUrl) {
    try { prevJson = JSON.parse(await get(prevUrl, 10000)); previous = prevJson.items || []; console.log(`↺ storico: ${previous.length}`); }
    catch (e) { console.warn('↺ storico non disponibile:', e.message); }
  }
  // Lo storico conserva le fonti già raggruppate (also); i nuovi arrivi si aggiungono
  const byId = new Map();
  for (const it of previous) {
    if (now - new Date(it.date).getTime() > cfg.maxAgeDays * 864e5) continue;
    byId.set(it.id, it);
  }
  // A parità di notizia vince la versione appena letta dal feed (titolo, immagine aggiornati),
  // ma conserva le fonti già raggruppate e l'immagine trovata in precedenza
  for (const it of fresh) {
    const prev = byId.get(it.id);
    if (!prev) { byId.set(it.id, it); continue; }
    byId.set(it.id, {
      ...prev, ...it,
      date: prev.date < it.date ? prev.date : it.date,
      also: prev.also, coverage: prev.coverage,
      image: it.image || prev.image,
      imgChecked: prev.imgChecked
    });
  }

  const all = [...byId.values()].sort((a, b) =>
    (order.get(a.source.name) ?? 99) - (order.get(b.source.name) ?? 99) || a.date.localeCompare(b.date));

  const items = cluster(all).sort((a, b) => b.date.localeCompare(a.date)).slice(0, cfg.maxItems);

  // Per le notizie senza immagine leggo l'anteprima social dell'articolo.
  // Ogni articolo viene controllato una volta sola (imgChecked), massimo 80 per giro.
  const todo = items.filter(i => !i.image && !i.imgChecked).slice(0, 80);
  let foundImg = 0;
  for (let i = 0; i < todo.length; i += 8) {
    await Promise.all(todo.slice(i, i + 8).map(async (it) => {
      try {
        const img = pageImage(await get(it.link.url, 8000), it.link.url);
        if (img) { it.image = img; foundImg++; }
      } catch { /* pagina non raggiungibile: resterà il logo FAIND */ }
      it.imgChecked = true;
    }));
  }
  if (todo.length) console.log(`🖼  anteprime: ${foundImg}/${todo.length} trovate`);

  // Dove la foto manca davvero, provo con il logo della testata (se ha misure adeguate); altrimenti resta il logo FAIND
  let logos = prevJson.logos || {};
  try { logos = await sourceLogos(items, logos, now); } catch (e) { console.warn('Loghi delle fonti non aggiornati:', e.message); }

  if (ok === 0 && previous.length) {
    console.warn('Nessun feed raggiungibile: mantengo lo storico.');
  }
  const { videos, channels } = await collectVideos(cfg, prevJson, now);
  // Controllo dei prezzi degli abbonamenti (ogni 12 ore): confronta data.js con un listino pubblico, senza mai modificarlo
  let priceCheck = prevJson.priceCheck || null;
  try { const { checkPrices } = await import('./prices.mjs'); priceCheck = await checkPrices(ROOT, priceCheck, now, get); }
  catch (e) { console.warn('Controllo prezzi non riuscito:', e.message); }

  let jobsData = { jobs: prevJson.jobs || [], jobsUpdated: prevJson.jobsUpdated || null };
  try { jobsData = await collectJobs(cfg, prevJson, now); }
  catch (e) { console.warn('Job non aggiornati:', e.message); }
  let spotlight = [];
  try { spotlight = await collectSpotlight(cfg, items, videos, { ...prevJson, channels }, now); }
  catch (e) { console.warn('Focus non generato:', e.message); spotlight = prevJson.spotlight || []; }

  const sources = new Set(items.flatMap(i => [i.source.name, ...i.also.map(a => a.name)]));
  const out = { generated: new Date(now).toISOString(), sources: sources.size, count: items.length, items, videos, channels, spotlight, jobs: jobsData.jobs, jobsUpdated: jobsData.jobsUpdated, tgState: prevJson.tgState || {}, logos, priceCheck };   // tgState = promemoria del bot Telegram (ultimo Punto delle 8, ultima classifica lavori)

  // Pagine notizia, feed RSS e sitemap (aggiunge a ogni notizia il campo "page")
  try { await buildSite(out, ROOT); }
  catch (e) { console.warn('Pagine/feed non generati:', e.message); }

  // Pagine tematiche permanenti (temi/): testo fisso + dati che si aggiornano + cronologia che cresce
  out.topics = prevJson.topics || {};
  try {
    const { buildTopics } = await import('./topics.mjs');
    const pool = TOPIC_POOL || { news: items, videos };
    out.topics = await buildTopics({ cfgTopics: (cfg.spotlight || {}).topics, news: pool.news, videos: pool.videos, items: out.items, prev: prevJson.topics, root: ROOT, now });
  } catch (e) { console.warn('Pagine tematiche non generate:', e.message); }

  await writeFile(path.join(ROOT, 'news.json'), JSON.stringify(out));
  console.log(`→ news.json: ${items.length} notizie da ${sources.size} fonti, ${videos.length} video`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
