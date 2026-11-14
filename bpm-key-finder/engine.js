/* FAIND BPM, key and chords: analysis engine.
   Plain JavaScript, no libraries, written for FAIND (so no third-party licence terms apply).
   Input: mono samples at 22050 Hz. Everything runs on the user's device.
   Methods (all standard in music information retrieval):
   - tempo: log-compressed spectral flux onset curve, then a Fourier tempogram over a 0.1 BPM grid
   - key: tuning-corrected chroma, correlated with the 24 Krumhansl-Kessler key profiles
   - chords: chroma matched to 24 major/minor triad templates, smoothed with Viterbi, nudged toward the key */
(function (root) {
  'use strict';
  var SR = 22050;

  function makeFFT(n) {
    var bits = Math.round(Math.log(n) / Math.LN2), rev = new Uint32Array(n), cs = new Float64Array(n / 2), sn = new Float64Array(n / 2), i, j;
    for (i = 0; i < n; i++) { var r = 0, x = i; for (j = 0; j < bits; j++) { r = (r << 1) | (x & 1); x >>= 1; } rev[i] = r; }
    for (i = 0; i < n / 2; i++) { cs[i] = Math.cos(2 * Math.PI * i / n); sn[i] = -Math.sin(2 * Math.PI * i / n); }
    return function (re, im) {
      var k, a, b, size, half, step, tr, ti, t;
      for (k = 0; k < n; k++) { t = rev[k]; if (t > k) { tr = re[k]; re[k] = re[t]; re[t] = tr; tr = im[k]; im[k] = im[t]; im[t] = tr; } }
      for (size = 2; size <= n; size <<= 1) {
        half = size >> 1; step = n / size;
        for (a = 0; a < n; a += size) {
          for (b = 0; b < half; b++) {
            var wr = cs[b * step], wi = sn[b * step], p = a + b, q = p + half;
            tr = re[q] * wr - im[q] * wi; ti = re[q] * wi + im[q] * wr;
            re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
          }
        }
      }
    };
  }
  function hann(n) { var w = new Float64Array(n); for (var i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); return w; }

  /* ---------- tempo ---------- */
  function onsetCurve(x, progress) {
    var N = 1024, hop = 256, fft = makeFFT(N), win = hann(N), re = new Float64Array(N), im = new Float64Array(N);
    var frames = Math.max(0, Math.floor((x.length - N) / hop) + 1), kmax = Math.floor(5000 * N / SR), prev = new Float64Array(kmax), env = new Float32Array(frames), t, k, i;
    for (t = 0; t < frames; t++) {
      var o = t * hop;
      for (i = 0; i < N; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
      fft(re, im);
      var flux = 0;
      for (k = 1; k < kmax; k++) {
        var m = Math.log(1 + 1000 * Math.sqrt(re[k] * re[k] + im[k] * im[k]) / (N / 4));
        var d = m - prev[k]; if (d > 0) flux += d; prev[k] = m;
      }
      env[t] = flux;
      if (progress && (t & 2047) === 0) progress(t / frames);
    }
    // remove the slow trend (moving average of about one second), keep only what rises above it
    var w = Math.round(SR / hop), acc = 0, out = new Float32Array(frames), half = w >> 1, cum = new Float64Array(frames + 1);
    for (t = 0; t < frames; t++) cum[t + 1] = cum[t] + env[t];
    for (t = 0; t < frames; t++) {
      var a = Math.max(0, t - half), b = Math.min(frames, t + half + 1), mean = (cum[b] - cum[a]) / (b - a), v = env[t] - mean;
      out[t] = v > 0 ? v : 0;
    }
    return { env: out, fps: SR / hop };
  }

  function tempoScore(env, fps, bpm) {
    // magnitude of the envelope's Fourier component at the beat rate and at its multiples
    var n = env.length, f = bpm / 60, res = [0, 0, 0, 0, 0], hs = [1, 2, 3, 4, 0.5], h, t;
    for (h = 0; h < hs.length; h++) {
      var ang = 2 * Math.PI * f * hs[h] / fps, cr = Math.cos(ang), ci = Math.sin(ang), pr = 1, pi = 0, sr = 0, si = 0;
      for (t = 0; t < n; t++) {
        var e = env[t]; sr += e * pr; si += e * pi;
        var nr = pr * cr - pi * ci; pi = pr * ci + pi * cr; pr = nr;
        if ((t & 4095) === 4095) { var mag = Math.sqrt(pr * pr + pi * pi); pr /= mag; pi /= mag; }
      }
      res[h] = Math.sqrt(sr * sr + si * si) / n;
    }
    return res;
  }

  function estimateTempo(x, progress) {
    var oc = onsetCurve(x, function (p) { if (progress) progress(p * 0.5); });
    var env = oc.env, fps = oc.fps;
    if (env.length < fps * 6) return null;
    // use at most the first 4 minutes: enough for a stable tempo and keeps the page quick
    var maxN = Math.floor(fps * 240); if (env.length > maxN) env = env.subarray(0, maxN);
    var total = 0, i; for (i = 0; i < env.length; i++) total += env[i];
    if (total < 1e-6) return null;
    var cands = [], b;
    for (b = 55; b <= 210; b += 0.5) {
      var s = tempoScore(env, fps, b);
      var lg = Math.log(b / 100) / Math.LN2, prior = Math.exp(-0.5 * lg * lg / (0.65 * 0.65));
      cands.push({ bpm: b, raw: s[0] + 0.6 * s[1] + 0.3 * s[3] + 0.25 * s[2] + 0.35 * s[4], score: 0 });
      cands[cands.length - 1].score = cands[cands.length - 1].raw * prior;
      if (progress) progress(0.5 + 0.5 * (b - 55) / 155);
    }
    var best = cands[0]; for (i = 1; i < cands.length; i++) if (cands[i].score > best.score) best = cands[i];
    // refine on a fine grid
    var bestFine = { bpm: best.bpm, v: -1 }, ff;
    for (ff = best.bpm - 0.6; ff <= best.bpm + 0.6001; ff += 0.05) {
      var sc = tempoScore(env, fps, ff); var v = sc[0] + 0.6 * sc[1] + 0.3 * sc[3] + 0.25 * sc[2];
      if (v > bestFine.v) bestFine = { bpm: ff, v: v };
    }
    var mean = 0; for (i = 0; i < cands.length; i++) mean += cands[i].score; mean /= cands.length;
    var conf = best.score / (mean || 1);
    // the other reading of the same pulse: half or double tempo
    var alt = best.bpm * 2 <= 210 && best.bpm * 2 >= 55 && best.bpm < 100 ? best.bpm * 2 : (best.bpm / 2 >= 55 && best.bpm > 130 ? best.bpm / 2 : (best.bpm * 2 <= 210 ? best.bpm * 2 : best.bpm / 2));
    return { bpm: Math.round(bestFine.bpm * 10) / 10, alt: Math.round(alt * 10) / 10, confidence: conf };
  }

  /* ---------- chroma ---------- */
  var KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  var KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  var N_C = 8192, HOP_C = 4096;

  function spectrumPeaks(re, im, N, fmin, fmax, cb) {
    var k0 = Math.max(2, Math.floor(fmin * N / SR)), k1 = Math.min(N / 2 - 2, Math.ceil(fmax * N / SR)), mags = spectrumPeaks.buf || (spectrumPeaks.buf = new Float64Array(N / 2)), k;
    for (k = k0 - 1; k <= k1 + 1; k++) mags[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    for (k = k0; k <= k1; k++) {
      var m = mags[k];
      if (m > mags[k - 1] && m >= mags[k + 1]) {
        var a = mags[k - 1], c = mags[k + 1], den = a - 2 * m + c, d = den !== 0 ? 0.5 * (a - c) / den : 0;
        cb((k + d) * SR / N, m);
      }
    }
  }

  function estimateTuning(x) {
    var fft = makeFFT(N_C), win = hann(N_C), re = new Float64Array(N_C), im = new Float64Array(N_C), frames = Math.floor((x.length - N_C) / HOP_C) + 1;
    if (frames < 1) return 0;
    var step = Math.max(1, Math.floor(frames / 240)), sx = 0, sy = 0, t, i;
    for (t = 0; t < frames; t += step) {
      var o = t * HOP_C; for (i = 0; i < N_C; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
      fft(re, im);
      var peaks = [], mx = 0;
      spectrumPeaks(re, im, N_C, 80, 1600, function (f, m) { peaks.push([f, m]); if (m > mx) mx = m; });
      for (i = 0; i < peaks.length; i++) {
        if (peaks[i][1] < mx * 0.1) continue;
        var midi = 69 + 12 * Math.log(peaks[i][0] / 440) / Math.LN2, dev = midi - Math.round(midi), ang = 2 * Math.PI * dev;
        sx += peaks[i][1] * Math.cos(ang); sy += peaks[i][1] * Math.sin(ang);
      }
    }
    return Math.atan2(sy, sx) / (2 * Math.PI);   // semitones, -0.5..0.5
  }

  function chromaFrames(x, tuning, progress) {
    var fft = makeFFT(N_C), win = hann(N_C), re = new Float64Array(N_C), im = new Float64Array(N_C), frames = Math.floor((x.length - N_C) / HOP_C) + 1, out = [], energy = [], t, i;
    for (t = 0; t < frames; t++) {
      var o = t * HOP_C; for (i = 0; i < N_C; i++) { re[i] = x[o + i] * win[i]; im[i] = 0; }
      fft(re, im);
      var c = new Float64Array(12), e = 0;
      spectrumPeaks(re, im, N_C, 65, 2100, function (f, m) {
        var midi = 69 + 12 * Math.log(f / 440) / Math.LN2 - tuning, pc = ((Math.round(midi) % 12) + 12) % 12, v = Math.sqrt(m);
        c[pc] += v; e += m;
      });
      out.push(c); energy.push(e);
      if (progress && (t & 63) === 0) progress(t / frames);
    }
    return { chroma: out, energy: energy };
  }

  function normalise(c) { var n = 0, i; for (i = 0; i < 12; i++) n += c[i] * c[i]; n = Math.sqrt(n) || 1; var o = new Float64Array(12); for (i = 0; i < 12; i++) o[i] = c[i] / n; return o; }
  function pearson(a, b) {
    var ma = 0, mb = 0, i; for (i = 0; i < 12; i++) { ma += a[i]; mb += b[i]; } ma /= 12; mb /= 12;
    var sab = 0, saa = 0, sbb = 0; for (i = 0; i < 12; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) * (a[i] - ma); sbb += (b[i] - mb) * (b[i] - mb); }
    return sab / (Math.sqrt(saa * sbb) || 1);
  }

  var SHARP_KEYS_MAJ = { 7: 1, 2: 1, 9: 1, 4: 1, 11: 1, 6: 1 };       // G D A E B F#
  var SHARP_KEYS_MIN = { 4: 1, 11: 1, 6: 1, 1: 1, 8: 1, 3: 1 };       // Em Bm F#m C#m G#m D#m
  var NAMES_S = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var NAMES_F = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var CAMELOT_MAJ = { 0: '8B', 7: '9B', 2: '10B', 9: '11B', 4: '12B', 11: '1B', 6: '2B', 1: '3B', 8: '4B', 3: '5B', 10: '6B', 5: '7B' };
  var CAMELOT_MIN = { 9: '8A', 4: '9A', 11: '10A', 6: '11A', 1: '12A', 8: '1A', 3: '2A', 10: '3A', 5: '4A', 0: '5A', 7: '6A', 2: '7A' };
  function useSharps(tonic, minor) { return minor ? !!SHARP_KEYS_MIN[tonic] : !!SHARP_KEYS_MAJ[tonic]; }
  function noteName(pc, sharps) { return (sharps ? NAMES_S : NAMES_F)[pc]; }
  function keyName(tonic, minor) { return noteName(tonic, useSharps(tonic, minor)) + (minor ? ' minor' : ' major'); }
  function openKey(camelot) {
    // Open Key notation: Camelot 8B = 1d, 8A = 1m (shifted by seven positions)
    var num = parseInt(camelot, 10), letter = camelot.slice(-1), n = ((num + 4) % 12) + 1;
    return n + (letter === 'B' ? 'd' : 'm');
  }

  function estimateKey(chroma, energy) {
    var sum = new Float64Array(12), i, k, f = 0;
    // frames with more energy count more, but gently, so one loud hit does not decide the key
    var med = energy.slice().sort(function (a, b) { return a - b; })[energy.length >> 1] || 1;
    for (f = 0; f < chroma.length; f++) {
      if (energy[f] < med * 0.1) continue;
      var n = normalise(chroma[f]), w = Math.min(2, Math.sqrt(energy[f] / med));
      for (i = 0; i < 12; i++) sum[i] += n[i] * w;
    }
    var res = [];
    for (k = 0; k < 12; k++) {
      var maj = new Float64Array(12), min = new Float64Array(12);
      for (i = 0; i < 12; i++) { maj[(i + k) % 12] = KK_MAJ[i]; min[(i + k) % 12] = KK_MIN[i]; }
      res.push({ tonic: k, minor: false, r: pearson(sum, maj) });
      res.push({ tonic: k, minor: true, r: pearson(sum, min) });
    }
    res.sort(function (a, b) { return b.r - a.r; });
    var top = res[0], cam = top.minor ? CAMELOT_MIN[top.tonic] : CAMELOT_MAJ[top.tonic];
    var margin = top.r - res[1].r, level = top.r > 0.8 && margin > 0.05 ? 'clear' : (top.r > 0.65 && margin > 0.02 ? 'probable' : 'unsure');
    return {
      tonic: top.tonic, minor: top.minor, name: keyName(top.tonic, top.minor), camelot: cam, openKey: openKey(cam), r: top.r, level: level,
      alts: res.slice(1, 4).map(function (a) { var c = a.minor ? CAMELOT_MIN[a.tonic] : CAMELOT_MAJ[a.tonic]; return { name: keyName(a.tonic, a.minor), camelot: c, r: a.r }; })
    };
  }

  /* ---------- chords ---------- */
  function chordTemplates() {
    var T = [], r, i;
    for (r = 0; r < 12; r++) {
      var maj = new Float64Array(12), min = new Float64Array(12);
      maj[r] = 1; maj[(r + 4) % 12] = 0.85; maj[(r + 7) % 12] = 0.8;
      min[r] = 1; min[(r + 3) % 12] = 0.85; min[(r + 7) % 12] = 0.8;
      T.push({ root: r, minor: false, v: normalise(maj) }); T.push({ root: r, minor: true, v: normalise(min) });
    }
    return T;
  }
  function diatonic(key) {
    var set = {}, t = key.tonic, d;
    var maj = [[0, 0], [2, 1], [4, 1], [5, 0], [7, 0], [9, 1]], min = [[0, 1], [5, 1], [7, 1], [7, 0], [3, 0], [8, 0], [10, 0], [2, 1]];
    (key.minor ? min : maj).forEach(function (p) { set[((t + p[0]) % 12) + ':' + p[1]] = 1; });
    return set;
  }

  function estimateChords(chroma, energy, key, hopSec) {
    var T = chordTemplates(), dia = diatonic(key), S = 24, n = chroma.length, t, s, p;
    if (n < 2) return [];
    var med = energy.slice().sort(function (a, b) { return a - b; })[n >> 1] || 1;
    var emit = [], quiet = [];
    for (t = 0; t < n; t++) {
      var c = normalise(chroma[t]), row = new Float64Array(S + 1);
      for (s = 0; s < S; s++) {
        var d = 0, i; for (i = 0; i < 12; i++) d += c[i] * T[s].v[i];
        row[s] = d + (dia[T[s].root + ':' + (T[s].minor ? 1 : 0)] ? 0.05 : 0);
      }
      quiet.push(energy[t] < med * 0.08);
      row[S] = quiet[t] ? 2 : 0;
      emit.push(row);
    }
    var PEN = 0.22, score = new Float64Array(S + 1), prevScore = new Float64Array(S + 1), back = [];
    for (s = 0; s <= S; s++) score[s] = emit[0][s];
    back.push(new Int16Array(S + 1));
    for (t = 1; t < n; t++) {
      var bp = new Int16Array(S + 1), bestPrev = 0;
      for (s = 0; s <= S; s++) if (score[s] > score[bestPrev]) bestPrev = s;
      for (s = 0; s <= S; s++) { prevScore[s] = score[s]; }
      for (s = 0; s <= S; s++) {
        var stay = prevScore[s], move = prevScore[bestPrev] - PEN;
        if (stay >= move) { score[s] = stay + emit[t][s]; bp[s] = s; } else { score[s] = move + emit[t][s]; bp[s] = bestPrev; }
      }
      back.push(bp);
    }
    var cur = 0; for (s = 0; s <= S; s++) if (score[s] > score[cur]) cur = s;
    var path = new Int16Array(n); for (t = n - 1; t >= 0; t--) { path[t] = cur; cur = back[t][cur]; }
    var sharps = useSharps(key.tonic, key.minor), segs = [], start = 0;
    function label(st) { return st === S ? null : noteName(T[st].root, sharps) + (T[st].minor ? 'm' : ''); }
    for (t = 1; t <= n; t++) {
      if (t === n || path[t] !== path[start]) {
        var nm = label(path[start]);
        if (nm) segs.push({ t0: start * hopSec, t1: t * hopSec, name: nm });
        start = t;
      }
    }
    // absorb blips shorter than 0.4 s into the previous chord, then join equal neighbours
    var cleaned = [];
    segs.forEach(function (sg) {
      var last = cleaned[cleaned.length - 1];
      if (last && sg.t1 - sg.t0 < 0.4) { last.t1 = sg.t1; return; }
      if (last && last.name === sg.name) { last.t1 = sg.t1; return; }
      cleaned.push({ t0: sg.t0, t1: sg.t1, name: sg.name });
    });
    return cleaned;
  }

  function analyse(x, progress) {
    var dur = x.length / SR, rep = function (a, b) { return function (p) { if (progress) progress(a + (b - a) * p); }; };
    var tempo = estimateTempo(x, rep(0, 0.5));
    var tuning = estimateTuning(x);
    var ch = chromaFrames(x, tuning, rep(0.5, 0.95));
    var key = estimateKey(ch.chroma, ch.energy);
    var chords = estimateChords(ch.chroma, ch.energy, key, HOP_C / SR);
    // chord names offset: frame i covers [i*hop, i*hop+N], centre it
    var shift = (N_C / 2 - HOP_C / 2) / SR;
    chords.forEach(function (c) { c.t0 = Math.max(0, c.t0 + shift * (c.t0 > 0 ? 1 : 0)); c.t1 = Math.min(dur, c.t1 + shift); });
    if (progress) progress(1);
    return { duration: dur, tempo: tempo, key: key, tuningCents: Math.round(tuning * 100), chords: chords };
  }

  var api = { analyse: analyse, SR: SR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.FaindKeyBpm = api;
})(typeof self !== 'undefined' ? self : this);
