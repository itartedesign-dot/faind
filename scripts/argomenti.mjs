/* =====================================================================
   FAIND — pagine che crescono da sole: argomenti e archivio
   ---------------------------------------------------------------------
   • Archivio (archivio/): le notizie con almeno 2 fonti e quelle della
     redazione restano online per sempre. I dati stanno in archivio.json,
     accanto a news.json; build-pages.mjs lo aggiorna a ogni giro.
     archivio/ elenca i mesi, archivio/AAAA-MM.html le notizie del mese.
   • Argomenti (argomenti/): per ogni nome che torna spesso nelle notizie
     (aziende, prodotti, modelli, persone) una pagina "Notizie su …" con
     tutte le notizie archiviate che lo citano. Una pagina nasce da sola
     quando il nome supera SOGLIA notizie da almeno MIN_FONTI testate;
     una volta nata resta (archivio.json → subjects).
     I nomi arrivano da SEED (elenco di partenza) e dalla scoperta
     automatica: parole con la maiuscola a metà frase, che tornano in
     notizie diverse e quasi mai si scrivono in minuscolo.
     La pagina italiana elenca le notizie in tutte le lingue; quelle in
     inglese, francese e tedesco solo le notizie in quella lingua, e
     nascono quando ne hanno almeno SOGLIA_LINGUA.
   • shell(), footerHtml(), alsoBand(): parti comuni alle pagine generate
     (pagine notizia, glossario, argomenti, archivio).
   Nessun testo scritto dall'AI: le pagine contengono solo dati (nome,
   notizie, fonti, date) e frasi fisse.
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const SITE = 'https://faind.org/';
export const LANGS = ['it', 'en', 'fr', 'de'];
export const ARG_DIR = { it: 'argomenti/', en: 'argomenti/en/', fr: 'argomenti/fr/', de: 'argomenti/de/' };
export const ARCHIVE_DIR = 'archivio/';
export const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };

const SOGLIA = 10;          // notizie archiviate perché nasca la pagina di un argomento
const SOGLIA_LINGUA = 5;    // notizie in una lingua perché nasca la versione in quella lingua
const MIN_FONTI = 3;        // testate diverse che devono averne parlato
const MAX_LISTA = 100;      // notizie mostrate in una pagina argomento (le altre sono nell'archivio)

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));
export const slug = (s = '') => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
const asDate = (iso) => new Date(/T\d{2}:/.test(iso) ? iso : iso + 'T12:00:00');
const LOCALE = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE' };
export const fmtDay = (iso, lang = 'it', month = 'long') =>
  new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month, year: 'numeric', timeZone: 'Europe/Rome' }).format(asDate(iso));
const fmtMonth = (ym, lang = 'it') => {
  const s = new Intl.DateTimeFormat(LOCALE[lang], { month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(ym + '-15T12:00:00Z'));
  return s.charAt(0).toUpperCase() + s.slice(1);   // "Ottobre 2026", anche in italiano e francese
};
const romeDay = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(asDate(iso));

/* ------------------------------ Testi fissi ------------------------------ */
export const UI = {
  it: {
    back: '← Tutte le notizie', pageLang: 'Lingua della pagina', home: 'Torna alle notizie di FAIND',
    foot: [['#chi-siamo', 'Chi siamo'], ['temi/', 'Temi'], ['glossario/', 'Glossario'], ['approfondimenti/', 'Approfondimenti'], ['confronto/', 'Le AI a confronto'], ['argomenti/', 'Argomenti'], ['archivio/', 'Archivio'], ['redazione.html', 'Chi c\'è dietro FAIND'], ['feed.xml', 'Feed RSS'], ['privacy.html', 'Privacy e note legali']],
    alsoTitle: 'Su FAIND trovi anche',
    also: [['', 'Notizie sull\'AI ogni ora', 'sempre con la fonte'], ['https://t.me/faindnews', 'Canale Telegram', 'le notizie importanti sul telefono'], ['glossario/', 'Glossario', 'le parole dell\'AI spiegate semplici'], ['temi/', 'Temi', 'robot, casa, salute, lavoro, clima'], ['approfondimenti/', 'Approfondimenti', 'le risposte alle domande più cercate'], ['confronto/', 'Le AI a confronto', 'pro, contro e prezzi'], ['argomenti/', 'Argomenti', 'tutte le notizie su un nome'], ['archivio/', 'Archivio', 'le notizie dei mesi passati']],
    h1: (s) => `Notizie su ${s}`, seo: (s) => `${s}: le notizie, sempre con la fonte`,
    desc: (s, n, m) => `Le notizie su ${s} raccolte da FAIND: ${n} notizie da ${m} testate, ognuna con la fonte e il link all'articolo originale. Aggiornate ogni ora.`,
    intro: (s, n, m, d) => `FAIND ha raccolto <strong>${n}</strong> notizie su ${esc(s)} da <strong>${m}</strong> testate, dal ${d}. La pagina si aggiorna da sola ogni ora: le notizie riprese da almeno due testate restano qui per sempre.`,
    sources: (n) => n === 1 ? '1 fonte' : `${n} fonti`, related: 'Argomenti collegati', older: 'Le notizie precedenti sono nell\'archivio',
    idxH1: 'Notizie per argomento', idxSeo: 'Notizie AI per argomento: aziende, prodotti e modelli',
    idxDesc: 'Le aziende, i prodotti e i modelli di intelligenza artificiale più citati nelle notizie, ognuno con tutte le sue notizie e le fonti. Pagine che crescono da sole.',
    idxLede: 'Le aziende, i prodotti, i modelli e le persone dell\'intelligenza artificiale che tornano più spesso nelle notizie. Ogni pagina raccoglie tutte le notizie che li citano, con la fonte, e cresce da sola.',
    count: (n) => `${n} notizie`, crumb: 'Argomenti',
    arcH1: 'Archivio delle notizie', arcSeo: 'Archivio delle notizie sull\'intelligenza artificiale',
    arcDesc: 'Tutte le notizie sull\'intelligenza artificiale riprese da almeno due testate, mese per mese, con le fonti.',
    arcLede: 'Le notizie riprese da almeno due testate e quelle della redazione restano qui per sempre, mese per mese, ognuna con le sue fonti.',
    arcMonth: (m) => `Notizie sull'AI di ${m}`, arcMonthDesc: (m, n) => `Le ${n} notizie sull'intelligenza artificiale di ${m} riprese da almeno due testate, giorno per giorno, con le fonti.`,
    months: 'Mesi', prev: '← Mese precedente', next: 'Mese successivo →'
  },
  en: {
    back: '← All news', pageLang: 'Page language', home: 'Back to FAIND news',
    foot: [['#chi-siamo', 'About us'], ['temi/en/', 'Topics'], ['glossario/en/', 'Glossary'], ['approfondimenti/en/', 'In depth'], ['confronto/en/', 'AI assistants compared'], ['argomenti/en/', 'Subjects'], ['archivio/', 'Archive'], ['about.html', 'Who is behind FAIND'], ['feed.xml', 'RSS feed'], ['privacy.html', 'Privacy and legal notes']],
    alsoTitle: 'More on FAIND',
    also: [['', 'AI news every hour', 'always with the source'], ['https://t.me/faindnews', 'Telegram channel', 'top stories on your phone'], ['glossario/en/', 'Glossary', 'AI words explained simply'], ['temi/en/', 'Topics', 'robots, home, health, work, climate'], ['approfondimenti/en/', 'In depth', 'answers to the most searched questions'], ['confronto/en/', 'AI assistants compared', 'pros, cons and prices'], ['argomenti/en/', 'Subjects', 'all the news about a name'], ['archivio/', 'Archive', 'news from past months']],
    h1: (s) => `${s} news`, seo: (s) => `${s} news, always with the source`,
    desc: (s, n, m) => `${s} news collected by FAIND: ${n} stories from ${m} outlets, each with the source and a link to the original article. Updated every hour.`,
    intro: (s, n, m, d) => `FAIND has collected <strong>${n}</strong> stories about ${esc(s)} from <strong>${m}</strong> outlets since ${d}. This page updates itself every hour: stories covered by at least two outlets stay here for good.`,
    sources: (n) => n === 1 ? '1 source' : `${n} sources`, related: 'Related subjects', older: 'Older stories are in the archive',
    idxH1: 'News by subject', idxSeo: 'AI news by subject: companies, products and models',
    idxDesc: 'The artificial intelligence companies, products and models most mentioned in the news, each with all its stories and sources. Pages that grow by themselves.',
    idxLede: 'The companies, products, models and people in artificial intelligence that come up most often in the news. Each page collects every story that mentions them, with the source, and grows by itself.',
    count: (n) => `${n} stories`, crumb: 'Subjects'
  },
  fr: {
    back: '← Toutes les actualités', pageLang: 'Langue de la page', home: 'Retour aux actualités de FAIND',
    foot: [['#chi-siamo', 'Qui sommes-nous'], ['temi/fr/', 'Thèmes'], ['glossario/fr/', 'Glossaire'], ['approfondimenti/fr/', 'Dossiers'], ['confronto/fr/', 'Les IA comparées'], ['argomenti/fr/', 'Sujets'], ['archivio/', 'Archives'], ['a-propos.html', 'Qui est derrière FAIND'], ['feed.xml', 'Flux RSS'], ['privacy.html', 'Confidentialité et mentions légales']],
    alsoTitle: 'Aussi sur FAIND',
    also: [['', 'L\'actualité de l\'IA chaque heure', 'toujours avec la source'], ['https://t.me/faindnews', 'Chaîne Telegram', 'les infos importantes sur votre téléphone'], ['glossario/fr/', 'Glossaire', 'les mots de l\'IA expliqués simplement'], ['temi/fr/', 'Thèmes', 'robots, maison, santé, travail, climat'], ['approfondimenti/fr/', 'Dossiers', 'les réponses aux questions les plus cherchées'], ['confronto/fr/', 'Les IA comparées', 'avantages, inconvénients et prix'], ['argomenti/fr/', 'Sujets', 'toutes les actualités sur un nom'], ['archivio/', 'Archives', 'les actualités des mois passés']],
    h1: (s) => `Actualités sur ${s}`, seo: (s) => `${s} : les actualités, toujours avec la source`,
    desc: (s, n, m) => `Les actualités sur ${s} réunies par FAIND : ${n} articles de ${m} médias, chacun avec sa source et le lien vers l'article original. Mises à jour chaque heure.`,
    intro: (s, n, m, d) => `FAIND a réuni <strong>${n}</strong> actualités sur ${esc(s)} provenant de <strong>${m}</strong> médias depuis le ${d}. Cette page se met à jour toute seule chaque heure : les actualités reprises par au moins deux médias restent ici pour toujours.`,
    sources: (n) => n === 1 ? '1 source' : `${n} sources`, related: 'Sujets liés', older: 'Les actualités plus anciennes sont dans les archives',
    idxH1: 'Actualités par sujet', idxSeo: 'Actualités IA par sujet : entreprises, produits et modèles',
    idxDesc: 'Les entreprises, produits et modèles d\'intelligence artificielle les plus cités dans l\'actualité, chacun avec toutes ses actualités et ses sources. Des pages qui grandissent toutes seules.',
    idxLede: 'Les entreprises, produits, modèles et personnes de l\'intelligence artificielle qui reviennent le plus souvent dans l\'actualité. Chaque page réunit toutes les actualités qui les citent, avec la source, et grandit toute seule.',
    count: (n) => `${n} actualités`, crumb: 'Sujets'
  },
  de: {
    back: '← Alle Nachrichten', pageLang: 'Sprache der Seite', home: 'Zurück zu den FAIND-Nachrichten',
    foot: [['#chi-siamo', 'Über uns'], ['temi/de/', 'Themen'], ['glossario/de/', 'Glossar'], ['approfondimenti/de/', 'Hintergrund'], ['confronto/de/', 'KI im Vergleich'], ['argomenti/de/', 'Stichwörter'], ['archivio/', 'Archiv'], ['ueber-uns.html', 'Wer hinter FAIND steht'], ['feed.xml', 'RSS-Feed'], ['privacy.html', 'Datenschutz und rechtliche Hinweise']],
    alsoTitle: 'Mehr auf FAIND',
    also: [['', 'KI-Nachrichten jede Stunde', 'immer mit Quelle'], ['https://t.me/faindnews', 'Telegram-Kanal', 'die wichtigsten Meldungen aufs Handy'], ['glossario/de/', 'Glossar', 'KI-Begriffe einfach erklärt'], ['temi/de/', 'Themen', 'Roboter, Zuhause, Gesundheit, Arbeit, Klima'], ['approfondimenti/de/', 'Hintergrund', 'Antworten auf die meistgesuchten Fragen'], ['confronto/de/', 'KI im Vergleich', 'Vorteile, Nachteile und Preise'], ['argomenti/de/', 'Stichwörter', 'alle Nachrichten zu einem Namen'], ['archivio/', 'Archiv', 'Nachrichten der vergangenen Monate']],
    h1: (s) => `${s}: Nachrichten`, seo: (s) => `${s}: Nachrichten, immer mit Quelle`,
    desc: (s, n, m) => `Nachrichten zu ${s}, gesammelt von FAIND: ${n} Meldungen aus ${m} Medien, jede mit Quelle und Link zum Originalartikel. Stündlich aktualisiert.`,
    intro: (s, n, m, d) => `FAIND hat seit dem ${d} <strong>${n}</strong> Meldungen zu ${esc(s)} aus <strong>${m}</strong> Medien gesammelt. Die Seite aktualisiert sich jede Stunde von selbst: Meldungen, über die mindestens zwei Medien berichten, bleiben hier dauerhaft.`,
    sources: (n) => n === 1 ? '1 Quelle' : `${n} Quellen`, related: 'Verwandte Stichwörter', older: 'Ältere Meldungen stehen im Archiv',
    idxH1: 'Nachrichten nach Stichwort', idxSeo: 'KI-Nachrichten nach Stichwort: Unternehmen, Produkte und Modelle',
    idxDesc: 'Die in den Nachrichten meistgenannten KI-Unternehmen, -Produkte und -Modelle, jeweils mit allen Meldungen und Quellen. Seiten, die von selbst wachsen.',
    idxLede: 'Die Unternehmen, Produkte, Modelle und Personen der künstlichen Intelligenz, die in den Nachrichten am häufigsten vorkommen. Jede Seite sammelt alle Meldungen, die sie erwähnen, mit Quelle, und wächst von selbst.',
    count: (n) => `${n} Meldungen`, crumb: 'Stichwörter'
  }
};

