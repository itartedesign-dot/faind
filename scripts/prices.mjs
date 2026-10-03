/* =====================================================================
   FAIND — controllo automatico dei prezzi degli abbonamenti AI
   ---------------------------------------------------------------------
   Ogni REFRESH_HOURS ore legge il listino pubblico di AI Price Compare
   (aipricecompare.org) e lo confronta con la tabella di data.js.
   • NON modifica mai i prezzi: dice solo se coincidono.
   • Se coincidono, in home compare "Controllati in automatico il …".
   • Se un prezzo è diverso (o non si trova), il piano viene segnato
     "in verifica" e nel registro dell'automazione compare un avviso:
     a quel punto si corregge data.js a mano.
   Il risultato è salvato in news.json → priceCheck.

   Per ogni piano di data.js serve una regola in RULES: l'espressione
   cerca il prezzo nel testo della pagina (senza tag HTML).
   ===================================================================== */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export const SOURCE = { name: 'AI Price Compare', url: 'https://aipricecompare.org/' };
const REFRESH_HOURS = 12;
const P = '\\$\\s?(\\d+(?:[.,]\\d+)?)';   // un prezzo in dollari

// nome del piano in data.js → dove trovare prezzo mensile (m) e, se c'è, quello con pagamento annuale (a)
export const RULES = {
  'Google AI Plus': { m: new RegExp(P + '\\s*/\\s*mo\\s+AI Plus\\b') },
  'ChatGPT Go': { m: new RegExp(P + '\\s*/\\s*mo\\s+ChatGPT Go\\b') },
  'Google AI Pro': { m: new RegExp(P + '\\s*/\\s*mo\\s+AI Pro\\b') },
  'ChatGPT Plus': { m: new RegExp(P + '\\s*/\\s*mo\\s+ChatGPT Plus\\b') },
  'Claude Pro': { m: new RegExp(P + '\\s*/\\s*mo\\s+Claude Pro\\b'), a: new RegExp('Claude Pro\\s*·\\s*' + P + '\\s*/\\s*mo with annual') },
  'Perplexity Pro': { m: new RegExp('Perplexity Pro\\s*' + P), a: new RegExp('Pro\\s*·\\s*' + P + '\\s*/\\s*year'), aYear: true }
};

export const toText = (html) => String(html).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&middot;|&#183;/g, '·').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const num = (s) => Number(String(s).replace(',', '.'));
const same = (a, b) => Math.abs(a - b) < 0.011;

// Confronta i piani di data.js con il testo del listino. Restituisce { nome: { ok, found, foundAnnual } }
export function compare(plans, text) {
  const out = {};
  for (const p of plans) {
    const rule = RULES[p.name];
    if (!rule) { out[p.name] = { ok: null }; continue; }           // nessuna regola: resta la verifica a mano
    const m = rule.m.exec(text);
    const r = { found: m ? num(m[1]) : null };
    r.ok = r.found != null && same(r.found, p.monthly);
    if (p.annual && rule.a) {
      const a = rule.a.exec(text);
      r.foundAnnual = a ? Math.round((rule.aYear ? num(a[1]) / 12 : num(a[1])) * 100) / 100 : null;
      if (r.foundAnnual != null && !same(r.foundAnnual, p.annual)) r.ok = false;
    }
    out[p.name] = r;
  }
  return out;
}

async function loadPlans(root) {
  const ctx = { window: {} };
  vm.runInNewContext(await readFile(path.join(root, 'data.js'), 'utf8'), ctx, { timeout: 1000 });
  return ((ctx.window.FAIND_DATA || {}).prices || {}).items || [];
}

export async function checkPrices(root, prev, now, get) {
  if (prev && prev.t && now - new Date(prev.t).getTime() < REFRESH_HOURS * 36e5) return prev;
  const plans = await loadPlans(root);
  const results = compare(plans, toText(await get(SOURCE.url, 12000)));
  const names = Object.keys(results);
  const bad = names.filter(n => results[n].ok === false);
  const good = names.filter(n => results[n].ok === true);
  console.log(`💶 prezzi: ${good.length}/${names.length} confermati da ${SOURCE.name}` + (bad.length ? ` — DA VERIFICARE: ${bad.map(n => `${n} (trovato ${results[n].found ?? 'nulla'})`).join(', ')}` : ''));
  if (bad.length) console.log(`::warning title=Prezzi da verificare::${bad.join(', ')} — controlla data.js e i listini ufficiali`);
  return { t: new Date(now).toISOString(), source: SOURCE, results };
}
