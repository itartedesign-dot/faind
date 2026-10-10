/* =====================================================================
   FAIND — pubblicazione automatica sul canale Telegram
   ---------------------------------------------------------------------
   Gira dopo fetch-news.mjs, nella stessa GitHub Action (ogni ora).
   Legge news.json, sceglie le notizie nuove da pubblicare, le invia
   al canale e le segna come pubblicate (campo "tg") così non escono
   mai due volte.

   Regole:
   • solo notizie uscite nelle ultime FRESH_HOURS ore (niente arretrati);
   • prima le importanti (3+ fonti), poi le più recenti;
   • al massimo MAX_PER_RUN post per giro, per non intasare il canale;
   • più 1 video per giro (uscito nelle ultime VIDEO_HOURS ore);
   • solo notizie e video nelle lingue TG_LANGS (italiano e inglese);
   • "Il punto delle 8": una volta al giorno, al primo giro dopo le 8:00
     (ora italiana), un post con il logo e le DIGEST_COUNT notizie più
     importanti delle ultime 24 ore. La data dell'ultimo invio è salvata
     in news.json (campo "tgState") così non esce mai due volte;
   • "Lavoro AI, la classifica della settimana": ogni lunedì mattina, con
     una grafica quadrata 1200×1200 pronta anche per LinkedIn. La grafica
     viene rigenerata a ogni giro in social/lavori-ai.png (con il testo
     pronto da copiare in social/lavori-ai.html);
   • ore di silenzio: dalle QUIET_FROM alle QUIET_TO (ora italiana) il
     canale tace. Le notizie della notte non si perdono: escono dal
     mattino, poche per volta, e le più importanti finiscono nel Punto
     delle 8.

   Serve (GitHub → Settings → Secrets → Actions):
     TELEGRAM_BOT_TOKEN   token di @BotFather
     TELEGRAM_CHAT_ID     @faindnews
   Senza questi valori lo script non fa nulla.
   Prova senza pubblicare: TG_DRY=1 node scripts/telegram.mjs
   Prova del Punto delle 8 a qualsiasi ora: TG_DRY=1 TG_DIGEST=1 node scripts/telegram.mjs
   Prova della classifica lavori:            TG_DRY=1 TG_JOBS=1 node scripts/telegram.mjs
   ===================================================================== */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { shot } from './cards.mjs';
import { ARTICLES } from './articles.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://faind.org/';
const MAX_PER_RUN = 4;
const FRESH_HOURS = 6;
const VIDEO_HOURS = 12;
// Lingue pubblicate sul canale (notizie e video). Le altre restano solo sul sito.
const TG_LANGS = ['it', 'en'];
// "Il punto delle 8"
const DIGEST_COUNT = 5;          // quante notizie
const DIGEST_FROM = 8;           // dalle 8:00 ora italiana…
const DIGEST_UNTIL = 11;         // …ed entro le 11:00 (se GitHub salta un giro si recupera, ma non oltre)
const DIGEST_MIN = 3;            // sotto questo numero di notizie il post non esce
const DIGEST_LOGO = 'assets/og-image.png';
// Classifica settimanale "Lavoro AI"
const JOBS_WEEKDAY = 'Mon';      // lunedì
const JOBS_FROM = 10;            // dalle 10:00 ora italiana…
const JOBS_UNTIL = 14;           // …ed entro le 14:00
const JOBS_ROLES = 8;            // ruoli mostrati nella grafica
const JOBS_MIN = 10;             // sotto questo numero di offerte il post non esce
// Ore di silenzio (ora italiana): niente post dalle 23:00 alle 7:00
const QUIET_FROM = 23;
const QUIET_TO = 7;
const langOk = (n) => TG_LANGS.includes(n.lang || 'it');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const DRY = process.env.TG_DRY === '1';

const HASHTAG = {
  chatbot: '#Chatbot', immagini: '#ImmaginiAI', video: '#VideoAI', musica: '#MusicaAI',
  codice: '#Programmazione', produttivita: '#Produttività', ricerca: '#RicercaAI',
  hardware: '#ChipAI', regole: '#LeggiAI'
};
const TYPE_ICON = { news: '📰', tool: '🛠', prezzi: '💶', download: '⬇️', guide: '📘', convenzioni: '🏷' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isImportant = (n) => n.priority === 'alta' || (n.coverage || 1) >= 3;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function caption(n) {
  const head = isImportant(n) ? '🔴 <b>IMPORTANTE</b>\n' : '';
  const icon = TYPE_ICON[n.tag] || '⚡';
  let summary = n.summary || '';
  if (summary.length > 260) summary = summary.slice(0, summary.lastIndexOf(' ', 260)) + '…';
  const also = n.also && n.also.length ? ` <i>+${n.also.length} ${n.also.length === 1 ? 'fonte' : 'fonti'}</i>` : '';
  const tags = ['#IntelligenzaArtificiale', HASHTAG[n.category]].filter(Boolean).join(' ');
  return [
    `${head}${icon} <b>${esc(n.title)}</b>`,
    summary ? `\n${esc(summary)}` : '',
    `\n📌 Fonte: <a href="${esc(n.link.url)}">${esc(n.source.name)}</a>${also}`,
    `\n${tags}`
  ].join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 1024);
}

function buttons(n) {
  if (n.kind === 'video') return { inline_keyboard: [[
    { text: '▶️ Guarda il video', url: n.link.url },
    { text: 'Altri video su FAIND', url: SITE + '#video' }
  ]] };
  return { inline_keyboard: [[
    { text: 'Leggi su FAIND', url: n.page ? SITE + n.page : SITE },
    { text: 'Fonte originale', url: n.link.url }
  ]] };
}
export function videoCaption(n) {
  const tags = ['#IntelligenzaArtificiale', '#VideoAI', HASHTAG[n.category]].filter(Boolean).join(' ');
  return [`🎬 <b>${esc(n.title)}</b>`, `\n📺 ${esc(n.source.name)}`, `\n${tags}`].join('\n').slice(0, 1024);
}

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`${method}: ${json.description || res.status}`);
  return json;
}

async function publish(n) {
  const text = n.kind === 'video' ? videoCaption(n) : caption(n);
  const reply_markup = buttons(n);
  if (DRY) { console.log('--- DRY ---\n' + text + '\n[img] ' + (n.image || '—')); return; }
  if (n.image) {
    try { await api('sendPhoto', { chat_id: CHAT, photo: n.image, caption: text, parse_mode: 'HTML', reply_markup }); return; }
    catch (e) { console.warn('  foto non accettata, invio solo testo:', e.message); }
  }
  await api('sendMessage', { chat_id: CHAT, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
}

/* ---------- Il punto delle 8 ---------- */
// Data e ora in Italia (gestisce da solo ora legale e solare)
export function romeNow(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(d).map(x => [x.type, x.value]));
  const label = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short' }).format(d);
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), label, weekday, now: d.getTime() };
}

