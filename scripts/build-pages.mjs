/* =====================================================================
   FAIND — pagine notizia, archivio, feed RSS e sitemap
   ---------------------------------------------------------------------
   Chiamato da fetch-news.mjs a ogni giro orario. Genera:
   • n/<titolo>-<id>.html   una pagina per ogni notizia (per Google e
                            per le condivisioni), nella lingua della
                            notizia, con fonte, il titolo dato da ogni
                            testata che ne parla, i rimandi a glossario,
                            argomenti, temi e approfondimenti, e la
                            fascia "Su FAIND trovi anche"
   • archivio.json          le notizie indicizzabili, conservate per
                            sempre: le loro pagine restano online anche
                            dopo i 7 giorni di news.json (vedi argomenti.mjs)
   • feed.xml               feed RSS generale (ultime 20 notizie)
   • feeds/<settore>.xml    un feed RSS per ogni settore + feeds/youtube.xml
   • sitemap.xml, robots.txt e la chiave IndexNow (avviso a Bing e agli
     altri motori che aderiscono, per le pagine nuove)
   Indicizzabili da Google le notizie della redazione, quelle riprese
   da almeno 2 fonti e (dal 9/10/2026, decisione di Paolo) anche quelle
   con una sola fonte, purché abbiano un riassunto di almeno
   INDEX_MIN_SUMMARY caratteri: le pagine quasi vuote restano "noindex"
   e spariscono dopo 7 giorni.
   ===================================================================== */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { buildCards } from './cards.mjs';
import { buildCompare } from './compare.mjs';
import { buildArticles, ARTICLES, articleFor } from './articles.mjs';
import { buildStrano } from './strano.mjs';
import { buildGlossary, termsIn, linkify, termPath, TERMS } from './glossary.mjs';
import { topicText, TOPIC_DIR } from './topics.mjs';
import { buildArgomenti, buildArchivePages, addToSitemap, subjectsIn, footerHtml, alsoBand, ALSO_CSS, ARG_DIR } from './argomenti.mjs';

export const SITE = 'https://faind.org/';
const FEED_SIZE = 20;
// Chiave IndexNow: non è un segreto, per regola del protocollo sta in chiaro in un file del sito (faind.org/<chiave>.txt)
const INDEXNOW_KEY = '3c5c38b66b5c83946d0ecdac40fbc2da';
const INDEXNOW_URL = 'https://www.bing.com/indexnow';

