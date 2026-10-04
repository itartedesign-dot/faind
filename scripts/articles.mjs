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
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://faind.org/';
const DIR = 'approfondimenti/';
const UPDATED = '2026-10-03';

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
      ['Come prepararsi', 'Non serve diventare programmatori. Serve imparare a usare bene gli strumenti nel proprio mestiere: fare la richiesta giusta, controllare il risultato, sapere dove l\'AI sbaglia. Chi sa farlo oggi lavora più in fretta di chi la ignora. FAIND pubblica ogni giorno la <a href="../#job">classifica dei lavori più richiesti nell\'AI</a> e segue il tema nella pagina <a href="../temi/ai-lavoro.html">AI e lavoro</a>.']
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
    title: 'Imparare a usare l\'intelligenza artificiale: da dove iniziare',
    card: 'Una guida per chi parte da zero: quale usare, cosa chiederle, cosa evitare.',
    desc: 'Come imparare a usare l\'intelligenza artificiale partendo da zero: come funziona, quale AI scegliere, come scrivere una richiesta, come usarla per studiare e lavorare e gli errori da evitare.',
    lede: 'Imparare a usare l\'intelligenza artificiale non richiede studi tecnici. Richiede un\'ora per provare e qualche regola per non farsi ingannare. Questa è la guida che avremmo voluto leggere all\'inizio.',
    brief: ['Si comincia gratis: tutti i principali assistenti hanno un piano gratuito.', 'La qualità della risposta dipende dalla chiarezza della richiesta.', 'Mai fidarsi senza controllare, mai inserire dati riservati.'],
    sections: [
      ['Come funziona l\'AI, in due righe', 'Gli assistenti come ChatGPT, Claude e Gemini sono <a href="../glossario/#llm">modelli linguistici</a>: hanno letto enormi quantità di testo e prevedono, parola dopo parola, la risposta più plausibile. Per questo scrivono bene e, a volte, dicono con sicurezza cose sbagliate.'],
      ['Quale usare per iniziare', 'Uno qualsiasi dei principali, nella versione gratuita: non serve scegliere quello perfetto. Se usi già Gmail e Documenti, Gemini è il più comodo; per un uso generale va benissimo ChatGPT; per scrivere e ragionare su testi lunghi molti preferiscono Claude. Le differenze e i prezzi sono nella pagina <a href="../confronto/">Le AI a confronto</a>.'],
      ['Come scrivere una buona richiesta', 'La richiesta si chiama <a href="../glossario/#prompt">prompt</a>. Funziona meglio se contiene quattro cose: <strong>chi sei</strong> o per chi è il risultato, <strong>cosa vuoi</strong> con precisione, <strong>il materiale</strong> su cui lavorare, <strong>il formato</strong> della risposta. "Scrivi una mail" dà un risultato generico; "scrivi una mail di tre righe a un cliente per spostare l\'appuntamento di giovedì, tono cordiale" dà un risultato utile. Se la risposta non convince, si corregge: è una conversazione, non una ricerca.'],
      ['Come usare l\'AI per studiare e a scuola', 'Funziona bene per farsi spiegare un argomento in parole più semplici, farsi interrogare, riassumere appunti propri, trovare esempi. Funziona male, e non insegna nulla, se le si chiede di fare i compiti al posto nostro. La regola pratica: usarla come un tutor, non come un sostituto.'],
      ['Gli errori da evitare', 'Tre soprattutto. Fidarsi senza verificare: date, numeri e citazioni vanno sempre controllati. Inserire dati riservati: documenti di lavoro, dati di clienti, informazioni sanitarie. Pensare che una risposta ben scritta sia per forza corretta. Per i termini che incontri, c\'è il <a href="../glossario/">glossario</a>.']
    ],
    faq: [['Come si impara a usare l\'intelligenza artificiale?', 'Provando con un assistente gratuito su compiti reali: una mail, un riassunto, una spiegazione. Si migliora imparando a scrivere richieste precise e a verificare le risposte.'], ['Serve pagare per usare l\'intelligenza artificiale?', 'No. Tutti i principali servizi hanno un piano gratuito sufficiente per imparare. I piani a pagamento servono a chi la usa molto.']],
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
    title: 'Intelligenza artificiale: rischi e vantaggi',
    card: 'I benefici concreti e i rischi reali, messi sulla stessa bilancia.',
    desc: 'Intelligenza artificiale: rischi e vantaggi a confronto. I benefici in medicina, lavoro e vita quotidiana, i rischi per privacy, lavoro e informazione, e le opportunità da cogliere.',
    lede: 'Rischi e vantaggi dell\'intelligenza artificiale si cercano quasi sempre insieme, e a ragione: sono le due facce della stessa tecnologia. Ecco un bilancio senza entusiasmi e senza allarmi.',
    brief: ['I vantaggi più solidi sono in ricerca scientifica, medicina e produttività.', 'I rischi più concreti riguardano errori, privacy, disinformazione e lavoro.', 'Quasi ogni vantaggio ha un rischio corrispondente: conta come la si usa.'],
    sections: [
      ['I vantaggi dell\'intelligenza artificiale', 'Nella <strong>ricerca</strong> accelera scoperte che richiedevano anni: la previsione della forma delle proteine, premiata con il Nobel per la chimica nel 2024, è l\'esempio più noto. In <strong>medicina</strong> aiuta a leggere esami e immagini e a individuare prima alcune malattie. Nel <strong>lavoro</strong> toglie tempo ai compiti ripetitivi. Nella <strong>vita quotidiana</strong> traduce, riassume, spiega, rende accessibili contenuti a chi ha una disabilità visiva o uditiva.'],
      ['I rischi dell\'intelligenza artificiale', 'Può <strong>sbagliare</strong> con tono sicuro, e in sanità o giustizia un errore pesa. Può riprodurre <strong>discriminazioni</strong> presenti nei dati su cui è stata addestrata. Mette pressione sulla <strong>privacy</strong>, perché funziona con grandi quantità di dati personali. Rende facile produrre <strong>disinformazione</strong> e falsi realistici. E cambia il <strong>lavoro</strong> più in fretta di quanto molte persone riescano ad adattarsi.'],
      ['Rischi e opportunità per la salute mentale', 'È una delle ricerche in crescita. I chatbot sono sempre disponibili e non giudicano, e alcune persone li usano come primo sfogo. Ma non sono terapeuti: non conoscono la persona, possono dare risposte inadeguate nei momenti di crisi e favorire l\'isolamento. Per un disagio serio serve un professionista.'],
      ['Il bilancio', 'Lo stesso strumento che aiuta un medico può sbagliare una diagnosi; quello che traduce un testo può scrivere una truffa. Il risultato dipende da tre cose: le regole, la qualità dei controlli e la consapevolezza di chi lo usa. Approfondimenti: <a href="intelligenza-artificiale-e-pericolosa.html">l\'AI è pericolosa?</a>, <a href="intelligenza-artificiale-e-affidabile.html">l\'AI è affidabile?</a>, <a href="../temi/ai-medicina-salute.html">AI in medicina</a>.']
    ],
    faq: [['Quali sono i vantaggi dell\'intelligenza artificiale?', 'Accelera la ricerca scientifica, aiuta medici e professionisti, automatizza compiti ripetitivi e rende più accessibili informazioni e servizi.'], ['Quali sono i rischi dell\'intelligenza artificiale?', 'Errori presentati come certezze, discriminazioni, violazioni della privacy, disinformazione, truffe e trasformazioni rapide del lavoro.']],
    sources: [] },

  { slug: 'perche-intelligenza-artificiale-consuma-acqua-energia', img: 'art-06.webp',
    title: 'Perché l\'intelligenza artificiale consuma acqua ed energia?',
    card: 'Data center, elettricità e raffreddamento: quanto inquina davvero l\'AI.',
    desc: 'Perché l\'intelligenza artificiale consuma acqua ed energia elettrica? Come funzionano i data center, quanto consumano, perché l\'AI inquina e come può aiutare il risparmio energetico.',
    lede: '"Perché l\'AI consuma acqua" e "perché l\'AI inquina" sono tra le domande più cercate. La risposta sta in edifici che quasi nessuno vede: i data center.',
    brief: ['L\'AI gira in data center che consumano molta elettricità.', 'L\'acqua serve a raffreddare i computer, direttamente o tramite le centrali elettriche.', 'L\'impatto dipende da quale energia alimenta gli impianti.'],
    sections: [
      ['Perché l\'intelligenza artificiale consuma energia elettrica', 'Ogni risposta di un chatbot è il risultato di miliardi di calcoli eseguiti da processori molto potenti, le <a href="../glossario/#gpu">GPU</a>, ospitati in <a href="../glossario/#data-center">data center</a>. L\'energia serve in due momenti: l\'<a href="../glossario/#addestramento">addestramento</a> dei modelli, che dura settimane, e l\'uso quotidiano, che consuma meno per singola richiesta ma si ripete miliardi di volte.'],
      ['Quanto consuma', 'Secondo l\'Agenzia internazionale dell\'energia, nel 2024 i data center hanno consumato circa l\'1,5% dell\'elettricità mondiale, e il loro consumo potrebbe circa raddoppiare entro il 2030, trainato soprattutto dall\'AI. Quanto pesi una singola richiesta dipende dal modello e da come si misura: i numeri che circolano vanno sempre letti con la fonte accanto.'],
      ['Perché l\'AI consuma acqua', 'I computer producono calore e vanno raffreddati. Molti impianti usano sistemi ad acqua, parte della quale evapora. Altra acqua viene consumata indirettamente, dalle centrali che producono l\'elettricità. La quantità cambia molto con il clima del luogo e la tecnologia: per questo i nuovi data center sono spesso contestati dove l\'acqua scarseggia.'],
      ['L\'AI inquina?', 'Dipende dall\'energia che la alimenta. Un data center collegato a fonti rinnovabili ha un impatto molto diverso da uno alimentato a gas o carbone. Le grandi aziende stanno firmando contratti per solare, eolico e nucleare, ma hanno anche riconosciuto che l\'AI rende più difficile rispettare i propri obiettivi sulle emissioni.'],
      ['Il ruolo dell\'AI nel risparmio energetico', 'La stessa tecnologia viene usata per prevedere la produzione di sole e vento, bilanciare le reti elettriche e ridurre gli sprechi in edifici e fabbriche. Se il bilancio finale sarà positivo non è ancora deciso. FAIND segue il tema ogni giorno nella pagina <a href="../temi/ai-clima-ambiente.html">AI, clima e ambiente</a>.']
    ],
    faq: [['Perché l\'intelligenza artificiale consuma acqua?', 'Perché i computer dei data center producono calore e molti impianti li raffreddano con acqua. Altra acqua è usata dalle centrali che generano l\'elettricità.'], ['Usare ChatGPT inquina?', 'Ogni richiesta consuma poca energia, ma moltiplicata per miliardi di utilizzi diventa rilevante. L\'impatto dipende dall\'efficienza del data center e dalla fonte di energia.']],
    sources: ['Agenzia internazionale dell\'energia (IEA), "Energy and AI" (2025)'] },

  { slug: 'intelligenza-artificiale-e-affidabile', img: 'art-07.webp',
    title: 'L\'intelligenza artificiale è affidabile? Quando può sbagliare',
    card: 'Perché l\'AI sbaglia con tono sicuro e come capire quando fidarsi.',
    desc: 'L\'intelligenza artificiale è affidabile e sicura? Perché può sbagliare, cosa sono le allucinazioni, quando fidarsi e come verificare le risposte di ChatGPT, Claude e Gemini.',
    lede: '"L\'intelligenza artificiale è affidabile?" e "può sbagliare?" sono due delle domande più cercate. La risposta onesta: è affidabile per alcune cose, per altre no, e non avvisa quando sbaglia.',
    brief: ['L\'AI può inventare fatti, date e citazioni: si chiamano allucinazioni.', 'È più affidabile su testi che le fornisci tu che su fatti che deve ricordare.', 'La verifica resta sempre a chi la usa.'],
    sections: [
      ['Perché l\'intelligenza artificiale può sbagliare', 'Un modello linguistico non consulta un archivio di fatti: genera la risposta più plausibile. Quando non sa, non dice "non lo so": costruisce una risposta verosimile. È ciò che si chiama <a href="../glossario/#allucinazione">allucinazione</a>. Il caso più citato è quello di alcuni avvocati sanzionati negli Stati Uniti per aver depositato atti con precedenti inesistenti, inventati da un chatbot.'],
      ['Quando è affidabile', 'Funziona bene quando lavora su materiale che le dai tu: riassumere un documento, riscrivere un testo, tradurre, mettere ordine in appunti, spiegare un concetto noto. Funziona meglio anche quando cerca sul web e cita le fonti, perché le puoi controllare.'],
      ['Quando non lo è', 'È meno affidabile su numeri, date, citazioni, nomi, norme di legge, notizie recenti e calcoli complessi. E in tutto ciò che riguarda salute, soldi e questioni legali, dove un errore ha conseguenze: lì può aiutare a capire, ma non a decidere.'],
      ['L\'intelligenza artificiale è sicura?', 'Sicurezza vuol dire anche dati. Ciò che scrivi a un chatbot viene elaborato sui server dell\'azienda e, secondo le impostazioni, può essere usato per migliorare i modelli. Meglio non inserire dati personali altrui, documenti riservati o credenziali, e controllare le impostazioni sulla privacy.'],
      ['Come verificare una risposta', 'Chiedi le fonti e aprile. Controlla numeri e citazioni su un sito ufficiale. Rifai la domanda in un altro modo, o a un\'altra AI: se le risposte cambiano, c\'è da dubitare. E ricorda che una risposta ben scritta non è per forza una risposta giusta.']
    ],
    faq: [['L\'intelligenza artificiale può sbagliare?', 'Sì. Può inventare informazioni false presentandole con sicurezza, soprattutto su fatti, numeri e citazioni. Per questo le risposte vanno verificate.'], ['Ci si può fidare di ChatGPT?', 'Per riassumere, riscrivere e spiegare sì, con un controllo finale. Per decisioni su salute, denaro e questioni legali serve sempre un professionista.']],
    sources: [] },

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
    sources: [] }
];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');

