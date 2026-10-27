/* Logo in alto a sinistra: dopo il primo minuto di gioco e poi ogni 4 minuti il logo lascia il posto alla faccina di Faindo e alla scritta CLICK HERE, per far capire che il logo porta alla home. */
const FIRST_S = 60, EVERY_S = 240, FACE_MS = 2400, CLICK_MS = 3200;
const brand = document.getElementById('brand'), app = document.getElementById('app');
if (brand && app) {
  const st = document.createElement('style');
  st.textContent = '#brand{position:relative}#brand .fc-face,#brand .fc-click{display:none;position:absolute;left:0;top:50%;transform:translateY(-50%)}'
    + '#brand .fc-face{height:88%;width:auto;image-rendering:pixelated}'
    + '#brand .fc-click{font-family:inherit;font-weight:700;font-size:14px;line-height:1.1;color:#ffd21f;white-space:nowrap;text-shadow:0 1px 0 #000;animation:fcblink .8s steps(2) infinite}'
    + '#brand[data-call="face"] > :not(.fc-face),#brand[data-call="click"] > :not(.fc-click){visibility:hidden}'
    + '#brand[data-call="face"] .fc-face,#brand[data-call="click"] .fc-click{display:block}'
    + '@keyframes fcblink{50%{opacity:.55}}@media (prefers-reduced-motion:reduce){#brand .fc-click{animation:none}}';
  document.head.appendChild(st);
  const face = new Image(); face.className = 'fc-face'; face.alt = ''; face.setAttribute('aria-hidden', 'true');
  face.src = new URL('./sprites/faindo-face.png?v=20261027a', import.meta.url).href;
  const click = document.createElement('span'); click.className = 'fc-click'; click.setAttribute('aria-hidden', 'true'); click.textContent = 'CLICK HERE';
  brand.appendChild(face); brand.appendChild(click);
  let played = 0, next = FIRST_S, busy = false;
  const show = () => {
    busy = true; brand.dataset.call = 'face';
    setTimeout(() => { brand.dataset.call = 'click'; setTimeout(() => { delete brand.dataset.call; busy = false; next += EVERY_S; }, CLICK_MS); }, FACE_MS);
  };
  setInterval(() => {
    if (document.hidden || app.getAttribute('data-state') !== 'running') return;   // conta solo il tempo di gioco vero
    played += 0.25;
    if (!busy && played >= next) show();
  }, 250);
}
