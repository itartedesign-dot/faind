# Server della classifica di FAIND GAME

Il sito resta statico su GitHub Pages: la classifica condivisa ha bisogno di un piccolo server. È un **Cloudflare Worker con database D1** (piano gratuito sufficiente). Il gioco funziona anche senza: finché `faind-game/config.js` ha `FAIND_GAME_API = ''` dichiara "classifica online non disponibile" e salva solo il record personale sul dispositivo.

## Cosa serve a Paolo (una volta sola, circa 10 minuti)

1. Account gratuito su cloudflare.com e, sul computer, `npm i -g wrangler` poi `wrangler login`.
2. Da questa cartella (`game-api/`):
   - `wrangler d1 create faind-game` → copia il `database_id` stampato dentro `wrangler.toml`
   - `wrangler d1 execute faind-game --remote --file=schema.sql`
   - `wrangler secret put SESSION_SECRET` → incolla una frase lunga e casuale (resta solo sul server)
   - `wrangler deploy` → stampa l'indirizzo del Worker, tipo `https://faind-game-api.<account>.workers.dev`
3. In `faind-game/config.js` metti quell'indirizzo (senza barra finale): `window.FAIND_GAME_API = 'https://faind-game-api.<account>.workers.dev';` e pubblica.
4. Se il sito risponde anche da un altro indirizzo, aggiungilo a `ALLOWED_ORIGINS` in `wrangler.toml` (ora: `https://faind.org` e `https://www.faind.org`; localhost è già ammesso per le prove).

## Come funziona la verifica
- `POST /session`: il server decide il seme dei rotoli e firma un gettone (limite di richieste per IP).
- Il browser registra solo i comandi di Faindo. `POST /score`: il server rifà la partita con lo stesso motore (`faind-game/sim.js`) e calcola il punteggio da solo; controlla firma, durata reale (almeno 172 s), comandi validi e che il gettone non sia già usato.
- `POST /name`: se il punteggio entra in una Top 10 arriva un "claim" firmato; con quello si registrano tre lettere A–Z e la nazione (una sola volta).
- `GET /leaderboard`: Top 10 settimanale (lunedì 00:00 – domenica, ora di Roma, calcolata sul server) e assoluta. Pari punteggio: precede chi è stato registrato prima dal server.

## Prove in locale
- `node game-api/test-sim.mjs` e `node --no-warnings game-api/test-worker.mjs` (motore, verifica, doppi invii, settimane, limiti).
- `node --no-warnings game-api/dev-server.mjs` avvia un server di prova con database in memoria su `http://localhost:8124`.
