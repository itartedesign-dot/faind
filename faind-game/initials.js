/* =====================================================================
   FAIND GAME — scelta delle tre iniziali in stile arcade (condivisa da News Rush, Signal Maze e Lost Signal)
   ---------------------------------------------------------------------
   Parte da AAA. La lettera attiva ha un trattino che lampeggia sotto: ▲ ▼ (o frecce su e giù) la cambiano, ◀ ▶ (o frecce, tocco sulla
   lettera) cambiano posizione, e scrivendo una lettera si imposta e si passa alla successiva. L'<input> originale del modulo resta nella
   pagina, nascosto, e porta sempre il valore (tre lettere A-Z): validazione e invio al server non cambiano.
   ===================================================================== */
const A = 65, Z = 90;

/** input: l'<input id="nameIn"> del modulo. Ritorna { reset, focus }. */
export function mountInitials(input, signal) {
  const box = document.createElement('div'); box.className = 'g-ini'; box.setAttribute('role', 'group'); box.setAttribute('tabindex', '0');
  box.setAttribute('aria-label', 'Initials: use up and down to change the letter, left and right to move');
  const letters = [A, A, A], slots = []; let at = 0;
  const mk = (cls, txt, label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = txt; b.setAttribute('aria-label', label); b.tabIndex = -1; b.addEventListener('click', (e) => { e.preventDefault(); fn(); }, { signal }); return b; };
  for (let i = 0; i < 3; i++) {
    const col = document.createElement('div'); col.className = 'g-ini__col';
    const ch = document.createElement('button'); ch.type = 'button'; ch.className = 'g-ini__ch'; ch.tabIndex = -1; ch.addEventListener('click', (e) => { e.preventDefault(); at = i; render(); box.focus({ preventScroll: true }); }, { signal });
    const bar = document.createElement('span'); bar.className = 'g-ini__bar';
    col.append(mk('g-ini__arr', '▲', 'Next letter', () => { at = i; bump(1); }), ch, bar, mk('g-ini__arr', '▼', 'Previous letter', () => { at = i; bump(-1); }));
    box.appendChild(col); slots.push({ col, ch });
  }
  input.parentNode.insertBefore(box, input); input.style.display = 'none';
  function render() {
    slots.forEach((s, i) => { s.ch.textContent = String.fromCharCode(letters[i]); s.col.classList.toggle('is-on', i === at); s.ch.setAttribute('aria-label', 'Letter ' + (i + 1) + ': ' + String.fromCharCode(letters[i])); });
    input.value = String.fromCharCode(...letters);
  }
  function bump(d) { letters[at] = letters[at] + d > Z ? A : letters[at] + d < A ? Z : letters[at] + d; render(); }
  box.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (k === 'ArrowUp') bump(1); else if (k === 'ArrowDown') bump(-1);
    else if (k === 'ArrowLeft') { at = Math.max(0, at - 1); render(); } else if (k === 'ArrowRight') { at = Math.min(2, at + 1); render(); }
    else if (k === 'Backspace') { at = Math.max(0, at - 1); render(); }
    else if (/^[a-z]$/i.test(k)) { letters[at] = k.toUpperCase().charCodeAt(0); at = Math.min(2, at + 1); render(); }
    else return;                       // Invio e Tab restano al modulo
    e.preventDefault();
  }, { signal });
  render();
  return {
    reset() { letters[0] = letters[1] = letters[2] = A; at = 0; render(); },
    focus() { try { box.focus({ preventScroll: true }); } catch (e) {} }
  };
}
