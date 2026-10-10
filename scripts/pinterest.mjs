/* =====================================================================
   FAIND — pubblicazione automatica su Pinterest (tramite Buffer)
   ---------------------------------------------------------------------
   Gira dopo youtube.mjs, nella stessa GitHub Action (ogni ora e a ogni
   push su main). Porta su Pinterest tutto quello che esce su LinkedIn e
   su YouTube (deciso da Paolo il 10 ottobre 2026):
   • i post LinkedIn (news.json → tgState.linkedin) diventano Pin con la
     stessa immagine, un titolo, il testo accorciato con gli hashtag e il
     link alla pagina del sito; quelli usciti con la grafica di riserva
     (card Canva non pronta) non vanno su Pinterest;
   • gli short di Faindo (news.json → tgState.yt e social/shorts.json)
     diventano Pin video finché il link del video di Canva è valido;
     dopo, un Pin con l'anteprima del video che porta allo short.

   Regole:
   • pubblica SOLO sull'unico canale Pinterest collegato a Buffer, sulla
     bacheca "FAIND - Flash AI News Daily" (o sull'unica con "FAIND" nel nome);
   • un Pin non esce mai due volte: quelli consegnati vengono segnati in
     news.json → tgState.pin e prima si controlla che su Buffer non ci sia
     già lo stesso testo;
   • niente arretrati: si porta su Pinterest solo ciò che è uscito nelle
     ultime MAX_AGE_HOURS ore;
   • i Pin dello stesso giro escono a GAP_MIN minuti l'uno dall'altro;
   • dopo la consegna controlla su Buffer che il Pin sia uscito: se Buffer
     segna un errore apre una segnalazione (issue): GitHub avvisa per mail.

   Serve lo stesso BUFFER_API_KEY di linkedin.mjs.
   Prova senza pubblicare:  PIN_DRY=1 node scripts/pinterest.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gql, alert, alreadyOnBuffer } from './linkedin.mjs';
import { videoIdOf } from './faindo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://faind.org/';
const KEY = process.env.BUFFER_API_KEY;
const DRY = process.env.PIN_DRY === '1';

const BOARD_MAIN = /flash ai news/i;  // la bacheca delle notizie: "FAIND - Flash AI News Daily"
const BOARD_NAME = /faind/i;
const MAX_AGE_HOURS = 48;        // oltre questa età un contenuto non viene più portato su Pinterest
const DELAY_MIN = 5;             // il primo Pin esce qualche minuto dopo la consegna a Buffer
const GAP_MIN = 20;              // distanza tra i Pin consegnati nello stesso giro
const MARGIN_MIN = 30;           // non consegno un video il cui link di Canva scade entro questo margine
const TITLE_MAX = 100;           // limiti di Pinterest
const DESC_MAX = 500;
const CHECK_AFTER_MIN = 30;      // dopo quanto controllo su Buffer che il Pin sia uscito
const CHECK_LATE_H = 6;          // oltre questo ritardo un Pin non uscito viene segnalato

const q = (s) => JSON.stringify(String(s));
const UTM = (c) => `utm_source=pinterest&utm_medium=social&utm_campaign=${c}`;
export const withUtm = (url, c) => !url.startsWith(SITE) ? url
  : /utm_source=/.test(url) ? url.replace(/utm_source=[^&#]*/, 'utm_source=pinterest')
  : url.replace(/#|$/, (m) => `${url.includes('?') ? '&' : '?'}${UTM(c)}${m}`);

// Taglia a parola intera entro max caratteri
export function cut(s, max) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const head = s.slice(0, max - 1);
  return head.slice(0, Math.max(head.lastIndexOf(' '), max * 0.6)).replace(/[\s,;:.–-]+$/, '') + '…';
}
const tagsOf = (s = '') => [...new Set(String(s).match(/#[\p{L}\p{N}_]+/gu) || [])];
const noTags = (s = '') => String(s).replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim();
// Tiene le righe intere finché entrano in max caratteri (la prima, se troppo lunga, viene tagliata)
export function fitLines(lines, max) {
  const out = [];
  for (const l of lines) {
    const next = [...out, l].join('\n');
    if (next.length <= max) { out.push(l); continue; }
    if (!out.length) out.push(cut(l, max));
    break;
  }
  return out.join('\n');
}

// Pin da un post LinkedIn: titolo senza hashtag, testo senza link e righe vuote, hashtag in fondo
export function pinFromLinkedin(i) {
  const tags = tagsOf(i.text).slice(0, 8).join(' ');
  const lines = String(i.text || '').split('\n').map(l => l.trim()).filter(l => l && !/^#/.test(l) && !/https?:\/\//.test(l));
  const desc = fitLines(lines, DESC_MAX - (tags ? tags.length + 2 : 0)) + (tags ? '\n\n' + tags : '');
  const kind = String(i.id).replace(/-\d{4}-\d{2}-\d{2}$/, '');
  return { key: 'li-' + i.id, title: cut(noTags(i.title || i.text), TITLE_MAX), text: desc,
    url: withUtm(i.link || SITE, kind), img: i.img ? i.img + (i.img.includes('?') ? '&' : '?') + 'd=' + i.id : null };
}

// Pin da uno short: video se il link di Canva è ancora valido, altrimenti l'anteprima di YouTube
export function pinFromShort(s, v, now) {
  const tags = tagsOf(s.testo).filter(t => !/^#shorts$/i.test(t));
  const body = noTags(s.testo);
  const tagLine = [...tags, '#Faindo', '#IntelligenzaArtificiale'].filter((x, k, a) => a.indexOf(x) === k).slice(0, 8).join(' ');
  const desc = cut(body, DESC_MAX - tagLine.length - 2) + '\n\n' + tagLine;
  const videoOk = s.video && (!s.scade || new Date(s.scade).getTime() - now > MARGIN_MIN * 60e3);
  const yt = videoIdOf(v.link || '');
  const pin = { key: 'yt-' + s.id, title: cut(noTags(s.titolo), TITLE_MAX), text: desc,
    url: v.link || withUtm(SITE + 'dal-cassetto-di-faindo/', 'dal-cassetto') };
  if (videoOk) return { ...pin, video: s.video };
  if (yt) return { ...pin, img: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` };
  return null;   // né video né link dello short: si riprova al giro dopo
}

// Canale Pinterest e bacheca su cui pubblicare
async function findBoard() {
  const acc = await gql('query { account { organizations { id name } } }');
  const found = [], seen = [];
  for (const org of (acc.account && acc.account.organizations) || []) {
    const data = await gql(`query { channels(input: { organizationId: ${q(org.id)} }) { id name service metadata { ... on PinterestMetadata { boards { serviceId name } } } } }`);
    for (const c of data.channels || []) {
      seen.push(`${c.name} (${c.service})`);
      if (/pinterest/i.test(String(c.service))) found.push({ ...c, organizationId: org.id });
    }
  }
  const list = seen.length ? seen.join(', ') : 'nessuno';
  if (found.length !== 1) throw new Error(found.length ? `su Buffer ci sono più canali Pinterest: ne serve uno solo. Canali collegati: ${list}` : `su Buffer non c'è un canale Pinterest. Canali collegati: ${list}`);
  const ch = found[0], boards = (ch.metadata && ch.metadata.boards) || [];
  // Paolo ha anche altre bacheche FAIND (es. "Famous masterpieces reimagined by AI"): si usa quella delle notizie
  const main = boards.filter(b => BOARD_MAIN.test(b.name || ''));
  const named = boards.filter(b => BOARD_NAME.test(b.name || ''));
  const board = main.length === 1 ? main[0] : named.length === 1 ? named[0] : boards.length === 1 ? boards[0] : null;
  if (!board) throw new Error(boards.length ? `su Pinterest serve una sola bacheca con "FAIND" nel nome. Bacheche: ${boards.map(b => b.name).join(', ')}` : 'il canale Pinterest su Buffer non ha bacheche');
  return { ...ch, board };
}

async function createPin(ch, p, delayMin) {
  const dueAt = new Date(Date.now() + delayMin * 60e3).toISOString();
  const asset = p.video ? `{ video: { url: ${q(p.video)} } }` : `{ image: { url: ${q(p.img)} } }`;
  const data = await gql(`mutation { createPost(input: { text: ${q(p.text)}, channelId: ${q(ch.id)}, schedulingType: automatic, mode: customScheduled, dueAt: ${q(dueAt)}, assets: [${asset}], metadata: { pinterest: { boardServiceId: ${q(ch.board.serviceId)}, title: ${q(p.title)}, url: ${q(p.url)} } } }) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`);
  const r = data.createPost || {};
  if (!r.post) throw new Error(r.message || 'Pin non creato');
  return r.post;
}

// Controlla su Buffer i Pin consegnati: usciti, in errore o in ritardo
async function checkSent(st, ch, now) {
  const todo = Object.entries(st.pin).filter(([, v]) => v && v.post && !v.esito && now - new Date(v.at).getTime() > CHECK_AFTER_MIN * 60e3);
  if (!todo.length) return;
  ch = ch || await findBoard();
  const data = await gql(`query { posts(first: 30, input: { organizationId: ${q(ch.organizationId)}, sort: [{ field: createdAt, direction: desc }], filter: { channelIds: [${q(ch.id)}] } }) { edges { node { id status externalLink error { message } } } } }`);
  const nodes = new Map(((data.posts && data.posts.edges) || []).map(({ node }) => [node.id, node]));
  for (const [key, v] of todo) {
    const n = nodes.get(v.post);
    if (n && n.status === 'sent') { v.esito = 'sent'; v.link = n.externalLink || null; console.log('✓ Pinterest: Pin uscito:', key, v.link || ''); continue; }
    if ((n && n.status === 'error') || now - new Date(v.at).getTime() > CHECK_LATE_H * 36e5) {
      v.esito = n ? n.status : 'sparito';
      const why = n && n.status === 'error' ? `Buffer segna un errore: \`${(n.error && n.error.message) || 'senza dettagli'}\`` : n ? `dopo ${CHECK_LATE_H} ore Buffer lo dà ancora come "${n.status}"` : 'su Buffer non lo trovo più';
      await alert(st, 'pin-uscita-' + key, 'Pinterest: Pin non uscito', `Il Pin "${key}" era stato consegnato a Buffer ma non risulta pubblicato: ${why}.\n\nGuarda su https://publish.buffer.com e scrivi a Claude nel Progetto FAIND che il Pin non è uscito.`, now, 1);
    }
  }
}

// Grafiche di riserva usate su LinkedIn quando la card Canva non è pronta (vedi telegram.mjs)
const FALLBACK = ['social/lavori-ai.png', 'social/settimana-ai.png', 'assets/og-image.png'];
export const isFallback = (img = '') => FALLBACK.some(f => String(img).split('?')[0] === SITE + f);

// Cosa portare su Pinterest in questo giro (dal più vecchio al più recente)
export function pending(st, queue, now) {
  const fresh = (t) => t && now - new Date(t).getTime() < MAX_AGE_HOURS * 36e5;
  const out = [];
  for (const i of [...(st.linkedin || [])].reverse()) {
    if (!i || !i.buf || i.buf === 'skip' || st.pin['li-' + i.id] || !fresh(i.date) || !i.img) continue;
    // Regola di Paolo (10 ottobre 2026): su Pinterest niente post con la grafica di riserva
    if (isFallback(i.img)) { st.pin['li-' + i.id] = { riserva: true }; console.log('→ Pinterest: post con la grafica di riserva, non lo porto:', i.id); continue; }
    out.push({ at: i.date, pin: pinFromLinkedin(i) });
  }
  for (const [id, v] of Object.entries(st.yt || {})) {
    if (!v || !v.post || st.pin['yt-' + id] || !fresh(v.at) || (v.esito && v.esito !== 'sent')) continue;
    const s = (queue || []).find(x => x && x.id === id);
    const pin = s && pinFromShort(s, v, now);
    if (pin) out.push({ at: v.at, pin });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at)).map(x => x.pin);
}

export async function run(data, queue, now = Date.now()) {
  const st = data.tgState = data.tgState || {};
  st.pin = st.pin || {};
  const todo = pending(st, queue, now);
  if (DRY) {
    if (!todo.length) console.log('→ Pinterest (prova): niente da pubblicare in questo giro.');
    for (const p of todo) console.log(`--- DRY · Pinterest · ${p.key} ---\n[titolo ${p.title.length}] ${p.title}\n[testo ${p.text.length}]\n${p.text}\n[link] ${p.url}\n[${p.video ? 'video' : 'img'}] ${p.video || p.img}`);
    return 0;
  }
  let ch = null, sent = 0;
  try {
    if (todo.length || !st.pinOk) {
      ch = await findBoard();
      if (!st.pinOk) console.log(`✓ Pinterest: collegamento con Buffer riuscito. Canale "${ch.name}", bacheca "${ch.board.name}".`);
      st.pinOk = true;
    }
    for (const p of todo) {
      if (await alreadyOnBuffer(ch, p.text, now)) { st.pin[p.key] = { dup: true }; console.log('→ Pinterest: già presente su Buffer, non lo ripeto:', p.key); continue; }
      let post;
      try { post = await createPin(ch, p, DELAY_MIN + sent * GAP_MIN); }
      catch (e) {
        if (!p.video) throw e;
        // Pinterest a volte rifiuta il video: al giro dopo si riprova con l'anteprima dello short
        console.warn('  Pinterest: video rifiutato, riprovo più tardi con l\'anteprima:', e.message);
        continue;
      }
      st.pin[p.key] = { post: post.id, at: new Date(now).toISOString() };
      sent++;
      console.log(`✓ Pinterest: Pin consegnato a Buffer (${p.key}), esce alle ${new Date(post.dueAt || Date.now()).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}`);
    }
    await checkSent(st, ch, now);
  } catch (e) {
    console.warn('✗ Pinterest:', e.message);
    await alert(st, 'pin-errore', 'Pinterest: pubblicazione non riuscita', `L'automazione non è riuscita a consegnare un Pin a Buffer. Riproverà da sola ogni ora per ${MAX_AGE_HOURS} ore.\n\nErrore: \`${e.message}\`\n\nControlla su https://publish.buffer.com che il canale Pinterest sia collegato (se Buffer chiede di ricollegarlo basta un clic su "Reconnect") e che ci sia una bacheca con "FAIND" nel nome.`, now);
  }
  console.log(`→ Pinterest: ${sent} Pin consegnat${sent === 1 ? 'o' : 'i'}`);
  return sent;
}

async function main() {
  if (!DRY && !KEY) { console.log('Pinterest (Buffer) non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  let queue = [];
  try { queue = JSON.parse(await readFile(path.join(ROOT, 'social/shorts.json'), 'utf8')).coda || []; } catch {}
  // PIN_NOW serve solo per le prove (es. PIN_NOW=2026-10-10T15:17:00Z)
  const now = process.env.PIN_NOW ? new Date(process.env.PIN_NOW).getTime() : Date.now();
  await run(data, queue, now);
  if (!DRY) await writeFile(file, JSON.stringify(data));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exitCode = 0; });
}
