# Routine settimanale: gioco LinkedIn "Il punto di vista dell'AI"

Deciso da Paolo il 12 ottobre 2026: Paolo prepara solo il file Canva, Claude fa tutto il resto e i post
escono da soli tramite Buffer, senza passare da lui. A Paolo resta il promemoria del lunedì sera
(routine "FAIND: preparare il gioco per martedì") che gli ricorda di aggiornare il file Canva.

- **Martedì** esce il quiz (pagina 1 del file Canva), **giovedì** la soluzione (pagina 2).
- La routine gira martedì e giovedì con **3 tentativi alle 8:40, 10:40 e 12:40** ora italiana.
  L'automazione del sito pubblica il post al primo giro orario dopo il suo arrivo (tra le 9 e le 22).
- Se un passo non riesce, **non scrivere nulla sul repository**: ci riprova il tentativo successivo.
  Se alle 15 il post non c'è, il sito apre una segnalazione su GitHub che arriva a Paolo per mail.

File Canva di Paolo: design `DAHXyb37q1U` ("Il punto di vista dell'AI"). Paolo lo riscrive ogni settimana
con un capolavoro nuovo: pagina 1 = versione AI con "Riconosci il capolavoro?", pagina 2 = versione AI
sopra e dipinto originale sotto. **Non modificarlo mai.**

## Martedì: quiz

1. Leggi `social/canva-quiz.json` dal branch `main`: se il suo `day` è già la data di oggi, fermati
   senza scrivere nulla.
2. `read-design` di `DAHXyb37q1U` con le miniature delle pagine 1 e 2. Riconosci il dipinto originale
   della pagina 2 (titolo e autore). Se non sei sicuro dell'opera, fermati e scrivilo nel thread.
3. Leggi `social/quiz-opere.json`: se l'opera è già in `usate`, Paolo non ha ancora aggiornato il file.
   Fermati senza scrivere nulla (al tentativo delle 12:40 scrivilo nel thread in una riga).
4. Scrivi i due testi (quiz e soluzione) sui modelli qui sotto. Controlla su fonti affidabili
   anno e luogo dell'opera. I dettagli "cambiati" e "rimasti" devono essere quelli che si vedono davvero
   nell'immagine: guardala bene, non inventare.
5. `export-design` in PNG della sola pagina 1 (`pages: [1]`) e tieni il link restituito.
6. Un solo commit su `main` con `push_files` (non con git), messaggio `Gioco Punto di vista AI del <data>`,
   **solo questi due file**:
   - `social/canva-quiz.json`:
     ```json
     { "day": "AAAA-MM-GG", "url": "<link PNG pagina 1>", "design_id": "DAHXyb37q1U",
       "opera": "<titolo>", "autore": "<autore>", "testo": "<testo del quiz>",
       "soluzione": "<testo della soluzione, per giovedì>" }
     ```
   - `social/quiz-opere.json`: aggiungi in `usate`
     `{ "opera": "<titolo>", "autore": "<autore>", "quiz": "AAAA-MM-GG", "soluzione": "<giovedì AAAA-MM-GG>" }`.

## Giovedì: soluzione

1. Leggi `social/canva-soluzione.json`: se il suo `day` è già oggi, fermati senza scrivere nulla.
2. Leggi `social/canva-quiz.json`: il suo `day` deve essere martedì di questa settimana (oggi meno 2 giorni).
   Altrimenti il quiz non è uscito: fermati senza scrivere nulla.
3. `read-design` di `DAHXyb37q1U` (miniatura pagina 2): deve mostrare ancora la stessa opera del quiz.
   Se Paolo ha già messo l'opera della settimana dopo, fermati e scrivilo nel thread.
4. `export-design` in PNG della sola pagina 2 (`pages: [2]`).
5. Un solo commit su `main` con `push_files`, messaggio `Soluzione Punto di vista AI del <data>`,
   **solo** `social/canva-soluzione.json`:
   ```json
   { "day": "AAAA-MM-GG", "url": "<link PNG pagina 2>", "design_id": "DAHXyb37q1U",
     "opera": "<titolo>", "autore": "<autore>", "testo": "<campo soluzione di canva-quiz.json>" }
   ```

Il commit avvia l'automazione del sito, che scarica il PNG (il link di Canva scade dopo poche ore),
lo pubblica come `https://faind.org/social/canva-<quiz|soluzione>.png` e consegna il post a Buffer
con il primo commento col link al sito. Il post passa poi da solo anche su Facebook e Pinterest.

## Modelli dei testi

Italiano semplice, frasi brevi, niente link nel testo (va nel primo commento, lo aggiunge il sito).
Hashtag in fondo, sempre con `#PuntoDiVistaAI` (serve anche al sito per non pubblicare doppioni).

**Quiz** (non deve far capire l'opera: niente indizi su titolo, autore o soggetto):

```
Un capolavoro della pittura. Un salto ai giorni nostri.

Per "Il punto di vista dell'AI" abbiamo chiesto a un'intelligenza artificiale di reinterpretare un celebre dipinto in chiave contemporanea.

Lo riconosci?

Scrivi titolo e autore nei commenti. E raccontaci quale dettaglio te l'ha fatto riconoscere.

La soluzione giovedì <giorno> <mese>.

#IntelligenzaArtificiale #Arte #AIArt #PuntoDiVistaAI
```

**Soluzione** (esempio reale del 8 ottobre 2026):

```
La soluzione del gioco: era "La ragazza con l'orecchino di perla" di Johannes Vermeer.

Dipinta intorno al 1665, oggi è al Mauritshuis dell'Aia. L'AI l'ha portata ai giorni nostri cambiando pochi dettagli, e tutti con un senso:

- la perla è diventata un auricolare
- il turbante blu e giallo è diventato un cappellino blu
- la veste ocra è diventata una felpa

Sono rimasti lo sguardo sopra la spalla, la luce da sinistra e lo sfondo scuro. Basta questo a far riconoscere un capolavoro di oltre 350 anni.

Voi l'avevate riconosciuta? Ditecelo nei commenti.
La prossima settimana un nuovo capolavoro da indovinare.

#IntelligenzaArtificiale #Arte #Vermeer #AIArt #PuntoDiVistaAI
```

Nella soluzione: titolo e autore subito; anno e luogo verificati; 3 dettagli cambiati, ognuno accanto
all'originale; cosa è rimasto e perché basta a riconoscerlo; età dell'opera arrotondata per difetto;
un hashtag con l'autore (es. `#LeonardoDaVinci`).

## Riepilogo

Chiudi con no_reply_needed se tutto è andato bene. Scrivi nel thread "Giochi LinkedIn" solo se qualcosa
non funziona al tentativo delle 12:40, o se ti sei fermato per un dubbio sull'opera.
