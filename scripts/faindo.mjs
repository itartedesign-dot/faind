/* =====================================================================
   FAIND — pagina degli short "Dal cassetto di Faindo"
   ---------------------------------------------------------------------
   Gira dentro scripts/youtube.mjs, dopo la consegna degli short.
   Prende gli short già usciti (news.json → tgState.yt, con il link dello
   short) e i loro testi dalla coda social/shorts.json, e genera:
   • la pagina dedicata in quattro lingue: dal-cassetto-di-faindo/ (it),
     /en/, /fr/, /de/, con testo per Google e l'elenco di tutti gli short,
     dal più recente: data di uscita, anteprima con il link e sotto la
     stessa frase usata per l'annuncio su Telegram (campo "telegram");
   • in news.json il campo "shorts" con gli ultimi due, mostrati in home
     nel riquadro YouTube della sezione "L'AI in video".
   Gli short sono in italiano: se nella coda c'è una traduzione
   (campi "telegram_en", "titolo_en", ecc.) la pagina in quella lingua la usa.
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://faind.org/';
export const CHANNEL_URL = 'https://www.youtube.com/@faindnews';
export const FAINDO_DIR = { it: 'dal-cassetto-di-faindo/', en: 'dal-cassetto-di-faindo/en/', fr: 'dal-cassetto-di-faindo/fr/', de: 'dal-cassetto-di-faindo/de/' };
const LANGS = Object.keys(FAINDO_DIR);
const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };
// Immagine con Faindo e il logo YouTube: quella italiana con l'italiano, quella inglese con le altre lingue
const COVER = { it: 'faindo-youtube-it.webp', en: 'faindo-youtube-en.webp', fr: 'faindo-youtube-en.webp', de: 'faindo-youtube-en.webp' };
const HOME_COUNT = 2;    // short mostrati in home: i due della settimana

const UI = {
  it: { locale: 'it-IT', name: 'Dal cassetto di Faindo', pageLang: 'Lingua della pagina', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND',
    seo: 'Dal cassetto di Faindo: storie vere di AI in un minuto | Short YouTube',
    desc: 'Gli short di Faindo, la mascotte di FAIND: storie vere di intelligenza artificiale e scienza in meno di un minuto, ogni lunedì e giovedì su YouTube. Tutte le puntate con data e link.',
    lede: 'Faindo, la mascotte di FAIND, apre il suo vecchio cassetto e tira fuori una storia vera di intelligenza artificiale e scienza. Dura meno di un minuto.',
    intro: [
      'Faindo è un robottino di latta un po’ ammaccato, custode di un archivio seminterrato pieno di cartelline. Non parla: cerca, l’antenna si accende e salta fuori una storia. Antibiotici scoperti per caso, macchine che imparano cose inattese, esperimenti che sembrano fantascienza e invece sono successi davvero.',
      'Ogni storia è verificata sulla fonte originale, lo studio o l’ente che l’ha pubblicata, citata nella descrizione del video su YouTube. Una nuova puntata ogni lunedì e giovedì. Qui trovi tutte quelle uscite, dalla più recente.'
    ],
    sub: 'Iscriviti al canale YouTube', list: 'Tutte le puntate', out: 'Uscito il', watch: 'Guarda lo short su YouTube',
    empty: 'La prima puntata sta per uscire: torna a trovarci lunedì o giovedì.',
    alt: 'Faindo, il robottino mascotte di FAIND, appoggiato al logo di YouTube: seguici anche su YouTube',
    foot: ['Chi siamo', 'Temi', 'Glossario', 'Feed RSS', 'Privacy e note legali'], about: 'redazione.html', topics: 'temi/', gloss: 'glossario/' },
  en: { locale: 'en-GB', name: 'From Faindo’s drawer', pageLang: 'Page language', back: '← All the news', home: 'Back to FAIND news',
    seo: 'From Faindo’s drawer: true AI stories in one minute | YouTube Shorts',
    desc: 'The Shorts of Faindo, the FAIND mascot: true stories of artificial intelligence and science in under a minute, every Monday and Thursday on YouTube. Every episode with date and link.',
    lede: 'Faindo, the FAIND mascot, opens his old drawer and pulls out a true story of artificial intelligence and science. It takes less than a minute.',
    intro: [
      'Faindo is a slightly dented little tin robot who looks after a basement archive full of folders. He never speaks: he searches, his antenna lights up and out comes a story. Antibiotics found by chance, machines learning unexpected things, experiments that sound like science fiction but really happened.',
      'Every story is checked against the original source, the study or the institution that published it, cited in the video description on YouTube. A new episode every Monday and Thursday, in Italian for now. Here you will find all of them, newest first.'
    ],
    sub: 'Subscribe to the YouTube channel', list: 'All episodes', out: 'Released on', watch: 'Watch the Short on YouTube',
    empty: 'The first episode is on its way: come back on Monday or Thursday.',
    alt: 'Faindo, the little FAIND robot mascot, leaning on the YouTube logo: follow us on YouTube too',
    foot: ['About', 'Topics', 'Glossary', 'RSS feeds', 'Privacy and legal notes'], about: 'about.html', topics: 'temi/en/', gloss: 'glossario/en/' },
  fr: { locale: 'fr-FR', name: 'Le tiroir de Faindo', pageLang: 'Langue de la page', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND',
    seo: 'Le tiroir de Faindo : histoires vraies d’IA en une minute | Shorts YouTube',
    desc: 'Les Shorts de Faindo, la mascotte de FAIND : des histoires vraies d’intelligence artificielle et de science en moins d’une minute, chaque lundi et jeudi sur YouTube. Tous les épisodes avec date et lien.',
    lede: 'Faindo, la mascotte de FAIND, ouvre son vieux tiroir et en sort une histoire vraie d’intelligence artificielle et de science. En moins d’une minute.',
    intro: [
      'Faindo est un petit robot en fer-blanc un peu cabossé, gardien d’archives en sous-sol remplies de dossiers. Il ne parle pas : il cherche, son antenne s’allume et une histoire apparaît. Des antibiotiques découverts par hasard, des machines qui apprennent des choses inattendues, des expériences dignes de la science-fiction qui ont vraiment eu lieu.',
      'Chaque histoire est vérifiée à la source, l’étude ou l’institution qui l’a publiée, citée dans la description de la vidéo sur YouTube. Un nouvel épisode chaque lundi et jeudi, en italien pour l’instant. Vous les trouverez tous ici, du plus récent au plus ancien.'
    ],
    sub: 'S’abonner à la chaîne YouTube', list: 'Tous les épisodes', out: 'Publié le', watch: 'Voir le Short sur YouTube',
    empty: 'Le premier épisode arrive bientôt : revenez lundi ou jeudi.',
    alt: 'Faindo, le petit robot mascotte de FAIND, appuyé sur le logo YouTube : suivez-nous aussi sur YouTube',
    foot: ['À propos', 'Thèmes', 'Glossaire', 'Flux RSS', 'Confidentialité et mentions légales'], about: 'a-propos.html', topics: 'temi/fr/', gloss: 'glossario/fr/' },
  de: { locale: 'de-DE', name: 'Aus Faindos Schublade', pageLang: 'Sprache der Seite', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten',
    seo: 'Aus Faindos Schublade: wahre KI-Geschichten in einer Minute | YouTube Shorts',
    desc: 'Die Shorts von Faindo, dem FAIND-Maskottchen: wahre Geschichten über künstliche Intelligenz und Wissenschaft in unter einer Minute, jeden Montag und Donnerstag auf YouTube. Alle Folgen mit Datum und Link.',
    lede: 'Faindo, das Maskottchen von FAIND, öffnet seine alte Schublade und holt eine wahre Geschichte über künstliche Intelligenz und Wissenschaft heraus. In weniger als einer Minute.',
    intro: [
      'Faindo ist ein etwas verbeulter kleiner Blechroboter, der ein Kellerarchiv voller Mappen hütet. Er spricht nicht: Er sucht, seine Antenne leuchtet auf und heraus kommt eine Geschichte. Zufällig entdeckte Antibiotika, Maschinen, die Unerwartetes lernen, Experimente wie aus einem Science-Fiction-Film, die wirklich stattgefunden haben.',
      'Jede Geschichte wird an der Originalquelle geprüft, der Studie oder der Einrichtung, die sie veröffentlicht hat, und in der Videobeschreibung auf YouTube genannt. Eine neue Folge jeden Montag und Donnerstag, vorerst auf Italienisch. Hier findest du alle, die neueste zuerst.'
    ],
    sub: 'YouTube-Kanal abonnieren', list: 'Alle Folgen', out: 'Erschienen am', watch: 'Short auf YouTube ansehen',
    empty: 'Die erste Folge kommt bald: Schau am Montag oder Donnerstag wieder vorbei.',
    alt: 'Faindo, der kleine Roboter und FAIND-Maskottchen, lehnt am YouTube-Logo: Folge uns auch auf YouTube',
    foot: ['Über uns', 'Themen', 'Glossar', 'RSS-Feeds', 'Datenschutz und rechtliche Hinweise'], about: 'ueber-uns.html', topics: 'temi/de/', gloss: 'glossario/de/' }
};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso, lang) => new Intl.DateTimeFormat(UI[lang].locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(iso));
// Titolo da mostrare: quello di YouTube senza gli hashtag finali (#Shorts)
const cleanTitle = (t = '') => String(t).replace(/(\s+#\S+)+\s*$/, '').trim();
// Campo nella lingua della pagina, se c'è (telegram_en, titolo_fr...), altrimenti l'italiano
const pick = (s, field, lang) => (lang !== 'it' && s[`${field}_${lang}`]) || s[field] || '';

export const videoIdOf = (url = '') => (String(url).match(/(?:shorts\/|[?&]v=|youtu\.be\/)([\w-]{6,})/) || [])[1] || '';

/* Gli short usciti, dal più recente: { id, videoId, url, date, titolo, telegram, ...traduzioni }.
   findLink(titolo) serve per quelli usciti di cui non è ancora salvato il link. */
