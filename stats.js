/* =====================================================================
   FAIND — statistiche delle visite senza cookie (GoatCounter)
   ---------------------------------------------------------------------
   Conta le pagine viste senza cookie e senza dati personali: niente
   banner, niente profilazione. Il pannello con i numeri è su
   https://CODICE.goatcounter.com (accesso con l'account GoatCounter).

   CODICE = il nome scelto quando si crea l'account su goatcounter.com.
   Se è diverso da quello qui sotto, basta cambiare questa riga.
   Lasciandolo vuoto ('') le statistiche sono spente.
   ===================================================================== */
(function () {
  var CODICE = 'faind';
  if (!CODICE) return;
  if (!/\.github\.io$/.test(location.hostname) && !/faind/.test(location.hostname)) return;   // niente conteggi in locale o su copie del sito
  if (navigator.doNotTrack === '1') return;                                                    // rispetta chi chiede di non essere contato
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + CODICE + '.goatcounter.com/count');
  document.head.appendChild(s);
  // Conta solo che uno strumento ha prodotto un risultato (nome dell'evento, mai file, nome o contenuto).
  // Serve a distinguere l'uso vero dalle semplici visite. Senza GoatCounter (o con Do Not Track) non fa nulla.
  window.faindEvent = function (name) {
    var n = 0;
    (function send() {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'event/' + name, title: name, event: true });
      else if (n++ < 20) setTimeout(send, 500);
    })();
  };
})();
