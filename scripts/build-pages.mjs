/* =====================================================================
   FAIND — pagine notizia, feed RSS e sitemap
   ---------------------------------------------------------------------
   Chiamato da fetch-news.mjs a ogni giro orario. Genera:
   • n/<titolo>-<id>.html   una pagina per ogni notizia (per Google e
                            per le condivisioni), con fonte, altre
                            testate che ne parlano e notizie correlate
   • feed.xml               feed RSS generale (ultime 20 notizie)
   • feeds/<settore>.xml    un feed RSS per ogni settore + feeds/youtube.xml
   • sitemap.xml            home + pagine indicizzabili
   Indicizzabili da Google solo le notizie della redazione o riprese
   da almeno 2 fonti: le altre sono "noindex" per non avere pagine
   povere di contenuto.
   ===================================================================== */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import { buildCards } from './cards.mjs';
import { buildCompare } from './compare.mjs';
import { buildArticles, ARTICLES } from './articles.mjs';
import { buildStrano } from './strano.mjs';
import { buildGlossary, termsIn, linkify, GLOSSARY_PATH } from './glossary.mjs';

export const SITE = 'https://faind.org/';
const FEED_SIZE = 20;

export const CATS = {
  chatbot: 'Chatbot e LLM', immagini: 'Immagini e grafica', video: 'Video', musica: 'Musica e audio',
  codice: 'Programmazione', produttivita: 'Produttività', ricerca: 'Ricerca e scienza',
  hardware: 'Chip e infrastruttura', regole: 'Leggi e regole', altro: 'Altro'
};
const TYPES = { news: 'News', tool: 'Tool', prezzi: 'Prezzi', download: 'Download', guide: 'Guida', convenzioni: 'Convenzioni', video: 'Video' };
const LANGS = { it: 'italiano', en: 'inglese', fr: 'francese', de: 'tedesco' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));
const cdata = (s = '') => '<![CDATA[' + String(s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';

export function slugify(s = '') {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '') || 'notizia';
}
const shortId = (id) => String(id).replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase();
const toDate = (iso) => new Date(/T\d{2}:/.test(iso) ? iso : iso + 'T12:00:00');
const fmtDate = (iso) => new Intl.DateTimeFormat('it-IT', {
  day: 'numeric', month: 'long', year: 'numeric', hour: /T\d{2}:/.test(iso) ? '2-digit' : undefined,
  minute: /T\d{2}:/.test(iso) ? '2-digit' : undefined, timeZone: 'Europe/Rome'
}).format(toDate(iso));

async function loadEditorial(root) {
  try {
    const code = await readFile(path.join(root, 'data.js'), 'utf8');
    const ctx = { window: {} };
    vm.runInNewContext(code, ctx, { timeout: 1000 });
    return ctx.window.FAIND_DATA || {};
  } catch (e) { console.warn('data.js non leggibile:', e.message); return {}; }
}

const indexable = (n) => !!n.editorial || (n.coverage || 1) >= 2 || n.priority === 'alta';