function shell({ title, desc, url, image, jsonld, main, type = 'article' }) {
  return `<!doctype html>
<html lang="it" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)} | FAIND</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="../assets/icon-180.png">
  <link rel="manifest" href="../manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="../assets/fonts/archivo.css">
  <link rel="stylesheet" href="../style.css">
  <style>
    .legal.art { max-width: 800px; }
    .art__kick { display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: #4293B9; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; text-decoration: none; }
    .art .legal__title { line-height: 1.08; margin-bottom: 12px; }
    .art__img { width: 100%; height: auto; border-radius: 14px; display: block; margin: 18px 0 6px; }
    .art__brief { border: 1px solid var(--rule); border-left: 5px solid #4293B9; border-radius: 14px; background: var(--surface); padding: 16px 20px; margin: 20px 0 4px; }
    .legal .art__brief h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 8px; }
    .legal .art__brief ul { color: var(--ink); }
    .legal.art h3 { font-size: 17.5px; font-weight: 760; color: var(--ink); margin: 18px 0 6px; }
    .legal .art__src { font-size: 13.5px; }
    .art__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 14px; }
    .art__grid a { display: block; text-decoration: none; color: var(--ink); border: 1px solid var(--rule); border-radius: 14px; overflow: hidden; background: var(--surface); }
    .art__grid img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
    .art__grid strong { display: block; padding: 12px 14px 4px; font-size: 17px; line-height: 1.25; font-stretch: 90%; }
    .art__grid span { display: block; padding: 0 14px 14px; font-size: 14px; color: var(--muted); }
    @media (max-width: 620px) { .art__grid { grid-template-columns: 1fr; } }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
  <script src="../stats.js" defer></script>
</head>
<body class="np-page">
  <header class="masthead">
    <div class="masthead__bar wrap">
      <a class="brand" href="../" aria-label="FAIND — Home"><img class="brand__img" src="../assets/logo.webp" width="510" height="180" alt="FAIND – Flash AI News Daily"></a>
      <a class="np__back" href="../">← Tutte le notizie</a>
    </div>
  </header>
  <main class="wrap legal art">
${main}
    <p class="legal__back"><a class="btn btn--primary" href="../">Torna alle notizie di FAIND</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="../#chi-siamo">Chi siamo</a> · <a href="./">Approfondimenti</a> · <a href="../confronto/">Le AI a confronto</a> · <a href="../glossario/">Glossario</a> · <a href="../privacy.html">Privacy e note legali</a></p></div></footer>
</body>
</html>
`;
}

