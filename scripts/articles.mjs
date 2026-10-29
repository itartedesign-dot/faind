/* =====================================================================
   FAIND — Approfondimenti (cartella approfondimenti/)
   ---------------------------------------------------------------------
   Articoli di fondo che rispondono alle domande più cercate
   sull'intelligenza artificiale. Ogni articolo ha: titolo costruito su
   ricerche reali, immagine, testo in sezioni, riquadro "In breve",
   domande frequenti e link alle altre parti del sito.

   Per aggiungere o correggere un articolo: modificare ARTICLES qui sotto
   (i paragrafi sono HTML semplice) e aggiornare UPDATED.
   Le immagini stanno in assets/ con il nome indicato in "img".

   Lingue: l'italiano è qui; inglese, francese e tedesco sono in
   articles-en.mjs, articles-fr.mjs e articles-de.mjs (stesso "slug").
   Le pagine tradotte escono in approfondimenti/en/, /fr/ e /de/.
   Se si corregge un articolo qui, va corretto anche nelle traduzioni.
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import EN from './articles-en.mjs';
import FR from './articles-fr.mjs';
import DE from './articles-de.mjs';

const SITE = 'https://faind.org/';
const DIR = 'approfondimenti/';
const UPDATED = '2026-10-17';

// Testo alternativo delle illustrazioni degli approfondimenti: descrive l'immagine (non ripete il titolo), nella lingua della pagina
const IMG_ALT = {
  'art-01.webp': { it: 'Infermiera che stringe la mano a un paziente anziano in una sala d\'attesa, con braccia robotiche alle postazioni di lavoro', en: 'A nurse holding an elderly patient\'s hand in a waiting room, with robotic arms at the workstations behind them', fr: 'Une infirmière tient la main d\'un patient âgé dans une salle d\'attente, avec des bras robotisés aux postes de travail', de: 'Eine Pflegekraft hält im Wartebereich die Hand eines älteren Patienten, im Hintergrund Roboterarme an den Arbeitsplätzen' },
  'art-02.webp': { it: 'Tre escursionisti e un piccolo robot sul bordo di una rupe, davanti a una porta aperta sul paesaggio', en: 'Three hikers and a small robot on a cliff edge beside an open door above a mountain valley', fr: 'Trois randonneurs et un petit robot au bord d\'une falaise, près d\'une porte ouverte sur la vallée', de: 'Drei Wanderer und ein kleiner Roboter am Rand einer Klippe neben einer offenen Tür über dem Tal' },
  'art-03.webp': { it: 'Persona che entra da una porta illuminata in una parete di cavi blu dentro un data center', en: 'A person stepping through a lit doorway in a wall of blue cables inside a data center', fr: 'Une personne franchit une porte éclairée dans un mur de câbles bleus à l\'intérieur d\'un data center', de: 'Eine Person tritt durch eine beleuchtete Tür in einer Wand aus blauen Kabeln in einem Rechenzentrum' },
  'art-04.webp': { it: 'Artigiano che regge una lampada di resina luminosa, con un braccio robotico accanto sul banco di lavoro', en: 'A craftsman holding a glowing resin lamp at his workbench, a robotic arm beside him', fr: 'Un artisan tient une lampe en résine lumineuse à son établi, un bras robotisé à ses côtés', de: 'Ein Handwerker hält an seiner Werkbank eine leuchtende Harzlampe, neben ihm ein Roboterarm' },
  'art-05.webp': { it: 'Escursionista su un ponte di vetro sospeso sopra un canyon al tramonto', en: 'A hiker on a glass bridge suspended over a canyon at sunset', fr: 'Un randonneur sur un pont de verre suspendu au-dessus d\'un canyon au coucher du soleil', de: 'Ein Wanderer auf einer gläsernen Brücke über einer Schlucht bei Sonnenuntergang' },
  'art-06.webp': { it: 'Schema di un data center con i consumi di energia da una parte e l\'impronta idrica del raffreddamento dall\'altra', en: 'Diagram of a data center showing energy consumption on one side and the water footprint of cooling on the other', fr: 'Schéma d\'un data center : consommation d\'énergie d\'un côté, empreinte hydrique du refroidissement de l\'autre', de: 'Schema eines Rechenzentrums mit Energieverbrauch auf der einen und Wasserfußabdruck der Kühlung auf der anderen Seite' },
  'art-07.webp': { it: 'Donna con una mela in mano davanti a uno specchio che mostra il suo riflesso con una pera', en: 'A woman holding an apple while her mirror reflection holds a pear', fr: 'Une femme tient une pomme alors que son reflet dans le miroir tient une poire', de: 'Eine Frau hält einen Apfel, ihr Spiegelbild hält eine Birne' },
  'art-08.webp': { it: 'Distributore automatico di libri e riviste in un ufficio, accanto a un tavolo con della frutta secca', en: 'A vending machine stocked with books and magazines in an office lounge, next to a table with a bowl of nuts', fr: 'Un distributeur automatique de livres et de magazines dans un espace de bureau, près d\'une table avec un bol de fruits secs', de: 'Ein Automat mit Büchern und Magazinen in einem Büro, neben einem Tisch mit einer Schale Nüsse' },
  'art-09.webp': { it: 'Mano su un mappamondo decorato, con un martelletto da giudice in primo piano', en: 'A hand resting on an ornate globe, with a judge\'s gavel in the foreground', fr: 'Une main posée sur un globe ornemental, avec un marteau de juge au premier plan', de: 'Eine Hand auf einem verzierten Globus, im Vordergrund ein Richterhammer' },
  'art-10.webp': { it: 'Scanner di sicurezza che controlla su un nastro quadri, foto e dischi musicali', en: 'A security scanner on a conveyor belt checking paintings, photos and music discs', fr: 'Un scanner de sécurité sur un tapis roulant qui contrôle des tableaux, des photos et des disques', de: 'Ein Sicherheitsscanner auf einem Förderband prüft Gemälde, Fotos und Musikdisks' },
  'art-11.webp': { it: 'Rete astratta di punti luminosi collegati su sfondo blu scuro, più fitta al centro', en: 'Abstract network of glowing connected dots on a dark blue background, denser in the center', fr: 'Réseau abstrait de points lumineux reliés sur fond bleu sombre, plus dense au centre', de: 'Abstraktes Netz aus leuchtenden, verbundenen Punkten auf dunkelblauem Grund, in der Mitte dichter' },
  'art-12.webp': { it: 'Rete di punti luminosi turchesi e viola collegati tra loro su sfondo scuro', en: 'Network of teal and violet glowing dots joined by thin lines on a dark background', fr: 'Réseau de points lumineux turquoise et violets reliés par de fines lignes sur fond sombre', de: 'Netz aus türkisfarbenen und violetten leuchtenden Punkten, durch feine Linien verbunden, auf dunklem Grund' },
  'art-13.webp': { it: 'Due gruppi di punti luminosi collegati che si incontrano al centro, su sfondo blu notte', en: 'Two clusters of connected glowing dots meeting in the middle on a midnight-blue background', fr: 'Deux groupes de points lumineux reliés qui se rejoignent au centre sur fond bleu nuit', de: 'Zwei Gruppen verbundener Leuchtpunkte, die sich in der Mitte treffen, auf nachtblauem Grund' },
  'art-14.webp': { it: 'Reticolo regolare di punti luminosi collegati su sfondo blu scuro, come una griglia', en: 'Regular lattice of glowing connected dots on a dark blue background, like a grid', fr: 'Réseau régulier de points lumineux reliés sur fond bleu sombre, comme une grille', de: 'Regelmäßiges Gitter aus verbundenen Leuchtpunkten auf dunkelblauem Grund' },
};
const imgAlt = (img, lang, fallback) => (IMG_ALT[img] && (IMG_ALT[img][lang] || IMG_ALT[img].en)) || fallback;

export const ARTICLES = [
  { slug: 'intelligenza-artificiale-sostituira-uomo-lavori-a-rischio', img: 'art-01.webp',
    title: 'L\'intelligenza artificiale sostituirà l\'uomo? I lavori a rischio e quelli no',
    card: 'Quali lavori spariranno, quali cambiano e quali restano: cosa dicono i dati.',
    desc: 'L\'intelligenza artificiale sostituirà l\'uomo nel mondo del lavoro? I lavori a rischio, quelli non a rischio, cosa succede a programmatori, medici e insegnanti e come prepararsi.',
    lede: 'È la domanda che si fanno in più persone: l\'intelligenza artificiale sostituirà l\'uomo nel mondo del lavoro? La risposta breve è che sostituisce compiti, non persone. Ma alcuni mestieri cambieranno molto più di altri.',
    brief: ['L\'AI automatizza singoli compiti più che interi mestieri.', 'I più esposti sono i lavori d\'ufficio ripetitivi basati su testi e dati.', 'I meno esposti richiedono presenza fisica, manualità, relazione e responsabilità.'],
    sections: [
      ['Quali sono i lavori a rischio con l\'intelligenza artificiale', 'I più esposti sono i lavori fatti in gran parte di compiti ripetitivi su testi e dati: inserimento dati, assistenza clienti di primo livello, traduzioni standard, contabilità di base, parte del lavoro di segreteria e di redazione di documenti. Il Fondo monetario internazionale ha stimato nel 2024 che circa il 40% dei posti di lavoro nel mondo è esposto all\'intelligenza artificiale, e circa il 60% nelle economie avanzate. Esposto non vuol dire cancellato: per circa la metà di questi lavori l\'AI può essere un aiuto che aumenta la produttività.'],
      ['I lavori non a rischio', 'Reggono meglio i mestieri che richiedono presenza fisica e manualità fine (idraulici, elettricisti, infermieri, artigiani), relazione diretta con le persone (educatori, assistenza, vendita complessa) e responsabilità di una decisione. Sono anche i lavori in cui un errore costa caro e qualcuno deve risponderne.'],
      ['Programmatori, medici, insegnanti: saranno sostituiti?', 'Sono le tre professioni più cercate su Google insieme alla parola "sostituirà". I <strong>programmatori</strong> usano già l\'AI per scrivere codice più in fretta: il lavoro si sposta dal digitare al progettare e controllare. Per i <strong>medici</strong> l\'AI è un secondo paio di occhi sulle immagini e un aiuto nelle pratiche, ma diagnosi e responsabilità restano al medico. Per gli <strong>insegnanti</strong> cambia il modo di preparare lezioni e verifiche, non il rapporto con la classe.'],
      ['Quanti lavori spariranno e quanti ne nasceranno', 'Le stime cambiano molto da uno studio all\'altro, ed è bene diffidare dei numeri troppo netti. Il World Economic Forum, nel rapporto sul futuro del lavoro del 2025, prevede entro il 2030 circa 92 milioni di posti persi e 170 milioni di nuovi posti creati nel mondo, per effetto di più fattori tra cui l\'AI. Il punto non è solo quanti, ma chi: i nuovi lavori non nascono per forza dove e per chi ha perso il vecchio.'],
      ['Come prepararsi', 'Non serve diventare programmatori. Serve imparare a usare bene gli strumenti nel proprio mestiere: fare la richiesta giusta, controllare il risultato, sapere dove l\'AI sbaglia. Chi sa farlo oggi lavora più in fretta di chi la ignora. FAIND pubblica ogni giorno la <a href="../#job">classifica dei lavori più richiesti nell\'AI</a> e segue il tema nella pagina <a href="../temi/ai-lavoro.html">AI e lavoro</a>. Se non sai da dove cominciare, <a href="imparare-a-usare-intelligenza-artificiale.html">come imparare a usare l\'intelligenza artificiale</a> parte dal tuo mestiere.']
    ],
    faq: [['L\'intelligenza artificiale sostituirà l\'uomo?', 'Sostituisce singoli compiti più che persone. Alcuni mestieri d\'ufficio ripetitivi si ridurranno, altri nasceranno, la maggior parte cambierà modo di lavorare.'], ['Quali lavori non sono a rischio con l\'intelligenza artificiale?', 'Quelli che richiedono presenza fisica, manualità, relazione con le persone e responsabilità diretta: sanità, assistenza, artigianato, mestieri tecnici sul campo.']],
    sources: ['Fondo monetario internazionale, "Gen-AI: Artificial Intelligence and the Future of Work" (2024)', 'World Economic Forum, "Future of Jobs Report 2025"'] },

  { slug: 'intelligenza-artificiale-e-pericolosa', img: 'art-02.webp',
    title: 'L\'intelligenza artificiale è pericolosa? Può davvero ribellarsi?',
    card: 'Ribellione, estinzione, perdita di controllo: cosa c\'è di vero e cosa no.',
    desc: 'L\'intelligenza artificiale è pericolosa? Può ribellarsi, distruggere l\'umanità o portare all\'estinzione? Cosa dicono gli esperti, quali pericoli sono reali oggi e quali ipotetici.',
    lede: 'Tra le ricerche più frequenti su Google ci sono "l\'intelligenza artificiale può ribellarsi" e "può distruggere l\'umanità". Non sono domande ingenue: le stesse preoccupazioni le hanno espresse alcuni degli scienziati che questa tecnologia l\'hanno costruita.',
    brief: ['Oggi nessuna AI ha volontà propria o può "ribellarsi" come nei film.', 'Alcuni esperti di primo piano ritengono serio il rischio di perdere il controllo in futuro; altri lo giudicano esagerato.', 'I pericoli già reali sono altri: truffe, disinformazione, errori, uso militare.'],
    sections: [
      ['L\'intelligenza artificiale può ribellarsi?', 'I sistemi di oggi non hanno desideri, coscienza o volontà: producono risposte calcolando probabilità. Non possono "decidere" di ribellarsi. Il timore degli esperti è diverso e più concreto: sistemi sempre più capaci a cui affidiamo compiti importanti potrebbero perseguire l\'obiettivo ricevuto in modi che non avevamo previsto e che non riusciamo a correggere in tempo.'],
      ['Perché si parla di estinzione', 'Nel 2023 centinaia di ricercatori e dirigenti del settore, tra cui Geoffrey Hinton, Yoshua Bengio e i capi di OpenAI e Google DeepMind, hanno firmato una dichiarazione di una sola frase: ridurre il rischio di estinzione causato dall\'AI dovrebbe essere una priorità globale, al pari di pandemie e guerra nucleare. Hinton, premio Nobel per la fisica nel 2024, ha lasciato Google proprio per poter parlare liberamente di questi rischi.'],
      ['Chi non è d\'accordo', 'Altri scienziati altrettanto autorevoli, come Yann LeCun, considerano questi scenari lontani e in parte fantascientifici, e temono che distraggano dai problemi di oggi. Il disaccordo è reale: nessuno sa dire con certezza quanto e quando le macchine diventeranno capaci.'],
      ['I pericoli reali, già oggi', 'Non serve aspettare il futuro. L\'AI viene già usata per truffe con voci e volti clonati, per produrre disinformazione su larga scala, per attacchi informatici più efficaci. Può sbagliare in ambiti delicati come sanità e giustizia, e riprodurre discriminazioni presenti nei dati. C\'è poi l\'uso militare, con armi sempre più autonome.'],
      ['Che cosa si sta facendo', 'L\'Unione europea ha approvato l\'<a href="../glossario/#ai-act">AI Act</a>, che vieta alcuni usi e impone controlli su quelli ad alto rischio; diversi Paesi hanno creato istituti pubblici per la sicurezza dell\'AI. Per capire come difendersi dai rischi quotidiani, vedi <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">come riconoscere audio, foto e video fatti con l\'AI</a>.']
    ],
    faq: [['L\'intelligenza artificiale è un pericolo per l\'umanità?', 'Gli esperti sono divisi. Alcuni ritengono serio il rischio di perdere il controllo di sistemi molto avanzati in futuro, altri lo considerano remoto. I rischi già concreti riguardano truffe, disinformazione, errori e uso militare.'], ['L\'intelligenza artificiale può pensare?', 'Elabora informazioni e produce ragionamenti che sembrano pensiero, ma non ha coscienza né intenzioni. Se questo si possa chiamare "pensare" è una questione ancora aperta tra gli studiosi.']],
    sources: ['Center for AI Safety, "Statement on AI Risk" (2023)'] },

  { slug: 'imparare-a-usare-intelligenza-artificiale', img: 'art-03.webp',
    title: 'Come usare l\'intelligenza artificiale: guida per iniziare da zero',
    card: 'Una guida per chi parte da zero: quale usare, cosa chiederle, cosa evitare.',
    desc: 'Come usare l\'intelligenza artificiale partendo da zero: come funziona, quale AI scegliere, come scrivere una richiesta, come usarla per studiare e lavorare e gli errori da evitare.',
    lede: 'Come si usa l\'intelligenza artificiale? Imparare non richiede studi tecnici. Richiede un\'ora per provare e qualche regola per non farsi ingannare. Questa è la guida che avremmo voluto leggere all\'inizio.',
    brief: ['Si comincia gratis: tutti i principali assistenti hanno un piano gratuito.', 'La qualità della risposta dipende dalla chiarezza della richiesta.', 'Mai fidarsi senza controllare, mai inserire dati riservati.'],
    sections: [
      ['Come funziona l\'AI, in due righe', 'Gli assistenti come ChatGPT, Claude e Gemini sono <a href="../glossario/#llm">modelli linguistici</a>: hanno letto enormi quantità di testo e prevedono, parola dopo parola, la risposta più plausibile. Per questo scrivono bene e, a volte, dicono con sicurezza cose sbagliate.'],
      ['Quale usare per iniziare', 'Uno qualsiasi dei principali, nella versione gratuita: non serve scegliere quello perfetto. Se usi già Gmail e Documenti, Gemini è il più comodo; per un uso generale va benissimo ChatGPT; per scrivere e ragionare su testi lunghi molti preferiscono Claude. Le differenze e i prezzi sono nella pagina <a href="../confronto/">Le AI a confronto</a>.'],
      ['Come scrivere una buona richiesta', 'La richiesta si chiama <a href="../glossario/#prompt">prompt</a>. Funziona meglio se contiene quattro cose: <strong>chi sei</strong> o per chi è il risultato, <strong>cosa vuoi</strong> con precisione, <strong>il materiale</strong> su cui lavorare, <strong>il formato</strong> della risposta. "Scrivi una mail" dà un risultato generico; "scrivi una mail di tre righe a un cliente per spostare l\'appuntamento di giovedì, tono cordiale" dà un risultato utile. Se la risposta non convince, si corregge: è una conversazione, non una ricerca.'],
      ['Come usare l\'AI per studiare e a scuola', 'Funziona bene per farsi spiegare un argomento in parole più semplici, farsi interrogare, riassumere appunti propri, trovare esempi. Funziona male, e non insegna nulla, se le si chiede di fare i compiti al posto nostro. La regola pratica: usarla come un tutor, non come un sostituto.'],
      ['Come usare l\'intelligenza artificiale sul telefono', 'È il modo più semplice per iniziare. Si scarica l\'app gratuita di ChatGPT, Gemini o Claude e si scrive o si parla, come in una chat. Su molti telefoni Android Gemini è già installato come assistente; sugli iPhone più recenti Siri può passare le domande a ChatGPT. Con la fotocamera si può anche mostrare qualcosa, un documento o un\'etichetta, e chiedere spiegazioni.'],
      ['Gli errori da evitare', 'Tre soprattutto. Fidarsi senza verificare: date, numeri e citazioni vanno sempre controllati. Inserire dati riservati: documenti di lavoro, dati di clienti, informazioni sanitarie. Pensare che una risposta ben scritta sia per forza corretta. Per i termini che incontri, c\'è il <a href="../glossario/">glossario</a>.']
    ],
    faq: [['Come si impara a usare l\'intelligenza artificiale?', 'Provando con un assistente gratuito su compiti reali: una mail, un riassunto, una spiegazione. Si migliora imparando a scrivere richieste precise e a verificare le risposte.'], ['Serve pagare per usare l\'intelligenza artificiale?', 'No. Tutti i principali servizi hanno un piano gratuito sufficiente per imparare. I piani a pagamento servono a chi la usa molto.'], ['Come si usa l\'intelligenza artificiale?', 'Si apre un assistente come ChatGPT, Gemini o Claude, dal sito o dall\'app, e si scrive una richiesta precisa: cosa vuoi, per chi, su quale materiale e in che formato. Poi si migliora la risposta continuando la conversazione.']],
    sources: [] },

  { slug: 'guadagnare-con-intelligenza-artificiale', img: 'art-04.webp',
    title: 'Guadagnare con l\'intelligenza artificiale: cosa funziona davvero',
    card: 'Niente formule magiche: dove l\'AI fa risparmiare tempo e dove le promesse sono vuote.',
    desc: 'Si può guadagnare con l\'intelligenza artificiale? Cosa funziona davvero, cosa no, come usare l\'AI per lavorare meglio e come riconoscere corsi e promesse di guadagni facili.',
    lede: '"Guadagnare con l\'intelligenza artificiale" è una delle ricerche più frequenti, ed è anche quella che attira più promesse facili. La verità è meno spettacolare: l\'AI non crea soldi dal nulla, ma fa risparmiare tempo a chi ha già un mestiere o un\'idea.',
    brief: ['L\'AI moltiplica una competenza che hai, non la sostituisce.', 'I guadagni reali vengono da tempo risparmiato e servizi fatti meglio.', 'Chi promette rendite automatiche di solito vende un corso.'],
    sections: [
      ['Cosa funziona davvero', 'Funziona usare l\'AI per fare più in fretta, o meglio, un lavoro per cui qualcuno paga già: un grafico che prepara più bozze, un traduttore che rivede invece di tradurre da zero, un artigiano che si fa scrivere preventivi e risposte ai clienti, un negozio online che migliora descrizioni e assistenza. Il guadagno è il tempo liberato e il numero di clienti che riesci a seguire.'],
      ['Nuovi servizi che prima non potevi offrire', 'Chi ha una competenza può allargarla: chi scrive può proporre anche testi per il web e newsletter, chi fa video può aggiungere sottotitoli e versioni in altre lingue, chi fa consulenza può aiutare le piccole imprese a introdurre questi strumenti. Qui c\'è domanda vera, perché molte aziende non sanno da dove cominciare.'],
      ['Cosa non funziona', 'Riempire il web di contenuti generati in automatico: i motori di ricerca li riconoscono e li penalizzano. Vendere prodotti digitali fatti in cinque minuti in mercati già saturi. Affidarsi all\'AI per investimenti o trading: non prevede i mercati, e chi lo promette sta vendendo qualcosa.'],
      ['Come riconoscere le promesse vuote', 'Diffida di chi mostra guadagni senza spiegare il lavoro che c\'è dietro, di chi parla di "rendita passiva" e "metodo segreto", di chi vende un corso come unica via. La domanda da farsi è semplice: chi mi sta dicendo questo guadagna usando l\'AI o vendendo corsi su come guadagnare con l\'AI?'],
      ['Da dove partire', 'Dal tuo mestiere. Scrivi l\'elenco delle attività che ti prendono più tempo e prova a farne una con l\'AI questa settimana. Se non sai quale strumento scegliere, c\'è il <a href="../confronto/">confronto tra le AI</a>; se parti da zero, <a href="imparare-a-usare-intelligenza-artificiale.html">la guida per iniziare</a>. I ruoli più richiesti dalle aziende sono nella sezione <a href="../#job">Lavoro AI</a>.']
    ],
    faq: [['Si può guadagnare con l\'intelligenza artificiale?', 'Sì, soprattutto usandola per lavorare più in fretta in un mestiere che si conosce già, o per offrire servizi nuovi. Non esistono guadagni automatici senza competenze.'], ['Come usare l\'AI per fare soldi senza esperienza?', 'Senza una competenza da offrire è difficile. Il primo passo realistico è imparare a usarla bene in un ambito preciso, poi proporre quel servizio.']],
    sources: [] },

  { slug: 'intelligenza-artificiale-rischi-e-vantaggi', img: 'art-05.webp',
    title: 'Intelligenza artificiale: vantaggi e svantaggi, rischi e opinioni in breve',
    card: 'I benefici concreti e i rischi reali, messi sulla stessa bilancia.',
    desc: 'Vantaggi e svantaggi dell\'intelligenza artificiale (AI o IA) in breve: i benefici in ricerca, medicina e lavoro, i rischi per privacy, lavoro e informazione, le opinioni degli esperti e un bilancio senza allarmi.',
    lede: 'In breve: i vantaggi dell\'intelligenza artificiale (AI o IA) sono scoperte scientifiche più rapide, diagnosi più precoci e meno lavoro ripetitivo. Gli svantaggi sono errori detti con sicurezza, rischi per la privacy, disinformazione e un lavoro che cambia in fretta. Quasi ogni vantaggio ha il suo rischio: conta come la si usa.',
    brief: ['I vantaggi più solidi sono in ricerca scientifica, medicina e produttività.', 'I rischi più concreti riguardano errori, privacy, disinformazione e lavoro.', 'Quasi ogni vantaggio ha un rischio corrispondente: conta come la si usa.'],
    sections: [
      ['I vantaggi dell\'intelligenza artificiale', 'Nella <strong>ricerca</strong> accelera scoperte che richiedevano anni: la previsione della forma delle proteine, premiata con il Nobel per la chimica nel 2024, è l\'esempio più noto. In <strong>medicina</strong> aiuta a leggere esami e immagini e a individuare prima alcune malattie. Nel <strong>lavoro</strong> toglie tempo ai compiti ripetitivi. Nella <strong>vita quotidiana</strong> traduce, riassume, spiega, rende accessibili contenuti a chi ha una disabilità visiva o uditiva.'],
      ['Gli svantaggi e i rischi dell\'intelligenza artificiale', 'Può <strong>sbagliare</strong> con tono sicuro, e in sanità o giustizia un errore pesa. Può riprodurre <strong>discriminazioni</strong> presenti nei dati su cui è stata addestrata. Mette pressione sulla <strong>privacy</strong>, perché funziona con grandi quantità di dati personali. Rende facile produrre <strong>disinformazione</strong> e falsi realistici. E cambia il <strong>lavoro</strong> più in fretta di quanto molte persone riescano ad adattarsi.'],
      ['Rischi e opportunità per la salute mentale', 'È una delle ricerche in crescita. I chatbot sono sempre disponibili e non giudicano, e alcune persone li usano come primo sfogo. Ma non sono terapeuti: non conoscono la persona, possono dare risposte inadeguate nei momenti di crisi e favorire l\'isolamento. Per un disagio serio serve un professionista.'],
      ['Le opinioni degli esperti', 'Anche chi l\'ha costruita è diviso. Geoffrey Hinton, premio Nobel per la fisica nel 2024 per gli studi alla base dell\'AI, ha lasciato Google nel 2023 per parlare liberamente dei rischi, compreso quello di perdere il controllo di sistemi più intelligenti di noi. Yann LeCun, per anni a capo della ricerca sull\'AI di Meta, considera invece esagerati i timori di catastrofe e vede il pericolo maggiore nella concentrazione del potere in poche aziende. In mezzo c\'è la posizione di molti ricercatori: benefici e rischi sono entrambi reali, e il bilancio dipende dalle regole.'],
      ['Il bilancio', 'Lo stesso strumento che aiuta un medico può sbagliare una diagnosi; quello che traduce un testo può scrivere una truffa. Il risultato dipende da tre cose: le regole, la qualità dei controlli e la consapevolezza di chi lo usa. Approfondimenti: <a href="intelligenza-artificiale-e-pericolosa.html">l\'AI è pericolosa?</a>, <a href="intelligenza-artificiale-e-affidabile.html">l\'AI è affidabile?</a>, <a href="../temi/ai-medicina-salute.html">AI in medicina</a>.']
    ],
    faq: [['Quali sono i vantaggi dell\'intelligenza artificiale?', 'Accelera la ricerca scientifica, aiuta medici e professionisti, automatizza compiti ripetitivi e rende più accessibili informazioni e servizi.'], ['Quali sono gli svantaggi dell\'intelligenza artificiale?', 'Errori presentati come certezze, discriminazioni, violazioni della privacy, disinformazione, truffe e trasformazioni rapide del lavoro.'], ['L\'intelligenza artificiale è un bene o un male?', 'Né l\'uno né l\'altro da sola: è uno strumento. Gli stessi sistemi che aiutano un medico possono sbagliare una diagnosi o scrivere una truffa. Il bilancio dipende da regole, controlli e da come la usa ciascuno.'], ['Cosa pensano gli esperti dell\'intelligenza artificiale?', 'Sono divisi. Alcuni, come Geoffrey Hinton, temono che sistemi molto avanzati sfuggano al controllo; altri, come Yann LeCun, ritengono questi timori esagerati. Quasi tutti concordano che servano regole e controlli.']],
    sources: [] },

  { slug: 'perche-intelligenza-artificiale-consuma-acqua-energia', img: 'art-06.webp',
    title: 'Perché l\'AI consuma acqua ed energia? Per raffreddare i data center',
    card: 'Data center, elettricità e raffreddamento: quanto inquina davvero l\'AI.',
    desc: 'L\'AI (o IA) consuma acqua perché i data center che la fanno funzionare si scaldano e vanno raffreddati, e consuma energia per miliardi di calcoli. Quanto consumano, perché inquina e cosa si sta facendo.',
    lede: 'In breve: l\'intelligenza artificiale (AI o IA) gira in enormi edifici pieni di computer, i data center. Quei computer consumano molta elettricità e si scaldano, e per raffreddarli si usa acqua, che in parte evapora. Altra acqua la consumano le centrali che producono l\'energia.',
    brief: ['L\'AI gira in data center che consumano molta elettricità.', 'L\'acqua serve a raffreddare i computer, direttamente o tramite le centrali elettriche.', 'L\'impatto dipende da quale energia alimenta gli impianti.'],
    sections: [
      ['Perché l\'intelligenza artificiale consuma energia elettrica', 'Ogni risposta di un chatbot è il risultato di miliardi di calcoli eseguiti da processori molto potenti, le <a href="../glossario/#gpu">GPU</a>, ospitati in <a href="../glossario/#data-center">data center</a>. L\'energia serve in due momenti: l\'<a href="../glossario/#addestramento">addestramento</a> dei modelli, che dura settimane, e l\'uso quotidiano, che consuma meno per singola richiesta ma si ripete miliardi di volte.'],
      ['Quanto consuma', 'Secondo l\'Agenzia internazionale dell\'energia (IEA), nel 2024 i data center di tutto il mondo hanno consumato circa 415 terawattora, l\'1,5% dell\'elettricità mondiale: più di quanto consuma l\'Italia in un anno. Entro il 2030 potrebbero arrivare a circa 945 terawattora, poco più dell\'intero consumo attuale del Giappone, e la spinta principale viene dall\'AI. Quanto pesi una singola richiesta dipende invece dal modello e da come si misura: i numeri che circolano vanno sempre letti con la fonte accanto.',
        { caption: 'Elettricità consumata dai data center nel mondo (stime IEA)', head: ['Anno', 'Consumo', 'Quota sul totale mondiale'],
          rows: [['2024', 'circa 415 TWh', 'circa 1,5%'], ['2030 (previsione)', 'circa 945 TWh', 'quasi 3%']] }],
      ['Perché l\'AI consuma acqua', 'I computer producono calore e vanno raffreddati. Molti impianti usano sistemi ad acqua, parte della quale evapora. Altra acqua viene consumata indirettamente, dalle centrali che producono l\'elettricità. La quantità cambia molto con il clima del luogo e la tecnologia: per questo i nuovi data center sono spesso contestati dove l\'acqua scarseggia.'],
      ['L\'acqua usata dall\'AI dove finisce', 'Non tutta va persa. Una parte dell\'acqua prelevata dai data center torna, più calda, a fiumi e reti; la parte che evapora nelle torri di raffreddamento invece è consumata davvero, e pesa di più dove l\'acqua scarseggia. Per questo i rapporti delle aziende distinguono tra acqua <strong>prelevata</strong> e acqua <strong>consumata</strong>: quando leggi un numero, controlla quale dei due è. Alcuni impianti nuovi usano circuiti chiusi o raffreddamento ad aria, che consumano molta meno acqua ma più elettricità.'],
      ['Quanta acqua consuma una domanda a ChatGPT o Gemini', 'Poca, ma non zero. Secondo Google (agosto 2025) una richiesta tipica di testo a Gemini consuma circa 0,26 millilitri d\'acqua, cinque gocce, e 0,24 wattora di elettricità. Secondo Sam Altman (giugno 2025) una domanda media a ChatGPT usa circa 0,3 millilitri e 0,34 wattora, ma OpenAI non ha spiegato come li ha calcolati. Uno studio dell\'Università della California a Riverside (2023) stimava invece circa mezzo litro ogni 10-50 risposte del vecchio GPT-3, contando anche l\'acqua delle centrali elettriche. I numeri sono così diversi perché cambiano modello, data center e cosa si conta. L\'AI spreca acqua? La singola domanda no; il problema è la somma di miliardi di domande, concentrata in pochi luoghi.',
        { caption: 'Una domanda all\'AI: le stime a confronto', head: ['Chi lo dice', 'Acqua', 'Elettricità', 'Cosa conta'],
          rows: [['Google, Gemini (agosto 2025)', '0,26 ml', '0,24 Wh', 'Richiesta di testo tipica, dato dell\'azienda'],
            ['OpenAI, ChatGPT (giugno 2025)', 'circa 0,3 ml', '0,34 Wh', 'Media dichiarata, metodo non pubblicato'],
            ['Università della California, GPT-3 (2023)', 'circa 0,5 litri ogni 10-50 risposte', 'non indicata', 'Stima indipendente, conta anche l\'acqua delle centrali']] }],
      ['Testo, immagini e video non consumano allo stesso modo', 'Una risposta di testo è l\'uso più leggero. Generare un\'immagine richiede molti più calcoli: in uno studio di Hugging Face e Carnegie Mellon (2023) i modelli che creano immagini consumavano in media decine di volte più energia di quelli che classificano o scrivono testo. I video, fatti di molte immagini in sequenza, pesano ancora di più. Anche il tipo di modello conta: i modelli "che ragionano" passo per passo producono molto più testo nascosto prima di rispondere, e quindi consumano di più per ogni domanda.'],
      ['Come leggere un numero sul consumo dell\'AI', 'Quando incontri una cifra su acqua o energia, cinque domande evitano i fraintendimenti. È acqua <strong>prelevata</strong> o <strong>consumata</strong>? Riguarda una singola richiesta o il totale di un anno? Include solo l\'uso quotidiano o anche l\'<a href="../glossario/#addestramento">addestramento</a>? Conta anche l\'acqua delle centrali elettriche, oppure solo quella del data center? Viene dall\'azienda che vende il servizio o da un\'analisi indipendente? Due numeri che sembrano in contrasto spesso rispondono a domande diverse, ed è il motivo per cui le stime citate sopra differiscono di molto.'],
      ['Perché il problema è soprattutto locale', 'Il consumo mondiale di acqua dell\'AI è piccolo rispetto ad agricoltura e industria, ma un singolo data center può pesare molto su una città o una valle con poca acqua. Contano quindi dove viene costruito, che tipo di raffreddamento usa e se l\'acqua è potabile o riciclata. È anche per questo che nuovi impianti e nuovi accordi con i comuni finiscono spesso tra le notizie: la discussione riguarda risorse condivise da chi vive vicino.'],
      ['Cosa puoi fare tu', 'Le scelte del singolo pesano poco rispetto a quelle delle aziende, ma qualcosa si può fare: usare un modello piccolo o veloce per le domande semplici, scrivere una richiesta chiara invece di rigenerare dieci volte la risposta, non creare immagini e video solo per curiosità. E soprattutto informarsi su dove e con quale energia vengono costruiti i nuovi data center, che è dove si decide davvero l\'impatto.'],
      ['L\'AI inquina?', 'Dipende dall\'energia che la alimenta. Un data center collegato a fonti rinnovabili ha un impatto molto diverso da uno alimentato a gas o carbone. Le grandi aziende stanno firmando contratti per solare, eolico e nucleare, ma hanno anche riconosciuto che l\'AI rende più difficile rispettare i propri obiettivi sulle emissioni.'],
      ['Il ruolo dell\'AI nel risparmio energetico', 'La stessa tecnologia viene usata per prevedere la produzione di sole e vento, bilanciare le reti elettriche e ridurre gli sprechi in edifici e fabbriche. Se il bilancio finale sarà positivo non è ancora deciso. FAIND segue il tema ogni giorno nella pagina <a href="../temi/ai-clima-ambiente.html">AI, clima e ambiente</a>.']
    ],
    faq: [['Perché l\'intelligenza artificiale consuma acqua?', 'Perché i computer dei data center producono calore e molti impianti li raffreddano con acqua. Altra acqua è usata dalle centrali che generano l\'elettricità.'], ['Quanta acqua consuma una domanda all\'AI?', 'Secondo i dati delle aziende, tra 0,26 e 0,3 millilitri per una richiesta di testo, cioè poche gocce. Stime indipendenti più vecchie arrivavano a mezzo litro ogni 10-50 risposte, contando anche l\'acqua delle centrali.'], ['Usare ChatGPT inquina?', 'Ogni richiesta consuma poca energia, ma moltiplicata per miliardi di utilizzi diventa rilevante. L\'impatto dipende dall\'efficienza del data center e dalla fonte di energia.'], ['L\'AI spreca acqua?', 'La singola domanda no: consuma poche gocce. Il problema è la somma di miliardi di richieste, concentrata in pochi data center, a volte in zone dove l\'acqua scarseggia.'], ['Perché l\'IA consuma così tanta acqua?', 'Perché i data center lavorano giorno e notte e il calore va smaltito di continuo: molti impianti usano torri di raffreddamento in cui l\'acqua evapora. Più cresce l\'uso dell\'AI, più crescono calcoli, calore e acqua.'], ['Quanta energia consuma l\'AI nel mondo?', 'Secondo l\'IEA tutti i data center del mondo hanno consumato circa 415 terawattora nel 2024, l\'1,5% dell\'elettricità mondiale, e potrebbero superare i 900 terawattora entro il 2030 soprattutto per l\'AI.'], ['Generare immagini consuma più del testo?', 'Sì, molto di più: creare un\'immagine richiede decine di volte l\'energia di una risposta di testo, e i video ancora di più.']],
    sources: ['Agenzia internazionale dell\'energia (IEA), "Energy and AI" (2025)', 'Google, studio sull\'impatto ambientale di Gemini (agosto 2025)', 'Sam Altman, "The Gentle Singularity" (giugno 2025)', 'Li e altri, "Making AI Less Thirsty", Università della California a Riverside (2023)', 'Luccioni, Jernite e Strubell, "Power Hungry Processing", Hugging Face e Carnegie Mellon (2023)'], updated: '2026-10-20' },

  { slug: 'intelligenza-artificiale-e-affidabile', img: 'art-07.webp',
    title: 'L\'intelligenza artificiale è affidabile? Sì per i testi, no per i fatti',
    card: 'Perché l\'AI sbaglia con tono sicuro e come capire quando fidarsi.',
    desc: 'L\'intelligenza artificiale è affidabile per riassumere, tradurre e spiegare, molto meno su numeri, date e citazioni, dove può inventare. Quanto è attendibile, quando fidarsi e come verificare ChatGPT, Claude e Gemini.',
    lede: 'In breve: l\'intelligenza artificiale è attendibile quando lavora su testi che le dai tu (riassumere, tradurre, riscrivere), molto meno quando deve ricordare fatti, numeri, date e citazioni, che a volte inventa con tono sicuro. E non avvisa quando sbaglia: la verifica resta a chi la usa.',
    brief: ['L\'AI può inventare fatti, date e citazioni: si chiamano allucinazioni.', 'È più affidabile su testi che le fornisci tu che su fatti che deve ricordare.', 'La verifica resta sempre a chi la usa.'],
    sections: [
      ['Perché l\'intelligenza artificiale può sbagliare', 'Un modello linguistico non consulta un archivio di fatti: genera la risposta più plausibile. Quando non sa, non dice "non lo so": costruisce una risposta verosimile. È ciò che si chiama <a href="../glossario/#allucinazione">allucinazione</a>. Il caso più citato è quello di alcuni avvocati sanzionati negli Stati Uniti per aver depositato atti con precedenti inesistenti, inventati da un chatbot.'],
      ['Quando è affidabile', 'Funziona bene quando lavora su materiale che le dai tu: riassumere un documento, riscrivere un testo, tradurre, mettere ordine in appunti, spiegare un concetto noto. Funziona meglio anche quando cerca sul web e cita le fonti, perché le puoi controllare.'],
      ['Quando non lo è', 'È meno affidabile su numeri, date, citazioni, nomi, norme di legge, notizie recenti e calcoli complessi. E in tutto ciò che riguarda salute, soldi e questioni legali, dove un errore ha conseguenze: lì può aiutare a capire, ma non a decidere.',
        { caption: 'Quando fidarsi dell\'AI: una guida rapida', head: ['Compito', 'Affidabilità', 'Cosa fare'],
          rows: [['Riassumere un testo che le dai tu', 'Alta', 'Rileggi i passaggi più importanti'],
            ['Tradurre o riscrivere', 'Alta', 'Controlla nomi, numeri e termini tecnici'],
            ['Spiegare un concetto noto', 'Buona', 'Confronta con una fonte affidabile'],
            ['Numeri, date, citazioni, nomi', 'Bassa', 'Verifica sempre su una fonte ufficiale'],
            ['Notizie recenti', 'Bassa senza ricerca web', 'Chiedi i link e aprili'],
            ['Salute, soldi, questioni legali', 'Non per decidere', 'Usala per capire, poi senti un professionista']] }],
      ['Perché sembra sicura anche quando sbaglia', 'L\'AI non ha un "tono" diverso quando non sa: scrive sempre in modo fluido e convinto. Secondo una ricerca pubblicata da OpenAI nel settembre 2025, una parte del problema nasce da come i modelli vengono addestrati e valutati: i test premiano chi tira a indovinare più di chi ammette di non sapere, proprio come un compito in classe in cui la risposta in bianco vale zero. Per questo un modello tende a dare comunque una risposta, anche quando la cosa più onesta sarebbe dire "non lo so".'],
      ['Tre errori che hanno fatto notizia', 'Nel febbraio 2023 Bard, il primo chatbot di Google, nel suo video di presentazione attribuì al telescopio James Webb la prima foto di un pianeta fuori dal sistema solare, che invece era stata scattata anni prima da un altro telescopio. Nel giugno 2023 un giudice di New York multò due avvocati che avevano citato in tribunale sentenze inventate da ChatGPT (caso Mata contro Avianca). Nel febbraio 2024 un tribunale canadese ha obbligato Air Canada a rimborsare un cliente a cui il chatbot della compagnia aveva promesso uno sconto per lutto con una regola di rimborso che non esisteva: l\'azienda è responsabile di quello che dice il suo assistente.'],
      ['L\'intelligenza artificiale è sicura?', 'Sicurezza vuol dire anche dati. Ciò che scrivi a un chatbot viene elaborato sui server dell\'azienda e, secondo le impostazioni, può essere usato per migliorare i modelli. Meglio non inserire dati personali altrui, documenti riservati o credenziali, e controllare le impostazioni sulla privacy.'],
      ['Quanto sbaglia: i numeri', 'Due studi aiutano a misurarlo. Nell\'ottobre 2025 22 servizi radiotelevisivi pubblici di 18 Paesi, coordinati da EBU e BBC, hanno controllato oltre 3.000 risposte di ChatGPT, Copilot, Gemini e Perplexity sulle notizie: il 45% conteneva almeno un errore importante, spesso nelle fonti citate. Nell\'aprile 2025 OpenAI ha dichiarato che i suoi modelli o3 e o4-mini inventavano informazioni nel 33% e nel 48% delle risposte a un test di domande su persone reali. Sono prove diverse e i modelli cambiano in fretta, ma il messaggio è lo stesso: su fatti e notizie l\'errore non è raro.'],
      ['I quattro tipi di errore', 'Non tutti gli sbagli sono uguali. L\'<strong>invenzione</strong> è il più noto: una sentenza, una citazione o un dato che non esistono. Poi ci sono gli <strong>errori di calcolo e di logica</strong>: un modello linguistico non fa i conti come una calcolatrice, li stima, e su passaggi lunghi può perdersi. Terzo, l\'<strong>informazione superata</strong>: il modello conosce il mondo fino alla data in cui è stato addestrato, e senza una ricerca sul web non sa cosa è successo dopo. Infine i <strong>pregiudizi</strong>: se i testi su cui ha imparato sono sbilanciati, lo sono anche le risposte.'],
      ['Cinque controlli prima di fidarti', '1) Il tema è salute, soldi o legge? Allora la risposta è solo un punto di partenza. 2) Contiene numeri, date o nomi? Verificali su una fonte ufficiale. 3) Cita fonti? Apri i link e controlla che dicano davvero quello che l\'AI riporta. 4) Riguarda fatti recenti? Controlla che lo strumento abbia cercato sul web. 5) Ti sembra troppo comoda? Rifai la domanda in un altro modo: se la risposta cambia, non è solida.'],
      ['Come verificare una risposta', 'Chiedi le fonti e aprile. Controlla numeri e citazioni su un sito ufficiale. Rifai la domanda in un altro modo, o a un\'altra AI: se le risposte cambiano, c\'è da dubitare. E ricorda che una risposta ben scritta non è per forza una risposta giusta. Per foto, audio e video che sembrano veri, vedi <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">come riconoscere i contenuti fatti con l\'AI</a>.']
    ],
    faq: [['L\'intelligenza artificiale può sbagliare?', 'Sì. Può inventare informazioni false presentandole con sicurezza, soprattutto su fatti, numeri e citazioni. Per questo le risposte vanno verificate.'], ['Ci si può fidare di ChatGPT?', 'Per riassumere, riscrivere e spiegare sì, con un controllo finale. Per decisioni su salute, denaro e questioni legali serve sempre un professionista.'], ['Quanto è attendibile l\'intelligenza artificiale?', 'Molto quando lavora su testi che le dai tu, molto meno su fatti e notizie: in uno studio europeo del 2025 il 45% delle risposte sulle notizie conteneva almeno un errore importante. Va usata con una verifica finale.'], ['L\'intelligenza artificiale dice sempre la verità?', 'No. Non mente di proposito, ma genera la risposta più plausibile, e quando non sa può inventare con tono sicuro. Per questo conviene chiedere le fonti e aprirle.'], ['Perché l\'AI inventa le fonti?', 'Perché non cerca in un archivio ma genera il testo più probabile: un titolo di articolo o una sentenza "verosimili" possono uscire anche se non esistono. Le AI che cercano sul web e mostrano i link sbagliano meno, ma i link vanno comunque aperti.'], ['Chi è responsabile se l\'AI sbaglia?', 'Chi la usa e, in molti casi, chi la offre: nel 2024 un tribunale canadese ha dato torto ad Air Canada per una regola di rimborso inventata dal suo chatbot. Per questo le aziende serie chiedono sempre una verifica umana.']],
    sources: ['EBU e BBC, "News Integrity in AI Assistants" (ottobre 2025)', 'OpenAI, scheda tecnica di o3 e o4-mini (aprile 2025)', 'OpenAI, "Why language models hallucinate" (settembre 2025)', 'Tribunale distrettuale di New York, Mata contro Avianca (giugno 2023)', 'Civil Resolution Tribunal della British Columbia, Moffatt contro Air Canada (febbraio 2024)'], updated: '2026-10-20' },

  { slug: 'intelligenza-artificiale-gratis-o-a-pagamento', img: 'art-08.webp',
    title: 'L\'intelligenza artificiale è gratis o a pagamento?',
    card: 'Cosa si può fare senza pagare e quando conviene un abbonamento.',
    desc: 'L\'intelligenza artificiale è gratis o a pagamento? Cosa offrono i piani gratuiti di ChatGPT, Claude e Gemini, quanto costano gli abbonamenti e quando conviene pagare.',
    lede: 'Tutte e due le cose. Ogni grande assistente ha un piano gratuito e uno o più piani a pagamento. La domanda utile non è se è gratis, ma che cosa perdi restando sul piano gratuito.',
    brief: ['ChatGPT, Claude, Gemini, Copilot e Perplexity hanno tutti un piano gratuito.', 'Il piano standard costa circa 20 dollari al mese quasi ovunque.', 'Pagare conviene solo se raggiungi spesso i limiti del piano gratuito.'],
    sections: [
      ['Cosa si può fare gratis', 'Molto: scrivere e correggere testi, riassumere, tradurre, farsi spiegare un argomento, generare qualche immagine. I limiti riguardano il numero di richieste, l\'accesso ai modelli più potenti e alcune funzioni avanzate. Per imparare e per un uso occasionale il piano gratuito basta.'],
      ['Quanto costano gli abbonamenti', 'Il piano standard costa circa 20 dollari al mese: ChatGPT Plus, Claude Pro e Perplexity Pro a 20, Google AI Pro e Microsoft 365 Premium a 19,99. Esistono ingressi più economici, come Google AI Plus a 4,99 e ChatGPT Go a 8, e piani professionali da 100 a 300 dollari. Tutti i prezzi aggiornati, dal più caro al più economico, sono nella pagina <a href="../confronto/">Le AI a confronto</a>.'],
      ['Quando conviene pagare', 'Quando usi l\'AI ogni giorno per lavoro e il piano gratuito ti ferma, quando ti servono documenti lunghi o molte immagini, quando vuoi i modelli più recenti. Se la usi qualche volta a settimana, pagare non cambia quasi nulla.'],
      ['Le alternative gratuite', 'Ci sono assistenti interamente gratuiti e <a href="../glossario/#open-source">modelli aperti</a> che si possono scaricare e usare sul proprio computer, senza abbonamento e senza inviare dati a nessuno. Richiedono un po\' più di pratica e un computer recente; i link ufficiali sono nella sezione <a href="../#guide">Guide e download</a>.'],
      ['Attenzione al prezzo nascosto', 'Gratis non significa senza costo: alcuni piani gratuiti mostrano pubblicità o usano le conversazioni per migliorare i modelli, salvo diversa impostazione. Vale la pena leggere cosa accetti.']
    ],
    faq: [['L\'intelligenza artificiale è gratis?', 'Sì nella versione base: tutti i principali assistenti hanno un piano gratuito con limiti di utilizzo. Le funzioni avanzate sono a pagamento.'], ['Quanto costa ChatGPT?', 'Ha un piano gratuito, ChatGPT Go a 8 dollari al mese, Plus a 20 e piani Pro da 100 a 200 dollari. I prezzi possono cambiare: sono verificati nella pagina di confronto.']],
    sources: [] },

  { slug: 'leggi-intelligenza-artificiale-nel-mondo', img: 'art-09.webp',
    title: 'Leggi sull\'intelligenza artificiale nel mondo',
    card: 'Europa, Italia, Stati Uniti, Cina: chi regola l\'AI e come.',
    desc: 'Le leggi sull\'intelligenza artificiale nel mondo: l\'AI Act europeo e i livelli di rischio, la legge italiana, l\'approccio di Stati Uniti, Cina, Regno Unito e degli altri Paesi.',
    lede: 'Non esiste una legge mondiale sull\'intelligenza artificiale. Esistono approcci diversi: l\'Europa regola in base al rischio, gli Stati Uniti puntano sul mercato, la Cina sul controllo. Ecco la mappa.',
    brief: ['L\'Unione europea ha la prima legge organica al mondo: l\'AI Act.', 'L\'Italia ha una propria legge nazionale che affianca quella europea.', 'Stati Uniti e Cina seguono strade molto diverse.'],
    sections: [
      ['Unione europea: l\'AI Act', 'L\'<a href="../glossario/#ai-act">AI Act</a> è in vigore dal 2024 e si applica per gradi. Classifica i sistemi di AI in base al rischio: <strong>inaccettabile</strong> (vietati, come il punteggio sociale dei cittadini), <strong>alto</strong> (ammessi con obblighi severi, per esempio in sanità, lavoro, istruzione, giustizia), <strong>limitato</strong> (obblighi di trasparenza, come dichiarare che si parla con un chatbot o che un contenuto è artificiale) e <strong>minimo</strong> (nessun obbligo). Regole specifiche riguardano i grandi modelli di uso generale.'],
      ['Italia', 'L\'Italia ha approvato nel 2025 una legge nazionale sull\'intelligenza artificiale che affianca il regolamento europeo: riguarda tra l\'altro sanità, lavoro, pubblica amministrazione, giustizia e diritto d\'autore, e introduce norme penali contro i deepfake dannosi. Le autorità di riferimento sono l\'Agenzia per l\'Italia digitale e l\'Agenzia per la cybersicurezza nazionale.'],
      ['Stati Uniti', 'Non c\'è una legge federale organica. Le regole arrivano da ordini esecutivi del presidente, che cambiano con le amministrazioni, dalle agenzie di settore e dai singoli Stati, alcuni dei quali hanno approvato leggi proprie. L\'impostazione generale privilegia l\'innovazione e la competizione con la Cina.'],
      ['Cina', 'La Cina ha introdotto regole mirate su singoli ambiti: algoritmi di raccomandazione, contenuti sintetici e servizi di AI generativa, con obblighi di registrazione e di etichettatura dei contenuti generati. Il controllo statale è più diretto che altrove.'],
      ['Regno Unito e altri Paesi', 'Il Regno Unito ha scelto finora di non fare una legge unica, affidando le regole alle autorità di settore. Giappone e Corea del Sud hanno approvato leggi quadro orientate a promuovere lo sviluppo. A livello internazionale esistono principi condivisi, come quelli dell\'OCSE, e una convenzione del Consiglio d\'Europa su AI e diritti umani, ma nessun trattato vincolante per tutti.'],
      ['Perché riguarda anche te', 'Le regole europee si applicano a chiunque offra servizi di AI nell\'Unione, anche se l\'azienda ha sede altrove. Per questo alcune funzioni arrivano in Europa più tardi. Le notizie su leggi e regole sono raccolte ogni ora nella home di FAIND, nel settore "Leggi e regole".']
    ],
    faq: [['Esiste una legge sull\'intelligenza artificiale in Italia?', 'Sì. Oltre al regolamento europeo AI Act, direttamente applicabile, l\'Italia ha approvato nel 2025 una legge nazionale sull\'intelligenza artificiale.'], ['Come vengono classificati i sistemi di AI secondo l\'AI Act?', 'In quattro livelli di rischio: inaccettabile (vietati), alto (obblighi severi), limitato (obblighi di trasparenza) e minimo (nessun obbligo).']],
    sources: ['Regolamento (UE) 2024/1689, "AI Act"', 'Legge italiana sull\'intelligenza artificiale (2025)'] },

  { slug: 'come-riconoscere-audio-foto-video-intelligenza-artificiale', img: 'art-10.webp',
    title: 'Come riconoscere audio, foto e video fatti con l\'intelligenza artificiale',
    card: 'I segnali da guardare e i controlli da fare prima di credere, o condividere.',
    desc: 'Come riconoscere una foto, un video o un audio generati con l\'intelligenza artificiale: i segnali visivi e sonori, i rilevatori di AI, la verifica delle fonti e come difendersi dai deepfake.',
    lede: 'I contenuti generati con l\'AI sono sempre più difficili da distinguere a occhio. Ma esistono segnali da cercare e, soprattutto, controlli che funzionano anche quando l\'occhio non basta.',
    brief: ['I difetti visibili diminuiscono a ogni nuova versione: l\'occhio non basta.', 'Il controllo più efficace è sulla fonte, non sull\'immagine.', 'I rilevatori automatici aiutano ma sbagliano: non sono una prova.'],
    sections: [
      ['Come riconoscere una foto fatta con l\'AI', 'Guarda i dettagli: mani e dita, denti, orecchini diversi tra loro, scritte illeggibili sullo sfondo, ombre e riflessi incoerenti, pelle troppo liscia, oggetti che si fondono tra loro. Sono indizi utili, ma i modelli recenti ne commettono sempre meno.'],
      ['Come riconoscere un video', 'Osserva il sincronismo tra labbra e voce, i battiti di ciglia, i bordi del volto quando la persona gira la testa, gli sfarfallii nei capelli e nello sfondo, i movimenti del corpo che non tornano. Nei video brevi e a bassa risoluzione è più difficile.'],
      ['Come riconoscere un audio generato con l\'AI', 'Le voci clonate tendono a essere uniformi: poca variazione di tono, pause innaturali, respiri assenti, nessun rumore di fondo. È il terreno delle truffe telefoniche con la voce di un familiare. La difesa migliore è pratica: riagganciare e richiamare il numero che conosci, o concordare in famiglia una parola di sicurezza.'],
      ['Il controllo che funziona di più: la fonte', 'Chi ha pubblicato per primo quel contenuto? Lo riportano testate affidabili? Con la ricerca inversa per immagini puoi vedere dove e quando è comparsa una foto. Se un contenuto clamoroso esiste solo su un profilo sconosciuto, il dubbio è d\'obbligo.'],
      ['Rilevatori di AI ed etichette', 'Esistono strumenti che stimano se un contenuto è artificiale, ma danno falsi positivi e falsi negativi: sono un indizio, non una prova. Più promettenti sono le etichette all\'origine: filigrane invisibili e "credenziali del contenuto" che registrano come è stato creato un file. In Europa l\'<a href="../glossario/#ai-act">AI Act</a> prevede l\'obbligo di segnalare i <a href="../glossario/#deepfake">deepfake</a>.'],
      ['Prima di condividere', 'Se un contenuto ti fa arrabbiare o ti sorprende molto, fermati un momento: è proprio l\'effetto che cerca chi lo ha fabbricato. Per i rischi più ampi, vedi <a href="intelligenza-artificiale-e-pericolosa.html">l\'intelligenza artificiale è pericolosa?</a>']
    ],
    faq: [['Come capire se una foto è fatta con l\'intelligenza artificiale?', 'Controlla mani, scritte, ombre e riflessi, ma soprattutto verifica la fonte con una ricerca inversa per immagini: i difetti visibili sono sempre meno.'], ['I rilevatori di AI sono affidabili?', 'Solo in parte. Possono sbagliare in entrambi i sensi, quindi vanno usati come indizio insieme alla verifica della fonte.']],
    sources: [] },

  { slug: 'cos-e-intelligenza-artificiale-come-funziona', img: 'art-11.webp',
    title: 'Cos\'è l\'intelligenza artificiale e come funziona, spiegato semplice',
    card: 'Cosa vuol dire, come impara una macchina e perché a volte sbaglia.',
    desc: 'Cos\'è l\'intelligenza artificiale (AI o IA) e come funziona, spiegato in parole semplici: come impara dai dati, cosa sono machine learning e modelli linguistici, dove la usi già e quali sono i suoi limiti.',
    lede: 'In breve: l\'intelligenza artificiale (AI o IA) è un insieme di programmi che svolgono compiti che di solito richiedono intelligenza umana, come capire una frase, riconoscere un volto o scrivere un testo. Non segue regole scritte a mano: impara da enormi quantità di esempi.',
    brief: ['L\'AI impara da esempi invece che da regole scritte a mano.', 'ChatGPT, Gemini e Claude sono modelli linguistici: prevedono la parola successiva più probabile.', 'È potente ma non capisce come una persona: può sbagliare con sicurezza.'],
    sections: [
      ['Cos\'è l\'intelligenza artificiale, in parole semplici', 'È la capacità di un computer di fare cose che consideriamo intelligenti: riconoscere immagini, capire e produrre linguaggio, prendere decisioni, fare previsioni. Il nome nasce nel 1956, per un convegno al Dartmouth College negli Stati Uniti. Per decenni è rimasta materia da laboratorio; dal 2022, con ChatGPT, è entrata nella vita di tutti. AI viene dall\'inglese <em>artificial intelligence</em>, IA dall\'italiano: sono la stessa cosa.'],
      ['Come funziona: impara dagli esempi', 'Un programma tradizionale segue istruzioni scritte da un programmatore. Un sistema di AI invece viene <a href="../glossario/#addestramento">addestrato</a>: gli si mostrano milioni di esempi e lui regola da solo miliardi di numeri interni, i <a href="../glossario/#parametri">parametri</a>, finché le sue risposte si avvicinano a quelle giuste. Per riconoscere un gatto non gli si spiega cos\'è un gatto: gli si mostrano moltissime foto di gatti. Questo metodo si chiama <a href="../glossario/#machine-learning">machine learning</a>, apprendimento automatico; la sua versione più potente, basata su <a href="../glossario/#rete-neurale">reti neurali</a> a molti strati, è il <a href="../glossario/#deep-learning">deep learning</a>.'],
      ['Come funzionano ChatGPT, Gemini e Claude', 'Sono <a href="../glossario/#llm">modelli linguistici di grandi dimensioni</a>: hanno letto una parte enorme dei testi disponibili e hanno imparato a prevedere, parola dopo parola, il seguito più probabile. Dopo questa fase vengono rifiniti con esempi di conversazioni e con il giudizio di persone che valutano le risposte. Il risultato scrive in modo fluente su quasi tutto, ma non consulta un archivio di fatti: per questo a volte inventa. Ne parliamo in <a href="intelligenza-artificiale-e-affidabile.html">l\'AI è affidabile?</a>'],
      ['Dove la usi già senza saperlo', 'Nei suggerimenti di film e canzoni, nei filtri antispam, nello sblocco del telefono con il volto, nelle traduzioni automatiche, nelle mappe che calcolano il traffico, nella fotocamera che migliora le foto. L\'<a href="../glossario/#ai-generativa">AI generativa</a>, quella che crea testi, immagini e video, è solo la parte più recente e visibile.'],
      ['AI specializzata e AI generale', 'Tutti i sistemi che esistono oggi sono specializzati: bravissimi in alcuni compiti, incapaci fuori da quelli. L\'idea di un\'AI capace di fare tutto ciò che fa una persona si chiama <a href="../glossario/#agi">intelligenza artificiale generale</a> (AGI): alcune aziende dicono di puntarci, molti ricercatori dubitano che sia vicina. In ogni caso l\'AI di oggi non ha coscienza né intenzioni.'],
      ['Cosa sa fare e cosa no', 'Sa riassumere, tradurre, scrivere, programmare, analizzare dati, riconoscere immagini e voci. Non sa verificare da sola se ciò che dice è vero, non ha esperienza del mondo e riflette i difetti dei dati da cui ha imparato. Per cominciare c\'è la guida <a href="imparare-a-usare-intelligenza-artificiale.html">come usare l\'intelligenza artificiale</a>; per i pro e i contro, <a href="intelligenza-artificiale-rischi-e-vantaggi.html">vantaggi e svantaggi</a>.']
    ],
    faq: [['Cos\'è l\'intelligenza artificiale in parole semplici?', 'Sono programmi che imparano da molti esempi a svolgere compiti tipici dell\'intelligenza umana, come capire il linguaggio, riconoscere immagini o prendere decisioni.'], ['Come funziona l\'intelligenza artificiale?', 'Viene addestrata su grandi quantità di dati: regola da sola miliardi di parametri finché le sue risposte si avvicinano a quelle corrette. I chatbot come ChatGPT prevedono la parola successiva più probabile.'], ['Che differenza c\'è tra AI e IA?', 'Nessuna. AI è la sigla inglese (artificial intelligence), IA quella italiana (intelligenza artificiale).'], ['Chi ha inventato l\'intelligenza artificiale?', 'Non c\'è un solo inventore. Il nome fu proposto da John McCarthy per un convegno al Dartmouth College nel 1956; Alan Turing ne aveva posto le basi teoriche nel 1950.']],
    sources: ['J. McCarthy e altri, proposta per il convegno di Dartmouth sull\'intelligenza artificiale (1955)', 'A. M. Turing, "Computing Machinery and Intelligence" (1950)'] },

  { slug: 'cos-e-chatgpt-come-funziona', img: 'art-12.webp',
    title: 'Cos\'è ChatGPT, come funziona e come si usa',
    card: 'Cosa fa, quanto costa, come iniziare e a cosa stare attenti.',
    desc: 'Cos\'è ChatGPT e come funziona: chi lo ha creato, cosa sa fare, come si usa gratis da sito e app, quanto costano Go, Plus e Pro e i limiti da conoscere su errori e privacy.',
    lede: 'In breve: ChatGPT è un assistente di intelligenza artificiale creato da OpenAI con cui si parla scrivendo o a voce, come in una chat. Risponde a domande, scrive e corregge testi, riassume, traduce, legge file e immagini. Si usa gratis dal sito chatgpt.com o dall\'app.',
    brief: ['È un chatbot di OpenAI, uscito il 30 novembre 2022.', 'Si usa gratis; Plus costa 20 dollari al mese.', 'Può sbagliare con sicurezza: le risposte su fatti e numeri vanno verificate.'],
    sections: [
      ['Cos\'è ChatGPT', 'È un programma di conversazione, un <a href="../glossario/#chatbot">chatbot</a>, sviluppato dall\'azienda americana OpenAI e lanciato il 30 novembre 2022. Secondo una stima della banca UBS ha raggiunto 100 milioni di utenti in due mesi, una crescita mai vista prima per un servizio digitale; nell\'agosto 2026 OpenAI ha dichiarato più di un miliardo di utenti a settimana. Il nome viene da GPT, <em>Generative Pre-trained Transformer</em>, la famiglia di modelli su cui si basa.'],
      ['Come funziona', 'ChatGPT si basa su un <a href="../glossario/#llm">modello linguistico</a> addestrato su enormi quantità di testo: data una domanda, costruisce la risposta prevedendo una parola dopo l\'altra. Poi è stato rifinito con il giudizio di persone che hanno valutato le risposte, per renderlo più utile e prudente. Oggi può anche cercare sul web e citare le fonti, leggere documenti e foto, generare immagini e parlare a voce. Per capire il meccanismo generale c\'è <a href="cos-e-intelligenza-artificiale-come-funziona.html">cos\'è l\'intelligenza artificiale e come funziona</a>.'],
      ['Come si usa ChatGPT', 'Si apre chatgpt.com o si scarica l\'app per iPhone o Android, si accede con un account e si scrive una richiesta. Più è precisa, meglio è: chi sei, cosa vuoi, su quale materiale, in che formato. Se la risposta non va bene si corregge continuando la conversazione. Capisce e risponde in italiano. Esempi e regole sono nella guida <a href="imparare-a-usare-intelligenza-artificiale.html">come usare l\'intelligenza artificiale</a>.'],
      ['Quanto costa', 'La versione gratuita basta per un uso quotidiano leggero. ChatGPT Go costa 8 dollari al mese, Plus 20, i piani Pro da 100 a 200 dollari al mese, con limiti più alti e accesso ai modelli più potenti. I prezzi aggiornati, confrontati con Claude, Gemini e gli altri, sono nella pagina <a href="../confronto/">Le AI a confronto</a>; se sei indeciso con Gemini, c\'è <a href="chatgpt-o-gemini-quale-scegliere.html">ChatGPT o Gemini: quale scegliere</a>.'],
      ['Cosa sa fare bene e cosa no', 'Bene: scrivere e correggere testi, riassumere documenti, tradurre, spiegare argomenti, aiutare a programmare, proporre idee. Male: numeri, date, citazioni e notizie recenti senza fonti, dove può inventare (si chiamano <a href="../glossario/#allucinazione">allucinazioni</a>). Per salute, soldi e questioni legali aiuta a capire, ma non sostituisce un professionista.'],
      ['ChatGPT e privacy', 'Le conversazioni vengono elaborate sui server di OpenAI e, salvo diversa impostazione, possono essere usate per migliorare i modelli: nelle impostazioni si può disattivare. In Italia il Garante della privacy bloccò temporaneamente ChatGPT nella primavera del 2023 e nel dicembre 2024 ha multato OpenAI per 15 milioni di euro. Meglio non inserire dati personali di altri, documenti riservati o password.']
    ],
    faq: [['ChatGPT è gratis?', 'Sì, c\'è una versione gratuita con limiti di utilizzo. I piani a pagamento partono da 8 dollari al mese (Go); Plus costa 20 dollari.'], ['Chi ha creato ChatGPT?', 'OpenAI, azienda americana con sede a San Francisco guidata da Sam Altman. ChatGPT è stato lanciato il 30 novembre 2022.'], ['Come si usa ChatGPT in italiano?', 'Basta scrivergli in italiano: capisce e risponde nella lingua in cui gli si scrive. Anche l\'interfaccia si può impostare in italiano.'], ['ChatGPT dice sempre la verità?', 'No. Può inventare informazioni con tono sicuro, soprattutto su fatti, numeri e citazioni. Le risposte importanti vanno verificate.']],
    sources: ['OpenAI, "Introducing ChatGPT" (30 novembre 2022)', 'Garante per la protezione dei dati personali, provvedimento sanzionatorio nei confronti di OpenAI (dicembre 2024)'] },

  { slug: 'chatgpt-o-gemini-quale-scegliere', img: 'art-13.webp',
    title: 'ChatGPT o Gemini: quale scegliere? Differenze, prezzi, pro e contro',
    card: 'I due assistenti più usati messi a confronto, senza tifo.',
    desc: 'ChatGPT o Gemini, quale scegliere? Le differenze tra i due assistenti AI più usati: cosa fa meglio ciascuno, prezzi dei piani gratuiti e a pagamento, integrazione con Google e iPhone e il consiglio per ogni tipo di uso.',
    lede: 'In breve: sono i due assistenti più usati al mondo e per l\'uso quotidiano si equivalgono. Gemini conviene a chi vive dentro Google (Gmail, Documenti, Android); ChatGPT a chi vuole l\'assistente più versatile. Il modo migliore per scegliere è provarli entrambi gratis sullo stesso compito.',
    brief: ['Per scrivere, riassumere e spiegare si equivalgono.', 'Gemini è integrato in Gmail, Documenti e Android; ChatGPT ha la gamma di funzioni più ampia.', 'Entrambi hanno un piano gratuito e uno da circa 20 dollari al mese.'],
    sections: [
      ['Chi sono', 'ChatGPT è di OpenAI ed è uscito nel novembre 2022; nell\'agosto 2026 OpenAI ha dichiarato più di un miliardo di utenti a settimana. Gemini è di Google, ha preso il posto di Bard nel 2024 e nell\'agosto 2026 Google ha dichiarato più di un miliardo di utenti al mese (i due numeri non sono confrontabili: uno è settimanale, l\'altro mensile). Sono due prodotti maturi, aggiornati di continuo: le classifiche su chi sia il migliore cambiano ogni pochi mesi.'],
      ['Dove è più forte ChatGPT', 'Nella versatilità: conversazione a voce molto naturale, memoria delle preferenze, progetti per organizzare il lavoro, generazione di immagini, una grande raccolta di assistenti personalizzati (i GPT) e l\'integrazione con Siri sugli iPhone più recenti. È anche lo strumento su cui escono più guide ed esempi, utile per chi inizia.'],
      ['Dove è più forte Gemini', 'Nell\'integrazione con Google: legge e riassume le mail di Gmail, lavora dentro Documenti, Fogli e Drive, usa Maps e YouTube ed è l\'assistente predefinito su molti telefoni Android. Ha accesso diretto alla ricerca Google e gestisce bene documenti e video lunghi. Il piano a pagamento Google AI Pro include anche spazio di archiviazione su Google Drive.'],
      ['Prezzi a confronto', 'Entrambi hanno un piano gratuito. ChatGPT: Go a 8 dollari al mese, Plus a 20, Pro da 100 a 200. Gemini: Google AI Plus a 4,99 e Google AI Pro a 19,99, con piani superiori per l\'uso professionale. I listini aggiornati, con Claude, Copilot, Perplexity e gli altri, sono nella pagina <a href="../confronto/">Le AI a confronto</a>.'],
      ['Quale scegliere', 'Se usi Gmail e un telefono Android ogni giorno, parti da Gemini. Se vuoi un assistente generale per scrivere, studiare e lavorare, o usi un iPhone, parti da ChatGPT. Se scrivi o analizzi testi lunghi, prova anche Claude. Il metodo resta lo stesso: dai a entrambi la stessa richiesta reale, una mail o un riassunto, e tieni quello che risponde meglio. Pagare conviene solo se raggiungi spesso i limiti gratuiti: ne parliamo in <a href="intelligenza-artificiale-gratis-o-a-pagamento.html">l\'AI è gratis o a pagamento?</a>'],
      ['Attenzione in entrambi i casi', 'Tutti e due possono sbagliare su fatti, numeri e notizie, e tutti e due possono usare le conversazioni per migliorare i modelli, salvo diversa impostazione. Le regole per verificare le risposte sono in <a href="intelligenza-artificiale-e-affidabile.html">l\'AI è affidabile?</a>; per capire come funziona ChatGPT, <a href="cos-e-chatgpt-come-funziona.html">cos\'è ChatGPT</a>.']
    ],
    faq: [['Meglio ChatGPT o Gemini?', 'Per l\'uso quotidiano si equivalgono. Gemini conviene a chi usa molto Gmail, Documenti e Android; ChatGPT a chi vuole l\'assistente più versatile. Provarli entrambi gratis sullo stesso compito è il modo migliore per scegliere.'], ['Gemini è gratis?', 'Sì, ha una versione gratuita. Google AI Plus costa 4,99 al mese e Google AI Pro 19,99, con più funzioni e spazio su Drive.'], ['Si possono usare insieme?', 'Sì, sono servizi indipendenti e le versioni gratuite non costano nulla: molti usano Gemini per mail e documenti e ChatGPT per il resto.']],
    sources: ['OpenAI, annuncio di un miliardo di utenti settimanali di ChatGPT (agosto 2026)', 'Google, annuncio di un miliardo di utenti mensili dell\'app Gemini (agosto 2026)'] },

  { slug: 'intelligenza-artificiale-a-scuola', img: 'art-14.webp',
    title: 'L\'intelligenza artificiale a scuola: regole, rischi e come usarla bene',
    card: 'Cosa dicono le linee guida del Ministero e come usarla per imparare davvero.',
    desc: 'L\'intelligenza artificiale a scuola: cosa prevedono le linee guida del Ministero dell\'Istruzione, come usarla per studiare senza copiare, i rischi per l\'apprendimento e la privacy e cosa possono fare docenti e genitori.',
    lede: 'In breve: dal settembre 2025 le scuole italiane hanno linee guida ufficiali sull\'intelligenza artificiale. Si può usare, ma con regole: il docente resta responsabile delle scelte educative, i dati degli studenti vanno protetti e l\'AI deve aiutare a imparare, non fare i compiti al posto dei ragazzi.',
    brief: ['Le linee guida del Ministero (decreto 166/2025) valgono da settembre 2025.', 'L\'AI non può decidere voti e valutazioni: restano al docente.', 'Usata come tutor aiuta; usata per copiare toglie proprio l\'apprendimento.'],
    sections: [
      ['Cosa dicono le linee guida del Ministero', 'Il Ministero dell\'Istruzione e del Merito ha adottato le linee guida con il decreto 166 del 9 agosto 2025, in vigore dal 2 settembre 2025. Si basano su quattro principi: centralità della persona, equità e inclusione, etica e responsabilità, trasparenza. L\'AI non può prendere decisioni educative, di valutazione o disciplinari: la responsabilità resta all\'insegnante. Le scuole che introducono strumenti di AI devono procedere per gradi, dalla prova in piccoli gruppi alla valutazione dei risultati, e condividere i progetti sulla piattaforma ministeriale Unica.'],
      ['Privacy e dati degli studenti', 'Le scuole devono verificare che i fornitori rispettino il GDPR e aggiornare le informative. Gli studenti, o le famiglie per i minorenni, hanno diritto a non far usare i propri dati per addestrare i sistemi, senza penalizzazioni e con un\'alternativa. Molti servizi hanno poi un\'età minima: ChatGPT, per esempio, non si può usare sotto i 13 anni e tra i 13 e i 18 serve il consenso dei genitori.'],
      ['Come usarla per studiare (senza copiare)', 'Funziona bene come tutor: farsi rispiegare un argomento con parole diverse, farsi interrogare prima di una verifica, chiedere esempi ed esercizi, controllare un ragionamento già fatto. Funziona male se le si chiede di fare il compito: il testo arriva, l\'apprendimento no, e spesso con errori. Una regola pratica: prima provare da soli, poi usare l\'AI per controllare e capire dove si è sbagliato.'],
      ['I rischi', 'Il primo è imparare meno: delegare scrittura e ragionamento allena poco proprio le capacità che la scuola deve costruire. Poi gli errori presentati con sicurezza, le fonti inventate, la distanza tra chi ha strumenti e guida a casa e chi no. E i rilevatori di testi scritti con l\'AI non sono affidabili: un giudizio non dovrebbe basarsi solo su quelli. Perché l\'AI sbaglia lo spieghiamo in <a href="intelligenza-artificiale-e-affidabile.html">l\'AI è affidabile?</a>'],
      ['Cosa possono fare docenti e genitori', 'I docenti possono usarla per preparare materiali, esercizi su misura e spiegazioni alternative, e dire chiaramente in classe quando e come è ammessa; il Ministero ha stanziato fondi del PNRR per la formazione del personale. Ai genitori conviene parlarne con i figli invece di vietarla: chiedere come la usano, provarla insieme, spiegare che va sempre verificata. Per iniziare c\'è la guida <a href="imparare-a-usare-intelligenza-artificiale.html">come usare l\'intelligenza artificiale</a>.']
    ],
    faq: [['L\'intelligenza artificiale si può usare a scuola?', 'Sì. Dal settembre 2025 le linee guida del Ministero dell\'Istruzione ne regolano l\'uso: è ammessa con regole su privacy, trasparenza e responsabilità del docente.'], ['Usare ChatGPT per i compiti è copiare?', 'Dipende da come. Farsi spiegare o correggere è come usare un buon libro; farsi scrivere il compito e consegnarlo come proprio è copiare, e toglie l\'apprendimento.'], ['A che età si può usare ChatGPT?', 'Secondo le condizioni di OpenAI dai 13 anni, e fino ai 18 con il consenso dei genitori.'], ['I professori capiscono se un testo è scritto con l\'AI?', 'Non con certezza. I rilevatori automatici sbagliano spesso; più efficace è chiedere allo studente di spiegare a voce quello che ha scritto.']],
    sources: ['Ministero dell\'Istruzione e del Merito, decreto 166 del 9 agosto 2025 e Linee guida per l\'introduzione dell\'intelligenza artificiale nelle istituzioni scolastiche', 'OpenAI, condizioni d\'uso'] }
];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- lingue ---------- */
const I18N = { en: EN, fr: FR, de: DE };
export const ARTICLE_DIR = { it: 'approfondimenti/', en: 'approfondimenti/en/', fr: 'approfondimenti/fr/', de: 'approfondimenti/de/' };
const LANGS = Object.keys(ARTICLE_DIR);
const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };
const UI = {
  it: { locale: 'it-IT', name: 'Approfondimenti', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND', pageLang: 'Lingua della pagina',
    by: 'A cura della <a href="{about}">redazione di FAIND</a>', updated: 'Aggiornato il', brief: 'In breve', faq: 'Domande frequenti', sources: 'Fonti', more: 'Altri approfondimenti', latest: 'Le ultime notizie sul tema',
    idxH1: "Approfondimenti sull'intelligenza artificiale", idxTitle: "Approfondimenti sull'intelligenza artificiale: guide e risposte",
    idxLede: "Le risposte alle domande che le persone si fanno più spesso sull'intelligenza artificiale: lavoro, rischi, costi, leggi, come iniziare. Scritte in modo semplice, con le fonti.",
    idxDesc: "Guide e risposte alle domande più cercate sull'intelligenza artificiale: lavori a rischio, pericoli, come iniziare, costi, consumi, leggi nel mondo e come riconoscere i contenuti fatti con l'AI.",
    foot: ['Chi siamo', 'Le AI a confronto', 'Glossario', 'Privacy e note legali'], about: 'redazione.html', cmp: 'confronto/', gloss: 'glossario/' },
  en: { locale: 'en-GB', name: 'In depth', back: '← All the news', home: 'Back to FAIND news', pageLang: 'Page language',
    by: 'By the <a href="{about}">FAIND newsroom</a>', updated: 'Updated on', brief: 'In brief', faq: 'Frequently asked questions', sources: 'Sources', more: 'More in-depth articles', latest: 'Latest news on this topic',
    idxH1: 'Artificial intelligence in depth', idxTitle: 'Artificial intelligence in depth: guides and answers',
    idxLede: 'Answers to the questions people ask most often about artificial intelligence: jobs, risks, costs, laws, how to get started. Written in plain language, with sources.',
    idxDesc: 'Guides and answers to the most searched questions about artificial intelligence: jobs at risk, dangers, how to get started, costs, energy use, laws around the world and how to spot AI-made content.',
    foot: ['About', 'AI assistants compared', 'Glossary', 'Privacy and legal notes'], about: 'about.html', cmp: 'confronto/en/', gloss: 'glossario/en/' },
  fr: { locale: 'fr-FR', name: 'Dossiers', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND', pageLang: 'Langue de la page',
    by: 'Par la <a href="{about}">rédaction de FAIND</a>', updated: 'Mis à jour le', brief: 'En bref', faq: 'Questions fréquentes', sources: 'Sources', more: 'Autres dossiers', latest: 'Les dernières actualités sur le sujet',
    idxH1: "Dossiers sur l'intelligence artificielle", idxTitle: "Dossiers sur l'intelligence artificielle : guides et réponses",
    idxLede: "Les réponses aux questions que l'on se pose le plus souvent sur l'intelligence artificielle : emploi, risques, coûts, lois, par où commencer. Écrites simplement, avec les sources.",
    idxDesc: "Guides et réponses aux questions les plus recherchées sur l'intelligence artificielle : métiers menacés, dangers, comment débuter, coûts, consommation, lois dans le monde et comment reconnaître les contenus créés avec l'IA.",
    foot: ['À propos', 'Les IA comparées', 'Glossaire', 'Confidentialité et mentions légales'], about: 'a-propos.html', cmp: 'confronto/fr/', gloss: 'glossario/fr/' },
  de: { locale: 'de-DE', name: 'Hintergrund', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten', pageLang: 'Sprache der Seite',
    by: 'Von der <a href="{about}">FAIND-Redaktion</a>', updated: 'Aktualisiert am', brief: 'Kurz gefasst', faq: 'Häufige Fragen', sources: 'Quellen', more: 'Weitere Hintergrundartikel', latest: 'Die neuesten Nachrichten zum Thema',
    idxH1: 'Hintergrund zur künstlichen Intelligenz', idxTitle: 'Hintergrund zur künstlichen Intelligenz: Leitfäden und Antworten',
    idxLede: 'Antworten auf die Fragen, die sich Menschen am häufigsten zur künstlichen Intelligenz stellen: Arbeit, Risiken, Kosten, Gesetze, der Einstieg. Einfach geschrieben, mit Quellen.',
    idxDesc: 'Leitfäden und Antworten auf die meistgesuchten Fragen zur künstlichen Intelligenz: gefährdete Berufe, Gefahren, der Einstieg, Kosten, Verbrauch, Gesetze weltweit und wie man mit KI erstellte Inhalte erkennt.',
    foot: ['Über uns', 'KI-Assistenten im Vergleich', 'Glossar', 'Datenschutz und rechtliche Hinweise'], about: 'ueber-uns.html', cmp: 'confronto/de/', gloss: 'glossario/de/' }
};
// L'articolo nella lingua richiesta (null se la traduzione manca: la pagina non viene creata)
const tr = (a, lang) => lang === 'it' ? a : (I18N[lang] && I18N[lang][a.slug] ? { ...a, ...I18N[lang][a.slug] } : null);
const listFor = (lang) => ARTICLES.map(a => tr(a, lang)).filter(Boolean);
const upOf = (lang) => lang === 'it' ? '../' : '../../';

