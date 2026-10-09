/* =====================================================================
   FAIND — pubblicazione automatica sulla pagina LinkedIn (tramite Buffer)
   ---------------------------------------------------------------------
   Gira dopo telegram.mjs, nella stessa GitHub Action (ogni ora).
   telegram.mjs prepara i due post della settimana (lunedì la classifica
   dei lavori AI, venerdì "La settimana dell'intelligenza artificiale") e
   li conserva in news.json → tgState.linkedin. Questo script li consegna
   a Buffer (piano gratuito), che li pubblica sulla pagina aziendale.

   Regole:
   • pubblica SOLO su un canale Buffer di tipo LinkedIn il cui nome contiene
     "FAIND": il profilo personale non può essere usato nemmeno per errore;
   • un post non esce mai due volte: ogni voce pubblicata viene segnata
     (campo "buf") e, per sicurezza, prima di pubblicare si controlla che
     su Buffer non ci sia già lo stesso post;
   • niente arretrati: le voci più vecchie di MAX_AGE_HOURS vengono scartate;
   • se qualcosa va storto riprova al giro dopo e apre una segnalazione
     (issue) sul repository: GitHub avvisa per mail;
   • la chiave Buffer dura un anno: da WARN_DAYS giorni prima della scadenza
     apre una segnalazione di promemoria, una a settimana;
   • card Canva: se alle CANVA_ALERT_FROM di lunedì, venerdì o sabato la card del
     giorno non è arrivata (la routine di Claude ha fallito i suoi 3 tentativi),
     apre una segnalazione; un'altra quando i mantra, le frasi del sabato o gli aneddoti di Faindo sono
     finiti e bisogna scriverne di nuovi.

   Serve (GitHub → Settings → Secrets and variables → Actions):
     BUFFER_API_KEY   chiave personale creata su Buffer (Impostazioni → API)
   Senza questo valore lo script non fa nulla.
   Prova senza pubblicare:  LI_DRY=1 node scripts/linkedin.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.BUFFER_API_URL || 'https://api.buffer.com';   // BUFFER_API_URL serve solo per le prove
const KEY = process.env.BUFFER_API_KEY;
const DRY = process.env.LI_DRY === '1';

const CHANNEL_NAME = /faind/i;   // il canale deve chiamarsi come la pagina (mai il profilo personale)
const MAX_AGE_HOURS = 48;        // oltre questa età un post non pubblicato viene scartato
const DELAY_MIN = 3;             // il post esce dopo qualche minuto dalla consegna a Buffer
const RETRY_DELAY_MIN = 10;      // margine usato se Buffer rifiuta il primo tentativo (es. orario già passato)
const KEY_DAYS = 365;            // durata della chiave Buffer (scegliere "1 year" quando la si crea)
const WARN_DAYS = 30;            // da quanti giorni prima della scadenza avvisare
const ALERT_EVERY_DAYS = 7;      // la stessa segnalazione non si ripete prima di N giorni
const DUP_HOURS = 72;            // finestra del controllo "già presente su Buffer"
const CANVA_ALERT_FROM = 15;     // ora italiana dopo cui una card Canva mancante viene segnalata (vedi LI_CANVA_WAIT_UNTIL in telegram.mjs)

const q = (s) => JSON.stringify(String(s));   // stringa pronta per GraphQL
const norm = (s = '') => String(s).replace(/\s+/g, ' ').trim();

class BufferError extends Error {
  constructor(message, auth = false) { super(message); this.auth = auth; }
}

export async function gql(query) {
  let res;
  try {
    res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
  } catch (e) { throw new BufferError('Buffer non raggiungibile: ' + e.message); }
  const json = await res.json().catch(() => null);
  const msg = json && json.errors && json.errors.length ? json.errors.map(e => e.message).join('; ') : '';
  if (res.status === 401 || res.status === 403 || /unauthori[sz]ed|unauthenticated|invalid (api )?(key|token)|expired/i.test(msg)) {
    throw new BufferError(`chiave Buffer rifiutata (${msg || res.status})`, true);
  }
  if (!res.ok || msg || !json || !json.data) throw new BufferError(msg || `risposta ${res.status}`);
  return json.data;
}

// Cerca il canale LinkedIn della pagina FAIND tra quelli collegati a Buffer
export async function findChannel() {
  const acc = await gql('query { account { organizations { id name } } }');
  const found = [], seen = [];
  for (const org of (acc.account && acc.account.organizations) || []) {
    const data = await gql(`query { channels(input: { organizationId: ${q(org.id)} }) { id name service } }`);
    for (const c of data.channels || []) {
      seen.push(`${c.name} (${c.service})`);
      if (String(c.service).toLowerCase() === 'linkedin' && CHANNEL_NAME.test(c.name || '')) found.push({ ...c, organizationId: org.id });
    }
  }
  if (found.length === 1) return found[0];
  const list = seen.length ? seen.join(', ') : 'nessuno';
  if (!found.length) throw new BufferError(`su Buffer non c'è un canale LinkedIn con "FAIND" nel nome. Canali collegati: ${list}`);
  throw new BufferError(`su Buffer ci sono più canali LinkedIn con "FAIND" nel nome: ne serve uno solo. Canali collegati: ${list}`);
}

// Vero se su Buffer c'è già un post recente che inizia allo stesso modo (protegge dai doppioni
// quando la pubblicazione del sito fallisce e il promemoria in news.json va perso)
export async function alreadyOnBuffer(ch, text, now) {
  const head = norm(text).slice(0, 40);
  const ask = (filter) => gql(`query { posts(first: 20, input: { organizationId: ${q(ch.organizationId)}, sort: [{ field: createdAt, direction: desc }], filter: { ${filter}channelIds: [${q(ch.id)}] } }) { edges { node { id text createdAt } } } }`);
  let data;
  try { data = await ask(''); }
  catch (e) {
    if (e.auth) throw e;
    try { data = await ask('status: [sent], '); }
    catch (e2) { if (e2.auth) throw e2; console.warn('  controllo doppioni non riuscito:', e2.message); return false; }
  }
  return ((data.posts && data.posts.edges) || []).some(({ node }) =>
    node && norm(node.text).slice(0, 40) === head && now - new Date(node.createdAt).getTime() < DUP_HOURS * 36e5);
}

async function createPost(ch, item, withImage, delayMin) {
  // l'orario parte dal momento della consegna, non dall'inizio del giro
  const dueAt = new Date(Date.now() + delayMin * 60e3).toISOString();
  // ?d=… evita che venga usata una copia vecchia dell'immagine
  const img = withImage && item.img ? `, assets: [{ image: { url: ${q(item.img + (item.img.includes('?') ? '&' : '?') + 'd=' + item.id)} } }]` : '';
  const data = await gql(`mutation { createPost(input: { text: ${q(item.text)}, channelId: ${q(ch.id)}, schedulingType: automatic, mode: customScheduled, dueAt: ${q(dueAt)}${img} }) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }`);
  const r = data.createPost || {};
  if (!r.post) throw new BufferError(r.message || 'post non creato');
  return r.post;
}

// Consegna con tre tentativi: 1) con l'immagine tra DELAY_MIN minuti; 2) se Buffer rifiuta, di nuovo
// con l'immagine ma con un margine più largo (RETRY_DELAY_MIN), nel caso il problema fosse l'orario;
// 3) solo allora senza immagine. Una chiave rifiutata interrompe subito i tentativi.
export async function deliver(ch, item) {
  try { return await createPost(ch, item, true, DELAY_MIN); }
  catch (e) {
    if (e.auth) throw e;
    console.warn(`  consegna rifiutata, riprovo con un margine di ${RETRY_DELAY_MIN} minuti:`, e.message);
  }
  try { return await createPost(ch, item, true, RETRY_DELAY_MIN); }
  catch (e) {
    if (e.auth || !item.img) throw e;
    console.warn('  rifiutata anche così, pubblico solo il testo:', e.message);
  }
  return await createPost(ch, item, false, RETRY_DELAY_MIN);
}

/* ---------- Segnalazioni sul repository (GitHub avvisa per mail) ---------- */
export async function alert(st, kind, title, body, now, everyDays = ALERT_EVERY_DAYS) {
  st.liAlerts = st.liAlerts || {};
  const last = st.liAlerts[kind] ? new Date(st.liAlerts[kind]).getTime() : 0;
  if (now - last < everyDays * 864e5) return;
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (DRY || !repo || !token) { console.log(`--- SEGNALAZIONE (non inviata) ---\n${title}\n${body}`); return; }
  try {
    const owner = repo.split('/')[0];
    const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'user-agent': 'faind-bot' },
      body: JSON.stringify({ title: 'FAIND · ' + title, body: `@${owner}\n\n${body}\n\n_Messaggio automatico di scripts/linkedin.mjs. Quando hai sistemato puoi chiudere questa segnalazione._` })
    });
    if (!res.ok) throw new Error('GitHub ' + res.status);
    st.liAlerts[kind] = new Date(now).toISOString();
    console.log('✓ segnalazione aperta sul repository:', title);
  } catch (e) { console.warn('  segnalazione non aperta:', e.message); }
}

