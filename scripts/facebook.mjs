/* =====================================================================
   FAIND — pubblicazione automatica sulla Pagina Facebook (tramite Zernio)
   ---------------------------------------------------------------------
   Gira dopo pinterest.mjs, nella stessa GitHub Action (ogni ora e a ogni
   push su main). Porta su Facebook i post usciti su LinkedIn (deciso da
   Paolo il 10 ottobre 2026): stessa immagine e stesso testo, senza link
   nel testo; il link al sito va nel primo commento, con utm_source=facebook.

   Perché Zernio e non Buffer: il piano gratuito di Buffer ha 3 canali e
   sono già usati da LinkedIn, YouTube e Pinterest. Zernio gratuito ha 2
   account con API: uno è la Pagina Facebook, l'altro resta per TikTok.

   Regole:
   • pubblica SOLO sull'unico account Facebook collegato a Zernio (la Pagina
     "FAIND - Flash AI News Daily"; il profilo personale Zernio non lo accetta);
   • un post non esce mai due volte: quelli consegnati vengono segnati in
     news.json → tgState.fb;
   • si porta su Facebook un post LinkedIn solo dal giro dopo la sua consegna
     a Buffer, così la sua immagine è già online sul sito;
   • solo nello stesso giorno (ora italiana) del post LinkedIn: le card Canva
     (social/canva-*.png) restano online solo nel loro giorno e le altre
     grafiche vengono ridisegnate a ogni giro; prima di consegnare controllo
     che l'immagine sia raggiungibile, altrimenti riprovo al giro dopo;
   • un solo post al giorno sulla Pagina (regola del Contesto: due nello
     stesso giorno si tolgono visibilità): se ce n'è più d'uno in attesa
     esce il più recente, gli altri vengono saltati;
   • dopo la consegna controlla su Zernio che il post sia uscito: se Zernio
     segna un errore apre una segnalazione (issue): GitHub avvisa per mail.

   Serve (GitHub → Settings → Secrets and variables → Actions):
     ZERNIO_API_KEY   chiave creata su zernio.com (API Keys), comincia con sk_
   Senza questo valore lo script non fa nulla.
   Prova senza pubblicare:  FB_DRY=1 node scripts/facebook.mjs
   ===================================================================== */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { alert } from './linkedin.mjs';

const romeDay = (t) => new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.ZERNIO_API_URL || 'https://zernio.com/api/v1';   // ZERNIO_API_URL serve solo per le prove
const KEY = process.env.ZERNIO_API_KEY;
const DRY = process.env.FB_DRY === '1';
const SITE = 'https://faind.org/';

const AFTER_LI_MIN = 20;         // aspetto che il sito con l'immagine sia online (pubblicato a fine giro)
const DELAY_MIN = 5;             // il primo post esce qualche minuto dopo la consegna a Zernio
const CHECK_AFTER_MIN = 30;      // dopo quanto controllo su Zernio che il post sia uscito
const CHECK_LATE_H = 6;          // oltre questo ritardo un post non uscito viene segnalato

class ZernioError extends Error {
  constructor(message, auth = false) { super(message); this.auth = auth; }
}

async function api(method, url, body) {
  const res = await fetch(API + url, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || text.slice(0, 200) || res.statusText;
    throw new ZernioError(`Zernio ${res.status}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`, res.status === 401);
  }
  return data || {};
}

// L'unico account Facebook collegato a Zernio
async function findAccount() {
  const data = await api('GET', '/accounts');
  const all = data.accounts || data.data || [];
  const fb = all.filter(a => /facebook/i.test(a.platform || '') && a.isActive !== false);
  const list = all.length ? all.map(a => `${a.displayName || a.username || '?'} (${a.platform})`).join(', ') : 'nessuno';
  if (fb.length !== 1) throw new Error(fb.length ? `su Zernio ci sono più account Facebook: ne serve uno solo. Account collegati: ${list}` : `su Zernio non c'è un account Facebook attivo. Account collegati: ${list}`);
  return { id: fb[0]._id || fb[0].id, name: fb[0].displayName || fb[0].username || 'Facebook' };
}

