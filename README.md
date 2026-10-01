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

1. Vai su https://search.google.com/search-console e aggiungi la proprietà **Prefisso URL**: `https://itartedesign-dot.github.io/faind/`.
2. Scegli la verifica **Tag HTML**, copia il meta tag e incollalo in `index.html` al posto del commento "Google Search Console".
3. Dopo la verifica: **Sitemap** → inserisci `sitemap.xml` → Invia. Poi **Controllo URL** → incolla l'indirizzo del sito → **Richiedi indicizzazione**.
Google impiega da qualche giorno a qualche settimana per mostrare un sito nuovo. Link da social, forum e altri siti accelerano molto.

## Contatti e donazioni

- "Scrivici" apre l'app di posta con il messaggio pronto verso `itartedesign@gmail.com`.
- Il pulsante PayPal usa il link donazioni ufficiale verso `buono.p@alice.it`.
