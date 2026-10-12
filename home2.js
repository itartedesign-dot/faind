/* =====================================================================
   FAIND — home2.js: la home a icone (versione di prova)
   ---------------------------------------------------------------------
   Si attiva solo con faind.org/?home=nuova (la scelta resta ricordata
   sul dispositivo); faind.org/?home=classica riporta la home di sempre.
   • Sotto la presentazione, una fila di icone: ognuna apre la sua sezione
     in un pannello, al posto delle notizie, nello stesso spazio della home.
   • I pannelli non copiano nulla: spostano dentro di sé i riquadri che già
     esistono nella pagina e alla chiusura li rimettono al loro posto, così
     anteprime e sezioni complete restano sempre gli stessi dati.
   • Sotto restano sempre le anteprime: Strano ma vero, Approfondimenti,
     newsletter, fonti, presentazione di FAIND e i richiami a donazione,
     contatti e RSS.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('home2') || !document.getElementById('lead')) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var L = {
    it: { intro: "Le notizie sull'intelligenza artificiale, aggiornate ogni ora da fonti italiane e internazionali. E poi video, glossario, approfondimenti e curiosità.",
      nav: 'Le sezioni di FAIND', close: 'Chiudi', all: 'Tutte le notizie', empty: 'Al momento non ci sono contenuti in questa sezione.',
      notizie: 'Notizie', video: 'Video', impara: "Impara l'AI", curiosita: 'Curiosità', prezzi: 'Prezzi', lavoro: 'Lavoro', strumenti: 'Strumenti', telegram: 'Telegram',
      contatti: 'Contatti', sostieni: 'Sostieni FAIND', feed: 'Feed RSS', change: 'Cambia sezione', smvAll: 'Tutte le curiosità', source: 'Fonte', more: 'Leggi tutto', less: 'Mostra meno', gloss: 'Glossario →',
      t_notizie: 'Tutte le notizie', t_video: "L'AI in video", t_impara: "Impara l'AI", t_curiosita: 'Curiosità', t_prezzi: 'Prezzi e offerte', t_lavoro: "Lavoro nell'AI", t_strumenti: 'Strumenti e guide', t_telegram: 'FAIND su Telegram', t_contatti: 'Scrivici', t_sostieni: 'Sostieni FAIND', t_feed: 'Feed RSS' },
    en: { intro: 'Artificial intelligence news, updated every hour from Italian and international sources. Plus videos, a glossary, in-depth articles and fun facts.',
      nav: 'FAIND sections', close: 'Close', all: 'All news', empty: 'Nothing in this section right now.',
      notizie: 'News', video: 'Video', impara: 'Learn AI', curiosita: 'Fun facts', prezzi: 'Prices', lavoro: 'Jobs', strumenti: 'Tools', telegram: 'Telegram',
      contatti: 'Contact', sostieni: 'Support FAIND', feed: 'RSS feeds', change: 'Change section', smvAll: 'All the fun facts', source: 'Source', more: 'Read more', less: 'Show less', gloss: 'Glossary →',
      t_notizie: 'All news', t_video: 'AI on video', t_impara: 'Learn AI', t_curiosita: 'Fun facts', t_prezzi: 'Prices and deals', t_lavoro: 'AI jobs', t_strumenti: 'Tools and guides', t_telegram: 'FAIND on Telegram', t_contatti: 'Contact us', t_sostieni: 'Support FAIND', t_feed: 'RSS feeds' },
    fr: { intro: "L'actualité de l'intelligence artificielle, mise à jour chaque heure à partir de sources italiennes et internationales. Et aussi des vidéos, un glossaire, des dossiers et des curiosités.",
      nav: 'Les rubriques de FAIND', close: 'Fermer', all: 'Toutes les actus', empty: 'Rien dans cette rubrique pour le moment.',
      notizie: 'Actus', video: 'Vidéo', impara: "Apprendre l'IA", curiosita: 'Curiosités', prezzi: 'Prix', lavoro: 'Emploi', strumenti: 'Outils', telegram: 'Telegram',
      contatti: 'Contact', sostieni: 'Soutenir FAIND', feed: 'Flux RSS', change: 'Changer de rubrique', smvAll: 'Toutes les curiosités', source: 'Source', more: 'Lire la suite', less: 'Réduire', gloss: 'Glossaire →',
      t_notizie: 'Toutes les actus', t_video: "L'IA en vidéo", t_impara: "Apprendre l'IA", t_curiosita: 'Curiosités', t_prezzi: 'Prix et offres', t_lavoro: "Emplois dans l'IA", t_strumenti: 'Outils et guides', t_telegram: 'FAIND sur Telegram', t_contatti: 'Écrivez-nous', t_sostieni: 'Soutenir FAIND', t_feed: 'Flux RSS' },
    de: { intro: 'Nachrichten über künstliche Intelligenz, stündlich aktualisiert aus italienischen und internationalen Quellen. Dazu Videos, ein Glossar, Hintergründe und Kurioses.',
      nav: 'Die Bereiche von FAIND', close: 'Schließen', all: 'Alle Nachrichten', empty: 'In diesem Bereich gibt es gerade nichts.',
      notizie: 'News', video: 'Video', impara: 'KI lernen', curiosita: 'Kurioses', prezzi: 'Preise', lavoro: 'Jobs', strumenti: 'Tools', telegram: 'Telegram',
      contatti: 'Kontakt', sostieni: 'FAIND unterstützen', feed: 'RSS-Feeds', change: 'Bereich wechseln', smvAll: 'Alle Kuriositäten', source: 'Quelle', more: 'Weiterlesen', less: 'Weniger', gloss: 'Glossar →',
      t_notizie: 'Alle Nachrichten', t_video: 'KI im Video', t_impara: 'KI lernen', t_curiosita: 'Kurioses', t_prezzi: 'Preise und Angebote', t_lavoro: 'KI-Jobs', t_strumenti: 'Tools und Anleitungen', t_telegram: 'FAIND auf Telegram', t_contatti: 'Schreib uns', t_sostieni: 'FAIND unterstützen', t_feed: 'RSS-Feeds' }
  };
  function t(k) { var l = (root.lang || 'it').slice(0, 2); return (L[l] && L[l][k]) || L.it[k] || k; }

  // Le sezioni: le prime otto hanno un'icona, le altre si aprono dai richiami e dai link del menu
  var PANELS = [
    { k: 'notizie', ids: ['importanti', 'letture', 'focus'], icon: true },
    { k: 'video', ids: ['video'], icon: true },
    { k: 'impara', ids: ['approfondimenti'], icon: true },
    { k: 'curiosita', ids: ['h2smv'], icon: true },
    { k: 'prezzi', ids: ['prezzi', 'convenzioni'], icon: true },
    { k: 'lavoro', ids: ['job'], icon: true },
    { k: 'strumenti', ids: ['guide', 'trending'], icon: true },   // prima gli strumenti da usare, poi le notizie
    { k: 'telegram', ids: ['telegram'], icon: true },
    { k: 'contatti', ids: ['contatti'] },
    { k: 'sostieni', ids: ['sostieni'] },
    { k: 'feed', ids: ['feed'] }
  ];
  var byKey = {}, alias = {};
  PANELS.forEach(function (p) { byKey[p.k] = p; alias[p.k] = p.k; p.ids.forEach(function (id) { alias[id] = p.k; }); });

  /* ------------------------------ Costruzione ------------------------------ */
  var support = $('.panel--support'); if (support) support.id = 'sostieni';

  var intro = $('.intro'), h1 = $('.intro__title');
  if (h1) h1.removeAttribute('data-i18n');          // il testo lo scrive questo file, in tutte le lingue

  var apps = document.createElement('nav');
  apps.className = 'h2apps';
  apps.innerHTML = PANELS.filter(function (p) { return p.icon; }).map(function (p) {
    return '<button type="button" class="h2app" data-panel="' + p.k + '" aria-pressed="false" aria-controls="h2panel">' +
      '<span class="h2app__tile"><img src="assets/icone/' + p.k + '.webp" width="256" height="256" alt="" decoding="async"></span>' +
      '<span class="h2app__lbl" data-h2="' + p.k + '"></span></button>';
  }).join('');
  intro.parentNode.insertBefore(apps, intro.nextSibling);

  // Lo spazio che cambia: le notizie oppure il pannello della sezione scelta
  var stage = document.createElement('div'); stage.className = 'h2stage'; stage.id = 'h2stage';
  var news = document.createElement('div'); news.className = 'h2news';
  apps.parentNode.insertBefore(stage, apps.nextSibling);
  stage.appendChild(news);
  [$('.sectors'), $('#homeView'), $('#results')].forEach(function (n) { if (n) news.appendChild(n); });
  var allBtn = document.createElement('button');
  allBtn.type = 'button'; allBtn.className = 'btn btn--ghost h2all'; allBtn.setAttribute('data-panel', 'notizie');
  allBtn.innerHTML = '<span data-h2="all"></span>';
  news.appendChild(allBtn);

  var panel = document.createElement('section');
  panel.className = 'h2panel'; panel.id = 'h2panel'; panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'h2panelTitle');
  panel.innerHTML = '<div class="h2panel__head"><h2 class="h2panel__title" id="h2panelTitle" tabindex="-1"></h2>' +
    '<button type="button" class="h2panel__change" data-h2-aria="change"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg><span data-h2="change"></span></button>' +
    '<button type="button" class="h2panel__x" data-h2-aria="close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
    '<div class="h2panel__body"></div>';
  stage.appendChild(panel);
  var body = $('.h2panel__body', panel), ptitle = $('#h2panelTitle'), xBtn = $('.h2panel__x', panel), changeBtn = $('.h2panel__change', panel);

  // Curiosità: le storie dell'ultima edizione di Strano ma vero (strano-ma-vero/ultime.json, scritto da scripts/strano.mjs)
  var smvList = document.createElement('section'); smvList.id = 'h2smv'; smvList.className = 'h2smv';
  var smvData = null;
  function drawSmv() {
    var l = (root.lang || 'it').slice(0, 2), d = smvData && (smvData[l] || smvData.it);
    var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var fallback = $('#strano-ma-vero .btn');
    var allHref = d ? d.url : (fallback ? fallback.getAttribute('href') : 'strano-ma-vero/');
    smvList.innerHTML = (d ? '<ol class="h2smv__list">' + d.items.slice(0, 3).map(function (it) {
      return '<li class="h2smv__item"><h3 class="h2smv__h"><a href="' + esc(it.url) + '">' + esc(it.h) + '</a></h3>' +
        '<p class="h2smv__p">' + esc(it.p) + '</p><p class="h2smv__src">' + esc(t('source')) + ': <strong>' + esc(it.src) + '</strong></p></li>';
    }).join('') + '</ol>' : '') +
      '<a class="btn btn--primary h2smv__all" href="' + esc(allHref) + '">' + esc(t('smvAll')) + ' →</a>';
  }
  drawSmv();
  if (window.fetch) fetch('strano-ma-vero/ultime.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { if (j) { smvData = j; drawSmv(); } }).catch(function () {});

  // Sotto il pannello: le anteprime che restano sempre (sul computer curiosità e newsletter stanno nella colonna)
  var more = document.createElement('div'); more.className = 'h2more';
  stage.parentNode.insertBefore(more, stage.nextSibling);
  var deep = $('#approfondimenti');
  if (deep) {
    more.appendChild(deep);
    var head = $('.block__head', deep);
    if (head && !$('.h2gloss', head)) {
      var g = document.createElement('a'); g.className = 'deep__all h2gloss'; g.href = 'glossario/'; g.setAttribute('data-h2', 'gloss');
      var all = $('.deep__all', head); if (all) all.parentNode.insertBefore(g, all.nextSibling); else head.appendChild(g);
    }
  }

  // Le sezioni che non sono in vista finché non si aprono: restano nella pagina, nascoste
  var store = document.createElement('div'); store.id = 'h2store'; store.hidden = true;
  $('main').appendChild(store);
  store.appendChild(smvList);
  ['importanti', 'letture', 'focus', 'video', 'trending', 'job', 'guide', 'telegram', 'prezzi', 'convenzioni', 'feed', 'sostieni', 'contatti']
    .forEach(function (id) { var n = document.getElementById(id); if (n) store.appendChild(n); });

  // Telefono: curiosità e newsletter scendono tra le anteprime, nell'ordine Strano ma vero → Approfondimenti → newsletter
  var side = $('.side'), smv = $('#strano-ma-vero'), nl = $('#newsletter'), pop = $('#nlPop');
  // Da computer la newsletter è il riquadro di Faindo, fisso nella colonna; sul telefono resta il popup (Paolo, 12 ottobre 2026)
  var popHome = pop ? pop.parentNode : null, popNext = pop ? pop.nextSibling : null;
  function placePop(desktop) {
    if (!pop || !side) return;
    if (desktop) {
      if (!pop.classList.contains('nlpop--fixed')) {
        pop.classList.remove('is-in', 'is-out', 'is-drag'); pop.classList.add('nlpop--fixed');
        pop.setAttribute('role', 'region');
      }
      if (nl && nl.parentNode !== store) store.appendChild(nl);
      if (pop.parentNode !== side || side.firstElementChild !== pop) side.insertBefore(pop, side.firstChild);
      pop.hidden = false;
      var r = {}; try { r = JSON.parse(localStorage.getItem('faind-nlpop') || '{}') || {}; } catch (e) {}
      if (r.done) {   // già iscritto: Faindo ringrazia invece di chiedere di nuovo
        var f = $('#nlPopForm'), d = $('#nlPopDone'), img = $('#nlPopImg');
        if (f) f.hidden = true; if (d) d.hidden = false; if (img && img.dataset.okSrc) img.src = img.dataset.okSrc;
      }
    } else if (pop.classList.contains('nlpop--fixed')) {
      pop.classList.remove('nlpop--fixed'); pop.setAttribute('role', 'dialog'); pop.hidden = true;
      popHome.insertBefore(pop, popNext && popNext.parentNode === popHome ? popNext : null);
    }
  }
  var mq = window.matchMedia ? matchMedia('(max-width: 720px)') : { matches: false };
  function place() {
    var inPanel = function (n) { return n && panel.contains(n); };
    if (mq.matches) {
      placePop(false);
      if (smv && !inPanel(smv)) more.insertBefore(smv, more.firstChild);
      if (nl) more.appendChild(nl);
    } else {
      placePop(true);
      if (smv && !inPanel(smv)) side.insertBefore(smv, pop ? pop.nextSibling : side.firstChild);
    }
    if (deep && !inPanel(deep) && deep.parentNode !== more) more.insertBefore(deep, mq.matches && smv && smv.parentNode === more ? smv.nextSibling : more.firstChild);
  }
  if (mq.addEventListener) mq.addEventListener('change', place); else if (mq.addListener) mq.addListener(place);

  // Fonti prima della presentazione; presentazione breve con "Leggi tutto" e i richiami
  var about = $('#chi-siamo'), sources = $('.sources');
  if (about && sources) about.parentNode.insertBefore(sources, about);
  if (about) {
    about.classList.add('h2short');
    $$('[data-about]', about).forEach(function (b) {
      var lede = $('.about__lede', b); if (!lede) return;
      var row = document.createElement('div'); row.className = 'h2links';
      row.innerHTML = '<a class="h2link" href="#sostieni" data-h2="sostieni"></a><a class="h2link" href="#contatti" data-h2="contatti"></a>' +
        '<a class="h2link" href="#feed" data-h2="feed"></a><button type="button" class="h2link h2link--more" aria-expanded="false" data-h2="more"></button>';
      lede.parentNode.insertBefore(row, lede.nextSibling);
    });
    about.addEventListener('click', function (e) {
      var b = e.target.closest('.h2link--more'); if (!b) return;
      var open = about.classList.toggle('h2short') === false;
      $$('.h2link--more', about).forEach(function (x) { x.setAttribute('aria-expanded', String(open)); x.setAttribute('data-h2', open ? 'less' : 'more'); });
      label();
    });
  }

  /* ------------------------------ Testi nella lingua scelta ------------------------------ */
  function label() {
    if (h1) h1.textContent = t('intro');
    apps.setAttribute('aria-label', t('nav'));
    $$('[data-h2]').forEach(function (el) { el.textContent = t(el.getAttribute('data-h2')); });
    $$('[data-h2-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-h2-aria'))); });
    if (current) ptitle.textContent = t('t_' + current);
    drawSmv();
  }
  if (window.MutationObserver) new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['lang'] });

  /* ------------------------------ Apertura e chiusura ------------------------------ */
  var current = null, opener = null, savedY = 0, pushed = false, moved = [];

  function headerH() { var m = $('.masthead'); return m ? m.getBoundingClientRect().height : 64; }
  function giveBack() {
    moved.forEach(function (n) { var ph = n._h2ph; if (ph && ph.parentNode) { ph.parentNode.replaceChild(n, ph); } n._h2ph = null; });
    moved = [];
  }
  function pressed() {
    $$('.h2app').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-panel') === current)); });
  }
  function play(el) {
    if (reduce) return;
    el.classList.remove('h2-in'); void el.offsetWidth; el.classList.add('h2-in');
  }
  function bringIntoView() {
    // porta la fila di icone appena sotto l'intestazione, solo se la si è superata
    var top = apps.getBoundingClientRect().top + window.scrollY - headerH() - 8;
    if (window.scrollY > top + 4 || apps.getBoundingClientRect().top > window.innerHeight * .6) {
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  function open(k, from, fromHistory) {
    var p = byKey[k]; if (!p) return;
    if (current === k) { bringIntoView(); return; }
    var switching = !!current;
    if (!switching) { savedY = window.scrollY; opener = from || null; }
    giveBack();
    var shown = 0;
    p.ids.forEach(function (id) {
      var n = document.getElementById(id); if (!n) return;
      var ph = document.createComment('h2 ' + id);
      n.parentNode.insertBefore(ph, n); n._h2ph = ph;
      body.appendChild(n); moved.push(n);
      if (!n.hidden) shown++;
    });
    var empty = $('.h2empty', panel); if (empty) empty.remove();
    if (!shown) { empty = document.createElement('p'); empty.className = 'h2empty'; empty.textContent = t('empty'); body.appendChild(empty); }
    current = k;
    ptitle.textContent = t('t_' + k);
    panel.className = 'h2panel h2panel--' + k;
    news.hidden = true; panel.hidden = false;
    root.classList.add('h2-open');
    pressed(); place(); play(panel);
    if (!fromHistory) {
      if (switching || pushed) history.replaceState({ h2: k }, '', '#' + k);   // cambiando sezione non si allunga la cronologia
      else { history.pushState({ h2: k }, '', '#' + k); pushed = true; }
    }
    bringIntoView();
    try { ptitle.focus({ preventScroll: true }); } catch (e) { ptitle.focus(); }
  }

  function close(fromHistory) {
    if (!current) return;
    giveBack();
    current = null;
    panel.hidden = true; news.hidden = false;
    root.classList.remove('h2-open');
    pressed(); place(); play(news);
    if (!fromHistory) {
      if (pushed) { pushed = false; history.back(); }
      else history.replaceState(null, '', location.pathname + location.search);
    } else pushed = false;
    // si torna alla fila di icone e all'inizio delle notizie (o resta più in alto, se si era lì)
    var root2 = document.documentElement, prev = root2.style.scrollBehavior;
    root2.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, Math.min(savedY, apps.getBoundingClientRect().top + window.scrollY - headerH() - 8)));
    root2.style.scrollBehavior = prev;
    if (opener && document.body.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    opener = null;
  }

  apps.addEventListener('click', function (e) {
    var b = e.target.closest('.h2app'); if (!b) return;
    var k = b.getAttribute('data-panel');
    if (current === k) close(); else open(k, b);
  });
  allBtn.addEventListener('click', function () { open('notizie', allBtn); });
  xBtn.addEventListener('click', function () { close(); });
  // "Cambia sezione" compare solo quando la fila di icone è uscita dallo schermo
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { panel.classList.toggle('h2-apps-away', !en[0].isIntersecting); },
      { rootMargin: '-' + Math.round(headerH()) + 'px 0px 0px 0px' }).observe(apps);
  } else panel.classList.add('h2-apps-away');
  changeBtn.addEventListener('click', function () {
    var top = apps.getBoundingClientRect().top + window.scrollY - headerH() - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    var b = $('.h2app[aria-pressed="true"]') || $('.h2app'); if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current && !$('#appSheet:not([hidden])') && !$('#drawer:not([hidden])')) close(); });

  // I link interni (menu, piè di pagina, richiami) aprono il pannello giusto invece di scorrere la pagina
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var k = alias[a.getAttribute('href').slice(1)]; if (!k) return;
    e.preventDefault();
    var d = $('#drawer'); if (d && !d.hidden) { var mc = $('#menuClose'); if (mc) mc.click(); }
    open(k, a);
  }, true);

  window.addEventListener('popstate', function () {
    var k = history.state && history.state.h2;
    if (k && byKey[k]) open(k, null, true); else close(true);
  });

  /* ------------------------------ Avvio ------------------------------ */
  place();
  label();
  var start = alias[(location.hash || '').slice(1)];
  if (start) { history.replaceState({ h2: start }, '', location.href); open(start, null, true); }
})();
