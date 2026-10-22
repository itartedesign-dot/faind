/* =====================================================================
   FAIND SIGNAL MAZE — suoni e musica, generati in codice (Web Audio)
   ---------------------------------------------------------------------
   Stessa base di News Rush (contesto audio creato solo dopo un gesto dell'utente, muto ricordato sul dispositivo,
   risorse rilasciate all'uscita), con effetti propri e un tema chiptune originale: 124 bpm, la minore, onde quadre
   e triangolari, basso a ottavi, arpeggio con eco e batteria appena accennata. Sedici battute (circa 31 s) in loop.
   ===================================================================== */
import { Audio8 as Base } from '../faind-game/audio.js?v=20261023a';

const BPM = 124;
const CHORDS = [[45, 0], [41, 0], [48, 0], [43, 0], [45, 0], [41, 0], [48, 0], [43, 0], [38, 0], [45, 0], [40, 1], [45, 0], [38, 0], [41, 0], [40, 1], [40, 1]];   // [radice, 1 = accordo maggiore]
const MELODY = [
  [['E5', 4], ['A5', 4], ['G5', 2], ['E5', 2], ['C5', 4]], [['C5', 4], ['F5', 4], ['E5', 2], ['C5', 2], ['A4', 4]],
  [['E5', 4], ['G5', 4], ['E5', 2], ['D5', 2], ['C5', 4]], [['D5', 6], ['B4', 2], ['G4', 4], ['B4', 4]],
  [['E5', 4], ['A5', 4], ['B5', 2], ['A5', 2], ['G5', 4]], [['A5', 6], ['G5', 2], ['F5', 4], ['E5', 4]],
  [['G5', 4], ['E5', 4], ['C6', 8]], [['B5', 4], ['A5', 4], ['G5', 4], [null, 4]],
  [['F5', 4], ['A5', 4], ['D6', 4], ['A5', 4]], [['C6', 4], ['A5', 4], ['E5', 8]],
  [['G#5', 4], ['B5', 4], ['E6', 4], ['B5', 4]], [['A5', 8], ['E5', 4], ['C5', 4]],
  [['D5', 4], ['F5', 4], ['A5', 4], ['F5', 4]], [['C6', 6], ['A5', 2], ['F5', 8]],
  [['E5', 4], ['G#5', 4], ['B5', 4], ['G#5', 4]], [['E5', 12], [null, 4]]
];
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => { const m = /^([A-G])([#b]?)(\d)$/.exec(n); return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const LEAD = [];   // passo → [nota midi, durata in semicrome]
MELODY.forEach((bar, b) => { let p = b * 16; for (const [n, d] of bar) { if (n) LEAD[p] = [midi(n), d]; p += d; } });

export class Audio8 extends Base {
  sfx(name, n) {
    const c = this.ctx; if (!c || this.muted) return;
    if (c.state !== 'running') this.resume();
    const t = c.currentTime;
    switch (name) {
      case 'doc': this._tone('square', 1000, 1500, t, 0.07, 0.13); break;
      case 'key': this._tone('square', 660, 990, t, 0.08, 0.15); this._tone('square', 990, 1480, t + 0.07, 0.08, 0.14); this._tone('square', 1480, 1976, t + 0.14, 0.12, 0.12); break;
      case 'unlock': this._noise(t, 0.08, 0.2, 3000, 900); this._tone('square', 180, 180, t + 0.04, 0.06, 0.18); [523, 659, 784].forEach((f, i) => this._tone('square', f, f, t + 0.1 + i * 0.07, 0.1, 0.13)); break;
      case 'deliver': this._noise(t, 0.16, 0.14, 2600, 800); for (let i = 0; i < Math.min(4, 1 + Math.floor((n || 1) / 2)); i++) this._tone('square', [659, 784, 988, 1319][i], 0, t + 0.05 + i * 0.07, 0.1, 0.11); break;
      case 'office': [523, 659, 784, 1047, 1319].forEach((f, i) => this._tone('square', f, f, t + i * 0.07, 0.12, 0.15)); this._tone('triangle', 262, 262, t, 0.5, 0.22); this._tone('square', 1319, 1760, t + 0.36, 0.34, 0.12); break;
      case 'power': this._tone('sawtooth', 160, 1400, t, 0.5, 0.12); this._tone('square', 1568, 1568, t + 0.5, 0.08, 0.12); this._tone('square', 2093, 2093, t + 0.58, 0.14, 0.1); break;
      case 'powerEnd': this._tone('square', 880, 880, t, 0.1, 0.12); this._tone('square', 587, 587, t + 0.12, 0.16, 0.12); break;
      case 'tick': this._tone('square', 1320, 1320, t, 0.03, 0.08); break;
      case 'kill': this._noise(t, 0.2, 0.2, 2500, 300); this._tone('square', 900, 90, t, 0.2, 0.16); break;
      case 'hit': this._tone('sawtooth', 420, 55, t, 0.45, 0.22); this._noise(t, 0.3, 0.2, 1200, 120); break;
      case 'exitOn': [660, 990, 660, 990, 1320].forEach((f, i) => this._tone('square', f, f, t + i * 0.09, 0.1, 0.14)); break;
      case 'exit': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this._tone('square', f, f, t + i * 0.07, 0.13, 0.15)); this._tone('triangle', 262, 262, t + 0.1, 0.55, 0.2); this._noise(t, 0.3, 0.1, 500, 4000); break;
      case 'win': [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => this._tone('square', f, f, t + i * 0.11, 0.18, 0.15)); this._tone('triangle', 262, 262, t, 1.2, 0.24); break;
      case 'beep': this._tone('square', 440, 440, t, 0.14, 0.15); break;
      case 'go': this._tone('square', 880, 880, t, 0.3, 0.18); break;
      case 'end': [784, 659, 523, 392].forEach((f, i) => this._tone('square', f, f, t + i * 0.13, 0.2, 0.15)); break;
      case 'click': this._tone('square', 520, 520, t, 0.04, 0.1); break;
    }
  }

  startMusic() {
    if (!this.ctx || this.musicOn) return;
    const c = this.ctx;
    if (!this.mus) {
      this.mus = c.createGain(); this.mus.gain.value = 1; this.mus.connect(this.master);
      this.echo = c.createGain(); this.echo.gain.value = 1;
      const dly = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
      dly.delayTime.value = 60 / BPM * 0.75; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2600; wet.gain.value = 0.28;
      this.echo.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(wet); wet.connect(this.mus);
    }
    this.musicOn = true; this.step = 0; this.nextT = c.currentTime + 0.08;
    this.timer = setInterval(() => this._schedule(), 90);
  }

  _schedule() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    const sp = 60 / BPM / 4;
    while (this.nextT < c.currentTime + 0.35) {
      const i = this.step % 256, bar = i >> 4, s = i & 15, t = this.nextT;
      if (!this.muted) {
        const [root, maj] = CHORDS[bar], third = maj ? 4 : 3;
        // basso: ottavi con salto d'ottava
        if (s % 2 === 0) this._soft('triangle', hz(root + ((s >> 1) % 4 === 2 ? 12 : 0)), t, sp * 1.8, s % 8 === 0 ? 0.2 : 0.15, this.mus, 0.008);
        // arpeggio sulle semicrome, con eco
        const arp = [0, third, 7, 12, 7, third, 0, 7][s % 8]; this._soft('square', hz(root + 24 + arp), t, sp * 0.9, 0.022, this.echo, 0.004);
        // pad lungo
        if (s === 0) for (const iv of [0, third, 7]) this._soft('triangle', hz(root + 12 + iv), t, sp * 16.5, 0.026, this.mus, 0.25);
        // melodia a onde quadre, leggermente scordata a coppie
        const L = LEAD[i];
        if (L) { const d = sp * L[1] * 0.92; this._soft('square', hz(L[0]), t, d, 0.05, this.mus, 0.01, -5); this._soft('square', hz(L[0]), t, d, 0.04, this.echo, 0.01, 6); }
        // batteria: cassa sui tempi, rullante sui controtempi, charleston a ottavi
        if (s === 0 || s === 8 || (s === 10 && bar % 4 === 3)) this._tone('sine', 130, 45, t, 0.14, 0.26);
        if (s === 4 || s === 12) this._noise(t, 0.11, 0.07, 2600, 1400);
        if (s % 2 === 0) this._noise(t, 0.03, s % 4 === 0 ? 0.045 : 0.025, 7500, 7000);
      }
      this.step++; this.nextT += sp;
    }
  }
}
