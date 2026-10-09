/* =====================================================================
   FAIND — pagine tematiche permanenti (cartella temi/)
   ---------------------------------------------------------------------
   Per ogni tema del Focus genera una pagina fissa, indicizzabile, in quattro
   lingue (temi/ in italiano, temi/en/, temi/fr/, temi/de/), fatta di:
   • un testo editoriale originale (scritto qui sotto, in TOPICS);
   • parti che si aggiornano da sole a ogni giro: numeri della settimana,
     notizia più ripresa, testate più attive, ultime notizie, video;
   • una cronologia che cresce nel tempo (una notizia al giorno, la più
     ripresa), conservata in news.json → "topics";
   • domande frequenti con dati strutturati per Google.

   Mai testi copiati: delle notizie compaiono solo titolo, testata e link.
   Per cambiare i testi fissi modifica TOPICS (italiano) qui sotto e
   TOPICS_I18N in topics-i18n.mjs (inglese, francese, tedesco). Le parole chiave che
   decidono quali notizie entrano in un tema sono in scripts/feeds.json
   → spotlight → topics (le stesse del Focus in home).
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { TOPICS_I18N } from './topics-i18n.mjs';

const SITE = 'https://faind.org/';
const TIMELINE_MAX = 180;      // giorni conservati nella cronologia
const TIMELINE_SHOW = 60;      // righe mostrate in pagina
const SEEN_MAX = 800;

export const TOPICS = {
  robot: {
    slug: 'robot-umanoidi', color: '#4293B9', name: 'Robotics e Umanoidi', short: 'robot e umanoidi', home: 'focus-robot',
    title: 'Robot e umanoidi: notizie, video e a che punto siamo',
    desc: 'Robot umanoidi, auto a guida autonoma, droni e robot nello spazio: le notizie aggiornate ogni ora con la fonte, i video e la cronologia di FAIND.',
    lede: 'Dai robot umanoidi che imparano a muoversi nei magazzini alle auto senza conducente, dai droni ai rover nello spazio: qui FAIND raccoglie, ora per ora, quello che succede dove l\'intelligenza artificiale incontra il mondo fisico.',
    body: [
      ['Perché se ne parla tanto adesso', 'Per decenni i robot sono rimasti chiusi nelle fabbriche, a ripetere lo stesso movimento dietro una gabbia di sicurezza. La novità di questi anni è che i modelli di intelligenza artificiale, gli stessi che hanno imparato a capire testi e immagini, vengono usati anche per far <strong>vedere, capire e agire</strong> una macchina in ambienti che non sono stati preparati apposta per lei. È il motivo per cui aziende come Tesla, Figure, Unitree e Boston Dynamics mostrano umanoidi che camminano, afferrano oggetti e svolgono compiti semplici.'],
      ['Umanoidi: tra dimostrazioni e realtà', 'Un video ben riuscito non è ancora un prodotto. Le domande da farsi davanti a ogni annuncio sono sempre le stesse: il robot agisce da solo o è guidato a distanza? Quanto dura la batteria? Quanto costa, e chi lo sta usando davvero fuori dal laboratorio? Per ora i primi impieghi concreti sono nella logistica e nelle linee di produzione, dove i compiti sono ripetitivi e l\'ambiente è controllato. La casa, piena di imprevisti, resta il traguardo più difficile.'],
      ['Non solo umanoidi', 'La robotica che già funziona ha spesso forme meno spettacolari: i robotaxi che in alcune città trasportano passeggeri senza conducente, i droni per le consegne e le ispezioni, i robot chirurgici guidati dal medico, i bracci nei magazzini, i rover e i satelliti che prendono decisioni in autonomia perché troppo lontani per essere telecomandati. Seguire tutto insieme aiuta a capire dove la tecnologia è matura e dove è ancora promessa.']
    ],
    watch: ['i nuovi modelli di umanoidi e i primi impieghi reali in fabbrica e in magazzino', 'la guida autonoma: robotaxi, autorizzazioni, incidenti e regole', 'droni, robot per la casa e per l\'assistenza', 'robotica nello spazio, in mare e in agricoltura'],
    faq: [
      ['Che cos\'è un robot umanoide?', 'È un robot con una forma simile a quella umana, di solito con due gambe, due braccia e mani in grado di afferrare oggetti. L\'idea è che possa muoversi e lavorare in ambienti costruiti per le persone, senza doverli modificare.'],
      ['I robot umanoidi sono già in vendita?', 'Alcuni modelli sono acquistabili da aziende e centri di ricerca, e qualche produttore ha annunciato versioni per il pubblico. Per la maggior parte, però, si tratta ancora di progetti pilota in fabbriche e magazzini: prezzi, autonomia e affidabilità cambiano molto da un annuncio all\'altro, per questo conviene seguire le notizie con la fonte.'],
      ['Che differenza c\'è tra un robot e l\'intelligenza artificiale?', 'L\'intelligenza artificiale è il software che riconosce, prevede e decide; il robot è la macchina che agisce nel mondo fisico. Un robot può funzionare anche senza AI, eseguendo movimenti programmati; l\'AI gli permette di adattarsi a situazioni non previste.'],
      ['Le auto a guida autonoma esistono davvero?', 'Sì: in alcune città del mondo operano servizi di robotaxi senza conducente a bordo, entro zone e condizioni definite. La guida completamente autonoma ovunque e con qualsiasi tempo, invece, non è ancora una realtà.'],
      ['I robot toglieranno lavoro alle persone?', 'Automatizzano soprattutto compiti ripetitivi, faticosi o pericolosi, e questo cambia i mestieri più che cancellarli tutti insieme. Gli effetti dipendono dal settore e dai tempi di adozione: FAIND segue il tema anche nella pagina dedicata ad AI e lavoro.']
    ]
  },
  domus: {
    slug: 'ai-in-casa', color: '#7A5AE0', name: 'Domus: l\'AI in casa', short: 'AI in casa', home: 'focus-domus',
    title: 'AI in casa: smartphone, casa intelligente ed elettrodomestici',
    desc: 'L\'intelligenza artificiale negli oggetti di tutti i giorni: smartphone, assistenti vocali, casa intelligente, TV ed elettrodomestici. Notizie con la fonte, video e cronologia.',
    lede: 'Domus è la casa. In questa pagina FAIND segue l\'intelligenza artificiale che entra negli oggetti di tutti i giorni: il telefono che abbiamo in tasca, l\'assistente vocale in cucina, la TV, l\'aspirapolvere, il termostato, gli occhiali e gli orologi.',
    body: [
      ['L\'AI che usiamo senza accorgercene', 'Prima ancora dei chatbot, l\'intelligenza artificiale è arrivata nelle case dentro funzioni che diamo per scontate: la fotocamera che migliora uno scatto notturno, la tastiera che suggerisce la parola, il filtro che ferma lo spam, il robot aspirapolvere che riconosce un ostacolo. Oggi i produttori stanno aggiungendo agli stessi dispositivi gli <strong>assistenti generativi</strong>, capaci di riassumere, tradurre, scrivere e rispondere a voce in modo molto più naturale.'],
      ['Sul dispositivo o nel cloud?', 'È la distinzione più utile per orientarsi. Una funzione che gira <strong>sul dispositivo</strong> elabora i dati localmente: è più rapida e più riservata, ma richiede chip recenti. Una funzione che passa dal <strong>cloud</strong> è più potente, ma invia dati ai server del produttore e spesso dipende da un abbonamento. Per questo molte novità arrivano solo sui modelli più nuovi, e alcune sono disponibili in certi Paesi prima che in altri.'],
      ['La casa che si parla', 'Luci, serrature, termostati e prese di marche diverse hanno faticato a lungo a dialogare. Lo standard Matter, sostenuto dai principali produttori, nasce per far funzionare insieme dispositivi di ecosistemi differenti. Con gli assistenti di nuova generazione l\'obiettivo dichiarato è passare dai comandi singoli («accendi la luce») a richieste più ampie («prepara la casa per la notte»). Quanto di questo funzioni davvero, e a che prezzo per la privacy, è ciò che conviene verificare notizia per notizia.']
    ],
    watch: ['le funzioni AI di iPhone, Android e degli altri smartphone, e su quali modelli arrivano', 'assistenti vocali: Alexa, Siri, Gemini e i loro aggiornamenti', 'elettrodomestici, TV, occhiali e dispositivi indossabili con AI', 'privacy e dati raccolti in casa'],
    faq: [
      ['Che cosa significa AI sul dispositivo?', 'Significa che l\'elaborazione avviene direttamente nel telefono, nel computer o nell\'elettrodomestico, senza inviare i dati a un server. È più veloce e tutela meglio la riservatezza, ma richiede processori recenti e modelli più piccoli di quelli usati nel cloud.'],
      ['Serve uno smartphone nuovo per usare l\'intelligenza artificiale?', 'Per le app come ChatGPT, Claude o Gemini no: funzionano su quasi tutti i telefoni perché lavorano nel cloud. Le funzioni AI integrate nel sistema, invece, sono spesso riservate ai modelli più recenti, perché hanno bisogno di chip e memoria adeguati.'],
      ['Gli assistenti vocali ascoltano sempre?', 'I dispositivi restano in attesa della parola di attivazione e, secondo i produttori, inviano l\'audio ai server solo dopo averla riconosciuta. Le impostazioni permettono di rivedere e cancellare le registrazioni e di disattivare il microfono: conviene controllarle, anche perché le condizioni cambiano con gli aggiornamenti.'],
      ['Che cos\'è Matter?', 'È uno standard aperto per la casa intelligente, sostenuto dai maggiori produttori, che permette a dispositivi di marche diverse di funzionare insieme e di essere controllati dall\'app o dall\'assistente che si preferisce.'],
      ['Conviene comprare un elettrodomestico "con AI"?', 'Dipende da che cosa fa davvero. L\'etichetta AI viene usata sia per funzioni utili, come il riconoscimento del carico o degli ostacoli, sia per semplice marketing. Prima dell\'acquisto vale la pena capire se la funzione lavora anche senza connessione, se richiede un account e per quanti anni il prodotto riceverà aggiornamenti.']
    ]
  },
  medicina: {
    slug: 'ai-medicina-salute', color: '#D8483F', name: 'Medicina e salute', short: 'AI in medicina e salute', home: 'focus-medicina',
    title: 'AI in medicina e salute: scoperte, diagnosi e nuovi farmaci',
    desc: 'Intelligenza artificiale in medicina: diagnosi, immagini, nuovi farmaci, ricerca sulle proteine e regole. Notizie aggiornate ogni ora con la fonte, video e cronologia.',
    lede: 'Diagnosi più precoci, immagini lette con l\'aiuto di un algoritmo, molecole progettate al computer: la medicina è uno dei campi in cui l\'intelligenza artificiale promette di più, e in cui è più importante distinguere i risultati dimostrati dagli annunci.',
    body: [
      ['Dove l\'AI è già in corsia', 'Gli usi più consolidati riguardano le <strong>immagini</strong>: radiografie, TAC, risonanze, mammografie, fotografie della pelle e della retina. Qui i sistemi di intelligenza artificiale lavorano come un secondo paio di occhi, che segnala al medico i casi sospetti o mette in ordine di urgenza gli esami. Le autorità sanitarie, a partire da quella statunitense, hanno autorizzato negli anni centinaia di dispositivi di questo tipo. La decisione, però, resta al medico.'],
      ['La ricerca: proteine e farmaci', 'Il risultato più celebre è AlphaFold, il sistema di Google DeepMind che prevede la forma delle proteine a partire dalla loro sequenza: un problema rimasto aperto per mezzo secolo, e un lavoro premiato con il Nobel per la chimica nel 2024. Conoscere la forma di una proteina aiuta a capire le malattie e a progettare molecole che vi si leghino. È qui che molte aziende stanno usando l\'AI per accorciare le prime fasi della scoperta di un farmaco, anche se i tempi delle sperimentazioni sulle persone restano lunghi.'],
      ['Come leggere le notizie di medicina', 'Tra un titolo e una cura c\'è molta strada. Uno studio su cellule o su animali non equivale a una terapia; un algoritmo provato in un solo ospedale può funzionare peggio altrove; un comunicato aziendale non è una pubblicazione scientifica. Per questo FAIND indica sempre la testata e rimanda all\'articolo originale. <strong>Queste pagine informano, non sostituiscono il parere di un medico.</strong>']
    ],
    watch: ['diagnosi e lettura delle immagini mediche', 'scoperta di farmaci, proteine e genetica', 'chatbot e assistenti per medici e pazienti', 'regole, autorizzazioni e protezione dei dati sanitari'],
    faq: [
      ['Come viene usata l\'intelligenza artificiale in medicina?', 'Soprattutto per analizzare immagini mediche, individuare segnali precoci di malattia, ordinare gli esami per urgenza, alleggerire il lavoro amministrativo dei medici e accelerare la ricerca di nuovi farmaci. In quasi tutti i casi è uno strumento di supporto, non un sostituto del medico.'],
      ['L\'AI può fare una diagnosi al posto del medico?', 'No. I sistemi autorizzati segnalano e suggeriscono, ma la diagnosi e la responsabilità restano a un professionista. Anche i chatbot possono aiutare a capire un referto o a prepararsi a una visita, ma possono sbagliare e non conoscono la storia clinica della persona.'],
      ['Che cos\'è AlphaFold?', 'È un sistema di intelligenza artificiale sviluppato da Google DeepMind che prevede la struttura tridimensionale delle proteine. Le sue previsioni sono a disposizione dei ricercatori di tutto il mondo e il lavoro è stato premiato con il Nobel per la chimica nel 2024.'],
      ['Posso chiedere consigli medici a un chatbot?', 'Un chatbot può spiegare termini, aiutare a formulare domande per il medico e dare informazioni generali, ma non visita, non conosce il quadro completo e può dare risposte sbagliate con tono sicuro. Per sintomi, terapie e farmaci bisogna rivolgersi a un medico; in caso di emergenza, ai servizi di soccorso.'],
      ['I dati sanitari sono al sicuro con l\'AI?', 'I dati sulla salute sono tra i più protetti dalla legge europea sulla privacy e molti sistemi di AI medica rientrano tra quelli ad alto rischio previsti dal regolamento europeo sull\'intelligenza artificiale. Prima di caricare referti o esami su un servizio conviene leggere come vengono conservati e usati.']
    ]
  },
  lavoro: {
    slug: 'ai-lavoro', color: '#2F6FB0', name: 'AI e lavoro', short: 'AI e lavoro', home: 'focus-lavoro',
    title: 'AI e lavoro: come cambiano mestieri, competenze e aziende',
    desc: 'Intelligenza artificiale e lavoro: professioni che cambiano, nuove competenze, licenziamenti e assunzioni, regole. Notizie con la fonte, video, cronologia e i ruoli AI più richiesti.',
    lede: 'L\'intelligenza artificiale ci ruberà il lavoro? È la domanda che si fanno in tanti. La risposta onesta è che dipende dal mestiere, dai compiti e dai tempi: qui FAIND mette in fila i fatti, giorno per giorno, con la fonte.',
    body: [
      ['Compiti, non mestieri', 'Quasi nessun lavoro è fatto di una sola attività. L\'AI generativa è già capace di scrivere bozze, riassumere documenti, tradurre, produrre codice, analizzare dati, rispondere a domande ricorrenti. Dentro ogni professione, quindi, alcuni <strong>compiti</strong> si automatizzano e altri acquistano valore: il giudizio, la relazione con le persone, la responsabilità di una decisione. Per questo gli studiosi parlano più spesso di lavori che si trasformano che di lavori che spariscono da un giorno all\'altro.'],
      ['Chi è più esposto', 'Le ondate precedenti di automazione hanno toccato soprattutto il lavoro manuale ripetitivo. Questa riguarda anche il <strong>lavoro d\'ufficio e intellettuale</strong>: amministrazione, assistenza clienti, traduzione, programmazione, grafica, marketing, professioni legali. Le stime su quanti posti si perderanno o si creeranno cambiano molto da uno studio all\'altro, ed è bene diffidare dei numeri troppo netti. Più utili sono i dati reali: annunci di lavoro, licenziamenti motivati con l\'AI, accordi sindacali, produttività misurata.'],
      ['Le competenze che servono', 'Non serve diventare tutti programmatori. Serve saper usare bene gli strumenti nel proprio campo: fare la richiesta giusta, controllare il risultato, capire dove l\'AI sbaglia, sapere quali dati non vanno condivisi. Accanto a questo crescono i mestieri dell\'AI vera e propria. FAIND pubblica ogni giorno la <a href="{home}#job">classifica dei ruoli più richiesti</a> negli annunci, con i link per candidarsi.']
    ],
    watch: ['licenziamenti, assunzioni e riorganizzazioni legate all\'AI', 'studi su produttività, salari e occupazione', 'formazione, competenze e nuove professioni', 'regole: AI nelle selezioni del personale, controlli sui lavoratori, accordi sindacali'],
    faq: [
      ['L\'intelligenza artificiale ci ruberà il lavoro?', 'Automatizza singoli compiti più che interi mestieri. Alcune attività, soprattutto ripetitive e d\'ufficio, vengono svolte sempre più dal software; altre nascono o diventano più importanti. L\'effetto dipende dal settore e dalla velocità con cui le aziende adottano questi strumenti.'],
      ['Quali lavori sono più a rischio con l\'AI?', 'Quelli in cui prevalgono compiti ripetitivi basati su testi e dati: inserimento dati, assistenza clienti di primo livello, traduzioni standard, parte del lavoro amministrativo e di programmazione di base. Sono meno esposti i lavori che richiedono presenza fisica, manualità fine, relazione e responsabilità diretta.'],
      ['Quali sono i lavori più richiesti nell\'intelligenza artificiale?', 'Machine learning engineer, AI engineer, data scientist, data engineer e data analyst sono tra i ruoli che compaiono più spesso negli annunci. FAIND aggiorna ogni sei ore una classifica basata su offerte pubbliche degli ultimi 30 giorni.'],
      ['Quali competenze servono per lavorare con l\'AI?', 'Per la maggior parte delle persone: saper formulare richieste chiare, verificare le risposte, conoscere i limiti degli strumenti e proteggere i dati riservati. Per i ruoli tecnici: programmazione, statistica, gestione dei dati e conoscenza dei modelli di machine learning.'],
      ['Un\'azienda può usare l\'AI per selezionare o valutare i dipendenti?', 'Nell\'Unione europea i sistemi di AI usati per assumere, valutare o gestire i lavoratori sono classificati ad alto rischio dal regolamento sull\'intelligenza artificiale e sono soggetti a obblighi specifici di trasparenza e controllo umano, oltre alle norme su privacy e lavoro già in vigore.']
    ]
  },
  clima: {
    slug: 'ai-clima-ambiente', color: '#1E9460', name: 'Clima e ambiente', short: 'AI, clima e ambiente', home: 'focus-clima',
    title: 'AI, clima e ambiente: energia, consumi e soluzioni',
    desc: 'Quanto consuma l\'intelligenza artificiale e come può aiutare il clima: data center, energia, acqua, previsioni meteo, rinnovabili. Notizie con la fonte, video e cronologia.',
    lede: 'L\'intelligenza artificiale ha due facce quando si parla di ambiente: consuma energia e acqua, e allo stesso tempo è uno strumento per prevedere il meteo, gestire le reti elettriche e studiare il clima. In questa pagina FAIND le segue entrambe.',
    body: [
      ['Quanto consuma l\'AI', 'Addestrare e far funzionare i modelli richiede grandi <strong>data center</strong>, cioè edifici pieni di computer che assorbono elettricità e che vanno raffreddati, spesso con acqua. Le agenzie internazionali dell\'energia prevedono una forte crescita dei consumi elettrici dei data center nei prossimi anni, e le grandi aziende tecnologiche hanno riconosciuto che l\'AI rende più difficile rispettare i propri obiettivi sulle emissioni. Quanto pesi una singola richiesta a un chatbot dipende dal modello e da come viene misurato: i numeri che circolano vanno letti con la fonte accanto.'],
      ['Come l\'AI può aiutare', 'Sul versante opposto, i modelli di intelligenza artificiale stanno migliorando le <strong>previsioni del tempo</strong>, in alcuni casi con una rapidità di calcolo molto superiore a quella dei metodi tradizionali. Vengono usati per prevedere la produzione di sole e vento, bilanciare le reti elettriche, ridurre gli sprechi negli edifici e nelle fabbriche, individuare incendi e perdite di metano dai satelliti, cercare nuovi materiali per batterie e pannelli.'],
      ['Il conto finale', 'Se il bilancio sarà positivo o negativo non è deciso: dipende da quanta energia pulita alimenterà i data center, da quanto diventeranno efficienti chip e modelli, e da che cosa si sceglierà di fare con questa potenza di calcolo. È anche un tema di territori, perché i nuovi impianti chiedono elettricità, acqua e suolo alle comunità che li ospitano, e non mancano proteste e ricorsi. Seguiamo qui anche le notizie su clima e ambiente in generale, quando aiutano a capire il contesto.']
    ],
    watch: ['consumi di elettricità e acqua dei data center', 'energia per l\'AI: rinnovabili, nucleare, reti', 'AI per meteo, clima, agricoltura e disastri naturali', 'proteste locali, regole e impegni delle aziende sulle emissioni'],
    faq: [
      ['Quanta energia consuma l\'intelligenza artificiale?', 'Dipende dal modello e dall\'uso. La gran parte del consumo avviene nei data center, sia per addestrare i modelli sia per rispondere alle richieste di ogni giorno. Le stime internazionali indicano una forte crescita della domanda elettrica dei data center nei prossimi anni, trainata anche dall\'AI.'],
      ['Perché i data center consumano acqua?', 'Perché i computer producono calore e molti impianti li raffreddano con sistemi che usano acqua, direttamente o attraverso la produzione dell\'elettricità che consumano. La quantità cambia molto in base alla tecnologia di raffreddamento e al clima del luogo.'],
      ['L\'AI può aiutare a combattere il cambiamento climatico?', 'Può contribuire: migliora le previsioni meteo, aiuta a gestire reti elettriche con molte rinnovabili, riduce sprechi di energia, accelera la ricerca su nuovi materiali e permette di monitorare foreste, ghiacci ed emissioni dai satelliti. Non sostituisce però le scelte politiche ed economiche sulla riduzione delle emissioni.'],
      ['Usare un chatbot inquina?', 'Ogni richiesta consuma una piccola quantità di energia, che diventa rilevante quando si moltiplica per miliardi di utilizzi. L\'impatto reale dipende dal modello usato, dall\'efficienza del data center e dalla fonte di energia che lo alimenta.'],
      ['Come si alimentano i data center dell\'AI?', 'Con l\'elettricità della rete, che in ogni Paese ha un diverso mix di fonti. Le grandi aziende stanno firmando contratti per energia solare, eolica e nucleare e in alcuni casi costruiscono impianti dedicati; dove non basta, si ricorre anche al gas.']
    ]
  }
};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');
const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));
const romeDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const asDate = (iso) => new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso);
const sourcesOf = (n) => [n.source && n.source.name, ...((n.also || []).map(a => a.name))].filter(Boolean);

/* ---------- Lingue ---------- */
export const LANGS = ['it', 'en', 'fr', 'de'];
export const TOPIC_DIR = { it: 'temi/', en: 'temi/en/', fr: 'temi/fr/', de: 'temi/de/' };
const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };
const ABOUT = { it: 'redazione.html', en: 'about.html', fr: 'a-propos.html', de: 'ueber-uns.html' };
const GLOSS = { it: 'glossario/', en: 'glossario/en/', fr: 'glossario/fr/', de: 'glossario/de/' };
// Testo di un tema nella lingua richiesta (colore e ancora in home restano quelli italiani)
export const topicText = (key, lang) => lang === 'it' ? TOPICS[key] : { ...TOPICS_I18N[lang][key], color: TOPICS[key].color, home: TOPICS[key].home };
export const topicUrl = (key, lang) => `${SITE}${TOPIC_DIR[lang]}${topicText(key, lang).slug}.html`;