export const CATS = {
  chatbot: 'Chatbot e LLM', immagini: 'Immagini e grafica', video: 'Video', musica: 'Musica e audio',
  codice: 'Programmazione', produttivita: 'Produttività', ricerca: 'Ricerca e scienza',
  hardware: 'Chip e infrastruttura', regole: 'Leggi e regole', altro: 'Altro'
};
// Nomi dei settori e dei tipi nelle quattro lingue (gli stessi di script.js)
const CATS_I18N = {
  it: CATS,
  en: { chatbot: 'Chatbots & LLMs', immagini: 'Images & design', video: 'Video', musica: 'Music & audio', codice: 'Coding', produttivita: 'Productivity', ricerca: 'Research & science', hardware: 'Chips & infrastructure', regole: 'Law & policy', altro: 'Other' },
  fr: { chatbot: 'Chatbots et LLM', immagini: 'Images et design', video: 'Vidéo', musica: 'Musique et audio', codice: 'Programmation', produttivita: 'Productivité', ricerca: 'Recherche et science', hardware: 'Puces et infrastructure', regole: 'Lois et régulation', altro: 'Autre' },
  de: { chatbot: 'Chatbots & LLMs', immagini: 'Bilder & Grafik', video: 'Video', musica: 'Musik & Audio', codice: 'Programmierung', produttivita: 'Produktivität', ricerca: 'Forschung & Wissenschaft', hardware: 'Chips & Infrastruktur', regole: 'Recht & Regulierung', altro: 'Sonstiges' }
};
const TYPES_I18N = {
  it: { news: 'News', tool: 'Tool', prezzi: 'Prezzi', download: 'Download', guide: 'Guida', convenzioni: 'Convenzioni', video: 'Video' },
  en: { news: 'News', tool: 'Tool', prezzi: 'Pricing', download: 'Download', guide: 'Guide', convenzioni: 'Deals', video: 'Video' },
  fr: { news: 'Actu', tool: 'Outil', prezzi: 'Prix', download: 'Téléchargement', guide: 'Guide', convenzioni: 'Offres', video: 'Vidéo' },
  de: { news: 'News', tool: 'Tool', prezzi: 'Preise', download: 'Download', guide: 'Anleitung', convenzioni: 'Angebote', video: 'Video' }
};
// Testi della pagina notizia nelle quattro lingue: la pagina parla la lingua della notizia
const NP = {
  it: { locale: 'it-IT', back: '← Tutte le notizie', source: 'Fonte', cta: (s) => `Leggi l'articolo completo su ${s} ↗`,
    disc: (s) => `FAIND riporta titolo e un breve estratto: l'articolo completo e i diritti appartengono a ${s}.`,
    compared: (n) => `${n} fonti a confronto`, told: (n) => `Come la raccontano ${n} testate`,
    more: 'Per capire di più', terms: 'Parole chiave', subjects: 'Argomenti', topic: 'Tema', deep: 'Approfondimento',
    sameCat: (c) => `Altre notizie: ${c}`, latest: 'Le ultime notizie su FAIND',
    tg: 'Le notizie AI importanti sul tuo telefono, appena escono. Iscriviti al canale Telegram.', homeBtn: 'Tutte le notizie di oggi su FAIND' },
  en: { locale: 'en-GB', back: '← All news', source: 'Source', cta: (s) => `Read the full article on ${s} ↗`,
    disc: (s) => `FAIND shows the headline and a short excerpt: the full article and its rights belong to ${s}.`,
    compared: (n) => `${n} sources compared`, told: (n) => `How ${n} outlets tell the story`,
    more: 'Understand more', terms: 'Key terms', subjects: 'Subjects', topic: 'Topic', deep: 'In depth',
    sameCat: (c) => `More news: ${c}`, latest: 'The latest news on FAIND',
    tg: 'Top AI stories on your phone as soon as they break. Join the Telegram channel.', homeBtn: 'All of today\'s news on FAIND' },
  fr: { locale: 'fr-FR', back: '← Toutes les actualités', source: 'Source', cta: (s) => `Lire l'article complet sur ${s} ↗`,
    disc: (s) => `FAIND reprend le titre et un court extrait : l'article complet et ses droits appartiennent à ${s}.`,
    compared: (n) => `${n} sources comparées`, told: (n) => `Comment ${n} médias en parlent`,
    more: 'Pour aller plus loin', terms: 'Mots-clés', subjects: 'Sujets', topic: 'Thème', deep: 'Dossier',
    sameCat: (c) => `Autres actualités : ${c}`, latest: 'Les dernières actualités sur FAIND',
    tg: 'Les infos IA importantes sur votre téléphone, dès leur sortie. Rejoignez la chaîne Telegram.', homeBtn: 'Toutes les actualités du jour sur FAIND' },
  de: { locale: 'de-DE', back: '← Alle Nachrichten', source: 'Quelle', cta: (s) => `Den ganzen Artikel bei ${s} lesen ↗`,
    disc: (s) => `FAIND zeigt Überschrift und einen kurzen Auszug: Der vollständige Artikel und die Rechte gehören ${s}.`,
    compared: (n) => `${n} Quellen im Vergleich`, told: (n) => `So berichten ${n} Medien`,
    more: 'Mehr verstehen', terms: 'Schlüsselbegriffe', subjects: 'Stichwörter', topic: 'Thema', deep: 'Hintergrund',
    sameCat: (c) => `Weitere Nachrichten: ${c}`, latest: 'Die neuesten Nachrichten auf FAIND',
    tg: 'Die wichtigsten KI-News sofort aufs Handy. Tritt dem Telegram-Kanal bei.', homeBtn: 'Alle Nachrichten von heute auf FAIND' }
};
const langOf = (n) => NP[n.lang] ? n.lang : 'it';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));
const cdata = (s = '') => '<![CDATA[' + String(s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';

export function slugify(s = '') {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '') || 'notizia';
}
const shortId = (id) => String(id).replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase();
const toDate = (iso) => new Date(/T\d{2}:/.test(iso) ? iso : iso + 'T12:00:00');
const fmtDate = (iso, lang = 'it') => new Intl.DateTimeFormat(NP[lang].locale, {
  day: 'numeric', month: 'long', year: 'numeric', hour: /T\d{2}:/.test(iso) ? '2-digit' : undefined,
  minute: /T\d{2}:/.test(iso) ? '2-digit' : undefined, timeZone: 'Europe/Rome'
}).format(toDate(iso));
const cut = (s, max) => s.length > max ? s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : s;