/* ---------- collegamento dalle pagine notizia ---------- */
// Parole che collegano una notizia all'approfondimento giusto (riquadro "Per capire di più" nelle pagine notizia).
// Vince il primo che corrisponde: l'ordine va dal più specifico al più generale.
const MATCH = [
  ['come-riconoscere-audio-foto-video-intelligenza-artificiale', /deepfake|synthid|watermark|filigran|content credentials|voice clon|clonazione della voce|stimmklon|clonage de voix|\bdetector\b|rilevator|détecteur/i],
  ['perche-intelligenza-artificiale-consuma-acqua-energia', /data ?cent(er|re)|rechenzentr|centres? de données|\benerg|\bstrom\b|électricit|elettricit|\bwater\b|\bacqua\b|\bwasser\b|nuclear|nucleare|nucléaire|gigawatt|\bGW\b/i],
  ['leggi-intelligenza-artificiale-nel-mondo', /\bAI Act\b|regulat|regolament|réglement|verordnung|\blaw\b|\blaws\b|lawsuit|\bsues?\b|\bsued\b|causa contro|tribunal|\bcourt\b|gericht|\bklage|copyright|diritto d'autore|droit d'auteur|urheberrecht|antitrust|legge|\bloi\b|gesetz/i],
  ['intelligenza-artificiale-gratis-o-a-pagamento', /\bpric(e|es|ing)\b|prezz|\bprix\b|\bpreis|subscription|abbonament|abonnement|\babo\b|free tier|\bgratis\b|kostenlos|gratuit|per month|al mese|par mois|pro monat/i],
  ['intelligenza-artificiale-e-affidabile', /hallucinat|allucinaz|halluzin|misinformation|disinformazion|désinformation|desinformation|fact.?check|inaccura|accuracy|wrong answers|risposte sbagliate|reliab|affidabil|attendibil|fiabilit|zuverläss|trustworth|made.?up (facts|answers|citations)|inventa(to|te|ti)? (fonti|citazioni|risposte)/i],
  ['intelligenza-artificiale-e-pericolosa', /\bsafety\b|sicurezza dell|sécurité de l|sicherheit von ki|existential|alignment|allineamento|superintelligen|bioweapon|cyberattac|attacco informatico|\bhack|malware|jailbreak|misuse|abus/i],
  ['intelligenza-artificiale-a-scuola', /\bschools?\b|\bscuol|\bécole|\bschule|\bstudent|\bstudenti|\bélèves|schüler|\bteachers?\b|insegnant|enseignant|\blehrer/i],
  ['intelligenza-artificiale-sostituira-uomo-lavori-a-rischio', /\bjobs?\b|layoff|licenzi|lavorator|workforce|employment|hiring|assunzion|\bemploi|chômage|arbeitspl|stellenabbau|entlass/i],
  ['imparare-a-usare-intelligenza-artificiale', /how to use|come usare|tutorial|beginner|principiant|débutant|anfänger|\bcourse\b|\bcorso\b|\bkurs\b|workshop|\bprompts?\b/i],
  ['guadagnare-con-intelligenza-artificiale', /make money|earn money|guadagn|side hustle|freelanc|gagner de l'argent|geld verdienen|monetiz/i]
];
// L'approfondimento collegato a un testo, nella lingua della pagina se è tradotto (altrimenti in italiano)
export function articleFor(text, lang = 'it') {
  const m = MATCH.find(([, re]) => re.test(text));
  return m ? articleBySlug(m[0], lang) : null;
}
const slugFor = (text) => (MATCH.find(([, re]) => re.test(text)) || [])[0];
// Un approfondimento dato il suo indirizzo, con le stesse regole di lingua
export function articleBySlug(slug, lang = 'it') {
  const a = ARTICLES.find(x => x.slug === slug);
  if (!a) return null;
  const l = tr(a, lang) ? lang : 'it';
  return { title: tr(a, l).title, path: `${ARTICLE_DIR[l]}${a.slug}.html`, lang: l };
}

// file = nome della pagina dentro la cartella della lingua ('' per l'indice); langs = lingue in cui la pagina esiste
// dir: cartella della pagina se non è quella degli approfondimenti (Il punto usa la stessa veste)
export function shell({ lang, file, langs, title, desc, image, imageAlt = 'FAIND – Flash AI News Daily', imageSize = [1200, 630], jsonld, main, type = 'article', dir = ARTICLE_DIR[lang] }) {
  const u = UI[lang], up = upOf(lang), url = `${SITE}${dir}${file}`;
  const alts = langs.length > 1 ? langs.map(k => `  <link rel="alternate" hreflang="${k}" href="${SITE}${ARTICLE_DIR[k]}${file}">`).join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${ARTICLE_DIR.it}${file}">\n` : '';
  const sw = langs.length > 1 ? `    <p class="lsw"><span class="lsw__lab">${u.pageLang}:</span> ${langs.map(k => k === lang
    ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>`
    : `<a href="${up}${ARTICLE_DIR[k]}${file}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ')}</p>\n` : '';
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} | FAIND</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
${alts}  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="${imageSize[0]}">
  <meta property="og:image:height" content="${imageSize[1]}">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${esc(imageAlt)}">
  <link rel="icon" href="${up}assets/favicon.png?v=3" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png?v=3">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>
    .legal.art { max-width: 800px; }
    .lsw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 13.5px; margin-bottom: 14px; }
    .lsw__lab { color: var(--muted); } .lsw a { color: var(--ink); font-weight: 600; } .lsw__on { font-weight: 800; color: #4293B9; }
    .art__kick { display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: #4293B9; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; text-decoration: none; }
    .art .legal__title { line-height: 1.08; margin-bottom: 12px; }
    .art__img { width: 100%; height: auto; border-radius: 14px; display: block; margin: 18px 0 6px; }
    .art__brief { border: 1px solid var(--rule); border-left: 5px solid #4293B9; border-radius: 14px; background: var(--surface); padding: 16px 20px; margin: 20px 0 4px; }
    .legal .art__brief h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 8px; }
    .legal .art__brief ul { color: var(--ink); }
    .legal.art h3 { font-size: 17.5px; font-weight: 760; color: var(--ink); margin: 18px 0 6px; }
    .legal .art__src { font-size: 13.5px; }
    .art__tw { overflow-x: auto; margin: 14px 0 4px; }
    .art__table { width: 100%; border-collapse: collapse; font-size: 14.5px; line-height: 1.4; }
    .art__table caption { text-align: left; font-weight: 700; color: var(--muted); font-size: 13.5px; margin-bottom: 6px; }
    .art__table th, .art__table td { text-align: left; vertical-align: top; padding: 9px 10px; border-bottom: 1px solid var(--rule); color: var(--ink); }
    .art__table thead th { font-size: 12.5px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); border-bottom: 2px solid var(--ink); }
    .art__table tbody th { font-weight: 700; }
    @media (max-width: 600px) { .art__table { font-size: 13.5px; } .art__table th, .art__table td { padding: 8px 6px; } }
    .legal .art__news { list-style: none; padding: 0; margin: 10px 0 0; }
    .legal .art__news li { padding: 10px 0; border-bottom: 1px solid var(--rule); line-height: 1.4; }
    .art__news a { color: var(--ink); font-weight: 650; text-decoration: none; }
    .art__news a:hover { color: var(--link); text-decoration: underline; }
    .art__news span { display: block; font-size: 13px; color: var(--muted); margin-top: 2px; }
    .art__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 14px; }
    .art__grid a { display: block; text-decoration: none; color: var(--ink); border: 1px solid var(--rule); border-radius: 14px; overflow: hidden; background: var(--surface); }
    .art__grid img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
    .art__grid strong { display: block; padding: 12px 14px 4px; font-size: 17px; line-height: 1.25; font-stretch: 90%; }
    .art__grid span { display: block; padding: 0 14px 14px; font-size: 14px; color: var(--muted); }
    @media (max-width: 620px) { .art__grid { grid-template-columns: 1fr; } }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="${up}stats.js" defer></script>
  <script src="${up}nav.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="${up}" aria-label="FAIND — Home"><img class="brand__img brand__img--light" src="${up}assets/logo-payoff-light.webp" width="451" height="180" alt="FAIND – Flash AI News Daily"><img class="brand__img brand__img--dark" src="${up}assets/logo-payoff-dark.webp" width="451" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="${up}">${u.back}</a>
    </div>
  </header>
  <main class="wrap legal art">