/* ------------------------------ Parti comuni delle pagine ------------------------------ */
export function footerHtml(lang, up) {
  const u = UI[lang] || UI.it;
  return `<footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · ${u.foot.map(([href, label]) => `<a href="${up}${href}">${esc(label)}</a>`).join(' · ')}</p></div></footer>`;
}

// Fascia "Su FAIND trovi anche": mostra a chi arriva da Google tutto quello che FAIND offre
export const ALSO_CSS = `.fa-also{margin-top:36px;padding:16px;border:1px solid var(--rule);border-radius:14px;background:var(--surface-2)}
.fa-also h2{font-size:18px;font-weight:750;font-stretch:84%;margin-bottom:12px}
.fa-also ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.fa-also a{display:block;height:100%;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--rule);color:var(--ink);text-decoration:none;line-height:1.3}
.fa-also a:hover{border-color:var(--link)}
.fa-also b{display:block;font-size:14.5px}
.fa-also span{font-size:13px;color:var(--muted)}`;
export function alsoBand(lang, up) {
  const u = UI[lang] || UI.it;
  return `<section class="fa-also" aria-label="${esc(u.alsoTitle)}"><h2>${esc(u.alsoTitle)}</h2><ul>` +
    u.also.map(([href, name, sub]) => {
      const ext = /^https:/.test(href);
      return `<li><a href="${ext ? href : up + href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}><b>${esc(name)}</b><span>${esc(sub)}</span></a></li>`;
    }).join('') + `</ul></section>`;
}

