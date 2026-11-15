/* FAIND Audio to Text, estrazione audio: codifica MP3 nel browser con lamejs (porta JavaScript di LAME, LGPL),
   servito da FAIND come file separato e non modificato (vendor/lame.min.js). Il suono non viene inviato a nessun server. */
importScripts('vendor/lame.min.js');

self.onmessage = function (ev) {
  var m = ev.data || {};
  try {
    var ch = m.channels.length, enc = new lamejs.Mp3Encoder(ch, m.rate, m.kbps), out = [], n = m.channels[0].length, step = 1152 * 20, i, c, k, last = 0;
    var buf = [new Int16Array(step), new Int16Array(step)];
    for (i = 0; i < n; i += step) {
      var len = Math.min(step, n - i);
      for (c = 0; c < ch; c++) {
        var src = m.channels[c], dst = buf[c];
        for (k = 0; k < len; k++) { var v = src[i + k]; v = v < -1 ? -1 : v > 1 ? 1 : v; dst[k] = v < 0 ? v * 32768 : v * 32767; }
      }
      var a = buf[0].subarray(0, len), b = ch > 1 ? buf[1].subarray(0, len) : undefined;
      var d = ch > 1 ? enc.encodeBuffer(a, b) : enc.encodeBuffer(a);
      if (d.length) out.push(d);
      var p = i / n;
      if (p - last > 0.02) { last = p; self.postMessage({ type: 'progress', value: p }); }
    }
    var f = enc.flush();
    if (f.length) out.push(f);
    self.postMessage({ type: 'done', chunks: out });
  } catch (e) {
    self.postMessage({ type: 'error', message: String(e && e.message || e) });
  }
};
