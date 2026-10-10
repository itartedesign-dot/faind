# FAIND — AI News Agency

Sito statico (HTML + CSS + JavaScript vanilla), zero dipendenze. Le notizie si aggiornano da sole ogni ora grazie a una GitHub Action gratuita.

## Struttura

```
index.html                         pagina
style.css                          stile (chiaro/scuro, responsive)
script.js                          logica: sezioni, settori, filtri, lingue, tema, barra TG, ritorno al punto esatto
nav.js                             freccia "torna su" e ritorno alla pagina di prima (tutte le pagine)
data.js                            contenuti della redazione: aperture, guide, prezzi, convenzioni
scripts/feeds.json                 fonti RSS da cui raccogliere le notizie
scripts/fetch-news.mjs             raccoglie, classifica e raggruppa le notizie → news.json
scripts/build-pages.mjs            pagine notizia, archivio, feed, sitemap, robots.txt, IndexNow
scripts/argomenti.mjs              pagine "Notizie su …" e archivio per mese
.github/workflows/update-news.yml  esegue la raccolta ogni ora e pubblica il sito
assets/                            logo 3D (logo.webp; in testata e piè di pagina logo-payoff-light/-dark.webp, scritta blu notte o bianca secondo il tema), favicon
```

## Messa online (una volta sola)

1. Crea un repository su GitHub (es. `faind`) e carica **tutti** i file, compresa la cartella `.github`.
   Se carichi dal browser, trascina la cartella intera: la cartella `.github` è nascosta su Mac e Windows, controlla che ci sia.
2. **Settings → Pages → Build and deployment → Source: "GitHub Actions"** (non "Deploy from a branch").
3. Vai in **Actions → Aggiorna notizie → Run workflow**. Dopo 1–2 minuti il sito è online su `https://TUO-UTENTE.github.io/faind/`.

Da lì in poi la raccolta gira da sola ogni ora e a ogni modifica che salvi nel repository.
Se il repository resta senza modifiche per 60 giorni, GitHub mette in pausa le azioni programmate: basta riattivarle da Actions con un clic.

## Come funziona la home

- **Apertura**: la notizia con `lead: true` in `data.js` per 48 ore; poi passa da sola alla notizia importante più recente.
- **Importanti**: notizie con `priority: "alta"` oppure riprese da almeno 3 fonti diverse (calcolato in automatico).
- **Appena uscite**: le ultime 24 ore.
- **Letture secondarie**: il resto della settimana.
Ogni notizia compare in una sola sezione. La barra in basso fa scorrere apertura, importanti e appena uscite (★ = importante); si chiude con la × e si riapre dal pulsante in basso a destra.

## Immagini

Lo script prende l'immagine di copertina dal feed RSS; se manca, legge l'anteprima social dell'articolo (og:image), una sola volta per articolo.
Le immagini restano sul sito della fonte e il clic porta sempre all'articolo originale. Se un'immagine non si carica, o la notizia non ne ha, compare il riquadro con il logo FAIND.
Per le notizie scritte a mano in `data.js` aggiungi `image: "https://..."` se vuoi una foto.

## Pagine notizia, feed RSS e video

- Ogni notizia ha una pagina sua in `n/` (generata a ogni giro orario da `scripts/build-pages.mjs`). Google indicizza solo quelle della redazione o riprese da almeno 2 fonti.
- La pagina è nella lingua della notizia (testi, data, settore e lingua dichiarata a Google). Titolo e descrizione per Google riportano il numero di fonti ("…: 3 fonti a confronto"); il titolo lo mostra solo se resta entro 70 caratteri.
- "Come la raccontano N testate": il titolo dato da ogni testata, salvato da `fetch-news.mjs` nel raggruppamento (`also[].title`).
- "Per capire di più": parole del glossario, argomenti, tema (parole chiave dei temi in `feeds.json`) e approfondimento collegato (`MATCH` in `articles.mjs`). In fondo la fascia "Su FAIND trovi anche".
- Scheda `NewsArticle` per Google e testo alternativo sull'immagine.

## Archivio (`archivio.json`, cartella `archivio/`)

