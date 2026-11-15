/* FAIND Audio to Text, estrazione audio: codifica MP3 nel browser con lamejs (porta JavaScript di LAME, LGPL),
   servito da FAIND come file separato e non modificato (vendor/lame.min.js). Il suono non viene inviato a nessun server.
   Riceve il suono a pezzi (init, data, end) per non duplicare in memoria l'audio intero. */
importScripts('vendor/lame.min.js');

var enc = null, out = [], ch = 1;

function toInt16(src) {
  var o = new Int16Array(src.length), k, v;
  for (k = 0; k < src.length; k++) { v = src[k]; v = v < -1 ? -1 : v > 1 ? 1 : v; o[k] = v < 0 ? v * 32768 : v * 32767; }
  return o;
}

self.onmessage = function (ev) {
  var m = ev.data || {};
  try {
    if (m.type === 'init') {
      ch = m.ch; enc = new lamejs.Mp3Encoder(ch, m.rate, m.kbps); out = [];
    } else if (m.type === 'data') {
      var a = toInt16(m.channels[0]), d = ch > 1 ? enc.encodeBuffer(a, toInt16(m.channels[1])) : enc.encodeBuffer(a);
      if (d.length) out.push(d);
      self.postMessage({ type: 'ack' });
    } else if (m.type === 'end') {
      var f = enc.flush();
      if (f.length) out.push(f);
      self.postMessage({ type: 'done', chunks: out });
    }
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e && e.message || e) });
  }
};
