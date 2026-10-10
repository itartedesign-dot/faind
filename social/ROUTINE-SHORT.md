# Routine: short "Dal cassetto di Faindo" su YouTube

Istruzioni per la routine di Claude che prepara lo short. Gira il **lunedì** e il **giovedì**, con
**3 tentativi alle 11:40, 13:40 e 15:40** ora italiana. Lo short esce su YouTube pochi minuti dopo il
commit su `main` (il push fa partire subito "Aggiorna notizie", che lo consegna a Buffer).

Se un passo non riesce, **non scrivere nulla sul repository**: ci riprova il tentativo successivo.
Se alle 17 nessuno short è stato consegnato, il sito apre una segnalazione su GitHub che arriva a Paolo
per mail. Spiega nel riepilogo finale cosa non ha funzionato.

## 1. Serve uno short oggi?

Guarda il giorno in Italia (Europe/Rome): solo lunedì e giovedì. Altri giorni: fermati.
Leggi `social/shorts.json` dal branch `main`: se nella `coda` c'è già uno short con `dalle` di oggi,
l'ha fatto un tentativo precedente. Fermati senza scrivere nulla.

## 2. Aneddoto

Leggi `social/aneddoti.json` dal branch `main`. La lista `aneddoti` è numerata da 1: usa il primo
numero che non compare in `usati`. Se sono finiti, fermati e dillo nel riepilogo (il sito ha già
mandato la mail a Paolo).

**Verifica prima di usarlo.** Cerca la fonte originale (articolo dell'università o dell'ente, oppure lo
studio) e controlla ogni fatto del `testo`: chi, cosa, quando, dove, numeri. Se un fatto è sbagliato o
non lo trovi confermato, non usare quell'aneddoto: passa al successivo libero e dillo nel riepilogo,
così Paolo decide se correggerlo. Il testo sul video resta quello di `testo`, parola per parola.

## 3. Canva

Video base: design `DAHXjQfDbfE` ("FAIND – Dal cassetto di Faindo (short vuoto)"), 5 pagine.
Non modificarlo mai: usa `autofill-design` con `design_id`, che crea una copia.
Titolo della copia: `FAIND short <numero aneddoto> <data>`.
Campi: `ANEDDOTO` (pagina 2, animata) e `ANEDDOTO_FISSO` (pagina 3, ferma): tutti e due con lo stesso
`testo` dell'aneddoto, così com'è. La fonte non va sul video.

Poi `export-design` in MP4, qualità `vertical_1080p`, e tieni il link restituito. Dal link ricava
quando scade: `X-Amz-Date` + `X-Amz-Expires` secondi (in UTC).

## 4. Testo di pubblicazione (YouTube, SEO)

- `titolo`: in italiano, massimo 100 caratteri, chiaro e cercabile, finisce con ` #Shorts`.
  Niente promesse che il testo non mantiene.
- `testo`, in quest'ordine, a righe separate da una riga vuota:
  1. due o tre frasi che raccontano la scoperta con le parole che la gente cerca;
  2. `Dal cassetto di Faindo: storie vere di intelligenza artificiale e scienza.`
  3. `Fonte: ` autori principali, titolo dello studio, rivista, anno (ente), e sotto il link alla fonte;
  4. `Le notizie sull'intelligenza artificiale ogni giorno: https://faind.org`
  5. 7-9 hashtag: sempre `#Shorts #IntelligenzaArtificiale #AI`, alla fine `#DalCassetto #FAIND`,
     in mezzo quelli del tema.

- `telegram`: **una sola frase** sulla scoperta, per il canale Telegram di FAIND, nello stile di Paolo:
  semplice e diretta, con un dettaglio curioso, senza enfasi. Niente link, emoji o hashtag: il resto
  del messaggio lo compone il sito, a paragrafi separati, così (modello di Paolo del 10 ottobre 2026):

  ```
  Nuova storia sul nostro canale YouTube:

  "Dal cassetto di Faindo" 🗄️

  L'AI scopre un nuovo tipo di antibiotico per caso, poi battezzato come HAL 9000.

  👉 <link dello short>

  Due storie a settimana, il lunedì e il giovedì. Faindo ci tiene se vi iscrivete 😄
  ```

## 5. Scrittura sul repository

Paolo ha autorizzato questa routine a scrivere su `main` **solo questi due file**, in un unico commit
fatto con lo strumento GitHub `push_files` (non con git). Rileggili da `main` subito prima.

- `social/shorts.json`: aggiungi in fondo alla `coda`
  `{"id": "dal-cassetto-NN", "aneddoto": N, "dalle": <adesso, ISO UTC>, "scade": <scadenza del link, ISO UTC>, "video": <link MP4>, "titolo": ..., "testo": ..., "telegram": ...}`
  (`NN` = numero dell'aneddoto a due cifre). Non togliere gli short già usciti.
- `social/aneddoti.json`: aggiungi `{"n": N, "day": "AAAA-MM-GG"}` a `usati` e metti
  `"verificato": true` sull'aneddoto. Lascia il resto com'è.

Messaggio del commit: `Short di Faindo: aneddoto N`.

## 6. Primo commento da suggerire a Paolo

Paolo mette e fissa in alto un suo primo commento sotto ogni short. Preparagli il testo, nello stile
che ha scelto il 10 ottobre 2026: **umano, non da AI**. Una o due frasi brevi, come le direbbe lui:
un pensiero personale, un po' di ironia, al massimo un'emoji. Niente frasi fatte o enfatiche
("affascinante", "il futuro è qui", "rivoluzionario"), niente elenchi, niente hashtag. Una domanda
facile alla fine è benvenuta, ma non obbligatoria. Non aggiungere fatti che non sono nella fonte.

Esempi scritti da Paolo per halicin:
- "HAL 9000 una volta sembrava fantascienza. Speriamo solo che rimanga un film 😂!"
- "Questo è solo l'inizio. L'AI troverà altri farmaci nascosti tra quelli che già conosciamo. 💊"

## 7. Promemoria del commento e riepilogo

Titolo e testo di pubblicazione li scrive Claude (punto 4) ed escono da soli: a Paolo non si chiede
nulla su quelli. Paolo vuole solo un **promemoria quando il video è uscito**, con il commento pronto.

1. Dopo il commit, guarda l'esecuzione di "Aggiorna notizie" partita dal push (`update-news.yml`, evento
   `push`) e, quando è finita, leggi nel log del job `build` la riga
   `✓ YouTube: short consegnato a Buffer (dal-cassetto-NN), esce alle HH:MM`.
2. Con `send_later` programma in questa stessa sessione un messaggio per 5 minuti dopo quell'orario.
   Quando arriva, rispondi nel thread in due o tre righe: lo short è uscito su YouTube
   (https://www.youtube.com/@faindnews), aggiungi e fissa in alto questo commento: «…» (punto 6).
3. Se nel log la riga non c'è, o c'è un errore, rispondi subito nel thread dicendo cosa non ha
   funzionato (il sito ha già mandato o manderà la mail di avviso).

Aggiorna la checklist del thread. Se fallisce anche il tentativo delle 15:40, rispondi dicendo in due
righe cosa non ha funzionato. Se hai dovuto saltare un aneddoto non verificato, dillo nel promemoria.
