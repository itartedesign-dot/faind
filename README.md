# FAIND — AI News Agency

Sito statico (HTML + CSS + JavaScript vanilla), zero dipendenze. Le notizie si aggiornano da sole ogni ora grazie a una GitHub Action gratuita.

## Struttura

```
index.html                         pagina
style.css                          stile (chiaro/scuro, responsive)
script.js                          logica: sezioni, settori, filtri, lingue, tema, barra TG
data.js                            contenuti della redazione: aperture, guide, prezzi, convenzioni
scripts/feeds.json                 fonti RSS da cui raccogliere le notizie
scripts/fetch-news.mjs             raccoglie, classifica e raggruppa le notizie → news.json
.github/workflows/update-news.yml  esegue la raccolta ogni ora e pubblica il sito
assets/                            logo scontornato (chiaro e scuro), favicon
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

`scripts/glossary.mjs` genera il glossario in quattro lingue (`glossario/`, `glossario/en/`, `glossario/fr/`, `glossario/de/`). Nelle pagine notizia i termini trovati nel testo diventano link alla definizione e compaiono nel riquadro "Parole chiave"; sotto ogni termine del glossario ci sono le ultime notizie che lo citano. Per aggiungere un termine: una voce in `TERMS` (nome e definizione nelle quattro lingue, più la regola `re` per riconoscerlo).

## Card di condivisione (cartella `og/`)

`scripts/cards.mjs` disegna per ogni pagina notizia un'immagine 1200×630 con logo, settore, titolo e fonte: è l'anteprima che compare quando il link viene condiviso. Usa il browser Chrome già presente sulle macchine di GitHub. Le card già fatte vengono riprese dal sito online; se ne creano al massimo 60 nuove per giro (`CARDS_PER_RUN`). Senza card, la pagina usa l'immagine della fonte o il logo.

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

- **LinkedIn tramite Buffer:** `scripts/linkedin.mjs` consegna a Buffer i post preparati da `scripts/telegram.mjs` (`tgState.linkedin`). Tre post a settimana: lunedì classifica lavori, mercoledì un approfondimento (card `og/<slug>.png`), venerdì la settimana dell'AI. Segreto `BUFFER_API_KEY`.
- **Card degli approfondimenti:** generate da `build-pages.mjs` con `buildCards`, come quelle delle notizie.
- **Il punto delle 8 e il post del venerdì:** precedenza alle notizie in italiano (`italianFirst` in `telegram.mjs`).
- **Lavori AI:** gli annunci si accumulano per `maxAgeDays`; ricerche mirate in `feeds.json` → `jobs.jobicyTags`.
- **Home:** pulsanti e link alla pagina LinkedIn; newsletter solo settimanale.
- **Automazione:** macchina fissata a `ubuntu-24.04`, perché card e grafiche dipendono dal Chrome preinstallato.
