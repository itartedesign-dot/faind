/* =====================================================================
   FAIND — Contenuti del sito
   ---------------------------------------------------------------------
   Questo è l'unico file da modificare per pubblicare notizie, guide,
   prezzi e convenzioni. Nessun database, nessun build: salva e fai push.

   REGOLE REDAZIONALI (obbligatorie):
   • Ogni voce DEVE avere `source` (nome + url della fonte originale)
     e `link` (url diretto per leggere / scaricare / provare).
   • `date` in formato ISO. Se conosci l'ora esatta aggiungila
     (es. "2026-09-30T14:32:00+02:00"): il feed mostrerà l'orario.
   • `tag` (tipo): news | tool | prezzi | download | guide | convenzioni
   • `category` (settore): chatbot | immagini | video | musica | codice |
     produttivita | ricerca | hardware | regole | altro
   • `priority: "alta"` porta la notizia nella sezione "Importanti".
     Le notizie automatiche ci finiscono da sole quando ne parlano
     almeno 3 fonti diverse.
   • `lead: true` = apertura della home (una sola).
   • `link.type`: read | download | try | deal
   • I testi possono essere una stringa (IT) oppure un oggetto
     multilingua: { it: "...", en: "...", fr: "...", de: "..." }

   Le notizie automatiche (news.json, generato ogni ora dalla GitHub
   Action) si sommano a queste. Se la stessa notizia è in entrambi,
   vince la versione scritta qui.
   ===================================================================== */

