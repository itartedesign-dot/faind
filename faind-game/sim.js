/* =====================================================================
   FAIND GAME — News Rush: il motore di gioco
   ---------------------------------------------------------------------
   Questo file è l'unica fonte delle regole e lo usano sia il browser (per
   giocare) sia il server della classifica (game-api/worker.js, per rifare la
   partita e verificare il punteggio). Per questo è deterministico:
   • passo fisso di 1/60 s: tempo e movimento non dipendono dai fotogrammi;
   • numeri casuali da un seme (mulberry32) deciso dal server a inizio partita;
   • unico ingresso del giocatore: il punto verso cui Faindo vuole andare
     (target), registrato con il tick in cui è cambiato.
   Nessuna funzione trascendente (sin, cos…): solo + − × ÷ e confronti, che
   danno lo stesso risultato in ogni browser e sul server.

   Tra un livello e l'altro il motore si ferma 2 s (rest): il tempo di partita non scorre.
   Fine partita: allo scadere dei 180 s oppure al terzo rotolo perso (GAME OVER).

   TUTTI I PARAMETRI DI DIFFICOLTÀ STANNO IN CONFIG, qui sotto.
   ===================================================================== */

export const CONFIG = {
  // scena (unità logiche: lo schermo è 180 × 240, ogni unità è un pixel dell'arte)
  W: 180, H: 240,
  PLATFORM_Y: 136,                       // piano su cui cammina Faindo (i piedi stanno qui)
  VENT_Y: 40,                            // bocca delle bocchette sul soffitto, da dove cadono i rotoli
  VENTS: [20, 55, 90, 125, 160],         // ascisse delle bocchette
  DELIVER_X: 90, DELIVER_HALF: 11,       // bocchetta centrale di consegna

  // tempo
  TPS: 60,                               // tick al secondo
  LEVELS: 5, LEVEL_SECONDS: 36,          // 5 livelli da 36 s = 180 s
  CAPACITY: [5, 4, 3, 2, 1],             // notizie trasportabili per livello

  // Faindo
  FX_MIN: 12, FX_MAX: 168,               // limiti sinistro e destro della piattaforma
  MOVE_SPEED: 110,                       // unità/s, uguale in tutti i livelli
  PICK_HALF_W: 13, PICK_HEIGHT: 36,      // zona di raccolta: un po' più larga dello sprite (collisione permissiva)
  ROLL_HALF_W: 3, ROLL_HALF_H: 6,        // mezza dimensione del rotolo

  // rotoli: velocità di caduta (unità/s), pausa media tra due uscite (s) e preavviso luminoso (tick)
  FALL_SPEED: [58, 60, 62, 64, 66],
  SPAWN_GAP: [1.15, 1.25, 1.2, 1.15, 1.1],   // dal livello 3 escono più notizie (la capacità cala, ma l'equità sotto le tiene raggiungibili)
  SPAWN_JITTER: 0.25,                    // variazione casuale della pausa (± frazione)
  WARN_TICKS: 36,                        // la bocchetta si illumina prima del rilascio
  FIRST_SPAWN_TICK: 30,
  // equità: due rotoli non possono mai richiedere a Faindo di coprire più strada di quanto riesca
  // (REACH_FACTOR della sua velocità massima, più REACH_SLACK unità di margine)
  REACH_FACTOR: 0.7, REACH_SLACK: 11,

  // passaggio di livello: il gioco si ferma 2 s (popup LEVEL n), i rotoli in volo spariscono, il carico resta
  LEVEL_REST_TICKS: 120,

  // braccio che porge una notizia in più (da destra, ogni tanto da sinistra): dura al massimo 2,5 s
  ARM_GAP_MIN: 6.5, ARM_GAP_MAX: 10.5,   // secondi tra due bracci
  ARM_TICKS: 150, ARM_EXTEND: 24, ARM_RETRACT: 30,
  ARM_Y: 116,                            // altezza della notizia, all'altezza del busto di Faindo
  ARM_RIGHT_X: [126, 158], ARM_LEFT_X: [22, 54], ARM_LEFT_CHANCE: 0.3,
  ARM_FIRST_TICK: 360,

  // punteggio
  POINTS: 100, STREAK_STEP: 5, MAX_MULT: 5,
  RED_CHANCE: 0.07, RED_MIN_GAP: 7,       // ogni tanto esce un'edizione ROSSA: se Faindo la prende vale come 1 rotolo perso (non entra nel carico)
  RED_FIRST: 4,                          // la prima rossa non esce prima del quinto rotolo
  MAX_LOST: 3,                           // al terzo rotolo perso la partita finisce (GAME OVER)

  // verifica lato server
  MAX_INPUTS: 6000
};