/* ---------- Ore di silenzio ---------- */
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', hourCycle: 'h23' });
const romeHour = (ms) => Number(hourFmt.format(ms));
export const isQuiet = (h) => QUIET_FROM === QUIET_TO ? false : QUIET_FROM > QUIET_TO ? (h >= QUIET_FROM || h < QUIET_TO) : (h >= QUIET_FROM && h < QUIET_TO);
const QUIET_LEN = QUIET_FROM === QUIET_TO ? 0 : (QUIET_TO - QUIET_FROM + 24) % 24;
// "Età" di una notizia senza contare le ore di silenzio: di notte l'orologio si ferma,
// così una notizia uscita alle 2 al mattino è ancora fresca e può essere pubblicata.
export function awakeAge(date, now) {
  const from = new Date(date).getTime();
  const age = now - from;
  if (!(age > 0)) return 0;
  if (!QUIET_LEN || age > 48 * 36e5) return age;
  const STEP = 15 * 60e3;
  let silent = 0;
  for (let t = from; t < now; t += STEP) if (isQuiet(romeHour(t))) silent += Math.min(STEP, now - t);
  return age - silent;
}

// Prima le notizie in italiano, in ordine di importanza; l'inglese riempie solo i posti rimasti
const italianFirst = (list, count) => [...list.filter(n => (n.lang || 'it') === 'it'), ...list.filter(n => (n.lang || 'it') !== 'it')].slice(0, count);

export function pickDigest(items, now = Date.now()) {
  const rank = (a, b) => (isImportant(b) - isImportant(a)) || (b.coverage || 1) - (a.coverage || 1) || b.date.localeCompare(a.date);
  const within = (h) => items.filter(n => langOk(n) && n.title && n.link && n.link.url && now - new Date(n.date).getTime() < h * 36e5).sort(rank);
  let list = italianFirst(within(24), DIGEST_COUNT);
  if (list.length < DIGEST_COUNT) list = italianFirst(within(48), DIGEST_COUNT);   // giornata povera: allargo a 48 ore
  return list;
}

const NUM = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const cut = (s, max) => s.length > max ? s.slice(0, Math.max(s.lastIndexOf(' ', max), max - 15)).replace(/[\s,;:.–-]+$/, '') + '…' : s;
const visible = (html) => html.replace(/<[^>]+>/g, '').replace(/&(amp|lt|gt);/g, '&');

export function digestCaption(list, label) {
  const build = (max) => [
    `☀️ <b>IL PUNTO DELLE 8</b>`,
    `<i>${esc(label)} · le ${list.length} notizie AI da sapere oggi</i>`,
    '',
    ...list.map((n, i) => {
      const url = n.page ? SITE + n.page : n.link.url;
      const more = n.also && n.also.length ? ` · +${n.also.length} ${n.also.length === 1 ? 'fonte' : 'fonti'}` : '';
      return `${NUM[i] || '•'} <a href="${esc(url)}">${esc(cut(n.title, max))}</a>\n     <i>${esc(n.source.name)}${more}</i>\n`;
    }),
    '#IlPuntoDelle8 #IntelligenzaArtificiale'
  ].join('\n');
  // La didascalia di una foto su Telegram ha un limite di 1024 caratteri: accorcio i titoli finché ci sta
  for (const max of [130, 110, 90, 75, 60]) { const t = build(max); if (visible(t).length <= 1000) return t; }
  return build(50);
}

async function sendDigest(list, label) {
  const text = digestCaption(list, label);
  const reply_markup = { inline_keyboard: [[
    { text: 'Tutte le notizie su FAIND', url: SITE },
    { text: 'Lavoro AI', url: SITE + '#job' }
  ]] };
  if (DRY) { console.log('--- DRY · Il punto delle 8 ---\n' + text + `\n[${visible(text).length} caratteri]`); return; }
  try {
    // Il logo viene caricato dal file del repository (non dipende dal sito online)
    await sendPhotoFile(path.join(ROOT, DIGEST_LOGO), text, reply_markup);
  } catch (e) {
    console.warn('  logo non inviato, invio solo testo:', e.message);
    await api('sendMessage', { chat_id: CHAT, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
  }
}

async function maybeDigest(data, t) {
  const forced = process.env.TG_DIGEST === '1';
  if (!forced) {
    if (data.tgState.digestDay === t.day) return;                         // già uscito oggi
    if (t.hour < DIGEST_FROM || t.hour >= DIGEST_UNTIL) return;           // fuori orario
  }
  const list = pickDigest(data.items, t.now);
  if (list.length < DIGEST_MIN) { console.log(`→ Punto delle 8: solo ${list.length} notizie, salto.`); return; }
  try {
    await sendDigest(list, t.label);
    if (!DRY) data.tgState.digestDay = t.day;
    console.log(`✓ Telegram: Il punto delle 8 (${list.length} notizie)`);
    await sleep(1500);
  } catch (e) { console.warn('✗ Punto delle 8 —', e.message); }
}

/* ---------- Lavoro AI: classifica della settimana ---------- */
const ROLE_NAMES = { ml: 'Machine Learning Engineer', ai: 'AI Engineer', ds: 'Data Scientist', de: 'Data Engineer', da: 'Data Analyst',
  research: 'AI Research Scientist', cv: 'Computer Vision Engineer', nlp: 'NLP Engineer', pm: 'AI Product Manager',
  arch: 'AI / Data Architect', prompt: 'Prompt Engineer', consult: 'Consulente AI' };

export function jobRanking(jobs, prev) {
  const count = {};
  for (const j of jobs || []) if (j.role) count[j.role] = (count[j.role] || 0) + 1;
  const prevRank = prev ? Object.keys(prev).sort((a, b) => prev[b] - prev[a]) : null;
  const rows = Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b)).map((role, i) => {
    let trend = '';
    if (prevRank) { const was = prevRank.indexOf(role); trend = was < 0 ? 'new' : was > i ? 'up' : was < i ? 'down' : 'same'; }
    return { role, name: ROLE_NAMES[role] || role, n: count[role], trend };
  });
  return { rows, total: (jobs || []).filter(j => j.role).length, count };
}
const offers = (n) => n === 1 ? '1 offerta' : `${n} offerte`;
const TREND_TXT = { up: ' 🔼', down: ' 🔽', new: ' 🆕', same: '' };

