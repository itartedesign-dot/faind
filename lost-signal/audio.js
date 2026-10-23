/* =====================================================================
   FAIND LOST SIGNAL — suoni e musica, generati in codice (Web Audio)
   ---------------------------------------------------------------------
   Stessa base di News Rush e Signal Maze (contesto audio creato solo dopo un gesto dell'utente, muto ricordato sul
   dispositivo, risorse rilasciate all'uscita). Tema chiptune originale e discreto: 100 bpm, re minore, basso a quarti,
   arpeggio morbido con eco, melodia a onde quadre e nessuna batteria invadente. Sedici battute (circa 38 s) in loop.
   ===================================================================== */
import { Audio8 as Base } from '../faind-game/audio.js?v=20261023g';

const BPM = 100;
const CHORDS_A = [[38, 0], [34, 1], [41, 1], [36, 1], [38, 0], [34, 1], [43, 0], [33, 1], [38, 0], [34, 1], [41, 1], [36, 1], [43, 0], [33, 1], [38, 0], [38, 0]];   // [radice, 1 = accordo maggiore]
const MELODY_A = [
  [['A4', 6], ['D5', 2], ['F5', 4], ['E5', 4]], [['D5', 6], ['F5', 2], ['E5', 4], ['D5', 4]],
  [['C5', 6], ['F5', 2], ['A5', 4], ['G5', 4]], [['E5', 8], ['G5', 4], [null, 4]],
  [['A4', 4], ['D5', 4], ['F5', 4], ['A5', 4]], [['G5', 6], ['F5', 2], ['D5', 4], ['Bb4', 4]],
  [['Bb4', 4], ['D5', 4], ['G5', 4], ['F5', 4]], [['E5', 6], ['C#5', 2], ['A4', 8]],
  [['D5', 4], ['F5', 4], ['A5', 8]], [['G5', 4], ['F5', 4], ['D5', 8]],
  [['A5', 6], ['G5', 2], ['F5', 4], ['C5', 4]], [['D5', 4], ['E5', 4], ['G5', 8]],
  [['Bb5', 6], ['A5', 2], ['G5', 4], ['D5', 4]], [['E5', 4], ['A5', 4], ['G5', 4], ['E5', 4]],
  [['F5', 6], ['E5', 2], ['D5', 8]], [['D5', 12], [null, 4]]
];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => { const m = /^([A-G])([#b]?)(\d)$/.exec(n); return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const leadOf = (melody) => { const lead = []; melody.forEach((bar, b) => { let p = b * 16; for (const [n, d] of bar) { if (n) lead[p] = [midi(n), d]; p += d; } }); return lead; };
// seconda musica (dal livello 10, poi alternata ogni 10 livelli): 124 bpm, mi minore, basso a crome, più incalzante
const CHORDS_B = [[40, 0], [36, 1], [43, 1], [38, 1], [40, 0], [36, 1], [38, 1], [35, 1], [33, 0], [40, 0], [36, 1], [38, 1], [33, 0], [36, 1], [35, 1], [40, 0]];
const MELODY_B = [
  [['B4', 4], ['E5', 4], ['G5', 4], ['F#5', 4]], [['E5', 8], ['G5', 4], ['E5', 4]],
  [['D5', 4], ['G5', 4], ['B5', 4], ['A5', 4]], [['F#5', 8], ['A5', 4], ['D5', 4]],
  [['G5', 4], ['B5', 4], ['E6', 4], ['D6', 4]], [['C6', 4], ['G5', 4], ['E5', 4], ['G5', 4]],
  [['A5', 6], ['F#5', 2], ['D5', 4], ['F#5', 4]], [['D#5', 4], ['F#5', 4], ['B5', 8]],
  [['A4', 4], ['C5', 4], ['E5', 4], ['A5', 4]], [['G5', 8], ['E5', 4], ['B4', 4]],
  [['E5', 4], ['G5', 4], ['C6', 4], ['B5', 4]], [['A5', 4], ['F#5', 4], ['D5', 4], ['F#5', 4]],
  [['C5', 4], ['E5', 4], ['A5', 4], ['G5', 4]], [['E5', 4], ['G5', 4], ['C6', 8]],
  [['D#5', 4], ['F#5', 4], ['A5', 4], ['B5', 4]], [['E5', 12], [null, 4]]
];
const THEMES = [{ bpm: BPM, chords: CHORDS_A, lead: leadOf(MELODY_A), eighths: false }, { bpm: 124, chords: CHORDS_B, lead: leadOf(MELODY_B), eighths: true }];

export class Audio8 extends Base {
  sfx(name, n) {
    const c = this.ctx; if (!c || this.muted) return;
    if (c.state !== 'running') this.resume();
    const t = c.currentTime;
    switch (name) {
      case 'step': this._tone('square', n ? 330 : 294, n ? 262 : 247, t, 0.06, 0.07); break;
      case 'turn': this._tone('square', 700, 700, t, 0.025, 0.05); break;
      case 'jump': this._tone('square', 300, 880, t, 0.2, 0.11); this._tone('triangle', 150, 440, t, 0.2, 0.12); break;
      case 'land': this._tone('triangle', 180, 90, t, 0.09, 0.16); this._noise(t, 0.05, 0.05, 1600, 600); break;
      case 'news': this._tone('square', 880, 1320, t, 0.08, 0.13); this._tone('square', 1320, 1760, t + 0.08, 0.1, 0.12); this._tone('triangle', 660, 660, t, 0.2, 0.1); break;
      case 'flash': this._tone('sawtooth', 180, 1900, t, 0.28, 0.11); this._tone('square', 1568, 2093, t + 0.26, 0.2, 0.08); this._noise(t, 0.3, 0.07, 800, 5000); break;
      case 'flashEnd': this._tone('triangle', 740, 420, t, 0.18, 0.1); break;
      case 'fall': this._tone('square', 700, 70, t, 0.7, 0.12); this._tone('sawtooth', 330, 55, t + 0.04, 0.6, 0.07); break;
      case 'life': this._tone('sawtooth', 220, 60, t, 0.4, 0.14); this._noise(t, 0.25, 0.14, 900, 120); break;
      case 'door': this._noise(t, 0.35, 0.09, 400, 1800); this._tone('triangle', 220, 330, t, 0.35, 0.12); [523, 659, 784, 1047].forEach((f, i) => this._tone('square', f, f, t + 0.3 + i * 0.08, 0.12, 0.12)); break;
      case 'clear': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this._tone('square', f, f, t + i * 0.08, 0.14, 0.13)); this._tone('triangle', 262, 262, t, 0.7, 0.2); break;
      case 'tick': this._tone('square', 1200, 1200, t, 0.03, 0.06); break;
      case 'ready': this._tone('square', 660, 990, t, 0.12, 0.1); this._tone('square', 990, 1320, t + 0.1, 0.16, 0.1); break;
      case 'win': [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => this._tone('square', f, f, t + i * 0.12, 0.2, 0.14)); this._tone('triangle', 262, 262, t, 1.3, 0.22); break;
      case 'end': [659, 587, 494, 392, 330].forEach((f, i) => this._tone('square', f, f, t + i * 0.15, 0.22, 0.13)); break;
      case 'bonus': [880, 1175, 1568].forEach((f, i) => this._tone('square', f, f * 1.02, t + i * 0.07, 0.12, 0.12)); this._tone('triangle', 440, 880, t, 0.3, 0.1); break;
      case 'rockWarn': this._tone('square', 220, 220, t, 0.07, 0.09); this._tone('square', 220, 220, t + 0.18, 0.07, 0.09); this._tone('square', 262, 262, t + 0.36, 0.1, 0.09); break;
      case 'hit': this._noise(t, 0.22, 0.16, 700, 90); this._tone('square', 260, 70, t, 0.3, 0.14); this._tone('sawtooth', 150, 45, t + 0.02, 0.35, 0.1); break;
      case 'click': this._tone('square', 520, 520, t, 0.04, 0.1); break;
    }
  }

  /** musica del livello: 0 la prima, 1 la seconda; il cambio riparte dalla prima battuta */
  setTrack(n) {
    n = n ? 1 : 0; if (n === (this.track || 0)) return;
    this.track = n; this.step = 0;
    if (this.dly) this.dly.delayTime.value = 60 / THEMES[n].bpm * 0.75;
  }

  startMusic() {
    if (!this.ctx || this.musicOn) return;
    const c = this.ctx;
    if (!this.mus) {
      this.mus = c.createGain(); this.mus.gain.value = 0.85; this.mus.connect(this.master);
      this.echo = c.createGain(); this.echo.gain.value = 1;
      const dly = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
      this.dly = dly; dly.delayTime.value = 60 / THEMES[this.track || 0].bpm * 0.75; fb.gain.value = 0.34; lp.type = 'lowpass'; lp.frequency.value = 2200; wet.gain.value = 0.3;
      this.echo.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(wet); wet.connect(this.mus);
    }
    this.musicOn = true; this.step = 0; this.nextT = c.currentTime + 0.08;
    this.timer = setInterval(() => this._schedule(), 90);
  }

  _schedule() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    const T = THEMES[this.track || 0], sp = 60 / T.bpm / 4;
    while (this.nextT < c.currentTime + 0.35) {
      const i = this.step % 256, bar = i >> 4, s = i & 15, t = this.nextT;
      if (!this.muted) {
        const [root, maj] = T.chords[bar], third = maj ? 4 : 3;
        // basso: quarti, con la quinta sul terzo quarto
        if (s % 4 === 0) this._soft('triangle', hz(root + (s === 8 ? 7 : 0)), t, sp * 3.4, s === 0 ? 0.19 : 0.14, this.mus, 0.01);
        if (T.eighths && s % 4 === 2) this._soft('triangle', hz(root + 12), t, sp * 1.6, 0.07, this.mus, 0.008);
        // arpeggio lento sulle crome, con eco
        if (s % 2 === 0) { const arp = [0, third, 7, 12][(s >> 1) % 4]; this._soft('square', hz(root + 24 + arp), t, sp * 1.7, 0.016, this.echo, 0.004); }
        // pad lungo
        if (s === 0) for (const iv of [0, third, 7]) this._soft('triangle', hz(root + 12 + iv), t, sp * 16.5, 0.024, this.mus, 0.3);
        // melodia a onde quadre, leggermente scordata a coppie
        const L = T.lead[i];
        if (L) { const d = sp * L[1] * 0.94; this._soft('square', hz(L[0]), t, d, 0.04, this.mus, 0.012, -5); this._soft('square', hz(L[0]), t, d, 0.03, this.echo, 0.012, 6); }
        // battito appena accennato
        if (s === 0 || s === 8) this._tone('sine', 120, 48, t, 0.12, 0.16);
        if (s === 12) this._noise(t, 0.08, 0.04, 2400, 1500);
        if (s % 4 === 2) this._noise(t, 0.025, 0.02, 7500, 7000);
      }
      this.step++; this.nextT += sp;
    }
  }
}
