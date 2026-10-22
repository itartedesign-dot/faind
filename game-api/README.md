# Server delle classifiche di FAIND GAME

Il sito resta statico su GitHub Pages: le classifiche condivise hanno bisogno di un piccolo server. Un solo Worker serve tre classifiche separate: **News Rush** (rotte `/session /score /name /leaderboard`), **Signal Maze** (`/maze/…`) e **Lost Signal** (`/lost/…`). È un **Cloudflare Worker con database D1** (il piano gratuito basta per il database; per il calcolo delle partite vedi "Costo di calcolo" più sotto). Il gioco funziona anche senza: finché `faind-game/config.js` ha `FAIND_GAME_API = ''` dichiara "classifica online non disponibile" e salva solo il record personale sul dispositivo.

## Cosa serve a Paolo (una volta sola, circa 10 minuti)

1. Account gratuito su cloudflare.com e, sul computer, `npm i -g wrangler` poi `wrangler login`.
2. Da questa cartella (`game-api/`):
   - `wrangler d1 create faind-game` → copia il `database_id` stampato dentro `wrangler.toml`
   - `wrangler d1 execute faind-game --remote --file=schema.sql` (si può rilanciare sul database esistente: crea solo le tabelle mancanti e non tocca i punteggi di News Rush)
   - `wrangler secret put SESSION_SECRET` → incolla una frase lunga e casuale (resta solo sul server)
   - `wrangler deploy` (prima rigenera da solo `engines/lost/`, vedi sotto) → stampa l'indirizzo del Worker, tipo `https://faind-game-api.<account>.workers.dev`
3. Lo stesso indirizzo va in `faind-game/config.js`, `signal-maze/config.js` e `lost-signal/config.js` (`FAIND_GAME_API`, `FAIND_MAZE_API`, `FAIND_LOST_API`). In `faind-game/config.js` metti l'indirizzo (senza barra finale): `window.FAIND_GAME_API = 'https://faind-game-api.<account>.workers.dev';` e pubblica.
4. Se il sito risponde anche da un altro indirizzo, aggiungilo a `ALLOWED_ORIGINS` in `wrangler.toml` (ora: `https://faind.org` e `https://www.faind.org`; localhost è già ammesso per le prove).

## Come funziona la verifica (News Rush)
- `POST /session`: il server decide il seme dei rotoli e firma un gettone (limite di richieste per IP).
- Il browser registra solo i comandi di Faindo. `POST /score`: il server rifà la partita con lo stesso motore (`faind-game/sim.js`) e calcola il punteggio da solo; controlla firma, durata reale (almeno 172 s), comandi validi e che il gettone non sia già usato.
- `POST /name`: se il punteggio entra in una Top 10 arriva un "claim" firmato; con quello si registrano tre lettere A–Z e la nazione (una sola volta).
- `GET /leaderboard`: Top 10 settimanale (lunedì 00:00 – domenica, ora di Roma, calcolata sul server) e assoluta. Pari punteggio: precede chi è stato registrato prima dal server.

## Prove in locale
- `node game-api/test-sim.mjs`, `node --no-warnings game-api/test-worker.mjs` e `node --no-warnings game-api/test-games.mjs` (motore, verifica, doppi invii, settimane, limiti; News Rush, Maze e Lost).
- `node --no-warnings game-api/dev-server.mjs` avvia un server di prova con database in memoria su `http://localhost:8124`.

## Signal Maze e Lost Signal
- **Dati**: tabelle `game_sessions` e `game_scores` con la colonna `game` (`maze` | `lost`), definite in `schema.sql`. Ogni gioco ha Top 10 settimanale e assoluta sue; un gettone o un claim firmato per un gioco non vale per un altro (i gettoni di News Rush non cambiano formato).
- **Verifica**: `verify.js` rifà la partita da zero. Maze con `signal-maze/sim.js` (seme del server, comandi per tick; la durata minima è quella della partita, al massimo 9:00 di gioco). Lost con il suo motore a passi fissi di 5 ms (comandi `[ms, codice]`: passo, orientamento, salto, flash); un comando che il gioco non avrebbe accettato, tempi non multipli di 5 ms o una partita che non finisce fanno respingere l'invio. Il punteggio inviato dal browser non esiste: lo calcola il server. Tetti di sicurezza: Maze 150000, Lost 37500 (15 × (1000 + 3 × 500)).
- **Continue**: dopo il game over i due giochi offrono un continue di 10 secondi. Una partita con continue non va mai in classifica né fa record locale: il browser non la invia, e il server rifiuta (`bad_game`) un invio con `continued` o con comandi registrati dopo la fine della partita.
- **Controlli comuni**: gettone firmato (HMAC), un solo invio per gettone (aggiornamento atomico), tempo reale almeno pari alla durata della partita, gettone valido 6 ore, limiti per IP e per gioco (6 al minuto, 60 all'ora), nomi A–Z con elenco di parole bloccate e nazione dall'elenco.
- **Motore di Lost nel Worker**: gli import di `lost-signal/` hanno il `?v=…` per la cache del browser, che esbuild non risolve. `sync-engines.mjs` ne copia i quattro file in `engines/lost/` (senza `?v=`); wrangler lo lancia da solo prima di ogni deploy (`[build]` in `wrangler.toml`) e `test-games.mjs` controlla che la copia sia aggiornata (`node game-api/sync-engines.mjs` la rigenera).
- **Costo di calcolo**: rifare una partita completa di Signal Maze (9 minuti) richiede circa 0,1 s di CPU, quella di Lost molto meno. Serve un piano Workers che lo consenta (il limite di 10 ms del piano gratuito non basta per le partite lunghe di News Rush e Maze).
- **Prove**: `node --no-warnings game-api/test-games.mjs` (replay con giocatori automatici, durata minima, doppi invii, gettoni e claim incrociati, classifiche separate, settimane, limiti per gioco).