export function jobsCaption(rank) {
  return [
    '💼 <b>LAVORO AI · LA CLASSIFICA DELLA SETTIMANA</b>',
    '<i>I ruoli più richiesti negli annunci degli ultimi 30 giorni</i>',
    '',
    ...rank.rows.slice(0, JOBS_ROLES).map((r, i) => `${NUM[i] || '•'} <b>${esc(r.name)}</b> · ${offers(r.n)}${TREND_TXT[r.trend] || ''}`),
    '',
    `Su ${rank.total} offerte analizzate. Gli annunci per candidarsi sono su FAIND.`,
    '',
    '#LavoroAI #IntelligenzaArtificiale'
  ].join('\n');
}
export function linkedinText(rank, label) {
  return [
    `Quali sono i lavori più richiesti nell'intelligenza artificiale? La classifica FAIND di questa settimana (${label}):`,
    '',
    ...rank.rows.slice(0, 5).map((r, i) => `${i + 1}. ${r.name}: ${offers(r.n)}`),
    '',
    `La classifica nasce da ${rank.total} annunci pubblici degli ultimi 30 giorni e si aggiorna ogni 6 ore.`,
    `Tutte le offerte, con il link per candidarsi: ${SITE}#job`,
    '',
    '#IntelligenzaArtificiale #LavoroAI #AIJobs #MachineLearning #DataScience'
  ].join('\n');
}