/* ------------------------------ Pagina notizia ------------------------------ */
function pageHtml(n, related, sameCat) {
  const url = SITE + n.page;
  const title = tx(n.title);
  const summary = tx(n.summary);
  const cat = CATS[n.category] || CATS.altro;
  const type = TYPES[n.tag] || 'News';
  const desc = (summary || title).slice(0, 155);
  const langNote = n.lang && n.lang !== 'it'
    ? `<p class="np__note">Estratto dall'articolo originale in ${LANGS[n.lang] || n.lang}.</p>` : '';
  const also = (n.also || []).length
    ? `<section class="np__box"><h2>Ne parlano ${n.also.length + 1} testate</h2><ul class="np__also">` +
      [{ name: n.source.name, url: n.link.url }, ...n.also].map(a =>
        `<li><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${esc(a.name)}</a></li>`).join('') +
      `</ul></section>` : '';
  const rel = related.length
    ? `<section class="np__box"><h2>${sameCat ? 'Altre notizie: ' + esc(cat) : 'Le ultime notizie su FAIND'}</h2><ul class="np__rel">` +
      related.map(r => `<li><a href="../${esc(r.page)}">${esc(tx(r.title))}</a><span>${esc(r.source.name)}</span></li>`).join('') +
      `</ul></section>` : '';
  const img = n.image && /^https:\/\//.test(n.image)
    ? `<img class="np__img" src="${esc(n.image)}" alt="" referrerpolicy="no-referrer" loading="eager" onerror="this.remove()">` : '';
  // Parole del glossario presenti nella notizia: collegamento automatico alla definizione
  const found = termsIn(`${title} ${summary}`);
  const terms = found.length
    ? `<section class="np__box"><h2>Parole chiave</h2><p style="display:flex;flex-wrap:wrap;gap:8px">` +
      found.slice(0, 8).map(t => `<a href="../${GLOSSARY_PATH.it}#${t.id}" title="${esc(t.it[1])}" style="padding:6px 12px;border:1px solid var(--rule);border-radius:999px;background:var(--surface);color:var(--ink);text-decoration:none;font-size:14px;font-weight:600">${esc(t.it[0].replace(/ \(.*\)$/, ''))}</a>`).join('') +
      `</p></section>` : '';
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE },
    { '@type': 'ListItem', position: 2, name: cat, item: SITE + '#news' },
    { '@type': 'ListItem', position: 3, name: title, item: url }
  ] };

  return `<!doctype html>
<html lang="it" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} | FAIND</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="robots" content="${indexable(n) ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${esc(n.og ? SITE + n.og : n.image && /^https:/.test(n.image) ? n.image : SITE + 'assets/og-image.png')}">${n.og ? '\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">' : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/favicon.png" type="image/png">
  <link rel="alternate" type="application/rss+xml" title="FAIND – Notizie AI" href="../feed.xml">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="../assets/fonts/archivo.css">
  <link rel="stylesheet" href="../style.css">
  <link rel="manifest" href="../manifest.webmanifest">
  <link rel="apple-touch-icon" href="../assets/icon-180.png">
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>
  <script src="../stats.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="../" aria-label="FAIND — Home"><img class="brand__img" src="../assets/logo.webp" width="510" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="../">← Tutte le notizie</a>
    </div>
  </header>
  <main class="wrap np">
    <article class="np__main">
      <p class="np__crumb"><a href="../">FAIND</a> › ${esc(cat)}</p>
      <div class="np__tags"><span class="tag" data-tag="${esc(n.tag)}">${esc(type)}</span><span class="cat">${esc(cat)}</span></div>
      <h1 class="np__title">${esc(title)}</h1>
      <p class="np__meta"><time datetime="${esc(n.date)}">${esc(fmtDate(n.date))}</time> · Fonte: <a href="${esc(n.link.url)}" target="_blank" rel="noopener noreferrer">${esc(n.source.name)}</a></p>
      ${img}
      ${summary ? `<p class="np__lede">${linkify(esc(summary), '../', GLOSSARY_PATH[n.lang] ? n.lang : 'it')}</p>` : ''}
      ${langNote}
      <a class="btn btn--primary np__cta" href="${esc(n.link.url)}" target="_blank" rel="noopener noreferrer">Leggi l'articolo completo su ${esc(n.source.name)} ↗</a>
      <p class="np__disclaimer">FAIND riporta titolo e un breve estratto: l'articolo completo e i diritti appartengono a ${esc(n.source.name)}.</p>
      ${also}
      ${terms}
      ${rel}
    </article>
    <aside class="np__side">
      <a class="tgcta" href="https://t.me/faindnews" target="_blank" rel="noopener noreferrer">
        <span class="tgcta__name">@faindnews</span>
        <span class="tgcta__text">Le notizie AI importanti sul tuo telefono, appena escono. Iscriviti al canale Telegram.</span>
      </a>
      <a class="btn btn--ghost np__home" href="../">Tutte le notizie di oggi su FAIND</a>
    </aside>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="../#chi-siamo">Chi siamo</a> · <a href="../temi/">Temi</a> · <a href="../glossario/">Glossario</a> · <a href="../confronto/">Le AI a confronto</a> · <a href="../approfondimenti/">Approfondimenti</a> · <a href="../redazione.html">Chi c'è dietro FAIND</a> · <a href="../feed.xml">Feed RSS</a> · <a href="../privacy.html">Privacy e note legali</a></p></div></footer>
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

/* ------------------------------ Build ------------------------------ */
export async function buildSite(out, root) {
  const data = await loadEditorial(root);
  const editorial = (data.news || []).map(n => ({ ...n, editorial: true, lang: n.lang || 'it', page: `n/${slugify(n.id)}.html` }));
  const edUrls = new Set(editorial.map(n => n.link && n.link.url));

  for (const it of out.items) {
    if (!it.page) it.page = `n/${slugify(it.title)}-${shortId(it.id)}.html`;
  }
  out.pages = Object.fromEntries(editorial.map(n => [n.id, n.page]));
  // Le notizie del Focus che sono anche notizie principali puntano alla loro pagina
  const byId = new Map(out.items.map(i => [i.id, i]));
  for (const sp of out.spotlight || []) if (sp.news && byId.has(sp.news.id)) sp.news.page = byId.get(sp.news.id).page;

  const news = [...editorial, ...out.items.filter(i => !edUrls.has(i.link.url))]
    .sort((a, b) => toDate(b.date) - toDate(a.date));

  await rm(path.join(root, 'n'), { recursive: true, force: true });
  await mkdir(path.join(root, 'n'), { recursive: true });
  await mkdir(path.join(root, 'feeds'), { recursive: true });

  // I caratteri servono anche alle card: li scarico prima
  try { console.log(`🔤 caratteri serviti da FAIND: ${await selfHostFonts(root)} file`); }
  catch (e) { console.warn('🔤 caratteri non scaricati (si usano quelli di sistema):', e.message); }

  // Card di condivisione con il marchio FAIND (cartella og/): una per pagina notizia
  try {
    await buildCards(news, root, { cats: CATS, liveBase: (process.env.PREVIOUS_URL || '').replace(/\/news\.json.*$/, ''), important: (n) => (n.coverage || 1) >= 3 || n.priority === 'alta' || !!n.editorial });
  } catch (e) { console.warn('Card di condivisione non generate:', e.message); }

  for (const n of news) {
    const related = news.filter(r => r !== n && r.category === n.category).slice(0, 6);
    const sameCat = related.length >= 2;
    await writeFile(path.join(root, n.page), pageHtml(n, sameCat ? related : news.filter(r => r !== n).slice(0, 6), sameCat));
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
    .concat(news.filter(indexable).map(n =>
      `<url><loc>${SITE}${n.page}</loc><lastmod>${toDate(n.date).toISOString().slice(0, 10)}</lastmod></url>`));
  await writeFile(path.join(root, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);


  // Glossario AI in quattro lingue (cartella glossario/), con le notizie che citano ogni termine
  try { await buildGlossary(news, root); }
  catch (e) { console.warn('Glossario non generato:', e.message); }

  // Le AI a confronto, in quattro lingue (cartella confronto/)
  try { await buildCompare(root); }
  catch (e) { console.warn('Pagina di confronto non generata:', e.message); }

  // Approfondimenti: gli articoli di fondo (cartella approfondimenti/)
  try { await buildArticles(root); }
  catch (e) { console.warn('Approfondimenti non generati:', e.message); }
  // Card con il marchio FAIND anche per gli approfondimenti (og/<slug>.png): servono ai post social
  try {
    await buildCards(ARTICLES.map(a => ({ page: `approfondimenti/${a.slug}.html`, title: a.title, source: { name: 'faind.org' }, category: 'deep', date: '' })),
      root, { cats: { deep: 'Approfondimenti' } });
  } catch (e) { console.warn('Card degli approfondimenti non generate:', e.message); }

  // Strano ma vero: le curiosità sull'AI, in quattro lingue (cartella strano-ma-vero/)
  try { await buildStrano(root); }
  catch (e) { console.warn('Strano ma vero non generato:', e.message); }

  console.log(`📄 pagine: ${news.length} (${news.filter(indexable).length} indicizzabili) · feed RSS: ${Object.keys(CATS).length}`);
}