window.FAIND_DATA = {
  updated: "2026-09-30",

  /* ---------------------------- NOTIZIE ---------------------------- */
  news: [
    {
      id: "opus-55-prezzo",
      category: "chatbot",
      date: "2026-09-28",
      tag: "prezzi",
      lead: true,
      title: {
        it: "Claude Opus 5.5 debutta con un listino API più basso del 40% rispetto a Opus 5",
        en: "Claude Opus 5.5 launches with API pricing 40% below Opus 5"
      },
      summary: {
        it: "Anthropic aggiorna il suo modello di punta e ne riduce il costo per gli sviluppatori. È una delle mosse di prezzo più rilevanti della settimana 21–27 settembre, in un mercato dove i listini dei modelli frontier continuano a scendere.",
        en: "Anthropic updates its flagship model and cuts its cost for developers — one of the most relevant pricing moves of the week of 21–27 September."
      },
      source: { name: "Unrot — AI News This Week", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" },
      link: { type: "read", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" }
    },
    {
      id: "sora-api-stop",
      category: "video",
      priority: "alta",
      date: "2026-09-27",
      tag: "news",
      title: "OpenAI spegne l'API di Sora dopo aver chiuso app e sito ad aprile",
      summary: "Lo stop è scattato il 24 settembre. Secondo le ricostruzioni il servizio costava circa un milione di dollari al giorno a fronte di ricavi complessivi molto bassi.",
      source: { name: "Unrot — AI News This Week", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" },
      link: { type: "read", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" }
    },
    {
      id: "qwen-audio-prezzi",
      category: "musica",
      priority: "alta",
      date: "2026-09-25",
      tag: "prezzi",
      title: "Alibaba lancia Qwen-Audio 3.1 e taglia i prezzi delle API vocali fino al 95%",
      summary: "Riduzioni fino al 95% sul riconoscimento vocale, circa il 70% sulla sintesi e intorno all'85% sulle API realtime. Un segnale forte per chi costruisce assistenti vocali.",
      source: { name: "The Decoder via AI Weekly", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" },
      link: { type: "read", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" }
    },
    {
      id: "ban-asi-act",
      category: "regole",
      priority: "alta",
      date: "2026-09-25",
      tag: "news",
      title: "USA, Sanders e Casar presentano una legge per vietare la superintelligenza artificiale",
      summary: "Il Ban Artificial Superintelligence Act prevede lo stop ai sistemi più avanzati in attesa di regole federali e la nascita di un Dipartimento per l'AI con rango ministeriale.",
      source: { name: "AI Weekly", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" },
      link: { type: "read", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" }
    },
    {
      id: "google-tpu-orbita",
      category: "hardware",
      date: "2026-09-24",
      tag: "news",
      title: "Google porterà quattro TPU in orbita il 1° ottobre",
      summary: "Primo test di calcolo AI nello spazio per i chip di Google, riportato dal New York Times.",
      source: { name: "New York Times via AI Weekly", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" },
      link: { type: "read", url: "https://aiweekly.co/ai-news-today/edition/2026-09-25" }
    },
    {
      id: "suno-causa",
      category: "musica",
      date: "2026-09-23",
      tag: "news",
      title: "UMG e Sony fanno causa a Suno per oltre 60.000 registrazioni",
      summary: "Nuovo fronte legale tra major discografiche e generatori musicali basati sull'AI.",
      source: { name: "Unrot — AI News This Week", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" },
      link: { type: "read", url: "https://www.unrot.co/blogs/ai-news-this-week-20-biggest-ai-stories-september-21-27-2026" }
    },
    {
      id: "mit-robot",
      category: "ricerca",
      date: "2026-09-22",
      tag: "news",
      title: "MIT, il micro-robot volante diventa più veloce del 450% grazie a un controllo AI",
      summary: "Il nuovo sistema di controllo gli consente un'agilità da insetto: dieci capriole in undici secondi.",
      source: { name: "ScienceDaily", url: "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/" },
      link: { type: "read", url: "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/" }
    },
    {
      id: "cursor-openai",
      category: "codice",
      date: "2026-09-15",
      tag: "tool",
      title: "Cursor perderà l'accesso ai modelli OpenAI dal 12 novembre",
      summary: "Chi usa l'editor con modelli OpenAI dovrà pianificare alternative: gli integratori stanno aggiungendo fallback su Anthropic e modelli locali.",
      source: { name: "Local AI Zone — September 2026 Dispatch", url: "https://local-ai-zone.github.io/blog/September_2026_AI_Model_Updates.html" },
      link: { type: "read", url: "https://local-ai-zone.github.io/blog/September_2026_AI_Model_Updates.html" }
    },
    {
      id: "meta-muse",
      category: "produttivita",
      date: "2026-09-11",
      tag: "tool",
      title: "Meta lancia Muse, l'agente AI che lavora dentro WhatsApp anche a chat chiusa",
      summary: "L'app è salita al secondo posto negli store USA nei primi giorni, secondo i dati Sensor Tower.",
      source: { name: "AI Daily Post", url: "https://aidailypost.com/archives/2026/09" },
      link: { type: "read", url: "https://aidailypost.com/archives/2026/09" }
    },
    {
      id: "gpt-live-api",
      category: "musica",
      date: "2026-09-10",
      tag: "tool",
      title: "OpenAI apre GPT-Live-1 agli sviluppatori tramite API",
      summary: "È lo stesso modello vocale già in uso dentro ChatGPT, ora disponibile per app di terze parti.",
      source: { name: "AI Daily Post", url: "https://aidailypost.com/archives/2026/09" },
      link: { type: "read", url: "https://aidailypost.com/archives/2026/09" }
    },
    {
      id: "anthropic-lambda",
      category: "hardware",
      date: "2026-09-01",
      tag: "news",
      title: "Anthropic firma un accordo cloud da 35 miliardi con Lambda",
      summary: "L'intesa porta nuova capacità di calcolo Nvidia dedicata a Claude, secondo il Wall Street Journal.",
      source: { name: "Wall Street Journal via AI Weekly", url: "https://aiweekly.co/ai-news-today/edition/2026-09-01" },
      link: { type: "read", url: "https://aiweekly.co/ai-news-today/edition/2026-09-01" }
    }
  ],

  /* ------------------------ GUIDE & DOWNLOAD ------------------------ */
  guides: [
    {
      id: "ollama",
      category: "chatbot",
      tag: "download",
      title: "Ollama: esegui modelli AI in locale",
      summary: "Il modo più rapido per far girare modelli open sul tuo computer. macOS, Windows, Linux.",
      source: { name: "ollama.com", url: "https://ollama.com" },
      link: { type: "download", url: "https://ollama.com/download" }
    },
    {
      id: "lmstudio",
      category: "chatbot",
      tag: "download",
      title: "LM Studio: modelli locali con interfaccia grafica",
      summary: "Scarica, prova e confronta modelli open senza usare il terminale.",
      source: { name: "lmstudio.ai", url: "https://lmstudio.ai" },
      link: { type: "download", url: "https://lmstudio.ai" }
    },
    {
      id: "claude-desktop",
      category: "chatbot",
      tag: "download",
      title: "App desktop di Claude",
      summary: "Versione ufficiale per macOS e Windows.",
      source: { name: "Anthropic", url: "https://claude.ai/download" },
      link: { type: "download", url: "https://claude.ai/download" }
    },
    {
      id: "chatgpt-desktop",
      category: "chatbot",
      tag: "download",
      title: "App desktop di ChatGPT",
      summary: "Versione ufficiale per macOS e Windows.",
      source: { name: "OpenAI", url: "https://openai.com/chatgpt/download/" },
      link: { type: "download", url: "https://openai.com/chatgpt/download/" }
    },
    {
      id: "comfyui",
      category: "immagini",
      tag: "guide",
      title: "ComfyUI: generare immagini con modelli open",
      summary: "L'interfaccia a nodi più usata per Stable Diffusion e modelli simili. Istruzioni di installazione nel repository.",
      source: { name: "GitHub", url: "https://github.com/comfyanonymous/ComfyUI" },
      link: { type: "download", url: "https://github.com/comfyanonymous/ComfyUI" }
    },
    {
      id: "prompting",
      category: "chatbot",
      tag: "guide",
      title: "Scrivere prompt efficaci: la guida ufficiale di Anthropic",
      summary: "Istruzioni chiare, esempi, formati di output: le basi che funzionano con qualsiasi modello.",
      source: { name: "Claude Docs", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" },
      link: { type: "read", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview" }
    }
  ],

  /* ---------------------- PREZZI & ABBONAMENTI ---------------------- */
  /* Prezzi di listino USA, tasse escluse. Aggiorna `checked` ogni volta
     che verifichi. `annual` = prezzo mensile equivalente con piano annuale. */
  prices: {
    checked: "2026-09-30",
    currency: "USD",
    verifiedBy: { name: "Fello AI — AI pricing comparison", url: "https://felloai.com/ai-pricing-comparison/" },
    items: [
      { name: "Google AI Plus", vendor: "Google", monthly: 4.99, url: "https://gemini.google/subscriptions/" },
      { name: "ChatGPT Go", vendor: "OpenAI", monthly: 8, url: "https://openai.com/chatgpt/pricing/" },
      { name: "Google AI Pro", vendor: "Google", monthly: 19.99, url: "https://gemini.google/subscriptions/" },
      { name: "ChatGPT Plus", vendor: "OpenAI", monthly: 20, url: "https://openai.com/chatgpt/pricing/" },
      { name: "Claude Pro", vendor: "Anthropic", monthly: 20, annual: 17, url: "https://claude.com/pricing" },
      { name: "Perplexity Pro", vendor: "Perplexity", monthly: 20, annual: 16.67, url: "https://www.perplexity.ai/pro" }
    ]
  },

  /* ---------------------- CONVENZIONI & SCONTI ---------------------- */
  /* `demo: true` mostra il badge "Esempio": rimuovilo solo quando il
     codice è reale e concordato con il fornitore. */
  deals: [
    {
      id: "claude-annual",
      title: "Claude Pro con piano annuale",
      detail: "17 $/mese invece di 20 $ (fatturazione annuale).",
      saving: "−15%",
      source: { name: "Anthropic", url: "https://claude.com/pricing" },
      link: { type: "deal", url: "https://claude.com/pricing" }
    },
    {
      id: "perplexity-annual",
      title: "Perplexity Pro con piano annuale",
      detail: "200 $/anno invece di 240 $ pagando mese per mese.",
      saving: "−17%",
      source: { name: "Perplexity", url: "https://www.perplexity.ai/pro" },
      link: { type: "deal", url: "https://www.perplexity.ai/pro" }
    },
    {
      id: "community-demo",
      demo: true,
      title: "Codice community FAIND",
      detail: "Spazio riservato ai codici sconto concordati con i partner.",
      code: "FAIND20",
      source: { name: "FAIND", url: "#convenzioni" },
      link: { type: "deal", url: "#contatti" }
    }
  ]
};