- Le notizie indicizzabili (redazione o almeno 2 fonti) entrano in `archivio.json` e non ne escono più: le loro pagine restano online anche dopo i 7 giorni di `news.json`, sempre con lo stesso indirizzo.
- Come `news.json`, l'archivio vive solo nel sito pubblicato: ogni giro lo rilegge da `faind.org/archivio.json` e lo riscrive.
- **Protezione:** se il sito risponde ma l'archivio non si legge, `fetch-news.mjs` ferma il giro e non pubblica, così le pagine archiviate non spariscono. Il giro dopo riprova. Solo al primo giro in assoluto (nessun archivio e `news.json` senza `archiveCount`) si parte da zero.
- `archivio/` elenca i mesi; `archivio/AAAA-MM.html` le notizie del mese, giorno per giorno.
- Le pagine solo d'archivio non hanno la card `og/`: usano la foto della fonte o il logo.

## Argomenti (cartella `argomenti/`)

- `scripts/argomenti.mjs` crea una pagina "Notizie su …" per ogni nome che torna spesso nelle notizie archiviate: almeno 10 notizie da almeno 3 testate. Una volta nata resta (`archivio.json` → `subjects`).
- I nomi arrivano da `SEED` (elenco di partenza: aziende, prodotti, modelli) e dalla scoperta automatica: parole con la maiuscola a metà frase nei sommari, quasi mai scritte in minuscolo. Le parole generiche si escludono con `STOP` e `SOLO`.
- La pagina italiana elenca le notizie in tutte le lingue; le versioni in inglese, francese e tedesco nascono con almeno 5 notizie in quella lingua.
- Nessun testo scritto dall'AI: solo nomi, notizie, fonti e date.

## Google, Bing e robots.txt

