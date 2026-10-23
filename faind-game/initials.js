/* =====================================================================
   FAIND GAME — inserimento delle tre iniziali in stile arcade (condiviso da News Rush, Signal Maze e Lost Signal)
   ---------------------------------------------------------------------
   Si scrive con la tastiera (su telefono tocca la zona delle lettere e compare la tastiera). Gli spazi ancora vuoti mostrano un trattino
   "_" e una "A" che scorre da sinistra a destra sugli spazi vuoti (A _ _ → _ A _ → _ _ A, in loop) finché non si scrive; ogni lettera
   scritta occupa lo spazio successivo. L'<input id="nameIn"> originale del modulo resta quello che porta il valore: è steso sopra le
   lettere, trasparente, così riceve tocchi e tasti; validazione e invio al server non cambiano.
   ===================================================================== */
const STEP_MS = 380;

/** input: l'<input id="nameIn"> del modulo. Ritorna { reset, focus }. */
export function mountInitials(input, signal) {
  const box = document.createElement('div'); box.className = 'g-ini';
  const slots = [0, 1, 2].map(() => { const s = document.createElement('span'); s.className = 'g-ini__ch'; s.setAttribute('aria-hidden', 'true'); box.appendChild(s); return s; });
  input.parentNode.insertBefore(box, input); box.appendChild(input);
  input.classList.add('g-ini__in'); input.removeAttribute('pattern'); input.removeAttribute('placeholder'); input.setAttribute('maxlength', '3');
  input.setAttribute('aria-label', 'Initials, three letters');
  const calm = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let tick = 0;
  function render() {
    const v = input.value, n = v.length, empty = 3 - n, hot = empty ? tick % (empty === 1 ? 2 : empty) : -1;      // con un solo spazio vuoto la A lampeggia
    slots.forEach((s, i) => {
      s.textContent = i < n ? v[i] : (i - n === hot && !calm ? 'A' : '_');
      s.classList.toggle('is-typed', i < n); s.classList.toggle('is-next', i === n);
    });
  }
  input.addEventListener('input', () => { input.value = input.value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 3); tick = 0; render(); }, { signal });
  const timer = setInterval(() => { if (box.offsetParent !== null && input.value.length < 3) { tick++; render(); } }, STEP_MS);
  if (signal) signal.addEventListener('abort', () => clearInterval(timer), { once: true });
  render();
  return {
    reset() { input.value = ''; tick = 0; render(); },
    focus() { try { input.focus({ preventScroll: true }); } catch (e) {} }
  };
}