${main.replace('<!--lsw-->\n', sw)}
    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="${up}#chi-siamo">${u.foot[0]}</a> · <a href="${up}${ARTICLE_DIR[lang]}">${u.name}</a> · <a href="${up}${u.cmp}">${u.foot[1]}</a> · <a href="${up}${u.gloss}">${u.foot[2]}</a> · <a href="${up}privacy.html">${u.foot[3]}</a></p></div></footer>
</body>
</html>
`;
}

const cardHtml = (a, up, lang = 'it') => `<a href="${a.slug}.html"><img src="${up}assets/${a.img}" alt="${esc(imgAlt(a.img, lang, ''))}" loading="lazy" width="1024" height="576"><strong>${esc(a.title)}</strong><span>${esc(a.card)}</span></a>`;

// Le ultime notizie che rimandano a questo approfondimento (stessa regola delle pagine notizia), prima quelle nella lingua della pagina
const LATEST_MAX = 5;
function latestHtml(slug, lang, news, up, u) {
  const hits = news.filter(n => n.page && slugFor(`${txt(n.title)} ${txt(n.summary)}`) === slug);
  const list = [...hits.filter(n => (n.lang || 'it') === lang), ...hits.filter(n => (n.lang || 'it') !== lang)].slice(0, LATEST_MAX);
  if (!list.length) return '';
  const day = new Intl.DateTimeFormat(u.locale, { day: 'numeric', month: 'long', timeZone: 'Europe/Rome' });
  return `
    <section>
      <h2>${u.latest}</h2>
      <ul class="art__news">${list.map(n => `<li><a href="${up}${esc(n.page)}"${(n.lang || 'it') !== lang ? ` hreflang="${esc(n.lang || 'it')}"` : ''}>${esc(txt(n.title))}</a> <span>${esc(n.source.name)} · ${day.format(new Date(n.date))}</span></li>`).join('')}</ul>
    </section>