const cardHtml = (a, up) => `<a href="${up}${a.slug}.html"><img src="${up === '' ? '../' : ''}assets/${a.img}" alt="" loading="lazy" width="1024" height="576"><strong>${esc(a.title)}</strong><span>${esc(a.card)}</span></a>`;

function articlePage(a) {
  const url = `${SITE}${DIR}${a.slug}.html`, image = `${SITE}assets/${a.img}`;
  const date = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(UPDATED + 'T12:00:00Z'));
  const others = ARTICLES.filter(x => x !== a).slice(0, 4);
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': url + '#article', headline: a.title, description: a.desc, image, inLanguage: 'it-IT', datePublished: UPDATED, dateModified: UPDATED, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'Redazione FAIND', url: SITE + 'redazione.html' }, publisher: { '@id': SITE + '#org' } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Approfondimenti', item: SITE + DIR }, { '@type': 'ListItem', position: 3, name: a.title, item: url }] },
    { '@type': 'FAQPage', mainEntity: a.faq.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }
  ] };
  const main = `    <p class="np__crumb"><a href="../">FAIND</a> › <a href="./">Approfondimenti</a></p>
    <a class="art__kick" href="./">Approfondimenti</a>
    <h1 class="legal__title">${esc(a.title)}</h1>
    <p class="legal__updated">A cura della <a href="../redazione.html">redazione di FAIND</a> · Aggiornato il ${date}</p>
    <img class="art__img" src="../assets/${a.img}" width="1024" height="576" alt="${esc(a.title)}">
    <p class="legal__lede">${a.lede}</p>

    <div class="art__brief">
      <h2>In breve</h2>
      <ul>${a.brief.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

${a.sections.map(([h, p]) => `    <section>\n      <h2>${esc(h)}</h2>\n      <p>${p}</p>\n    </section>`).join('\n')}

    <section>
      <h2>Domande frequenti</h2>
${a.faq.map(([q, r]) => `      <h3>${esc(q)}</h3>\n      <p>${esc(r)}</p>`).join('\n')}
    </section>
${a.sources.length ? `
    <section>
      <h2>Fonti</h2>
      <ul class="art__src">${a.sources.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </section>
` : ''}
    <section>
      <h2>Altri approfondimenti</h2>
      <div class="art__grid">${others.map(o => cardHtml(o, '')).join('')}</div>
    </section>
`;
  return shell({ title: a.title, desc: a.desc, url, image, jsonld, main });
}

