/* =====================================================================
   FAIND GAME — News Rush: le pose di Faindo (immagini pixel art)
   ---------------------------------------------------------------------
   Nove PNG con vera trasparenza, tutti dello stesso riquadro (226 × 261 px):
   stessa scala, corpo allineato e suole sul bordo inferiore, quindi passando
   da una posa all'altra Faindo non cambia grandezza né posizione. Il centro del
   riquadro è l'ancoraggio comune (tra i piedi, sulla linea del pavimento).
     1 fermo · 2 piede destro sollevato · 3 piede sinistro sollevato
     4-6 come 1-3 ma con il braccio sinistro (dello schermo) alzato · 7-9 come 1-3 con il braccio destro (dello schermo) alzato
   Destra e sinistra sono quelle di Faindo. Le pose si precaricano prima di START.
   ===================================================================== */
export const POSES = 9;
export const STAND_PX = 256;          // altezza della posa ferma (punta dell'antenna → suola) dentro il riquadro
export const STAND_SHARE = 0.22;      // altezza di Faindo in frazione della larghezza dell'area di gioco
export const STEP_SECONDS = 0.11;     // un fotogramma di camminata
const WALK = [1, 2, 1, 3];            // 1 → 2 → 1 → 3
const V = '20261021o';

/** Carica e decodifica tutte le pose. Si risolve con le immagini (o null se manca qualcosa: il gioco usa allora il disegno di riserva). */
export function loadPoses() {
  const loads = [];
  for (let i = 1; i <= POSES; i++) {
    loads.push(new Promise((res) => {
      const im = new Image();
      im.onload = () => { (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => res(im)); };
      im.onerror = () => res(null);
      im.src = 'sprites/faindo-' + i + '.png?v=' + V;
    }));
  }
  return Promise.all(loads).then((a) => (a.every(Boolean) && a.every((im) => im.naturalWidth === a[0].naturalWidth && im.naturalHeight === a[0].naturalHeight) ? a : null));
}

/**
 * Posa da mostrare (1..9). walkClock: secondi di cammino continuo (0 se fermo); reach: -1 braccio sinistro alzato, 1 destro, 0 nessuno
 * (lato dello schermo, verso la notizia presa). Da fermo: 1; in cammino: 1 → 2 → 1 → 3; con il braccio alzato la stessa posa del passo (+3 sinistro, +6 destro).
 */
export function poseNumber(moving, walkClock, reach) {
  const base = moving ? WALK[Math.floor(walkClock / STEP_SECONDS) % 4] : 1;
  return reach < 0 ? base + 3 : reach > 0 ? base + 6 : base;
}