`;
}
const txt = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));

// Tabella dentro una sezione: { caption, head: [...], rows: [[...], ...] } (celle in HTML semplice)
export const tableHtml = (t) => `<div class="art__tw"><table class="art__table"><caption>${esc(t.caption)}</caption><thead><tr>${t.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;

function articlePage(base, lang, news = [], linker = null) {
  const a = tr(base, lang), u = UI[lang], up = upOf(lang), file = `${a.slug}.html`;
  const lk = linker && linker(lang, up), used = new Set(), link = lk ? (h) => lk(h, used) : (h) => h;   // nomi e parole del glossario → loro pagine
  const url = `${SITE}${ARTICLE_DIR[lang]}${file}`, image = `${SITE}assets/${a.img}`;
  const langs = LANGS.filter(k => tr(base, k));
  const updated = (lang === 'it' && base.updated) || UPDATED;   // updated: data propria di un articolo riscritto (vale per l'italiano)
  const date = new Intl.DateTimeFormat(u.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(updated + 'T12:00:00Z'));
  const others = listFor(lang).filter(x => x.slug !== a.slug).slice(0, 4);
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': url + '#article', headline: a.title, description: a.desc, image: { '@type': 'ImageObject', url: image, width: 1024, height: 576, caption: imgAlt(a.img, lang, a.title) }, inLanguage: u.locale, datePublished: UPDATED, dateModified: updated, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'Redazione FAIND', url: SITE + u.about }, publisher: { '@id': SITE + '#org' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: u.name, item: SITE + ARTICLE_DIR[lang] }, { '@type': 'ListItem', position: 3, name: a.title, item: url }] },
    { '@type': 'FAQPage', mainEntity: a.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }
  ] };
  const main = `    <p class="np__crumb"><a href="${up}">FAIND</a> › <a href="./">${u.name}</a></p>
<!--lsw-->
    <a class="art__kick" href="./">${u.name}</a>
    <h1 class="legal__title">${esc(a.title)}</h1>
    <p class="legal__updated">${u.by.replace('{about}', up + u.about)} · ${u.updated} ${date}</p>
    <img class="art__img" src="${up}assets/${a.img}" width="1024" height="576" fetchpriority="high" decoding="async" alt="${esc(imgAlt(a.img, lang, a.title))}">
    <p class="legal__lede">${link(a.lede)}</p>

    <div class="art__brief">
      <h2>${u.brief}</h2>
      <ul>${a.brief.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

${a.sections.map(([h, p, table]) => `    <section>\n      <h2>${esc(h)}</h2>\n      <p>${link(p)}</p>${table ? `\n      ${tableHtml(table)}` : ''}\n    </section>`).join('\n')}

    <section>
      <h2>${u.faq}</h2>
${a.faq.map(([q, r]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(r)}</p>`).join('\n')}
    </section>