- A ogni giro si scrivono `robots.txt` (con l'indirizzo della sitemap) e il file della chiave IndexNow (`<chiave>.txt`, pubblico per regola del protocollo).
- IndexNow: a ogni giro si avvisano Bing e gli altri motori che aderiscono delle pagine nate nel giro precedente (`archivio.json` → `pending`). Al primo giro si manda tutta la sitemap. Google non usa IndexNow.

## Navigazione

- `nav.js`, su tutte le pagine: piccola freccia in basso a destra, compare dopo la prima schermata e riporta in cima. In home sta sopra la barra "Live".
- Ritorno al punto esatto: i link che riportano alla pagina di prima fanno come il tasto Indietro. La home ricorda punto, settore, ricerca e notizie aperte (`script.js`, "Ritorno") e li ripristina tornando indietro o da un link "Tutte le notizie".
- Feed RSS gratuiti: `feed.xml` (tutte), `feeds/<settore>.xml`, `feeds/youtube.xml`. Si rigenerano ogni ora.
- Video: i canali YouTube sono in `scripts/feeds.json` → `youtube`. Per aggiungerne uno: nome, `"handle": "@nomecanale"` (o `"id": "UC..."`), lingua e gruppo (`it`, `intl`, `official`).
- Il filtro "Lingue notizie" in alto vale per notizie e video ed è separato dalla lingua dell'interfaccia.

## Focus (in fondo alla home)

Cinque temi: Robot e umanoidi, Domus, Medicina e salute, AI e lavoro, Clima e ambiente. Per ciascuno: 1 video (il più recente, anche più vecchio se non ce ne sono di nuovi) e 1 notizia (la più ripresa dalle testate), mai ripetuti tra un tema e l'altro. Parole chiave, fonti e canali extra di ogni tema sono in `scripts/feeds.json` → `spotlight`.

## Lavoro AI

Classifica dei ruoli AI e dati più presenti negli annunci degli ultimi 30 giorni (fonti pubbliche gratuite: Jobicy, Arbeitnow, Remotive), aggiornata ogni 6 ore. Ogni offerta porta all'annuncio originale. Segue il filtro "Lingue notizie": Italia=IT, Francia=FR, Germania=DE, Europa/remoto/mondo=EN. Configurazione in `scripts/feeds.json` → `jobs`.

## Canale Telegram (@faindnews)

`scripts/telegram.mjs` gira a ogni giro orario, dopo la raccolta:
- **Il punto delle 8**: una volta al giorno, al primo giro dopo le 8:00 ora italiana (ora legale e solare gestite da sole), un post con il logo e le 5 notizie più importanti delle ultime 24 ore. Se GitHub salta un giro lo recupera entro le 11:00.
- **Lavoro AI, la classifica della settimana**: ogni lunedì tra le 10:00 e le 14:00, con una grafica quadrata 1200×1200 e le frecce su/giù rispetto alla settimana prima.
- **Kit per LinkedIn**: grafica e testo pronti sono sempre aggiornati su `social/lavori-ai.html` (immagine: `social/lavori-ai.png`). La cartella `social/` viene creata dall'automazione, non è nel repository.
- **Ore di silenzio**: dalle 23:00 alle 7:00 il canale tace. Le notizie della notte escono dal mattino (di notte "l'orologio si ferma", quindi restano fresche) e le più importanti entrano nel Punto delle 8.
- fino a 4 notizie nuove all'ora (prima le importanti) e 1 video, solo in italiano e inglese, mai duplicati.
Orari e quantità sono in cima al file (`DIGEST_*`, `JOBS_*`, `QUIET_FROM`, `QUIET_TO`). Il promemoria di ciò che è già uscito è in `news.json` → `tgState`.
Segreti necessari: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Pagine tematiche (cartella `temi/`)

Cinque pagine permanenti e indicizzabili, una per tema del Focus, più un indice, in quattro lingue: `temi/` (italiano), `temi/en/`, `temi/fr/`, `temi/de/`. Le genera `scripts/topics.mjs` a ogni giro orario; la cartella non è nel repository.
- **Testo fisso** (spiegazione del tema e domande frequenti): italiano in `scripts/topics.mjs` → `TOPICS`; inglese, francese e tedesco in `scripts/topics-i18n.mjs`.
- **Parti automatiche**: numeri della settimana, notizia più ripresa, testate più attive, ultime notizie, video.
- **Cronologia**: la notizia più ripresa di ogni giorno, conservata in `news.json` → `topics` (fino a 180 giorni). Cresce da sola.
- Quali notizie entrano in un tema lo decidono le parole chiave in `scripts/feeds.json` → `spotlight` → `topics`.
- Dalla home si aprono nella lingua dell'interfaccia; in ogni pagina si può cambiare lingua.

## Glossario AI (cartella `glossario/`)

`scripts/glossary.mjs` genera il glossario in quattro lingue (`glossario/`, `glossario/en/`, `glossario/fr/`, `glossario/de/`), più una pagina per ogni termine (`glossario/<id>.html`, `glossario/en/<id>.html`…) con la definizione e tutte le notizie, archivio compreso, che lo citano. Nelle pagine notizia i termini trovati nel testo diventano link alla pagina del termine e compaiono nel riquadro "Per capire di più"; sotto ogni termine dell'indice ci sono le ultime notizie che lo citano. Per aggiungere un termine: una voce in `TERMS` (nome e definizione nelle quattro lingue, più la regola `re` per riconoscerlo).

## Approfondimenti in quattro lingue (cartella `approfondimenti/`)

`scripts/articles.mjs` contiene i dieci articoli in italiano e costruisce le pagine; le traduzioni sono in `scripts/articles-en.mjs`, `articles-fr.mjs` e `articles-de.mjs` (stesso `slug` dell'articolo italiano). Le pagine tradotte escono in `approfondimenti/en/`, `/fr/` e `/de/`, con il selettore di lingua in ogni pagina.
- **I quattro file vanno sempre caricati insieme:** `articles.mjs` legge gli altri tre, e se ne manca uno l'automazione si ferma.
- **Correzioni:** un testo corretto in italiano va corretto anche nelle tre traduzioni.
- **Schede in home:** restano HTML statico in `index.html` (italiano); nelle altre lingue `script.js` (`deepCards`) legge titoli e sommari da `approfondimenti/cards.json`, creato dall'automazione.

## Popup della newsletter (home)

In `index.html` (`#nlPop`) e `script.js` (`nlPopup`): entra dal bordo sinistro a metà altezza (sul telefono in basso a sinistra) dopo 1 minuto sulla pagina. Si chiude con la X, con Esc o scorrendo verso sinistra; torna una seconda volta 3 minuti dopo, poi non si vede per 7 giorni. Chi si iscrive (dal popup o dal modulo nella colonna) non lo vede più; dal popup, al posto del modulo compaiono "Scelta invidiabile." e il grazie di Faindo, poi si chiude da solo dopo 9 secondi. Il ricordo sta nel browser (`localStorage`, chiave `faind-nlpop`). Quando si tocca il campo email il popup si allarga e il testo diventa grande. L'iscrizione usa lo stesso invio del modulo (FormSubmit verso info@faind.org) con `fonte: popup`. Immagine: `assets/faindo-newsletter.webp`.

## Short di Faindo su YouTube (cartella `dal-cassetto-di-faindo/`)

`scripts/faindo.mjs`, chiamato da `scripts/youtube.mjs` a ogni giro, genera la pagina degli short "Dal cassetto di Faindo" già usciti in quattro lingue (`dal-cassetto-di-faindo/`, `/en/`, `/fr/`, `/de/`); la cartella non è nel repository.
- Per ogni short: data di uscita, anteprima con il link allo short e la stessa frase dell'annuncio Telegram (campo `telegram` in `social/shorts.json`; traduzioni facoltative in `telegram_en`, `telegram_fr`, `telegram_de`).
- I due più recenti finiscono in `news.json` → `shorts` e compaiono in home nel riquadro YouTube della sezione "L'AI in video", con il tasto "Vedi i precedenti".
- **Immagini del riquadro:** `assets/faindo-youtube-it.webp` con l'italiano, `assets/faindo-youtube-en.webp` con le altre lingue; cliccando si apre il canale YouTube.

## Pinterest (tramite Buffer)

`scripts/pinterest.mjs` gira dopo `youtube.mjs` e porta su Pinterest tutto ciò che esce su LinkedIn e YouTube: i post LinkedIn diventano Pin con la stessa immagine (quelli con la grafica di riserva, senza card Canva, non vanno su Pinterest), un titolo (max 100 caratteri), il testo accorciato (max 500) con gli hashtag e il link al sito; gli short di Faindo diventano Pin video finché il link di Canva è valido, poi Pin con l'anteprima dello short. Usa lo stesso `BUFFER_API_KEY`, l'unico canale Pinterest collegato a Buffer e la bacheca "FAIND - Flash AI News Daily". I Pin consegnati sono segnati in `news.json` → `tgState.pin`. Prova senza pubblicare: `PIN_DRY=1 node scripts/pinterest.mjs`.

## Facebook (tramite Zernio)

`scripts/facebook.mjs` gira dopo `pinterest.mjs` e porta sulla Pagina Facebook ([FAIND - Flash AI News Daily](https://www.facebook.com/profile.php?id=61595199334147)) i post usciti su LinkedIn: stessa immagine e stesso testo, senza le righe con i link; il link al sito va nel primo commento, con `utm_source=facebook`. Un post LinkedIn passa su Facebook al giro dopo la sua consegna a Buffer e solo nello stesso giorno (ora italiana): le card Canva restano online solo nel loro giorno, e prima di consegnare lo script controlla che l'immagine risponda. Usa Zernio (piano gratuito, 2 account: Facebook e, in futuro, TikTok) perché i 3 canali gratuiti di Buffer sono già occupati. Segreto `ZERNIO_API_KEY`; l'account Facebook dev'essere l'unico collegato a Zernio. I post consegnati sono segnati in `news.json` → `tgState.fb`. Prova senza pubblicare: `FB_DRY=1 node scripts/facebook.mjs`.

## Strano ma vero (cartella `strano-ma-vero/`)

`scripts/strano.mjs` genera la rubrica delle curiosità sull'AI in quattro lingue (`strano-ma-vero/`, `strano-ma-vero/en/`, `strano-ma-vero/fr/`, `strano-ma-vero/de/`); la cartella non è nel repository.
- Ogni edizione ha una pagina fissa con la data nel nome (es. `strano-ma-vero/2026-10-06.html`); la pagina principale della cartella mostra sempre l'ultima edizione.
- **Nuova edizione:** aggiungere una voce in cima a `EDITIONS` (testi nelle quattro lingue e, in `sources`, il link a ogni fonte). Non serve toccare altro.
- **Riquadro in home** (colonna laterale): è in `index.html`; i testi nelle quattro lingue sono in `script.js` (chiavi `smv.*` e `LOCAL_LINKS.strano`).
- **Copertine:** `assets/strano-ma-vero-it.webp` con l'italiano, `assets/strano-ma-vero-en.webp` con le altre lingue.

## Card di condivisione (cartella `og/`)

`scripts/cards.mjs` disegna per ogni pagina notizia un'immagine 1200×630 con logo, settore, titolo e fonte: è l'anteprima che compare quando il link viene condiviso. Usa il browser Chrome già presente sulle macchine di GitHub. Le card già fatte vengono riprese dal sito online; se ne creano al massimo 60 nuove per giro (`CARDS_PER_RUN`). Senza card, la pagina usa l'immagine della fonte o il logo.
- **Approfondimenti:** la card è diversa, 1200×900: la copertina dell'articolo in alto e sotto una fascia con etichetta, titolo e logo. È l'immagine del post LinkedIn del mercoledì. La genera `photoCardHtml` in `scripts/cards.mjs`; la copertina è quella indicata in `img` in `scripts/articles.mjs`.

## Statistiche delle visite (GoatCounter)

`stats.js` (cartella principale) conta le visite senza cookie tramite GoatCounter; è richiamato da tutte le pagine, anche quelle generate. Il codice dell'account è nella prima riga utile del file (`CODICE`): lasciandolo vuoto le statistiche sono spente. I numeri si leggono su `https://CODICE.goatcounter.com`. Non conta in locale né chi ha attivo "Non tenere traccia".

## Widget "Notizie AI by FAIND"

`widget.html` è il riquadro incorporabile da altri siti (parametri: `n` 3–10, `lang` it/en/fr/de, `theme` light/dark/auto); legge `news.json`. `incorpora.html` è la pagina, in quattro lingue, dove si sceglie l'aspetto e si copia il codice.

## Chi c'è dietro FAIND

`redazione.html` (italiano), `about.html` (inglese), `a-propos.html` (francese), `ueber-uns.html` (tedesco): stessa pagina in quattro lingue, collegate tra loro e presenti nella sitemap. Foto: `assets/paolo-buono.webp`.

## Privacy, 404 e app

- `privacy.html`: informativa privacy e note legali (link nel footer). Aggiornala se aggiungi servizi esterni (es. statistiche).
- `404.html`: pagina mostrata per i link non più validi (es. notizie uscite dal sito).
- `manifest.webmanifest` + `assets/icon-*.png` + `sw.js`: rendono FAIND installabile come app. Il pulsante "Installa l'app" compare solo dove serve (Android/computer: installazione diretta; iPhone/iPad: guida in 3 passi; nascosto se già installata).
- I caratteri tipografici vengono scaricati dall'automazione in `assets/fonts/` e serviti dal sito stesso (nessun contatto con Google Fonts).

## Settori

`chatbot`, `immagini`, `video`, `musica`, `codice`, `produttivita`, `ricerca`, `hardware`, `regole`, `altro`.
Le notizie automatiche vengono classificate da sole con parole chiave (in `scripts/fetch-news.mjs`, lista `CATEGORIES`). Cliccando un settore, o cercando, la home diventa una pagina di risultati filtrabile anche per tipo.

## Immagini e loghi

- Le notizie automatiche prendono l'immagine di copertina dal feed o dall'anteprima social dell'articolo. Se manca o non si carica, compare il logo FAIND.
- Per le notizie scritte a mano in `data.js` puoi aggiungere `image: "https://..."`.
- Nella tabella prezzi il campo `logo` indica il dominio del servizio (es. `"claude.ai"`): l'icona ufficiale viene caricata dal servizio icone di Google. Se non si carica, compare l'iniziale.

## Aggiungere o togliere fonti

Modifica `scripts/feeds.json`:
- `filter: true` per le testate generaliste: tiene solo gli articoli sull'AI;
- `official: true` per i blog ufficiali delle aziende (mostra "Fonte ufficiale");
- l'ordine conta: quando più fonti danno la stessa notizia, la scheda principale è quella più in alto, le altre compaiono in "Anche su".

Se una fonte smette di funzionare, le altre continuano: nel log dell'Action trovi ✓ / ✗ per ciascuna.
Il sito mostra solo titolo, un estratto breve e il link all'originale.

## Pubblicare a mano

Scrivi in `data.js` (vedi le istruzioni in cima al file). Se la stessa notizia arriva anche dai feed, vince la tua versione.
I testi possono essere tradotti: `title: { it: "...", en: "...", fr: "...", de: "..." }`.

## Anteprima sul computer

Aprendo `index.html` con doppio clic vedi solo le notizie di `data.js`: il browser blocca la lettura di `news.json` dai file locali.
Per provare tutto: `node scripts/fetch-news.mjs` e poi `python3 -m http.server`, quindi apri `http://localhost:8000`.

## Farsi trovare su Google

1. Vai su https://search.google.com/search-console e aggiungi la proprietà **Prefisso URL**: `https://faind.org/`.
2. Scegli la verifica **Tag HTML**, copia il meta tag e incollalo in `index.html` al posto del commento "Google Search Console".
3. Dopo la verifica: **Sitemap** → inserisci `sitemap.xml` → Invia. Poi **Controllo URL** → incolla l'indirizzo del sito → **Richiedi indicizzazione**.
Google impiega da qualche giorno a qualche settimana per mostrare un sito nuovo. Link da social, forum e altri siti accelerano molto.

## Contatti e donazioni

- "Scrivici" apre l'app di posta con il messaggio pronto verso `info@faind.org`.
- Il pulsante PayPal usa il link donazioni ufficiale verso `buono.p@alice.it`.

## Aggiornamenti del 3–4 ottobre 2026

- **Dominio:** il sito è su `https://faind.org` (dominio IONOS, record A verso GitHub Pages, custom domain nelle impostazioni Pages). Mail: `info@faind.org`.
- **Le AI a confronto** (`confronto/`, quattro lingue): `scripts/compare.mjs`. Prezzi, schede e giudizi sono nel file; aggiornare `CHECKED` a ogni verifica.
- **Approfondimenti** (`approfondimenti/`, solo italiano): `scripts/articles.mjs`, immagini `assets/art-NN.webp`. Le schede in home sono HTML statico in `index.html`.
- **Controllo prezzi ogni 12 ore:** `scripts/prices.mjs` confronta `data.js` con aipricecompare.org; risultato in `news.json` → `priceCheck`. Non modifica mai i prezzi.
- **Loghi delle fonti** per le notizie senza foto: `fetch-news.mjs` (`sourceLogos`), cache in `news.json` → `logos`.
- **Trending Tool** (agenda a quattro linguette) e **domande sotto i titoli:** `script.js` (`renderTrending`, `renderQuestions`).
- **Newsletter:** modulo in home, per ora via FormSubmit verso `info@faind.org`; previsto il passaggio a Mailjet.
- **LinkedIn:** `scripts/telegram.mjs` scrive `feeds/linkedin.xml` (lunedì classifica lavori, venerdì "La settimana dell'AI"); stato in `news.json` → `tgState`. La pubblicazione sulla pagina è da definire.
- **Versione dei file:** in `index.html` i link a `style.css`, `script.js`, `data.js`, `stats.js` hanno `?v=…`: va cambiato a ogni modifica di quei file.

## Aggiornamenti del 5–6 ottobre 2026

- **LinkedIn tramite Buffer:** `scripts/linkedin.mjs` consegna a Buffer i post preparati da `scripts/telegram.mjs` (`tgState.linkedin`). Cinque post a settimana: lunedì classifica lavori, mercoledì un approfondimento (card `og/<slug>.png`), venerdì la settimana dell'AI, sabato "Scritto a mano" e domenica lo short di Faindo più recente della settimana (link a YouTube, immagine = anteprima dello short; senza short usciti negli ultimi 7 giorni non esce nulla). Segreto `BUFFER_API_KEY`.
- **Card degli approfondimenti:** generate da `build-pages.mjs` con `buildCards`, come quelle delle notizie.
- **Il punto delle 8 e il post del venerdì:** precedenza alle notizie in italiano (`italianFirst` in `telegram.mjs`).
- **Card del venerdì per LinkedIn:** `telegram.mjs` disegna a ogni giro `social/settimana-ai.png` (1200×1500): quante testate hanno ripreso la notizia della settimana, il suo titolo e le tre notizie seguenti. Niente foto delle testate (diritti). Buffer scarica l'immagine quando il post esce, dopo la pubblicazione del sito: per questo il post usa l'elenco della card già online (`tgState.weekCard`, giro precedente) e, uscito il post, la card resta ferma fino a sera. Senza card pronta il post esce con il logo.
- **Lavori AI:** gli annunci si accumulano per `maxAgeDays`; ricerche mirate in `feeds.json` → `jobs.jobicyTags`.
- **Home:** pulsanti e link alla pagina LinkedIn; newsletter solo settimanale.
- **Automazione:** macchina fissata a `ubuntu-24.04`, perché card e grafiche dipendono dal Chrome preinstallato.

## Aggiornamenti del 9 ottobre 2026

- **Archivio permanente** delle pagine notizia con almeno 2 fonti, con protezione (vedi "Archivio").
- **Pagine notizia** nella lingua della notizia, con numero di fonti nel titolo e nella descrizione, confronto dei titoli delle testate, "Per capire di più" e fascia "Su FAIND trovi anche".
- **Argomenti** (`argomenti/`) e **archivio per mese** (`archivio/`), che crescono da soli.
- **Glossario:** voce "Deep agents" (fonti: LangChain, blog del 30 luglio 2025 e documentazione ufficiale) e una pagina per termine.
- **robots.txt e IndexNow.**
- **Navigazione:** freccia "torna su" e ritorno al punto esatto (`nav.js`, `script.js`). Versione dei file in `index.html`: `20261009a`.
- **LinkedIn, post del venerdì:** card disegnata con la notizia più ripresa della settimana al posto del logo (`social/settimana-ai.png`).
