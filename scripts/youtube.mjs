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
     segnalazione (issue) sul repository: GitHub avvisa per mail.

   Serve lo stesso BUFFER_API_KEY di linkedin.mjs.
   Prova senza pubblicare:  YT_DRY=1 node scripts/youtube.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { gql, alert, alreadyOnBuffer } from './linkedin.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEY = process.env.BUFFER_API_KEY;
const DRY = process.env.YT_DRY === '1';

const CHANNEL_NAME = /faind/i;
const DELAY_MIN = 5;             // lo short esce qualche minuto dopo la consegna a Buffer
const MARGIN_MIN = 30;           // non consegno un video il cui link scade entro questo margine
const CATEGORY = '28';           // YouTube: Science & Technology

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

export async function run(data, queue, now = Date.now()) {
  const st = data.tgState = data.tgState || {};
  st.yt = st.yt || {};
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
