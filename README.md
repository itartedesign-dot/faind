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

## Settori

`chatbot`, `immagini`, `video`, `musica`, `codice`, `produttivita`, `ricerca`, `hardware`, `regole`, `altro`.
Le notizie automatiche vengono classificate da sole con parole chiave (in `scripts/fetch-news.mjs`, lista `CATEGORIES`). Cliccando un settore, o cercando, la home diventa una pagina di risultati filtrabile anche per tipo.

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

## Contatti e donazioni

- "Scrivici" apre l'app di posta con il messaggio pronto verso `itartedesign@gmail.com`.
- Il pulsante PayPal usa il link donazioni ufficiale verso `buono.p@alice.it`.