const withUtm = (url, c) => !url.startsWith(SITE) ? url
  : /utm_source=/.test(url) ? url.replace(/utm_source=[^&#]*/, 'utm_source=facebook')
  : url.replace(/#|$/, (m) => `${url.includes('?') ? '&' : '?'}utm_source=facebook&utm_medium=social&utm_campaign=${c}${m}`);

// Post Facebook da un post LinkedIn: le righe con un link escono dal testo, il link va nel primo commento
export function postFromLinkedin(i) {
  const kind = String(i.id).replace(/-\d{4}-\d{2}-\d{2}$/, '');
  const text = String(i.text || '').split('\n').filter(l => !/https?:\/\//.test(l)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const link = withUtm(i.link || SITE, kind);
  return { key: 'li-' + i.id, text, img: i.img ? i.img + (i.img.includes('?') ? '&' : '?') + 'd=' + i.id : null,
    comment: `Leggi su FAIND: ${link}` };
}

// Cosa portare su Facebook in questo giro (dal più vecchio al più recente)
export function pending(st, now) {
  const out = [];
  for (const i of [...(st.linkedin || [])].reverse()) {
    if (!i || !i.buf || i.buf === 'skip' || st.fb['li-' + i.id]) continue;
    if (romeDay(i.date) !== romeDay(now)) continue;   // passato il giorno, la sua immagine non è più quella giusta
    const at = new Date(i.buf === 'dup' ? i.date : i.buf).getTime();
    if (!(at < now - AFTER_LI_MIN * 60e3)) continue;   // consegnato a LinkedIn in questo giro: al giro dopo
    out.push(postFromLinkedin(i));
  }
  return out;
}

// L'immagine deve essere online: Zernio la scarica quando pubblica
async function reachable(url) {
  try { const res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) }); return res.ok; }
  catch { return false; }
}

async function createPost(acc, p, delayMin, withImage) {
  const body = {
    content: p.text,
    platforms: [{ platform: 'facebook', accountId: acc.id, platformSpecificData: { firstComment: p.comment } }],
    scheduledFor: new Date(Date.now() + delayMin * 60e3).toISOString(),
    timezone: 'UTC',
  };
  if (withImage && p.img) body.mediaItems = [{ type: 'image', url: p.img }];
  const data = await api('POST', '/posts', body);
  const post = data.post || data;
  if (!post || !(post._id || post.id)) throw new Error('post non creato: ' + JSON.stringify(data).slice(0, 200));
  return { id: post._id || post.id, at: body.scheduledFor };
}

// Prima con l'immagine; se Zernio la rifiuta, solo il testo
async function deliver(acc, p, delayMin) {
  try { return await createPost(acc, p, delayMin, true); }
  catch (e) {
    if (e.auth || !p.img) throw e;
    console.warn('  Facebook: consegna con immagine rifiutata, pubblico solo il testo:', e.message);
  }
  return await createPost(acc, p, delayMin, false);
}

// Controlla su Zernio i post consegnati: usciti, in errore o in ritardo
async function checkSent(st, now) {
  const todo = Object.entries(st.fb).filter(([, v]) => v && v.post && !v.esito && now - new Date(v.at).getTime() > CHECK_AFTER_MIN * 60e3);
  for (const [key, v] of todo) {
    let p = null;
    try { const d = await api('GET', '/posts/' + v.post); p = d.post || d; }
    catch (e) {
      if (e.auth) throw e;
      // Post cancellato a mano su Zernio: niente segnalazione
      if (/Zernio 404/.test(e.message)) { v.esito = 'cancellato'; console.log('→ Facebook: post cancellato su Zernio:', key); continue; }
      console.warn('  Facebook: stato del post non leggibile:', key, e.message);
    }
    const status = String((p && p.status) || '');
    if (/^published$/i.test(status)) {
      const pl = ((p.platforms || []).find(x => /facebook/i.test(x.platform || '')) || {});
      v.esito = 'published'; v.link = pl.platformPostUrl || null;
      console.log('✓ Facebook: post uscito:', key, v.link || ''); continue;
    }
    if (/failed|partial|error/i.test(status) || now - new Date(v.at).getTime() > CHECK_LATE_H * 36e5) {
      v.esito = status || 'sconosciuto';
      const pl = p && (p.platforms || []).find(x => /facebook/i.test(x.platform || ''));
      const why = /failed|partial|error/i.test(status) ? `Zernio segna "${status}"${pl && (pl.errorMessage || pl.error) ? `: \`${pl.errorMessage || pl.error}\`` : ''}` : `dopo ${CHECK_LATE_H} ore Zernio lo dà ancora come "${status || 'sconosciuto'}"`;
      await alert(st, 'fb-uscita-' + key, 'Facebook: post non uscito', `Il post "${key}" era stato consegnato a Zernio ma non risulta pubblicato: ${why}.\n\nGuarda su https://zernio.com (Posts) e scrivi a Claude nel Progetto FAIND che il post non è uscito.`, now, 1);
    }
  }
}