export async function publishedShorts(st, queue, findLink) {
  const out = [];
  for (const [id, v] of Object.entries((st && st.yt) || {})) {
    if (!v || v.esito !== 'sent') continue;
    const s = (queue || []).find(x => x && x.id === id);
    if (!s) continue;
    if (!videoIdOf(v.link) && findLink) {
      const found = await findLink(s.titolo);
      if (found) v.link = found;
    }
    const videoId = videoIdOf(v.link);
    if (!videoId) continue;
    const extra = Object.fromEntries(Object.entries(s).filter(([k]) => /^(titolo|telegram)_[a-z]{2}$/.test(k)));
    out.push({ id, videoId, url: `https://www.youtube.com/shorts/${videoId}`, date: v.at, titolo: cleanTitle(s.titolo), telegram: s.telegram || '',
      ...Object.fromEntries(Object.entries(extra).map(([k, val]) => [k, k.startsWith('titolo') ? cleanTitle(val) : val])) });
  }
  return out.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Per la home (news.json → shorts): i due più recenti
export const homeShorts = (list) => list.slice(0, HOME_COUNT);

const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';

function page(list, lang) {
  const u = UI[lang], up = lang === 'it' ? '../' : '../../';
  const url = SITE + FAINDO_DIR[lang];
  const image = `${SITE}assets/${COVER[lang]}`;
  const sw = LANGS.map(k => k === lang
    ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>`
    : `<a href="${up}${FAINDO_DIR[k]}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ');
  const alts = LANGS.map(k => `  <link rel="alternate" hreflang="${k}" href="${SITE}${FAINDO_DIR[k]}">`).join('\n')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${FAINDO_DIR.it}">`;
  const textLang = (s, f) => (lang !== 'it' && s[`${f}_${lang}`]) ? lang : 'it';
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url + '#page', url, name: u.seo, description: u.desc, inLanguage: u.locale, image,
      isPartOf: { '@id': SITE + '#website' }, publisher: { '@id': SITE + '#org' },
      mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1,
        item: { '@type': 'VideoObject', name: pick(s, 'titolo', lang), description: pick(s, 'telegram', lang) || pick(s, 'titolo', lang),
          thumbnailUrl: thumb(s.videoId), uploadDate: s.date, contentUrl: s.url, embedUrl: `https://www.youtube.com/embed/${s.videoId}`, inLanguage: textLang(s, 'telegram') } })) } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: u.name, item: url }] }
  ] };
  const items = list.length ? list.map(s => `      <li class="fdo__item">
        <a class="fdo__thumb" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(u.watch + ': ' + pick(s, 'titolo', lang))}">
          <img src="${thumb(s.videoId)}" alt="" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="fdo__play">${PLAY}</span>
        </a>
        <div class="fdo__body">
          <p class="fdo__date">${u.out} <time datetime="${esc(s.date)}">${esc(fmtDate(s.date, lang))}</time></p>
          <h3 class="fdo__title" lang="${textLang(s, 'titolo')}"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(pick(s, 'titolo', lang))}</a></h3>
          ${pick(s, 'telegram', lang) ? `<p class="fdo__text" lang="${textLang(s, 'telegram')}">${esc(pick(s, 'telegram', lang))}</p>` : ''}
          <a class="fdo__go" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${u.watch} →</a>
        </div>
      </li>`).join('\n') : `      <li class="fdo__empty">${u.empty}</li>`;
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(u.seo)} | FAIND</title>
  <meta name="description" content="${esc(u.desc)}">
  <link rel="canonical" href="${url}">
