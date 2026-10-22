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
      notizie: 'Notizie', video: 'Video', impara: "Impara l'AI", curiosita: 'Curiosità', prezzi: 'Prezzi', lavoro: 'Lavoro', strumenti: 'Strumenti', telegram: 'Telegram', uomoai: 'Uomo e AI', gioca: 'Faind Game',
      contatti: 'Contatti', sostieni: 'Sostieni FAIND', feed: 'Feed RSS', change: 'Cambia sezione', smvAll: 'Tutte le curiosità', source: 'Fonte', more: 'Leggi tutto', less: 'Mostra meno', gloss: 'Glossario →',
      t_notizie: 'Tutte le notizie', t_video: "L'AI in video", t_impara: "Impara l'AI", t_curiosita: 'Curiosità', t_prezzi: 'Prezzi e offerte', t_lavoro: "Lavoro nell'AI", t_strumenti: 'Strumenti e guide', t_uomoai: 'Uomo e AI', t_telegram: 'FAIND su Telegram', t_contatti: 'Scrivici', t_sostieni: 'Sostieni FAIND', t_feed: 'Feed RSS' },
    en: { intro: 'Artificial intelligence news, updated every hour from Italian and international sources. Plus videos, a glossary, in-depth articles and fun facts.',
      nav: 'FAIND sections', close: 'Close', all: 'All news', empty: 'Nothing in this section right now.',
      notizie: 'News', video: 'Video', impara: 'Learn AI', curiosita: 'Fun facts', prezzi: 'Prices', lavoro: 'Jobs', strumenti: 'Tools', telegram: 'Telegram', uomoai: 'Humans and AI', gioca: 'Faind Game',
      contatti: 'Contact', sostieni: 'Support FAIND', feed: 'RSS feeds', change: 'Change section', smvAll: 'All the fun facts', source: 'Source', more: 'Read more', less: 'Show less', gloss: 'Glossary →',
      t_notizie: 'All news', t_video: 'AI on video', t_impara: 'Learn AI', t_curiosita: 'Fun facts', t_prezzi: 'Prices and deals', t_lavoro: 'AI jobs', t_strumenti: 'Tools and guides', t_uomoai: 'Humans and AI', t_telegram: 'FAIND on Telegram', t_contatti: 'Contact us', t_sostieni: 'Support FAIND', t_feed: 'RSS feeds' },
    fr: { intro: "L'actualité de l'intelligence artificielle, mise à jour chaque heure à partir de sources italiennes et internationales. Et aussi des vidéos, un glossaire, des dossiers et des curiosités.",
      nav: 'Les rubriques de FAIND', close: 'Fermer', all: 'Toutes les actus', empty: 'Rien dans cette rubrique pour le moment.',
      notizie: 'Actus', video: 'Vidéo', impara: "Apprendre l'IA", curiosita: 'Curiosités', prezzi: 'Prix', lavoro: 'Emploi', strumenti: 'Outils', telegram: 'Telegram', uomoai: "L'humain et l'IA", gioca: 'Faind Game',
      contatti: 'Contact', sostieni: 'Soutenir FAIND', feed: 'Flux RSS', change: 'Changer de rubrique', smvAll: 'Toutes les curiosités', source: 'Source', more: 'Lire la suite', less: 'Réduire', gloss: 'Glossaire →',
      t_notizie: 'Toutes les actus', t_video: "L'IA en vidéo", t_impara: "Apprendre l'IA", t_curiosita: 'Curiosités', t_prezzi: 'Prix et offres', t_lavoro: "Emplois dans l'IA", t_strumenti: 'Outils et guides', t_uomoai: "L'humain et l'IA", t_telegram: 'FAIND sur Telegram', t_contatti: 'Écrivez-nous', t_sostieni: 'Soutenir FAIND', t_feed: 'Flux RSS' },
    de: { intro: 'Nachrichten über künstliche Intelligenz, stündlich aktualisiert aus italienischen und internationalen Quellen. Dazu Videos, ein Glossar, Hintergründe und Kurioses.',
      nav: 'Die Bereiche von FAIND', close: 'Schließen', all: 'Alle Nachrichten', empty: 'In diesem Bereich gibt es gerade nichts.',
      notizie: 'News', video: 'Video', impara: 'KI lernen', curiosita: 'Kurioses', prezzi: 'Preise', lavoro: 'Jobs', strumenti: 'Tools', telegram: 'Telegram', uomoai: 'Mensch und KI', gioca: 'Faind Game',
      contatti: 'Kontakt', sostieni: 'FAIND unterstützen', feed: 'RSS-Feeds', change: 'Bereich wechseln', smvAll: 'Alle Kuriositäten', source: 'Quelle', more: 'Weiterlesen', less: 'Weniger', gloss: 'Glossar →',
      t_notizie: 'Alle Nachrichten', t_video: 'KI im Video', t_impara: 'KI lernen', t_curiosita: 'Kurioses', t_prezzi: 'Preise und Angebote', t_lavoro: 'KI-Jobs', t_strumenti: 'Tools und Anleitungen', t_uomoai: 'Mensch und KI', t_telegram: 'FAIND auf Telegram', t_contatti: 'Schreib uns', t_sostieni: 'FAIND unterstützen', t_feed: 'RSS-Feeds' }
  };
  function t(k) { var l = (root.lang || 'it').slice(0, 2); return (L[l] && L[l][k]) || L.it[k] || k; }

  // Le sezioni: le prime otto hanno un'icona, le altre si aprono dai richiami e dai link del menu
  var PANELS = [
    { k: 'notizie', ids: ['h2front', 'importanti', 'letture'], icon: true },   // si apre su Apertura + Appena uscite (Paolo, 12 ottobre 2026)
    { k: 'video', ids: ['video'], icon: true },
    { k: 'impara', ids: ['approfondimenti'], icon: true },
    { k: 'curiosita', ids: ['strano-ma-vero', 'h2smv'], icon: true },   // in testa il blocco di Strano ma vero, poi la lista (Paolo, 12 ottobre 2026)
    { k: 'prezzi', ids: ['prezzi', 'convenzioni'], icon: true },
    { k: 'lavoro', ids: ['job'], icon: true },
    { k: 'strumenti', ids: ['trending', 'guide'], icon: true },   // prima i trending tool, poi gli strumenti da scaricare (Paolo, 12 ottobre 2026)
    { k: 'uomoai', ids: ['focus'], icon: true },   // l'ex sezione Focus: robot, casa, medicina, lavoro e clima
    { k: 'telegram', ids: ['telegram'], icon: true },
    { k: 'gioca', ids: [], icon: true, link: 'games/' },   // non apre un pannello: porta alla pagina Faind Game (elenco dei giochi: News Rush e Signal Maze)
    { k: 'contatti', ids: ['contatti'] },
    { k: 'sostieni', ids: ['sostieni'] },
    { k: 'feed', ids: ['feed'] }
  ];
  var byKey = {}, alias = {};
  PANELS.forEach(function (p) { if (p.link) return; byKey[p.k] = p; alias[p.k] = p.k; p.ids.forEach(function (id) { alias[id] = p.k; }); });

  /* ------------------------------ Fila di icone in loop ------------------------------
     La fila sta ferma e gira solo quando la si rolla (col dito, trascinando col mouse o col trackpad),
     in loop continuo senza inizio né fine: le icone sono ripetute tre volte e la posizione ricomincia
     da capo a ogni giro. Su telefono e tablet ogni icona che passa dà un piccolo colpo di vibrazione,
     come i selettori di data (Paolo, 12 ottobre 2026). */
  function roll(nav) {
    var orig = $$('.h2app', nav), n = orig.length; if (!n) return;
    var track = document.createElement('div'); track.className = 'h2apps__track';
    for (var c = 0; c < 3; c++) orig.forEach(function (b) {
      var x = c === 1 ? b : b.cloneNode(true);
      if (c !== 1) { x.setAttribute('tabindex', '-1'); x.setAttribute('aria-hidden', 'true'); x.removeAttribute('aria-controls'); }
      track.appendChild(x);
    });
    nav.appendChild(track);
    nav.classList.add('h2apps--loop');

    var first = true, setW = 0, step = 0, pos = 0, vel = 0, raf = 0, last = 0, tick = null, lastBuzz = 0, touchy = false;
    function measure() {
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      if (matchMedia('(min-width: 721px)').matches) {
        // da tablet e computer le nove icone riempiono la riga come prima: a riposo si vedono tutte, una volta sola
        nav.style.setProperty('--h2w', Math.max(64, (nav.clientWidth - gap * (n - 1)) / n) + 'px');
      } else nav.style.removeProperty('--h2w');
      var k = track.children;
      setW = k[n].offsetLeft - k[0].offsetLeft; step = setW / n;
      if (first && setW) {   // sul telefono la prima icona parte allineata al testo sopra, non attaccata al bordo
        first = false;
        var ref = nav.previousElementSibling;
        if (ref) pos = -Math.max(0, ref.getBoundingClientRect().left - nav.getBoundingClientRect().left);
      }
      draw();
    }
    function draw() {
      if (!setW) return;
      pos = ((pos % setW) + setW) % setW;
      track.style.transform = 'translate3d(' + (-(setW + pos)) + 'px,0,0)';
      var i = Math.floor((pos + step / 2) / step);
      if (tick !== null && i !== tick && touchy) buzz();
      tick = i;
    }
    // Vibrazione: Android usa navigator.vibrate; su iPhone (Safari 18 e successivi) l'unico modo è un interruttore
    // nascosto, che fa il suo piccolo scatto quando lo si tocca
    var sw = null;
    function buzz() {
      var now = Date.now(); if (now - lastBuzz < 35) return; lastBuzz = now;
      if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} return; }
      if (!sw) {
        sw = document.createElement('label'); sw.className = 'h2buzz'; sw.setAttribute('aria-hidden', 'true');
        sw.innerHTML = '<input type="checkbox" switch tabindex="-1">';
        document.body.appendChild(sw);
      }
      sw.click();
    }
    // Slancio come una ruota: dopo il rilascio la fila continua alla velocità del dito e rallenta per attrito
    // (simile allo scorrimento di iPhone) fino a fermarsi dove capita, senza agganci (Paolo, 12 ottobre 2026)
    function glide(t) {
      var dt = last ? Math.min(40, t - last) : 16; last = t;
      pos += vel * dt; vel *= Math.pow(0.9975, dt);
      draw();
      if (Math.abs(vel) > 0.004) raf = requestAnimationFrame(glide);
      else { raf = 0; last = 0; vel = 0; touchy = false; }
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; vel = 0; }

    // Trascinamento: in verticale la pagina scorre come sempre, in orizzontale la fila segue il dito 1:1
    var down = null, dragging = false, moved = false, hist = [], pend = 0;
    nav.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stop();
      down = { x: e.clientX, y: e.clientY, id: e.pointerId, p: pos, touch: e.pointerType !== 'mouse' };
      dragging = false; moved = false; hist = [];
    });
    nav.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 10) down = null; return; }
        dragging = true; moved = true; touchy = down.touch; nav.classList.add('is-rolling');
        down.x = e.clientX; down.p = pos; dx = 0;   // si parte da dove è il dito, senza scatto iniziale
        try { nav.setPointerCapture(e.pointerId); } catch (er) {}
      }
      // tutti i punti toccati (anche quelli raggruppati dal browser) per misurare bene la velocità
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (evs.length ? evs : [e]).forEach(function (c) { hist.push({ x: c.clientX, t: c.timeStamp || e.timeStamp }); });
      var now = e.timeStamp; while (hist.length > 2 && now - hist[0].t > 100) hist.shift();
      pos = down.p - dx;
      if (!pend) pend = requestAnimationFrame(function () { pend = 0; draw(); });
    });
    function up(e) {
      if (!down || (e && e.pointerId !== down.id)) return;
      down = null; nav.classList.remove('is-rolling');
      if (!dragging) return;
      dragging = false;
      if (pend) { cancelAnimationFrame(pend); pend = 0; draw(); }
      // velocità degli ultimi 100 ms; se il dito si era fermato prima di alzarsi, niente slancio
      var t = e && e.timeStamp ? e.timeStamp : performance.now(), b = hist[hist.length - 1], a = hist[0];
      vel = 0;
      if (b && a && t - b.t < 70 && b.t > a.t) vel = -(b.x - a.x) / (b.t - a.t);
      vel = Math.max(-7, Math.min(7, vel));
      if (vel) raf = requestAnimationFrame(glide); else touchy = false;
    }
    nav.addEventListener('pointerup', up);
    nav.addEventListener('pointercancel', up);
    // (la cattura passa dal bottone toccato alla fila: quella perdita non è un rilascio)
    nav.addEventListener('lostpointercapture', function (e) { if (e.target === nav) up(e); });
    // dopo un trascinamento il rilascio non apre la sezione sotto il dito
    nav.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    nav.addEventListener('dragstart', function (e) { e.preventDefault(); });
    // trackpad: lo scorrimento orizzontale gira la fila, quello verticale resta alla pagina
    nav.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); stop(); pos += e.deltaX; draw();
    }, { passive: false });
    // tastiera: l'icona che prende il fuoco entra in vista
    nav.addEventListener('focusin', function (e) {
      var b = e.target.closest('.h2app'); if (!b) return;
      var x = b.offsetLeft - setW - pos, w = b.offsetWidth;
      if (x < 0) pos += x - 4; else if (x + w > nav.clientWidth) pos += x + w - nav.clientWidth + 4;
      nav.scrollLeft = 0; draw();
    });
    window.addEventListener('resize', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(nav);
    measure();
  }

  /* ------------------------------ Costruzione ------------------------------ */
  var support = $('.panel--support'); if (support) support.id = 'sostieni';
  var front = $('#homeView > .front'); if (front && !front.id) front.id = 'h2front';

  var intro = $('.intro'), h1 = $('.intro__title');
  if (h1) h1.removeAttribute('data-i18n');          // il testo lo scrive questo file, in tutte le lingue

  var apps = document.createElement('nav');
  apps.className = 'h2apps';
  apps.innerHTML = PANELS.filter(function (p) { return p.icon; }).map(function (p) {
    var inner = '<span class="h2app__tile"><img src="assets/icone/' + p.k + '.webp?v=3" width="256" height="256" alt="" decoding="async"></span>' +
      '<span class="h2app__lbl" data-h2="' + p.k + '"></span>' +
      (p.sub ? '<span class="h2app__sub">' + p.sub + '</span>' : '');   // seconda riga sotto l'etichetta (Gioca → FAIND GAME), uguale in tutte le lingue
    // le icone-collegamento (Gioca) sono veri link: stessa scheda, aprono anche con tasto centrale o da tastiera
    if (p.link) return '<a class="h2app h2app--link" href="' + p.link + '" data-link="' + p.k + '">' + inner + '</a>';
    return '<button type="button" class="h2app" data-panel="' + p.k + '" aria-pressed="false" aria-controls="h2panel">' + inner + '</button>';
  }).join('');
  intro.parentNode.insertBefore(apps, intro.nextSibling);
  roll(apps);

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
        // titolo per chi è già iscritto: "Newsletter: sei dei nostri!" (Paolo, 12 ottobre 2026)
        var tt = $('#nlPopTitle'), L = { it: 'Newsletter: sei dei nostri!', en: 'Newsletter: you’re one of us!', fr: 'Newsletter : vous êtes des nôtres !', de: 'Newsletter: Du bist dabei!' };
        if (tt && tt.getAttribute('data-i18n') !== 'nlp.in') { tt.setAttribute('data-i18n', 'nlp.member'); tt.textContent = L[document.documentElement.lang] || L.it; }
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
    setTimeout(smvLede, 0);   // dopo che script.js ha scritto il testo nella lingua scelta
  }
  // Curiosità: il testo di Strano ma vero diventa due righe in grassetto, centrate accanto alla foto (Paolo, 12 ottobre 2026)
  function smvLede() {
    var box = $('#strano-ma-vero'), src = box && $(':scope > p', box); if (!src) return;
    var lede = $('.h2smv-lede', box);
    if (!lede) { lede = document.createElement('p'); lede.className = 'h2smv-lede'; src.parentNode.insertBefore(lede, src.nextSibling); }
    var txt = src.textContent.trim(), cut = txt.search(/[.!?]\s/);
    var a = cut > 0 ? txt.slice(0, cut + 1) : txt, b = cut > 0 ? txt.slice(cut + 2) : '';
    lede.textContent = '';
    var m, k = -1, re = /\s(?:e|and|et|und)\s/g; while ((m = re.exec(a))) k = m.index;
    var parts = k > 0 ? [a.slice(0, k), a.slice(k + 1), b] : [a, b];
    parts.forEach(function (x) { if (!x) return; var sp = document.createElement('span'); sp.textContent = x; lede.appendChild(sp); });
    if (!lede.h2ro && window.ResizeObserver) { lede.h2ro = new ResizeObserver(function () { fitLede(lede); }); lede.h2ro.observe(lede); }
    fitLede(lede);
  }
  // da tablet in su ogni riga resta intera: se non entra, il font scende fino a 13px
  function fitLede(l) {
    l.style.fontSize = '';
    if (!l.clientWidth || !matchMedia('(min-width: 721px)').matches) return;
    var f = parseFloat(getComputedStyle(l).fontSize);
    while (f > 13 && l.scrollWidth > l.clientWidth + 1) { f -= 0.5; l.style.fontSize = f + 'px'; }
  }
  if (window.MutationObserver) new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['lang'] });

  /* ------------------------------ Apertura e chiusura ------------------------------ */
  var current = null, opener = null, savedY = 0, pushed = false, moved = [];
  var viaKeys = false;   // l'ultima azione è arrivata dalla tastiera?
  document.addEventListener('keydown', function () { viaKeys = true; }, true);
  document.addEventListener('pointerdown', function () { viaKeys = false; }, true);

  function headerH() { var m = $('.masthead'); return m ? m.getBoundingClientRect().height : 64; }
  function giveBack() {
    moved.forEach(function (n) { var ph = n._h2ph; if (ph && ph.parentNode) { ph.parentNode.replaceChild(n, ph); } n._h2ph = null; });
    moved = [];
  }
  function pressed() {
    $$('button.h2app').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-panel') === current)); });
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
    // il fuoco torna al bottone solo per chi usa la tastiera: col dito o col mouse Safari ci disegnerebbe un rettangolo
    if (viaKeys && opener && document.body.contains(opener)) { try { opener.focus({ preventScroll: true }); } catch (e) {} }
    else if (document.activeElement && document.activeElement.blur && apps.contains(document.activeElement)) document.activeElement.blur();
    opener = null;
  }

  apps.addEventListener('click', function (e) {
    var b = e.target.closest('.h2app'); if (!b || b.hasAttribute('data-link')) return;   // i link (Gioca) navigano da soli
    var k = b.getAttribute('data-panel');
    if (current === k) close(); else open(k, b);
  });
  allBtn.addEventListener('click', function () { open('notizie', allBtn); });
  xBtn.addEventListener('click', function () { close(); });
  // "Cambia sezione" compare solo quando la fila di icone è uscita dallo schermo
  var awayTick = false;
  function checkAway() {
    awayTick = false;
    panel.classList.toggle('h2-apps-away', apps.getBoundingClientRect().bottom < headerH() + 4);
  }
  window.addEventListener('scroll', function () { if (!awayTick) { awayTick = true; requestAnimationFrame(checkAway); } }, { passive: true });
  window.addEventListener('resize', checkAway);
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