const RENEW = [
  'Come rinnovare la chiave (5 minuti):',
  '1. Apri https://publish.buffer.com/settings/api → scheda **Personal Access** → **+ New Key** (nome `faind`, scadenza **1 year**) e copia la chiave.',
  '2. Apri le impostazioni del repository → **Secrets and variables** → **Actions** → `BUFFER_API_KEY` → **Update** e incolla la chiave nuova.',
  '3. Su Buffer puoi cancellare la chiave vecchia. Non serve altro: il conto della scadenza riparte da solo.'
].join('\n');

// Promemoria della scadenza: la data non si può leggere da Buffer, quindi si conta un anno
// dal primo utilizzo di ogni chiave (riconosciuta da un'impronta, non dalla chiave stessa)
async function keyReminder(st, now) {
  const mark = createHash('sha256').update(KEY).digest('hex').slice(0, 8);
  if (st.bufKey !== mark) { st.bufKey = mark; st.bufSince = new Date(now).toISOString(); if (st.liAlerts) { delete st.liAlerts.scadenza; delete st.liAlerts.chiave; } }
  const left = Math.ceil((new Date(st.bufSince).getTime() + KEY_DAYS * 864e5 - now) / 864e5);
  if (left <= WARN_DAYS) {
    await alert(st, 'scadenza', `LinkedIn: la chiave Buffer scade tra circa ${Math.max(left, 0)} giorni`,
      `La chiave che permette a FAIND di pubblicare su LinkedIn è in uso dal ${new Date(st.bufSince).toLocaleDateString('it-IT')} e dura un anno. Se non viene rinnovata, i post del lunedì e del venerdì smettono di uscire (sito e Telegram continuano a funzionare).\n\n${RENEW}`, now);
  }
  return left;
}

