# Routine settimanale: card LinkedIn da Canva

Istruzioni per la routine di Claude che compila il modello Canva di Paolo. Gira il **venerdì** (card
"Notizie AI"), il **sabato** (card "Scritto a mano") e il **lunedì** (card "Lavoro AI"), con **3 tentativi
alle 8:40, 10:40 e 12:40** ora italiana. L'automazione del sito aspetta la card: il post esce al primo
giro orario dopo il suo arrivo (sabato e venerdì dalle 9, lunedì dalle 10).

Se un passo non riesce, **non scrivere nulla sul repository**: ci riprova il tentativo successivo.
Se alle 15 la card non c'è ancora, il venerdì e il lunedì il post esce con la grafica di sempre, il sabato
non esce nessun post, e il sito apre una segnalazione su GitHub che arriva a Paolo per mail.
Spiega nel riepilogo finale cosa non ha funzionato.

## 1. Che card serve oggi

Guarda il giorno in Italia (Europe/Rome): venerdì → `settimana`, sabato → `mano`, lunedì → `lavori`.
Altri giorni: fermati. Per `mano` salta il punto 2 e, al punto 3, usa le frasi al posto dei mantra.

Leggi `social/canva-<card>.json` dal branch `main`: se esiste e il suo `day` è già la data di oggi,
la card l'ha fatta un tentativo precedente. Fermati senza scrivere nulla.

## 2. Dati della settimana

Sul repository `itartedesign-dot/faind`, workflow "Aggiorna notizie" (`update-news.yml`): prendi
l'ultima esecuzione riuscita di oggi e leggi il log del job `build`. Cerca la riga che inizia con
`CANVA_DATI ` e leggi il JSON che segue. Deve avere `day` uguale alla data di oggi (AAAA-MM-GG).

- `settimana`: usa `settimana.ids` (tutti, nell'ordine) e `settimana.titoli` (i 3 titoli della card).
- `lavori`: usa `lavori.ruoli` (i 3 ruoli più richiesti). Se `lavori` è `null`, fermati. Il lunedì la
  classifica resta la stessa per tutto il giorno, quindi i ruoli coincidono con quelli del post.

## 3. Mantra

Leggi `social/mantra.json` dal branch `main`. La lista `mantra` è numerata da 1.
- Se `prossimi[<card>]` esiste, usa quel numero e poi toglilo da `prossimi`.
- Altrimenti usa il primo numero che non compare né in `usati` né tra i valori di `prossimi`.
- Se i mantra sono finiti, fermati e dillo nel riepilogo (il sito ha già mandato la mail a Paolo).

Solo per `mano`: leggi invece `social/frasi-mano.json` (lista `frasi`, numerata da 1) e usa il primo
numero che non compare in `usati`. Se le frasi sono finite, fermati e dillo nel riepilogo (il sito ha già
mandato la mail a Paolo).

## 4. Canva

Modello: design `DAHXhtwQhM4` ("FAIND – Card del venerdì (modello)"). Non modificarlo mai:
usa `autofill-design` con `design_id`, che crea una copia. Titolo della copia: `FAIND <card> <data>`.

- `settimana` (pagina 1 "Notizie Ai"): `MANTRA`, `TITOLO1`, `TITOLO2`, `TITOLO3`.
- `lavori` (pagina 2 "Lavoro Ai"): `LAVORO_MANTRA`, `LAVORO1`, `LAVORO2`, `LAVORO3`.
- `mano` (pagina 3 "Scritto a mano"): `MANO_FRASE` (la frase) e `MANO_DATA` (la data di oggi scritta
  come "10 ottobre": giorno senza zero e mese in minuscolo, senza anno). La scritta "Faind" resta com'è.

Il testo va inserito così com'è (niente virgolette aggiunte). Poi `export-design` in PNG della sola
pagina giusta (`pages: [1]` per settimana, `[2]` per lavori, `[3]` per mano) e tieni il link restituito.
Controlla con `read-design` (miniatura) che i testi non escano dai riquadri.

## 5. Scrittura sul repository

Paolo ha autorizzato questa routine a scrivere su `main` **solo questi due file**, in un unico commit
fatto con lo strumento GitHub `push_files` (non con git):

1. `social/canva-<card>.json`:
   ```json
   { "day": "AAAA-MM-GG", "url": "<link PNG di Canva>", "design_id": "<copia>",
     "mantra_n": 2, "mantra": "<testo>", "ids": ["…"] }
   ```
   Per `lavori` al posto di `ids` metti `"ruoli": ["…", "…", "…"]`, identici a `CANVA_DATI`.
   Per `mano` il file è `social/canva-mano.json` con `day`, `url`, `design_id`, `frase_n` e
   `frase` (il testo esatto: il sito lo usa anche come testo del post).
2. `social/mantra.json` aggiornato: numero aggiunto a `usati` come
   `{ "n": 2, "card": "settimana", "day": "AAAA-MM-GG", "design_id": "<copia>" }`.
   Per `mano` invece `social/frasi-mano.json`, con `{ "n": 1, "day": "AAAA-MM-GG", "design_id": "<copia>" }`.

Messaggio del commit: `Card Canva <card> del <data>`.

Il commit avvia subito l'automazione del sito, che scarica il PNG (il link di Canva scade dopo
poche ore) e lo pubblica come `https://faind.org/social/canva-<card>.png`. Il post del giorno
usa quella immagine.

## 6. Riepilogo

Chiudi con poche righe in italiano: card, mantra o frase usata, i 3 titoli o ruoli, link alla copia su Canva.
