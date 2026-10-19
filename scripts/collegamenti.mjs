/* =========================================================================
   FAIND — collegamenti nel testo
   I nomi degli argomenti (OpenAI, Claude, Nvidia…) e le parole del glossario
   diventano link alla loro pagina, alla prima comparsa e mai dentro un link
   o un tag già presente. Serve a notizie, Punto e approfondimenti.
   ========================================================================= */

import { ARG_DIR } from './argomenti.mjs';
import { TERMS, termPath } from './glossary.mjs';

const escAttr = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Le voci da collegare per una pagina: argomenti (con pagina nella lingua, altrimenti in italiano) e, se richiesto, termini del glossario
export function linkTargets({ subjects = [], lang = 'it', up = '../', terms = false, skip = '' }) {
  const out = subjects.filter(s => s.pages && s.indexed && s.key !== skip).map(s => ({
    re: s.re instanceof RegExp ? s.re : new RegExp(s.re, (s.flags || '').replace('g', '')),
    href: `${up}${ARG_DIR[s.pages.includes(lang) ? lang : 'it']}${s.key}.html`, cls: 'sl', title: ''
  }));
  if (terms) for (const t of TERMS) if (t.re) out.push({ re: t.re, href: `${up}${termPath(t.id, lang)}`, cls: 'gl', title: (t[lang] || t.it)[1] });
  return out;
}

// Collega la prima comparsa di ogni voce (al massimo max link in tutto) nel testo HTML, fuori da tag e link esistenti.
// "used" (facoltativo) è condiviso tra più pezzi della stessa pagina: una voce si collega una volta sola per pagina.
export function linkNames(html, targets, { max = 6, used = new Set() } = {}) {
  if (!targets.length || !html) return html;
  // pezzi pari: testo; pezzi dispari: tag o link interi (non si toccano)
  const parts = String(html).split(/(<a\b[^>]*>[\s\S]*?<\/a>|<[^>]+>)/i);
  for (const t of targets) {
    if (used.size >= max) break;
    if (used.has(t.href)) continue;
    for (let i = 0; i < parts.length; i += 2) {
      const m = t.re.exec(parts[i]);
      if (!m || !m[0]) continue;
      let a = m.index, b = m.index + m[0].length;
      while (b < parts[i].length && /[\p{L}\p{N}]/u.test(parts[i][b])) b++;   // parola intera
      while (a > 0 && /[\p{L}\p{N}]/u.test(parts[i][a - 1])) a--;
      const word = parts[i].slice(a, b);
      const link = `<a class="${t.cls}" href="${t.href}"${t.title ? ` title="${escAttr(t.title)}"` : ''}>${word}</a>`;
      parts.splice(i, 1, parts[i].slice(0, a), link, parts[i].slice(b));
      used.add(t.href);
      break;
    }
  }
  return parts.join('');
}