async function loadEditorial(root) {
  try {
    const code = await readFile(path.join(root, 'data.js'), 'utf8');
    const ctx = { window: {} };
    vm.runInNewContext(code, ctx, { timeout: 1000 });
    return ctx.window.FAIND_DATA || {};
  } catch (e) { console.warn('data.js non leggibile:', e.message); return {}; }
}

const INDEX_MIN_SUMMARY = 80;   // sotto questa lunghezza una notizia con una sola fonte non va su Google (pagina troppo povera)
const indexable = (n) => !!n.editorial || (n.coverage || 1) >= 2 || n.priority === 'alta' || String(n.summary || '').trim().length >= INDEX_MIN_SUMMARY;

// Titolo per Google: con almeno 2 fonti aggiunge "N fonti a confronto", se il titolo resta abbastanza corto
// da non essere tagliato (Google mostra circa 60-70 caratteri); altrimenti il numero va solo nella descrizione
export function seoTitle(title, count, lang = 'it') {
  const base = String(title).replace(/\s+/g, ' ').trim();
  if (count < 2) return `${base} | FAIND`;
  const sep = /[?!.…:]$/.test(base) ? ' –' : lang === 'fr' ? ' :' : ':';   // in francese lo spazio prima dei due punti
  const withCount = `${base}${sep} ${NP[lang].compared(count)}`;
  if (withCount.length + 8 <= 70) return `${withCount} | FAIND`;
  if (withCount.length <= 70) return withCount;
  return `${base} | FAIND`;
}
export function seoDesc(n, lang = 'it') {
  const summary = tx(n.summary), title = tx(n.title);
  const names = [n.source.name, ...(n.also || []).map(a => a.name)];
  if (names.length < 2) return cut(summary || title, 155);
  const head = `${NP[lang].compared(names.length)} (${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}).`;
  return cut(`${head} ${summary || title}`, 155);
}

/* ------------------------------ Pagina notizia ------------------------------ */
const NP_CSS = `.np__told{list-style:none;margin:0;padding:0}
.np__told li{padding:10px 0;border-bottom:1px solid var(--rule);display:grid;gap:2px}
.np__told b{font-size:13px;color:var(--muted);font-weight:650;text-transform:uppercase;letter-spacing:.03em}
.np__told a{color:var(--ink);font-weight:600;text-decoration:none;line-height:1.35}
.np__told a:hover{color:var(--link);text-decoration:underline}
.np__more{display:grid;gap:12px}
.np__more p{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.np__more p>span{font-size:13px;color:var(--muted);font-weight:650;min-width:120px}
.np__chip{padding:6px 12px;border:1px solid var(--rule);border-radius:999px;background:var(--surface);color:var(--ink);text-decoration:none;font-size:14px;font-weight:600}
.np__chip:hover{border-color:var(--link)}
${ALSO_CSS}`;