const n1 = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const UI = {
  it: { locale: 'it-IT', topics: 'Temi', kicker: 'Tema', pageLang: 'Lingua della pagina', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND',
    liveTitle: 'Il punto, aggiornato ogni ora', stamp: (t) => `Ultimo aggiornamento: ${t} (ora italiana). Questa sezione viene compilata in automatico con i dati raccolti da FAIND.`,
    understand: 'Per capire il tema', watch: 'Che cosa seguiamo', latest: (s) => `Le ultime notizie su ${s}`, video: 'Video',
    timeline: 'Cronologia', timelineIntro: 'La notizia più ripresa di ogni giorno, dalla più recente. L\'elenco cresce nel tempo; ogni titolo porta all\'articolo originale.',
    faq: 'Domande frequenti', others: 'Gli altri temi di FAIND', focus: 'Il Focus in home', outlets: (n) => `${n} testate`, inLang: { it: 'in italiano', en: 'in inglese', fr: 'in francese', de: 'in tedesco' },
    none: 'Negli ultimi sette giorni non sono uscite notizie di rilievo su questo tema tra le fonti che seguiamo. Più sotto trovi la cronologia delle settimane precedenti.',
    week: (n, m) => `Negli ultimi sette giorni FAIND ha raccolto <strong>${n1(n, 'notizia', 'notizie')}</strong> su questo tema da <strong>${n1(m, 'testata', 'testate')}</strong>.`,
    top: (t, s, k) => `La più ripresa è «${t}», pubblicata da ${s} e riportata da ${k === 1 ? 'un\'altra testata' : `altre ${k} testate`}.`,
    recent: (t, s) => `La più recente è «${t}», pubblicata da ${s}.`, active: (l) => `Le testate più attive della settimana: ${l}.`,
    total: (d, n) => `Dal ${d}, giorno in cui abbiamo iniziato a seguire il tema, le notizie catalogate sono <strong>${n}</strong>.`,
    idxTitle: 'I temi di FAIND', idxSeo: 'Temi: robot, casa, medicina, lavoro e clima', idxDesc: 'Le pagine tematiche di FAIND sull\'intelligenza artificiale: robot e umanoidi, AI in casa, medicina e salute, lavoro, clima e ambiente. Aggiornate ogni ora.',
    idxLede: 'Cinque pagine sempre aggiornate per seguire l\'intelligenza artificiale dove tocca la vita di tutti i giorni: una spiegazione chiara del tema, le notizie della settimana con la fonte, i video e una cronologia che cresce nel tempo.',
    thisWeek: (n) => `${n1(n, 'notizia', 'notizie')} questa settimana`, foot: ['Chi siamo', 'Chi c\'è dietro FAIND', 'Glossario', 'Feed RSS', 'Privacy e note legali'] },
  en: { locale: 'en-GB', topics: 'Topics', kicker: 'Topic', pageLang: 'Page language', back: '← All news', home: 'Back to FAIND news',
    liveTitle: 'Where things stand, updated every hour', stamp: (t) => `Last updated: ${t} (Italian time). This section is compiled automatically from the data FAIND collects.`,
    understand: 'Understanding the topic', watch: 'What we follow', latest: (s) => `Latest news on ${s}`, video: 'Videos',
    timeline: 'Timeline', timelineIntro: 'The most widely covered story of each day, newest first. The list grows over time; each headline links to the original article.',
    faq: 'Frequently asked questions', others: 'Other FAIND topics', focus: 'Focus on the home page', outlets: (n) => `${n} outlets`, inLang: { it: 'in Italian', en: 'in English', fr: 'in French', de: 'in German' },
    none: 'No significant stories on this topic have appeared in the last seven days among the sources we follow. Further down you will find the timeline of previous weeks.',
    week: (n, m) => `In the last seven days FAIND has collected <strong>${n1(n, 'story', 'stories')}</strong> on this topic from <strong>${n1(m, 'outlet', 'outlets')}</strong>.`,
    top: (t, s, k) => `The most widely covered is “${t}”, published by ${s} and picked up by ${k === 1 ? 'one other outlet' : `${k} other outlets`}.`,
    recent: (t, s) => `The most recent is “${t}”, published by ${s}.`, active: (l) => `The most active outlets this week: ${l}.`,
    total: (d, n) => `Since ${d}, the day we started following the topic, we have catalogued <strong>${n}</strong> stories.`,
    idxTitle: 'FAIND topics', idxSeo: 'Topics: robots, home, medicine, work and climate', idxDesc: 'FAIND topic pages on artificial intelligence: robots and humanoids, AI at home, medicine and health, work, climate and environment. Updated every hour.',
    idxLede: 'Five always-updated pages to follow artificial intelligence where it touches everyday life: a clear explanation of the topic, the week\'s news with the source, videos and a timeline that grows over time.',
    thisWeek: (n) => `${n1(n, 'story', 'stories')} this week`, foot: ['About us', 'Who is behind FAIND', 'Glossary', 'RSS feed', 'Privacy and legal notes'] },
  fr: { locale: 'fr-FR', topics: 'Thèmes', kicker: 'Thème', pageLang: 'Langue de la page', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND',
    liveTitle: 'Le point, mis à jour chaque heure', stamp: (t) => `Dernière mise à jour : ${t} (heure italienne). Cette section est compilée automatiquement à partir des données recueillies par FAIND.`,
    understand: 'Comprendre le sujet', watch: 'Ce que nous suivons', latest: (s) => `Les dernières actualités sur ${s}`, video: 'Vidéos',
    timeline: 'Chronologie', timelineIntro: 'L\'actualité la plus reprise de chaque jour, de la plus récente à la plus ancienne. La liste s\'allonge avec le temps ; chaque titre mène à l\'article original.',
    faq: 'Questions fréquentes', others: 'Les autres thèmes de FAIND', focus: 'Le Focus en page d\'accueil', outlets: (n) => `${n} médias`, inLang: { it: 'en italien', en: 'en anglais', fr: 'en français', de: 'en allemand' },
    none: 'Aucune actualité marquante sur ce thème n\'est parue ces sept derniers jours parmi les sources que nous suivons. Plus bas, la chronologie des semaines précédentes.',
    week: (n, m) => `Ces sept derniers jours, FAIND a recueilli <strong>${n1(n, 'actualité', 'actualités')}</strong> sur ce thème auprès de <strong>${n1(m, 'média', 'médias')}</strong>.`,
    top: (t, s, k) => `La plus reprise est « ${t} », publiée par ${s} et relayée par ${k === 1 ? 'un autre média' : `${k} autres médias`}.`,
    recent: (t, s) => `La plus récente est « ${t} », publiée par ${s}.`, active: (l) => `Les médias les plus actifs de la semaine : ${l}.`,
    total: (d, n) => `Depuis le ${d}, jour où nous avons commencé à suivre ce thème, <strong>${n}</strong> actualités ont été répertoriées.`,
    idxTitle: 'Les thèmes de FAIND', idxSeo: 'Thèmes : robots, maison, médecine, travail et climat', idxDesc: 'Les pages thématiques de FAIND sur l\'intelligence artificielle : robots et humanoïdes, IA à la maison, médecine et santé, travail, climat et environnement. Mises à jour chaque heure.',
    idxLede: 'Cinq pages toujours à jour pour suivre l\'intelligence artificielle là où elle touche la vie quotidienne : une explication claire du sujet, les actualités de la semaine avec la source, les vidéos et une chronologie qui s\'enrichit avec le temps.',
    thisWeek: (n) => `${n1(n, 'actualité', 'actualités')} cette semaine`, foot: ['Qui sommes-nous', 'Qui est derrière FAIND', 'Glossaire', 'Flux RSS', 'Confidentialité et mentions légales'] },
  de: { locale: 'de-DE', topics: 'Themen', kicker: 'Thema', pageLang: 'Sprache der Seite', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten',
    liveTitle: 'Der Stand, stündlich aktualisiert', stamp: (t) => `Zuletzt aktualisiert: ${t} (italienische Zeit). Dieser Abschnitt wird automatisch aus den von FAIND gesammelten Daten erstellt.`,
    understand: 'Das Thema verstehen', watch: 'Was wir verfolgen', latest: (s) => `Neueste Nachrichten zu ${s}`, video: 'Videos',
    timeline: 'Chronik', timelineIntro: 'Die meistaufgegriffene Nachricht jedes Tages, die neueste zuerst. Die Liste wächst mit der Zeit; jede Überschrift führt zum Originalartikel.',
    faq: 'Häufige Fragen', others: 'Weitere FAIND-Themen', focus: 'Der Fokus auf der Startseite', outlets: (n) => `${n} Medien`, inLang: { it: 'auf Italienisch', en: 'auf Englisch', fr: 'auf Französisch', de: 'auf Deutsch' },
    none: 'In den letzten sieben Tagen sind bei den von uns verfolgten Quellen keine nennenswerten Nachrichten zu diesem Thema erschienen. Weiter unten steht die Chronik der vorangegangenen Wochen.',
    week: (n, m) => `In den letzten sieben Tagen hat FAIND <strong>${n1(n, 'Nachricht', 'Nachrichten')}</strong> zu diesem Thema aus <strong>${n1(m, 'Medium', 'Medien')}</strong> gesammelt.`,
    top: (t, s, k) => `Am häufigsten aufgegriffen wurde „${t}“, veröffentlicht von ${s} und von ${k === 1 ? 'einem weiteren Medium' : `${k} weiteren Medien`} übernommen.`,
    recent: (t, s) => `Die neueste ist „${t}“, veröffentlicht von ${s}.`, active: (l) => `Die aktivsten Medien der Woche: ${l}.`,
    total: (d, n) => `Seit dem ${d}, dem Tag, an dem wir begonnen haben, das Thema zu verfolgen, wurden <strong>${n}</strong> Nachrichten erfasst.`,
    idxTitle: 'Die Themen von FAIND', idxSeo: 'Themen: Roboter, Zuhause, Medizin, Arbeit und Klima', idxDesc: 'Die Themenseiten von FAIND zur künstlichen Intelligenz: Roboter und Humanoide, KI zu Hause, Medizin und Gesundheit, Arbeit, Klima und Umwelt. Stündlich aktualisiert.',
    idxLede: 'Fünf stets aktuelle Seiten, um künstliche Intelligenz dort zu verfolgen, wo sie den Alltag berührt: eine klare Erklärung des Themas, die Nachrichten der Woche mit Quelle, Videos und eine Chronik, die mit der Zeit wächst.',
    thisWeek: (n) => `${n1(n, 'Nachricht', 'Nachrichten')} diese Woche`, foot: ['Über uns', 'Wer hinter FAIND steht', 'Glossar', 'RSS-Feed', 'Datenschutz und rechtliche Hinweise'] }
};
const fmt = (lang, opts) => new Intl.DateTimeFormat(UI[lang].locale, { timeZone: 'Europe/Rome', ...opts });
const fmtDay = (iso, lang) => fmt(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(asDate(iso));
const fmtShort = (iso, lang) => fmt(lang, { day: 'numeric', month: 'short' }).format(asDate(iso));
const fmtStamp = (ms, lang) => fmt(lang, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(ms);

/* Notizie e video che appartengono a un tema (stesse regole del Focus in home) */
export function matchTopic(cfgTopic, news, videos) {
  const re = new RegExp(cfgTopic.keywords, 'i');
  const text = (n) => `${tx(n.title)} ${tx(n.summary) || ''}`;
  const seen = new Set();
  const uniq = (list, key) => list.filter(x => { const k = key(x); if (!k || seen.has(k)) return false; seen.add(k); return true; });
  return {
    news: uniq(news.filter(n => n.link && n.link.url && (n._topic === cfgTopic.key || re.test(text(n)))), n => n.link.url)
      .sort((a, b) => b.date.localeCompare(a.date)),
    videos: uniq(videos.filter(v => v._topic === cfgTopic.key || re.test(text(v))), v => v.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  };
}

/* Aggiorna la memoria del tema: totale notizie viste e cronologia (una notizia al giorno, la più ripresa) */
export function updateHistory(prev, news, now) {
  const h = { since: (prev && prev.since) || romeDay(now), total: (prev && prev.total) || 0, seen: [...((prev && prev.seen) || [])], timeline: [...((prev && prev.timeline) || [])] };
  const seen = new Set(h.seen);
  for (const n of news) if (!seen.has(n.id)) { seen.add(n.id); h.seen.push(n.id); h.total++; }
  h.seen = h.seen.slice(-SEEN_MAX);
  const byDay = new Map();
  for (const n of news) {
    const d = romeDay(new Date(n.date));
    const best = byDay.get(d);
    if (!best || (n.coverage || 1) > (best.coverage || 1) || ((n.coverage || 1) === (best.coverage || 1) && n.date > best.date)) byDay.set(d, n);
  }
  for (const [d, n] of byDay) {
    const row = { d, t: tx(n.title), s: n.source.name, u: n.link.url, c: n.coverage || 1 };
    const i = h.timeline.findIndex(x => x.d === d);
    if (i < 0) h.timeline.push(row);
    else if (row.c >= (h.timeline[i].c || 1)) h.timeline[i] = row;
  }
  h.timeline = h.timeline.sort((a, b) => b.d.localeCompare(a.d)).slice(0, TIMELINE_MAX);
  return h;
}

/* Frasi che si scrivono da sole con i dati raccolti */
export function liveSentences(news, hist, now, lang = 'it') {
  const u = UI[lang];
  const week = news.filter(n => now - new Date(n.date).getTime() < 7 * 864e5);
  const out = [];
  if (!week.length) out.push(u.none);
  else {
    const count = {};
    week.forEach(n => sourcesOf(n).forEach(s => { count[s] = (count[s] || 0) + 1; }));
    const names = Object.keys(count).sort((a, b) => count[b] - count[a] || a.localeCompare(b));
    out.push(u.week(week.length, names.length));
    const top = [...week].sort((a, b) => (b.coverage || 1) - (a.coverage || 1) || b.date.localeCompare(a.date))[0];
    if (top && (top.coverage || 1) >= 2) out.push(u.top(esc(tx(top.title)), esc(top.source.name), (top.coverage || 1) - 1));
    else out.push(u.recent(esc(tx(week[0].title)), esc(week[0].source.name)));
    if (names.length >= 2) out.push(u.active(names.slice(0, 3).map(s => `${esc(s)} (${count[s]})`).join(', ')));
  }
  if (hist.total > week.length) out.push(u.total(fmtDay(hist.since, lang), hist.total));
  return out;
}

const STYLE = `
    .lsw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 13.5px; margin-bottom: 14px; }
    .lsw__lab { color: var(--muted); } .lsw a { color: var(--ink); font-weight: 600; } .lsw__on { font-weight: 800; color: #4293B9; }
    .tp__kicker { display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--tp); padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; }
    .legal.tp { max-width: 820px; }
    .tp .legal__title { margin-bottom: 14px; line-height: 1.08; }
    .tp__live { border: 1px solid var(--rule); border-left: 5px solid var(--tp); border-radius: 14px; background: var(--surface); padding: 18px 20px; margin: 22px 0 6px; }
    .tp__live h2 { margin-bottom: 8px; }
    .legal .tp__live p { color: var(--ink); }
    .legal .tp__stamp { font-size: 13px; color: var(--muted); margin-top: 10px; }
    .legal.tp h3 { font-size: 17.5px; font-weight: 760; font-stretch: 88%; color: var(--ink); margin: 18px 0 6px; }
    .legal ul.tp__list { list-style: none; padding-left: 0; gap: 0; }
    .legal ul.tp__list li { padding: 11px 0; border-bottom: 1px solid var(--rule); display: grid; gap: 3px; }
    .tp__list a { color: var(--ink); font-weight: 650; text-decoration: none; line-height: 1.3; font-size: 16.5px; }
    .tp__list a:hover { color: var(--link); text-decoration: underline; }
    .tp__list span { font-size: 13px; color: var(--muted); }
    .tp__videos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 8px; }
    .tp__videos a { text-decoration: none; color: var(--ink); font-weight: 650; font-size: 14.5px; line-height: 1.3; display: grid; gap: 6px; align-content: start; }
    .tp__videos img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 10px; background: var(--rule); }
    .tp__videos span { font-size: 12.5px; color: var(--muted); font-weight: 500; }
    .legal ul.tp__time { list-style: none; padding-left: 0; gap: 0; border-left: 3px solid var(--tp); margin-left: 4px; }
    .legal ul.tp__time li { padding: 8px 0 8px 16px; font-size: 15px; line-height: 1.45; }
    .tp__time time { font-weight: 800; color: var(--ink); margin-right: 6px; white-space: nowrap; }
    .tp__time a { color: var(--ink); }
    .tp__others { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tp__others a { padding: 7px 13px; border-radius: 999px; border: 1px solid var(--rule); background: var(--surface); color: var(--ink); text-decoration: none; font-size: 14px; font-weight: 600; }
    .tp__cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
    .tp__cards a { display: block; padding: 18px; border: 1px solid var(--rule); border-top: 5px solid var(--tp); border-radius: 14px; background: var(--surface); text-decoration: none; color: var(--ink); }
    .tp__cards strong { display: block; font-size: 19px; font-stretch: 86%; margin-bottom: 6px; }
    .tp__cards span { font-size: 14.5px; color: var(--muted); line-height: 1.5; }
    @media (max-width: 620px) { .tp__videos, .tp__cards { grid-template-columns: 1fr; } }`;

// alts: { it: url, en: url, … } delle versioni della stessa pagina nelle altre lingue
function shell({ lang, title, desc, url, alts, color, jsonld, main, crumbName }) {
  const u = UI[lang], up = lang === 'it' ? '../' : '../../';
  const sw = LANGS.map(k => k === lang ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>`
    : `<a href="${esc(alts[k])}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ');
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} | FAIND</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(url)}">
${LANGS.map(k => `  <link rel="alternate" hreflang="${k}" href="${esc(alts[k])}">`).join('\n')}
  <link rel="alternate" hreflang="x-default" href="${esc(alts.it)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}assets/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${up}assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <link rel="alternate" type="application/rss+xml" title="FAIND – Notizie AI" href="${up}feed.xml">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>${STYLE}
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="${up}stats.js" defer></script>
  <script src="${up}nav.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="${up}" aria-label="FAIND — Home"><img class="brand__img" src="${up}assets/logo.webp" width="510" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="${up}">${u.back}</a>
    </div>
  </header>
  <main class="wrap legal tp" style="--tp:${color}">
    <p class="lsw"><span class="lsw__lab">${u.pageLang}:</span> ${sw}</p>
    <p class="np__crumb"><a href="${up}">FAIND</a> › <a href="./">${u.topics}</a>${crumbName ? ' › ' + esc(crumbName) : ''}</p>
${main}
    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="${up}#chi-siamo">${u.foot[0]}</a> · <a href="./">${u.topics}</a> · <a href="${up}${GLOSS[lang]}">${u.foot[2]}</a> · <a href="${up}${ABOUT[lang]}">${u.foot[1]}</a> · <a href="${up}feed.xml">${u.foot[3]}</a> · <a href="${up}privacy.html">${u.foot[4]}</a></p></div></footer>
</body>
</html>
`;
}

function topicPage(key, lang, m, hist, now) {
  const T = topicText(key, lang), u = UI[lang], up = lang === 'it' ? '../' : '../../';
  const url = topicUrl(key, lang);
  const alts = Object.fromEntries(LANGS.map(k => [k, topicUrl(key, k)]));
  const live = liveSentences(m.news, hist, now, lang);
  // prima le notizie nella lingua della pagina, poi le altre
  const ordered = [...m.news.filter(n => (n.lang || 'it') === lang), ...m.news.filter(n => (n.lang || 'it') !== lang)].slice(0, 10)
    .sort((a, b) => ((b.lang || 'it') === lang) - ((a.lang || 'it') === lang) || b.date.localeCompare(a.date));
  const newsList = ordered.map(n => {
    const href = n.page ? up + n.page : n.link.url;
    const ext = n.page ? '' : ' target="_blank" rel="noopener noreferrer"';
    const nl = n.lang || 'it';
    const langNote = nl !== lang && u.inLang[nl] ? ` · ${u.inLang[nl]}` : '';
    const cov = (n.coverage || 1) >= 2 ? ` · ${u.outlets(n.coverage)}` : '';
    return `        <li><a href="${esc(href)}"${ext}>${esc(tx(n.title))}</a><span>${esc(n.source.name)} · ${esc(fmtShort(n.date, lang))}${cov}${langNote}</span></li>`;
  }).join('\n');
  const vids = m.videos.slice(0, 3).map(v =>
    `        <a href="${esc(v.link.url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(v.image || '')}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">${esc(tx(v.title))}<span>${esc(v.source.name)} · ${esc(fmtShort(v.date, lang))}</span></a>`).join('\n');
  const time = hist.timeline.slice(0, TIMELINE_SHOW).map(r =>
    `        <li><time datetime="${esc(r.d)}">${esc(fmtShort(r.d, lang))}</time> <a href="${esc(r.u)}" target="_blank" rel="noopener noreferrer">${esc(r.t)}</a> <span>(${esc(r.s)}${(r.c || 1) >= 2 ? `, ${u.outlets(r.c)}` : ''})</span></li>`).join('\n');
  const others = Object.keys(TOPICS).filter(k => k !== key).map(k => { const o = topicText(k, lang); return `<a href="${o.slug}.html">${esc(o.name)}</a>`; }).join('');
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, url, name: T.title, description: T.desc, inLanguage: u.locale, dateModified: new Date(now).toISOString(),
      isPartOf: { '@id': SITE + '#website' }, publisher: { '@id': SITE + '#org' }, about: T.name },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE },
      { '@type': 'ListItem', position: 2, name: u.topics, item: SITE + TOPIC_DIR[lang] },
      { '@type': 'ListItem', position: 3, name: T.name, item: url }] },
    { '@type': 'FAQPage', mainEntity: T.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
  ] };
  const main = `    <span class="tp__kicker">${u.kicker} · ${esc(T.name)}</span>
    <h1 class="legal__title">${esc(T.title)}</h1>
    <p class="legal__lede">${esc(T.lede)}</p>

    <div class="tp__live" id="oggi">
      <h2>${u.liveTitle}</h2>
${live.map(s => `      <p>${s}</p>`).join('\n')}
      <p class="tp__stamp">${esc(u.stamp(fmtStamp(now, lang)))}</p>
    </div>

    <section id="capire">
      <h2>${u.understand}</h2>
${T.body.map(([h, p]) => `      <h3>${esc(h)}</h3>\n      <p>${p.replace(/\{home\}/g, up)}</p>`).join('\n')}
      <h3>${u.watch}</h3>
      <ul>
${T.watch.map(w => `        <li>${esc(w)}</li>`).join('\n')}
      </ul>
    </section>
${newsList ? `
    <section id="notizie">
      <h2>${esc(u.latest(T.short))}</h2>
      <ul class="tp__list">
${newsList}
      </ul>
    </section>
` : ''}${vids ? `
    <section id="video">
      <h2>${u.video}</h2>
      <div class="tp__videos">
${vids}
      </div>
    </section>
` : ''}${time ? `
    <section id="cronologia">
      <h2>${u.timeline}</h2>
      <p>${esc(u.timelineIntro)}</p>
      <ul class="tp__time">
${time}
      </ul>
    </section>
` : ''}
    <section id="domande">
      <h2>${u.faq}</h2>
${T.faq.map(([q, a]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n')}
    </section>

    <section id="altri-temi">
      <h2>${u.others}</h2>
      <div class="tp__others">${others}<a href="${up}#${T.home}">${u.focus}</a></div>
    </section>
`;
  return shell({ lang, title: T.title, desc: T.desc, url, alts, color: T.color, jsonld, main, crumbName: T.name });
}

function indexPage(lang, stats, now) {
  const u = UI[lang];
  const url = SITE + TOPIC_DIR[lang];
  const alts = Object.fromEntries(LANGS.map(k => [k, SITE + TOPIC_DIR[k]]));
  const cards = Object.keys(TOPICS).map(k => { const T = topicText(k, lang);
    return `      <a href="${T.slug}.html" style="--tp:${T.color}"><strong>${esc(T.name)}</strong><span>${esc(strip(T.lede).slice(0, 150).replace(/\s+\S*$/, ''))}…${stats[k] ? ` <br><b>${u.thisWeek(stats[k])}</b>` : ''}</span></a>`; }).join('\n');
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: u.idxTitle, inLanguage: u.locale, dateModified: new Date(now).toISOString(),
    isPartOf: { '@id': SITE + '#website' }, hasPart: Object.keys(TOPICS).map(k => ({ '@type': 'WebPage', name: topicText(k, lang).title, url: topicUrl(k, lang) })) };
  const main = `    <h1 class="legal__title">${esc(u.idxTitle)}</h1>
    <p class="legal__lede">${esc(u.idxLede)}</p>
    <div class="tp__cards">
${cards}
    </div>
`;
  return shell({ lang, title: u.idxSeo, desc: u.idxDesc, url, alts, color: '#4293B9', jsonld, main, crumbName: '' });
}

/* Genera le pagine in tutte le lingue e restituisce la memoria aggiornata (da salvare in news.json → topics) */
export async function buildTopics({ cfgTopics, news, videos, items, prev, root, now }) {
  const pageOf = new Map((items || []).map(i => [i.id, i.page]));
  const pool = (news || []).map(n => ({ ...n, page: n.page || pageOf.get(n.id) || null }));
  const memory = {}, stats = {}, urls = [], matched = {};
  for (const cfg of cfgTopics || []) {
    if (!TOPICS[cfg.key]) continue;
    const m = matchTopic(cfg, pool, videos || []);
    matched[cfg.key] = m;
    memory[cfg.key] = updateHistory(prev && prev[cfg.key], m.news, now);
    stats[cfg.key] = m.news.filter(n => now - new Date(n.date).getTime() < 7 * 864e5).length;
  }
  for (const lang of LANGS) {
    const dir = path.join(root, TOPIC_DIR[lang]);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), indexPage(lang, stats, now));
    urls.push(SITE + TOPIC_DIR[lang]);
    for (const key of Object.keys(matched)) {
      await writeFile(path.join(dir, `${topicText(key, lang).slug}.html`), topicPage(key, lang, matched[key], memory[key], now));
      urls.push(topicUrl(key, lang));
    }
  }

  // Aggiunge le pagine alla sitemap già scritta da build-pages.mjs
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const today = new Date(now).toISOString().slice(0, 10);
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`))
      .map(u => `<url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>hourly</changefreq><priority>0.8</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con i temi:', e.message); }
  console.log(`★ temi (${LANGS.length} lingue):`, Object.entries(stats).map(([k, n]) => `${k}=${n}`).join(' '));
  return memory;
}