const LIST_CSS = `.al-month{font-size:20px;font-weight:750;font-stretch:84%;margin:30px 0 6px;padding-top:12px;border-top:2px solid var(--ink)}
.al{list-style:none;margin:0;padding:0}
.al li{padding:11px 0;border-bottom:1px solid var(--rule);display:grid;gap:3px}
.al a{color:var(--ink);font-weight:650;text-decoration:none;line-height:1.3}
.al a:hover{color:var(--link);text-decoration:underline}
.al small{font-size:12.5px;color:var(--muted)}
.lsw{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:13.5px;margin-bottom:18px}
.lsw__lab{color:var(--muted)}.lsw a{color:var(--ink);font-weight:600}.lsw__on{font-weight:800;color:#4293B9}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0;padding:0;list-style:none}
.chips a{display:inline-block;padding:6px 12px;border:1px solid var(--rule);border-radius:999px;background:var(--surface);color:var(--ink);text-decoration:none;font-size:14px;font-weight:600}
.chips small{color:var(--muted);font-weight:500}`;

// Elenco di notizie raggruppate per mese (o per giorno), con data, fonti e link alla pagina FAIND
export function newsListHtml(list, up, lang, group = 'month') {
  const u = UI[lang] || UI.it;
  const out = []; let cur = '';
  for (const n of list) {
    const key = group === 'day' ? romeDay(n.date) : romeDay(n.date).slice(0, 7);
    if (key !== cur) {
      if (cur) out.push('</ol>');
      out.push(`<h2 class="al-month">${esc(group === 'day' ? fmtDay(key, lang) : fmtMonth(key, lang))}</h2><ol class="al">`);
      cur = key;
    }
    const names = [n.source.name, ...(n.also || []).map(a => a.name)];
    const href = n.page ? up + n.page : n.link.url;
    out.push(`<li><a href="${esc(href)}" hreflang="${esc(n.lang || 'it')}">${esc(tx(n.title))}</a><small>${group === 'day' ? '' : esc(fmtDay(n.date, lang, 'short')) + ' · '}${esc(names.slice(0, 4).join(', '))}${names.length > 4 ? '…' : ''} · ${esc(u.sources(names.length))}</small></li>`);
  }
  if (cur) out.push('</ol>');
  return out.join('\n');
}

