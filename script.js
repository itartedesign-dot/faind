/* =====================================================================
   FAIND — script.js  (Vanilla JS, nessuna dipendenza)
   ===================================================================== */
(function () {
  'use strict';

  var DATA = window.FAIND_DATA || { news: [], guides: [], prices: { items: [] }, deals: [] };
  var LANGS = ['it', 'en', 'fr', 'de'];
  var LOCALES = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', de: 'de-DE' };

  /* ---------------------------- Traduzioni ---------------------------- */
  var I18N = {
    it: {
      'a11y.skip': 'Vai ai contenuti',
      'brand.tagline': "Tutta l'AI, in un solo posto.",
      'nav.home': 'Home', 'nav.news': 'News', 'nav.guides': 'Tool & Guide', 'nav.prices': 'Prezzi', 'nav.deals': 'Convenzioni', 'nav.contact': 'Contatti',
      'theme.toggle': 'Cambia modalità giorno/notte',
      'menu.open': 'Apri menu', 'menu.close': 'Chiudi menu', 'menu.title': 'Menu',
      'ticker.label': 'Flash',
      'sec.wire': 'Notizie flash', 'sec.all': 'Tutte le notizie', 'sec.guides': 'Guide e download',
      'sec.prices': 'Prezzi e abbonamenti', 'sec.deals': 'Convenzioni e sconti', 'sec.support': 'Sostieni FAIND', 'sec.contact': 'Scrivici',
      'search.label': 'Cerca', 'search.ph': 'Cerca nelle notizie',
      'filter.all': 'Tutte', 'filter.saved': 'Salvati',
      'tag.news': 'News', 'tag.tool': 'Tool', 'tag.prezzi': 'Prezzi', 'tag.download': 'Download', 'tag.guide': 'Guida', 'tag.convenzioni': 'Convenzioni',
      'act.read': 'Leggi la fonte', 'act.download': 'Scarica', 'act.try': 'Prova il tool', 'act.deal': "Vai all'offerta",
      'source': 'Fonte', 'save': 'Salva', 'unsave': 'Rimuovi dai salvati', 'saved.toast': 'Salvato', 'unsaved.toast': 'Rimosso dai salvati',
      'empty.text': 'Nessuna notizia corrisponde alla ricerca.', 'empty.saved': 'Non hai ancora salvato notizie. Usa il segnalibro su una scheda.', 'empty.reset': 'Mostra tutte le notizie',
      'prices.plan': 'Piano', 'prices.month': 'Al mese', 'prices.year': 'Annuale', 'prices.checked': 'Verificati il',
      'prices.note': 'Listini ufficiali USA in dollari, tasse escluse. In Europa i prezzi possono essere più alti.',
      'prices.verified': 'Controllo incrociato', 'prices.save': 'risparmi',
      'deal.demo': 'Esempio', 'deal.copy': 'Copia codice', 'copied': 'Copiato negli appunti',
      'support.text': 'FAIND è gratuito, indipendente e senza pubblicità invasiva. Se ti è utile, puoi sostenerlo con una donazione.',
      'support.btn': 'Dona con PayPal', 'support.or': 'Oppure invia a',
      'contact.text': "Una notizia da segnalare, una correzione, un'offerta da proporre? Rispondiamo a tutti.",
      'contact.direct': 'Oppure scrivi direttamente a',
      'form.name': 'Nome', 'form.email': 'La tua email', 'form.type': 'Motivo', 'form.msg': 'Messaggio', 'form.send': 'Invia messaggio',
      'form.t.report': 'Segnalazione notizia', 'form.t.fix': 'Correzione', 'form.t.deal': 'Proposta di convenzione', 'form.t.collab': 'Collaborazione',
      'form.err': 'Compila nome, email valida e messaggio.', 'form.ok': 'Si apre la tua app di posta con il messaggio già pronto: premi Invia per completare.',
      'footer.policy': 'Ogni notizia riporta la fonte originale e il link per verificarla. FAIND non è affiliato ai marchi citati.',
      'footer.rights': 'Tutti i diritti riservati.', 'footer.updated': 'Aggiornato il',
      'today': 'oggi'
    },
    en: {
      'a11y.skip': 'Skip to content',
      'brand.tagline': 'All of AI, in one place.',
      'nav.home': 'Home', 'nav.news': 'News', 'nav.guides': 'Tools & Guides', 'nav.prices': 'Prices', 'nav.deals': 'Deals', 'nav.contact': 'Contact',
      'theme.toggle': 'Toggle day/night mode',
      'menu.open': 'Open menu', 'menu.close': 'Close menu', 'menu.title': 'Menu',
      'ticker.label': 'Flash',
      'sec.wire': 'Flash news', 'sec.all': 'All news', 'sec.guides': 'Guides & downloads',
      'sec.prices': 'Prices & plans', 'sec.deals': 'Deals & discounts', 'sec.support': 'Support FAIND', 'sec.contact': 'Write to us',
      'search.label': 'Search', 'search.ph': 'Search the news',
      'filter.all': 'All', 'filter.saved': 'Saved',
      'tag.news': 'News', 'tag.tool': 'Tool', 'tag.prezzi': 'Pricing', 'tag.download': 'Download', 'tag.guide': 'Guide', 'tag.convenzioni': 'Deals',
      'act.read': 'Read the source', 'act.download': 'Download', 'act.try': 'Try the tool', 'act.deal': 'Go to offer',
      'source': 'Source', 'save': 'Save', 'unsave': 'Remove from saved', 'saved.toast': 'Saved', 'unsaved.toast': 'Removed from saved',
      'empty.text': 'No news matches your search.', 'empty.saved': "You haven't saved any news yet. Use the bookmark on a card.", 'empty.reset': 'Show all news',
      'prices.plan': 'Plan', 'prices.month': 'Monthly', 'prices.year': 'Annual', 'prices.checked': 'Checked on',
      'prices.note': 'Official US list prices in dollars, excluding tax. European prices may be higher.',
      'prices.verified': 'Cross-checked with', 'prices.save': 'save',
      'deal.demo': 'Example', 'deal.copy': 'Copy code', 'copied': 'Copied to clipboard',
      'support.text': 'FAIND is free, independent and free of intrusive ads. If you find it useful, you can support it with a donation.',
      'support.btn': 'Donate with PayPal', 'support.or': 'Or send to',
      'contact.text': 'News to report, a correction, a deal to propose? We reply to everyone.',
      'contact.direct': 'Or write directly to',
      'form.name': 'Name', 'form.email': 'Your email', 'form.type': 'Reason', 'form.msg': 'Message', 'form.send': 'Send message',
      'form.t.report': 'News tip', 'form.t.fix': 'Correction', 'form.t.deal': 'Deal proposal', 'form.t.collab': 'Collaboration',
      'form.err': 'Please fill in your name, a valid email and a message.', 'form.ok': 'Your mail app opens with the message ready: press Send to finish.',
      'footer.policy': 'Every story cites its original source with a link to verify it. FAIND is not affiliated with the brands mentioned.',
      'footer.rights': 'All rights reserved.', 'footer.updated': 'Updated on',
      'today': 'today'
    },
    fr: {
      'a11y.skip': 'Aller au contenu',
      'brand.tagline': "Toute l'IA, au même endroit.",
      'nav.home': 'Accueil', 'nav.news': 'Actus', 'nav.guides': 'Outils & Guides', 'nav.prices': 'Prix', 'nav.deals': 'Offres', 'nav.contact': 'Contact',
      'theme.toggle': 'Basculer mode jour/nuit',
      'menu.open': 'Ouvrir le menu', 'menu.close': 'Fermer le menu', 'menu.title': 'Menu',
      'ticker.label': 'Flash',
      'sec.wire': 'Flash info', 'sec.all': 'Toutes les actualités', 'sec.guides': 'Guides et téléchargements',
      'sec.prices': 'Prix et abonnements', 'sec.deals': 'Offres et réductions', 'sec.support': 'Soutenir FAIND', 'sec.contact': 'Écrivez-nous',
      'search.label': 'Rechercher', 'search.ph': 'Rechercher dans les actus',
      'filter.all': 'Toutes', 'filter.saved': 'Enregistrées',
      'tag.news': 'Actu', 'tag.tool': 'Outil', 'tag.prezzi': 'Prix', 'tag.download': 'Téléchargement', 'tag.guide': 'Guide', 'tag.convenzioni': 'Offres',
      'act.read': 'Lire la source', 'act.download': 'Télécharger', 'act.try': "Essayer l'outil", 'act.deal': "Voir l'offre",
      'source': 'Source', 'save': 'Enregistrer', 'unsave': 'Retirer des enregistrées', 'saved.toast': 'Enregistré', 'unsaved.toast': 'Retiré',
      'empty.text': 'Aucune actualité ne correspond à votre recherche.', 'empty.saved': "Vous n'avez encore rien enregistré. Utilisez le signet d'une fiche.", 'empty.reset': 'Afficher toutes les actus',
      'prices.plan': 'Offre', 'prices.month': 'Par mois', 'prices.year': 'Annuel', 'prices.checked': 'Vérifiés le',
      'prices.note': 'Tarifs officiels US en dollars, hors taxes. Les prix européens peuvent être plus élevés.',
      'prices.verified': 'Recoupé avec', 'prices.save': 'économie',
      'deal.demo': 'Exemple', 'deal.copy': 'Copier le code', 'copied': 'Copié dans le presse-papiers',
      'support.text': "FAIND est gratuit, indépendant et sans publicité intrusive. S'il vous est utile, vous pouvez le soutenir par un don.",
      'support.btn': 'Faire un don via PayPal', 'support.or': 'Ou envoyez à',
      'contact.text': 'Une info à signaler, une correction, une offre à proposer ? Nous répondons à tous.',
      'contact.direct': 'Ou écrivez directement à',
      'form.name': 'Nom', 'form.email': 'Votre e-mail', 'form.type': 'Motif', 'form.msg': 'Message', 'form.send': 'Envoyer le message',
      'form.t.report': 'Signaler une info', 'form.t.fix': 'Correction', 'form.t.deal': "Proposition d'offre", 'form.t.collab': 'Collaboration',
      'form.err': 'Indiquez votre nom, un e-mail valide et un message.', 'form.ok': "Votre messagerie s'ouvre avec le message prêt : appuyez sur Envoyer.",
      'footer.policy': "Chaque actualité cite sa source originale avec un lien pour la vérifier. FAIND n'est affilié à aucune des marques citées.",
      'footer.rights': 'Tous droits réservés.', 'footer.updated': 'Mis à jour le',
      'today': "aujourd'hui"
    },
    de: {
      'a11y.skip': 'Zum Inhalt springen',
      'brand.tagline': 'Alles über KI, an einem Ort.',
      'nav.home': 'Start', 'nav.news': 'News', 'nav.guides': 'Tools & Anleitungen', 'nav.prices': 'Preise', 'nav.deals': 'Angebote', 'nav.contact': 'Kontakt',
      'theme.toggle': 'Tag-/Nachtmodus umschalten',
      'menu.open': 'Menü öffnen', 'menu.close': 'Menü schließen', 'menu.title': 'Menü',
      'ticker.label': 'Flash',
      'sec.wire': 'Kurzmeldungen', 'sec.all': 'Alle Nachrichten', 'sec.guides': 'Anleitungen & Downloads',
      'sec.prices': 'Preise & Abos', 'sec.deals': 'Angebote & Rabatte', 'sec.support': 'FAIND unterstützen', 'sec.contact': 'Schreib uns',
      'search.label': 'Suchen', 'search.ph': 'Nachrichten durchsuchen',
      'filter.all': 'Alle', 'filter.saved': 'Gespeichert',
      'tag.news': 'News', 'tag.tool': 'Tool', 'tag.prezzi': 'Preise', 'tag.download': 'Download', 'tag.guide': 'Anleitung', 'tag.convenzioni': 'Angebote',
      'act.read': 'Zur Quelle', 'act.download': 'Herunterladen', 'act.try': 'Tool testen', 'act.deal': 'Zum Angebot',
      'source': 'Quelle', 'save': 'Speichern', 'unsave': 'Aus Gespeicherten entfernen', 'saved.toast': 'Gespeichert', 'unsaved.toast': 'Entfernt',
      'empty.text': 'Keine Nachricht passt zu deiner Suche.', 'empty.saved': 'Du hast noch nichts gespeichert. Nutze das Lesezeichen auf einer Karte.', 'empty.reset': 'Alle Nachrichten zeigen',
      'prices.plan': 'Tarif', 'prices.month': 'Monatlich', 'prices.year': 'Jährlich', 'prices.checked': 'Geprüft am',
      'prices.note': 'Offizielle US-Listenpreise in Dollar, ohne Steuern. In Europa können Preise höher sein.',
      'prices.verified': 'Abgeglichen mit', 'prices.save': 'Ersparnis',
      'deal.demo': 'Beispiel', 'deal.copy': 'Code kopieren', 'copied': 'In die Zwischenablage kopiert',
      'support.text': 'FAIND ist kostenlos, unabhängig und ohne aufdringliche Werbung. Wenn es dir hilft, kannst du es mit einer Spende unterstützen.',
      'support.btn': 'Mit PayPal spenden', 'support.or': 'Oder sende an',
      'contact.text': 'Eine Meldung, eine Korrektur, ein Angebot? Wir antworten allen.',
      'contact.direct': 'Oder schreib direkt an',
      'form.name': 'Name', 'form.email': 'Deine E-Mail', 'form.type': 'Anliegen', 'form.msg': 'Nachricht', 'form.send': 'Nachricht senden',
      'form.t.report': 'Nachricht melden', 'form.t.fix': 'Korrektur', 'form.t.deal': 'Angebotsvorschlag', 'form.t.collab': 'Zusammenarbeit',
      'form.err': 'Bitte Name, gültige E-Mail und Nachricht ausfüllen.', 'form.ok': 'Dein Mailprogramm öffnet sich mit der fertigen Nachricht: auf Senden tippen.',
      'footer.policy': 'Jede Meldung nennt die Originalquelle mit Link zur Überprüfung. FAIND ist mit den genannten Marken nicht verbunden.',
      'footer.rights': 'Alle Rechte vorbehalten.', 'footer.updated': 'Aktualisiert am',
      'today': 'heute'
    }
  };

  /* Testi aggiunti per sezioni, settori, caricamento e barra TG */
  var EXTRA = {
    it: {
      'sec.fresh': 'Appena uscite', 'sec.important': 'Importanti', 'sec.more': 'Letture secondarie', 'sec.sectors': 'Settori',
      'hint.important': 'Scelte dalla redazione o riprese da più fonti', 'hint.more': 'Il resto della settimana, dal più recente',
      'more.btn': 'Mostra altre', 'results.back': 'Torna alla home',
      'results.all': 'Tutte le notizie', 'results.saved': 'Notizie salvate', 'results.search': 'Risultati per “{q}”', 'results.count': '{n} risultati',
      'status.loading': 'Cerco le notizie della settimana…',
      'status.ok': 'Aggiornato {t}: {n} notizie da {s} fonti',
      'status.local': 'Anteprima locale: notizie della redazione. L’aggiornamento automatico parte una volta online.',
      'status.error': 'Aggiornamento automatico non raggiungibile: mostro le notizie della redazione.',
      'ticker.close': 'Nascondi la barra delle ultime notizie', 'ticker.open': 'Mostra la barra delle ultime notizie',
      'sector.all': 'Tutto', 'type.all': 'Tutti i tipi',
      'cat.chatbot': 'Chatbot e LLM', 'cat.immagini': 'Immagini e grafica', 'cat.video': 'Video', 'cat.musica': 'Musica e audio',
      'cat.codice': 'Programmazione', 'cat.produttivita': 'Produttività', 'cat.ricerca': 'Ricerca e scienza', 'cat.hardware': 'Chip e infrastruttura',
      'cat.regole': 'Leggi e regole', 'cat.altro': 'Altro',
      'tg.follow': 'Seguici su Telegram', 'tgbox.text': 'Le notizie sull\'intelligenza artificiale in tempo reale, gratis e senza registrazione: le più importanti ogni ora con la fonte, «Il punto delle 8» ogni mattina e la classifica dei lavori AI più richiesti ogni lunedì. Di notte, dalle 23 alle 7, nessuna notifica.', 'tgbox.btn': 'Apri il canale @faindnews', 'tgbox.alt': 'Canale Telegram FAIND: di notte non disturbiamo, silenzio dalle 23 alle 7', 'tg.cta': 'Le notizie importanti sul tuo telefono, appena escono. Iscriviti al canale Telegram.', 'sec.video': 'Video', 'tag.video': 'Video', 'video.all': 'Tutti', 'video.it': 'Creator italiani', 'video.intl': 'Internazionali', 'video.official': 'Canali ufficiali', 'video.play': 'Guarda il video', 'video.yt': 'Apri su YouTube', 'langf.btn': 'Lingue notizie', 'langf.hint': 'Mostra notizie e video in:', 'langf.min': 'Lascia almeno una lingua attiva', 'feed.title': 'Feed RSS gratuiti', 'feed.text': 'Porta le notizie di FAIND nel tuo lettore RSS, sul tuo sito o nella tua app. Gratis, aggiornati ogni ora, anche per settore.', 'feed.all': 'Tutte le notizie', 'feed.copy': 'Copia', 'feed.bysector': 'Feed per settore', 'feed.youtube': 'Video da YouTube', 'feed.short': 'Feed RSS', 'sec.focus': 'Focus', 'hint.focus': 'Per ogni tema, un video e la notizia più ripresa dalle testate', 'focus.vlabel': 'Il video', 'focus.nlabel': 'La notizia più ripresa', 'focus.robot': 'Robot e umanoidi', 'focus.robot.sub': 'A che punto sono: in casa, in città, in auto, in volo, sui mari e nello spazio', 'focus.domus': 'Domus', 'focus.domus.sub': 'L\'AI in casa: smartphone, elettrodomestici e smart home', 'focus.medicina': 'Medicina e salute', 'focus.medicina.sub': 'Cosa scoprono l\'AI e le macchine per curarci meglio', 'focus.lavoro': 'AI e lavoro', 'focus.lavoro.sub': 'Come cambiano mestieri, competenze e aziende', 'focus.clima': 'Clima e ambiente', 'focus.clima.sub': 'Inquinamento, energia, impatto delle tecnologie e proteste nel mondo', 'jobs.nav': 'Lavoro AI', 'jobs.title': 'Lavoro nell\'AI: i ruoli più richiesti', 'jobs.sub': 'Classifica calcolata sugli annunci degli ultimi 30 giorni. Tocca un ruolo per vedere le offerte e candidarti sul sito che le pubblica.', 'jobs.filter': 'Offerte mostrate in base alle lingue impostate:', 'jobs.change': 'Modifica', 'jobs.one': '1 offerta', 'jobs.many': '{n} offerte', 'jobs.apply': 'Candidati', 'jobs.foot': 'Fonti: {s} · aggiornato {t}', 'jobs.empty': 'Nessuna offerta per le lingue scelte: prova ad aggiungerne una.', 'role.consult': 'Consulente AI', 'img.na': 'Immagine non disponibile', 'footer.privacy': 'Privacy e note legali', 'fact.more': 'Oltre alle notizie', 'fact.more.v': 'Video, lavoro AI, Focus, feed RSS', 'app.install': 'Installa l\'app', 'app.ios.title': 'Installa FAIND sul tuo iPhone o iPad', 'app.ios.step1': 'Tocca il pulsante Condividi', 'app.ios.step2': 'Scorri e scegli «Aggiungi alla schermata Home»', 'app.ios.step3': 'Tocca «Aggiungi»: l\'icona di FAIND comparirà tra le tue app', 'app.ios.note': 'Funziona da Safari. Se usi un altro browser, apri prima FAIND in Safari.', 'app.ok': 'Ho capito', 'app.done': 'FAIND è stata installata', 'nav.about': 'Chi siamo', 'intro.title': 'Notizie sull\'intelligenza artificiale, aggiornate ogni ora e sempre con la fonte', 'intro.btn': 'Chi siamo e cosa offriamo',
      'fact.update': 'Aggiornamento', 'fact.update.v': 'Ogni ora', 'fact.sources': 'Fonti', 'fact.sources.v': 'Testate e blog ufficiali', 'fact.langs': 'Lingue', 'fact.price': 'Costo', 'fact.price.v': 'Gratuito, senza registrazione',
      'share.title': 'Fai conoscere FAIND', 'share.text': 'Se ti è utile, condividilo: è il modo più semplice per aiutarci a crescere.', 'share.native': 'Condividi', 'share.copy': 'Copia link',
      'share.msg': 'FAIND – le notizie sull\'intelligenza artificiale aggiornate ogni ora, sempre con la fonte', 'share.news': 'Condividi la notizia', 'share.via': 'via FAIND',
      'also': 'Anche su', 'official': 'Fonte ufficiale', 'lang.title': 'Lingua dell’articolo originale', 'important.badge': 'Importante'
    },
    en: {
      'sec.fresh': 'Just in', 'sec.important': 'Top stories', 'sec.more': 'More reading', 'sec.sectors': 'Sectors',
      'hint.important': 'Picked by the editors or covered by several sources', 'hint.more': 'The rest of the week, newest first',
      'more.btn': 'Show more', 'results.back': 'Back to home',
      'results.all': 'All news', 'results.saved': 'Saved news', 'results.search': 'Results for “{q}”', 'results.count': '{n} results',
      'status.loading': 'Fetching this week’s news…',
      'status.ok': 'Updated {t}: {n} stories from {s} sources',
      'status.local': 'Local preview: editorial news only. Automatic updates start once online.',
      'status.error': 'Automatic updates unavailable: showing editorial news.',
      'ticker.close': 'Hide the breaking news bar', 'ticker.open': 'Show the breaking news bar',
      'sector.all': 'All', 'type.all': 'All types',
      'cat.chatbot': 'Chatbots & LLMs', 'cat.immagini': 'Images & design', 'cat.video': 'Video', 'cat.musica': 'Music & audio',
      'cat.codice': 'Coding', 'cat.produttivita': 'Productivity', 'cat.ricerca': 'Research & science', 'cat.hardware': 'Chips & infrastructure',
      'cat.regole': 'Law & policy', 'cat.altro': 'Other',
      'tg.follow': 'Follow on Telegram', 'tgbox.text': 'Artificial intelligence news in real time, free and with no sign-up: the top stories every hour with the source, the “Il punto delle 8” morning briefing and the ranking of the most in-demand AI jobs every Monday. At night, from 11 pm to 7 am, no notifications.', 'tgbox.btn': 'Open the @faindnews channel', 'tgbox.alt': 'FAIND Telegram channel: at night we stay quiet, silent from 11 pm to 7 am', 'tg.cta': 'Top AI stories on your phone as soon as they break. Join the Telegram channel.', 'sec.video': 'Videos', 'tag.video': 'Video', 'video.all': 'All', 'video.it': 'Italian creators', 'video.intl': 'International', 'video.official': 'Official channels', 'video.play': 'Watch the video', 'video.yt': 'Open on YouTube', 'langf.btn': 'News languages', 'langf.hint': 'Show news and videos in:', 'langf.min': 'Keep at least one language on', 'feed.title': 'Free RSS feeds', 'feed.text': 'Bring FAIND news into your RSS reader, website or app. Free, updated hourly, also by sector.', 'feed.all': 'All news', 'feed.copy': 'Copy', 'feed.bysector': 'Feeds by sector', 'feed.youtube': 'YouTube videos', 'feed.short': 'RSS feed', 'sec.focus': 'Focus', 'hint.focus': 'For each topic, one video and the most covered story', 'focus.vlabel': 'The video', 'focus.nlabel': 'Most covered story', 'focus.robot': 'Robots & humanoids', 'focus.robot.sub': 'Where they stand: at home, in cities, cars, planes, at sea and in space', 'focus.domus': 'Domus', 'focus.domus.sub': 'AI at home: smartphones, appliances and smart home', 'focus.medicina': 'Medicine & health', 'focus.medicina.sub': 'What AI and machines are discovering to heal us better', 'focus.lavoro': 'AI & work', 'focus.lavoro.sub': 'How jobs, skills and companies are changing', 'focus.clima': 'Climate & environment', 'focus.clima.sub': 'Pollution, energy, the impact of technology and protests worldwide', 'jobs.nav': 'AI jobs', 'jobs.title': 'AI jobs: the most in-demand roles', 'jobs.sub': 'Ranking based on job ads from the last 30 days. Tap a role to see the openings and apply on the site that posts them.', 'jobs.filter': 'Openings shown for your selected languages:', 'jobs.change': 'Change', 'jobs.one': '1 opening', 'jobs.many': '{n} openings', 'jobs.apply': 'Apply', 'jobs.foot': 'Sources: {s} · updated {t}', 'jobs.empty': 'No openings for the selected languages: try adding one.', 'role.consult': 'AI Consultant', 'img.na': 'Image not available', 'footer.privacy': 'Privacy & legal notes', 'fact.more': 'Beyond the news', 'fact.more.v': 'Videos, AI jobs, Focus, RSS feeds', 'app.install': 'Install the app', 'app.ios.title': 'Install FAIND on your iPhone or iPad', 'app.ios.step1': 'Tap the Share button', 'app.ios.step2': 'Scroll down and choose “Add to Home Screen”', 'app.ios.step3': 'Tap “Add”: the FAIND icon will appear with your apps', 'app.ios.note': 'Works in Safari. If you use another browser, open FAIND in Safari first.', 'app.ok': 'Got it', 'app.done': 'FAIND has been installed', 'nav.about': 'About', 'intro.title': 'Artificial intelligence news, updated every hour and always with the source', 'intro.btn': 'About FAIND',
      'fact.update': 'Updates', 'fact.update.v': 'Every hour', 'fact.sources': 'Sources', 'fact.sources.v': 'Newsrooms and official blogs', 'fact.langs': 'Languages', 'fact.price': 'Price', 'fact.price.v': 'Free, no sign-up',
      'share.title': 'Spread the word', 'share.text': 'If FAIND helps you, share it: it is the easiest way to help us grow.', 'share.native': 'Share', 'share.copy': 'Copy link',
      'share.msg': 'FAIND – AI news updated every hour, always with the source', 'share.news': 'Share this story', 'share.via': 'via FAIND',
      'also': 'Also on', 'official': 'Official source', 'lang.title': 'Language of the original article', 'important.badge': 'Top story'
    },
    fr: {
      'sec.fresh': 'À l’instant', 'sec.important': 'À la une', 'sec.more': 'Autres lectures', 'sec.sectors': 'Secteurs',
      'hint.important': 'Choisies par la rédaction ou reprises par plusieurs sources', 'hint.more': 'Le reste de la semaine, du plus récent',
      'more.btn': 'Afficher plus', 'results.back': 'Retour à l’accueil',
      'results.all': 'Toutes les actualités', 'results.saved': 'Actualités enregistrées', 'results.search': 'Résultats pour « {q} »', 'results.count': '{n} résultats',
      'status.loading': 'Recherche des actualités de la semaine…',
      'status.ok': 'Mis à jour {t} : {n} actualités de {s} sources',
      'status.local': 'Aperçu local : actualités de la rédaction. La mise à jour automatique démarre une fois en ligne.',
      'status.error': 'Mise à jour automatique indisponible : actualités de la rédaction.',
      'ticker.close': 'Masquer la barre des dernières infos', 'ticker.open': 'Afficher la barre des dernières infos',
      'sector.all': 'Tout', 'type.all': 'Tous les types',
      'cat.chatbot': 'Chatbots et LLM', 'cat.immagini': 'Images et design', 'cat.video': 'Vidéo', 'cat.musica': 'Musique et audio',
      'cat.codice': 'Programmation', 'cat.produttivita': 'Productivité', 'cat.ricerca': 'Recherche et science', 'cat.hardware': 'Puces et infrastructure',
      'cat.regole': 'Lois et régulation', 'cat.altro': 'Autre',
      'tg.follow': 'Suivez-nous sur Telegram', 'tgbox.text': 'L\'actualité de l\'intelligence artificielle en temps réel, gratuite et sans inscription : les infos importantes chaque heure avec la source, le briefing du matin « Il punto delle 8 » et le classement des métiers de l\'IA les plus recherchés chaque lundi. La nuit, de 23 h à 7 h, aucune notification.', 'tgbox.btn': 'Ouvrir la chaîne @faindnews', 'tgbox.alt': 'Chaîne Telegram FAIND : silence la nuit, de 23 h à 7 h', 'tg.cta': 'Les infos IA importantes sur votre téléphone, dès leur sortie. Rejoignez la chaîne Telegram.', 'sec.video': 'Vidéos', 'tag.video': 'Vidéo', 'video.all': 'Toutes', 'video.it': 'Créateurs italiens', 'video.intl': 'Internationales', 'video.official': 'Chaînes officielles', 'video.play': 'Regarder la vidéo', 'video.yt': 'Ouvrir sur YouTube', 'langf.btn': 'Langues des actus', 'langf.hint': 'Afficher les actus et vidéos en :', 'langf.min': 'Gardez au moins une langue', 'feed.title': 'Flux RSS gratuits', 'feed.text': 'Recevez les actus FAIND dans votre lecteur RSS, votre site ou votre app. Gratuit, mis à jour chaque heure, aussi par secteur.', 'feed.all': 'Toutes les actus', 'feed.copy': 'Copier', 'feed.bysector': 'Flux par secteur', 'feed.youtube': 'Vidéos YouTube', 'feed.short': 'Flux RSS', 'sec.focus': 'Focus', 'hint.focus': 'Pour chaque thème, une vidéo et l’info la plus reprise', 'focus.vlabel': 'La vidéo', 'focus.nlabel': 'L’info la plus reprise', 'focus.robot': 'Robots et humanoïdes', 'focus.robot.sub': 'Où en sont-ils : à la maison, en ville, en voiture, dans les airs, en mer et dans l’espace', 'focus.domus': 'Domus', 'focus.domus.sub': 'L’IA à la maison : smartphones, électroménager et maison connectée', 'focus.medicina': 'Médecine et santé', 'focus.medicina.sub': 'Ce que l’IA et les machines découvrent pour mieux nous soigner', 'focus.lavoro': 'IA et travail', 'focus.lavoro.sub': 'Comment évoluent métiers, compétences et entreprises', 'focus.clima': 'Climat et environnement', 'focus.clima.sub': 'Pollution, énergie, impact des technologies et manifestations dans le monde', 'jobs.nav': 'Emplois IA', 'jobs.title': 'Emplois IA : les profils les plus recherchés', 'jobs.sub': 'Classement établi sur les annonces des 30 derniers jours. Touchez un profil pour voir les offres et postuler sur le site qui les publie.', 'jobs.filter': 'Offres affichées selon les langues choisies :', 'jobs.change': 'Modifier', 'jobs.one': '1 offre', 'jobs.many': '{n} offres', 'jobs.apply': 'Postuler', 'jobs.foot': 'Sources : {s} · mis à jour {t}', 'jobs.empty': 'Aucune offre pour les langues choisies : essayez d’en ajouter une.', 'role.consult': 'Consultant IA', 'img.na': 'Image non disponible', 'footer.privacy': 'Confidentialité et mentions légales', 'fact.more': 'Au-delà des actus', 'fact.more.v': 'Vidéos, emplois IA, Focus, flux RSS', 'app.install': 'Installer l’app', 'app.ios.title': 'Installer FAIND sur votre iPhone ou iPad', 'app.ios.step1': 'Touchez le bouton Partager', 'app.ios.step2': 'Faites défiler et choisissez « Sur l’écran d’accueil »', 'app.ios.step3': 'Touchez « Ajouter » : l’icône FAIND apparaîtra avec vos apps', 'app.ios.note': 'Fonctionne dans Safari. Avec un autre navigateur, ouvrez d’abord FAIND dans Safari.', 'app.ok': 'Compris', 'app.done': 'FAIND a été installée', 'nav.about': 'Qui sommes-nous', 'intro.title': 'L’actualité de l’intelligence artificielle, mise à jour chaque heure et toujours sourcée', 'intro.btn': 'Découvrir FAIND',
      'fact.update': 'Mise à jour', 'fact.update.v': 'Chaque heure', 'fact.sources': 'Sources', 'fact.sources.v': 'Rédactions et blogs officiels', 'fact.langs': 'Langues', 'fact.price': 'Prix', 'fact.price.v': 'Gratuit, sans inscription',
      'share.title': 'Faites connaître FAIND', 'share.text': 'S’il vous est utile, partagez-le : c’est la façon la plus simple de nous aider.', 'share.native': 'Partager', 'share.copy': 'Copier le lien',
      'share.msg': 'FAIND – l’actualité IA mise à jour chaque heure, toujours sourcée', 'share.news': 'Partager cette actu', 'share.via': 'via FAIND',
      'also': 'Aussi sur', 'official': 'Source officielle', 'lang.title': 'Langue de l’article original', 'important.badge': 'À la une'
    },
    de: {
      'sec.fresh': 'Gerade erschienen', 'sec.important': 'Wichtig', 'sec.more': 'Weitere Artikel', 'sec.sectors': 'Bereiche',
      'hint.important': 'Von der Redaktion gewählt oder von mehreren Quellen berichtet', 'hint.more': 'Der Rest der Woche, neueste zuerst',
      'more.btn': 'Mehr anzeigen', 'results.back': 'Zur Startseite',
      'results.all': 'Alle Nachrichten', 'results.saved': 'Gespeicherte Nachrichten', 'results.search': 'Ergebnisse für „{q}“', 'results.count': '{n} Ergebnisse',
      'status.loading': 'Suche die Nachrichten der Woche…',
      'status.ok': 'Aktualisiert {t}: {n} Meldungen aus {s} Quellen',
      'status.local': 'Lokale Vorschau: nur Redaktionsmeldungen. Automatische Updates starten online.',
      'status.error': 'Automatische Updates nicht erreichbar: Redaktionsmeldungen werden gezeigt.',
      'ticker.close': 'Eilmeldungsleiste ausblenden', 'ticker.open': 'Eilmeldungsleiste einblenden',
      'sector.all': 'Alles', 'type.all': 'Alle Typen',
      'cat.chatbot': 'Chatbots & LLMs', 'cat.immagini': 'Bilder & Grafik', 'cat.video': 'Video', 'cat.musica': 'Musik & Audio',
      'cat.codice': 'Programmierung', 'cat.produttivita': 'Produktivität', 'cat.ricerca': 'Forschung & Wissenschaft', 'cat.hardware': 'Chips & Infrastruktur',
      'cat.regole': 'Recht & Regulierung', 'cat.altro': 'Sonstiges',
      'tg.follow': 'Folge uns auf Telegram', 'tgbox.text': 'KI-Nachrichten in Echtzeit, kostenlos und ohne Anmeldung: die wichtigsten Meldungen jede Stunde mit Quelle, das Morgenbriefing „Il punto delle 8“ und jeden Montag die Rangliste der gefragtesten KI-Jobs. Nachts, von 23 bis 7 Uhr, keine Benachrichtigungen.', 'tgbox.btn': 'Kanal @faindnews öffnen', 'tgbox.alt': 'FAIND-Telegram-Kanal: nachts Ruhe, von 23 bis 7 Uhr', 'tg.cta': 'Die wichtigsten KI-News sofort aufs Handy. Tritt dem Telegram-Kanal bei.', 'sec.video': 'Videos', 'tag.video': 'Video', 'video.all': 'Alle', 'video.it': 'Italienische Creator', 'video.intl': 'International', 'video.official': 'Offizielle Kanäle', 'video.play': 'Video ansehen', 'video.yt': 'Auf YouTube öffnen', 'langf.btn': 'Sprachen', 'langf.hint': 'Nachrichten und Videos zeigen in:', 'langf.min': 'Mindestens eine Sprache aktiv lassen', 'feed.title': 'Kostenlose RSS-Feeds', 'feed.text': 'Hol dir FAIND-News in deinen RSS-Reader, deine Website oder App. Kostenlos, stündlich aktualisiert, auch nach Bereichen.', 'feed.all': 'Alle Nachrichten', 'feed.copy': 'Kopieren', 'feed.bysector': 'Feeds nach Bereich', 'feed.youtube': 'YouTube-Videos', 'feed.short': 'RSS-Feed', 'sec.focus': 'Fokus', 'hint.focus': 'Pro Thema ein Video und die meistberichtete Meldung', 'focus.vlabel': 'Das Video', 'focus.nlabel': 'Meistberichtete Meldung', 'focus.robot': 'Roboter & Humanoide', 'focus.robot.sub': 'Wo sie stehen: zu Hause, in der Stadt, im Auto, in der Luft, auf See und im All', 'focus.domus': 'Domus', 'focus.domus.sub': 'KI zu Hause: Smartphones, Haushaltsgeräte und Smart Home', 'focus.medicina': 'Medizin & Gesundheit', 'focus.medicina.sub': 'Was KI und Maschinen entdecken, um uns besser zu heilen', 'focus.lavoro': 'KI & Arbeit', 'focus.lavoro.sub': 'Wie sich Berufe, Kompetenzen und Unternehmen verändern', 'focus.clima': 'Klima & Umwelt', 'focus.clima.sub': 'Verschmutzung, Energie, Folgen der Technik und Proteste weltweit', 'jobs.nav': 'KI-Jobs', 'jobs.title': 'KI-Jobs: die gefragtesten Rollen', 'jobs.sub': 'Ranking auf Basis der Stellenanzeigen der letzten 30 Tage. Tippe auf eine Rolle, um die Angebote zu sehen und dich direkt zu bewerben.', 'jobs.filter': 'Angebote für deine gewählten Sprachen:', 'jobs.change': 'Ändern', 'jobs.one': '1 Angebot', 'jobs.many': '{n} Angebote', 'jobs.apply': 'Bewerben', 'jobs.foot': 'Quellen: {s} · aktualisiert {t}', 'jobs.empty': 'Keine Angebote für die gewählten Sprachen: füge eine hinzu.', 'role.consult': 'KI-Berater', 'img.na': 'Bild nicht verfügbar', 'footer.privacy': 'Datenschutz & Rechtliches', 'fact.more': 'Mehr als News', 'fact.more.v': 'Videos, KI-Jobs, Fokus, RSS-Feeds', 'app.install': 'App installieren', 'app.ios.title': 'FAIND auf iPhone oder iPad installieren', 'app.ios.step1': 'Tippe auf die Teilen-Taste', 'app.ios.step2': 'Scrolle und wähle „Zum Home-Bildschirm“', 'app.ios.step3': 'Tippe auf „Hinzufügen“: Das FAIND-Symbol erscheint bei deinen Apps', 'app.ios.note': 'Funktioniert in Safari. Mit einem anderen Browser öffne FAIND zuerst in Safari.', 'app.ok': 'Verstanden', 'app.done': 'FAIND wurde installiert', 'nav.about': 'Über uns', 'intro.title': 'Nachrichten über künstliche Intelligenz, stündlich aktualisiert und immer mit Quelle', 'intro.btn': 'Über FAIND',
      'fact.update': 'Aktualisierung', 'fact.update.v': 'Jede Stunde', 'fact.sources': 'Quellen', 'fact.sources.v': 'Redaktionen und offizielle Blogs', 'fact.langs': 'Sprachen', 'fact.price': 'Preis', 'fact.price.v': 'Kostenlos, ohne Anmeldung',
      'share.title': 'Erzähl von FAIND', 'share.text': 'Wenn dir FAIND hilft, teile es: So hilfst du uns am einfachsten.', 'share.native': 'Teilen', 'share.copy': 'Link kopieren',
      'share.msg': 'FAIND – KI-News, stündlich aktualisiert, immer mit Quelle', 'share.news': 'Meldung teilen', 'share.via': 'via FAIND',
      'also': 'Auch bei', 'official': 'Offizielle Quelle', 'lang.title': 'Sprache des Originalartikels', 'important.badge': 'Wichtig'
    }
  };
  Object.keys(EXTRA).forEach(function (l) { Object.keys(EXTRA[l]).forEach(function (k) { I18N[l][k] = EXTRA[l][k]; }); });

  var CATS = ['chatbot', 'immagini', 'video', 'musica', 'codice', 'produttivita', 'ricerca', 'hardware', 'regole', 'altro'];
  var TYPES = ['news', 'tool', 'prezzi', 'download', 'guide', 'convenzioni', 'video'];
  var CAT_ICON = {
    chatbot: '<path d="M4 5h16v11H9l-5 4z"/>',
    immagini: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20 16l-5-5-8 8"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/>',
    musica: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    codice: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    produttivita: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    ricerca: '<path d="M9.5 3.5h5M10.5 3.5v6L5 19a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 19 19l-5.5-9.5v-6"/>',
    hardware: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>',
    regole: '<path d="M12 4v16M7 20h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/>',
    altro: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
    saved: '<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (CAT_ICON[name] || CAT_ICON.altro) + '</svg>'; }

  /* ------------------------------ Stato ------------------------------ */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var session = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  var NEWS_LANGS = ['it', 'en', 'fr', 'de'];
  var state = {
    lang: pickLang(),
    sector: 'all',     // settore oppure 'saved'
    type: 'all',
    query: '',
    saved: readSaved(),
    readsShown: 12,
    videosShown: 6,
    videoGroup: 'all',
    langs: readLangs(),
    loaded: false,
    feed: null,        // { generated, sources, count } dalla GitHub Action
    feedState: 'loading'
  };
  var all = [];        // notizie visibili (redazione + automatiche, filtrate per lingua)
  var allRaw = [], videosRaw = [], videos = [], pagesMap = {}, spotRaw = [], jobsRaw = [], jobsUpdated = null;
  function readLangs() {
    try {
      var v = JSON.parse(localStorage.getItem('faind-news-langs') || 'null');
      if (Array.isArray(v) && v.length) return v.filter(function (l) { return NEWS_LANGS.indexOf(l) > -1; });
    } catch (e) {}
    return NEWS_LANGS.slice();
  }
  function langOk(n) { return state.langs.indexOf(n.lang || 'it') > -1; }
  function applyLangFilter() {
    all = allRaw.filter(langOk);
    videos = videosRaw.filter(langOk);
  }
  var sections = { lead: null, important: [], fresh: [], reads: [] };

  function pickLang() {
    var s = store.get('faind-lang');
    if (s && LANGS.indexOf(s) > -1) return s;
    var nav = (navigator.language || 'it').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) > -1 ? nav : 'it';
  }
  function readSaved() { try { return JSON.parse(store.get('faind-saved') || '[]'); } catch (e) { return []; } }

  /* ------------------------------ Utility ------------------------------ */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function t(key, vars) {
    var s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.it[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function tx(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[state.lang] || v.it || v.en || '';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return /^(https?:|mailto:|#)/i.test(u || '') ? u : '#'; }
  function isExternal(u) { return /^https?:/i.test(u || ''); }
  function linkAttrs(u) {
    return 'href="' + esc(safeUrl(u)) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : '');
  }
  var EXT = '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var BOOKMARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4.2-6 4.2z"/></svg>';
  var SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function hasTime(iso) { return /T\d{2}:\d{2}/.test(iso || ''); }
  function toDate(iso) { return new Date(hasTime(iso) ? iso : iso + 'T12:00:00'); }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function ageMs(n) { return n.date ? Date.now() - toDate(n.date).getTime() : Infinity; }

  function relTime(iso) {
    var d = toDate(iso), diff = (d - Date.now()) / 1000, abs = Math.abs(diff);
    var rtf = new Intl.RelativeTimeFormat(LOCALES[state.lang], { numeric: 'auto' });
    if (!hasTime(iso)) {
      var days = Math.round((startOfDay(d) - startOfDay(new Date())) / 864e5);
      return Math.abs(days) < 7 ? rtf.format(days, 'day') : fmtDate(iso, true);
    }
    if (abs < 60) return rtf.format(0, 'minute');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 604800) return rtf.format(Math.round(diff / 86400), 'day');
    return fmtDate(iso, true);
  }
  function fmtDate(iso, withYear) {
    var o = { day: 'numeric', month: 'short' };
    if (withYear && toDate(iso).getFullYear() !== new Date().getFullYear()) o.year = 'numeric';
    return new Intl.DateTimeFormat(LOCALES[state.lang], o).format(toDate(iso));
  }
  function fmtClock(iso) {
    return new Intl.DateTimeFormat(LOCALES[state.lang], { hour: '2-digit', minute: '2-digit' }).format(toDate(iso));
  }
  function isToday(iso) { return startOfDay(toDate(iso)).getTime() === startOfDay(new Date()).getTime(); }
  function shortWhen(iso) {
    return hasTime(iso) && isToday(iso) ? fmtClock(iso) : fmtDate(iso);
  }
  function fmtMoney(n) {
    return new Intl.NumberFormat(LOCALES[state.lang], {
      style: 'currency', currencyDisplay: 'narrowSymbol', currency: (DATA.prices && DATA.prices.currency) || 'USD',
      minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2
    }).format(n);
  }

  /* ------------------------------ Componenti ------------------------------ */
  function timeEl(iso) {
    if (!iso) return '';
    return '<time datetime="' + esc(iso) + '" data-rel="' + esc(iso) + '">' + esc(relTime(iso)) + '</time>';
  }
  function tagEl(tag) { return '<span class="tag" data-tag="' + esc(tag) + '">' + esc(t('tag.' + tag)) + '</span>'; }
  function catEl(cat) { cat = cat || 'altro'; return '<span class="cat">' + icon(cat) + esc(t('cat.' + cat)) + '</span>'; }
  function flagEl(n) {
    if (!n.lang || n.lang === state.lang) return '';
    return '<span class="flag" title="' + esc(t('lang.title')) + '">' + esc(n.lang.toUpperCase()) + '</span>';
  }
  function officialEl(n) { return n.official ? '<span class="official">' + CHECK + esc(t('official')) + '</span>' : ''; }
  function sourceEl(src) {
    if (!src) return '';
    return '<span class="source">' + esc(t('source')) + ': <a ' + linkAttrs(src.url) + '>' + esc(src.name) + '</a></span>';
  }
  function alsoEl(n) {
    if (!n.also || !n.also.length) return '';
    var shown = n.also.slice(0, 3).map(function (a) { return '<a ' + linkAttrs(a.url) + '>' + esc(a.name) + '</a>'; }).join(', ');
    var more = n.also.length > 3 ? ' +' + (n.also.length - 3) : '';
    return '<p class="also"><strong>' + (n.also.length + 1) + '</strong> · ' + esc(t('also')) + ' ' + shown + more + '</p>';
  }
  function actionEl(link, cls) {
    if (!link) return '';
    return '<a class="' + (cls || 'go') + '" ' + linkAttrs(link.url) + '>' + esc(t('act.' + (link.type || 'read'))) + ' ' + EXT + '</a>';
  }
  function shareEl(n) {
    return '<button type="button" class="save" data-share-news="' + esc(n.id) + '" aria-label="' + esc(t('share.news')) + '" title="' + esc(t('share.news')) + '">' + SHARE + '</button>';
  }
  function saveEl(id) {
    var on = state.saved.indexOf(id) > -1;
    return '<button type="button" class="save" data-save="' + esc(id) + '" aria-pressed="' + on + '" aria-label="' + esc(on ? t('unsave') : t('save')) + '" title="' + esc(on ? t('unsave') : t('save')) + '">' + BOOKMARK + '</button>';
  }
  /* Immagine della notizia; senza immagine (o se non si carica) compare il logo FAIND */
  var PH = '<img class="thumb__logo" src="assets/logo.webp" alt="" width="510" height="180">';
  function phHtml(size) {
    var big = size === 'lead' || size === 'wide';
    return '<span class="thumb__ph">' + PH + (big ? '<span class="thumb__cap">' + esc(t('img.na')) + '</span>' : '') + '</span>';
  }
  function thumb(n, size, eager) {
    var cls = 'thumb thumb--' + size;
    if (!n.image || !/^https:\/\//.test(n.image)) return '<div class="' + cls + ' thumb--ph" aria-hidden="true">' + phHtml(size) + '</div>';
    return '<div class="' + cls + '" aria-hidden="true"><img src="' + esc(n.image) + '" alt="" ' +
      (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" referrerpolicy="no-referrer"></div>';
  }
  /* Video: copertina con play; il lettore YouTube (senza cookie) si carica solo al tocco */
  function vcard(n) {
    var flag = flagEl(n);
    return '<article class="vcard">' +
      '<div class="vcard__media"><button type="button" class="vcard__play" data-play="' + esc(n.videoId) + '" data-title="' + esc(n.title) + '" aria-label="' + esc(t('video.play') + ': ' + n.title) + '">' +
        '<img src="' + esc(n.image) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">' +
        '<span class="vcard__btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>' +
      '</button></div>' +
      '<div class="vcard__body">' +
        '<div class="read__meta"><span class="vcard__ch">' + esc(n.source.name) + '</span>' + (n.official ? officialEl(n) : '') + flag + timeEl(n.date) + '</div>' +
        '<h3 class="vcard__title"><a ' + linkAttrs(n.link.url) + '>' + esc(n.title) + '</a></h3>' +
        '<div class="card__foot"><a class="go" ' + linkAttrs(n.link.url) + '>' + esc(t('video.yt')) + ' ' + EXT + '</a><span class="card__btns">' + shareEl(n) + saveEl(n.id) + '</span></div>' +
      '</div></article>';
  }
  function card(n) {
    if (n.kind === 'video') return vcard(n);
    var url = n.link && n.link.url;
    return '<article class="card" data-tag="' + esc(n.tag) + '">' +
      '<a class="card__media" ' + titleAttrs(n) + ' tabindex="-1" aria-hidden="true">' + thumb(n, 'wide') + '</a>' +
      '<div class="card__top">' + tagEl(n.tag) + timeEl(n.date) + '</div>' +
      '<div class="read__meta">' + catEl(n.category) + flagEl(n) + officialEl(n) + '</div>' +
      '<h3 class="card__title"><a ' + titleAttrs(n) + '>' + esc(tx(n.title)) + '</a></h3>' +
      (n.summary ? '<p class="card__summary">' + esc(tx(n.summary)) + '</p>' : '') +
      sourceEl(n.source) + alsoEl(n) +
      '<div class="card__foot">' + actionEl(n.link) + '<span class="card__btns">' + (n.id && !n.isGuide ? shareEl(n) : '') + (n.id ? saveEl(n.id) : '') + '</span></div></article>';
  }

  /* ------------------------------ Caricamento notizie ------------------------------ */
  var editorial = (DATA.news || []).map(function (n) { var c = {}; for (var k in n) c[k] = n[k]; c.editorial = true; return c; });

  function merge(auto, vids, pages, spot, jobs, jobsUp) {
    jobsRaw = Array.isArray(jobs) ? jobs : [];
    jobsUpdated = jobsUp || null;
    spotRaw = Array.isArray(spot) ? spot : [];
    var urls = {};
    editorial.forEach(function (n) { if (n.link) urls[n.link.url] = 1; });
    var extra = (auto || []).filter(function (n) { return n && n.link && !urls[n.link.url] && n.title; });
    allRaw = editorial.concat(extra).sort(function (a, b) { return toDate(b.date) - toDate(a.date); });
    videosRaw = (vids || []).filter(function (v) { return v && v.videoId && v.title; });
    pagesMap = pages || {};
    applyLangFilter();
  }
  /* Pagina FAIND della notizia (se esiste): il titolo porta lì, il pulsante alla fonte */
  function pageOf(n) { return n.page || pagesMap[n.id] || ''; }
  function titleAttrs(n) {
    var pg = pageOf(n);
    return pg ? 'href="' + esc(pg) + '"' : linkAttrs(n.link && n.link.url);
  }

  function loadbar(on) {
    var el = $('#loadbar');
    if (on) { el.classList.remove('is-done'); el.classList.add('is-on'); return; }
    el.classList.add('is-done');
    setTimeout(function () { el.classList.remove('is-on', 'is-done'); }, 450);
  }

  function fetchNews(silent) {
    if (location.protocol === 'file:') return Promise.reject(new Error('local'));
    if (!silent) loadbar(true);
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    // Il parametro cambia ogni 5 minuti: niente cache vecchia, ma niente richieste inutili
    var bucket = Math.floor(Date.now() / 3e5);
    return fetch('news.json?v=' + bucket, { cache: 'no-cache', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .finally(function () { clearTimeout(timer); });
  }

  function load() {
    fetchNews(false).then(function (json) {
      state.feed = { generated: json.generated, sources: json.sources, count: (json.items || []).length };
      state.feedState = 'ok';
      merge(json.items, json.videos, json.pages, json.spotlight, json.jobs, json.jobsUpdated);
    }).catch(function (e) {
      state.feedState = e && e.message === 'local' ? 'local' : 'error';
      merge([], [], {});
    }).then(function () {
      state.loaded = true;
      loadbar(false);
      $('#lead').removeAttribute('aria-busy'); $('#wire').removeAttribute('aria-busy');
      $('#lead').classList.remove('is-loading');
      renderAll();
    });
  }

  // Controllo silenzioso ogni 10 minuti mentre la pagina è aperta
  function refresh() {
    if (document.hidden || state.feedState !== 'ok') return;
    fetchNews(true).then(function (json) {
      if (!state.feed || json.generated === state.feed.generated) return;
      state.feed = { generated: json.generated, sources: json.sources, count: (json.items || []).length };
      merge(json.items, json.videos, json.pages, json.spotlight, json.jobs, json.jobsUpdated);
      renderAll();
    }).catch(function () {});
  }

  /* ------------------------------ Sezioni home ------------------------------ */
  var WEEK = 7 * 864e5, DAY = 864e5;
  function isImportant(n) { return n.priority === 'alta' || (n.coverage || 1) >= 3; }

  function buildSections() {
    // L'apertura scelta dalla redazione vale 48 ore; poi passa alla notizia importante più fresca
    // Se non c'è né un'apertura recente né una notizia importante, apre la più recente con foto
    var lead = all.filter(function (n) { return n.lead && ageMs(n) < 2 * DAY; })[0] ||
               all.filter(function (n) { return isImportant(n) && ageMs(n) < 2 * DAY; })[0] ||
               all.filter(function (n) { return n.image && ageMs(n) < DAY; })[0] ||
               all[0] || null;
    var used = {};
    if (lead) used[lead.id] = 1;

    var important = all.filter(function (n) { return !used[n.id] && isImportant(n) && ageMs(n) < WEEK; }).slice(0, 5);
    important.forEach(function (n) { used[n.id] = 1; });

    var rest = all.filter(function (n) { return !used[n.id]; });
    var fresh = rest.filter(function (n) { return ageMs(n) < DAY; }).slice(0, 8);
    if (fresh.length < 5) fresh = rest.slice(0, 5);
    fresh.forEach(function (n) { used[n.id] = 1; });

    sections = { lead: lead, important: important, fresh: fresh, reads: all.filter(function (n) { return !used[n.id]; }) };
  }

  /* ------------------------------ Render ------------------------------ */
  function renderStatus() {
    var el = $('#feedStatus');
    if (!state.loaded) {
      el.textContent = t('status.loading');
      $('#ticker').innerHTML = '<li class="ticker__item">' + esc(t('status.loading')) + '</li>';
      return;
    }
    if (state.feedState === 'ok' && state.feed) {
      el.innerHTML = esc(t('status.ok', { t: '\u0000', n: all.length, s: state.feed.sources || 0 }))
        .replace('\u0000', '<time datetime="' + esc(state.feed.generated) + '" data-rel="' + esc(state.feed.generated) + '">' + esc(relTime(state.feed.generated)) + '</time>');
    } else el.textContent = t(state.feedState === 'local' ? 'status.local' : 'status.error');
  }

  function renderTicker() {
    var pool = [];
    if (sections.lead) pool.push(sections.lead);
    pool = pool.concat(sections.important, sections.fresh)
      .sort(function (a, b) { return toDate(b.date) - toDate(a.date); });
    // Nella barra solo notizie delle ultime 48 ore (se ce ne sono abbastanza)
    var recent = pool.filter(function (n) { return ageMs(n) < 2 * DAY; });
    pool = (recent.length >= 4 ? recent : pool).slice(0, 12);
    var items = pool.map(function (n) {
      return '<li class="ticker__item"><time datetime="' + esc(n.date) + '">' + esc(shortWhen(n.date)) + '</time>' +
        (isImportant(n) ? '<span class="star" aria-hidden="true">★</span>' : '') +
        '<a ' + titleAttrs(n) + '>' + esc(tx(n.title)) + '</a></li>';
    }).join('');
    var track = $('#ticker');
    // Seconda copia per uno scorrimento continuo, nascosta agli screen reader
    track.innerHTML = items + items.replace(/<li class="ticker__item">/g, '<li class="ticker__item" aria-hidden="true">').replace(/<a /g, '<a tabindex="-1" ');
    track.style.setProperty('--tdur', Math.max(40, pool.length * 8) + 's');
  }

  function renderLead() {
    var n = sections.lead, el = $('#lead');
    if (!n) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML =
      '<a class="lead__media" ' + titleAttrs(n) + ' tabindex="-1" aria-hidden="true">' + thumb(n, 'lead', true) + '</a>' +
      '<div class="read__meta">' + tagEl(n.tag) + catEl(n.category) + flagEl(n) + officialEl(n) + '</div>' +
      '<h2 class="lead__title"><a ' + titleAttrs(n) + '>' + esc(tx(n.title)) + '</a></h2>' +
      (n.summary ? '<p class="lead__summary">' + esc(tx(n.summary)) + '</p>' : '') +
      '<div class="lead__foot">' +
        '<div><div class="meta">' + timeEl(n.date) + sourceEl(n.source) + '</div>' + alsoEl(n) + '</div>' +
        '<div class="lead__actions">' + actionEl(n.link, 'btn btn--light') + shareEl(n) + saveEl(n.id) + '</div>' +
      '</div>';
  }

  function renderWire() {
    $('#wire').innerHTML = sections.fresh.map(function (n) {
      var when = hasTime(n.date) && isToday(n.date)
        ? esc(fmtClock(n.date)) + '<small>' + esc(t('today')) + '</small>' : esc(fmtDate(n.date));
      return '<li class="wire__item">' +
        '<div class="wire__when"><time datetime="' + esc(n.date) + '">' + when + '</time></div>' +
        '<div class="wire__body"><div class="read__meta">' + tagEl(n.tag) + flagEl(n) + '</div>' +
          '<h3 class="wire__headline"><a ' + titleAttrs(n) + '>' + esc(tx(n.title)) + '</a></h3>' +
          sourceEl(n.source) +
        '</div>' + thumb(n, 'sm') + '</li>';
    }).join('');
  }

  function renderImportant() {
    var box = $('#importanti');
    box.hidden = !sections.important.length;
    var grid = $('#important');
    grid.classList.add('grid--important');
    grid.innerHTML = sections.important.map(card).join('');
  }

  function renderReads() {
    var list = sections.reads.slice(0, state.readsShown);
    $('#letture').hidden = !sections.reads.length;
    $('#reads').innerHTML = list.map(function (n) {
      return '<li class="read">' +
        thumb(n, 'md') +
        '<div class="read__body"><div class="read__meta">' + tagEl(n.tag) + catEl(n.category) + flagEl(n) +
          '<span class="read__when">' + timeEl(n.date) + '</span></div>' +
          '<h3 class="read__title"><a ' + titleAttrs(n) + '>' + esc(tx(n.title)) + '</a></h3>' +
          sourceEl(n.source) + '</div>' +
        saveEl(n.id) + '</li>';
    }).join('');
    $('#moreReads').hidden = sections.reads.length <= state.readsShown;
  }

  /* Settori: solo quelli che hanno contenuti, con il conteggio */
  function pool() {
    var guides = (DATA.guides || []).map(function (g) { var c = {}; for (var k in g) c[k] = g[k]; c.isGuide = true; return c; });
    return all.concat(videos, guides);
  }
  function renderSectors() {
    var p = pool(), counts = {};
    p.forEach(function (n) { var c = n.category || 'altro'; counts[c] = (counts[c] || 0) + 1; });
    var chip = function (key, label, ic, count) {
      return '<button type="button" class="chip" data-sector="' + key + '" aria-pressed="' + (state.sector === key) + '">' +
        (ic ? icon(ic) : '') + esc(label) + (count != null ? ' <span class="chip__count">' + count + '</span>' : '') + '</button>';
    };
    var html = chip('all', t('sector.all'), null, null);
    if (state.loaded) CATS.forEach(function (c) { if (counts[c]) html += chip(c, t('cat.' + c), c, counts[c]); });
    html += chip('saved', t('filter.saved'), 'saved', state.saved.length);
    $('#sectors').innerHTML = html;
  }

  function inResults() { return state.sector !== 'all' || state.type !== 'all' || !!state.query; }

  function baseFilter(n) {
    if (state.sector === 'saved' && state.saved.indexOf(n.id) < 0) return false;
    if (state.sector !== 'all' && state.sector !== 'saved' && (n.category || 'altro') !== state.sector) return false;
    if (state.query) {
      var hay = (tx(n.title) + ' ' + tx(n.summary) + ' ' + (n.source && n.source.name) + ' ' + t('cat.' + (n.category || 'altro'))).toLowerCase();
      if (hay.indexOf(state.query) < 0) return false;
    }
    return true;
  }

  function renderResults() {
    var on = inResults();
    $('#homeView').hidden = on;
    $('#results').hidden = !on;
    if (!on) return;

    var base = pool().filter(baseFilter);
    var counts = {};
    base.forEach(function (n) { counts[n.tag] = (counts[n.tag] || 0) + 1; });
    var tchip = function (key, label, count) {
      return '<button type="button" class="chip" data-type="' + key + '" aria-pressed="' + (state.type === key) + '"' +
        (key !== 'all' ? ' data-tag="' + key + '"' : '') + '>' + esc(label) + ' <span class="chip__count">' + count + '</span></button>';
    };
    var html = tchip('all', t('type.all'), base.length);
    TYPES.forEach(function (ty) { if (counts[ty]) html += tchip(ty, t('tag.' + ty), counts[ty]); });
    $('#types').innerHTML = html;

    var list = base.filter(function (n) { return state.type === 'all' || n.tag === state.type; })
      .sort(function (a, b) { return (b.date ? toDate(b.date) : 0) - (a.date ? toDate(a.date) : 0); });

    var title = state.query ? t('results.search', { q: state.query })
      : state.sector === 'saved' ? t('results.saved')
      : state.sector !== 'all' ? t('cat.' + state.sector) : t('results.all');
    $('#resultsTitle').innerHTML = esc(title) + ' <span class="block__hint">' + esc(t('results.count', { n: list.length })) + '</span>';

    if (!list.length) {
      var msg = state.sector === 'saved' && !state.query ? t('empty.saved') : t('empty.text');
      $('#grid').innerHTML = '<div class="empty"><p>' + esc(msg) + '</p><button type="button" class="btn btn--ghost" data-reset>' + esc(t('empty.reset')) + '</button></div>';
      return;
    }
    $('#grid').innerHTML = list.map(card).join('');
  }

  var ICONS = {
    download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>',
    guide: '<svg viewBox="0 0 24 24"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/></svg>',
    tool: '<svg viewBox="0 0 24 24"><path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L20 11l-9 9-3-3 9-9zM4 20l3-3"/></svg>'
  };
  function renderGuides() {
    $('#guides').innerHTML = (DATA.guides || []).map(function (g) {
      return '<li class="guide" data-tag="' + esc(g.tag) + '">' +
        '<span class="guide__icon" aria-hidden="true">' + (ICONS[g.tag] || ICONS.guide) + '</span>' +
        '<div><h3 class="guide__title"><a ' + linkAttrs(g.link.url) + '>' + esc(tx(g.title)) + '</a></h3>' +
          '<p class="guide__sum">' + esc(tx(g.summary)) + '</p>' + sourceEl(g.source) + '</div>' +
        actionEl(g.link) + '</li>';
    }).join('');
  }

  /* Icona ufficiale del servizio: dominio → servizio icone di Google; percorso → immagine locale */
  function plogo(it) {
    var initial = '<span class="plogo__txt">' + esc((it.name || '?').charAt(0)) + '</span>';
    if (!it.logo) return '<span class="plogo" aria-hidden="true">' + initial + '</span>';
    var src = /[\/]/.test(it.logo) ? it.logo
      : 'https://www.google.com/s2/favicons?sz=64&domain=' + encodeURIComponent(it.logo);
    return '<span class="plogo" aria-hidden="true" data-initial="' + esc((it.name || '?').charAt(0)) + '">' +
      '<img class="plogo__img" src="' + esc(src) + '" alt="" width="32" height="32" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>';
  }
  function renderPrices() {
    var p = DATA.prices || { items: [] };
    $('#pricesNote').textContent = t('prices.note');
    $('#prices').innerHTML = p.items.map(function (it) {
      var saving = it.annual ? Math.round((1 - it.annual / it.monthly) * 100) : 0;
      return '<tr>' +
        '<td class="prices__name"><div class="prices__id">' + plogo(it) +
          '<div><a ' + linkAttrs(it.url) + '>' + esc(it.name) + '</a><span class="prices__vendor">' + esc(it.vendor) + '</span></div></div></td>' +
        '<td class="num"><strong>' + esc(fmtMoney(it.monthly)) + '</strong></td>' +
        '<td class="num">' + (it.annual
          ? esc(fmtMoney(it.annual)) + '<span class="prices__save">' + esc(t('prices.save')) + ' ' + saving + '%</span>'
          : '<span class="dash" aria-label="n/d">—</span>') + '</td></tr>';
    }).join('');
    var foot = esc(t('prices.checked')) + ' ' + esc(fmtDate(p.checked, true));
    if (p.verifiedBy) foot += '. ' + esc(t('prices.verified')) + ' <a ' + linkAttrs(p.verifiedBy.url) + '>' + esc(p.verifiedBy.name) + '</a>.';
    $('#pricesFoot').innerHTML = foot;
  }

  function renderDeals() {
    $('#deals').innerHTML = (DATA.deals || []).map(function (d) {
      return '<li class="deal">' +
        '<div class="deal__head"><h3 class="deal__title">' + esc(tx(d.title)) + '</h3>' +
          (d.demo ? '<span class="deal__demo">' + esc(t('deal.demo')) + '</span>' : (d.saving ? '<span class="deal__saving">' + esc(d.saving) + '</span>' : '')) +
        '</div>' +
        '<p class="deal__detail">' + esc(tx(d.detail)) + '</p>' +
        (d.code ? '<div class="deal__code"><code>' + esc(d.code) + '</code><button type="button" class="copy-sm" data-copy="' + esc(d.code) + '">' + esc(t('deal.copy')) + '</button></div>' : '') +
        '<div class="deal__foot">' + sourceEl(d.source) + actionEl(d.link) + '</div></li>';
    }).join('');
  }

  function renderVideos() {
    var box = $('#video');
    box.hidden = !videos.length;
    if (!videos.length) return;
    var groups = ['all', 'it', 'intl', 'official'], counts = { all: videos.length };
    videos.forEach(function (v) { var g = v.group || 'intl'; counts[g] = (counts[g] || 0) + 1; });
    if (state.videoGroup !== 'all' && !counts[state.videoGroup]) state.videoGroup = 'all';
    $('#videoGroups').innerHTML = groups.filter(function (g) { return counts[g]; }).map(function (g) {
      return '<button type="button" class="chip" data-vgroup="' + g + '" aria-pressed="' + (state.videoGroup === g) + '">' +
        esc(t('video.' + g)) + ' <span class="chip__count">' + counts[g] + '</span></button>';
    }).join('');
    var list = videos.filter(function (v) { return state.videoGroup === 'all' || (v.group || 'intl') === state.videoGroup; });
    $('#videos').innerHTML = list.slice(0, state.videosShown).map(vcard).join('');
    $('#moreVideos').hidden = list.length <= state.videosShown;
  }

  var FOCUS_ICON = {
    robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16.5h5M3 12v3M21 12v3"/><circle cx="12" cy="3.5" r="1"/>',
    domus: '<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><rect x="10" y="13" width="4" height="7"/>',
    medicina: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M9 11.5h6M12 8.5v6"/>',
    lavoro: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2M3.5 12.5h17"/>',
    clima: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19c3-4 6-6.5 10-8.5"/>'
  };
  /* Focus: per ogni tema 1 video + 1 notizia, rispettando il filtro lingue */
  // Pagine tematiche permanenti (cartella temi/, generate dall'automazione)
  // Si aprono nella lingua scelta in home; ogni pagina permette poi di cambiare lingua.
  var TOPIC_PAGES = {
    it: { dir: 'temi/', robot: 'robot-umanoidi', domus: 'ai-in-casa', medicina: 'ai-medicina-salute', lavoro: 'ai-lavoro', clima: 'ai-clima-ambiente' },
    en: { dir: 'temi/en/', robot: 'humanoid-robots', domus: 'ai-at-home', medicina: 'ai-medicine-health', lavoro: 'ai-jobs-work', clima: 'ai-climate-environment' },
    fr: { dir: 'temi/fr/', robot: 'robots-humanoides', domus: 'ia-a-la-maison', medicina: 'ia-medecine-sante', lavoro: 'ia-travail', clima: 'ia-climat-environnement' },
    de: { dir: 'temi/de/', robot: 'humanoide-roboter', domus: 'ki-zuhause', medicina: 'ki-medizin-gesundheit', lavoro: 'ki-arbeit', clima: 'ki-klima-umwelt' }
  };
  var TOPIC_MORE = { it: 'Approfondisci', en: 'Read more', fr: 'En savoir plus', de: 'Mehr dazu' };
  // Link del footer verso le pagine fisse, nella lingua dell'interfaccia
  var LOCAL_LINKS = {
    topics: { it: ['temi/', 'Temi'], en: ['temi/en/', 'Topics'], fr: ['temi/fr/', 'Thèmes'], de: ['temi/de/', 'Themen'] },
    embed: { it: ['incorpora.html', 'Widget per il tuo sito'], en: ['incorpora.html', 'Widget for your site'], fr: ['incorpora.html', 'Widget pour votre site'], de: ['incorpora.html', 'Widget für deine Website'] },
    gloss: { it: ['glossario/', 'Glossario'], en: ['glossario/en/', 'Glossary'], fr: ['glossario/fr/', 'Glossaire'], de: ['glossario/de/', 'Glossar'] },
    about: { it: ['redazione.html', 'Chi c\'è dietro FAIND'], en: ['about.html', 'Who is behind FAIND'], fr: ['a-propos.html', 'Qui est derrière FAIND'], de: ['ueber-uns.html', 'Wer hinter FAIND steht'] }
  };
  function localLinks() {
    $$('[data-ll]').forEach(function (a) {
      var m = LOCAL_LINKS[a.getAttribute('data-ll')]; if (!m) return;
      var v = m[state.lang] || m.it; a.setAttribute('href', v[0]); a.textContent = v[1];
    });
  }
  function renderFocus() {
    var html = spotRaw.map(function (sp) {
      var v = sp.video && langOk(sp.video) ? sp.video : null;
      var n = sp.news && langOk(sp.news) ? sp.news : null;
      if (!v && !n) return '';
      return '<article class="fblock" id="focus-' + esc(sp.key) + '" data-topic="' + esc(sp.key) + '">' +
        '<header class="fblock__head"><span class="fblock__ico" aria-hidden="true"><svg viewBox="0 0 24 24">' + (FOCUS_ICON[sp.key] || FOCUS_ICON.robot) + '</svg></span>' +
          '<div><h3 class="fblock__title">' + esc(t('focus.' + sp.key)) + '</h3><p class="fblock__sub">' + esc(t('focus.' + sp.key + '.sub')) + '</p></div>' +
          ((TOPIC_PAGES[state.lang] || TOPIC_PAGES.it)[sp.key] ? '<a href="' + (TOPIC_PAGES[state.lang] || TOPIC_PAGES.it).dir + (TOPIC_PAGES[state.lang] || TOPIC_PAGES.it)[sp.key] + '.html" style="margin-left:auto;font-size:14px;font-weight:700;white-space:nowrap">' + esc(TOPIC_MORE[state.lang] || TOPIC_MORE.it) + ' →</a>' : '') + '</header>' +
        '<div class="fblock__body">' +
          (v ? '<div class="fblock__slot"><p class="fblock__label">▶ ' + esc(t('focus.vlabel')) + '</p>' + vcard(v) + '</div>' : '') +
          (n ? '<div class="fblock__slot"><p class="fblock__label">★ ' + esc(t('focus.nlabel')) + '</p>' + card(n) + '</div>' : '') +
        '</div></article>';
    }).join('');
    $('#focusList').innerHTML = html;
    $('#focus').hidden = !html;
  }

  var ROLE_NAMES = { ml: 'Machine Learning Engineer', ai: 'AI Engineer', ds: 'Data Scientist', de: 'Data Engineer', da: 'Data Analyst',
    research: 'AI Research Scientist', cv: 'Computer Vision Engineer', nlp: 'NLP Engineer', pm: 'AI Product Manager',
    arch: 'AI / Data Architect', prompt: 'Prompt Engineer' };
  var LANG_NAMES = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };
  /* Job: classifica dei ruoli più presenti negli annunci, filtrata per lingua */
  function renderJobs() {
    var list = jobsRaw.filter(langOk);
    var sec = $('#job');
    sec.hidden = !jobsRaw.length;
    if (!jobsRaw.length) return;
    var groups = {};
    list.forEach(function (j) { (groups[j.role] = groups[j.role] || []).push(j); });
    var roles = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length; }).slice(0, 10);
    var filtered = state.langs.length < NEWS_LANGS.length;
    $('#jobsFilter').innerHTML = '<span>' + esc(t('jobs.filter')) + '</span> ' +
      state.langs.map(function (l) { return '<span class="jobs__lang">' + esc(LANG_NAMES[l]) + '</span>'; }).join('') +
      ' <button type="button" class="jobs__change" data-open-langf>' + esc(t('jobs.change')) + '</button>';
    $('#jobsFilter').classList.toggle('is-filtered', filtered);
    $('#jobsList').innerHTML = roles.length ? roles.map(function (r, i) {
      var offers = groups[r].slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
      var n = offers.length;
      return '<li><details class="jrole"' + (i === 0 ? ' open' : '') + '>' +
        '<summary><span class="jrole__rank">' + (i + 1) + '</span><span class="jrole__name">' + esc(r === 'consult' ? t('role.consult') : ROLE_NAMES[r] || r) + '</span>' +
        '<span class="jrole__count">' + esc(n === 1 ? t('jobs.one') : t('jobs.many', { n: n })) + '</span><span class="jrole__chev" aria-hidden="true"></span></summary>' +
        '<ul class="jrole__offers">' + offers.slice(0, 5).map(function (j) {
          return '<li><a ' + linkAttrs(j.url) + '><span class="jrole__job"><strong>' + esc(j.title) + '</strong>' +
            '<span>' + esc([j.company, j.where].filter(Boolean).join(' · ')) + ' · ' + esc(relTime(j.date)) + '</span></span>' +
            '<span class="jrole__go">' + esc(t('jobs.apply')) + ' ' + EXT + '</span></a></li>';
        }).join('') + '</ul></details></li>';
    }).join('') : '<li class="jobs__empty">' + esc(t('jobs.empty')) + '</li>';
    var srcs = [];
    jobsRaw.forEach(function (j) { if (srcs.indexOf(j.source) < 0) srcs.push(j.source); });
    $('#jobsFoot').textContent = jobsUpdated ? t('jobs.foot', { s: srcs.join(', '), t: relTime(jobsUpdated) }) : '';
  }

  function renderNews() {
    if (!state.loaded) return;
    buildSections();
    renderStatus(); renderLead(); renderWire(); renderImportant(); renderVideos(); renderJobs(); renderReads(); renderFocus(); renderTicker();
    renderSectors(); renderResults();
  }
  function renderAll() {
    renderStatus(); renderSectors();
    renderNews(); renderGuides(); renderPrices(); renderDeals();
    var up = $('#updated');
    var when = state.feed && state.feed.generated ? state.feed.generated.slice(0, 10) : DATA.updated;
    if (up && when) { up.setAttribute('datetime', when); up.textContent = fmtDate(when, true); }
  }

  /* ------------------------------ Condivisione ------------------------------ */
  var SITE = 'https://itartedesign-dot.github.io/faind/';
  function shareLinks() {
    var u = encodeURIComponent(SITE), m = encodeURIComponent(t('share.msg'));
    var map = {
      whatsapp: 'https://wa.me/?text=' + m + '%20' + u,
      telegram: 'https://t.me/share/url?url=' + u + '&text=' + m,
      x: 'https://twitter.com/intent/tweet?url=' + u + '&text=' + m,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u
    };
    $$('[data-share]').forEach(function (a) { a.href = map[a.getAttribute('data-share')] || SITE; });
  }
  function nativeShare(data, fallbackText) {
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    copyText(fallbackText);
  }

  /* ------------------------------ Lingua & tema ------------------------------ */
  function applyLang(lang) {
    state.lang = lang;
    store.set('faind-lang', lang);
    document.documentElement.lang = lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    $$('.lang__btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    $('#tickerOpen').setAttribute('aria-label', t('ticker.open'));
    // Testo "Chi siamo" nella lingua scelta (l'italiano resta la versione completa)
    var hasLang = !!$('[data-about="' + lang + '"]');
    $$('[data-about]').forEach(function (b) { b.hidden = b.getAttribute('data-about') !== (hasLang ? lang : 'it'); });
    $$('[data-i18n-alt]').forEach(function (el) { el.alt = t(el.getAttribute('data-i18n-alt')); });
    // Card Telegram: italiana con l'interfaccia in italiano, inglese con le altre lingue
    var tgImg = $('#tgboxImg');
    if (tgImg) { var tgSrc = tgImg.getAttribute(lang === 'it' ? 'data-src-it' : 'data-src-en'); if (tgImg.getAttribute('src') !== tgSrc) tgImg.setAttribute('src', tgSrc); }
    shareLinks();
    localLinks();
    renderAll();
  }
  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    $('#themeToggle').setAttribute('aria-pressed', String(theme === 'dark'));
    if (persist) store.set('faind-theme', theme);
  }

  /* ------------------------------ Barra TG ------------------------------ */
  function setTicker(on, persist) {
    $('#bticker').hidden = !on;
    $('#tickerOpen').hidden = on;
    document.body.classList.toggle('has-bticker', on);
    if (persist) session.set('faind-bticker', on ? 'on' : 'off');
  }

  /* ------------------------------ Toast & copia ------------------------------ */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2000);
  }
  function copyText(txt) {
    var done = function () { toast(t('copied')); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }

  /* ------------------------------ Drawer mobile ------------------------------ */
  var lastFocus;
  function openDrawer() {
    lastFocus = document.activeElement;
    $('#drawer').hidden = false;
    $('#menuBtn').setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    $('#menuClose').focus();
  }
  function closeDrawer() {
    if ($('#drawer').hidden) return;
    $('#drawer').hidden = true;
    $('#menuBtn').setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function goResults() {
    state.type = 'all';
    renderResults();
    var h = $('#resultsTitle');
    if (!$('#results').hidden) {
      var top = $('.sectors').getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top: top });
    }
    return h;
  }
  function resetFilters() {
    state.sector = 'all'; state.type = 'all'; state.query = ''; $('#search').value = '';
    renderSectors(); renderResults();
  }

  /* ------------------------------ Eventi ------------------------------ */
  function bind() {
    // Immagine non caricabile (link scaduto o bloccato dalla fonte): passa al logo
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (img && img.classList && img.classList.contains('plogo__img')) {
        var box = img.parentNode;
        box.innerHTML = '<span class="plogo__txt">' + esc(box.getAttribute('data-initial') || '?') + '</span>';
        return;
      }
      if (!img || img.tagName !== 'IMG' || !img.parentNode || !img.parentNode.classList || !img.parentNode.classList.contains('thumb')) return;
      if (img.classList.contains('thumb__logo')) return;
      var box = img.parentNode, size = /thumb--(lead|wide|md|sm)/.exec(box.className);
      box.classList.add('thumb--ph');
      img.outerHTML = phHtml(size ? size[1] : 'sm');
    }, true);

    document.addEventListener('click', function (e) {
      var el;
      if ((el = e.target.closest('.lang__btn'))) { applyLang(el.dataset.lang); return; }
      if ((el = e.target.closest('[data-sector]'))) {
        var key = el.dataset.sector;
        state.sector = state.sector === key && key !== 'all' ? 'all' : key;
        renderSectors(); goResults();
        var active = $('[data-sector="' + state.sector + '"]');
        if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'center' });
        return;
      }
      if ((el = e.target.closest('[data-type]'))) {
        state.type = el.dataset.type; renderResults(); return;
      }
      if ((el = e.target.closest('[data-reset]'))) { resetFilters(); return; }
      if ((el = e.target.closest('[data-save]'))) {
        var id = el.dataset.save, i = state.saved.indexOf(id);
        if (i > -1) state.saved.splice(i, 1); else state.saved.push(id);
        store.set('faind-saved', JSON.stringify(state.saved));
        toast(i > -1 ? t('unsaved.toast') : t('saved.toast'));
        $$('[data-save="' + id + '"]').forEach(function (b) {
          var on = state.saved.indexOf(id) > -1;
          b.setAttribute('aria-pressed', String(on));
          b.setAttribute('aria-label', on ? t('unsave') : t('save'));
          b.title = on ? t('unsave') : t('save');
        });
        renderSectors();
        if (state.sector === 'saved') renderResults();
        return;
      }
      if ((el = e.target.closest('[data-copy]'))) { copyText(el.dataset.copy); return; }
      if ((el = e.target.closest('[data-play]'))) {
        var vid = el.getAttribute('data-play');
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(vid) + '?autoplay=1&rel=0&modestbranding=1';
        frame.title = el.getAttribute('data-title') || 'YouTube';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        frame.className = 'vcard__frame';
        el.parentNode.replaceChild(frame, el);
        return;
      }
      if ((el = e.target.closest('[data-open-langf]'))) {
        e.stopPropagation();
        $('#langf').scrollIntoView({ block: 'center', behavior: 'smooth' });
        $('#langfMenu').hidden = false; $('#langfBtn').setAttribute('aria-expanded', 'true');
        return;
      }
      if ((el = e.target.closest('[data-vgroup]'))) { state.videoGroup = el.dataset.vgroup; state.videosShown = 6; renderVideos(); return; }
      if ((el = e.target.closest('[data-share-site]'))) {
        nativeShare({ title: 'FAIND – Flash AI News Daily', text: t('share.msg'), url: SITE }, SITE);
        return;
      }
      if ((el = e.target.closest('[data-share-news]'))) {
        var sid = el.getAttribute('data-share-news');
        var spotItems = [];
        spotRaw.forEach(function (sp) { if (sp.news) spotItems.push(sp.news); if (sp.video) spotItems.push(sp.video); });
        var item = all.concat(videos, spotItems).filter(function (x) { return x.id === sid; })[0];
        if (item) {
          var title = tx(item.title), pg = pageOf(item);
          var url = pg ? SITE + pg : (item.link && item.link.url);
          nativeShare({ title: title, text: title + ' (' + t('share.via') + ')', url: url },
            title + ' ' + url + ' — ' + t('share.via') + ' ' + SITE);
        }
        return;
      }
      if (e.target.closest('#drawer a') || e.target === $('#drawer')) closeDrawer();
      // I link del menu riportano sempre alla home, anche da una ricerca
      if ((el = e.target.closest('a[href^="#"]')) && inResults() && el.getAttribute('href') !== '#main') resetFilters();
    });

    $('#moreReads').addEventListener('click', function () { state.readsShown += 12; renderReads(); });
    $('#moreVideos').addEventListener('click', function () { state.videosShown += 6; renderVideos(); });

    // Filtro lingue delle notizie (indipendente dalla lingua dell'interfaccia)
    var lfBtn = $('#langfBtn'), lfMenu = $('#langfMenu');
    function lfOpen(open) { lfMenu.hidden = !open; lfBtn.setAttribute('aria-expanded', String(open)); }
    lfBtn.addEventListener('click', function (e) { e.stopPropagation(); lfOpen(lfMenu.hidden); });
    document.addEventListener('click', function (e) { if (!lfMenu.hidden && !e.target.closest('#langf')) lfOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lfMenu.hidden) { lfOpen(false); lfBtn.focus(); } });
    $$('#langfMenu input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var chosen = $$('#langfMenu input').filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
        if (!chosen.length) { cb.checked = true; toast(t('langf.min')); return; }
        state.langs = chosen;
        try { localStorage.setItem('faind-news-langs', JSON.stringify(chosen)); } catch (e) {}
        syncLangf();
        applyLangFilter();
        state.readsShown = 12; state.videosShown = 6;
        renderNews();
      });
    });
    $('#tickerClose').addEventListener('click', function () { setTicker(false, true); $('#tickerOpen').focus(); });
    // Su telefono e tablet un tocco sulla barra (fuori dai titoli) la ferma o la fa ripartire
    $('#bticker').addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.closest('.bticker__close')) return;
      $('#bticker').classList.toggle('is-paused');
    });
    $('#tickerOpen').addEventListener('click', function () { setTicker(true, true); });

    $('#themeToggle').addEventListener('click', function () {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onScheme = function (ev) { if (!store.get('faind-theme')) applyTheme(ev.matches ? 'dark' : 'light', false); };
    if (mq.addEventListener) mq.addEventListener('change', onScheme);

    $('#menuBtn').addEventListener('click', openDrawer);
    $('#menuClose').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab' && !$('#drawer').hidden) {
        var f = $$('#drawer a, #drawer button'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1240) closeDrawer(); });

    var qTimer;
    $('#search').addEventListener('input', function (e) {
      clearTimeout(qTimer);
      qTimer = setTimeout(function () {
        state.query = e.target.value.trim().toLowerCase();
        state.type = 'all';
        renderResults();
      }, 150);
    });

    // Modulo contatti: GitHub Pages non ha backend → si apre il client di posta
    $('#contactForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var el = e.target.elements, status = $('#formStatus');
      var f = { name: el['name'], email: el['email'], message: el['message'], type: el['type'] };
      var name = f.name.value.trim(), email = f.email.value.trim(), msg = f.message.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      f.name.setAttribute('aria-invalid', String(!name));
      f.email.setAttribute('aria-invalid', String(!okEmail));
      f.message.setAttribute('aria-invalid', String(!msg));
      if (!name || !okEmail || !msg) {
        status.textContent = t('form.err'); status.classList.add('is-error');
        (!name ? f.name : !okEmail ? f.email : f.message).focus();
        return;
      }
      status.classList.remove('is-error');
      var type = f.type.options[f.type.selectedIndex].text;
      var subject = '[FAIND] ' + type + ' — ' + name;
      var body = msg + '\n\n—\n' + name + ' <' + email + '>\n' + location.href;
      window.location.href = 'mailto:itartedesign@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = t('form.ok');
    });

    if ('IntersectionObserver' in window) {
      var links = $$('.nav__link');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var href = en.target.id && en.target.id !== 'homeView' ? '#' + en.target.id : '#top';
          links.forEach(function (l) { l.setAttribute('aria-current', String(l.getAttribute('href') === href)); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['importanti', 'guide', 'prezzi', 'convenzioni', 'contatti', 'chi-siamo'].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
      io.observe($('.front'));
    }

    document.addEventListener('visibilitychange', function () { if (!document.hidden) { tickTimes(); refresh(); } });
  }

  function syncLangf() {
    $$('#langfMenu input').forEach(function (c) { c.checked = state.langs.indexOf(c.value) > -1; });
    $('#langfCount').textContent = state.langs.length + '/' + NEWS_LANGS.length;
    $('#langf').classList.toggle('is-filtered', state.langs.length < NEWS_LANGS.length);
  }

  /* ------------------------------ Installa l'app ------------------------------ */
  // Android e computer (Chrome, Edge): finestra di installazione del browser.
  // iPhone/iPad: Safari non lo consente, quindi mostriamo una guida in 3 passi.
  var installEvt = null;
  function isStandalone() {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function showInstall(on) {
    $$('[data-install]').forEach(function (b) { b.hidden = !on; });
    var li = $('[data-install-li]'); if (li) li.hidden = !on;
  }
  function initInstall() {
    if (isStandalone()) return;                       // già aperta come app
    if (isIOS()) showInstall(true);
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); installEvt = e; showInstall(true);
    });
    window.addEventListener('appinstalled', function () { installEvt = null; showInstall(false); toast(t('app.done')); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-install]')) return;
      closeDrawer();
      if (installEvt) {
        installEvt.prompt();
        installEvt.userChoice.then(function () { installEvt = null; showInstall(false); });
      } else {
        $('#appSheet').hidden = false; $('#appSheetClose').focus();
      }
    });
    $('#appSheetClose').addEventListener('click', function () { $('#appSheet').hidden = true; });
    $('#appSheet').addEventListener('click', function (e) { if (e.target.id === 'appSheet') e.target.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('#appSheet').hidden = true; });
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  function tickTimes() {
    $$('time[data-rel]').forEach(function (el) { el.textContent = relTime(el.getAttribute('data-rel')); });
  }

  /* ------------------------------ Avvio ------------------------------ */
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light', false);
  setTicker(session.get('faind-bticker') !== 'off', false);
  bind();
  initInstall();
  syncLangf();
  applyLang(state.lang);
  $('#year').textContent = new Date().getFullYear();
  load();
  setInterval(tickTimes, 60000);
  setInterval(refresh, 10 * 60000);
})();
