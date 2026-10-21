/* =====================================================================
   FAIND GAME — News Rush: suoni ed effetti, generati in codice (Web Audio)
   ---------------------------------------------------------------------
   Niente file audio e nessuna licenza da rispettare: gli effetti e la
   musica synth anni 80 (composta per FAIND) sono sintetizzati qui. Il contesto
   audio nasce solo dopo un gesto dell'utente; con il muto attivo (ricordato
   sul dispositivo) non esce alcun suono. Con pausa e uscita dal gioco la
   musica si ferma e le risorse vengono rilasciate.
   ===================================================================== */
const KEY = 'faind-game-mute';

export class Audio8 {
  constructor() {
    this.ctx = null; this.master = null; this.timer = 0; this.musicOn = false; this.step = 0; this.nextT = 0;
    this.muted = false;
    try { this.muted = localStorage.getItem(KEY) === '1'; } catch (e) {}
  }

  /** Va chiamato da un gesto dell'utente (START, tocco sul comando audio). */
  unlock() {
    // iPhone: di default WebAudio tace con l'interruttore del silenzioso; la sessione audio "playback" lo rende udibile (Safari 17+)
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 0.5, buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
      this.resume();
      // buffer vuoto riprodotto dentro il gesto: sblocca l'audio su iOS
      const b = this.ctx.createBuffer(1, 1, 22050), src = this.ctx.createBufferSource();
      src.buffer = b; src.connect(this.ctx.destination); src.start(0);
    } catch (e) { this.ctx = null; }
  }

  setMuted(m) {
    this.muted = !!m;
    try { localStorage.setItem(KEY, this.muted ? '1' : '0'); } catch (e) {}
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.9;
  }

  _tone(type, f0, f1, t0, dur, vol) {
    const c = this.ctx; if (!c || this.muted) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  _noise(t0, dur, vol, f0, f1) {
    const c = this.ctx; if (!c || this.muted || !this.noise) return;
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; fl.type = 'bandpass'; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(t0); s.stop(t0 + dur + 0.02);
  }

  sfx(name, n) {
    const c = this.ctx; if (!c || this.muted) return;
    if (c.state !== 'running') this.resume();     // se il contesto è sospeso i suoni partono appena riprende
    const t = c.currentTime;
    switch (name) {
      case 'puff': this._noise(t, 0.16, 0.22, 2400, 700); break;                                   // soffio pneumatico
      case 'collect': this._tone('square', 660, 990, t, 0.09, 0.16); this._tone('square', 990, 1320, t + 0.07, 0.09, 0.12); break;
      case 'deliver': {
        const base = [523, 659, 784, 1047, 1319];
        for (let i = 0; i < Math.min(5, n || 1); i++) this._tone('square', base[i], base[i], t + i * 0.07, 0.12, 0.15);
        this._noise(t, 0.22, 0.18, 1800, 500); break;
      }
      case 'drop': this._tone('sawtooth', 300, 70, t, 0.28, 0.2); this._noise(t, 0.1, 0.15, 800, 200); break;
      case 'level': [523, 659, 784, 1047].forEach((f, i) => this._tone('square', f, f, t + i * 0.09, 0.14, 0.16)); break;
      case 'newlevel': {   // fanfara di cambio livello: scala che sale, nota lunga e soffio finale
        [392, 523, 659, 784, 1047].forEach((f, i) => this._tone('square', f, f, t + i * 0.1, 0.16, 0.17));
        this._tone('square', 1047, 1568, t + 0.5, 0.5, 0.15); this._tone('triangle', 262, 262, t + 0.5, 0.6, 0.22);
        this._noise(t, 0.35, 0.14, 500, 4000); break;
      }
      case 'arm': this._tone('sawtooth', 140, 320, t, 0.22, 0.1); this._noise(t, 0.18, 0.1, 900, 2200); break;   // il braccio si estende
      case 'full': this._tone('triangle', 880, 880, t, 0.07, 0.15); this._tone('triangle', 880, 880, t + 0.1, 0.07, 0.15); break;
      case 'beep': this._tone('square', 440, 440, t, 0.14, 0.15); break;
      case 'go': this._tone('square', 880, 880, t, 0.3, 0.18); break;
      case 'end': [784, 659, 523, 392].forEach((f, i) => this._tone('square', f, f, t + i * 0.13, 0.2, 0.15)); break;
      case 'click': this._tone('square', 520, 520, t, 0.04, 0.1); break;
    }
  }

  /* Musica: ballata synth anni 80, 83 bpm, sol minore. Pad morbido, basso a battute di ottavo, arpeggio sui controtempi
     con eco puntato, melodia di triangoli leggermente scordati, batteria appena accennata. Sedici battute (circa 46 s) in loop. */
  startMusic() {
    if (!this.ctx || this.musicOn) return;
    const c = this.ctx;
    if (!this.mus) {
      this.mus = c.createGain(); this.mus.gain.value = 1; this.mus.connect(this.master);
      this.echo = c.createGain(); this.echo.gain.value = 1;
      const dly = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
      dly.delayTime.value = 60 / 83 * 0.75; fb.gain.value = 0.34; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.3;
      this.echo.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(wet); wet.connect(this.mus);
    }
    this.musicOn = true; this.step = 0; this.nextT = c.currentTime + 0.08;
    this.timer = setInterval(() => this._schedule(), 90);
  }
  stopMusic() { this.musicOn = false; if (this.timer) clearInterval(this.timer); this.timer = 0; }
  pause() { this.stopMusic(); }
  resume() { if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') { try { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} } }
  /** Libera tutto: da chiamare quando si esce dal gioco. */
  dispose() {
    this.stopMusic();
    if (this.ctx) { try { this.ctx.close(); } catch (e) {} }
    this.ctx = null; this.master = null; this.mus = null; this.echo = null;
  }

  /** Nota con attacco e rilascio morbidi (le note della musica non devono "schioccare"). */
  _soft(type, f, t0, dur, vol, dest, att, detune) {
    const c = this.ctx; if (!c || this.muted) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + att); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.03);
  }

  _schedule() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    const sp = 60 / 83 / 4;   // una semicroma
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const midi = (n) => { const m = /^([A-G])([#b]?)(\d)$/.exec(n); return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
    // accordi (radice come classe di nota, terza minore o maggiore): Gm Eb Bb F | Gm Eb Bb F | Eb F Gm Gm | Eb F Bb D
    const CH = [[7, 3], [3, 4], [10, 4], [5, 4], [7, 3], [3, 4], [10, 4], [5, 4], [3, 4], [5, 4], [7, 3], [7, 3], [3, 4], [5, 4], [10, 4], [2, 4]];
    // melodia: per battuta, coppie [nota, durata in semicrome]; le pause sono null
    const ML = [
      [['D5', 4], ['G5', 4], ['F5', 2], ['D5', 2], ['Bb4', 4]], [['Bb4', 4], ['Eb5', 6], ['D5', 2], ['Bb4', 4]],
      [['D5', 4], ['F5', 4], ['D5', 2], ['C5', 2], ['D5', 4]], [['C5', 6], ['A4', 2], ['C5', 4], ['F5', 4]],
      [['G5', 6], ['F5', 2], ['D5', 4], ['Bb4', 4]], [['G5', 4], ['Eb5', 4], ['D5', 4], ['Eb5', 4]],
      [['F5', 4], ['D5', 4], ['Bb4', 4], ['D5', 4]], [['A4', 4], ['C5', 4], ['F5', 8]],
      [['Eb5', 4], ['G5', 4], ['Bb5', 8]], [['A5', 6], ['G5', 2], ['F5', 8]],
      [['D5', 4], ['G5', 4], ['Bb5', 6], ['A5', 2]], [['G5', 12], [null, 4]],
      [['Eb5', 4], ['G5', 4], ['Bb5', 4], ['G5', 4]], [['A5', 4], ['F5', 4], ['C6', 8]],
      [['Bb5', 6], ['A5', 2], ['F5', 4], ['D5', 4]], [['A5', 4], ['F#5', 4], ['D5', 4], ['F#5', 4]]
    ];
    const LEAD = [];   // passo → [nota, durata]
    ML.forEach((bar, b) => { let p = b * 16; for (const [n, d] of bar) { if (n) LEAD[p] = [midi(n), d]; p += d; } });
    while (this.nextT < c.currentTime + 0.35) {
      const i = this.step % 256, bar = i >> 4, s = i & 15, t = this.nextT;
      if (!this.muted) {
        const [pc, third] = CH[bar], root = 48 + pc, tones = [0, third, 7];
        if (s === 0) for (const iv of tones) { this._soft('triangle', hz(root + 12 + iv), t, sp * 16.5, 0.032, this.mus, 0.35); this._soft('sine', hz(root + iv), t, sp * 16.5, 0.03, this.mus, 0.35); }
        if (s % 2 === 0) this._soft('triangle', hz(root), t, sp * 1.7, s % 8 === 0 ? 0.2 : 0.15, this.mus, 0.012);
        if (s % 2 === 1) { const k = (s >> 1) % 8, iv = [0, third, 7, 12, 7, third, 12, third][k]; this._soft('triangle', hz(root + 12 + iv), t, sp * 1.9, 0.05, this.echo, 0.01); }
        const L = LEAD[i];
        if (L) {
          const d = sp * L[1] * 0.96;
          this._soft('triangle', hz(L[0]), t, d, 0.075, this.echo, 0.03, -7); this._soft('triangle', hz(L[0]), t, d, 0.075, this.mus, 0.03, 7);
          this._soft('sine', hz(L[0] + 12), t, d, 0.012, this.mus, 0.05);
        }
        if (s === 0 || s === 8) this._tone('sine', 120, 45, t, 0.16, 0.26);
        if (s === 4 || s === 12) this._noise(t, 0.13, 0.07, 2200, 1200);
        if (s % 2 === 0) this._noise(t, 0.035, s % 4 === 0 ? 0.05 : 0.03, 7000, 6500);
      }
      this.step++; this.nextT += sp;
    }
  }
}
