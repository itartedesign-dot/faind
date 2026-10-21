/* =====================================================================
   FAIND GAME — News Rush: suoni ed effetti, generati in codice (Web Audio)
   ---------------------------------------------------------------------
   Niente file audio e nessuna licenza da rispettare: gli effetti e la
   musica chiptune (composta per FAIND) sono sintetizzati qui. Il contesto
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

  /* Musica: otto battute in la minore, 132 bpm, lead a onda quadra, basso triangolare, charleston di rumore */
  startMusic() {
    if (!this.ctx || this.musicOn) return;
    this.musicOn = true; this.step = 0; this.nextT = this.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this._schedule(), 90);
  }
  stopMusic() { this.musicOn = false; if (this.timer) clearInterval(this.timer); this.timer = 0; }
  pause() { this.stopMusic(); }
  resume() { if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') { try { const p = this.ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} } }
  /** Libera tutto: da chiamare quando si esce dal gioco. */
  dispose() {
    this.stopMusic();
    if (this.ctx) { try { this.ctx.close(); } catch (e) {} }
    this.ctx = null; this.master = null;
  }

  _schedule() {
    const c = this.ctx; if (!c || !this.musicOn) return;
    const sp = 60 / 132 / 2;   // un ottavo
    const NOTES = { A: 220, B: 246.94, C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, a: 440, b: 493.88, c: 523.25, d: 587.33, e: 659.25, g: 783.99 };
    const LEAD = 'a.c.e.d.c.b.a.E.|g.e.c.e.d.b.G.b.|a.c.e.a.g.e.d.c.|b.G.b.d.c.b.a...'.replace(/\|/g, '');
    const BASS = 'A.A.A.A.G.G.G.G.F.F.F.F.E.E.G.G.A.A.A.A.G.G.G.G.F.F.F.F.E.E.E.E.'.replace(/\./g, '');
    while (this.nextT < c.currentTime + 0.35) {
      const i = this.step, t = this.nextT;
      const L = LEAD[i % LEAD.length];
      if (!this.muted) {
        if (L && L !== '.' && NOTES[L]) this._tone('square', NOTES[L] * (i % 2 ? 1 : 1), NOTES[L], t, sp * 1.7, 0.09);
        const B = BASS[Math.floor(i / 1) % BASS.length];
        if (i % 2 === 0 && NOTES[B]) this._tone('triangle', NOTES[B] / 2, NOTES[B] / 2, t, sp * 1.8, 0.2);
        if (i % 2 === 1) this._noise(t, 0.04, 0.08, 6000, 5000);
      }
      this.step++; this.nextT += sp;
    }
  }
}