export async function run(data, now = Date.now()) {
  const st = data.tgState = data.tgState || {};
  const list = st.linkedin || [];
  // Niente arretrati: ciò che è troppo vecchio non uscirà più
  for (const i of list) if (!i.buf && now - new Date(i.date).getTime() > MAX_AGE_HOURS * 36e5) i.buf = 'skip';
  const todo = list.filter(i => !i.buf).reverse();   // dal più vecchio al più recente

  if (DRY) {
    if (!todo.length) console.log('→ LinkedIn (prova): nessun post da pubblicare in questo giro.');
    for (const i of todo) console.log(`--- DRY · LinkedIn · ${i.id} ---\n${i.text}\n[${i.text.length} caratteri] [img] ${i.img || '—'}`);
    return { sent: 0, todo: todo.length };
  }

  let sent = 0;
  try {
    const left = await keyReminder(st, now);
    // Al primo giro dopo la configurazione (e a ogni cambio di chiave) verifico subito il collegamento
    let ch = null;
    if (st.bufOk !== st.bufKey || todo.length) {
      ch = await findChannel();
      if (st.bufOk !== st.bufKey) console.log(`✓ LinkedIn: collegamento con Buffer riuscito. Canale: "${ch.name}". Chiave valida ancora per circa ${left} giorni.`);
      st.bufOk = st.bufKey;
    }
    for (const i of todo) {
      if (await alreadyOnBuffer(ch, i.text, now)) { i.buf = 'dup'; console.log('→ LinkedIn: già presente su Buffer, non lo ripeto:', i.id); continue; }
      const post = await deliver(ch, i);
      i.buf = new Date(now).toISOString();
      sent++;
      console.log(`✓ LinkedIn: post consegnato a Buffer (${i.id}), esce alle ${new Date(post.dueAt || Date.now()).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}`);
    }
  } catch (e) {
    console.warn('✗ LinkedIn:', e.message);
    if (e.auth) { st.bufOk = null; await alert(st, 'chiave', 'LinkedIn: la chiave Buffer non funziona più', `Buffer ha rifiutato la chiave: probabilmente è scaduta o è stata cancellata. I post su LinkedIn sono fermi finché non viene sostituita (sito e Telegram continuano a funzionare).\n\n${RENEW}`, now); }
    else await alert(st, 'errore', 'LinkedIn: pubblicazione non riuscita', `L'automazione non è riuscita a consegnare un post a Buffer. Riproverà da sola ogni ora per ${MAX_AGE_HOURS} ore.\n\nErrore: \`${e.message}\`\n\nControlla su https://publish.buffer.com che la pagina LinkedIn "FAIND – Flash AI News Daily" sia collegata (se Buffer chiede di ricollegarla, basta un clic su "Reconnect") e che sia l'unico canale LinkedIn.`, now);
  }
  return { sent, todo: sent + list.filter(i => !i.buf).length };
}

