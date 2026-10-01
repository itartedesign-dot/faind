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
   • solo notizie e video nelle lingue TG_LANGS (italiano e inglese).

   Serve (GitHub → Settings → Secrets → Actions):
     TELEGRAM_BOT_TOKEN   token di @BotFather
     TELEGRAM_CHAT_ID     @faindnews
   Senza questi valori lo script non fa nulla.
   Prova senza pubblicare: TG_DRY=1 node scripts/telegram.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://itartedesign-dot.github.io/faind/';
const MAX_PER_RUN = 4;
const FRESH_HOURS = 6;
const VIDEO_HOURS = 12;
// Lingue pubblicate sul canale (notizie e video). Le altre restano solo sul sito.
const TG_LANGS = ['it', 'en'];
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

async function main() {
  if (!DRY && (!TOKEN || !CHAT)) { console.log('Telegram non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  const now = Date.now();

  // Notizie in lingue non previste: segnate subito, non usciranno mai sul canale
  data.items.forEach(n => { if (!n.tg && !langOk(n)) n.tg = 'skip-lang'; });
  const pending = data.items.filter(n => !n.tg);
  const fresh = pending.filter(n => now - new Date(n.date).getTime() < FRESH_HOURS * 36e5);
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
    else if (now - new Date(v.date).getTime() >= VIDEO_HOURS * 36e5) v.tg = 'skip';
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
