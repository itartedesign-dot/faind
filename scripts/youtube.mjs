/* =====================================================================
   FAIND — short "Dal cassetto di Faindo" su YouTube (tramite Buffer)
   ---------------------------------------------------------------------
   Gira dopo linkedin.mjs, nella stessa GitHub Action (ogni ora e a ogni
   push su main). Legge la coda in social/shorts.json, preparata da Claude:
   per ogni short c'è il link del video esportato da Canva, il titolo e il
   testo di pubblicazione (fonte e hashtag). Quando arriva l'ora indicata
   in "dalle", lo consegna a Buffer, che lo pubblica sul canale YouTube.

   Regole:
   • pubblica SOLO su un canale Buffer di tipo YouTube il cui nome contiene
     "FAIND";
   • uno short non esce mai due volte: quelli consegnati vengono segnati in
     news.json → tgState.yt e, per sicurezza, prima si controlla che su
     Buffer non ci sia già lo stesso testo;
   • il link di Canva scade (vedi "scade"): Buffer scarica il video quando
     pubblica, quindi lo short esce pochi minuti dopo la consegna e, se il
     link è scaduto o non risponde, non si consegna e si apre una
     segnalazione (issue) sul repository: GitHub avvisa per mail;
   • dopo la consegna controlla su Buffer che lo short sia uscito davvero:
     se Buffer segna un errore, o dopo CHECK_LATE_H ore non risulta uscito,
     apre una segnalazione;
   • quando Buffer conferma che lo short è uscito, ne annuncia il link sul
     canale Telegram con la frase scritta da Claude nel campo "telegram"
     della coda (senza quel campo non annuncia nulla); mai nelle ore di
     silenzio di Telegram (23-7);
   • lunedì e giovedì (SHORT_DAYS), se alle SHORT_ALERT_FROM nessuno short
     è stato consegnato in giornata (la routine di Claude non ci è riuscita),
     apre una segnalazione.

   Serve lo stesso BUFFER_API_KEY di linkedin.mjs; per Telegram gli stessi
   TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID di telegram.mjs.
   Prova senza pubblicare:  YT_DRY=1 node scripts/youtube.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gql, alert, alreadyOnBuffer } from './linkedin.mjs';
import { isQuiet } from './telegram.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.BUFFER_API_KEY;
const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG_CHAT = process.env.TELEGRAM_CHAT_ID;
const CHANNEL_URL = 'https://www.youtube.com/@faindnews';
const TG_API = process.env.TELEGRAM_API_URL || 'https://api.telegram.org';   // TELEGRAM_API_URL serve solo per le prove
const DRY = process.env.YT_DRY === '1';

const CHANNEL_NAME = /faind/i;
const DELAY_MIN = 5;             // lo short esce qualche minuto dopo la consegna a Buffer
const MARGIN_MIN = 30;           // non consegno un video il cui link scade entro questo margine
const CATEGORY = '28';           // YouTube: Science & Technology
const CHECK_AFTER_MIN = 20;      // dopo quanto controllo su Buffer che lo short sia uscito
const CHECK_LATE_H = 3;          // oltre questo ritardo uno short non uscito viene segnalato
const SHORT_DAYS = ['Mon', 'Thu'];
const SHORT_ALERT_FROM = 17;     // ora italiana dopo cui uno short mancante viene segnalato

const q = (s) => JSON.stringify(String(s));

async function findChannel() {
  const acc = await gql('query { account { organizations { id name } } }');
  const found = [], seen = [];
  for (const org of (acc.account && acc.account.organizations) || []) {
    const data = await gql(`query { channels(input: { organizationId: ${q(org.id)} }) { id name service } }`);
    for (const c of data.channels || []) {
      seen.push(`${c.name} (${c.service})`);
      if (/youtube/i.test(String(c.service)) && CHANNEL_NAME.test(c.name || '')) found.push({ ...c, organizationId: org.id });
    }
  }
  if (found.length === 1) return found[0];
  const list = seen.length ? seen.join(', ') : 'nessuno';
  throw new Error(found.length
    ? `su Buffer ci sono più canali YouTube con "FAIND" nel nome: ne serve uno solo. Canali collegati: ${list}`
    : `su Buffer non c'è un canale YouTube con "FAIND" nel nome. Canali collegati: ${list}`);
}

// Vero se il link del video risponde (scarico solo il primo byte)
async function reachable(url) {
  try {
    const res = await fetch(url, { headers: { range: 'bytes=0-0' }, signal: AbortSignal.timeout(30000) });
    return res.ok;
  } catch { return false; }
}

async function createPost(ch, s) {
  const dueAt = new Date(Date.now() + DELAY_MIN * 60e3).toISOString();
  const data = await gql(`mutation { createPost(input: { text: ${q(s.testo)}, channelId: ${q(ch.id)}, schedulingType: automatic, mode: customScheduled, dueAt: ${q(dueAt)}, assets: [{ video: { url: ${q(s.video)} } }], metadata: { youtube: { title: ${q(s.titolo)}, categoryId: ${q(CATEGORY)}, madeForKids: false } } }) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`);
  const r = data.createPost || {};
  if (!r.post) throw new Error(r.message || 'post non creato');
  return r.post;
}

const romeParts = (now) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' })
  .formatToParts(new Date(now)).map(x => [x.type, x.value]));
const romeDay = (t) => { const p = romeParts(t); return `${p.year}-${p.month}-${p.day}`; };

// Controlla su Buffer gli short consegnati: usciti, in errore o in ritardo
async function checkSent(st, now) {
  const todo = Object.entries(st.yt).filter(([, v]) => v && v.post && !v.esito && now - new Date(v.at).getTime() > CHECK_AFTER_MIN * 60e3);
  if (!todo.length) return;
  const ch = await findChannel();
  const data = await gql(`query { posts(first: 20, input: { organizationId: ${q(ch.organizationId)}, sort: [{ field: createdAt, direction: desc }], filter: { channelIds: [${q(ch.id)}] } }) { edges { node { id status externalLink error { message } } } } }`);
  const nodes = new Map(((data.posts && data.posts.edges) || []).map(({ node }) => [node.id, node]));
  for (const [id, v] of todo) {
    const n = nodes.get(v.post);
    if (n && n.status === 'sent') { v.esito = 'sent'; v.link = n.externalLink || null; console.log('✓ YouTube: short uscito:', id, v.link || ''); continue; }
    const late = now - new Date(v.at).getTime() > CHECK_LATE_H * 36e5;
    if ((n && n.status === 'error') || late) {
      v.esito = n ? n.status : 'sparito';
      const why = n && n.status === 'error' ? `Buffer segna un errore: \`${(n.error && n.error.message) || 'senza dettagli'}\``
        : n ? `dopo ${CHECK_LATE_H} ore Buffer lo dà ancora come "${n.status}"` : 'su Buffer non lo trovo più';
      await alert(st, 'short-uscita-' + id, 'Short di Faindo non uscito su YouTube',
        `Lo short "${id}" era stato consegnato a Buffer ma non risulta pubblicato: ${why}.\n\nGuarda su https://publish.buffer.com e scrivi a Claude nel Progetto FAIND che lo short non è uscito.`, now, 1);
    }
  }
}

// Annuncio su Telegram degli short usciti (una volta sola, fuori dalle ore di silenzio)
const escHtml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
async function announce(st, queue, now) {
  if (!TG_TOKEN || !TG_CHAT || isQuiet(Number(romeParts(now).hour))) return;
  for (const [id, v] of Object.entries(st.yt)) {
    if (!v || v.esito !== 'sent' || v.tg) continue;
    const s = (queue || []).find(x => x && x.id === id);
    if (!s || !s.telegram) { v.tg = 'no'; continue; }
    const text = `${escHtml(s.telegram)}\n\n👉 ${v.link || CHANNEL_URL}`;
    try {
      const res = await fetch(`${TG_API}/bot${TG_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML' }), signal: AbortSignal.timeout(30000)
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw new Error(json.description || res.status);
      v.tg = new Date(now).toISOString();
      console.log('✓ Telegram: annunciato lo short', id);
    } catch (e) { console.warn('  Telegram: annuncio dello short non riuscito:', e.message); }
  }
}

// Lunedì e giovedì: avviso se in giornata nessuno short è stato consegnato
async function missingShort(st, now) {
  const p = romeParts(now);
  if (!SHORT_DAYS.includes(p.weekday) || Number(p.hour) < SHORT_ALERT_FROM) return;
  const today = romeDay(now);
  if (Object.values(st.yt).some(v => v && v.at && romeDay(new Date(v.at).getTime()) === today)) return;
  await alert(st, 'short-mancante', 'Short di Faindo di oggi non preparato',
    `Oggi doveva uscire uno short "Dal cassetto di Faindo" su YouTube, ma la routine di Claude non l'ha preparato.\n\nScrivi a Claude nel Progetto FAIND, nel thread degli short, che oggi lo short non è uscito.`, now, 1);
}

export async function run(data, queue, now = Date.now()) {
  const st = data.tgState = data.tgState || {};
  st.yt = st.yt || {};
  if (!DRY) {
    try { await checkSent(st, now); } catch (e) { console.warn('  YouTube: controllo uscita non riuscito:', e.message); }
    await announce(st, queue, now);
    await missingShort(st, now);
  }
  const due = (queue || []).filter(s => s && s.id && !st.yt[s.id] && new Date(s.dalle).getTime() <= now);
  if (!due.length) { console.log('→ YouTube: nessuno short da pubblicare in questo giro.'); return 0; }
  if (DRY) {
    for (const s of due) console.log(`--- DRY · YouTube · ${s.id} ---\n${s.titolo}\n${s.testo}\n[video] ${s.video}`);
    return 0;
  }
  let sent = 0, ch = null;
  for (const s of due) {
    const why = !s.video || !s.titolo || !s.testo ? 'nella coda mancano il video, il titolo o il testo'
      : s.scade && new Date(s.scade).getTime() - now < MARGIN_MIN * 60e3 ? 'il link del video di Canva è scaduto'
      : !(await reachable(s.video)) ? 'il link del video di Canva non risponde' : '';
    if (why) {
      await alert(st, 'short-' + s.id, `Short di Faindo non pubblicato: ${s.titolo || s.id}`,
        `Lo short "${s.id}" doveva uscire su YouTube ma ${why}.\n\nScrivi a Claude nel Progetto FAIND che lo short non è uscito: riesporta il video da Canva e lo rimette in coda in social/shorts.json.`, now, 1);
      continue;
    }
    try {
      ch = ch || await findChannel();
      if (await alreadyOnBuffer(ch, s.testo, now)) { st.yt[s.id] = { dup: true }; console.log('→ YouTube: già presente su Buffer, non lo ripeto:', s.id); continue; }
      const post = await createPost(ch, s);
      st.yt[s.id] = { post: post.id, at: new Date(now).toISOString() };
      sent++;
      console.log(`✓ YouTube: short consegnato a Buffer (${s.id}), esce alle ${new Date(post.dueAt || Date.now()).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}`);
    } catch (e) {
      console.warn('  YouTube: consegna non riuscita:', e.message);
      await alert(st, 'short-errore', 'YouTube: short di Faindo non consegnato a Buffer',
        `L'automazione non è riuscita a consegnare lo short "${s.id}" a Buffer. Riproverà al giro dopo, finché il link del video è valido.\n\nErrore: \`${e.message}\`\n\nControlla su https://publish.buffer.com che il canale YouTube "FAIND - FLASH AI NEWS DAILY" sia collegato (se Buffer chiede di ricollegarlo basta un clic su "Reconnect").`, now, 1);
    }
  }
  return sent;
}

async function main() {
  if (!DRY && !KEY) { console.log('YouTube (Buffer) non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  let queue = [];
  try { queue = JSON.parse(await readFile(path.join(ROOT, 'social/shorts.json'), 'utf8')).coda || []; } catch {}
  const now = process.env.YT_NOW ? new Date(process.env.YT_NOW).getTime() : Date.now();
  await run(data, queue, now);
  if (!DRY) await writeFile(file, JSON.stringify(data));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exitCode = 0; });
}
