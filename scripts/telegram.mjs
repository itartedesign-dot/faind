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
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://itartedesign-dot.github.io/faind/';
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

export function pickDigest(items, now = Date.now()) {
  const rank = (a, b) => (isImportant(b) - isImportant(a)) || (b.coverage || 1) - (a.coverage || 1) || b.date.localeCompare(a.date);
  const within = (h) => items.filter(n => langOk(n) && n.title && n.link && n.link.url && now - new Date(n.date).getTime() < h * 36e5).sort(rank);
  let list = within(24);
  if (list.length < DIGEST_COUNT) list = within(48);   // giornata povera: allargo a 48 ore
  return list.slice(0, DIGEST_COUNT);
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