${a.sources.length ? `
    <section>
      <h2>${u.sources}</h2>
      <ul class="art__src">${a.sources.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </section>
` : ''}
${latestHtml(a.slug, lang, news, up, u)}
    <section>
      <h2>${u.more}</h2>
      <div class="art__grid">${others.map(o => cardHtml(o, up, lang)).join('')}</div>
    </section>
`;
  return shell({ lang, file, langs, title: a.title, desc: a.desc, image, imageAlt: imgAlt(a.img, lang, a.title), imageSize: [1024, 576], jsonld, main });
}

function indexPage(lang) {
  const u = UI[lang], up = upOf(lang), url = SITE + ARTICLE_DIR[lang], items = listFor(lang);
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: u.idxH1, inLanguage: u.locale, dateModified: UPDATED, isPartOf: { '@id': SITE + '#website' },
    hasPart: items.map(a => ({ '@type': 'Article', headline: a.title, url: `${url}${a.slug}.html` })) };
  const main = `    <p class="np__crumb"><a href="${up}">FAIND</a> › ${u.name}</p>
<!--lsw-->
    <h1 class="legal__title">${esc(u.idxH1)}</h1>
    <p class="legal__lede">${esc(u.idxLede)}</p>
    <div class="art__grid">${items.map(a => cardHtml(a, up, lang)).join('')}</div>
