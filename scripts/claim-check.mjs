/* =========================================================================
   FAIND — Claim check (cartella claim-check/)

   • Una puntata a settimana (giovedì): una affermazione che circola sull'AI
     (o fatta con l'AI), con il verdetto in cima e le fonti in fondo.
     Solo in inglese. Se non c'è nulla che regge una verifica seria, si salta.
   • I testi stanno in scripts/claim-check/AAAA-MM-GG-<slug>.json ed escono solo
     dopo l'ok di Paolo (si aggiungono con una PR). Senza file, nessuna pagina.
   • Forma del file:
       { slug, date: 'AAAA-MM-GG', question, desc, verdict: 'false'|'true'|'ai'|'unverifiable',
         claim, lede, brief: [..], sections: [[titolo, html], ..], faq?: [[domanda, risposta], ..],
         sources: [{ name, title, url }, ..], deep?: [slug approfondimento, ..] }
   • Pagine: claim-check/<slug>.html e l'indice claim-check/.
   • Anteprima: node scripts/claim-check.mjs scripts/claim-check/<file>.json > anteprima.html
   ========================================================================= */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shell, articleBySlug } from './articles.mjs';

const SITE = 'https://faind.org/';
export const CLAIM_DIR = 'claim-check/';
const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'claim-check');
const VERDICT = {
  false: { label: 'False', color: '#b3261e' },
  true: { label: 'True', color: '#1b7f3b' },
  ai: { label: 'Made with AI', color: '#4293B9' },
  unverifiable: { label: 'Unverifiable', color: '#5f6368' }
};
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const day = (d) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date(d + 'T12:00:00Z'));
const CSS = `<style>
    .cc__verdict{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:18px 0 6px}
    .cc__badge{display:inline-block;color:#fff;font-weight:800;font-size:15px;letter-spacing:.04em;text-transform:uppercase;padding:6px 14px;border-radius:8px}
    .cc__claim{margin:0;color:var(--muted);font-size:15px;line-height:1.4}
    .cc__claim b{color:var(--ink)}
  </style>`;

export async function loadClaims() {
  let files = [];
  try { files = (await readdir(DATA)).filter(f => f.endsWith('.json')); } catch { return []; }
  const list = await Promise.all(files.map(async f => JSON.parse(await readFile(path.join(DATA, f), 'utf8'))));
  return list.filter(p => p.slug && p.date && p.question && VERDICT[p.verdict]).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

const badge = (v) => `<span class="cc__badge" style="background:${VERDICT[v].color}">${VERDICT[v].label}</span>`;

export function claimPage(p, all = []) {
  const file = `${p.slug}.html`, url = `${SITE}${CLAIM_DIR}${file}`, image = `${SITE}assets/og-image.png`, v = VERDICT[p.verdict];
  const deep = (p.deep || []).map(s => articleBySlug(s, 'en')).filter(Boolean);
  const others = all.filter(x => x.slug !== p.slug && x.date <= p.date);
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'NewsArticle', '@id': url + '#article', headline: p.question, description: p.desc, image, inLanguage: 'en-GB',
      datePublished: p.date, dateModified: p.updated || p.date, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'FAIND', url: SITE + 'about.html' }, publisher: { '@id': SITE + '#org' },
      citation: (p.sources || []).map(s => ({ '@type': 'CreativeWork', name: s.title || s.name, url: s.url, publisher: { '@type': 'Organization', name: s.name } })) },
    { '@type': 'ClaimReview', url, datePublished: p.date, claimReviewed: p.claim,
      author: { '@type': 'Organization', name: 'FAIND', url: SITE },
      reviewRating: { '@type': 'Rating', alternateName: v.label, ratingValue: { false: 1, ai: 2, unverifiable: 3, true: 5 }[p.verdict], bestRating: 5, worstRating: 1 } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Claim check', item: SITE + CLAIM_DIR }, { '@type': 'ListItem', position: 3, name: p.question, item: url }] },
    ...(p.faq && p.faq.length ? [{ '@type': 'FAQPage', mainEntity: p.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }] : [])
  ] };
  const main = `${CSS}
    <p class="np__crumb"><a href="../">FAIND</a> › <a href="./">Claim check</a></p>
    <a class="art__kick" href="./">Claim check</a>
    <h1 class="legal__title">${esc(p.question)}</h1>
    <p class="legal__updated">By the <a href="../about.html">FAIND newsroom</a> · <time datetime="${p.date}">${day(p.date)}</time></p>
    <div class="cc__verdict">${badge(p.verdict)}<p class="cc__claim"><b>The claim:</b> ${esc(p.claim)}</p></div>
    <p class="legal__lede">${p.lede}</p>

    <div class="art__brief">
      <h2>In brief</h2>
      <ul>${p.brief.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

${p.sections.map(([h, body]) => `    <section>\n      <h2>${esc(h)}</h2>\n      ${body.split(/\n\n+/).map(x => `<p>${x}</p>`).join('\n      ')}\n    </section>`).join('\n')}
${p.faq && p.faq.length ? `
    <section>
      <h2>Frequently asked questions</h2>
