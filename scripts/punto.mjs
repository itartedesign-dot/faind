/* =========================================================================
   FAIND — Il punto (cartella il-punto/)

   • Un articolo al giorno sulla notizia più ripresa dalle testate: sintesi
     originale di più fonti, con le fonti in fondo. Solo in italiano.
   • I testi stanno in scripts/punto/AAAA-MM-GG-<slug>.json ed escono solo
     dopo la rilettura della redazione (si aggiungono con una PR).
   • Forma del file:
       { slug, date: 'AAAA-MM-GG', title, desc, lede, brief: [..],
         sections: [[titolo, html, tabella?], ..], faq?: [[domanda, risposta], ..],
         sources: [{ name, title, url }, ..], deep?: [slug approfondimento, ..] }
   • Pagine: il-punto/<slug>.html e l'indice il-punto/ (più recenti in alto).
   • Anteprima da rileggere prima di pubblicare (pagina unica, stili inclusi):
       node scripts/punto.mjs scripts/punto/<file>.json > anteprima.html
   ========================================================================= */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shell, tableHtml, articleBySlug } from './articles.mjs';

const SITE = 'https://faind.org/';
export const PUNTO_DIR = 'il-punto/';
const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'punto');
const up = '../';
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const day = (d, year = true) => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', ...(year ? { year: 'numeric' } : {}), timeZone: 'Europe/Rome' }).format(new Date(d + 'T12:00:00Z'));
const IDX = {
  h1: 'Il punto: le notizie AI del giorno spiegate',
  title: 'Il punto: le notizie sull\'intelligenza artificiale spiegate',
  lede: 'Ogni giorno la notizia sull\'intelligenza artificiale di cui parlano più testate, messa in fila: cosa è successo, cosa dicono le fonti, perché conta. Con tutte le fonti.',
  desc: 'La notizia sull\'intelligenza artificiale più ripresa del giorno, spiegata con ordine: i fatti, le fonti a confronto e perché conta.'
};

export async function loadPunti() {
  let files = [];
  try { files = (await readdir(DATA)).filter(f => f.endsWith('.json')); } catch { return []; }
  const list = await Promise.all(files.map(async f => JSON.parse(await readFile(path.join(DATA, f), 'utf8'))));
  return list.filter(p => p.slug && p.date && p.title).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

const itemHtml = (p) => `<li><a href="${up}${PUNTO_DIR}${p.slug}.html">${esc(p.title)}</a> <span>${day(p.date)}</span></li>`;

export function puntoPage(p, all = []) {
  const file = `${p.slug}.html`, url = `${SITE}${PUNTO_DIR}${file}`, image = `${SITE}assets/og-image.png`;
  const deep = (p.deep || []).map(s => articleBySlug(s, 'it')).filter(Boolean);
  const PREV_MAX = 10;
  const others = all.filter(x => x.slug !== p.slug && x.date <= p.date);   // i punti usciti prima, dal più recente
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'NewsArticle', '@id': url + '#article', headline: p.title, description: p.desc, image, inLanguage: 'it-IT',
      datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'Redazione FAIND', url: SITE + 'redazione.html' }, publisher: { '@id': SITE + '#org' },
      citation: (p.sources || []).map(s => ({ '@type': 'CreativeWork', name: s.title || s.name, url: s.url, publisher: { '@type': 'Organization', name: s.name } })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Il punto', item: SITE + PUNTO_DIR }, { '@type': 'ListItem', position: 3, name: p.title, item: url }] },
    ...(p.faq && p.faq.length ? [{ '@type': 'FAQPage', mainEntity: p.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }] : [])
  ] };
  const main = `    <p class="np__crumb"><a href="${up}">FAIND</a> › <a href="./">Il punto</a></p>
    <a class="art__kick" href="./">Il punto</a>
    <h1 class="legal__title">${esc(p.title)}</h1>
    <p class="legal__updated">A cura della <a href="${up}redazione.html">redazione di FAIND</a> · <time datetime="${p.date}">${day(p.date)}</time></p>
    <p class="legal__lede">${p.lede}</p>

    <div class="art__brief">
      <h2>In breve</h2>
      <ul>${p.brief.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

${p.sections.map(([h, body, table]) => `    <section>\n      <h2>${esc(h)}</h2>\n      ${body.split(/\n\n+/).map(x => `<p>${x}</p>`).join('\n      ')}${table ? `\n      ${tableHtml(table)}` : ''}\n    </section>`).join('\n')}
${p.faq && p.faq.length ? `
    <section>
      <h2>Domande frequenti</h2>