function indexPage() {
  const url = SITE + DIR;
  const jsonld = { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, url, name: 'Approfondimenti sull\'intelligenza artificiale', inLanguage: 'it-IT', dateModified: UPDATED, isPartOf: { '@id': SITE + '#website' },
    hasPart: ARTICLES.map(a => ({ '@type': 'Article', headline: a.title, url: `${url}${a.slug}.html` })) };
  const main = `    <p class="np__crumb"><a href="../">FAIND</a> › Approfondimenti</p>
    <h1 class="legal__title">Approfondimenti sull'intelligenza artificiale</h1>
    <p class="legal__lede">Le risposte alle domande che le persone si fanno più spesso sull'intelligenza artificiale: lavoro, rischi, costi, leggi, come iniziare. Scritte in modo semplice, con le fonti.</p>
    <div class="art__grid">${ARTICLES.map(a => cardHtml(a, '')).join('')}</div>
`;
  return shell({ title: 'Approfondimenti sull\'intelligenza artificiale: guide e risposte', desc: 'Guide e risposte alle domande più cercate sull\'intelligenza artificiale: lavori a rischio, pericoli, come iniziare, costi, consumi, leggi nel mondo e come riconoscere i contenuti fatti con l\'AI.', url, image: SITE + 'assets/og-image.png', jsonld, main, type: 'website' });
}

// Schede per la home (HTML statico da incollare in index.html)
export const homeCards = () => ARTICLES.map(a => `          <a class="deep__card" href="${DIR}${a.slug}.html"><img src="assets/${a.img}" alt="" loading="lazy" decoding="async" width="1024" height="576"><strong>${esc(a.title)}</strong><span>${esc(a.card)}</span></a>`).join('\n');

export async function buildArticles(root) {
  const dir = path.join(root, DIR);
  await mkdir(dir, { recursive: true });
  const urls = [SITE + DIR];
  await writeFile(path.join(dir, 'index.html'), indexPage());
  for (const a of ARTICLES) { await writeFile(path.join(dir, `${a.slug}.html`), articlePage(a)); urls.push(`${SITE}${DIR}${a.slug}.html`); }
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`)).map(u => `<url><loc>${u}</loc><lastmod>${UPDATED}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con gli approfondimenti:', e.message); }
  console.log(`📚 approfondimenti: ${ARTICLES.length} articoli`);
}
