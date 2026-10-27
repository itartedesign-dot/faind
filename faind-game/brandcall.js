/* Logo in alto a sinistra: dopo il primo minuto di gioco e poi ogni 4 minuti il logo lascia il posto alla faccina di Faindo e alla scritta CLICK HERE, per far capire che il logo porta alla home. */
const FIRST_S = 60, EVERY_S = 240, FACE_MS = 2400, CLICK_MS = 3200;
const brand = document.getElementById('brand'), app = document.getElementById('app');
if (brand && app) {
  const st = document.createElement('style');
  st.textContent = '#brand{position:relative}'
    + '#brand .fc-box,#brand .fc-face,#brand .fc-click{display:none;position:absolute}'
    + '#brand .fc-box{inset:0;border:2px solid #39ff14;background:rgba(6,16,10,.92);box-shadow:0 0 8px #39ff14,inset 0 0 6px rgba(57,255,20,.45);box-sizing:border-box}'
    + '#brand .fc-dot{position:absolute;left:0;top:0;width:4px;height:4px;margin:-3px 0 0 -3px;background:#eaffe0;box-shadow:0 0 6px 2px #fff;offset-path:inset(0);offset-rotate:0deg;animation:fcrun 3.2s linear infinite}'
    + '#brand .fc-face{left:50%;top:50%;height:78%;width:auto;transform:translate(-50%,-50%);image-rendering:pixelated;animation:fcblink .8s steps(1) 3}'
    + '#brand .fc-click{left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-family:inherit;font-weight:700;font-size:13px;line-height:1.25;color:#ffd21f;text-shadow:0 1px 0 #000;animation:fcblink 1.07s steps(1) 3}'
    + '#brand[data-call="face"] > :not(.fc-face):not(.fc-box),#brand[data-call="click"] > :not(.fc-click):not(.fc-box){visibility:hidden}'
    + '#brand[data-call] .fc-box,#brand[data-call="face"] .fc-face,#brand[data-call="click"] .fc-click{display:block}'
    + '@keyframes fcblink{0%{opacity:1}50%{opacity:0}}@keyframes fcrun{to{offset-distance:100%}}'
    + '@media (prefers-reduced-motion:reduce){#brand .fc-dot,#brand .fc-face,#brand .fc-click{animation:none}}';
  document.head.appendChild(st);
  const face = new Image(); face.className = 'fc-face'; face.alt = ''; face.setAttribute('aria-hidden', 'true');
  face.src = new URL('./sprites/faindo-face.png?v=20261027a', import.meta.url).href;
  const click = document.createElement('span'); click.className = 'fc-click'; click.setAttribute('aria-hidden', 'true'); click.appendChild(document.createTextNode('CLICK')); click.appendChild(document.createElement('br')); click.appendChild(document.createTextNode('HERE'));
  const box = document.createElement('i'); box.className = 'fc-box'; box.setAttribute('aria-hidden', 'true'); const dot = document.createElement('i'); dot.className = 'fc-dot'; box.appendChild(dot);
  brand.appendChild(box); brand.appendChild(face); brand.appendChild(click);
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