${alts}
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(u.seo)}">
  <meta property="og:description" content="${esc(u.desc)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="800">
  <meta property="og:image:height" content="800">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${up}assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>
    .lsw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 13.5px; margin-bottom: 14px; }
    .lsw__lab { color: var(--muted); } .lsw a { color: var(--ink); font-weight: 600; } .lsw__on { font-weight: 800; color: #4293B9; }
    .legal.fdo { max-width: 820px; }
    .fdo__head { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 28px; align-items: center; margin-bottom: 24px; }
    .fdo__head .legal__title { line-height: 1.04; margin-bottom: 12px; }
    .fdo__head .legal__lede { margin-bottom: 16px; color: var(--ink); }
    .fdo__cover { display: block; width: 100%; height: auto; border-radius: 14px; background: #fff; }
    .fdo__sub { display: inline-flex; align-items: center; gap: 10px; background: #E62117; color: #fff; font-weight: 750; font-size: 16px; padding: 12px 18px; border-radius: 10px; text-decoration: none; }
    .fdo__sub:hover { background: #C41A11; color: #fff; }
    .fdo__sub svg { width: 22px; height: 22px; fill: currentColor; }
    .fdo__intro p { font-size: 17px; }
    .legal.fdo h2 { margin-top: 30px; }
    .legal .fdo__list { list-style: none; padding: 0; margin: 0; }
    .legal .fdo__item { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 18px; align-items: start; border-top: 1px solid var(--rule); padding: 20px 0; margin: 0; }
    .fdo__thumb { position: relative; display: block; aspect-ratio: 9 / 16; border-radius: 12px; overflow: hidden; background: #000; }
    .fdo__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .fdo__play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 44px; height: 44px; border-radius: 50%; background: #E62117; display: grid; place-items: center; }
    .fdo__play svg { width: 22px; height: 22px; fill: #fff; }
    .legal p.fdo__date { font-size: 13.5px; color: var(--muted); margin: 0 0 6px; }
    .legal .fdo__title { font-size: 20px; line-height: 1.22; margin: 0 0 8px; }
    .fdo__title a { color: var(--ink); text-decoration: none; }
    .fdo__title a:hover { color: var(--link); text-decoration: underline; }
    .legal p.fdo__text { font-size: 16.5px; margin: 0 0 10px; color: var(--ink); }
    .fdo__go { font-weight: 700; font-size: 14.5px; color: var(--link); }
    .legal .fdo__empty { border-top: 1px solid var(--rule); padding: 20px 0; margin: 0; color: var(--muted); }
    @media (max-width: 680px) {
      .fdo__head { grid-template-columns: minmax(0, 1fr); gap: 18px; }
      .fdo__cover { max-width: 320px; }
      .legal .fdo__item { grid-template-columns: 96px minmax(0, 1fr); gap: 14px; }
      .legal .fdo__title { font-size: 18px; }
    }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="${up}stats.js" defer></script>
  <script src="${up}nav.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="${up}" aria-label="FAIND — Home"><img class="brand__img brand__img--light" src="${up}assets/logo-payoff-light.webp" width="451" height="180" alt="FAIND – Flash AI News Daily"><img class="brand__img brand__img--dark" src="${up}assets/logo-payoff-dark.webp" width="451" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="${up}">${u.back}</a>
    </div>
  </header>
  <main class="wrap legal fdo">
    <p class="np__crumb"><a href="${up}">FAIND</a> › ${esc(u.name)}</p>
    <p class="lsw"><span class="lsw__lab">${u.pageLang}:</span> ${sw}</p>
    <div class="fdo__head">
      <div>
        <h1 class="legal__title">${esc(u.name)}</h1>
        <p class="legal__lede">${esc(u.lede)}</p>
        <a class="fdo__sub" href="${CHANNEL_URL}?sub_confirmation=1" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>${u.sub}</a>
      </div>
      <a href="${CHANNEL_URL}" target="_blank" rel="noopener noreferrer"><img class="fdo__cover" src="${up}assets/${COVER[lang]}" width="800" height="800" alt="${esc(u.alt)}"></a>
    </div>

    <div class="fdo__intro">
${u.intro.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </div>

    <h2>${u.list}</h2>
    <ul class="fdo__list">
${items}
    </ul>

    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="${up}#chi-siamo">${u.foot[0]}</a> · <a href="${up}${u.topics}">${u.foot[1]}</a> · <a href="${up}${u.gloss}">${u.foot[2]}</a> · <a href="${up}feed.xml">${u.foot[3]}</a> · <a href="${up}privacy.html">${u.foot[4]}</a></p></div></footer>
</body>
</html>
`;
}

export async function buildFaindo(root, list) {
  for (const lang of LANGS) {
    const dir = path.join(root, FAINDO_DIR[lang]);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(list, lang));
  }
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const lastmod = (list[0] && list[0].date ? list[0].date : new Date().toISOString()).slice(0, 10);
    let out = xml;
    for (const lang of LANGS) {
      const loc = `<loc>${SITE}${FAINDO_DIR[lang]}</loc>`;
      const entry = `<url>${loc}<lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
      out = out.includes(loc) ? out.replace(new RegExp(`<url>${loc.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}[\\s\\S]*?</url>`), entry) : out.replace('</urlset>', entry + '\n</urlset>');
    }
    if (out !== xml) await writeFile(file, out);
  } catch (e) { console.warn('  sitemap non aggiornata con gli short di Faindo:', e.message); }
  console.log(`🎬 short di Faindo: ${list.length} in pagina, in ${LANGS.length} lingue`);
}