${p.faq.map(([q, r]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(r)}</p>`).join('\n')}
    </section>
` : ''}
    <section>
      <h2>Sources</h2>
      <ul class="art__src">${(p.sources || []).map(s => `<li>${esc(s.name)}: <a href="${esc(s.url)}" rel="noopener">${esc(s.title || s.url)}</a></li>`).join('')}</ul>
    </section>
${others.length ? `
    <section>
      <h2>Previous checks</h2>
      <ul class="art__news">${others.slice(0, 10).map(x => `<li><a href="${x.slug}.html">${esc(x.question)}</a> <span>${VERDICT[x.verdict].label} · ${day(x.date)}</span></li>`).join('')}</ul>
    </section>
` : ''}${deep.length ? `
    <section>
      <h2>Go deeper</h2>
      <ul class="art__news">${deep.map(d => `<li><a href="../${d.path}">${esc(d.title)}</a></li>`).join('')}</ul>
    </section>
` : ''}`;
  return shell({ lang: 'en', file, langs: ['en'], title: p.question, desc: p.desc, image, jsonld, main, dir: CLAIM_DIR, altDirs: { en: CLAIM_DIR }, up: '../' });
}

function indexPage(all) {
  const url = SITE + CLAIM_DIR;
  const H1 = 'Claim check: is it true, or made with AI?', DESC = 'One claim about AI, or one viral image or video, checked each week. A clear verdict first, then the evidence and every source.';
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: H1, inLanguage: 'en-GB', isPartOf: { '@id': SITE + '#website' },
    hasPart: all.map(p => ({ '@type': 'NewsArticle', headline: p.question, url: `${url}${p.slug}.html`, datePublished: p.date })) };
  const main = `${CSS}
    <p class="np__crumb"><a href="../">FAIND</a> › Claim check</p>
    <h1 class="legal__title">${esc(H1)}</h1>
    <p class="legal__lede">${esc(DESC)} Verdicts: ${Object.values(VERDICT).map(x => x.label).join(', ')}. We give a verdict only when a primary source backs it; otherwise it is "Unverifiable".</p>
    <ul class="art__news">${all.map(p => `<li><a href="${p.slug}.html">${esc(p.question)}</a> <span>${badge(p.verdict)} ${day(p.date)} · ${esc(p.desc)}</span></li>`).join('')}</ul>
`;
  return shell({ lang: 'en', file: '', langs: ['en'], title: 'Claim check: is it true, or made with AI?', desc: DESC, image: SITE + 'assets/og-image.png', jsonld, main, type: 'website', dir: CLAIM_DIR, altDirs: { en: CLAIM_DIR }, up: '../' });
}

// Pagine del Claim check e indirizzi per la sitemap ([] se non c'è ancora nessuna puntata)
export async function buildClaims(root) {
  const all = await loadClaims();
  if (!all.length) return [];
  const dir = path.join(root, CLAIM_DIR);
  await mkdir(dir, { recursive: true });
  for (const p of all) await writeFile(path.join(dir, `${p.slug}.html`), claimPage(p, all));
  await writeFile(path.join(dir, 'index.html'), indexPage(all));
  console.log(`🔎 claim check: ${all.length} puntate`);
  return [{ url: SITE + CLAIM_DIR, lastmod: all[0].date }, ...all.map(p => ({ url: `${SITE}${CLAIM_DIR}${p.slug}.html`, lastmod: p.updated || p.date }))];
}

// Il riquadro del Claim check in home: l'ultima puntata, subito dopo Il punto (resta nascosto finché non ce n'è una)
export async function prefillClaim(root) {
  const [p] = await loadClaims();
  if (!p) return;
  const file = path.join(root, 'index.html');
  const html = await readFile(file, 'utf8');
  const box = /<section class="punto" id="claim"[^>]*>[\s\S]*?<\/section>/;
  if (!box.test(html)) throw new Error('segnaposto del Claim check non trovato');
  const href = `${CLAIM_DIR}${p.slug}.html`;
  await writeFile(file, html.replace(box, `<section class="punto" id="claim" aria-labelledby="claimTitle" lang="en">
          <p class="punto__kick"><b>Claim check</b> <time datetime="${p.date}">${day(p.date)}</time> ${badge(p.verdict)}</p>
          <h2 class="punto__title" id="claimTitle"><a href="${href}">${esc(p.question)}</a></h2>
          <p class="punto__desc">${esc(p.desc)}</p>
          <p class="punto__links"><a href="${href}">Read the check →</a> <a href="${CLAIM_DIR}">All checks</a></p>
        </section>`));
}

// Anteprima: la pagina con style.css incluso e i link al sito resi assoluti
if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv[2]) {
  const p = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const css = await readFile(path.join(root, 'style.css'), 'utf8').catch(() => '');
  process.stdout.write(claimPage(p, await loadClaims())
    .replace(/<link rel="stylesheet" href="\.\.\/style\.css">/, `<style>${css}</style>`)
    .replace(/(href|src)="\.\.\//g, `$1="${SITE}`)
    .replace(/<script src="[^"]*(stats|nav)\.js" defer><\/script>\n?/g, ''));
}
