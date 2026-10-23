# FAIND Lost Signal

Gioco di memoria ed esplorazione in pixel art (terzo gioco di FAIND, pagina `/lost-signal/`). 50 livelli. Il percorso di zolle sospese si vede 7 secondi, poi sparisce: Faindo lo ripercorre a memoria fino alla palazzina FAIND Newsroom, con 3 vite e 20 flash (3 secondi di luce ciascuno) per tutta la partita, senza limite di tempo.

## File

- `index.html`, `lost.css`: pagina e interfaccia (pannelli e pulsanti di News Rush, `../faind-game/game.css`).
- `levelgen.js`: analisi e generatore delle mappe. `tools/build-levels.mjs` genera le 50 mappe in `levels-data.js` (rigenerare, non modificare a mano): `node lost-signal/tools/build-levels.mjs`. Dal livello 10 ogni mappa porta anche ascensori e corsie delle rocce (`makeExtras`); le mappe 1-15 sono quelle di sempre.
- `levels.js`: accesso alle mappe (numero di livelli in `config.js`, `FAIND_LOST_LEVELS`).
- `sim.js`: motore (passo, orientamento, salto di esattamente due caselle, flash, caduta, punteggio). `art.js`: grafica. `audio.js`: musica e effetti sintetizzati. `game.js`: regia, comandi, pausa.
- `sprites/`: `sheet-source.png` (tavola di riferimento) e `sheet-newsroom.png` (palazzina chiusa/aperta e quattro rocce), `build-atlas.py` (ritaglio e riduzione, serve Pillow e numpy), `atlas.png`/`atlas.js` e le icone sciolte per la barra HTML.
- `test-lost.mjs`: prove automatiche (`node lost-signal/test-lost.mjs`).

## Regole in breve

- Passo di una casella per ogni scorrimento o tasto; tocco breve accanto a Faindo (o Maiusc + direzione) orienta senza muovere; salto di due caselle esatte (Spazio o JUMP); flash (F o FLASH).
- Percorso spento: il primo comando verso una casella senza zolla orienta soltanto Faindo e accende un bordo che pulsa piano (1,5 s); per cadere va ripetuto lo stesso comando in quella finestra. Il salto non cambia.
- Cadere nel vuoto toglie una vita e fa ripartire Faindo dalla zolla da cui è caduto, con tutto il percorso acceso per 2,5 secondi (si può muovere subito); giornali raccolti e flash restano. Con zero vite: GAME OVER.
- Dal livello 10: **ascensori** (piattaforme sempre accese che fanno la spola fra due fermate: si sale e si scende solo a piattaforma ferma, sopra ci si può girare quante volte si vuole senza cadere) e una **roccia** che rotola lungo una riga o colonna intera, entrando da fuori schermo dopo un avviso di 1,3 s (velocità da 3 a 4,2 caselle al secondo). Ogni zolla sulla corsia ha una zolla di lato: un passo e si è in salvo. Una roccia che tocca Faindo toglie una vita (2,5 s di protezione dopo il colpo). Dal livello 20: due ascensori e due rocce.
- Dal livello 20, uno ogni tre livelli (20, 23, 26…): +1 flash, aggiunto ai rimasti.
- Dal livello 10, lungo il percorso: **flash da raccogliere** (4 per livello, uno in più ogni 2 livelli, al massimo 8; +1 flash ciascuno) e un **mini Faindo** che regala una vita (al massimo 5). Posizioni fisse per livello (seme del livello, `levels.js`), mai su partenza, portone o giornali.
- Quattro zolle restano sempre accese lungo il percorso (tre dal livello 6, due dall'11, una dal 16).
- Punteggio una sola volta per livello: 1.000 per l'arrivo, 500 per giornale (massimo 2.500; +500 svolazza sul giornale quando lo si prende).

- Salvataggio: all'inizio di ogni livello il gioco salva livello, punteggio, vite e flash sul dispositivo (`faind-lost-save`). Dalla schermata iniziale: CONTINUE · LEVEL N oppure NEW GAME. Una partita ripresa non va in classifica né fa record (come il continue). Il salvataggio si cancella a game over o vittoria.

- Musica: due temi sintetizzati (`audio.js`). Il primo fino al livello 9, il secondo dal 10 al 19, il primo dal 20 al 29 e così via, alternando ogni 10 livelli.

## Record

Il record è separato dagli altri giochi (chiave `faind-lost-best` sul dispositivo). Finché `config.js` ha `FAIND_LOST_API = ''` il gioco lo dichiara e non mostra nessuna classifica globale.

**Da fare più tardi (serve Cloudflare):** il Worker della classifica di Lost Signal, derivato da `game-api/worker.js` con database e percorso `/leaderboard` separati; `sim.js` è deterministico e si può rifare sul server con i comandi registrati.