${p.faq.map(([q, r]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(r)}</p>`).join('\n')}
    </section>
` : ''}
    <section>
      <h2>Fonti</h2>
      <ul class="art__src">${(p.sources || []).map(s => `<li>${esc(s.name)}: <a href="${esc(s.url)}" rel="noopener">${esc(s.title || s.url)}</a></li>`).join('')}</ul>
    </section>
${others.length ? `
    <section>
      <h2>I punti dei giorni precedenti</h2>
      <ul class="art__news">${others.slice(0, PREV_MAX).map(x => itemHtml(x).replace('</span></li>', `</span><span>${esc(x.desc)}</span></li>`)).join('')}</ul>${others.length > PREV_MAX ? `
      <p><a href="./">Tutti i punti →</a></p>` : ''}
    </section>
` : ''}${deep.length ? `
    <section>
      <h2>Per capire di più</h2>
      <ul class="art__news">${deep.map(d => `<li><a href="${up}${d.path}">${esc(d.title)}</a></li>`).join('')}</ul>
    </section>
` : ''}`;
  return shell({ lang: 'it', file, langs: ['it'], title: p.title, desc: p.desc, image, jsonld, main, dir: PUNTO_DIR });
}

function indexPage(all) {
  const url = SITE + PUNTO_DIR;
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: IDX.h1, inLanguage: 'it-IT', isPartOf: { '@id': SITE + '#website' },
    hasPart: all.map(p => ({ '@type': 'NewsArticle', headline: p.title, url: `${url}${p.slug}.html`, datePublished: p.date })) };
  const main = `    <p class="np__crumb"><a href="${up}">FAIND</a> › Il punto</p>
    <h1 class="legal__title">${esc(IDX.h1)}</h1>
    <p class="legal__lede">${esc(IDX.lede)}</p>
    <ul class="art__news">${all.map(p => itemHtml(p).replace('</span></li>', `</span><span>${esc(p.desc)}</span></li>`)).join('')}</ul>
`;
  return shell({ lang: 'it', file: '', langs: ['it'], title: IDX.title, desc: IDX.desc, image: SITE + 'assets/og-image.png', jsonld, main, type: 'website', dir: PUNTO_DIR });
}

// Pagine del Punto e indirizzi per la sitemap ([] se non c'è ancora nessun articolo)
export async function buildPunto(root) {
  const all = await loadPunti();
  if (!all.length) return [];
  const dir = path.join(root, PUNTO_DIR);
  await mkdir(dir, { recursive: true });
  for (const p of all) await writeFile(path.join(dir, `${p.slug}.html`), puntoPage(p, all));
  await writeFile(path.join(dir, 'index.html'), indexPage(all));
  console.log(`📰 il punto: ${all.length} articoli`);
  return [{ url: SITE + PUNTO_DIR, lastmod: all[0].date }, ...all.map(p => ({ url: `${SITE}${PUNTO_DIR}${p.slug}.html`, lastmod: p.updated || p.date }))];
}

// Anteprima: la pagina con style.css incluso e i link al sito resi assoluti
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
  const p = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const css = await readFile(path.join(root, 'style.css'), 'utf8').catch(() => '');
  const html = puntoPage(p, await loadPunti())
    .replace(/<link rel="stylesheet" href="\.\.\/style\.css">/, `<style>${css.replace(/url\((['"]?)(?!data:|https?:)/g, `url($1${SITE}`)}</style>`)
    .replace(/(href|src)="\.\.\//g, `$1="${SITE}`)
    .replace(/href="\.\/"/g, `href="${SITE}${PUNTO_DIR}"`)
    .replace(/<script src="[^"]*(stats|nav)\.js" defer><\/script>\n?/g, '')
    .replace(/<link rel="(stylesheet|icon|apple-touch-icon|manifest)" href="https?:[^"]*fonts[^"]*">\n?/g, '')
    .replace(/<img class="brand__img[^>]*>/g, (m) => /--light/.test(m) ? '<strong style="font-size:22px;color:var(--ink)">FAIND</strong>' : '')
    .replace('<title>', '<title>Anteprima · ');
  process.stdout.write(html);
}
