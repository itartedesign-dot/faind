/* =====================================================================
   FAIND — blocco "dal resto di FAIND" nelle pagine degli strumenti
   ---------------------------------------------------------------------
   Sempre visibile sotto lo strumento (mai sopra, mai come popup), così
   chi arriva per uno strumento può scoprire il resto. Mostra le
   ultime notizie con immagine (da news.json, caricato a pagina pronta),
   un invito alla newsletter e ai canali, gli altri strumenti, il link alla home.
   Niente cookie, niente tracciamento nuovo: solo gli eventi GoatCounter
   già in uso (nome dell'evento, mai contenuti).
   ===================================================================== */
(function () {
  var path = location.pathname;
  var tool = /bpm-key/.test(path) ? 'bpm-key' : /image-to-text/.test(path) ? 'image-to-text' : /transcribe/.test(path) ? 'transcribe' : '';
  var anchor = document.querySelector('main > section');
  if (!tool || !anchor) return;

  var box, shown = false;
  function ev(n) { if (window.faindEvent) window.faindEvent('more-' + tool + '-' + n); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function link(href, text, evName, external, cls) {
    var a = el('a', cls, text);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    a.addEventListener('click', function () { ev(evName); });
    return a;
  }

  var css = document.createElement('style');
  css.textContent =
    '.fmore{min-height:396px;margin:28px 0 8px;padding:20px;border:1px solid var(--rule);border-radius:var(--radius-m,10px);background:var(--surface)}' +
    '.fmore[hidden]{display:none}' +
    '.fmore h2{margin:0 0 4px;font-size:18px}' +
    '.fmore__lede{margin:0 0 14px;color:var(--muted);font-size:14.5px}' +
    '.fmore .fmore__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:0 0 16px;padding:0;list-style:none}' +
    '.fmore .fmore__card{margin:0;padding:0;list-style:none}' +
    '.fmore__card a{display:block;color:inherit;text-decoration:none}' +
    '.fmore__img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:6px;background:var(--rule)}' +
    '.fmore__t{display:block;margin-top:8px;font-size:14.5px;font-weight:650;line-height:1.3}' +
    '.fmore__card a:hover .fmore__t{text-decoration:underline}' +
    '.fmore__src{display:block;margin-top:2px;font-size:12.5px;color:var(--muted)}' +
    '.fmore__row{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:14.5px}' +
    '.fmore__row a{color:var(--link)}' +
    '@media (max-width:640px){' +
      '.fmore{padding:16px;min-height:492px}' +
      '.fmore .fmore__grid{grid-template-columns:1fr;gap:12px}' +
      '.fmore__card a{display:grid;grid-template-columns:112px 1fr;gap:12px;align-items:start}' +
      '.fmore__t{margin-top:0}' +
    '}';
  document.head.appendChild(css);

  function pick(items) {
    var week = Date.now() - 7 * 864e5;
    var ok = (items || []).filter(function (n) {
      return n && typeof n.title === 'string' && n.link && /^https:\/\//.test(n.link.url || '') &&
        /^https:\/\//.test(n.image || '') && Date.parse(n.date) > week;
    });
    ok.sort(function (a, b) {
      return ((b.lang === 'en') - (a.lang === 'en')) || ((b.coverage || 1) - (a.coverage || 1)) || (Date.parse(b.date) - Date.parse(a.date));
    });
    return ok.slice(0, 3);
  }

  function fill(list) {
    if (!list.length) return;
    var ul = el('ul', 'fmore__grid');
    list.forEach(function (n) {
      var li = el('li', 'fmore__card');
      var a = link(n.link.url, '', 'news', true);
      var img = document.createElement('img');
      img.className = 'fmore__img';
      img.src = n.image; img.alt = ''; img.width = 320; img.height = 180;
      img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
      img.addEventListener('error', function () { li.hidden = true; });
      var txt = el('span');
      txt.appendChild(el('span', 'fmore__t', n.title));
      if (n.source && n.source.name) txt.appendChild(el('span', 'fmore__src', n.source.name));
      a.appendChild(img); a.appendChild(txt); li.appendChild(a); ul.appendChild(li);
    });
    box.insertBefore(ul, box.querySelector('.fmore__row'));
  }

  function build() {
    box = el('section', 'fmore');
    box.id = 'faind-more';
    box.setAttribute('aria-labelledby', 'fmoreTitle');
    var h = el('h2', '', 'More from FAIND'); h.id = 'fmoreTitle';
    box.appendChild(h);
    box.appendChild(el('p', 'fmore__lede', 'AI news, updated every hour, always with the original source.'));
    var row = el('p', 'fmore__row');
    row.appendChild(link('../', 'All today’s AI news', 'home', false));
    row.appendChild(link('../#newsletter', 'Weekly newsletter', 'newsletter', false));
    row.appendChild(link('https://t.me/faindnews', 'Telegram', 'telegram', true));
    row.appendChild(link('https://www.linkedin.com/company/faindnews/', 'LinkedIn', 'linkedin', true));
    box.appendChild(row);
    var others = [['transcribe', '../transcribe/', 'Audio and video to text'], ['bpm-key', '../bpm-key-finder/', 'BPM and key of a song'], ['image-to-text', '../image-to-text/', 'Text from an image or PDF']]
      .filter(function (t) { return t[0] !== tool; });
    var more = el('p', 'fmore__row fmore__tools');
    more.appendChild(el('span', 'fmore__src', 'Other free tools:'));
    others.forEach(function (t) { more.appendChild(link(t[1], t[2], 'tool-' + t[0], false)); });
    box.appendChild(more);
    anchor.parentNode.insertBefore(box, anchor);
  }

  function load() {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch('../news.json', { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { fill(pick(j.items)); })
      .catch(function () {})
      .then(function () { clearTimeout(timer); });
  }

  build();
  // Visibile fin da subito, sotto lo strumento: le notizie si caricano a pagina pronta, senza rubare banda allo strumento.
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 }); else setTimeout(load, 1500);
  // "shown" = il blocco è davvero entrato nello schermo (una volta sola)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { ev('shown'); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(box);
  }
})();