function jobsCardHtml(rank, label) {
  const rows = rank.rows.slice(0, JOBS_ROLES);
  const max = rows[0] ? rows[0].n : 1;
  const TREND = { up: '<span class="t up">▲</span>', down: '<span class="t down">▼</span>', new: '<span class="t new">NEW</span>', same: '' };
  return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<link rel="stylesheet" href="../assets/fonts/archivo.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
/* Tutto è ancorato in alto ed entro 1100px: alcune versioni di Chrome catturano un'area un po' più bassa della finestra */
html{background:#0E1222}
html,body{width:1200px;height:1200px;overflow:hidden}
body{background:#0E1222;color:#fff;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;padding:76px 72px 0}
.top{display:flex;align-items:center;justify-content:space-between}
.top img{height:92px;border-radius:10px}
.week{font-size:25px;font-weight:600;color:#8FD0F0;text-align:right;line-height:1.3}
h1{font-size:76px;line-height:1;font-weight:800;font-stretch:76%;letter-spacing:-.01em;margin:40px 0 10px;text-transform:uppercase}
h1 b{color:#8FD0F0;font-weight:800}
.sub{font-size:27px;color:#b9c6dc;margin-bottom:26px}
ol{list-style:none}
li{display:grid;grid-template-columns:62px 1fr auto;align-items:center;column-gap:18px;height:${rows.length > 6 ? 82 : 100}px}
.rk{font-size:44px;font-weight:800;font-stretch:76%;color:#4293B9;text-align:right}
li:first-child .rk{color:#8FD0F0}
.nm{font-size:34px;font-weight:700;font-stretch:88%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar{grid-column:2/4;height:12px;border-radius:6px;background:rgba(143,208,240,.14);margin-top:-22px}
.bar i{display:block;height:100%;border-radius:6px;background:#4293B9}
li:first-child .bar i{background:#8FD0F0}
.ct{font-size:28px;font-weight:600;color:#8FD0F0;white-space:nowrap}
.t{font-size:20px;margin-left:10px;font-weight:800}.up{color:#7BE0A6}.down{color:#F29B9B}.new{color:#0E1222;background:#8FD0F0;border-radius:6px;padding:2px 8px;font-size:16px;vertical-align:middle}
footer{margin-top:22px;padding-top:22px;border-top:3px solid #4293B9;display:flex;align-items:center;justify-content:space-between;font-size:24px;font-weight:600;color:#b9c6dc}
footer span:last-child{font-weight:800;color:#8FD0F0}
</style></head><body>
<div class="top"><img src="../assets/logo.webp" alt=""><div class="week">Classifica settimanale<br>${esc(label)}</div></div>
<h1>I lavori <b>AI</b> più richiesti</h1>
<p class="sub">${rank.total} offerte analizzate · annunci degli ultimi 30 giorni</p>
<ol>${rows.map((r, i) => `<li><span class="rk">${i + 1}</span><span class="nm">${esc(r.name)}</span><span class="ct">${offers(r.n)}${TREND[r.trend] || ''}</span><span class="bar"><i style="width:${Math.max(4, Math.round(r.n / max * 100))}%"></i></span></li>`).join('')}</ol>
<footer><span>Fonti: Jobicy · Arbeitnow · Remotive</span><span>Telegram @faindnews</span></footer>
</body></html>`;
}

// Rigenera a ogni giro grafica e testo pronti per i social (cartella social/ del sito)
async function buildJobsCard(data, t) {
  const rank = jobRanking(data.jobs, data.tgState.jobsPrev);
  if (rank.total < JOBS_MIN || rank.rows.length < 3) return { rank, png: null };
  const dir = path.join(ROOT, 'social');
  const label = `settimana del ${t.mondayLabel}`;
  let png = path.join(dir, 'lavori-ai.png');
  try {
    await mkdir(dir, { recursive: true });
    const tmp = path.join(dir, '_card.html');
    await writeFile(tmp, jobsCardHtml(rank, label));
    await shot(tmp, png, 1200, 1200);
    await rm(tmp, { force: true });
    await readFile(png);
  } catch (e) { console.warn('  grafica lavori non generata:', e.message); png = null; }
  try {
    const txt = linkedinText(rank, label);
    await writeFile(path.join(dir, 'lavori-ai.html'), `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Kit social · Lavoro AI | FAIND</title>
<style>body{font-family:system-ui,sans-serif;background:#0E1222;color:#fff;max-width:640px;margin:0 auto;padding:24px 16px 60px}h1{font-size:22px;margin-bottom:6px}p{color:#b9c6dc;font-size:15px;line-height:1.5;margin:8px 0 16px}img{width:100%;border-radius:12px;display:block}textarea{box-sizing:border-box;width:100%;height:300px;border-radius:12px;border:0;padding:14px;font:15px/1.5 system-ui,sans-serif;margin-top:8px}button{margin-top:12px;width:100%;padding:14px;border:0;border-radius:12px;background:#4293B9;color:#fff;font-size:17px;font-weight:700}</style></head><body>
<h1>Kit social · Lavoro AI</h1><p>1) Tieni premuta l'immagine e salvala. 2) Tocca "Copia il testo". 3) Incolla tutto in un nuovo post LinkedIn.</p>
${png ? '<img src="lavori-ai.png" alt="Classifica dei lavori AI più richiesti">' : ''}
<textarea id="t" readonly>${esc(txt)}</textarea><button id="b" type="button">Copia il testo</button>
<script>document.getElementById('b').onclick=function(){var t=document.getElementById('t');t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}this.textContent='Copiato ✓'};</script>
</body></html>`);
  } catch (e) { console.warn('  kit social non scritto:', e.message); }
  return { rank, png };
}

/* ---------- Card del venerdì per LinkedIn ("La settimana dell'AI") ----------
   Una grafica 1200×1500 (4:5, il formato che nel feed occupa più spazio) disegnata
   da noi: niente foto delle testate, che appartengono a loro. In grande quante
   testate hanno ripreso la notizia della settimana e il suo titolo, sotto le tre
   notizie seguenti. Viene rigenerata a ogni giro in social/settimana-ai.png.
   Buffer scarica l'immagine quando il post esce, cioè dopo la pubblicazione del
   sito: per questo il post del venerdì usa l'elenco della card già online (giro
   precedente, salvato in tgState.weekCard) e, una volta uscito, la card resta
   ferma su quell'elenco fino a sera, così testo e immagine coincidono sempre. */
const WEEK_CARD = 'social/settimana-ai.png';
const WEEK_W = 1200, WEEK_H = 1500;
const WEEK_FONT = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..900&display=block';
const dayMonth = (ms, year) => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', ...(year ? { year: 'numeric' } : {}) }).format(ms);
// "3–9 ottobre 2026" oppure "28 settembre – 4 ottobre 2026"
export function weekRange(now) {
  const from = now - 6 * 864e5;
  const m = (ms) => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', month: 'long' }).format(ms);
  const d = (ms) => new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric' }).format(ms);
  return m(from) === m(now) ? `${d(from)}–${dayMonth(now, true)}` : `${dayMonth(from)} – ${dayMonth(now, true)}`;
}

export function weekCardHtml(list, now) {
  const [top, ...rest] = list;
  const title = cut(String(top.title), 150);
  const size = title.length > 115 ? 58 : title.length > 85 ? 66 : title.length > 55 ? 76 : 88;
  const many = (top.coverage || 1) >= 2;
  return `<!doctype html><html lang="it"><head><meta charset="utf-8">
<link rel="stylesheet" href="${WEEK_FONT}">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{background:#0B0F1D}
html,body{width:${WEEK_W}px;height:${WEEK_H}px;overflow:hidden}
body{position:relative;display:flex;flex-direction:column;color:#fff;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;padding:72px 76px 112px;
  background:radial-gradient(900px 700px at 105% -8%,rgba(66,147,185,.55),transparent 62%),radial-gradient(700px 600px at -15% 108%,rgba(143,208,240,.16),transparent 60%),#0B0F1D}
body:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1.4px,transparent 1.6px);background-size:28px 28px;
  -webkit-mask-image:linear-gradient(180deg,#000 0,transparent 55%);pointer-events:none}
.top{position:relative;display:flex;align-items:center;justify-content:space-between}
.top img{height:70px;border-radius:9px}
.when{text-align:right;line-height:1.25}
.when b{display:block;font-size:24px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#8FD0F0}
.when span{font-size:26px;font-weight:600;color:#c9d6ea}
main{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0 56px}
.hero{display:flex;align-items:flex-end;gap:30px}
.big{font-size:${many ? 330 : 250}px;line-height:.74;font-weight:900;font-stretch:62%;letter-spacing:-.03em;
  background:linear-gradient(180deg,#BFE6FA 0%,#8FD0F0 55%,#4293B9 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.say{font-size:40px;line-height:1.12;font-weight:700;font-stretch:85%;color:#e6eef9;padding-bottom:4px}
.say em{font-style:normal;color:#8FD0F0}
h1{position:relative;margin-top:54px;padding-left:34px;border-left:10px solid #8FD0F0;font-size:${size}px;line-height:1.04;font-weight:800;font-stretch:78%;letter-spacing:-.012em;
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:5;overflow:hidden}
.src{margin:22px 0 0 44px;font-size:25px;font-weight:600;color:#9fb2cc}
.more{position:relative;margin-top:62px}
.more p{font-size:23px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#8FD0F0;margin-bottom:8px}
.more li{list-style:none;display:grid;grid-template-columns:76px 1fr;align-items:baseline;padding:20px 0;border-top:1px solid rgba(191,230,250,.18)}
.more i{font-style:normal;font-size:38px;font-weight:900;font-stretch:62%;color:#4293B9}
.more span{font-size:31px;line-height:1.18;font-weight:650;font-stretch:90%;color:#fff;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.more small{font-size:23px;font-weight:600;color:#9fb2cc;white-space:nowrap}
footer{position:absolute;left:0;right:0;top:${WEEK_H - 112}px;height:112px;background:#4293B9;display:flex;align-items:center;justify-content:space-between;padding:0 76px;font-size:29px;font-weight:700}
footer b{font-weight:900;color:#0B0F1D;font-size:34px;letter-spacing:.01em}
</style></head><body>
<div class="top"><img src="../assets/logo.webp" alt=""><div class="when"><b>La settimana dell'AI</b><span>${esc(weekRange(now))}</span></div></div>
<main><div class="hero"><div class="big">${many ? top.coverage : 'Nº1'}</div><div class="say">${many ? 'testate hanno raccontato<br><em>la notizia della settimana</em>' : 'la notizia AI<br><em>da non perdere questa settimana</em>'}</div></div>
<h1>${esc(title)}</h1>
<p class="src">Prima fonte: ${esc(top.source.name)}</p>
${rest.length ? `<div class="more"><p>E poi</p><ol>${rest.slice(0, 3).map((n, i) => `<li><i>0${i + 2}</i><span>${esc(cut(String(n.title), 110))}${(n.coverage || 1) >= 2 ? ` <small>· ${n.coverage} testate</small>` : ''}</span></li>`).join('')}</ol></div>` : ''}
</main>
<footer><span>Ogni notizia con la sua fonte, ogni ora</span><b>faind.org</b></footer>
</body></html>`;
}

// Elenco della card: quello già usato dal post di oggi (card ferma) oppure le notizie della settimana
function weekCardList(data, t) {
  const st = data.tgState, wc = st.weekCard;
  if (wc && st.liWeek === t.day && wc.day === t.day) {
    const byId = new Map(data.items.map(n => [n.id, n]));
    const list = wc.ids.map(id => byId.get(id)).filter(Boolean);
    if (list.length === wc.ids.length) return list;
  }
  return pickWeek(data.items, t.now);
}

async function buildWeekCard(data, t) {
  const list = weekCardList(data, t);
  if (list.length < DIGEST_MIN) return;
  const dir = path.join(ROOT, 'social'), tmp = path.join(dir, '_settimana.html');
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(tmp, weekCardHtml(list, t.now));
    await shot(tmp, path.join(ROOT, WEEK_CARD), WEEK_W, WEEK_H);
    data.tgState.weekCard = { day: t.day, ids: list.map(n => n.id), made: new Date(t.now).toISOString() };
  } catch (e) { console.warn('  card della settimana non generata:', e.message); }
  finally { await rm(tmp, { force: true }); }
}

/* ---------- Card disegnate su Canva (venerdì, lunedì e sabato) ----------
   Una routine settimanale di Claude compila il modello Canva di Paolo (mantra + 3 titoli),
   ne esporta il PNG e scrive su main social/canva-<tipo>.json con { day, url, ids|ruoli, mantra }.
   Il link di Canva scade dopo poche ore: il primo giro lo scarica in social/canva-<tipo>.png,
   che va online con il sito; i giri seguenti dello stesso giorno, se il link è scaduto,
   riprendono la copia già online. Se manca qualcosa il post usa la grafica di sempre.
   Ogni giro stampa nel log una riga CANVA_DATI con i dati che servono alla routine. */
const CANVA = { settimana: 'social/canva-settimana', lavori: 'social/canva-lavori', mano: 'social/canva-mano' };
const canvaCache = {};

async function fetchPng(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error('risposta ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('non è un PNG');
  return buf;
}

// { ...json, img } se la card Canva di oggi è pronta, altrimenti null
export async function canvaCard(kind, t) {
  if (kind in canvaCache) return canvaCache[kind];
  let card = null;
  try {
    const info = JSON.parse(await readFile(path.join(ROOT, CANVA[kind] + '.json'), 'utf8'));
    if (info.day === t.day) {
      let buf = null;
      for (const url of [info.url, `${SITE}${CANVA[kind]}.png?d=${t.day}`].filter(Boolean)) {
        try { buf = await fetchPng(url); break; } catch (e) { console.warn(`  card Canva (${kind}) non scaricata da ${url.split('?')[0]}:`, e.message); }
      }
      if (buf) {
        await mkdir(path.join(ROOT, 'social'), { recursive: true });
        await writeFile(path.join(ROOT, CANVA[kind] + '.png'), buf);
        card = { ...info, img: SITE + CANVA[kind] + '.png' };
        console.log(`✓ card Canva (${kind}) pronta per oggi`);
      }
    }
  } catch (e) { if (e.code !== 'ENOENT') console.warn(`  card Canva (${kind}):`, e.message); }
  return (canvaCache[kind] = card);
}

// Elenco del venerdì: quello scelto per la card Canva di oggi, se tutte le notizie ci sono ancora
function canvaWeekList(data, cc) {
  if (!cc || !Array.isArray(cc.ids)) return null;
  const byId = new Map(data.items.map(n => [n.id, n]));
  const list = cc.ids.map(id => byId.get(id)).filter(Boolean);
  return list.length >= DIGEST_MIN && list.length === cc.ids.length ? list : null;
}
// Il lunedì la card Canva vale solo se i primi 3 ruoli sono ancora quelli della classifica
const canvaJobsOk = (cc, rank) => !!(cc && Array.isArray(cc.ruoli) && rank &&
  cc.ruoli.length === 3 && cc.ruoli.every((r, i) => rank.rows[i] && rank.rows[i].name === r));

// Lunedì: la classifica usata per LinkedIn e per la card Canva si fissa al primo giro utile del giorno,
// così la card compilata dalla routine e il testo del post riportano sempre gli stessi ruoli
// (la classifica sul sito si aggiorna ogni 6 ore e potrebbe cambiare nel frattempo)
export function jobsSnapshot(st, t, rank) {
  if (t.weekday !== JOBS_WEEKDAY) return rank;
  if (st.liRankSnap && st.liRankSnap.day === t.day) return st.liRankSnap;
  if (!rank || rank.total < JOBS_MIN || rank.rows.length < 3) return rank;
  st.liRankSnap = { day: t.day, total: rank.total, rows: rank.rows.slice(0, 5) };
  return st.liRankSnap;
}

// Dati per la routine Canva (letti dal log di GitHub Actions)
function canvaLog(data, t, rank) {
  try {
    const week = pickWeek(data.items, t.now);
    const cut2 = (s) => cut(String(s), 110);
    console.log('CANVA_DATI ' + JSON.stringify({
      day: t.day, weekday: t.weekday, made: new Date(t.now).toISOString(),
      settimana: { ids: week.map(n => n.id), titoli: week.slice(0, 3).map(n => cut2(n.title)) },
      lavori: rank && rank.rows.length >= 3 ? { ruoli: rank.rows.slice(0, 3).map(r => r.name), totale: rank.total } : null
    }));
  } catch (e) { console.warn('  CANVA_DATI non scritti:', e.message); }
}

async function sendPhotoFile(file, text, reply_markup) {
  const form = new FormData();
  form.append('chat_id', CHAT);
  form.append('caption', text);
  form.append('parse_mode', 'HTML');
  form.append('reply_markup', JSON.stringify(reply_markup));
  form.append('photo', new Blob([await readFile(file)], { type: 'image/png' }), 'faind.png');
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(json.description || res.status);
}

async function maybeJobs(data, t, card) {
  const forced = process.env.TG_JOBS === '1';
  if (!forced) {
    if (t.weekday !== JOBS_WEEKDAY) return;
    if (data.tgState.jobsDay === t.day) return;                           // già uscita questa settimana
    if (t.hour < JOBS_FROM || t.hour >= JOBS_UNTIL) return;               // fuori orario
  }
  const { rank, png } = card;
  if (rank.total < JOBS_MIN || rank.rows.length < 3) { console.log(`→ Classifica lavori: solo ${rank.total} offerte, salto.`); return; }
  const text = jobsCaption(rank);
  const reply_markup = { inline_keyboard: [[{ text: 'Vedi le offerte su FAIND', url: SITE + '#job' }]] };
  try {
    if (DRY) console.log('--- DRY · Classifica lavori ---\n' + text + `\n[${visible(text).length} caratteri] [img] ${png || '—'}`);
    else {
      let done = false;
      if (png) { try { await sendPhotoFile(png, text, reply_markup); done = true; } catch (e) { console.warn('  grafica non inviata, invio solo testo:', e.message); } }
      if (!done) await api('sendMessage', { chat_id: CHAT, text, parse_mode: 'HTML', reply_markup, link_preview_options: { is_disabled: true } });
      data.tgState.jobsDay = t.day;
      data.tgState.jobsPrev = rank.count;      // serve la settimana dopo per le frecce su/giù
    }
    console.log('✓ Telegram: classifica lavori AI');
    await sleep(1500);
  } catch (e) { console.warn('✗ Classifica lavori —', e.message); }
}

/* ---------- Feed per LinkedIn (feeds/linkedin.xml) ----------
   Tre post a settimana, già scritti come post social: un servizio esterno (es. dlvr.it)
   legge questo feed e li pubblica da solo sulla pagina LinkedIn di FAIND.
   • lunedì dalle 10: la classifica dei lavori AI, con la card Canva appena è pronta (al più tardi alle
     LI_CANVA_WAIT_UNTIL, con la grafica di riserva);
   • mercoledì dalle LI_WED_FROM: un approfondimento, a rotazione;
   • venerdì dalle LI_FRIDAY_FROM: "La settimana dell'AI", le 5 notizie più riprese + un approfondimento,
     anche questo con la card Canva appena è pronta (al più tardi alle LI_CANVA_WAIT_UNTIL);
   • sabato tra LI_SAT_FROM e LI_SAT_UNTIL: "Scritto a mano", solo con la card Canva;
   • domenica dalle LI_SUN_FROM: lo short di Faindo più recente della settimana (link a YouTube,
     immagine = anteprima dello short); senza short usciti negli ultimi 7 giorni non esce nulla.
   Ogni post: apertura che cambia, testo fisso su FAIND (a rotazione tra LI_INTRO), riepilogo, link, hashtag.
   Le voci già uscite sono conservate in news.json → tgState.linkedin. */
const LI_FRIDAY_FROM = 9, LI_WED_FROM = 12, LI_KEEP = 20;
const LI_SUN_FROM = 11;   // domenica: lo short della settimana (deciso da Paolo il 10 ottobre 2026)
const LI_SAT_FROM = 9, LI_SAT_UNTIL = 17;   // sabato: card "Scritto a mano" (esce solo se la routine Canva l'ha preparata)
// Lunedì e venerdì il post aspetta la card Canva fino a quest'ora: la routine fa 3 tentativi (8:40, 10:40, 12:40);
// poi esce con la grafica di riserva (e linkedin.mjs manda una segnalazione per mail)
export const LI_CANVA_WAIT_UNTIL = 15;
// Il testo fisso che spiega FAIND: cinque versioni, usate a rotazione
const LI_INTRO = [
  'FAIND raccoglie ogni ora le notizie sull\'intelligenza artificiale da testate italiane e internazionali, sempre con la fonte. Gratis, senza pubblicità e senza registrazione.',
  'Seguire l\'intelligenza artificiale richiede tempo. FAIND lo fa per te: notizie AI aggiornate ogni ora, video, i lavori più richiesti e il confronto tra ChatGPT, Claude e Gemini, in un solo posto.',
  'Cosa è successo questa settimana nell\'intelligenza artificiale? FAIND mette in fila le notizie più importanti e dice sempre da dove arrivano, così puoi verificare.',
  'ChatGPT, Claude, Gemini, robot, leggi, lavoro: su FAIND trovi le novità dell\'AI spiegate in poche righe, con il link all\'articolo originale.',
  'FAIND è un\'agenzia di notizie flash sull\'intelligenza artificiale: titolo, poche righe, fonte. Per chi vuole restare aggiornato sull\'AI senza perdere ore.'
];
// Hashtag: tre fissi + due scelti in base a ciò di cui parla il post (azienda o prodotto, e tema)
const LI_TAGS = ['#IntelligenzaArtificiale', '#NotizieAI', '#AI'];
const LI_WHO = [[/chatgpt/i, '#ChatGPT'], [/openai/i, '#OpenAI'], [/claude|anthropic/i, '#Anthropic'], [/gemini/i, '#Gemini'], [/google|deepmind/i, '#Google'], [/copilot|microsoft/i, '#Microsoft'],
  [/\bmeta\b|llama/i, '#MetaAI'], [/nvidia/i, '#Nvidia'], [/apple|siri/i, '#Apple'], [/grok|\bxai\b/i, '#Grok'], [/mistral/i, '#MistralAI'], [/deepseek/i, '#DeepSeek'], [/perplexity/i, '#Perplexity'], [/amazon|alexa/i, '#Amazon']];
const LI_WHAT = [[/ai act|regolament|\blegg[ei]\b|\blaw\b|regulat|garante|copyright/i, '#AIAct'], [/lavor|\bjobs?\b|licenzi|layoff|assunzion|hiring/i, '#LavoroAI'], [/robot|umanoid|humanoid/i, '#Robotica'],
  [/agent/i, '#AgentiAI'], [/chip|gpu|data ?cent/i, '#DataCenter'], [/medic|salute|health|farmac/i, '#AIinMedicina'], [/video|immagin|image/i, '#AIgenerativa'], [/sicurezz|safety|security|deepfake/i, '#SicurezzaAI']];
const xml = (v = '') => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function liTags(texts, fallback = '#AIgenerativa') {
  const top = (rules) => { let best = null, n = 0; for (const [re, tag] of rules) { const c = texts.filter(x => re.test(x)).length; if (c > n) { n = c; best = tag; } } return best; };
  return [...LI_TAGS, top(LI_WHO), top(LI_WHAT) || fallback].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(' ');
}
// Le notizie più riprese degli ultimi 7 giorni
export function pickWeek(items, now, count = 5) {
  const week = items.filter(n => langOk(n) && n.title && n.link && n.link.url && now - new Date(n.date).getTime() < 7 * 864e5)
    .sort((a, b) => (b.coverage || 1) - (a.coverage || 1) || (isImportant(b) - isImportant(a)) || b.date.localeCompare(a.date));
  return italianFirst(week, count);
}

// Lo short di Faindo uscito più di recente negli ultimi 7 giorni, con il suo link YouTube
export function weekShort(st, queue, now) {
  let best = null;
  for (const [id, v] of Object.entries(st.yt || {})) {
    if (!v || v.esito !== 'sent' || !v.at || now - new Date(v.at).getTime() > 7 * 864e5) continue;
    const vid = (String(v.link || '').match(/(?:shorts\/|[?&]v=|youtu\.be\/)([\w-]{6,})/) || [])[1];
    const s = (queue || []).find(x => x && x.id === id);
    if (vid && s && (!best || v.at > best.at)) best = { ...s, at: v.at, vid, link: v.link };
  }
  return best;
}

export function linkedinItems(data, t, rank, canva = {}, shorts = []) {
  const st = data.tgState, out = [];
  const intro = () => { const i = (st.liIntro || 0) % LI_INTRO.length; st.liIntro = (st.liIntro || 0) + 1; return LI_INTRO[i]; };
  // Lunedì: classifica dei lavori AI
  if (t.weekday === JOBS_WEEKDAY && t.hour >= JOBS_FROM && st.liJobs !== t.day && rank && rank.total >= JOBS_MIN && rank.rows.length >= 3
    && (canva.lavori || t.hour >= LI_CANVA_WAIT_UNTIL)) {
    const tags = `${LI_TAGS.join(' ')} #LavoroAI #AIJobs`, top = rank.rows.slice(0, 5);
    const img = canvaJobsOk(canva.lavori, rank) ? canva.lavori.img : SITE + 'social/lavori-ai.png';
    out.push({ id: 'lavori-' + t.day, link: `${SITE}?lavori=${t.day}#job`, date: new Date(t.now).toISOString(), img,
      title: `Lavoro e intelligenza artificiale: ${top[0].name} è il ruolo più richiesto questa settimana. La classifica completa su FAIND ${tags}`,
      text: [`Quali sono i lavori più richiesti nell'intelligenza artificiale? Questa settimana in testa c'è ${top[0].name}.`, '', intro(), '',
        `La classifica (settimana del ${t.mondayLabel}):`, ...top.map((r, i) => `${i + 1}. ${r.name}: ${offers(r.n)}`), '',
        `Nasce da ${rank.total} annunci pubblici degli ultimi 30 giorni e si aggiorna ogni 6 ore.`, `Tutte le offerte, con il link per candidarsi: ${SITE}#job`, '', tags].join('\n') });
    st.liJobs = t.day;
  }
  // Venerdì: la settimana dell'AI
  if (t.weekday === 'Fri' && t.hour >= LI_FRIDAY_FROM && st.liWeek !== t.day && (canva.settimana || t.hour >= LI_CANVA_WAIT_UNTIL)) {
    // Con la card già online (giro precedente) testo e immagine usano lo stesso elenco; altrimenti il logo
    const wc = st.weekCard, byId = new Map(data.items.map(n => [n.id, n]));
    const live = wc && t.now - new Date(wc.made).getTime() < 24 * 36e5 ? wc.ids.map(id => byId.get(id)).filter(Boolean) : [];
    const ready = live.length >= DIGEST_MIN && live.length === wc.ids.length;
    // La card Canva di oggi ha la precedenza: testo e immagine usano il suo elenco
    const cl = canvaWeekList(data, canva.settimana);
    const list = cl || (ready ? live : pickWeek(data.items, t.now));
    if (list.length >= DIGEST_MIN) {
      const tags = liTags(list.map(n => n.title));
      const a = ARTICLES[(st.liArt || 0) % ARTICLES.length]; st.liArt = (st.liArt || 0) + 1;
      out.push({ id: 'settimana-' + t.day, link: `${SITE}?settimana=${t.day}`, date: new Date(t.now).toISOString(), img: cl ? canva.settimana.img : SITE + (ready ? WEEK_CARD : DIGEST_LOGO),
        title: `La settimana dell'intelligenza artificiale: ${cut(list[0].title, 110).replace(/[.!?…]+$/, '')}. Le ${list.length} notizie AI da sapere, su FAIND ${tags}`,
        text: [`La settimana dell'intelligenza artificiale in ${list.length} notizie. La più ripresa: ${list[0].title}`, '', intro(), '',
          ...list.map((n, i) => `${i + 1}. ${n.title} (${n.source.name})`), '',
          `Tutte le notizie, con la fonte: ${SITE}`, `Da leggere con calma: ${a.title} ${SITE}approfondimenti/${a.slug}.html`, '', tags].join('\n') });
    }
    st.liWeek = t.day;
  }
  // Sabato: la card "Scritto a mano" disegnata su Canva (senza card non esce nulla). Testo di Paolo.
  const mano = canva.mano;
  if (t.weekday === 'Sat' && t.hour >= LI_SAT_FROM && t.hour < LI_SAT_UNTIL && st.liSat !== t.day && mano && mano.frase) {
    const utm = `utm_source=linkedin&utm_medium=social&utm_campaign=scritto-a-mano&utm_content=${t.day}`;
    const tags = '#FAIND #IntelligenzaArtificiale #Ricordi #AI #ScrittoAMano #Nostalgia #TecnologiaUmana';
    out.push({ id: 'mano-' + t.day, link: `${SITE}?${utm}`, date: new Date(t.now).toISOString(), img: mano.img,
      title: `${mano.frase} ${tags}`,
      text: ['Il sabato, su FAIND, il futuro può aspettare un momento.', '',
        'Ci teniamo certe piccole cose umane: una calligrafia storta, un ricordo di quando l\'AI era solo fantascienza, il tempo perso per fare qualcosa di bello.', '',
        'Racconta la tua, magari chi legge non l\'ha mai vissuta.', '',
        `Le notizie sull'intelligenza artificiale, ogni ora e con la fonte: ${SITE}?${utm}`,
        'Il canale Telegram: https://t.me/faindnews', '', tags].join('\n') });
    st.liSat = t.day;
  }
  // Domenica: lo short di Faindo più recente della settimana
  if (t.weekday === 'Sun' && t.hour >= LI_SUN_FROM && st.liSun !== t.day) {
    const sh = weekShort(st, shorts, t.now);
    if (sh) {
      const tags = '#FAIND #DalCassetto #Faindo #IntelligenzaArtificiale #AI #Scienza';
      const title = String(sh.titolo || '').replace(/#\S+/g, '').replace(/\s+/g, ' ').trim();
      const story = sh.telegram || String(sh.testo || '').split('\n')[0];
      out.push({ id: 'domenica-' + t.day, link: sh.link, date: new Date(t.now).toISOString(), img: `https://i.ytimg.com/vi/${sh.vid}/hqdefault.jpg`,
        title: `${title} ${tags}`,
        text: [`La storia della settimana dal cassetto di Faindo: ${title}`, '', story, '',
          'Ogni lunedì e giovedì Faindo apre un cassetto del suo archivio e racconta in meno di un minuto una storia vera di intelligenza artificiale e scienza.', '',
          `Guarda lo short: ${sh.link}`, `Tutte le storie: ${SITE}dal-cassetto-di-faindo/`, '', tags].join('\n') });
    } else console.log('→ LinkedIn: domenica senza short usciti negli ultimi 7 giorni, nessun post.');
    st.liSun = t.day;
  }
  // Mercoledì: un approfondimento, a rotazione (parte da metà elenco, così non coincide con quello citato il venerdì)
  if (t.weekday === 'Wed' && t.hour >= LI_WED_FROM && st.liWed !== t.day) {
    const a = ARTICLES[((st.liArtW || 0) + Math.floor(ARTICLES.length / 2)) % ARTICLES.length]; st.liArtW = (st.liArtW || 0) + 1;
    const tags = liTags([a.title, a.card, a.desc]);
    out.push({ id: 'approfondimento-' + t.day, link: `${SITE}approfondimenti/${a.slug}.html`, date: new Date(t.now).toISOString(), img: `${SITE}og/${a.slug}.png`,   // card con il marchio FAIND, generata dall'automazione (come per le notizie)
      title: `${a.title} ${tags}`,
      text: [a.title, '', a.card, '', intro(), '', 'In breve:', ...a.brief.map(b => `→ ${b}`), '', `Leggi l'approfondimento: ${SITE}approfondimenti/${a.slug}.html`, '', tags].join('\n') });
    st.liWed = t.day;
  }
  return out;
}

async function linkedinFeed(data, t, rank) {
  try {
    const st = data.tgState;
    // Le card Canva servono solo quando sta per uscire il post del giorno
    const canva = {};
    if (t.weekday === 'Fri' && st.liWeek !== t.day) canva.settimana = await canvaCard('settimana', t);
    if (t.weekday === JOBS_WEEKDAY && st.liJobs !== t.day) canva.lavori = await canvaCard('lavori', t);
    if (t.weekday === 'Sat' && st.liSat !== t.day) canva.mano = await canvaCard('mano', t);
    let shorts = [];
    if (t.weekday === 'Sun' && st.liSun !== t.day) try { shorts = JSON.parse(await readFile(path.join(ROOT, 'social/shorts.json'), 'utf8')).coda || []; } catch {}
    const fresh = linkedinItems(data, t, rank, canva, shorts);
    st.linkedin = [...fresh, ...(st.linkedin || [])].slice(0, LI_KEEP);
    const items = st.linkedin.map(i => `  <item>
    <title>${xml(i.title)}</title>
    <link>${xml(i.link)}</link>
    <guid isPermaLink="false">faind-linkedin-${xml(i.id)}</guid>
    <pubDate>${new Date(i.date).toUTCString()}</pubDate>
    <description>${xml(i.text)}</description>${i.img ? `\n    <enclosure url="${xml(i.img)}" type="image/png" length="0"/>` : ''}
  </item>`).join('\n');
    await mkdir(path.join(ROOT, 'feeds'), { recursive: true });
    await writeFile(path.join(ROOT, 'feeds', 'linkedin.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>FAIND – post per LinkedIn</title>
  <link>${SITE}</link>
  <description>Il punto delle 8, la classifica dei lavori AI e gli approfondimenti di FAIND, pronti per i social.</description>
  <language>it</language>
  <lastBuildDate>${new Date(t.now).toUTCString()}</lastBuildDate>
${items}
</channel></rss>
`);
    if (fresh.length) console.log(`✓ feed LinkedIn: ${fresh.length} nuov${fresh.length === 1 ? 'a voce' : 'e voci'} (${st.linkedin.length} in tutto)`);
  } catch (e) { console.warn('Feed LinkedIn non aggiornato:', e.message); }
}

async function main() {
  if (!DRY && (!TOKEN || !CHAT)) { console.log('Telegram non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  // TG_NOW serve solo per le prove (es. TG_NOW=2026-10-05T08:17:00Z)
  const now = process.env.TG_NOW ? new Date(process.env.TG_NOW).getTime() : Date.now();

  data.tgState = data.tgState || {};
  const t = romeNow(new Date(now));
  // lunedì della settimana in corso (per l'etichetta della grafica)
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(t.weekday);
  t.mondayLabel = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(now - dow * 864e5));

  // Grafica e testo "Lavoro AI" per i social: sempre aggiornati sul sito
  const card = await buildJobsCard(data, t);

  const liRank = jobsSnapshot(data.tgState, t, card.rank);
  canvaLog(data, t, liRank);
  // Feed con i post per LinkedIn (pubblicati da un servizio esterno che legge feeds/linkedin.xml)
  await linkedinFeed(data, t, liRank);
  // Dopo l'uscita la card Canva resta online per tutto il giorno (i giri seguenti la riprendono dal sito)
  if (t.weekday === 'Fri') await canvaCard('settimana', t);
  if (t.weekday === JOBS_WEEKDAY) await canvaCard('lavori', t);
  if (t.weekday === 'Sat') await canvaCard('mano', t);
  // Card del venerdì: si rigenera dopo il feed, così il post usa quella già online
  await buildWeekCard(data, t);

  // Ore di silenzio: non si pubblica e non si scarta nulla, si riprende al mattino
  const forced = process.env.TG_DIGEST === '1' || process.env.TG_JOBS === '1';
  if (isQuiet(t.hour) && !forced) {
    if (!DRY) await writeFile(file, JSON.stringify(data));
    console.log(`→ Telegram: ore di silenzio (${QUIET_FROM}:00–${QUIET_TO}:00), riprendo al mattino.`);
    return;
  }

  // Il punto delle 8 (una volta al giorno) e la classifica lavori (il lunedì)
  await maybeDigest(data, t);
  await maybeJobs(data, t, card);

  // Notizie in lingue non previste: segnate subito, non usciranno mai sul canale
  data.items.forEach(n => { if (!n.tg && !langOk(n)) n.tg = 'skip-lang'; });
  const pending = data.items.filter(n => !n.tg);
  const fresh = pending.filter(n => awakeAge(n.date, now) < FRESH_HOURS * 36e5);
  // Le notizie non recenti non verranno mai pubblicate: le segno subito (evita arretrati al primo avvio)
  pending.forEach(n => { if (!fresh.includes(n)) n.tg = 'skip'; });

  const queue = fresh.sort((a, b) =>
    (isImportant(b) - isImportant(a)) || (b.coverage || 1) - (a.coverage || 1) || b.date.localeCompare(a.date)
  ).slice(0, MAX_PER_RUN);

  let sent = 0;
  for (const n of queue) {
    try {
      await publish(n);
      n.tg = new Date().toISOString();
      sent++;
      console.log('✓ Telegram:', n.title);
      await sleep(1500);
    } catch (e) {
      console.warn('✗ Telegram:', n.title, '—', e.message);
      if (/chat not found|bot was kicked|not enough rights|unauthorized/i.test(e.message)) break;
    }
  }
  // Video: al massimo 1 per giro, solo se uscito nelle ultime VIDEO_HOURS ore
  const videos = (data.videos || []);
  videos.forEach(v => {
    if (v.tg) return;
    if (!langOk(v)) v.tg = 'skip-lang';
    else if (awakeAge(v.date, now) >= VIDEO_HOURS * 36e5) v.tg = 'skip';
  });
  const nextVideo = videos.filter(v => !v.tg).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (nextVideo) {
    try { await publish(nextVideo); nextVideo.tg = new Date().toISOString(); console.log('✓ Telegram video:', nextVideo.title); }
    catch (e) { console.warn('✗ Telegram video:', nextVideo.title, '—', e.message); }
  }

  if (!DRY) await writeFile(file, JSON.stringify(data));
  console.log(`→ Telegram: ${sent} pubblicate, ${fresh.length - sent} in attesa`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exitCode = 0; });
}