function pageHtml(n, related, sameCat, ctx) {
  const lang = langOf(n), u = NP[lang];
  const url = SITE + n.page;
  const title = tx(n.title);
  const summary = tx(n.summary);
  const cat = CATS_I18N[lang][n.category] || CATS_I18N[lang].altro;
  const type = TYPES_I18N[lang][n.tag] || 'News';
  const names = [n.source.name, ...(n.also || []).map(a => a.name)];
  const count = names.length;
  const desc = seoDesc(n, lang);
  const pageTitle = seoTitle(title, count, lang);
  const text = `${title} ${summary}`;

  // Il confronto: il titolo che ogni testata ha dato alla notizia
  const told = (n.also || []).length
    ? `<section class="np__box"><h2>${esc(u.told(count))}</h2><ul class="np__told">` +
      [{ name: n.source.name, url: n.link.url, title }, ...n.also].map(a =>
        `<li><b>${esc(a.name)}</b><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.title ? tx(a.title) : a.name)}</a></li>`).join('') +
      `</ul></section>` : '';

  // Per capire di più: parole del glossario, argomenti, tema, approfondimento
  const rows = [];
  const found = termsIn(text);
  if (found.length) rows.push([u.terms, found.slice(0, 8).map(t => `<a class="np__chip" href="../${termPath(t.id, lang)}" title="${esc((t[lang] || t.it)[1])}">${esc((t[lang] || t.it)[0].replace(/ \(.*\)$/, ''))}</a>`).join('')]);
  const subs = subjectsIn(text, ctx.subjects).slice(0, 6);
  if (subs.length) rows.push([u.subjects, subs.map(s => `<a class="np__chip" href="../${ARG_DIR[s.pages.includes(lang) ? lang : 'it']}${s.key}.html">${esc(s.name)}</a>`).join('')]);
  const topics = ctx.topics.filter(t => n._topic === t.key || t.re.test(text)).slice(0, 2);
  if (topics.length) rows.push([u.topic, topics.map(t => { const tt = topicText(t.key, lang); return `<a class="np__chip" href="../${TOPIC_DIR[lang]}${tt.slug}.html">${esc(tt.name)}</a>`; }).join('')]);
  const art = articleFor(text, lang);
  if (art) rows.push([u.deep, `<a class="np__chip" href="../${art.path}"${art.lang !== lang ? ` hreflang="${art.lang}"` : ''}>${esc(art.title)}</a>`]);
  const more = rows.length
    ? `<section class="np__box"><h2>${esc(u.more)}</h2><div class="np__more">${rows.map(([lab, html]) => `<p><span>${esc(lab)}</span>${html}</p>`).join('')}</div></section>` : '';

  const rel = related.length
    ? `<section class="np__box"><h2>${sameCat ? esc(u.sameCat(cat)) : esc(u.latest)}</h2><ul class="np__rel">` +
      related.map(r => `<li><a href="../${esc(r.page)}">${esc(tx(r.title))}</a><span>${esc(r.source.name)}</span></li>`).join('') +
      `</ul></section>` : '';
  const img = n.image && /^https:\/\//.test(n.image)
    ? `<img class="np__img" src="${esc(n.image)}" alt="${esc(title)}" referrerpolicy="no-referrer" loading="eager" onerror="this.remove()">` : '';
  const ogImage = n.og ? SITE + n.og : n.image && /^https:/.test(n.image) ? n.image : SITE + 'assets/og-image.png';
  const iso = toDate(n.date).toISOString();
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'NewsArticle', '@id': url + '#article', url, mainEntityOfPage: url, headline: cut(title, 110), description: desc,
      datePublished: iso, dateModified: iso, inLanguage: u.locale, image: [ogImage], articleSection: cat,
      author: { '@type': 'Organization', name: 'FAIND', url: SITE },
      publisher: { '@type': 'Organization', name: 'FAIND', url: SITE, logo: { '@type': 'ImageObject', url: SITE + 'assets/icon-180.png' } },
      isBasedOn: [n.link.url, ...(n.also || []).map(a => a.url)] },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE },
      { '@type': 'ListItem', position: 2, name: cat, item: SITE + '#news' },
      { '@type': 'ListItem', position: 3, name: title, item: url }
    ] }
  ] };

  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="robots" content="${indexable(n) ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:locale" content="${u.locale.replace('-', '_')}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${esc(ogImage)}">${n.og ? '\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">' : ''}
  <meta property="og:image:alt" content="${esc(title)}">
  <meta property="article:published_time" content="${iso}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/favicon.png" type="image/png">
  <link rel="alternate" type="application/rss+xml" title="FAIND – Notizie AI" href="../feed.xml">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="../assets/fonts/archivo.css">
  <link rel="stylesheet" href="../style.css">
  <style>
