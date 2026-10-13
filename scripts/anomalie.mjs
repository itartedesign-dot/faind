/* =====================================================================
   FAIND — anomalie dell'automazione (chiesto da Paolo il 13 ottobre 2026)
   ---------------------------------------------------------------------
   Gli script dei social girano con "continue-on-error" e, se si bloccano,
   finiscono senza errore: il giro resta verde e nessuno se ne accorge.
   Questo modulo raccoglie quei problemi e, a fine giro, li manda a Paolo.

   • segnala(fonte, messaggio): gli script la chiamano quando qualcosa si
     blocca senza un'altra segnalazione (Telegram non ne ha; per LinkedIn,
     Pinterest e Facebook solo quando lo script si ferma del tutto). Scrive
     una riga in RUNNER_TEMP/faind-anomalie.jsonl, solo dentro GitHub Actions;
   • node scripts/anomalie.mjs (ultimo passo del giro, anche se il giro si è
     fermato prima): legge quel file e apre la segnalazione
     "FAIND · Automazione: qualcosa non è andato" (GitHub avvisa per mail).
     Se è già aperta aggiunge un commento. Lo stesso problema non viene
     ripetuto prima di REPEAT_HOURS ore, finché la segnalazione resta aperta.

   Prova senza inviare:  ANOMALIE_FILE=/tmp/a.jsonl ANOM_DRY=1 node scripts/anomalie.mjs
   ===================================================================== */

import { appendFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const TITLE = 'FAIND · Automazione: qualcosa non è andato';
const REPEAT_HOURS = 24;
const DRY = process.env.ANOM_DRY === '1';
const FILE = process.env.ANOMALIE_FILE ||
  (process.env.GITHUB_ACTIONS === 'true' && process.env.RUNNER_TEMP ? path.join(process.env.RUNNER_TEMP, 'faind-anomalie.jsonl') : '');

export function segnala(fonte, messaggio) {
  if (!FILE) return;
  try { appendFileSync(FILE, JSON.stringify({ fonte, msg: String(messaggio || 'errore sconosciuto').slice(0, 400) }) + '\n'); }
  catch (e) { console.warn('  anomalia non registrata:', e.message); }
}

// Lo stesso problema con numeri diversi (orari, id, conteggi) conta come uno solo
export const keyOf = (a) => createHash('sha1').update(a.fonte + '|' + a.msg.replace(/\d+/g, '#')).digest('hex').slice(0, 10);

export function readAnomalies(file = FILE, jobStatus = process.env.JOB_STATUS) {
  const list = [];
  if (file && existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      try { if (line.trim()) list.push(JSON.parse(line)); } catch { /* riga rovinata: la salto */ }
    }
  }
  if (jobStatus === 'failure') list.push({ fonte: 'Giro', msg: 'il giro "Aggiorna notizie" si è fermato prima della fine: il sito non è stato aggiornato in questo giro' });
  const seen = new Set();
  return list.filter(a => { const k = keyOf(a); if (seen.has(k)) return false; seen.add(k); a.key = k; return true; });
}

export function messageFor(list, now = Date.now(), runUrl = '') {
  const ora = new Date(now).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' });
  return [
    `Nel giro delle ${ora} (ora italiana) qualcosa non è andato:`,
    '',
    ...list.map(a => `- **${a.fonte}**: \`${a.msg.replace(/`/g, "'")}\``),
    '',
    runUrl ? `Dettagli nel log: ${runUrl}` : '',
    'Scrivi a Claude nel thread "Errori e anomalie automatiche" del Progetto FAIND, se non se ne è già accorto.',
    '',
    list.map(a => `<!-- k:${a.key} -->`).join(' ')
  ].join('\n');
}

async function gh(url, opts = {}) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${url}`, {
    ...opts,
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'user-agent': 'faind-bot' },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} su ${url}`);
  return res.json();
}

async function main(now = Date.now()) {
  let list = readAnomalies();
  if (FILE && existsSync(FILE)) rmSync(FILE);
  if (!list.length) { console.log('→ Anomalie: nessuna in questo giro.'); return; }
  const repo = process.env.GITHUB_REPOSITORY;
  const runUrl = repo && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
  if (DRY || !repo || !process.env.GITHUB_TOKEN) { console.log(`--- SEGNALAZIONE (non inviata) ---\n${TITLE}\n${messageFor(list, now, runUrl)}`); return; }

  const open = (await gh('/issues?state=open&per_page=100')).find(i => i.title === TITLE && !i.pull_request);
  if (open) {
    // tolgo i problemi già segnalati nelle ultime REPEAT_HOURS ore
    const since = now - REPEAT_HOURS * 36e5;
    const recent = [open, ...(await gh(`/issues/${open.number}/comments?per_page=100`))]
      .filter(c => new Date(c.created_at).getTime() >= since).map(c => c.body || '').join('\n');
    list = list.filter(a => !recent.includes(`k:${a.key}`));
    if (!list.length) { console.log(`→ Anomalie: già segnalate nella #${open.number}, non le ripeto.`); return; }
  }
  const owner = repo.split('/')[0];
  const body = `@${owner}\n\n${messageFor(list, now, runUrl)}`;
  if (open) {
    await gh(`/issues/${open.number}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
    console.log(`✓ Anomalie: aggiunte alla segnalazione #${open.number} (${list.length})`);
  } else {
    const issue = await gh('/issues', { method: 'POST', body: JSON.stringify({ title: TITLE, body: body + '\n\n_Messaggio automatico di scripts/anomalie.mjs. Quando hai sistemato puoi chiudere questa segnalazione._' }) });
    console.log(`✓ Anomalie: aperta la segnalazione #${issue.number} (${list.length})`);
  }
  for (const a of list) console.log(`  ${a.fonte}: ${a.msg}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error('✗ Anomalie:', e.message); process.exitCode = 0; });
}