`;
  return shell({ lang, file: '', langs: LANGS.filter(k => listFor(k).length), title: u.idxTitle, desc: u.idxDesc, image: SITE + 'assets/og-image.png', jsonld, main, type: 'website' });
}

// Schede per la home (HTML statico da incollare in index.html)
export const articleImages = () => ARTICLES.map(a => [`${DIR}${a.slug}.html`, a.img, imgAlt(a.img, 'it', a.title)]);
export const homeCards = () => ARTICLES.map(a => `          <a class="deep__card" href="${DIR}${a.slug}.html" data-deep="${a.slug}"><img src="assets/${a.img}" alt="${esc(imgAlt(a.img, 'it', ''))}" loading="lazy" decoding="async" width="1024" height="576"><strong>${esc(a.title)}</strong><span>${esc(a.card)}</span></a>`).join('\n');

// Titoli e sommari tradotti per le schede della home: finiscono in approfondimenti/cards.json, letto da script.js
const homeI18n = () => Object.fromEntries(LANGS.filter(k => k !== 'it').map(k => [k, Object.fromEntries(listFor(k).map(a => [a.slug, [a.title, a.card, imgAlt(a.img, k, '')]]))]));

export async function buildArticles(root, news = [], linker = null) {
  const urls = [], thumbs = {};
  let pages = 0;
  for (const lang of LANGS) {
    const items = listFor(lang);
    if (!items.length) continue;
    const dir = path.join(root, ARTICLE_DIR[lang]);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), indexPage(lang));
    urls.push(SITE + ARTICLE_DIR[lang]);
    for (const a of ARTICLES) {
      if (!tr(a, lang)) continue;
      await writeFile(path.join(dir, `${a.slug}.html`), articlePage(a, lang, news, linker));
      const loc = `${SITE}${ARTICLE_DIR[lang]}${a.slug}.html`;
      urls.push(loc);
      thumbs[loc] = [a.img, imgAlt(a.img, lang, tr(a, lang).title)];
      pages++;
    }
  }
  await writeFile(path.join(root, ARTICLE_DIR.it, 'cards.json'), JSON.stringify(homeI18n()));
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const imgXml = (u) => thumbs[u] ? `<image:image><image:loc>${SITE}assets/${thumbs[u][0]}</image:loc><image:title>${esc(thumbs[u][1])}</image:title></image:image>` : '';
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`)).map(u => `<url><loc>${u}</loc><lastmod>${UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority>${imgXml(u)}</url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con gli approfondimenti:', e.message); }
  console.log(`📚 approfondimenti: ${ARTICLES.length} articoli, ${pages} pagine in ${LANGS.length} lingue`);
}