${NP_CSS}
  </style>
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="apple-touch-icon" href="../assets/icon-180.png">
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="../stats.js" defer></script>
  <script src="../nav.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="../" aria-label="FAIND — Home"><img class="brand__img" src="../assets/logo.webp" width="578" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="../">${esc(u.back)}</a>
    </div>
  </header>
  <main class="wrap np">
    <article class="np__main">
      <p class="np__crumb"><a href="../">FAIND</a> › ${esc(cat)}</p>
      <div class="np__tags"><span class="tag" data-tag="${esc(n.tag)}">${esc(type)}</span><span class="cat">${esc(cat)}</span></div>
      <h1 class="np__title">${esc(title)}</h1>
      <p class="np__meta"><time datetime="${esc(n.date)}">${esc(fmtDate(n.date, lang))}</time> · ${esc(u.source)}: <a href="${esc(n.link.url)}" target="_blank" rel="noopener noreferrer">${esc(n.source.name)}</a></p>
      ${img}
      ${summary ? `<p class="np__lede">${linkify(esc(summary), '../', lang)}</p>` : ''}
      <a class="btn btn--primary np__cta" href="${esc(n.link.url)}" target="_blank" rel="noopener noreferrer">${esc(u.cta(n.source.name))}</a>
      <p class="np__disclaimer">${esc(u.disc(n.source.name))}</p>
      ${told}
      ${more}
      ${rel}
      ${alsoBand(lang, '../')}
    </article>
    <aside class="np__side">
      <a class="tgcta" href="https://t.me/faindnews" target="_blank" rel="noopener noreferrer">
        <span class="tgcta__name">@faindnews</span>
        <span class="tgcta__text">${esc(u.tg)}</span>
      </a>
      <a class="btn btn--ghost np__home" href="../">${esc(u.homeBtn)}</a>
    </aside>
  </main>
  ${footerHtml(lang, '../')}
</body>
</html>`;
}

/* ------------------------------ Feed RSS ------------------------------ */
function rss(title, description, selfPath, items) {
  const now = new Date().toUTCString();
  const entries = items.map(n => {
    const link = n.kind === 'video' ? n.link.url : (n.page ? SITE + n.page : n.link.url);
    const body = `${tx(n.summary) || ''}${tx(n.summary) ? ' — ' : ''}Fonte: ${n.source.name}`;
    const img = n.image && /^https:/.test(n.image) ? `<media:content url="${esc(n.image)}" medium="image"/>` : '';
    return `<item><title>${esc(tx(n.title))}</title><link>${esc(link)}</link><guid isPermaLink="false">faind-${esc(n.id)}</guid>` +
      `<pubDate>${toDate(n.date).toUTCString()}</pubDate><category>${esc(CATS[n.category] || CATS.altro)}</category>` +
      `<description>${cdata(body)}</description>${img}</item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${esc(title)}</title>
