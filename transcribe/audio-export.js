/* FAIND Audio to Text, estrazione audio: scrittura di WAV e M4A (AAC) nel browser.
   Nessuna libreria esterna: il WAV è PCM a 16 bit, l'M4A è un contenitore MP4 scritto a mano
   attorno ai frame AAC prodotti dal codificatore nativo del browser (WebCodecs).
   Il file non esce dal dispositivo. */
(function (root) {
  'use strict';

  function u32(n) { return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]; }
  function u16(n) { return [(n >>> 8) & 255, n & 255]; }
  function ascii(s) { var a = [], i; for (i = 0; i < s.length; i++) a.push(s.charCodeAt(i)); return a; }
  function cat(parts) {
    var n = 0, i, o, p = 0;
    for (i = 0; i < parts.length; i++) n += parts[i].length;
    o = new Uint8Array(n);
    for (i = 0; i < parts.length; i++) { o.set(parts[i], p); p += parts[i].length; }
    return o;
  }
  function box(type, parts) {
    var body = cat(parts.map(function (x) { return x instanceof Uint8Array ? x : new Uint8Array(x); }));
    return cat([new Uint8Array(u32(body.length + 8).concat(ascii(type))), body]);
  }
  function full(type, flags, parts) { return box(type, [new Uint8Array([0, (flags >> 16) & 255, (flags >> 8) & 255, flags & 255])].concat(parts)); }
  function zeros(n) { return new Uint8Array(n); }

  /* ---- WAV (PCM 16 bit) ---- */
  function wav(channels, rate) {
    var ch = channels.length, n = channels[0].length, data = new Int16Array(n * ch), i, c, v;
    for (c = 0; c < ch; c++) {
      var d = channels[c];
      for (i = 0; i < n; i++) { v = d[i]; v = v < -1 ? -1 : v > 1 ? 1 : v; data[i * ch + c] = v < 0 ? v * 32768 : v * 32767; }
    }
    var bytes = data.length * 2, h = new DataView(new ArrayBuffer(44));
    function s(o, t) { for (var k = 0; k < t.length; k++) h.setUint8(o + k, t.charCodeAt(k)); }
    s(0, 'RIFF'); h.setUint32(4, 36 + bytes, true); s(8, 'WAVE'); s(12, 'fmt ');
    h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, ch, true);
    h.setUint32(24, rate, true); h.setUint32(28, rate * ch * 2, true); h.setUint16(32, ch * 2, true); h.setUint16(34, 16, true);
    s(36, 'data'); h.setUint32(40, bytes, true);
    return new Blob([h.buffer, data.buffer], { type: 'audio/wav' });
  }

  /* ---- M4A: contenitore MP4 con una traccia AAC-LC ---- */
  var RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
  function asc(rate, channels) {   // AudioSpecificConfig: AAC-LC, frequenza, canali
    var f = RATES.indexOf(rate);
    if (f < 0) throw new Error('Unsupported sample rate');
    return new Uint8Array([(2 << 3) | (f >> 1), ((f & 1) << 7) | (channels << 3)]);
  }
  var MATRIX = [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000];
  function matrix() { return new Uint8Array([].concat.apply([], MATRIX.map(u32))); }

  function m4a(frames, rate, channels, bitrate) {
    var cfg = asc(rate, channels), n = frames.length, dur = n * 1024, total = 0, i;
    var sizes = new Uint8Array(n * 4), sv = new DataView(sizes.buffer);
    for (i = 0; i < n; i++) { total += frames[i].length; sv.setUint32(i * 4, frames[i].length); }
    var esds = full('esds', 0, [new Uint8Array([
      3, 25, 0, 0, 0,
      4, 17, 0x40, 0x15, 0, 0, 0].concat(u32(bitrate || 0), u32(bitrate || 0), [5, 2], Array.prototype.slice.call(cfg), [6, 1, 2]))]);
    var mp4a = box('mp4a', [zeros(6), new Uint8Array(u16(1)), zeros(8), new Uint8Array(u16(channels)), new Uint8Array(u16(16)), zeros(4), new Uint8Array(u32(rate * 65536)), esds]);
    var ftyp = box('ftyp', [new Uint8Array(ascii('M4A ').concat(u32(0), ascii('M4A '), ascii('mp42'), ascii('isom')))]);
    var mdatHead = new Uint8Array(u32(total + 8).concat(ascii('mdat')));
    var offset = ftyp.length + 8;
    var stbl = box('stbl', [
      full('stsd', 0, [new Uint8Array(u32(1)), mp4a]),
      full('stts', 0, [new Uint8Array(u32(1).concat(u32(n), u32(1024)))]),
      full('stsc', 0, [new Uint8Array(u32(1).concat(u32(1), u32(n), u32(1)))]),
      full('stsz', 0, [cat([new Uint8Array(u32(0).concat(u32(n))), sizes])]),
      full('stco', 0, [new Uint8Array(u32(1).concat(u32(offset)))])
    ]);
    var minf = box('minf', [
      full('smhd', 0, [zeros(4)]),
      box('dinf', [full('dref', 0, [new Uint8Array(u32(1)), full('url ', 1, [])])]),
      stbl
    ]);
    var mdia = box('mdia', [
      full('mdhd', 0, [new Uint8Array(u32(0).concat(u32(0), u32(rate), u32(dur), u16(0x55c4), u16(0)))]),
      full('hdlr', 0, [new Uint8Array(u32(0).concat(ascii('soun'), u32(0), u32(0), u32(0), ascii('SoundHandler'), [0]))]),
      minf
    ]);
    var trak = box('trak', [
      full('tkhd', 3, [new Uint8Array(u32(0).concat(u32(0), u32(1), u32(0), u32(dur), u32(0), u32(0), u16(0), u16(0), u16(0x0100), u16(0))), matrix(), zeros(8)]),
      mdia
    ]);
    var moov = box('moov', [
      full('mvhd', 0, [new Uint8Array(u32(0).concat(u32(0), u32(rate), u32(dur), u32(0x00010000), u16(0x0100), u16(0), u32(0), u32(0))), matrix(), zeros(24), new Uint8Array(u32(2))]),
      trak
    ]);
    return new Blob([ftyp, mdatHead].concat(frames, [moov]), { type: 'audio/mp4' });
  }

  var api = { wav: wav, m4a: m4a };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FaindAudio = api;
})(typeof self !== 'undefined' ? self : this);