export const END_TICK = CONFIG.LEVELS * CONFIG.LEVEL_SECONDS * CONFIG.TPS;   // 10800
export const LEVEL_TICKS = CONFIG.LEVEL_SECONDS * CONFIG.TPS;                // 2160

function rand(st) {   // mulberry32
  st.s = (st.s + 0x6D2B79F5) | 0;
  let t = Math.imul(st.s ^ (st.s >>> 15), 1 | st.s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function multFor(streak) {
  return Math.min(CONFIG.MAX_MULT, 1 + Math.floor(streak / CONFIG.STREAK_STEP));
}

export class Sim {
  constructor(seed) {
    this.seed = seed | 0;
    this.rng = { s: this.seed };
    this.tick = 0;
    this.done = false;
    this.over = false;                    // true se la partita è finita per i rotoli persi
    this.x = CONFIG.W / 2;
    this.target = this.x;
    this.dir = 0;                         // -1, 0, 1: solo per l'animazione
    this.level = 1;
    this.cap = CONFIG.CAPACITY[0];
    this.load = 0;
    this.score = 0;
    this.delivered = 0;
    this.lost = 0;
    this.streak = 0;
    this.mult = 1;
    this.rolls = [];                      // {id, x, y, vy, vent}
    this.pending = [];                    // {vent, at}: bocchette in preavviso
    this.nextId = 1;
    this.spawned = 0; this.sinceRed = 99;  // per dosare le edizioni rosse
    this.nextSpawn = CONFIG.FIRST_SPAWN_TICK;
    this.rest = 0;                        // tick di pausa rimasti al cambio livello
    this.steps = 0;                       // tutti i passi eseguiti, pause comprese (tempo reale di gioco)
    this.arm = null;                      // {side, xt, age, taken}
    this.nextArm = CONFIG.ARM_FIRST_TICK;
    this.events = [];                     // svuotati dal chiamante dopo ogni step
    this.inputs = [];                     // [tick, target]
  }

  /** Il giocatore cambia il punto verso cui andare. Registrato per la verifica. */
  input(target) {
    const t = Math.max(CONFIG.FX_MIN, Math.min(CONFIG.FX_MAX, Math.round(target)));
    if (t === this.target) return;
    this.target = t;
    this.inputs.push([this.tick, t]);
  }

  _emit(type, a, b) { this.events.push({ type, a, b }); }

  _pickVent(red) {
    const C = CONFIG, vt = C.FALL_SPEED[this.level - 1] / C.TPS;
    const fall = (C.PLATFORM_Y - C.ROLL_HALF_H - C.VENT_Y) / vt;
    const land = this.tick + C.WARN_TICKS + fall;
    const reach = C.REACH_FACTOR * C.MOVE_SPEED / C.TPS;
    const others = [];
    for (const r of this.rolls) if (!r.red) others.push([r.x, this.tick + (C.PLATFORM_Y - C.ROLL_HALF_H - r.y) / r.vy]);
    for (const p of this.pending) if (!p.red) others.push([C.VENTS[p.vent], p.at + fall]);
    const near = [];   // una rossa non cade mai sulla strada di un rotolo buono (stessa zona, tempi vicini)
    if (red) for (const o of others) near.push(o);
    const order = [0, 1, 2, 3, 4];
    for (let i = order.length - 1; i > 0; i--) {   // mescolo (Fisher–Yates) con il seme
      const j = Math.floor(rand(this.rng) * (i + 1));
      const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    for (const v of order) {
      let ok = true;
      // con capacità 1 (o 2) dopo ogni presa Faindo deve passare dalla bocchetta centrale: la strada tra due rotoli
      // buoni comprende il viaggio fino al centro; con capacità maggiore basta andare da uno all'altro
      const f = this.cap <= 1 ? 1 : this.cap === 2 ? 0.5 : 0;
      for (const o of others) {
        const travel = f * (Math.abs(C.VENTS[v] - C.DELIVER_X) + Math.abs(o[0] - C.DELIVER_X)) + (1 - f) * Math.abs(C.VENTS[v] - o[0]);
        if (travel - C.REACH_SLACK > reach * Math.abs(land - o[1])) { ok = false; break; }
      }
      if (ok && red) for (const o of near) if (Math.abs(C.VENTS[v] - o[0]) < 32 && Math.abs(land - o[1]) < 55) { ok = false; break; }
      if (ok) return v;
    }
    return -1;
  }

  _deliver() {
    const C = CONFIG;
    let gained = 0;
    const n = this.load;
    for (let i = 0; i < n; i++) {
      const m = multFor(this.streak);          // il moltiplicatore si calcola per ogni notizia
      gained += C.POINTS * m;
      this.streak++;
      this.delivered++;
    }
    this.mult = multFor(this.streak);
    this.score += gained;
    this.load = 0;
    this._emit('deliver', n, gained);
  }


  /** Posizione attuale del braccio: {side, x, prog, taken} oppure null. */
  armState() {
    const a = this.arm; if (!a) return null;
    const C = CONFIG, back = C.ARM_TICKS - C.ARM_RETRACT;
    const prog = a.age < C.ARM_EXTEND ? a.age / C.ARM_EXTEND : a.age >= back ? Math.max(0, 1 - (a.age - back) / C.ARM_RETRACT) : 1;
    const edge = a.side > 0 ? C.W + 8 : -8;
    return { side: a.side, x: edge + (a.xt - edge) * prog, prog, taken: a.taken };
  }

  _arm() {
    const C = CONFIG;
    if (!this.arm) {
      if (this.tick >= this.nextArm && this.tick < END_TICK - 200 && this.load < this.cap) {
        const left = rand(this.rng) < C.ARM_LEFT_CHANCE, r = left ? C.ARM_LEFT_X : C.ARM_RIGHT_X;
        const xt = r[0] + Math.floor(rand(this.rng) * (r[1] - r[0] + 1));
        this.arm = { side: left ? -1 : 1, xt, age: 0, taken: false };
        this._emit('arm', left ? -1 : 1);
      }
      if (!this.arm && this.tick >= this.nextArm) this.nextArm = this.tick + 30;   // pieno: riprova poco dopo
      return;
    }
    const a = this.arm; a.age++;
    const st = this.armState();
    if (!a.taken && st.prog >= 0.5 && this.load < C.CAPACITY[this.level - 1] && this.load < this.cap && Math.abs(st.x - this.x) <= C.PICK_HALF_W + C.ROLL_HALF_W + 2) {
      a.taken = true; this.load++;
      this._emit('collect', st.x, C.ARM_Y); this._emit('armtake', st.x);
      if (this.load >= this.cap) this._emit('full');
    }
    if (a.age >= C.ARM_TICKS) {
      this.arm = null;
      this.nextArm = this.tick + Math.round((C.ARM_GAP_MIN + rand(this.rng) * (C.ARM_GAP_MAX - C.ARM_GAP_MIN)) * C.TPS);
    }
  }

  /** Avanza di un tick (1/60 s). */
  step() {
    if (this.done) return;
    const C = CONFIG;
    this.steps++;
    // pausa tra i livelli: tutto fermo, il tempo di partita (tick) non scorre
    if (this.rest > 0) { this.rest--; this.dir = 0; return; }

    // 1. livello (cambia da solo ogni 36 s di gioco effettivo; il carico in eccesso resta)
    const lv = Math.min(C.LEVELS, Math.floor(this.tick / LEVEL_TICKS) + 1);
    if (lv !== this.level) {
      this.level = lv; this.cap = C.CAPACITY[lv - 1];
      this.rest = C.LEVEL_REST_TICKS; this.dir = 0;
      this.rolls = []; this.pending = []; this.arm = null;            // reset: si riparte da campo libero
      this.nextSpawn = this.tick + 50; this.nextArm = this.tick + 330;
      this._emit('level', lv, this.cap);
      return;
    }

    // 2. Faindo si muove verso il punto scelto
    const stepX = C.MOVE_SPEED / C.TPS, d = this.target - this.x;
    if (Math.abs(d) <= stepX) { this.x = this.target; this.dir = 0; }
    else { this.x += d > 0 ? stepX : -stepX; this.dir = d > 0 ? 1 : -1; }

    // 2b. il braccio con la notizia in più
    this._arm();

    // 3. uscita dei rotoli: preavviso luminoso, poi rilascio
    if (this.tick >= this.nextSpawn && this.tick < END_TICK - 150) {
      const redRoll = rand(this.rng);
      const red = redRoll < C.RED_CHANCE && this.spawned >= C.RED_FIRST && this.sinceRed >= C.RED_MIN_GAP;
      const v = this._pickVent(red);
      if (v < 0) this.nextSpawn = this.tick + 6;
      else {
        // edizione rossa: rara, mai due vicine, mai all'inizio (si pesca sempre, così la sequenza dipende solo dal seme)
        this.spawned++; this.sinceRed = red ? 0 : this.sinceRed + 1;
        this.pending.push({ vent: v, at: this.tick + C.WARN_TICKS, red });
        const gap = C.SPAWN_GAP[this.level - 1] * C.TPS * (1 - C.SPAWN_JITTER + 2 * C.SPAWN_JITTER * rand(this.rng));
        this.nextSpawn = this.tick + Math.max(20, Math.round(gap));
        this._emit('warn', v);
      }
    }
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const p = this.pending[i];
      if (this.tick >= p.at) {
        this.pending.splice(i, 1);
        this.rolls.push({ id: this.nextId++, x: C.VENTS[p.vent], y: C.VENT_Y, vy: C.FALL_SPEED[this.level - 1] / C.TPS, vent: p.vent, red: p.red });
        this._emit('release', p.vent);
      }
    }

    // 4. caduta, raccolta, rotoli persi (chi è raccolto o perso esce subito dalla simulazione)
    const pickTop = C.PLATFORM_Y - C.PICK_HEIGHT;
    const keep = [];
    for (const r of this.rolls) {
      r.y += r.vy;
      const inZone = Math.abs(r.x - this.x) <= C.PICK_HALF_W + C.ROLL_HALF_W &&
        r.y + C.ROLL_HALF_H >= pickTop && r.y - C.ROLL_HALF_H <= C.PLATFORM_Y;
      if (inZone && r.red) {                     // presa l'edizione rossa: vale come un rotolo perso
        this.lost++; this.streak = 0; this.mult = 1;
        this._emit('bad', r.x);
        if (this.lost >= C.MAX_LOST) this.over = true;
        continue;
      }
      if (inZone && !r.red && this.load < this.cap) {
        this.load++;
        this._emit('collect', r.x, r.y);
        if (this.load >= this.cap) this._emit('full');
        continue;
      }
      if (r.y + C.ROLL_HALF_H >= C.PLATFORM_Y) {
        if (r.red) { this._emit('redgone', r.x); continue; }   // la rossa lasciata cadere non costa nulla
        this.lost++; this.streak = 0; this.mult = 1;
        this._emit('drop', r.x);
        if (this.lost >= C.MAX_LOST) this.over = true;
        continue;
      }
      keep.push(r);
    }
    this.rolls = keep;
    if (this.over) { this.tick++; this.done = true; return; }   // GAME OVER: niente consegna, le notizie portate non valgono

    // 5. consegna automatica sulla bocchetta centrale (anche se si è raccolto proprio qui)
    if (this.load > 0 && Math.abs(this.x - C.DELIVER_X) <= C.DELIVER_HALF) this._deliver();

    this.tick++;
    if (this.tick >= END_TICK) this.done = true;
  }

  get resting() { return this.rest > 0; }
  get remainingTicks() { return Math.max(0, END_TICK - this.tick); }
}

/** Rifà una partita dal seme e dal registro dei comandi. Usato dal server per verificarla. */
export function replay(seed, inputs) {
  const sim = new Sim(seed);
  let i = 0;
  while (!sim.done) {
    while (i < inputs.length && inputs[i][0] <= sim.tick) { sim.target = inputs[i][1]; i++; }
    sim.step();
    sim.events.length = 0;
  }
  return sim;
}

/** Controlla la forma del registro comandi; restituisce il registro pulito o null. */
export function cleanInputs(raw) {
  if (!Array.isArray(raw) || raw.length > CONFIG.MAX_INPUTS) return null;
  const out = [];
  let last = 0;
  for (const e of raw) {
    if (!Array.isArray(e) || e.length !== 2) return null;
    const t = e[0], g = e[1];
    if (!Number.isInteger(t) || !Number.isInteger(g)) return null;
    if (t < last || t < 0 || t >= END_TICK) return null;
    if (g < CONFIG.FX_MIN || g > CONFIG.FX_MAX) return null;
    out.push([t, g]); last = t;
  }
  return out;
}