export async function run(data, now = Date.now()) {
  const st = data.tgState = data.tgState || {};
  st.fb = st.fb || {};
  let todo = pending(st, now);
  // Un post al giorno: esce il più recente, quelli più vecchi non usciranno più
  if (todo.length > 1) for (const p of todo.slice(0, -1)) { st.fb[p.key] = { skip: true }; console.log('→ Facebook: c\'è un post più recente, salto:', p.key); }
  todo = todo.slice(-1);
  if (todo.length && st.fbDay === romeDay(now)) { console.log('→ Facebook: oggi è già uscito un post, il prossimo domani:', todo[0].key); todo = []; }
  if (DRY) {
    if (!todo.length) console.log('→ Facebook (prova): niente da pubblicare in questo giro.');
    for (const p of todo) console.log(`--- DRY · Facebook · ${p.key} ---\n${p.text}\n[${p.text.length} caratteri] [img] ${p.img || '—'}\n[primo commento] ${p.comment}`);
    return 0;
  }
  let sent = 0;
  try {
    if (todo.length || !st.fbOk) {
      const acc = await findAccount();
      if (!st.fbOk) console.log(`✓ Facebook: collegamento con Zernio riuscito. Pagina "${acc.name}".`);
      st.fbOk = true;
      for (const p of todo) {
        if (p.img && !(await reachable(p.img))) { console.log('→ Facebook: immagine non ancora online, riprovo al giro dopo:', p.img); continue; }
        const post = await deliver(acc, p, DELAY_MIN);
        st.fb[p.key] = { post: post.id, at: new Date(now).toISOString() };
        st.fbDay = romeDay(now);
        sent++;
        console.log(`✓ Facebook: post consegnato a Zernio (${p.key}), esce alle ${new Date(post.at).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}`);
      }
    }
    await checkSent(st, now);
  } catch (e) {
    console.warn('✗ Facebook:', e.message);
    if (e.auth) { st.fbOk = false; await alert(st, 'fb-chiave', 'Facebook: la chiave Zernio non funziona più', 'Zernio ha rifiutato la chiave: probabilmente è stata cancellata. I post su Facebook sono fermi finché non viene sostituita (gli altri canali continuano a funzionare).\n\nCrea una nuova chiave su https://zernio.com (API Keys) e mettila su GitHub → Settings → Secrets and variables → Actions → ZERNIO_API_KEY.', now); }
    else await alert(st, 'fb-errore', 'Facebook: pubblicazione non riuscita', `L'automazione non è riuscita a consegnare un post a Zernio. Riproverà da sola ogni ora fino a fine giornata.\n\nErrore: \`${e.message}\`\n\nControlla su https://zernio.com (Connections) che la Pagina Facebook "FAIND - Flash AI News Daily" sia collegata (se chiede di ricollegarla, basta un clic su "Reconnect").`, now);
  }
  console.log(`→ Facebook: ${sent} post consegnat${sent === 1 ? 'o' : 'i'}`);
  return sent;
}

async function main() {
  if (!DRY && !KEY) { console.log('Facebook (Zernio) non configurato: salto.'); return; }
  const file = path.join(ROOT, 'news.json');
  const data = JSON.parse(await readFile(file, 'utf8'));
  // FB_NOW serve solo per le prove (es. FB_NOW=2026-10-12T09:30:00Z)
  const now = process.env.FB_NOW ? new Date(process.env.FB_NOW).getTime() : Date.now();
  await run(data, now);
  if (!DRY) await writeFile(file, JSON.stringify(data));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e); process.exitCode = 0; });
}
