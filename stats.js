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
  var on = !!CODICE
    && (/\.github\.io$/.test(location.hostname) || /faind/.test(location.hostname))   // niente conteggi in locale o su copie del sito
    && navigator.doNotTrack !== '1';                                                   // rispetta chi chiede di non essere contato
  if (on) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + CODICE + '.goatcounter.com/count');
    document.head.appendChild(s);
  }
  // Conta solo che uno strumento ha prodotto un risultato (nome dell'evento, mai file, nome o contenuto).
  // Serve a distinguere l'uso vero dalle semplici visite. Senza GoatCounter (o con Do Not Track) non conta nulla.
  // Lancia anche l'evento locale "faind:event" (nessun dato esce dalla pagina): lo usa tool-more.js per mostrare il blocco dopo il risultato.
  window.faindEvent = function (name) {
    try { document.dispatchEvent(new CustomEvent('faind:event', { detail: name })); } catch (e) { /* vecchi browser */ }
    if (!on) return;
    var n = 0;
    (function send() {
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'event/' + name, title: name, event: true });
      else if (n++ < 20) setTimeout(send, 500);
    })();
  };
})();
