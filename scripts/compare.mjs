/* =====================================================================
   FAIND — "Le AI a confronto" (cartella confronto/)
   ---------------------------------------------------------------------
   Pagina di confronto tra gli assistenti AI più usati, in quattro lingue:
   confronto/ (italiano), confronto/en/, confronto/fr/, confronto/de/.
   Contiene: classifica dei prezzi dal più caro al più economico, una
   scheda per ogni AI (cos'è, per chi, pro, contro, piani, giudizio del
   fondatore) e le domande frequenti, con i dati strutturati per Google.

   I dati sono qui sotto:
   • CHECKED = data dell'ultima verifica a mano di prezzi e schede;
   • SERVICES = piani e prezzi (uguali in tutte le lingue);
   • TEXT = testi delle schede nelle quattro lingue.
   Quando un prezzo cambia: aggiornare SERVICES e CHECKED (e data.js).
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://faind.org/';
export const COMPARE_DIR = { it: 'confronto/', en: 'confronto/en/', fr: 'confronto/fr/', de: 'confronto/de/' };
const CHECKED = '2026-10-03';
const PRICE_SOURCE = { name: 'AI Price Compare', url: 'https://aipricecompare.org/' };

// Prezzi mensili in dollari (listini USA). [nome del piano, prezzo, nota facoltativa]
const SERVICES = [
  { id: 'chatgpt', name: 'ChatGPT', by: 'OpenAI', url: 'https://chatgpt.com/', color: '#10A37F', free: true,
    plans: [['ChatGPT Go', 8], ['ChatGPT Plus', 20], ['ChatGPT Pro', 100], ['ChatGPT Pro (max)', 200]] },
  { id: 'claude', name: 'Claude', by: 'Anthropic', url: 'https://claude.ai/', color: '#D97757', free: true,
    plans: [['Claude Pro', 20, 17], ['Claude Max 5×', 100], ['Claude Max 20×', 200]] },
  { id: 'gemini', name: 'Gemini', by: 'Google', url: 'https://gemini.google.com/', color: '#4285F4', free: true,
    plans: [['Google AI Plus', 4.99], ['Google AI Pro', 19.99], ['Google AI Ultra', 99.99], ['Google AI Ultra (max)', 199.99]] },
  { id: 'copilot', name: 'Copilot', by: 'Microsoft', url: 'https://copilot.microsoft.com/', color: '#0F6CBD', free: true,
    plans: [['Microsoft 365 Premium', 19.99, 16.67], ['Microsoft 365 Pro', 99.99]] },
  { id: 'perplexity', name: 'Perplexity', by: 'Perplexity AI', url: 'https://www.perplexity.ai/', color: '#20808D', free: true,
    plans: [['Perplexity Pro', 20, 16.67], ['Perplexity Max', 200]] },
  { id: 'grok', name: 'Grok', by: 'SpaceXAI', url: 'https://grok.com/', color: '#5B6475', free: true,
    plans: [['SuperGrok', 30], ['SuperGrok Heavy', 300]] },
  { id: 'deepseek', name: 'DeepSeek', by: 'DeepSeek AI', url: 'https://chat.deepseek.com/', color: '#4D6BFE', free: true, plans: [] }
];

const UI = {
  it: { locale: 'it-IT', pageLang: 'Lingua della pagina', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND',
    seo: 'Le AI a confronto: ChatGPT, Claude, Gemini e le altre. Prezzi, pro e contro',
    desc: 'Quale AI scegliere? ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok e DeepSeek a confronto: prezzi dal più caro al più economico, cosa fa meglio ciascuna, pro e contro e il giudizio di chi le usa ogni giorno.',
    h1: 'Le AI a confronto: quale scegliere',
    lede: 'ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok e DeepSeek messe una accanto all\'altra: quanto costano, che cosa fa meglio ciascuna, dove è più debole. Niente classifiche assolute: la migliore dipende da cosa devi farci.',
    updated: (d) => `Prezzi e schede verificati il ${d}. Prezzi in dollari, listini USA, tasse escluse: in Europa possono essere più alti.`,
    toc: ['Classifica prezzi', 'Le schede', 'Quale scegliere', 'Domande frequenti'],
    rankT: 'Quanto costano le AI: la classifica dal piano più caro al più economico', rankI: 'Tutti i piani a pagamento per privati, ordinati per prezzo mensile. Ogni servizio ha anche un piano gratuito.',
    thPlan: 'Piano', thBy: 'Di', thMonth: 'Al mese', thYear: 'Con pagamento annuale', free: 'Piano gratuito', freeOnly: 'Solo gratuito: nessun piano a pagamento', priceSrc: 'Controllo incrociato dei prezzi',
    cardsT: 'ChatGPT, Claude, Gemini e le altre: le schede', what: 'Che cos\'è', best: 'Ideale per', pros: 'Pro', cons: 'Contro', plans: 'Piani', site: 'Sito ufficiale', verdict: 'Il giudizio di Paolo Buono',
    pickT: 'Quale AI scegliere se…', faqT: 'Domande frequenti', by: 'di', perMonth: '/mese',
    author: 'I giudizi sono di <a href="{about}">Paolo Buono</a>, fondatore di FAIND, che usa questi strumenti dal loro esordio. Sono opinioni personali, non test di laboratorio: FAIND non riceve compensi da nessuna delle aziende citate.',
    foot: ['Chi siamo', 'Temi', 'Glossario', 'Feed RSS', 'Privacy e note legali'], about: 'redazione.html', topics: 'temi/', gloss: 'glossario/', crumb: 'Le AI a confronto',
    faq: [
      ['Qual è la migliore AI nel 2026?', 'Non ce n\'è una migliore in assoluto. ChatGPT è la più completa per l\'uso generale, Claude è preferita per testi lunghi e programmazione, Gemini conviene a chi vive in Gmail e Documenti, Perplexity è la più adatta alla ricerca con le fonti. La scelta dipende dal lavoro da fare.'],
      ['Quanto costa un abbonamento a un\'AI?', 'Il piano standard costa circa 20 dollari al mese per quasi tutti: ChatGPT Plus, Claude Pro e Perplexity Pro a 20, Google AI Pro e Microsoft 365 Premium a 19,99. Esistono piani più economici (Google AI Plus a 4,99, ChatGPT Go a 8) e piani professionali da 100 a 300 dollari al mese.'],
      ['Si può usare l\'intelligenza artificiale gratis?', 'Sì. Tutti i servizi di questa pagina hanno un piano gratuito, con limiti sul numero di richieste o sui modelli disponibili. DeepSeek è l\'unico interamente gratuito, senza piani a pagamento.'],
      ['Meglio ChatGPT o Claude?', 'ChatGPT è più versatile: immagini, voce, tante funzioni in una sola app. Claude è più forte nella scrittura curata, nei documenti lunghi e nel codice. Chi fa un po\' di tutto parte da ChatGPT; chi scrive o programma molto spesso preferisce Claude.'],
      ['Meglio ChatGPT o Gemini?', 'Gemini costa meno all\'ingresso e si integra con Gmail, Documenti e Drive, con spazio di archiviazione incluso. ChatGPT ha più funzioni e un ecosistema più ampio. Se usi già i servizi Google, Gemini è la scelta naturale.'],
      ['Conviene pagare 200 dollari al mese per un piano Pro o Max?', 'Solo se raggiungi ogni giorno i limiti del piano da 20 dollari. I piani più costosi sono pensati per chi lavora con l\'AI molte ore al giorno; per un uso normale sono soldi sprecati.']
    ] },
  en: { locale: 'en-GB', pageLang: 'Page language', back: '← All news', home: 'Back to FAIND news',
    seo: 'AI assistants compared: ChatGPT, Claude, Gemini and the rest. Prices, pros and cons',
    desc: 'Which AI should you choose? ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok and DeepSeek compared: prices from highest to lowest, what each does best, pros and cons, and the verdict of someone who uses them every day.',
    h1: 'AI assistants compared: which one to choose',
    lede: 'ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok and DeepSeek side by side: what they cost, what each does best, where each is weaker. No absolute ranking: the best one depends on what you need it for.',
    updated: (d) => `Prices and profiles checked on ${d}. Prices in US dollars, US list prices, taxes excluded: they may be higher in Europe.`,
    toc: ['Price ranking', 'Profiles', 'Which to choose', 'FAQ'],
    rankT: 'What AI subscriptions cost: ranked from the most expensive plan to the cheapest', rankI: 'All paid plans for individuals, sorted by monthly price. Every service also has a free plan.',
    thPlan: 'Plan', thBy: 'By', thMonth: 'Per month', thYear: 'Billed annually', free: 'Free plan', freeOnly: 'Free only: no paid plan', priceSrc: 'Prices cross-checked with',
    cardsT: 'ChatGPT, Claude, Gemini and the rest: the profiles', what: 'What it is', best: 'Best for', pros: 'Pros', cons: 'Cons', plans: 'Plans', site: 'Official site', verdict: 'Paolo Buono\'s verdict',
    pickT: 'Which AI to choose if…', faqT: 'Frequently asked questions', by: 'by', perMonth: '/month',
    author: 'The verdicts are by <a href="{about}">Paolo Buono</a>, founder of FAIND, who has used these tools since they first appeared. They are personal opinions, not lab tests: FAIND receives no payment from any of the companies mentioned.',
    foot: ['About us', 'Topics', 'Glossary', 'RSS feed', 'Privacy and legal notes'], about: 'about.html', topics: 'temi/en/', gloss: 'glossario/en/', crumb: 'AI assistants compared',
    faq: [
      ['Which is the best AI in 2026?', 'There is no single best one. ChatGPT is the most complete for general use, Claude is preferred for long texts and programming, Gemini suits people who live in Gmail and Docs, Perplexity is best for research with sources. The choice depends on the job.'],
      ['How much does an AI subscription cost?', 'The standard plan costs about 20 dollars a month almost everywhere: ChatGPT Plus, Claude Pro and Perplexity Pro at 20, Google AI Pro and Microsoft 365 Premium at 19.99. There are cheaper plans (Google AI Plus at 4.99, ChatGPT Go at 8) and professional plans from 100 to 300 dollars a month.'],
      ['Can you use artificial intelligence for free?', 'Yes. Every service on this page has a free plan, with limits on the number of requests or the models available. DeepSeek is the only one that is entirely free, with no paid plans.'],
      ['ChatGPT or Claude?', 'ChatGPT is more versatile: images, voice, many features in one app. Claude is stronger at careful writing, long documents and code. If you do a bit of everything, start with ChatGPT; if you write or code a lot, you will often prefer Claude.'],
      ['ChatGPT or Gemini?', 'Gemini is cheaper to start with and integrates with Gmail, Docs and Drive, with storage included. ChatGPT has more features and a wider ecosystem. If you already use Google services, Gemini is the natural choice.'],
      ['Is a 200-dollar Pro or Max plan worth it?', 'Only if you hit the limits of the 20-dollar plan every day. The most expensive plans are meant for people who work with AI many hours a day; for normal use they are money wasted.']
    ] },
  fr: { locale: 'fr-FR', pageLang: 'Langue de la page', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND',
    seo: 'Les IA comparées : ChatGPT, Claude, Gemini et les autres. Prix, avantages et inconvénients',
    desc: 'Quelle IA choisir ? ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok et DeepSeek comparées : prix du plus cher au moins cher, points forts de chacune, avantages et inconvénients, et l\'avis de quelqu\'un qui les utilise chaque jour.',
    h1: 'Les IA comparées : laquelle choisir',
    lede: 'ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok et DeepSeek côte à côte : ce qu\'elles coûtent, ce que chacune fait le mieux, où elle est plus faible. Pas de classement absolu : la meilleure dépend de ce que vous voulez en faire.',
    updated: (d) => `Prix et fiches vérifiés le ${d}. Prix en dollars, tarifs américains, hors taxes : ils peuvent être plus élevés en Europe.`,
    toc: ['Classement des prix', 'Les fiches', 'Laquelle choisir', 'Questions fréquentes'],
    rankT: 'Combien coûtent les IA : le classement de l\'offre la plus chère à la moins chère', rankI: 'Toutes les offres payantes pour particuliers, classées par prix mensuel. Chaque service propose aussi une offre gratuite.',
    thPlan: 'Offre', thBy: 'Par', thMonth: 'Par mois', thYear: 'Paiement annuel', free: 'Offre gratuite', freeOnly: 'Gratuit uniquement : aucune offre payante', priceSrc: 'Prix recoupés avec',
    cardsT: 'ChatGPT, Claude, Gemini et les autres : les fiches', what: 'Ce que c\'est', best: 'Idéale pour', pros: 'Avantages', cons: 'Inconvénients', plans: 'Offres', site: 'Site officiel', verdict: 'L\'avis de Paolo Buono',
    pickT: 'Quelle IA choisir si…', faqT: 'Questions fréquentes', by: 'par', perMonth: '/mois',
    author: 'Les avis sont de <a href="{about}">Paolo Buono</a>, fondateur de FAIND, qui utilise ces outils depuis leurs débuts. Ce sont des opinions personnelles, pas des tests de laboratoire : FAIND ne reçoit aucune rémunération des entreprises citées.',
    foot: ['Qui sommes-nous', 'Thèmes', 'Glossaire', 'Flux RSS', 'Confidentialité et mentions légales'], about: 'a-propos.html', topics: 'temi/fr/', gloss: 'glossario/fr/', crumb: 'Les IA comparées',
    faq: [
      ['Quelle est la meilleure IA en 2026 ?', 'Il n\'y en a pas une meilleure dans l\'absolu. ChatGPT est la plus complète pour un usage général, Claude est préférée pour les textes longs et la programmation, Gemini convient à ceux qui vivent dans Gmail et Docs, Perplexity est la plus adaptée à la recherche avec sources. Le choix dépend du travail à faire.'],
      ['Combien coûte un abonnement à une IA ?', 'L\'offre standard coûte environ 20 dollars par mois presque partout : ChatGPT Plus, Claude Pro et Perplexity Pro à 20, Google AI Pro et Microsoft 365 Premium à 19,99. Il existe des offres moins chères (Google AI Plus à 4,99, ChatGPT Go à 8) et des offres professionnelles de 100 à 300 dollars par mois.'],
      ['Peut-on utiliser l\'intelligence artificielle gratuitement ?', 'Oui. Tous les services de cette page ont une offre gratuite, avec des limites sur le nombre de requêtes ou les modèles disponibles. DeepSeek est le seul entièrement gratuit, sans offre payante.'],
      ['ChatGPT ou Claude ?', 'ChatGPT est plus polyvalent : images, voix, de nombreuses fonctions dans une seule application. Claude est plus fort pour l\'écriture soignée, les documents longs et le code. Pour un peu de tout, commencez par ChatGPT ; si vous écrivez ou programmez beaucoup, vous préférerez souvent Claude.'],
      ['ChatGPT ou Gemini ?', 'Gemini coûte moins cher à l\'entrée et s\'intègre à Gmail, Docs et Drive, avec du stockage inclus. ChatGPT a plus de fonctions et un écosystème plus large. Si vous utilisez déjà les services Google, Gemini est le choix naturel.'],
      ['Une offre Pro ou Max à 200 dollars vaut-elle le coup ?', 'Seulement si vous atteignez chaque jour les limites de l\'offre à 20 dollars. Les offres les plus chères sont pensées pour ceux qui travaillent avec l\'IA de nombreuses heures par jour ; pour un usage normal, c\'est de l\'argent gaspillé.']
    ] },
  de: { locale: 'de-DE', pageLang: 'Sprache der Seite', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten',
    seo: 'KI-Assistenten im Vergleich: ChatGPT, Claude, Gemini und die anderen. Preise, Vor- und Nachteile',
    desc: 'Welche KI soll man wählen? ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok und DeepSeek im Vergleich: Preise vom teuersten zum günstigsten Tarif, Stärken, Vor- und Nachteile und das Urteil von jemandem, der sie täglich nutzt.',
    h1: 'KI-Assistenten im Vergleich: welche wählen',
    lede: 'ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok und DeepSeek nebeneinander: was sie kosten, was jede am besten kann, wo sie schwächer ist. Keine absolute Rangliste: Die beste hängt davon ab, wofür man sie braucht.',
    updated: (d) => `Preise und Profile geprüft am ${d}. Preise in US-Dollar, US-Listenpreise, ohne Steuern: In Europa können sie höher sein.`,
    toc: ['Preisrangliste', 'Die Profile', 'Welche wählen', 'Häufige Fragen'],
    rankT: 'Was KI-Abos kosten: die Rangliste vom teuersten zum günstigsten Tarif', rankI: 'Alle kostenpflichtigen Tarife für Privatpersonen, nach Monatspreis sortiert. Jeder Dienst hat auch einen kostenlosen Tarif.',
    thPlan: 'Tarif', thBy: 'Von', thMonth: 'Pro Monat', thYear: 'Bei jährlicher Zahlung', free: 'Kostenloser Tarif', freeOnly: 'Nur kostenlos: kein Bezahltarif', priceSrc: 'Preise abgeglichen mit',
    cardsT: 'ChatGPT, Claude, Gemini und die anderen: die Profile', what: 'Was es ist', best: 'Ideal für', pros: 'Vorteile', cons: 'Nachteile', plans: 'Tarife', site: 'Offizielle Website', verdict: 'Das Urteil von Paolo Buono',
    pickT: 'Welche KI wählen, wenn…', faqT: 'Häufige Fragen', by: 'von', perMonth: '/Monat',
    author: 'Die Urteile stammen von <a href="{about}">Paolo Buono</a>, dem Gründer von FAIND, der diese Werkzeuge seit ihrem Erscheinen nutzt. Es sind persönliche Meinungen, keine Labortests: FAIND erhält von keinem der genannten Unternehmen eine Vergütung.',
    foot: ['Über uns', 'Themen', 'Glossar', 'RSS-Feed', 'Datenschutz und rechtliche Hinweise'], about: 'ueber-uns.html', topics: 'temi/de/', gloss: 'glossario/de/', crumb: 'KI-Assistenten im Vergleich',
    faq: [
      ['Welche ist die beste KI 2026?', 'Die eine beste gibt es nicht. ChatGPT ist für den allgemeinen Gebrauch am vollständigsten, Claude wird für lange Texte und Programmierung bevorzugt, Gemini passt zu allen, die in Gmail und Docs arbeiten, Perplexity eignet sich am besten für Recherche mit Quellen. Die Wahl hängt von der Aufgabe ab.'],
      ['Was kostet ein KI-Abo?', 'Der Standardtarif kostet fast überall rund 20 Dollar im Monat: ChatGPT Plus, Claude Pro und Perplexity Pro 20, Google AI Pro und Microsoft 365 Premium 19,99. Es gibt günstigere Tarife (Google AI Plus für 4,99, ChatGPT Go für 8) und Profi-Tarife von 100 bis 300 Dollar im Monat.'],
      ['Kann man künstliche Intelligenz kostenlos nutzen?', 'Ja. Alle Dienste auf dieser Seite haben einen kostenlosen Tarif, mit Grenzen bei der Zahl der Anfragen oder den verfügbaren Modellen. DeepSeek ist als einziger vollständig kostenlos, ohne Bezahltarife.'],
      ['ChatGPT oder Claude?', 'ChatGPT ist vielseitiger: Bilder, Sprache, viele Funktionen in einer App. Claude ist stärker beim sorgfältigen Schreiben, bei langen Dokumenten und beim Code. Wer von allem etwas macht, beginnt mit ChatGPT; wer viel schreibt oder programmiert, bevorzugt oft Claude.'],
      ['ChatGPT oder Gemini?', 'Gemini ist im Einstieg günstiger und in Gmail, Docs und Drive integriert, inklusive Speicherplatz. ChatGPT hat mehr Funktionen und ein größeres Ökosystem. Wer Google-Dienste bereits nutzt, für den ist Gemini die naheliegende Wahl.'],
      ['Lohnt sich ein Pro- oder Max-Tarif für 200 Dollar?', 'Nur wenn man täglich an die Grenzen des 20-Dollar-Tarifs stößt. Die teuersten Tarife sind für Menschen gedacht, die viele Stunden am Tag mit KI arbeiten; für normale Nutzung ist das verschwendetes Geld.']
    ] }
};

// Per ogni AI e lingua: what, best, pros[3], cons[3], verdict, pick ("se…")
const TEXT = {
  chatgpt: {
    it: { what: 'L\'assistente AI più usato al mondo, sviluppato da OpenAI: risponde, scrive, crea immagini, parla a voce e svolge compiti in più passaggi.', best: 'uso generale, scrittura di tutti i giorni, immagini, chi vuole una sola app per tutto', pick: 'vuoi una sola AI per fare un po\' di tutto',
      pros: ['La più completa: testo, immagini, voce e strumenti nella stessa app', 'Piano d\'ingresso economico (Go) oltre al classico Plus', 'Enorme quantità di guide, esempi e integrazioni'],
      cons: ['I piani più potenti costano molto', 'Il piano gratuito e il Go mostrano pubblicità in alcuni Paesi', 'Con tante funzioni, capire cosa include ogni piano non è immediato'],
      verdict: 'Per me resta il punto di partenza: se devo consigliare una sola AI a chi comincia, è questa. Fa bene quasi tutto, e quando serve qualcosa in più si capisce da soli dove andare a cercarlo.' },
    en: { what: 'The world\'s most widely used AI assistant, developed by OpenAI: it answers, writes, creates images, speaks and carries out multi-step tasks.', best: 'general use, everyday writing, images, anyone who wants a single app for everything', pick: 'you want one AI to do a bit of everything',
      pros: ['The most complete: text, images, voice and tools in one app', 'A cheap entry plan (Go) alongside the classic Plus', 'A huge amount of guides, examples and integrations'],
      cons: ['The most powerful plans are expensive', 'The free plan and Go show ads in some countries', 'With so many features, it is not obvious what each plan includes'],
      verdict: 'For me it is still the starting point: if I have to recommend a single AI to a beginner, this is it. It does almost everything well, and when you need something more you soon see where to look.' },
    fr: { what: 'L\'assistant IA le plus utilisé au monde, développé par OpenAI : il répond, écrit, crée des images, parle et réalise des tâches en plusieurs étapes.', best: 'l\'usage général, l\'écriture au quotidien, les images, ceux qui veulent une seule application pour tout', pick: 'vous voulez une seule IA pour faire un peu de tout',
      pros: ['La plus complète : texte, images, voix et outils dans la même application', 'Une offre d\'entrée bon marché (Go) en plus du classique Plus', 'Une énorme quantité de guides, d\'exemples et d\'intégrations'],
      cons: ['Les offres les plus puissantes coûtent cher', 'L\'offre gratuite et Go affichent de la publicité dans certains pays', 'Avec autant de fonctions, difficile de savoir ce que chaque offre inclut'],
      verdict: 'Pour moi, cela reste le point de départ : si je dois conseiller une seule IA à un débutant, c\'est celle-ci. Elle fait presque tout bien, et quand il faut davantage, on comprend vite où chercher.' },
    de: { what: 'Der meistgenutzte KI-Assistent der Welt, entwickelt von OpenAI: Er antwortet, schreibt, erstellt Bilder, spricht und erledigt mehrstufige Aufgaben.', best: 'allgemeine Nutzung, alltägliches Schreiben, Bilder, alle, die eine einzige App für alles wollen', pick: 'du eine einzige KI für ein bisschen von allem willst',
      pros: ['Am vollständigsten: Text, Bilder, Sprache und Werkzeuge in einer App', 'Günstiger Einstiegstarif (Go) neben dem klassischen Plus', 'Riesige Menge an Anleitungen, Beispielen und Integrationen'],
      cons: ['Die leistungsstärksten Tarife sind teuer', 'Der kostenlose Tarif und Go zeigen in einigen Ländern Werbung', 'Bei so vielen Funktionen ist nicht sofort klar, was welcher Tarif enthält'],
      verdict: 'Für mich bleibt es der Ausgangspunkt: Wenn ich Einsteigern eine einzige KI empfehlen soll, dann diese. Sie macht fast alles gut, und wenn man mehr braucht, merkt man schnell, wo man suchen muss.' } },
  claude: {
    it: { what: 'L\'assistente di Anthropic, apprezzato per la qualità della scrittura, il ragionamento accurato e la programmazione.', best: 'testi lunghi e curati, analisi di documenti, programmazione', pick: 'scrivi molto, lavori su documenti lunghi o programmi',
      pros: ['Scrittura naturale e precisa, anche su testi lunghi', 'Tra i più forti nel codice e nell\'analisi di documenti', 'Sconto con il pagamento annuale'],
      cons: ['Nessun piano economico sotto i 20 dollari', 'I limiti d\'uso dipendono dalla lunghezza delle conversazioni e si raggiungono in fretta nei lavori pesanti', 'Meno funzioni "di contorno" (immagini, video) rispetto a ChatGPT e Gemini'],
      verdict: 'È quella a cui affido i lavori che richiedono testa: un testo da rifinire, un documento lungo da capire, del codice. Meno effetti speciali, più sostanza. Se scrivi o programmi per mestiere, i 20 dollari li vale tutti.' },
    en: { what: 'Anthropic\'s assistant, valued for the quality of its writing, careful reasoning and programming.', best: 'long, polished texts, document analysis, programming', pick: 'you write a lot, work on long documents or code',
      pros: ['Natural, precise writing, even on long texts', 'Among the strongest at code and document analysis', 'Discount with annual billing'],
      cons: ['No cheap plan below 20 dollars', 'Usage limits depend on conversation length and are reached quickly on heavy work', 'Fewer side features (images, video) than ChatGPT and Gemini'],
      verdict: 'It is the one I trust with work that needs thought: a text to polish, a long document to understand, some code. Fewer special effects, more substance. If you write or code for a living, it is worth every one of the 20 dollars.' },
    fr: { what: 'L\'assistant d\'Anthropic, apprécié pour la qualité de son écriture, la rigueur de son raisonnement et la programmation.', best: 'les textes longs et soignés, l\'analyse de documents, la programmation', pick: 'vous écrivez beaucoup, travaillez sur de longs documents ou programmez',
      pros: ['Une écriture naturelle et précise, même sur de longs textes', 'Parmi les plus forts en code et en analyse de documents', 'Réduction avec le paiement annuel'],
      cons: ['Aucune offre bon marché sous les 20 dollars', 'Les limites d\'usage dépendent de la longueur des conversations et sont vite atteintes sur les gros travaux', 'Moins de fonctions annexes (images, vidéo) que ChatGPT et Gemini'],
      verdict: 'C\'est à elle que je confie les travaux qui demandent de la réflexion : un texte à peaufiner, un long document à comprendre, du code. Moins d\'effets spéciaux, plus de fond. Si vous écrivez ou programmez par métier, elle vaut largement ses 20 dollars.' },
    de: { what: 'Der Assistent von Anthropic, geschätzt für die Qualität seiner Texte, sorgfältiges Denken und Programmierung.', best: 'lange, ausgefeilte Texte, Dokumentenanalyse, Programmierung', pick: 'du viel schreibst, mit langen Dokumenten arbeitest oder programmierst',
      pros: ['Natürliches, präzises Schreiben, auch bei langen Texten', 'Zählt zu den stärksten bei Code und Dokumentenanalyse', 'Rabatt bei jährlicher Zahlung'],
      cons: ['Kein günstiger Tarif unter 20 Dollar', 'Die Nutzungsgrenzen hängen von der Gesprächslänge ab und sind bei aufwendiger Arbeit schnell erreicht', 'Weniger Nebenfunktionen (Bilder, Video) als ChatGPT und Gemini'],
      verdict: 'Ihm vertraue ich die Arbeiten an, die Köpfchen verlangen: einen Text feilen, ein langes Dokument verstehen, Code. Weniger Effekte, mehr Substanz. Wer beruflich schreibt oder programmiert, für den sind die 20 Dollar jeden Cent wert.' } },
  gemini: {
    it: { what: 'L\'AI di Google, integrata in Gmail, Documenti e Drive, con generazione di immagini e video.', best: 'chi usa i servizi Google, video, chi vuole spendere poco', pick: 'vivi in Gmail e Documenti o vuoi spendere il meno possibile',
      pros: ['Il piano a pagamento più economico tra i grandi (AI Plus)', 'Integrazione con Gmail, Documenti, Drive e spazio di archiviazione incluso', 'Molto forte nella generazione di video'],
      cons: ['Nomi dei piani e dei modelli cambiati spesso: orientarsi non è semplice', 'Alcune funzioni arrivano prima negli Stati Uniti che in Europa', 'Fuori dall\'ecosistema Google perde parte del vantaggio'],
      verdict: 'Se la tua giornata passa tra Gmail, Documenti e Drive, è la scelta più logica: ce l\'hai già dove lavori. E il piano da 4,99 è il modo più economico per provare un\'AI a pagamento senza pensieri.' },
    en: { what: 'Google\'s AI, built into Gmail, Docs and Drive, with image and video generation.', best: 'people who use Google services, video, anyone who wants to spend little', pick: 'you live in Gmail and Docs or want to spend as little as possible',
      pros: ['The cheapest paid plan among the big names (AI Plus)', 'Integration with Gmail, Docs and Drive, with storage included', 'Very strong at video generation'],
      cons: ['Plan and model names have changed often: finding your way is not easy', 'Some features reach the United States before Europe', 'Outside the Google ecosystem it loses part of its edge'],
      verdict: 'If your day runs between Gmail, Docs and Drive, it is the most logical choice: it is already where you work. And the 4.99 plan is the cheapest way to try a paid AI without a second thought.' },
    fr: { what: 'L\'IA de Google, intégrée à Gmail, Docs et Drive, avec génération d\'images et de vidéos.', best: 'ceux qui utilisent les services Google, la vidéo, ceux qui veulent dépenser peu', pick: 'vous vivez dans Gmail et Docs ou voulez dépenser le moins possible',
      pros: ['L\'offre payante la moins chère parmi les grands (AI Plus)', 'Intégration à Gmail, Docs et Drive, avec stockage inclus', 'Très forte en génération de vidéos'],
      cons: ['Les noms des offres et des modèles ont souvent changé : pas simple de s\'y retrouver', 'Certaines fonctions arrivent aux États-Unis avant l\'Europe', 'Hors de l\'écosystème Google, elle perd une partie de son avantage'],
      verdict: 'Si votre journée se passe entre Gmail, Docs et Drive, c\'est le choix le plus logique : elle est déjà là où vous travaillez. Et l\'offre à 4,99 est le moyen le moins cher d\'essayer une IA payante sans se poser de questions.' },
    de: { what: 'Die KI von Google, integriert in Gmail, Docs und Drive, mit Bild- und Videogenerierung.', best: 'Nutzer der Google-Dienste, Video, alle, die wenig ausgeben wollen', pick: 'du in Gmail und Docs lebst oder möglichst wenig ausgeben willst',
      pros: ['Der günstigste Bezahltarif unter den Großen (AI Plus)', 'Integration in Gmail, Docs und Drive, inklusive Speicherplatz', 'Sehr stark bei der Videogenerierung'],
      cons: ['Tarif- und Modellnamen haben oft gewechselt: Der Überblick fällt schwer', 'Manche Funktionen kommen in den USA früher als in Europa', 'Außerhalb des Google-Ökosystems verliert sie einen Teil ihres Vorteils'],
      verdict: 'Wenn dein Tag zwischen Gmail, Docs und Drive abläuft, ist sie die logischste Wahl: Sie ist schon dort, wo du arbeitest. Und der Tarif für 4,99 ist der günstigste Weg, eine Bezahl-KI unbeschwert auszuprobieren.' } },
  copilot: {
    it: { what: 'L\'AI di Microsoft, presente in Windows, Edge e nelle applicazioni Office.', best: 'chi lavora ogni giorno con Word, Excel, PowerPoint e Outlook', pick: 'lavori tutto il giorno in Word, Excel e Outlook',
      pros: ['Lavora dentro Word, Excel, PowerPoint e Outlook', 'Il piano Premium include le app Office e spazio su OneDrive, anche per la famiglia', 'Già presente in Windows, senza installare nulla'],
      cons: ['Il vecchio Copilot Pro non è più in vendita: oggi si passa da Microsoft 365', 'Ha senso soprattutto se usi già Office', 'Come assistente "puro" è meno brillante dei concorrenti'],
      verdict: 'Non è l\'AI che apro per fare una domanda, ma se il tuo lavoro è fatto di Excel, Word e riunioni su Teams ti fa risparmiare tempo proprio lì dove lo perdi. Va valutata come parte di Office, non come chatbot.' },
    en: { what: 'Microsoft\'s AI, found in Windows, Edge and the Office applications.', best: 'people who work every day with Word, Excel, PowerPoint and Outlook', pick: 'you work all day in Word, Excel and Outlook',
      pros: ['Works inside Word, Excel, PowerPoint and Outlook', 'The Premium plan includes the Office apps and OneDrive storage, for the family too', 'Already in Windows, nothing to install'],
      cons: ['The old Copilot Pro is no longer sold: today you go through Microsoft 365', 'It mostly makes sense if you already use Office', 'As a "pure" assistant it is less brilliant than its rivals'],
      verdict: 'It is not the AI I open to ask a question, but if your work is made of Excel, Word and Teams meetings it saves you time exactly where you lose it. Judge it as part of Office, not as a chatbot.' },
    fr: { what: 'L\'IA de Microsoft, présente dans Windows, Edge et les applications Office.', best: 'ceux qui travaillent chaque jour avec Word, Excel, PowerPoint et Outlook', pick: 'vous travaillez toute la journée dans Word, Excel et Outlook',
      pros: ['Fonctionne dans Word, Excel, PowerPoint et Outlook', 'L\'offre Premium inclut les applications Office et de l\'espace OneDrive, pour la famille aussi', 'Déjà présente dans Windows, rien à installer'],
      cons: ['L\'ancien Copilot Pro n\'est plus vendu : on passe désormais par Microsoft 365', 'Elle a surtout du sens si vous utilisez déjà Office', 'Comme assistant « pur », elle est moins brillante que ses concurrents'],
      verdict: 'Ce n\'est pas l\'IA que j\'ouvre pour poser une question, mais si votre travail est fait d\'Excel, de Word et de réunions Teams, elle vous fait gagner du temps là où vous en perdez. Il faut la juger comme une partie d\'Office, pas comme un chatbot.' },
    de: { what: 'Die KI von Microsoft, zu finden in Windows, Edge und den Office-Anwendungen.', best: 'alle, die täglich mit Word, Excel, PowerPoint und Outlook arbeiten', pick: 'du den ganzen Tag in Word, Excel und Outlook arbeitest',
      pros: ['Arbeitet direkt in Word, Excel, PowerPoint und Outlook', 'Der Premium-Tarif enthält die Office-Apps und OneDrive-Speicher, auch für die Familie', 'In Windows bereits vorhanden, nichts zu installieren'],
      cons: ['Das frühere Copilot Pro wird nicht mehr verkauft: Heute führt der Weg über Microsoft 365', 'Sinnvoll vor allem, wenn man Office ohnehin nutzt', 'Als „reiner“ Assistent weniger brillant als die Konkurrenz'],
      verdict: 'Es ist nicht die KI, die ich für eine Frage öffne, aber wenn deine Arbeit aus Excel, Word und Teams-Besprechungen besteht, spart sie dir genau dort Zeit, wo du sie verlierst. Man sollte sie als Teil von Office beurteilen, nicht als Chatbot.' } },
  perplexity: {
    it: { what: 'Un motore di ricerca basato sull\'AI: ogni risposta arriva con i link alle fonti da cui è tratta.', best: 'ricerche, verifiche, domande su fatti recenti', pick: 'ti servono risposte con le fonti da verificare',
      pros: ['Ogni risposta cita le fonti, con i link', 'Piano gratuito generoso per le ricerche veloci', 'Con Pro si può scegliere tra modelli di aziende diverse'],
      cons: ['Meno adatto a scrittura creativa e lavori lunghi', 'La qualità dipende dalle fonti che trova', 'Per chi ha già un altro abbonamento può essere un doppione'],
      verdict: 'È l\'AI che uso quando non mi basta una risposta, voglio sapere da dove arriva. Per chi fa informazione, come noi di FAIND, la fonte accanto alla risposta non è un dettaglio: è il punto.' },
    en: { what: 'An AI-based search engine: every answer comes with links to the sources it draws on.', best: 'research, fact-checking, questions about recent events', pick: 'you need answers with sources you can check',
      pros: ['Every answer cites its sources, with links', 'A generous free plan for quick searches', 'With Pro you can choose between models from different companies'],
      cons: ['Less suited to creative writing and long projects', 'Quality depends on the sources it finds', 'If you already have another subscription it can be a duplicate'],
      verdict: 'It is the AI I use when an answer is not enough and I want to know where it comes from. For those of us who do news, like FAIND, the source next to the answer is not a detail: it is the point.' },
    fr: { what: 'Un moteur de recherche fondé sur l\'IA : chaque réponse arrive avec les liens vers les sources utilisées.', best: 'la recherche, la vérification, les questions sur l\'actualité récente', pick: 'vous avez besoin de réponses avec des sources à vérifier',
      pros: ['Chaque réponse cite ses sources, avec les liens', 'Une offre gratuite généreuse pour les recherches rapides', 'Avec Pro, on peut choisir entre des modèles de différentes entreprises'],
      cons: ['Moins adapté à l\'écriture créative et aux longs travaux', 'La qualité dépend des sources trouvées', 'Si vous avez déjà un autre abonnement, il peut faire doublon'],
      verdict: 'C\'est l\'IA que j\'utilise quand une réponse ne me suffit pas et que je veux savoir d\'où elle vient. Pour ceux qui font de l\'information, comme nous à FAIND, la source à côté de la réponse n\'est pas un détail : c\'est l\'essentiel.' },
    de: { what: 'Eine KI-gestützte Suchmaschine: Jede Antwort kommt mit Links zu den Quellen, auf denen sie beruht.', best: 'Recherche, Faktenprüfung, Fragen zu aktuellen Ereignissen', pick: 'du Antworten mit überprüfbaren Quellen brauchst',
      pros: ['Jede Antwort nennt ihre Quellen, mit Links', 'Großzügiger kostenloser Tarif für schnelle Suchen', 'Mit Pro kann man zwischen Modellen verschiedener Unternehmen wählen'],
      cons: ['Weniger geeignet für kreatives Schreiben und lange Projekte', 'Die Qualität hängt von den gefundenen Quellen ab', 'Wer schon ein anderes Abo hat, bekommt womöglich eine Doppelung'],
      verdict: 'Es ist die KI, die ich nutze, wenn mir eine Antwort nicht reicht und ich wissen will, woher sie stammt. Für alle, die Nachrichten machen, wie wir bei FAIND, ist die Quelle neben der Antwort kein Detail, sondern der Kern.' } },
  grok: {
    it: { what: 'L\'assistente di SpaceXAI, integrato nel social network X, con accesso in tempo reale a ciò che vi viene pubblicato.', best: 'seguire in tempo reale ciò che accade su X', pick: 'segui l\'attualità minuto per minuto su X',
      pros: ['Accesso in tempo reale ai contenuti di X', 'Ricerca approfondita e modifica delle immagini', 'Tono diretto e meno ingessato'],
      cons: ['Il più caro tra i piani standard: 30 dollari', 'Piano gratuito molto limitato', 'Ciò che circola su X non sempre è verificato: le risposte vanno controllate'],
      verdict: 'Ha senso soprattutto se X è il posto in cui segui le notizie: lì è imbattibile per velocità. Per tutto il resto, a 30 dollari al mese, faccio fatica a preferirlo ai concorrenti che ne costano 20.' },
    en: { what: 'SpaceXAI\'s assistant, built into the social network X, with real-time access to what is posted there.', best: 'following what happens on X in real time', pick: 'you follow current events minute by minute on X',
      pros: ['Real-time access to X content', 'Deep search and image editing', 'A direct, less stiff tone'],
      cons: ['The most expensive of the standard plans: 30 dollars', 'A very limited free plan', 'What circulates on X is not always verified: answers need checking'],
      verdict: 'It makes sense mainly if X is where you follow the news: there it is unbeatable for speed. For everything else, at 30 dollars a month, I struggle to prefer it to rivals that cost 20.' },
    fr: { what: 'L\'assistant de SpaceXAI, intégré au réseau social X, avec un accès en temps réel à ce qui y est publié.', best: 'suivre en temps réel ce qui se passe sur X', pick: 'vous suivez l\'actualité minute par minute sur X',
      pros: ['Accès en temps réel aux contenus de X', 'Recherche approfondie et retouche d\'images', 'Un ton direct et moins guindé'],
      cons: ['La plus chère des offres standard : 30 dollars', 'Une offre gratuite très limitée', 'Ce qui circule sur X n\'est pas toujours vérifié : les réponses doivent être contrôlées'],
      verdict: 'Il a surtout du sens si X est l\'endroit où vous suivez l\'actualité : là, il est imbattable en rapidité. Pour tout le reste, à 30 dollars par mois, j\'ai du mal à le préférer à des concurrents qui en coûtent 20.' },
    de: { what: 'Der Assistent von SpaceXAI, integriert in das soziale Netzwerk X, mit Echtzeitzugriff auf das, was dort veröffentlicht wird.', best: 'in Echtzeit verfolgen, was auf X passiert', pick: 'du das Tagesgeschehen Minute für Minute auf X verfolgst',
      pros: ['Echtzeitzugriff auf X-Inhalte', 'Tiefensuche und Bildbearbeitung', 'Direkter, weniger steifer Ton'],
      cons: ['Der teuerste der Standardtarife: 30 Dollar', 'Sehr eingeschränkter kostenloser Tarif', 'Was auf X kursiert, ist nicht immer geprüft: Antworten sollte man kontrollieren'],
      verdict: 'Sinnvoll vor allem, wenn X der Ort ist, an dem du Nachrichten verfolgst: Dort ist er bei der Geschwindigkeit unschlagbar. Für alles andere fällt es mir bei 30 Dollar im Monat schwer, ihn Konkurrenten für 20 vorzuziehen.' } },
  deepseek: {
    it: { what: 'Un assistente sviluppato in Cina, interamente gratuito, con buone capacità di ragionamento e di programmazione.', best: 'chi vuole provare un\'AI capace senza pagare nulla', pick: 'non vuoi spendere nulla',
      pros: ['Gratuito, senza piani a pagamento né pubblicità', 'Buon ragionamento passo per passo', 'Disponibile su web, iPhone e Android'],
      cons: ['Azienda con sede in Cina: valuta con attenzione quali dati condividi', 'Meno funzioni (immagini, voce, integrazioni) dei concorrenti', 'Su alcuni temi politici le risposte sono limitate'],
      verdict: 'Per curiosità e per compiti che non contengono nulla di riservato è una sorpresa: gratis, e ragiona bene. Ma non ci metterei dentro documenti di lavoro o dati personali, e questo ne limita molto l\'uso.' },
    en: { what: 'An assistant developed in China, entirely free, with good reasoning and programming abilities.', best: 'anyone who wants to try a capable AI without paying anything', pick: 'you do not want to spend anything',
      pros: ['Free, with no paid plans and no ads', 'Good step-by-step reasoning', 'Available on the web, iPhone and Android'],
      cons: ['A company based in China: think carefully about which data you share', 'Fewer features (images, voice, integrations) than its rivals', 'On some political topics the answers are restricted'],
      verdict: 'Out of curiosity, and for tasks that contain nothing confidential, it is a surprise: free, and it reasons well. But I would not put work documents or personal data into it, and that limits its use a great deal.' },
    fr: { what: 'Un assistant développé en Chine, entièrement gratuit, doté de bonnes capacités de raisonnement et de programmation.', best: 'ceux qui veulent essayer une IA capable sans rien payer', pick: 'vous ne voulez rien dépenser',
      pros: ['Gratuit, sans offre payante ni publicité', 'Bon raisonnement étape par étape', 'Disponible sur le web, iPhone et Android'],
      cons: ['Entreprise basée en Chine : réfléchissez bien aux données que vous partagez', 'Moins de fonctions (images, voix, intégrations) que les concurrents', 'Sur certains sujets politiques, les réponses sont limitées'],
      verdict: 'Par curiosité, et pour des tâches qui ne contiennent rien de confidentiel, c\'est une surprise : gratuit, et il raisonne bien. Mais je n\'y mettrais ni documents de travail ni données personnelles, ce qui en limite beaucoup l\'usage.' },
    de: { what: 'Ein in China entwickelter Assistent, vollständig kostenlos, mit guten Fähigkeiten beim logischen Denken und Programmieren.', best: 'alle, die eine fähige KI ausprobieren wollen, ohne etwas zu zahlen', pick: 'du nichts ausgeben willst',
      pros: ['Kostenlos, ohne Bezahltarife und ohne Werbung', 'Gutes schrittweises Schlussfolgern', 'Verfügbar im Web, auf iPhone und Android'],
      cons: ['Unternehmen mit Sitz in China: Überlege genau, welche Daten du teilst', 'Weniger Funktionen (Bilder, Sprache, Integrationen) als die Konkurrenz', 'Bei manchen politischen Themen sind die Antworten eingeschränkt'],
      verdict: 'Aus Neugier und für Aufgaben, die nichts Vertrauliches enthalten, ist er eine Überraschung: kostenlos, und er denkt gut. Arbeitsdokumente oder persönliche Daten würde ich ihm aber nicht anvertrauen, und das schränkt den Nutzen stark ein.' } }
};

const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n, lang) => new Intl.NumberFormat(UI[lang].locale, { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n) + ' $';

// Tutti i piani a pagamento, dal più caro al più economico
export function ranking() {
  return SERVICES.flatMap(s => s.plans.map(([name, monthly, annual]) => ({ name, monthly, annual: annual || null, by: s.by, id: s.id })))
    .sort((a, b) => b.monthly - a.monthly || a.name.localeCompare(b.name));
}

function page(lang) {
  const u = UI[lang], up = lang === 'it' ? '../' : '../../', url = SITE + COMPARE_DIR[lang];
  const date = new Intl.DateTimeFormat(u.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(CHECKED + 'T12:00:00Z'));
  const sw = Object.keys(COMPARE_DIR).map(k => k === lang ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>` : `<a href="${up}${COMPARE_DIR[k]}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ');
  const alts = Object.keys(COMPARE_DIR).map(k => `  <link rel="alternate" hreflang="${k}" href="${SITE}${COMPARE_DIR[k]}">`).join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${COMPARE_DIR.it}">`;
  const rows = ranking().map((p, i) => `          <tr><td class="cmp__n">${i + 1}</td><td><a href="#${p.id}"><strong>${esc(p.name)}</strong></a><br><span>${esc(p.by)}</span></td><td class="cmp__p">${money(p.monthly, lang)}</td><td class="cmp__p">${p.annual ? money(p.annual, lang) : '—'}</td></tr>`).join('\n');
  const cards = SERVICES.map(s => { const x = TEXT[s.id][lang];
    const plans = s.plans.length ? s.plans.map(([n, m, a]) => `<li>${esc(n)}: <strong>${money(m, lang)}</strong>${u.perMonth}${a ? ` (${money(a, lang)} ${u.thYear.toLowerCase()})` : ''}</li>`).join('') : `<li>${u.freeOnly}</li>`;
    return `      <article class="cmp__card" id="${s.id}" style="--tp:${s.color}">
        <h3>${esc(s.name)} <span>${u.by} ${esc(s.by)}</span></h3>
        <p>${esc(x.what)}</p>
        <p><strong>${u.best}:</strong> ${esc(x.best)}.</p>
        <div class="cmp__pc">
          <div><h4>${u.pros}</h4><ul>${x.pros.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
          <div><h4>${u.cons}</h4><ul>${x.cons.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
        </div>
        <h4>${u.plans}</h4>
        <ul class="cmp__plans"><li>${u.free}</li>${plans}</ul>
        <blockquote><strong>${u.verdict}</strong><p>«${esc(x.verdict)}»</p></blockquote>
        <p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer nofollow">${u.site}: ${esc(s.name)} ↗</a></p>
      </article>`; }).join('\n');
  const pick = SERVICES.map(s => `        <li>…${esc(TEXT[s.id][lang].pick)}: <a href="#${s.id}"><strong>${esc(s.name)}</strong></a></li>`).join('\n');
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': url + '#article', headline: u.h1, description: u.desc, inLanguage: u.locale, dateModified: CHECKED, datePublished: CHECKED, mainEntityOfPage: url,
      author: { '@type': 'Person', name: 'Paolo Buono', url: SITE + u.about }, publisher: { '@id': SITE + '#org' }, image: SITE + 'assets/og-image.png' },
    { '@type': 'ItemList', name: u.cardsT, itemListElement: SERVICES.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: `${url}#${s.id}` })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: u.crumb, item: url }] },
    { '@type': 'FAQPage', mainEntity: u.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] };
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(u.seo)} | FAIND</title>
  <meta name="description" content="${esc(u.desc)}">
  <link rel="canonical" href="${url}">
${alts}
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(u.h1)}">
  <meta property="og:description" content="${esc(u.desc)}">
  <meta property="og:image" content="${SITE}assets/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${up}assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>
    .lsw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 13.5px; margin-bottom: 14px; }
    .lsw__lab { color: var(--muted); } .lsw a { color: var(--ink); font-weight: 600; } .lsw__on { font-weight: 800; color: #4293B9; }
    .legal.cmp { max-width: 900px; }
    .cmp__scroll { overflow-x: auto; margin-top: 10px; }
    table.cmp__t { width: 100%; border-collapse: collapse; font-size: 15.5px; }
    .cmp__t th { text-align: left; font-size: 12.5px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); padding: 8px 10px; border-bottom: 2px solid var(--ink); }
    .cmp__t td { padding: 10px; border-bottom: 1px solid var(--rule); vertical-align: top; color: var(--ink); }
    .cmp__t td span { font-size: 13px; color: var(--muted); } .cmp__t a { color: var(--ink); }
    .cmp__n { width: 34px; font-weight: 800; color: #4293B9 !important; } .cmp__p { white-space: nowrap; font-variant-numeric: tabular-nums; font-weight: 700; }
    .cmp__card { border: 1px solid var(--rule); border-top: 5px solid var(--tp); border-radius: 14px; background: var(--surface); padding: 20px 22px; margin-top: 18px; scroll-margin-top: 90px; }
    .legal .cmp__card h3 { font-size: 24px; font-weight: 800; font-stretch: 84%; color: var(--ink); margin: 0 0 8px; }
    .cmp__card h3 span { font-size: 14px; font-weight: 600; color: var(--muted); font-stretch: 100%; }
    .legal .cmp__card h4 { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); margin: 14px 0 6px; }
    .cmp__pc { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 26px; }
    .legal .cmp__card ul { gap: 5px; font-size: 15.5px; }
    .legal ul.cmp__plans { list-style: none; padding-left: 0; display: flex; flex-wrap: wrap; gap: 8px; }
    .cmp__plans li { padding: 6px 12px; border: 1px solid var(--rule); border-radius: 999px; font-size: 14px; }
    .cmp__card blockquote { margin: 16px 0 12px; padding: 14px 16px; border-left: 4px solid var(--tp); background: rgba(66,147,185,.08); border-radius: 0 10px 10px 0; }
    .cmp__card blockquote strong { font-size: 13px; text-transform: uppercase; letter-spacing: .05em; color: var(--ink); }
    .legal .cmp__card blockquote p { color: var(--ink); margin: 6px 0 0; font-size: 16.5px; }
    .legal ul.cmp__pick { list-style: none; padding-left: 0; }
    @media (max-width: 640px) { .cmp__pc { grid-template-columns: 1fr; } }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="${up}stats.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="${up}" aria-label="FAIND — Home"><img class="brand__img" src="${up}assets/logo.webp" width="510" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="${up}">${u.back}</a>
    </div>
  </header>
  <main class="wrap legal cmp">
    <p class="lsw"><span class="lsw__lab">${u.pageLang}:</span> ${sw}</p>
    <h1 class="legal__title">${esc(u.h1)}</h1>
    <p class="legal__updated">${esc(u.updated(date))}</p>
    <p class="legal__lede">${esc(u.lede)}</p>
    <nav class="legal__toc"><a href="#prezzi">${u.toc[0]}</a><a href="#schede">${u.toc[1]}</a><a href="#scegliere">${u.toc[2]}</a><a href="#domande">${u.toc[3]}</a></nav>

    <section id="prezzi">
      <h2>${esc(u.rankT)}</h2>
      <p>${esc(u.rankI)}</p>
      <div class="cmp__scroll"><table class="cmp__t">
        <thead><tr><th>#</th><th>${u.thPlan}</th><th>${u.thMonth}</th><th>${u.thYear}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table></div>
      <p style="font-size:13.5px;margin-top:10px">${u.priceSrc}: <a href="${PRICE_SOURCE.url}" target="_blank" rel="noopener noreferrer">${PRICE_SOURCE.name}</a>.</p>
    </section>

    <section id="schede">
      <h2>${esc(u.cardsT)}</h2>
      <p>${u.author.replace('{about}', up + u.about)}</p>
${cards}
    </section>

    <section id="scegliere">
      <h2>${esc(u.pickT)}</h2>
      <ul class="cmp__pick">
${pick}
      </ul>
    </section>

    <section id="domande">
      <h2>${u.faqT}</h2>
${u.faq.map(([q, a]) => `      <h3 style="font-size:17.5px;font-weight:760;color:var(--ink);margin:18px 0 6px">${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')}
    </section>

    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="${up}#chi-siamo">${u.foot[0]}</a> · <a href="${up}${u.topics}">${u.foot[1]}</a> · <a href="${up}${u.gloss}">${u.foot[2]}</a> · <a href="${up}feed.xml">${u.foot[3]}</a> · <a href="${up}privacy.html">${u.foot[4]}</a></p></div></footer>
</body>
</html>
`;
}

export async function buildCompare(root) {
  const urls = [];
  for (const lang of Object.keys(COMPARE_DIR)) {
    const dir = path.join(root, COMPARE_DIR[lang]);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(lang));
    urls.push(SITE + COMPARE_DIR[lang]);
  }
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`)).map(u => `<url><loc>${u}</loc><lastmod>${CHECKED}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con il confronto:', e.message); }
  console.log(`⚖️  confronto AI: ${SERVICES.length} schede in ${urls.length} lingue`);
}
