/* Fine partita: sotto il punteggio compaiono le ultime notizie del giornale (con la loro pagina FAIND) e ogni clic viene contato in GoatCounter come evento, per sapere quanti giocatori passano dal gioco alle notizie. news.json si scarica solo alla prima schermata finale. */
(function () {
  var over = document.getElementById('pOver'); if (!over) return;
  var game = (location.pathname.match(/\/([^/]+)\/?$/) || [, 'game'])[1];
  var box = document.createElement('div'); box.className = 'g-newsbox'; box.hidden = true;
  var h = document.createElement('p'); h.className = 'g-lbl2'; h.textContent = 'FRESH FROM THE NEWSROOM';
  var ul = document.createElement('ul'); ul.className = 'g-newslist';
  box.appendChild(h); box.appendChild(ul);
  var grid = over.querySelector('.g-grid'); over.insertBefore(box, grid);

  function count(name) {
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: 'event/' + name, title: name, event: true }); } catch (e) {}
  }
  var nb = document.getElementById('btnNews');
  if (nb) nb.addEventListener('click', function () { count('game-news-button-' + game); });

  function text(t) { return t && typeof t === 'object' ? (t.en || '') : (t || ''); }
  function url(p) { return /^(https?:)?\/\//.test(p) ? p : (p.charAt(0) === '/' ? p : '../' + p); }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    fetch('../news.json?v=' + Math.floor(Date.now() / 3e5)).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !Array.isArray(j.items)) return;
      var pages = j.pages || {}, seen = {}, out = [];
      j.items.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).forEach(function (n) {
        var t = text(n.title).trim(), p = n.page || pages[n.id];
        if (out.length >= 3 || !t || !p || seen[t]) return;
        seen[t] = 1; out.push({ t: t, p: p });
      });
      out.forEach(function (n) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = url(n.p); a.textContent = n.t;
        a.addEventListener('click', function () { count('game-news-' + game); });
        li.appendChild(a); ul.appendChild(li);
      });
      box.hidden = !out.length;
    }).catch(function () {});
  }
  new MutationObserver(function () { if (!over.hidden) load(); }).observe(over, { attributes: true, attributeFilter: ['hidden'] });
  if (!over.hidden) load();
})();