<link>${SITE}</link>
<description>${esc(description)}</description>
<language>it</language>
<lastBuildDate>${now}</lastBuildDate>
<atom:link href="${SITE}${selfPath}" rel="self" type="application/rss+xml"/>
<image><url>${SITE}assets/favicon.png</url><title>${esc(title)}</title><link>${SITE}</link></image>
${entries}
</channel>
</rss>`;
}

/* ------------------------------ Caratteri tipografici sul nostro sito ------------------------------ */
// I file del carattere Archivo vengono scaricati una volta per giro e serviti da FAIND stesso:
// così i visitatori non contattano Google Fonts (privacy, GDPR) e il sito è più veloce.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap';
export async function selfHostFonts(root) {
  const dir = path.join(root, 'assets/fonts');
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  const res = await fetch(FONT_CSS, { headers: { 'user-agent': ua } });
  if (!res.ok) throw new Error('CSS font HTTP ' + res.status);
  let css = await res.text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map(m => m[1]))];
  if (!urls.length) throw new Error('nessun file woff2');
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const u of urls) {
    const name = `archivo-${i++}.woff2`;
    const r = await fetch(u, { headers: { 'user-agent': ua } });
    if (!r.ok) throw new Error('font HTTP ' + r.status);
    await writeFile(path.join(dir, name), Buffer.from(await r.arrayBuffer()));
    css = css.split(u).join(name);
  }
  await writeFile(path.join(dir, 'archivo.css'), '/* Archivo (SIL Open Font License) servito da FAIND */\n' + css);
  return urls.length;
}

/* ------------------------------ Archivio ------------------------------ */
// Nell'archivio va solo ciò che serve a rigenerare la pagina
function slim(n) {
  const o = {
    id: n.id, page: n.page, title: tx(n.title), summary: tx(n.summary) || '', lang: n.lang || 'it', date: n.date,
    category: n.category || 'altro', tag: n.tag || 'news', source: { name: n.source.name }, link: { url: n.link.url },
    also: (n.also || []).map(a => ({ name: a.name, url: a.url, ...(a.title ? { title: tx(a.title) } : {}) })), coverage: n.coverage || 1
  };
  if (n.image && /^https:\/\//.test(n.image)) o.image = n.image;
  if (n.editorial) o.editorial = true;
  if (n.priority) o.priority = n.priority;
  if (n._topic) o._topic = n._topic;
  return o;
}

/* ------------------------------ IndexNow ------------------------------ */
// Avvisa Bing (che condivide l'avviso con gli altri motori IndexNow) delle pagine nuove.
// Si mandano le pagine nate nel giro precedente, che a questo punto sono già online. Solo su GitHub.
async function pingIndexNow(urls) {
  if (!process.env.GITHUB_ACTIONS || !urls.length) return urls.length ? false : true;
  try {
    const res = await fetch(INDEXNOW_URL, {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) })
    });
    console.log(`🔔 IndexNow: ${urls.length} indirizzi → risposta ${res.status}`);
    return res.status === 200 || res.status === 202;
  } catch (e) { console.warn('🔔 IndexNow non raggiunto:', e.message); return false; }
}

/* ------------------------------ Build ------------------------------ */
export async function buildSite(out, root, { archive = { items: [] } } = {}) {
  const data = await loadEditorial(root);
  const editorial = (data.news || []).map(n => ({ ...n, editorial: true, lang: n.lang || 'it', page: `n/${slugify(n.id)}.html` }));
  const edUrls = new Set(editorial.map(n => n.link && n.link.url));
  let cfgTopics = [];
  try { cfgTopics = ((JSON.parse(await readFile(path.join(root, 'scripts/feeds.json'), 'utf8')).spotlight || {}).topics || []).map(t => ({ key: t.key, re: new RegExp(t.keywords, 'i') })); }
  catch (e) { console.warn('Temi non letti da feeds.json:', e.message); }

  // Archivio: pagina → notizia. Una notizia già archiviata tiene sempre lo stesso indirizzo,
  // anche se nel frattempo il raggruppamento l'ha attribuita a un'altra testata
  const arch = new Map((archive.items || []).map(a => [a.page, a]));
  const pageOfUrl = new Map();
  for (const a of arch.values()) for (const u of [a.link.url, ...(a.also || []).map(x => x.url)]) if (!pageOfUrl.has(u)) pageOfUrl.set(u, a.page);

  for (const it of out.items) {
    if (!it.page) it.page = `n/${slugify(it.title)}-${shortId(it.id)}.html`;
    if (!arch.has(it.page)) {
      const known = [it.link.url, ...(it.also || []).map(x => x.url)].map(u => pageOfUrl.get(u)).find(Boolean);
      if (known) it.page = known;
    }
  }
  out.pages = Object.fromEntries(editorial.map(n => [n.id, n.page]));
  // Le notizie del Focus che sono anche notizie principali puntano alla loro pagina
  const byId = new Map(out.items.map(i => [i.id, i]));
  for (const sp of out.spotlight || []) if (sp.news && byId.has(sp.news.id)) sp.news.page = byId.get(sp.news.id).page;

  const news = [...editorial, ...out.items.filter(i => !edUrls.has(i.link.url))]
    .sort((a, b) => toDate(b.date) - toDate(a.date));

  // Le notizie indicizzabili entrano (o si aggiornano) nell'archivio e da lì non escono più
  const fresh = [];
  for (const n of news.filter(indexable)) {
    if (!arch.has(n.page)) fresh.push(SITE + n.page);
    arch.set(n.page, slim(n));
  }
  const archived = [...arch.values()].sort((a, b) => toDate(b.date) - toDate(a.date));
  const current = new Set(news.map(n => n.page));
  const onlyArchived = archived.filter(a => !current.has(a.page));
  // Tutte le notizie con una pagina: quelle della settimana e quelle dell'archivio
  const everything = [...news, ...onlyArchived].sort((a, b) => toDate(b.date) - toDate(a.date));

  await rm(path.join(root, 'n'), { recursive: true, force: true });
  await mkdir(path.join(root, 'n'), { recursive: true });
  await mkdir(path.join(root, 'feeds'), { recursive: true });

  // I caratteri servono anche alle card: li scarico prima
  try { console.log(`🔤 caratteri serviti da FAIND: ${await selfHostFonts(root)} file`); }
  catch (e) { console.warn('🔤 caratteri non scaricati (si usano quelli di sistema):', e.message); }

  // Card di condivisione con il marchio FAIND (cartella og/): una per pagina notizia della settimana.
  // Le pagine solo d'archivio usano la foto della fonte o il logo: servono a Google più che ai social.
  try {
    await buildCards(news, root, { cats: CATS, liveBase: (process.env.PREVIOUS_URL || '').replace(/\/news\.json.*$/, ''), important: (n) => (n.coverage || 1) >= 3 || n.priority === 'alta' || !!n.editorial });
  } catch (e) { console.warn('Card di condivisione non generate:', e.message); }

  // Pagine "Notizie su …": servono prima delle pagine notizia, che le collegano
  let argomenti = { subjects: [], urls: [] }, registry = archive.subjects || [];
  const exclude = TERMS.flatMap(t => ['it', 'en', 'fr', 'de'].map(l => t[l][0].replace(/ \(.*\)$/, '')));
  try { argomenti = await buildArgomenti({ items: archived, registry, root, exclude }); registry = argomenti.subjects; }
  catch (e) { console.warn('Pagine degli argomenti non generate (l\'elenco resta quello di prima):', e.message); }
  const ctx = { subjects: argomenti.subjects, topics: cfgTopics };

  for (const n of everything) {
    const pool = n.editorial || current.has(n.page) ? news : everything;
    const related = pool.filter(r => r !== n && r.page !== n.page && r.category === n.category).slice(0, 6);
    const sameCat = related.length >= 2;
    await writeFile(path.join(root, n.page), pageHtml(n, sameCat ? related : news.filter(r => r.page !== n.page).slice(0, 6), sameCat, ctx));
  }

  await writeFile(path.join(root, 'feed.xml'),
    rss('FAIND – Notizie sull\'intelligenza artificiale', 'Le notizie AI aggiornate ogni ora, sempre con la fonte.', 'feed.xml', news.slice(0, FEED_SIZE)));
  for (const [key, label] of Object.entries(CATS)) {
    const list = news.filter(n => (n.category || 'altro') === key).slice(0, FEED_SIZE);
    await writeFile(path.join(root, `feeds/${key}.xml`),
      rss(`FAIND – ${label}`, `Notizie AI del settore ${label}, aggiornate ogni ora.`, `feeds/${key}.xml`, list));
  }
  await writeFile(path.join(root, 'feeds/youtube.xml'),
    rss('FAIND – Video da YouTube', 'I nuovi video sull\'intelligenza artificiale da creator e canali ufficiali.', 'feeds/youtube.xml', (out.videos || []).slice(0, FEED_SIZE)));

  const today = new Date().toISOString().slice(0, 10);
  const urls = [`<url><loc>${SITE}</loc><lastmod>${today}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    ...['redazione.html', 'about.html', 'a-propos.html', 'ueber-uns.html', 'incorpora.html'].map(p => `<url><loc>${SITE}${p}</loc><priority>0.6</priority></url>`)]
    .concat(everything.filter(indexable).map(n =>
      `<url><loc>${SITE}${n.page}</loc><lastmod>${toDate(n.date).toISOString().slice(0, 10)}</lastmod></url>`));
  await writeFile(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
  await writeFile(path.join(root, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

  // Archivio per mese, e indirizzi nuovi nella sitemap
  try { await addToSitemap(root, [...argomenti.urls, ...await buildArchivePages(archived, root)]); }
  catch (e) { console.warn('Archivio per mese non generato:', e.message); }

  // Glossario AI in quattro lingue (cartella glossario/), con le notizie che citano ogni termine
  try { await buildGlossary(everything, root); }
  catch (e) { console.warn('Glossario non generato:', e.message); }

  // Le AI a confronto, in quattro lingue (cartella confronto/)
  try { await buildCompare(root); }
  catch (e) { console.warn('Pagina di confronto non generata:', e.message); }

  // Approfondimenti: gli articoli di fondo (cartella approfondimenti/)
  try { await buildArticles(root); }
  catch (e) { console.warn('Approfondimenti non generati:', e.message); }
  // Card degli approfondimenti (og/<slug>.png): copertina dell'articolo con fascia, titolo e logo. Servono ai post social
  try {
    await buildCards(ARTICLES.map(a => ({ page: `approfondimenti/${a.slug}.html`, title: a.title, source: { name: 'faind.org' }, category: 'deep', date: '', photo: `assets/${a.img}` })),
      root, { cats: { deep: 'Approfondimenti' } });
  } catch (e) { console.warn('Card degli approfondimenti non generate:', e.message); }

  // Strano ma vero: le curiosità sull'AI, in quattro lingue (cartella strano-ma-vero/)
  try { await buildStrano(root); }
  catch (e) { console.warn('Strano ma vero non generato:', e.message); }

  // IndexNow: avviso le pagine nate nel giro precedente (già online); le nuove di questo giro aspettano il prossimo.
  // Al primo giro con l'archivio mando tutta la sitemap, una volta sola.
  const known = new Set((archive.subjects || []).map(s => s.key));   // argomenti che avevano già una pagina
  const newSubjects = argomenti.subjects.filter(s => !known.has(s.key)).flatMap(s => s.pages.map(l => `${SITE}${ARG_DIR[l]}${s.key}.html`));
  let pending = archive.pending || [];
  if (!archive.indexnowStart) {
    try { pending = [...(await readFile(path.join(root, 'sitemap.xml'), 'utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]); } catch { /* resta vuoto */ }
  }
  const sent = await pingIndexNow(pending);
  pending = [...new Set([...(sent ? [] : pending), ...fresh, ...newSubjects])].slice(-10000);

  // L'archivio aggiornato: il prossimo giro lo rilegge dal sito online
  await writeFile(path.join(root, 'archivio.json'), JSON.stringify({
    updated: new Date().toISOString(), items: archived, subjects: registry, pending,
    indexnowStart: archive.indexnowStart || (sent ? today : '')
  }));
  out.archiveCount = archived.length;

  console.log(`📄 pagine: ${everything.length} (${news.length} della settimana, ${onlyArchived.length} solo in archivio; ${everything.filter(indexable).length} indicizzabili) · feed RSS: ${Object.keys(CATS).length}`);
}
