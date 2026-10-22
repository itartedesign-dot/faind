# FAIND Lost Signal

Gioco di memoria ed esplorazione in pixel art (terzo gioco di FAIND, pagina `/lost-signal/`). Il percorso di zolle sospese si vede 7 secondi, poi sparisce: Faindo lo ripercorre a memoria fino alla palazzina FAIND Newsroom, con 3 vite e 20 flash (3 secondi di luce ciascuno) per tutta la partita, senza limite di tempo.

## File

- `index.html`, `lost.css`: pagina e interfaccia (pannelli e pulsanti di News Rush, `../faind-game/game.css`).
- `levelgen.js`: analisi e generatore delle mappe. `tools/build-levels.mjs` genera le 15 mappe in `levels-data.js` (rigenerare, non modificare a mano): `node lost-signal/tools/build-levels.mjs`.
- `levels.js`: accesso alle mappe; oltre quelle salvate ne genera altre della stessa famiglia (numero di livelli in `config.js`, `FAIND_LOST_LEVELS`).
- `sim.js`: motore (passo, orientamento, salto di esattamente due caselle, flash, caduta, punteggio). `art.js`: grafica. `audio.js`: musica e effetti sintetizzati. `game.js`: regia, comandi, pausa.
- `sprites/`: `sheet-source.png` (tavola di riferimento), `build-atlas.py` (ritaglio e riduzione, serve Pillow e numpy), `atlas.png`/`atlas.js` e le icone sciolte per la barra HTML.
- `test-lost.mjs`: prove automatiche (`node lost-signal/test-lost.mjs`).

## Regole in breve

- Passo di una casella per ogni scorrimento o tasto; tocco breve accanto a Faindo (o Maiusc + direzione) orienta senza muovere; salto di due caselle esatte (Spazio o JUMP); flash (F o FLASH).
- Cadere nel vuoto toglie una vita e riporta alla partenza dello stesso percorso; giornali raccolti e flash restano. Con zero vite: GAME OVER.
- Punteggio una sola volta per livello: 1.000 per l'arrivo, 500 per giornale (massimo 2.500).

## Record

Il record è separato dagli altri giochi (chiave `faind-lost-best` sul dispositivo). Finché `config.js` ha `FAIND_LOST_API = ''` il gioco lo dichiara e non mostra nessuna classifica globale.

**Da fare più tardi (serve Cloudflare):** il Worker della classifica di Lost Signal, derivato da `game-api/worker.js` con database e percorso `/leaderboard` separati; `sim.js` è deterministico e si può rifare sul server con i comandi registrati.