/* ---------- Card Canva e liste di mantra e frasi ---------- */
const CANVA_DAYS = { Mon: ['lavori', 'Lavoro AI', 'lunedì'], Fri: ['settimana', 'Notizie AI', 'venerdì'], Sat: ['mano', 'Scritto a mano', 'sabato'] };
const readJson = async (rel) => { try { return JSON.parse(await readFile(path.join(ROOT, rel), 'utf8')); } catch { return null; } };
const romeParts = (now) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' })
  .formatToParts(new Date(now)).map(x => [x.type, x.value]));
// Quanti elementi di una lista (numerata da 1) non sono ancora stati usati
export const freeCount = (list, used) => { const u = new Set((used || []).map(x => Number(x && x.n))); return (list || []).filter((_, i) => !u.has(i + 1)).length; };

export async function canvaChecks(st, now) {
  const p = romeParts(now), day = `${p.year}-${p.month}-${p.day}`, hour = Number(p.hour);
  const card = CANVA_DAYS[p.weekday];
  if (card && hour >= CANVA_ALERT_FROM) {
    const [kind, name, dayName] = card;
    const info = await readJson(`social/canva-${kind}.json`);
    if (!info || info.day !== day) {
      const effect = kind === 'mano' ? 'Oggi il post del sabato su LinkedIn non è uscito.' : 'Il post di oggi su LinkedIn è uscito lo stesso, con la grafica automatica del sito.';
      await alert(st, 'canva-' + kind, `Card Canva "${name}" di ${dayName} non preparata`,
        `La routine di Claude che compila la card "${name}" su Canva non ci è riuscita nei suoi 3 tentativi (8:40, 10:40 e 12:40). ${effect}\n\nDi solito vuol dire che Canva o GitHub si sono scollegati da Claude. Apri il Progetto FAIND su Claude e scrivi nel thread "Modello card venerdì su Canva" che la card di oggi non è uscita: Claude controlla cosa non va.`, now, 1);
    }
  }
  const mantra = await readJson('social/mantra.json');
  if (mantra && Array.isArray(mantra.mantra) && freeCount(mantra.mantra, mantra.usati) === 0) {
    await alert(st, 'mantra-finiti', 'Card Canva: abbiamo usato l\'ultimo mantra, è ora di scriverne altri',
      `Tutti i ${mantra.mantra.length} mantra delle card del lunedì (Lavoro AI) e del venerdì (Notizie AI) sono stati usati. Finché non ne arrivano di nuovi la routine si ferma e i post escono con la grafica automatica del sito.\n\nScrivi i nuovi mantra a Claude nel Progetto FAIND: li aggiunge in social/mantra.json.`, now);
  }
  const frasi = await readJson('social/frasi-mano.json');
  if (frasi && Array.isArray(frasi.frasi) && freeCount(frasi.frasi, frasi.usati) === 0) {
    await alert(st, 'frasi-finite', 'Card "Scritto a mano": abbiamo usato l\'ultima frase, è ora di scriverne altre',
      `Tutte le ${frasi.frasi.length} frasi della card del sabato sono state usate. Senza frasi nuove il sabato non esce nessun post su LinkedIn.\n\nScrivi le nuove frasi a Claude nel Progetto FAIND: le aggiunge in social/frasi-mano.json.`, now);
  }
  const aneddoti = await readJson('social/aneddoti.json');
  if (aneddoti && Array.isArray(aneddoti.aneddoti) && freeCount(aneddoti.aneddoti, aneddoti.usati) === 0) {
    await alert(st, 'aneddoti-finiti', 'Short di Faindo: abbiamo usato l\'ultimo aneddoto, è ora di prepararne altri',
      `Tutti i ${aneddoti.aneddoti.length} aneddoti della rubrica video di Faindo sono stati usati.\n\nPreparane di nuovi e mandali a Claude nel Progetto FAIND: li verifica e li aggiunge in social/aneddoti.json.`, now);
  }
}

async function main() {
  if (!DRY && !KEY) { console.log('LinkedIn (Buffer) non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  // LI_NOW serve solo per le prove (es. LI_NOW=2026-10-05T08:17:00Z)
  const now = process.env.LI_NOW ? new Date(process.env.LI_NOW).getTime() : Date.now();
  const r = await run(data, now);
  try { await canvaChecks(data.tgState, now); } catch (e) { console.warn('  controllo card Canva non riuscito:', e.message); }
  if (!DRY) await writeFile(file, JSON.stringify(data));
  console.log(`→ LinkedIn: ${r.sent} pubblicat${r.sent === 1 ? 'o' : 'i'}, ${r.todo - r.sent} in attesa`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exitCode = 0; });
}