// Intelaiatura di una pagina generata: testata, selettore di lingua, contenuto, fascia "Su FAIND", piè di pagina
export function shell({ lang, up, url, title, desc, h1, lede = '', main, alternates = [], robots = 'index, follow', jsonld = null, css = '', crumb = '' }) {
  const u = UI[lang] || UI.it;
  const alts = alternates.length > 1
    ? alternates.map(a => `  <link rel="alternate" hreflang="${a.lang}" href="${a.url}">`).join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="${(alternates.find(a => a.lang === 'it') || alternates[0]).url}">\n` : '';
  const sw = alternates.length > 1
    ? `<p class="lsw"><span class="lsw__lab">${esc(u.pageLang)}:</span> ${alternates.map(a => a.lang === lang
      ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[a.lang]}</span>`
      : `<a href="${a.url.replace(SITE, up)}" hreflang="${a.lang}" lang="${a.lang}">${LANG_LABEL[a.lang]}</a>`).join(' ')}</p>` : '';
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
${alts}  <meta name="robots" content="${robots}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}assets/og-image.png">
  <link rel="icon" href="${up}assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>
${LIST_CSS}
${ALSO_CSS}
${css}
  </style>
${jsonld ? `  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>\n` : ''}  <script src="${up}stats.js" defer></script>
  <script src="${up}nav.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="${up}" aria-label="FAIND — Home"><img class="brand__img" src="${up}assets/logo.webp" width="510" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="${up}">${esc(u.back)}</a>
    </div>
  </header>
  <main class="wrap legal">
    ${crumb ? `<p class="np__crumb">${crumb}</p>\n    ` : ''}${sw}
    <h1 class="legal__title">${esc(h1)}</h1>
    ${lede ? `<p class="legal__lede">${lede}</p>` : ''}
${main}
    ${alsoBand(lang, up)}
    <p class="legal__back"><a class="btn btn--primary" href="${up}">${esc(u.home)}</a></p>
  </main>
  ${footerHtml(lang, up)}
</body>
</html>
`;
}

/* ------------------------------ Argomenti: elenco di partenza ------------------------------ */
// name = come compare nella pagina; re = come riconoscerlo (maiuscole e minuscole contano, salvo /i)
export const SEED = [
  ['OpenAI', /\bOpenAI\b/], ['ChatGPT', /\bChatGPT\b/], ['Sam Altman', /\bAltman\b/], ['Codex', /\bCodex\b/], ['Sora', /\bSora\b/],
  ['Anthropic', /\bAnthropic\b/], ['Claude', /\bClaude\b(?! Monet| Debussy)/],
  ['Google', /\bGoogle\b/], ['Gemini', /\bGemini\b/], ['Google DeepMind', /\bDeepMind\b/],
  ['Meta', /\bMeta\b(?![- ]?(data|analys))/], ['Llama', /\bLlama\b/], ['Mark Zuckerberg', /\bZuckerberg\b/],
  ['Microsoft', /\bMicrosoft\b/], ['Copilot', /\bCopilot\b/],
  ['Nvidia', /\bNvidia\b|\bNVIDIA\b/], ['AMD', /\bAMD\b/], ['Intel', /\bIntel\b/], ['TSMC', /\bTSMC\b/],
  ['Apple', /\bApple\b/], ['Amazon', /\bAmazon\b|\bAWS\b/], ['Samsung', /\bSamsung\b/],
  ['xAI', /\bxAI\b/], ['Grok', /\bGrok\b/], ['Elon Musk', /\bMusk\b/], ['Tesla', /\bTesla\b/],
  ['Mistral AI', /\bMistral\b/], ['DeepSeek', /\bDeepSeek\b/], ['Qwen', /\bQwen\b/], ['Alibaba', /\bAlibaba\b/],
  ['Perplexity', /\bPerplexity\b/], ['Hugging Face', /\bHugging ?Face\b/], ['Midjourney', /\bMidjourney\b/],
  ['Stability AI', /\bStability AI\b|\bStable Diffusion\b/], ['Runway', /\bRunway\b(?= |,|\.|$)/], ['ElevenLabs', /\bElevenLabs\b/],
  ['Suno', /\bSuno\b/], ['Cursor', /\bCursor\b/], ['GitHub', /\bGitHub\b/], ['LangChain', /\bLangChain\b/],
  ['Deep agents', /\bdeep ?agents?\b/i], ['Manus', /\bManus\b/], ['Waymo', /\bWaymo\b/], ['Figure AI', /\bFigure AI\b|\bFigure 0\d\b/],
  ['Boston Dynamics', /\bBoston Dynamics\b/], ['Unitree', /\bUnitree\b/], ['IBM', /\bIBM\b/], ['Oracle', /\bOracle\b/],
  ['Salesforce', /\bSalesforce\b/], ['Adobe', /\bAdobe\b/], ['Baidu', /\bBaidu\b/], ['ByteDance', /\bByteDance\b|\bTikTok\b/],
  ['Ecosia', /\bEcosia\b/], ['AI Act', /\bAI Act\b|\bKI-Verordnung\b/]
].map(([name, re]) => ({ name, key: slug(name), re: re.source, flags: re.flags, seed: true }));

/* ------------------------------ Argomenti: scoperta automatica ------------------------------ */
// Parole con la maiuscola che interrompono un nome (articoli, preposizioni, giorni, mesi…)
const STOP = new Set(('Mr Ms Mrs Dr Prof The This That These Those It Its He She They We You I A An In On At For With From By To Of And Or But If As Is Are Was ' +
  'Il Lo La Le Gli Un Una Uno Per Con Su Da Di Del Della Dei Delle Nel Nella Che Non Ma Se Come Anche Questo Questa ' +
  'Le Les Des Du De Pour Avec Sur Dans Une Un Et Ou Mais Ce Cette Ces Il Elle Ils Elles Nous Vous ' +
  'Der Die Das Den Dem Des Ein Eine Und Oder Aber Mit Für Auf Aus Bei Von Zu Im Am ' +
  'Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December ' +
  'Lunedì Martedì Mercoledì Giovedì Venerdì Sabato Domenica Gennaio Febbraio Marzo Aprile Maggio Giugno Luglio Agosto Settembre Ottobre Novembre Dicembre ' +
  'Lundi Mardi Mercredi Jeudi Vendredi Samedi Dimanche Janvier Février Mars Avril Mai Juin Juillet Août Septembre Octobre Novembre Décembre ' +
  'News Update Report Reports Study Breaking Video Podcast Newsletter Live Exclusive Opinion Analysis Review Guide Week Today').split(/\s+/));
// Parole che possono stare dentro un nome (Kestrel Labs, Mistral AI) ma da sole non fanno un argomento
const SOLO = new Set(('AI IA KI US USA UK EU UE CEO CTO CFO COO API APIs LLM LLMs GPU GPUs CPU AGI IT TV PC PCs App Apps Inc Ltd Co Corp LLC Research ' +
  'America American Americans Europe European China Chinese India Indian Japan Japanese Korea Korean Russia Russian Germany German France French ' +
  'Italy Italian Italia Britain British California Texas Washington York London Paris Berlin Silicon Valley Brussels Beijing ' +
  'Stati Uniti Unione Europea Cina Francia Germania Europa Allemagne Deutschland Frankreich ' +
  'Senate Congress Commission Government Court Federal President Minister Ministry White House Trump Biden ' +
  'University Institute Center Centre Lab Labs Team Group Company Startup Startups Inc. Series Fund Capital Ventures').split(/\s+/));
const UPPER = /^\p{Lu}/u, MIXED = /\p{Ll}\p{Lu}|\p{Lu}{2,}\p{Ll}|\p{L}-?\d|^\p{Ll}\p{Lu}/u;

function capitalRuns(text) {
  const found = new Set();
  for (const sentence of String(text).split(/(?<=[.!?:;…])\s+|\s[–—-]\s|["«»“”()\[\]|]/)) {
    const words = sentence.split(/\s+/).filter(Boolean);
    let run = [];
    const flush = () => { if (run.length) found.add(run.join(' ')); run = []; };
    words.forEach((raw, i) => {
      const endsHere = /[,;:.!?]$/.test(raw);
      const w = raw.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}+]+$/u, '').replace(/['’]s$/u, '');
      const ok = w.length >= 2 && !STOP.has(w) && (MIXED.test(w) || (UPPER.test(w) && i > 0)) && !/^\d+$/.test(w);
      if (ok && run.length < 3) run.push(w); else { flush(); if (ok) run.push(w); }
      if (endsHere) flush();
    });
    flush();
  }
  // via le parole generiche ai bordi del nome ("AI Kestrel" → "Kestrel"; "Mistral AI" resta)
  const out = new Set();
  for (const f of found) {
    const w = f.split(' ');
    while (w.length > 1 && SOLO.has(w[0])) w.shift();
    if (w.length === 1 && SOLO.has(w[0])) continue;
    out.add(w.join(' '));
  }
  return out;
}

const reOf = (s) => new RegExp(s.re, s.flags || '');
const textOf = (n) => `${tx(n.title)} ${tx(n.summary) || ''}`;
const sourcesOf = (n) => [n.source.name, ...(n.also || []).map(a => a.name)];

// Nomi nuovi che meritano una pagina: tornano in almeno SOGLIA notizie, da almeno MIN_FONTI testate,
// e quasi mai compaiono scritti in minuscolo (così si escludono le parole comuni)
export function discoverSubjects(items, known, { exclude = [] } = {}) {
  const outlets = new Set(items.flatMap(sourcesOf).map(s => s.toLowerCase()));
  const skip = new Set(exclude.map(s => s.toLowerCase()));
  const hits = new Map();
  for (const n of items) {
    // i titoli in inglese e tedesco hanno spesso tutte le iniziali maiuscole: per loro uso solo il sommario.
    // il tedesco scrive con la maiuscola tutti i nomi comuni: lì non cerco nomi nuovi
    if ((n.lang || 'it') === 'de') continue;
    const text = (['it', 'fr'].includes(n.lang || 'it') ? tx(n.title) + '. ' : '') + (tx(n.summary) || '');
    for (const c of capitalRuns(text)) {
      if (!hits.has(c)) hits.set(c, new Set());
      hits.get(c).add(n.id);
    }
  }
  const knownRes = known.map(reOf);
  const corpus = items.map(textOf).join('\n');
  const found = [];
  for (const [name, ids] of hits) {
    if (ids.size < SOGLIA || name.length < 3) continue;
    const low = name.toLowerCase();
    if (skip.has(low) || outlets.has(low) || [...outlets].some(o => o.startsWith(low + ' ') || o.endsWith(' ' + low))) continue;
    if (knownRes.some(r => r.test(name))) continue;
    if (known.some(k => k.name !== name && ` ${k.name} `.includes(` ${name} `))) continue;   // "Face" dentro "Hugging Face"
    const escd = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lower = (corpus.match(new RegExp(`(?<![\\p{L}\\p{N}])${escd.toLowerCase()}(?![\\p{L}\\p{N}])`, 'gu')) || []).length;
    const upper = (corpus.match(new RegExp(`(?<![\\p{L}\\p{N}])${escd}(?![\\p{L}\\p{N}])`, 'gu')) || []).length;
    if (lower > upper * 0.25) continue;
    found.push({ name, key: slug(name), re: `(?<![\\p{L}\\p{N}])${escd}(?![\\p{L}\\p{N}])`, flags: 'u', count: ids.size });
  }
  // Un nome contenuto in un altro più lungo e quasi sempre insieme a lui (Altman / Sam Altman) non fa pagina a sé
  return found.filter(s => !found.some(o => o !== s && o.name.split(' ').length > s.name.split(' ').length &&
    o.name.split(' ').includes(s.name) && o.count >= s.count * 0.5))
    .filter(s => s.key);
}

// Argomenti citati in un testo (solo quelli che hanno già una pagina)
export function subjectsIn(text, subjects) {
  return subjects.filter(s => s.pages && reOf(s).test(text));
}

/* ------------------------------ Argomenti: pagine ------------------------------ */
export async function buildArgomenti({ items, registry = [], root, now = Date.now(), exclude = [] }) {
  // 1) Chi ha una pagina: quelli già nati restano; i nuovi nascono quando superano le soglie
  const byKey = new Map();
  for (const s of [...SEED, ...registry]) if (s.key && !byKey.has(s.key)) byKey.set(s.key, { ...s });
  for (const s of discoverSubjects(items, [...byKey.values()], { exclude })) if (!byKey.has(s.key)) byKey.set(s.key, s);

  const sorted = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const subjects = [];
  for (const s of byKey.values()) {
    const re = reOf(s);
    const list = sorted.filter(n => re.test(textOf(n)));
    const outlets = new Set(list.flatMap(sourcesOf));
    const born = registry.some(r => r.key === s.key && r.since);
    if (!born && (list.length < SOGLIA || outlets.size < MIN_FONTI)) continue;
    const pages = LANGS.filter(l => l === 'it' || list.filter(n => (n.lang || 'it') === l).length >= SOGLIA_LINGUA);
    subjects.push({ name: s.name, key: s.key, re: s.re, flags: s.flags || '', seed: !!s.seed, since: (registry.find(r => r.key === s.key) || {}).since || new Date(now).toISOString().slice(0, 10), pages, _list: list });
  }
  subjects.sort((a, b) => b._list.length - a._list.length || a.name.localeCompare(b.name));

  // 2) Pagine
  const urls = [];
  for (const s of subjects) {
    const alternates = s.pages.map(l => ({ lang: l, url: `${SITE}${ARG_DIR[l]}${s.key}.html` }));
    // argomenti che compaiono più spesso nelle stesse notizie
    const co = subjects.filter(o => o !== s).map(o => [o, s._list.filter(n => reOf(o).test(textOf(n))).length])
      .filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8);
    for (const lang of s.pages) {
      const u = UI[lang], up = lang === 'it' ? '../' : '../../';
      const list = lang === 'it' ? s._list : s._list.filter(n => (n.lang || 'it') === lang);
      const outlets = new Set(list.flatMap(sourcesOf));
      const first = list.length ? list[list.length - 1].date : new Date(now).toISOString();
      const url = `${SITE}${ARG_DIR[lang]}${s.key}.html`;
      const rel = co.length ? `<section class="np__box"><h2>${esc(u.related)}</h2><ul class="chips">${co.map(([o]) => {
        const l = o.pages.includes(lang) ? lang : 'it';
        return `<li><a href="${up}${ARG_DIR[l]}${o.key}.html">${esc(o.name)}</a></li>`;
      }).join('')}</ul></section>` : '';
      const shown = list.slice(0, MAX_LISTA);
      const main = `${newsListHtml(shown, up, lang)}
    ${list.length > MAX_LISTA ? `<p><a href="${up}${ARCHIVE_DIR}">${esc(u.older)} →</a></p>` : ''}
    ${rel}`;
      const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', url, name: u.h1(s.name), inLanguage: LOCALE[lang], about: { '@type': 'Thing', name: s.name },
        mainEntity: { '@type': 'ItemList', numberOfItems: shown.length, itemListElement: shown.slice(0, 30).map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: n.page ? SITE + n.page : n.link.url, name: tx(n.title) })) } };
      const html = shell({ lang, up, url, title: `${u.seo(s.name)} | FAIND`, desc: u.desc(s.name, list.length, outlets.size), h1: u.h1(s.name),
        lede: u.intro(s.name, list.length, outlets.size, fmtDay(first, lang)), main, alternates, jsonld,
        crumb: `<a href="${up}">FAIND</a> › <a href="${up}${ARG_DIR[lang]}">${esc(u.crumb)}</a>` });
      await mkdir(path.join(root, ARG_DIR[lang]), { recursive: true });
      await writeFile(path.join(root, ARG_DIR[lang], `${s.key}.html`), html);
      urls.push({ url, lastmod: list[0] ? romeDay(list[0].date) : '' });
    }
  }
  // Indice degli argomenti, in ogni lingua
  for (const lang of LANGS) {
    const u = UI[lang], up = lang === 'it' ? '../' : '../../';
    const url = `${SITE}${ARG_DIR[lang]}`;
    const list = subjects.filter(s => s.pages.includes(lang));
    const main = `<ul class="chips">${list.map(s => {
      const n = lang === 'it' ? s._list.length : s._list.filter(x => (x.lang || 'it') === lang).length;
      return `<li><a href="${s.key}.html">${esc(s.name)} <small>${esc(u.count(n))}</small></a></li>`;
    }).join('')}</ul>`;
    await mkdir(path.join(root, ARG_DIR[lang]), { recursive: true });
    await writeFile(path.join(root, ARG_DIR[lang], 'index.html'), shell({ lang, up, url, title: `${u.idxSeo} | FAIND`, desc: u.idxDesc, h1: u.idxH1, lede: esc(u.idxLede), main,
      alternates: LANGS.map(l => ({ lang: l, url: `${SITE}${ARG_DIR[l]}` })), robots: list.length ? 'index, follow' : 'noindex, follow' }));
    if (list.length) urls.push({ url, lastmod: '' });
  }
  const out = subjects.map(({ _list, ...s }) => s);
  console.log(`🏷  argomenti: ${out.length} pagine (${out.filter(s => !s.seed).length} scoperte da sole)`);
  return { subjects: out, urls };
}

/* ------------------------------ Archivio: pagine per mese ------------------------------ */
export async function buildArchivePages(items, root) {
  const u = UI.it, up = '../';
  const byMonth = new Map();
  for (const n of [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
    const m = romeDay(n.date).slice(0, 7);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m).push(n);
  }
  const months = [...byMonth.keys()];
  const dir = path.join(root, ARCHIVE_DIR);
  await mkdir(dir, { recursive: true });
  const urls = [];
  for (let i = 0; i < months.length; i++) {
    const m = months[i], list = byMonth.get(m), label = fmtMonth(m, 'it').toLowerCase();
    const nav = `<p class="np__crumb">${i < months.length - 1 ? `<a href="${months[i + 1]}.html">${u.prev}</a>` : ''}${i > 0 ? ` &nbsp; <a href="${months[i - 1]}.html">${u.next}</a>` : ''}</p>`;
    const url = `${SITE}${ARCHIVE_DIR}${m}.html`;
    await writeFile(path.join(dir, `${m}.html`), shell({ lang: 'it', up, url, title: `${u.arcMonth(label)} | FAIND`, desc: u.arcMonthDesc(label, list.length),
      h1: u.arcMonth(label), main: `${nav}\n${newsListHtml(list, up, 'it', 'day')}\n${nav}`,
      crumb: `<a href="${up}">FAIND</a> › <a href="./">${esc(u.arcH1)}</a>` }));
    urls.push({ url, lastmod: romeDay(list[0].date) });
  }
  const main = `<ul class="chips">${months.map(m => `<li><a href="${m}.html">${esc(fmtMonth(m, 'it'))} <small>${esc(u.count(byMonth.get(m).length))}</small></a></li>`).join('')}</ul>`;
  await writeFile(path.join(dir, 'index.html'), shell({ lang: 'it', up, url: SITE + ARCHIVE_DIR, title: `${u.arcSeo} | FAIND`, desc: u.arcDesc, h1: u.arcH1, lede: esc(u.arcLede), main,
    robots: months.length ? 'index, follow' : 'noindex, follow' }));
  if (months.length) urls.push({ url: SITE + ARCHIVE_DIR, lastmod: '' });
  console.log(`🗄  archivio: ${items.length} notizie in ${months.length} ${months.length === 1 ? 'mese' : 'mesi'}`);
  return urls;
}

// Aggiunge indirizzi alla sitemap già scritta da build-pages.mjs
export async function addToSitemap(root, urls) {
  const file = path.join(root, 'sitemap.xml');
  const xml = await readFile(file, 'utf8');
  const extra = urls.filter(u => !xml.includes(`<loc>${u.url}</loc>`))
    .map(u => `<url><loc>${u.url}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n');
  if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
}
