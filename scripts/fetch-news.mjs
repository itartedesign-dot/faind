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
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': 'FAIND-news-bot/1.0 (+https://github.com)', accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' } });
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
  let previous = [];
  const prevUrl = process.env.PREVIOUS_URL;
  if (prevUrl) {
    try { previous = JSON.parse(await get(prevUrl, 10000)).items || []; console.log(`↺ storico: ${previous.length}`); }
    catch (e) { console.warn('↺ storico non disponibile:', e.message); }
  }
  // Lo storico conserva le fonti già raggruppate (also); i nuovi arrivi si aggiungono
  const byId = new Map();
  for (const it of previous) {
    if (now - new Date(it.date).getTime() > cfg.maxAgeDays * 864e5) continue;
    byId.set(it.id, it);
  }
  for (const it of fresh) if (!byId.has(it.id)) byId.set(it.id, it);

  const all = [...byId.values()].sort((a, b) =>
    (order.get(a.source.name) ?? 99) - (order.get(b.source.name) ?? 99) || a.date.localeCompare(b.date));

  const items = cluster(all).sort((a, b) => b.date.localeCompare(a.date)).slice(0, cfg.maxItems);

  // Per le notizie senza immagine leggo l'anteprima social dell'articolo.
  // Ogni articolo viene controllato una volta sola (imgChecked), massimo 40 per giro.
  const todo = items.filter(i => !i.image && !i.imgChecked).slice(0, 40);
  let foundImg = 0;
  for (let i = 0; i < todo.length; i += 6) {
    await Promise.all(todo.slice(i, i + 6).map(async (it) => {
      try {
        const img = pageImage(await get(it.link.url, 8000), it.link.url);
        if (img) { it.image = img; foundImg++; }
      } catch { /* pagina non raggiungibile: resterà il logo FAIND */ }
      it.imgChecked = true;
    }));
  }
  if (todo.length) console.log(`🖼  anteprime: ${foundImg}/${todo.length} trovate`);

  if (ok === 0 && previous.length) {
    console.warn('Nessun feed raggiungibile: mantengo lo storico.');
  }
  const sources = new Set(items.flatMap(i => [i.source.name, ...i.also.map(a => a.name)]));
  const out = { generated: new Date(now).toISOString(), sources: sources.size, count: items.length, items };
  await writeFile(path.join(ROOT, 'news.json'), JSON.stringify(out));
  console.log(`→ news.json: ${items.length} notizie da ${sources.size} fonti`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
