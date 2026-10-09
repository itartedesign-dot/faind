/* =====================================================================
   FAIND — nav.js: due aiuti alla navigazione, su tutte le pagine
   ---------------------------------------------------------------------
   • Freccia "torna su": un piccolo riquadro fisso in basso a destra.
     Compare quando si è scesi oltre la prima schermata, sparisce quando
     si torna in cima. Toccandola si torna all'inizio della pagina.
   • Ritorno al punto esatto: i link che riportano alla pagina da cui si
     è arrivati (per esempio "← Tutte le notizie" quando si viene dalla
     home) fanno come il tasto Indietro del browser, che riapre la pagina
     dove la si era lasciata. Se invece si torna alla home da un'altra
     strada, la home ricorda da sé il punto (vedi script.js, "Ritorno").
   Nessuna dipendenza, nessun dato inviato.
   ===================================================================== */
(function () {
  'use strict';
  var LABEL = { it: 'Torna su', en: 'Back to top', fr: 'Haut de page', de: 'Nach oben' };
  var lang = (document.documentElement.lang || 'it').slice(0, 2);

  /* ------------------------------ Freccia "torna su" ------------------------------ */
  var css = '.fa-top{position:fixed;right:max(16px,env(safe-area-inset-right,0px));z-index:44;width:40px;height:40px;' +
    'display:grid;place-items:center;border:1px solid var(--rule,#DCE3ED);border-radius:12px;background:var(--surface,#fff);color:var(--ink,#15213A);' +
    'box-shadow:0 4px 14px rgba(14,18,34,.14);cursor:pointer;opacity:0;transform:translateY(8px);pointer-events:none;' +
    'transition:opacity .2s ease,transform .2s ease,bottom .2s ease}' +
    '.fa-top.is-on{opacity:.9;transform:none;pointer-events:auto}.fa-top:hover{opacity:1;border-color:var(--link,#1668B5)}' +
    '.fa-top svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}' +
    '@media print{.fa-top{display:none}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fa-top';
  btn.setAttribute('aria-label', LABEL[lang] || LABEL.it);
  btn.title = LABEL[lang] || LABEL.it;
  btn.tabIndex = -1;
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    btn.blur();
  });

  // In home la barra "Live" e il suo pulsante stanno in basso: la freccia si alza per non coprirli
  function shown(el) { return !!el && !el.hidden && getComputedStyle(el).display !== 'none'; }
  var ticking = false;
  function update() {
    ticking = false;
    var on = window.scrollY > window.innerHeight;
    btn.classList.toggle('is-on', on);
    btn.tabIndex = on ? 0 : -1;
    var bottom = 16;
    if (shown(document.getElementById('bticker'))) bottom += 44;
    if (shown(document.getElementById('tickerOpen'))) bottom += 48;
    btn.style.bottom = 'calc(' + bottom + 'px + env(safe-area-inset-bottom, 0px))';
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('click', function () { setTimeout(update, 50); });   // la barra "Live" si chiude e si riapre
  update();

  /* ------------------------------ Ritorno al punto esatto ------------------------------ */
  if (document.getElementById('lead')) return;   // in home non serve: è lei la pagina a cui si torna

  function clean(u) {
    try { var x = new URL(u, location.href); x.hash = ''; return x.href.replace(/index\.html$/, ''); } catch (e) { return ''; }
  }
  var brand = document.querySelector('a.brand');
  var home = clean(brand ? brand.getAttribute('href') : '/');
  var from = document.referrer && document.referrer.indexOf(location.origin) === 0 ? clean(document.referrer) : '';

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var to = clean(a.getAttribute('href'));
    if (!to || to.indexOf(location.origin) !== 0) return;
    if (from && to === from && history.length > 1) {
      // Si torna alla pagina di prima: come il tasto Indietro, che la riapre nel punto in cui la si era lasciata
      e.preventDefault();
      history.back();
      return;
    }
    if (to === home) {
      // Si torna alla home da un'altra strada: la home ritrova da sé il punto in cui la si era lasciata
      try { sessionStorage.setItem('faind-restore', '1'); } catch (err) {}
    }
  });
})();
