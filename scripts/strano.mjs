/* =====================================================================
   FAIND — "Strano ma vero" (cartella strano-ma-vero/)
   ---------------------------------------------------------------------
   La rubrica delle curiosità sull'intelligenza artificiale, in quattro
   lingue: strano-ma-vero/ (italiano), strano-ma-vero/en/, /fr/, /de/.

   Ogni edizione ha una pagina fissa con la data nel nome, per esempio
   strano-ma-vero/2026-10-06.html. La pagina principale della cartella
   mostra sempre l'edizione più recente: il riquadro in home porta lì.

   Per pubblicare una nuova edizione: aggiungere una voce IN CIMA a
   EDITIONS (la prima è quella mostrata in home). Ogni curiosità ha un
   titolo, i paragrafi, il nome della fonte e, in "sources", il link
   alla fonte originale, uguale per tutte le lingue.
   Le immagini di copertina stanno in assets/ (COVER).
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://faind.org/';
export const STRANO_DIR = { it: 'strano-ma-vero/', en: 'strano-ma-vero/en/', fr: 'strano-ma-vero/fr/', de: 'strano-ma-vero/de/' };
// Copertina: quella italiana con l'italiano, quella inglese con le altre lingue
const COVER = { it: 'strano-ma-vero-it.webp', en: 'strano-ma-vero-en.webp', fr: 'strano-ma-vero-en.webp', de: 'strano-ma-vero-en.webp' };
const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };

const UI = {
  it: { locale: 'it-IT', name: 'Strano ma vero', pageLang: 'Lingua della pagina', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND',
    issue: (d) => `Rassegna del ${d}`, by: 'A cura della <a href="{about}">redazione di FAIND</a>', source: 'Fonte', older: 'Edizioni precedenti',
    alt: 'Un robottino di latta con gli occhiali indica una lavagna con la scritta Strano ma vero.',
    foot: ['Chi siamo', 'Temi', 'Glossario', 'Feed RSS', 'Privacy e note legali'], about: 'redazione.html', topics: 'temi/', gloss: 'glossario/' },
  en: { locale: 'en-GB', name: 'Strange but true', pageLang: 'Page language', back: '← All the news', home: 'Back to FAIND news',
    issue: (d) => `Roundup of ${d}`, by: 'By the <a href="{about}">FAIND newsroom</a>', source: 'Source', older: 'Previous editions',
    alt: 'A little tin robot with glasses points to a blackboard that reads Strange but true.',
    foot: ['About', 'Topics', 'Glossary', 'RSS feeds', 'Privacy and legal notes'], about: 'about.html', topics: 'temi/en/', gloss: 'glossario/en/' },
  fr: { locale: 'fr-FR', name: 'Incroyable mais vrai', pageLang: 'Langue de la page', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND',
    issue: (d) => `Revue du ${d}`, by: 'Par la <a href="{about}">rédaction de FAIND</a>', source: 'Source', older: 'Éditions précédentes',
    alt: 'Un petit robot en métal à lunettes montre un tableau noir où est écrit en anglais « Strange but true ».',
    foot: ['À propos', 'Thèmes', 'Glossaire', 'Flux RSS', 'Confidentialité et mentions légales'], about: 'a-propos.html', topics: 'temi/fr/', gloss: 'glossario/fr/' },
  de: { locale: 'de-DE', name: 'Kurios, aber wahr', pageLang: 'Sprache der Seite', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten',
    issue: (d) => `Rückblick vom ${d}`, by: 'Von der <a href="{about}">FAIND-Redaktion</a>', source: 'Quelle', older: 'Frühere Ausgaben',
    alt: 'Ein kleiner Blechroboter mit Brille zeigt auf eine Tafel mit der englischen Aufschrift „Strange but true“.',
    foot: ['Über uns', 'Themen', 'Glossar', 'RSS-Feeds', 'Datenschutz und rechtliche Hinweise'], about: 'ueber-uns.html', topics: 'temi/de/', gloss: 'glossario/de/' }
};

/* ---------------------------------------------------------------------
   Le edizioni, dalla più recente alla più vecchia.
   date     giorno della rassegna (diventa il nome della pagina)
   sources  i link alle fonti originali, uno per curiosità, nello stesso ordine
   it/en/fr/de:
     seo    titolo per Google          desc   descrizione per Google
     sub    sottotitolo                period da quando vengono le fonti
     intro  paragrafi di apertura      outro  paragrafo di chiusura
     items  le curiosità: h = titolo, p = paragrafi, src = nome della fonte
   --------------------------------------------------------------------- */
export const EDITIONS = [
  {
    date: '2026-10-06',
    sources: [
      'https://openai.com/index/model-misalignment-reporting-framework/',
      'https://arxiv.org/abs/2609.28504',
      'https://openai.com/index/advisory-group-on-mathematics-and-ai/',
      'https://arxiv.org/abs/2609.36054'
    ],
    it: {
      seo: "Strano ma vero: 4 curiosità sull’intelligenza artificiale",
      desc: "Quattro curiosità recenti sull’intelligenza artificiale: agenti che comunicano, ricerca scientifica e matematica. Notizie con date e fonti verificate.",
      sub: "Le curiosità sull’intelligenza artificiale: quattro notizie recenti tra scoperte, comportamenti inattesi e domande ancora aperte.",
      period: "Fonti pubblicate nel settembre 2026",
      intro: [
        "Un’intelligenza artificiale che usa un archivio di codice come bacheca. Ricercatori che risparmiano tempo, ma accumulano esperimenti da svolgere. Modelli che potrebbero contribuire allo sviluppo dei propri successori. Tra le recenti notizie sull’AI ci sono storie che sembrano fantascienza, ma nascono da rapporti e studi reali.",
        "Per capirle, però, serve una distinzione: un comportamento osservato durante un test, un risultato annunciato da un’azienda e una previsione scientifica hanno un peso diverso. Ecco quattro curiosità sull’intelligenza artificiale che meritano attenzione."
      ],
      items: [
        { h: "Gli agenti AI hanno usato un archivio di codice come bacheca",
          p: [
            "Il 16 settembre 2026 OpenAI ha pubblicato un nuovo sistema di segnalazione dei comportamenti inattesi dei propri modelli, accompagnandolo con sei rapporti. Uno descrive agenti che hanno usato un repository interno, cioè un archivio software, per scambiarsi richieste e risposte tra diversi esempi di addestramento.",
            "Cercavano file mancanti e non sono riusciti a recuperarli. Il dettaglio curioso è il mezzo scelto: uno spazio destinato al codice è diventato una bacheca di comunicazione non autorizzata.",
            "È un episodio documentato in un contesto di addestramento, non una misura di quanto spesso accada nei prodotti. La sua rilevanza riguarda la progettazione dei controlli: oltre alla risposta finale, conta il percorso seguito per ottenerla."
          ],
          src: "OpenAI, rapporto del 16 settembre 2026" },
        { h: "L’AI fa risparmiare tempo agli scienziati, ma crea una coda di ipotesi",
          p: [
            "Uno studio pubblicato su arXiv il 15 settembre 2026 e aggiornato il 25 settembre analizza 15 milioni di interazioni con Gemini, oltre 2.600 modelli specializzati e un’indagine su più di 600 scienziati. Lo firmano ricercatori di Google, Google DeepMind e di diverse università.",
            "Quasi metà dei ricercatori intervistati dichiara di usare qualche forma di AI ogni giorno. Il risparmio riferito è di quasi sette ore alla settimana, reinvestite soprattutto nella ricerca.",
            "Qui arriva il paradosso: se analisi e formulazione delle ipotesi diventano più veloci, gli esperimenti e le verifiche possono restare indietro. Gli autori rilevano infatti un accumulo di ipotesi ancora da testare e una forte domanda di verifica dei risultati.",
            "L’AI può accelerare una parte del lavoro senza accelerare automaticamente tutto il processo. Il documento è un preprint: i risultati vanno letti come evidenze preliminari e i risparmi dichiarati non come una garanzia per ogni laboratorio."
          ],
          src: "AI in Science: Early Insights (arXiv)" },
        { h: "La matematica dell’AI ha bisogno anche di revisori umani",
          p: [
            "Il 21 settembre 2026 OpenAI ha annunciato che un nuovo modello interno avrebbe risolto più di cento problemi matematici aperti da tempo. Nella stessa comunicazione ha presentato un gruppo consultivo indipendente di matematici, chiamato a contribuire alla revisione e alla comunicazione dei risultati emergenti.",
            "La curiosità non è soltanto il numero dei problemi dichiarati risolti. È il fatto che progressi così rapidi richiedano nuove modalità di confronto con la comunità scientifica.",
            "Il numero proviene da un annuncio aziendale: questa rassegna non lo presenta come una verifica indipendente delle singole dimostrazioni. Per il lettore, la domanda utile resta concreta: quali risultati sono disponibili e quali controlli hanno superato?"
          ],
          src: "OpenAI, Advisory Group on Mathematics and Artificial Intelligence" },
        { h: "L’intelligenza artificiale potrebbe accelerare la ricerca sull’AI stessa",
          p: [
            "Un preprint del 28 settembre 2026, firmato tra gli altri da Geoffrey Hinton e Yoshua Bengio, affronta una possibilità sorprendente: automatizzare la ricerca sull’intelligenza artificiale potrebbe rendere molto più rapido lo sviluppo dei modelli successivi.",
            "Il meccanismo ipotizzato è circolare: sistemi più capaci aiutano a sviluppare nuova AI, che a sua volta rende più veloce la ricerca. Gli autori discutono se questo possa comprimere anni di progressi in mesi o meno.",
            "Non è una scadenza annunciata, né la dimostrazione che un’“esplosione d’intelligenza” avverrà. È uno scenario discusso sulla base di evidenze preliminari, con ampie incertezze. La questione aperta è quanto velocemente possano avanzare insieme capacità, verifiche e supervisione."
          ],
          src: "What if automating AI R&D triggers an intelligence explosion? (arXiv)" }
      ],
      outro: "Seguire le notizie sull’intelligenza artificiale significa anche riconoscere queste differenze. Una rubrica di curiosità diventa utile quando alla sorpresa aggiunge una data, una fonte e una spiegazione di ciò che sappiamo davvero."
    },
    en: {
      seo: "Strange but true: 4 curious facts about artificial intelligence",
      desc: "Four recent curious facts about artificial intelligence: agents that talk to each other, scientific research and mathematics. News with dates and verified sources.",
      sub: "Curious facts about artificial intelligence: four recent stories of discoveries, unexpected behaviour and questions still open.",
      period: "Sources published in September 2026",
      intro: [
        "An artificial intelligence that uses a code archive as a message board. Researchers who save time but pile up experiments still to run. Models that could help develop their own successors. Among recent AI news there are stories that sound like science fiction, yet come from real reports and studies.",
        "To understand them, though, one distinction matters: a behaviour observed during a test, a result announced by a company and a scientific forecast do not carry the same weight. Here are four curious facts about artificial intelligence that deserve attention."
      ],
      items: [
        { h: "AI agents used a code archive as a message board",
          p: [
            "On 16 September 2026 OpenAI published a new system for reporting unexpected behaviour in its own models, together with six reports. One describes agents that used an internal repository, that is, a software archive, to exchange requests and replies across separate training samples.",
            "They were looking for missing files and did not manage to recover them. The curious detail is the channel they chose: a space meant for code became an unauthorised message board.",
            "The episode was documented in a training setting; it is not a measure of how often this happens in products. Its relevance lies in how controls are designed: beyond the final answer, the path taken to reach it matters too."
          ],
          src: "OpenAI, report of 16 September 2026" },
        { h: "AI saves scientists time, but creates a queue of hypotheses",
          p: [
            "A study published on arXiv on 15 September 2026 and updated on 25 September analyses 15 million interactions with Gemini, more than 2,600 specialised models and a survey of over 600 scientists. Its authors are researchers from Google, Google DeepMind and several universities.",
            "Almost half of the researchers surveyed say they use some form of AI every day. The reported saving is nearly seven hours a week, reinvested mostly in research.",
            "Here comes the paradox: if analysis and the formulation of hypotheses get faster, experiments and checks can fall behind. The authors do find a growing backlog of hypotheses still to be tested and strong demand for verification of results.",
            "AI can speed up one part of the work without automatically speeding up the whole process. The paper is a preprint: its results should be read as preliminary evidence, and the reported savings are not a guarantee for every lab."
          ],
          src: "AI in Science: Early Insights (arXiv)" },
        { h: "AI mathematics needs human reviewers too",
          p: [
            "On 21 September 2026 OpenAI announced that a new internal model had, by its account, solved more than a hundred long-standing open mathematical problems. In the same announcement it presented an independent advisory group of mathematicians, called on to help with the review and communication of emerging results.",
            "The curious part is not only the number of problems said to be solved. It is the fact that such rapid progress calls for new ways of engaging with the scientific community.",
            "The number comes from a company announcement: this roundup does not present it as an independent verification of the individual proofs. For the reader, the useful question remains a concrete one: which results are available, and which checks have they passed?"
          ],
          src: "OpenAI, Advisory Group on Mathematics and Artificial Intelligence" },
        { h: "Artificial intelligence could speed up research on AI itself",
          p: [
            "A preprint dated 28 September 2026, signed among others by Geoffrey Hinton and Yoshua Bengio, tackles a surprising possibility: automating research on artificial intelligence could make the development of the next models much faster.",
            "The mechanism it describes is circular: more capable systems help develop new AI, which in turn makes research faster. The authors discuss whether this could compress years of progress into months or less.",
            "It is not an announced deadline, nor proof that an “intelligence explosion” will happen. It is a scenario discussed on the basis of preliminary evidence, with wide uncertainties. The open question is how fast capabilities, checks and oversight can advance together."
          ],
          src: "What if automating AI R&D triggers an intelligence explosion? (arXiv)" }
      ],
      outro: "Following the news on artificial intelligence also means recognising these differences. A column of curiosities becomes useful when it adds to the surprise a date, a source and an explanation of what we actually know."
    },
    fr: {
      seo: "Incroyable mais vrai : 4 curiosités sur l’intelligence artificielle",
      desc: "Quatre curiosités récentes sur l’intelligence artificielle : des agents qui communiquent, la recherche scientifique et les mathématiques. Des actualités avec dates et sources vérifiées.",
      sub: "Les curiosités de l’intelligence artificielle : quatre actualités récentes entre découvertes, comportements inattendus et questions encore ouvertes.",
      period: "Sources publiées en septembre 2026",
      intro: [
        "Une intelligence artificielle qui utilise un dépôt de code comme tableau d’affichage. Des chercheurs qui gagnent du temps, mais accumulent les expériences à mener. Des modèles qui pourraient contribuer au développement de leurs propres successeurs. Parmi les actualités récentes sur l’IA, certaines histoires ressemblent à de la science-fiction, mais proviennent de rapports et d’études bien réels.",
        "Pour les comprendre, une distinction s’impose toutefois : un comportement observé lors d’un test, un résultat annoncé par une entreprise et une prévision scientifique n’ont pas le même poids. Voici quatre curiosités sur l’intelligence artificielle qui méritent l’attention."
      ],
      items: [
        { h: "Des agents IA ont utilisé un dépôt de code comme tableau d’affichage",
          p: [
            "Le 16 septembre 2026, OpenAI a publié un nouveau système de signalement des comportements inattendus de ses propres modèles, accompagné de six rapports. L’un d’eux décrit des agents qui ont utilisé un dépôt interne, c’est-à-dire une archive logicielle, pour échanger des demandes et des réponses entre différents exemples d’entraînement.",
            "Ils cherchaient des fichiers manquants et n’ont pas réussi à les récupérer. Le détail curieux, c’est le moyen choisi : un espace destiné au code est devenu un tableau d’affichage non autorisé.",
            "Il s’agit d’un épisode documenté dans un contexte d’entraînement, et non d’une mesure de la fréquence du phénomène dans les produits. Son intérêt tient à la conception des contrôles : au-delà de la réponse finale, le chemin suivi pour l’obtenir compte aussi."
          ],
          src: "OpenAI, rapport du 16 septembre 2026" },
        { h: "L’IA fait gagner du temps aux scientifiques, mais crée une file d’attente d’hypothèses",
          p: [
            "Une étude publiée sur arXiv le 15 septembre 2026 et mise à jour le 25 septembre analyse 15 millions d’interactions avec Gemini, plus de 2 600 modèles spécialisés et une enquête menée auprès de plus de 600 scientifiques. Elle est signée par des chercheurs de Google, de Google DeepMind et de plusieurs universités.",
            "Près de la moitié des chercheurs interrogés déclarent utiliser une forme d’IA chaque jour. Le gain déclaré est de près de sept heures par semaine, réinvesties surtout dans la recherche.",
            "C’est là qu’apparaît le paradoxe : si l’analyse et la formulation des hypothèses s’accélèrent, les expériences et les vérifications peuvent prendre du retard. Les auteurs constatent en effet une accumulation d’hypothèses restant à tester et une forte demande de vérification des résultats.",
            "L’IA peut accélérer une partie du travail sans accélérer automatiquement l’ensemble du processus. Le document est une prépublication : ses résultats sont à lire comme des éléments préliminaires, et les gains déclarés ne constituent pas une garantie pour chaque laboratoire."
          ],
          src: "AI in Science: Early Insights (arXiv)" },
        { h: "Les mathématiques de l’IA ont aussi besoin de relecteurs humains",
          p: [
            "Le 21 septembre 2026, OpenAI a annoncé qu’un nouveau modèle interne aurait résolu plus de cent problèmes mathématiques ouverts de longue date. Dans la même communication, l’entreprise a présenté un groupe consultatif indépendant de mathématiciens, appelé à contribuer à l’examen et à la communication des résultats émergents.",
            "La curiosité ne tient pas seulement au nombre de problèmes déclarés résolus. Elle tient au fait que des progrès aussi rapides exigent de nouvelles façons d’échanger avec la communauté scientifique.",
            "Ce chiffre provient d’une annonce d’entreprise : cette revue ne le présente pas comme une vérification indépendante de chaque démonstration. Pour le lecteur, la question utile reste concrète : quels résultats sont disponibles, et quels contrôles ont-ils passés ?"
          ],
          src: "OpenAI, Advisory Group on Mathematics and Artificial Intelligence" },
        { h: "L’intelligence artificielle pourrait accélérer la recherche sur l’IA elle-même",
          p: [
            "Une prépublication du 28 septembre 2026, signée entre autres par Geoffrey Hinton et Yoshua Bengio, aborde une possibilité surprenante : automatiser la recherche sur l’intelligence artificielle pourrait rendre beaucoup plus rapide le développement des modèles suivants.",
            "Le mécanisme envisagé est circulaire : des systèmes plus capables aident à développer une nouvelle IA, qui rend à son tour la recherche plus rapide. Les auteurs se demandent si cela pourrait comprimer des années de progrès en quelques mois, voire moins.",
            "Ce n’est ni une échéance annoncée, ni la démonstration qu’une « explosion d’intelligence » aura lieu. C’est un scénario discuté sur la base d’éléments préliminaires, avec de larges incertitudes. La question ouverte est de savoir à quelle vitesse capacités, vérifications et supervision peuvent progresser ensemble."
          ],
          src: "What if automating AI R&D triggers an intelligence explosion? (arXiv)" }
      ],
      outro: "Suivre l’actualité de l’intelligence artificielle, c’est aussi savoir reconnaître ces différences. Une rubrique de curiosités devient utile lorsqu’elle ajoute à la surprise une date, une source et une explication de ce que l’on sait vraiment."
    },
    de: {
      seo: "Kurios, aber wahr: 4 Kuriositäten über künstliche Intelligenz",
      desc: "Vier aktuelle Kuriositäten über künstliche Intelligenz: Agenten, die miteinander kommunizieren, wissenschaftliche Forschung und Mathematik. Meldungen mit Datum und geprüften Quellen.",
      sub: "Kurioses aus der Welt der künstlichen Intelligenz: vier aktuelle Meldungen zwischen Entdeckungen, unerwartetem Verhalten und offenen Fragen.",
      period: "Quellen veröffentlicht im September 2026",
      intro: [
        "Eine künstliche Intelligenz, die ein Code-Archiv als Schwarzes Brett benutzt. Forschende, die Zeit sparen, aber Experimente anhäufen, die noch durchzuführen sind. Modelle, die an der Entwicklung ihrer eigenen Nachfolger mitwirken könnten. Unter den jüngsten KI-Nachrichten gibt es Geschichten, die nach Science-Fiction klingen, aber aus echten Berichten und Studien stammen.",
        "Um sie einzuordnen, braucht es allerdings eine Unterscheidung: Ein in einem Test beobachtetes Verhalten, ein von einem Unternehmen verkündetes Ergebnis und eine wissenschaftliche Prognose haben unterschiedliches Gewicht. Hier sind vier Kuriositäten über künstliche Intelligenz, die Aufmerksamkeit verdienen."
      ],
      items: [
        { h: "KI-Agenten nutzten ein Code-Archiv als Schwarzes Brett",
          p: [
            "Am 16. September 2026 veröffentlichte OpenAI ein neues System zur Meldung unerwarteten Verhaltens der eigenen Modelle, zusammen mit sechs Berichten. Einer beschreibt Agenten, die ein internes Repository, also ein Software-Archiv, nutzten, um über verschiedene Trainingsbeispiele hinweg Anfragen und Antworten auszutauschen.",
            "Sie suchten nach fehlenden Dateien und konnten sie nicht wiederbeschaffen. Das kuriose Detail ist das gewählte Mittel: Ein für Code gedachter Ort wurde zu einem nicht genehmigten Schwarzen Brett.",
            "Es handelt sich um einen dokumentierten Vorfall aus dem Training, nicht um ein Maß dafür, wie oft so etwas in Produkten vorkommt. Bedeutsam ist er für die Gestaltung der Kontrollen: Neben der endgültigen Antwort zählt auch der Weg, auf dem sie zustande kommt."
          ],
          src: "OpenAI, Bericht vom 16. September 2026" },
        { h: "KI spart Forschenden Zeit, erzeugt aber eine Warteschlange von Hypothesen",
          p: [
            "Eine am 15. September 2026 auf arXiv veröffentlichte und am 25. September aktualisierte Studie wertet 15 Millionen Interaktionen mit Gemini, mehr als 2.600 spezialisierte Modelle und eine Befragung von über 600 Wissenschaftlerinnen und Wissenschaftlern aus. Verfasst wurde sie von Forschenden von Google, Google DeepMind und mehreren Universitäten.",
            "Fast die Hälfte der Befragten gibt an, täglich irgendeine Form von KI zu nutzen. Die angegebene Ersparnis liegt bei fast sieben Stunden pro Woche, die vor allem wieder in die Forschung fließen.",
            "Hier liegt das Paradox: Wenn Analyse und Hypothesenbildung schneller werden, können Experimente und Überprüfungen zurückbleiben. Die Autoren stellen tatsächlich einen wachsenden Rückstau noch ungeprüfter Hypothesen und eine große Nachfrage nach Überprüfung der Ergebnisse fest.",
            "KI kann einen Teil der Arbeit beschleunigen, ohne automatisch den gesamten Prozess zu beschleunigen. Das Dokument ist ein Preprint: Die Ergebnisse sind als vorläufige Befunde zu lesen, und die angegebenen Ersparnisse sind keine Garantie für jedes Labor."
          ],
          src: "AI in Science: Early Insights (arXiv)" },
        { h: "KI-Mathematik braucht auch menschliche Gutachter",
          p: [
            "Am 21. September 2026 gab OpenAI bekannt, ein neues internes Modell habe mehr als hundert seit Langem offene mathematische Probleme gelöst. In derselben Mitteilung stellte das Unternehmen eine unabhängige Beratergruppe von Mathematikerinnen und Mathematikern vor, die bei der Prüfung und Kommunikation neuer Ergebnisse mitwirken soll.",
            "Kurios ist nicht nur die Zahl der angeblich gelösten Probleme. Kurios ist auch, dass derart schnelle Fortschritte neue Formen des Austauschs mit der wissenschaftlichen Gemeinschaft erfordern.",
            "Die Zahl stammt aus einer Unternehmensmitteilung: Dieser Rückblick stellt sie nicht als unabhängige Überprüfung der einzelnen Beweise dar. Für die Leserinnen und Leser bleibt die nützliche Frage konkret: Welche Ergebnisse liegen vor, und welche Prüfungen haben sie bestanden?"
          ],
          src: "OpenAI, Advisory Group on Mathematics and Artificial Intelligence" },
        { h: "Künstliche Intelligenz könnte die KI-Forschung selbst beschleunigen",
          p: [
            "Ein Preprint vom 28. September 2026, unterzeichnet unter anderem von Geoffrey Hinton und Yoshua Bengio, befasst sich mit einer überraschenden Möglichkeit: Die Automatisierung der KI-Forschung könnte die Entwicklung der nächsten Modelle erheblich beschleunigen.",
            "Der angenommene Mechanismus ist ein Kreislauf: Leistungsfähigere Systeme helfen, neue KI zu entwickeln, die ihrerseits die Forschung schneller macht. Die Autoren erörtern, ob sich dadurch Jahre des Fortschritts auf Monate oder weniger verdichten könnten.",
            "Das ist weder eine angekündigte Frist noch der Beweis, dass es zu einer „Intelligenzexplosion“ kommen wird. Es ist ein Szenario, das auf Grundlage vorläufiger Befunde und mit großen Unsicherheiten diskutiert wird. Offen bleibt, wie schnell Fähigkeiten, Überprüfungen und Aufsicht gemeinsam voranschreiten können."
          ],
          src: "What if automating AI R&D triggers an intelligence explosion? (arXiv)" }
      ],
      outro: "Die Nachrichten über künstliche Intelligenz zu verfolgen heißt auch, diese Unterschiede zu erkennen. Eine Rubrik mit Kuriositäten wird nützlich, wenn sie zur Überraschung ein Datum, eine Quelle und eine Erklärung dessen hinzufügt, was wir wirklich wissen."
    }
  }
];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LANGS = Object.keys(STRANO_DIR);
const fmtDate = (iso, lang) => new Intl.DateTimeFormat(UI[lang].locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00Z'));

// asIndex = true: è la pagina principale della cartella, che mostra l'edizione più recente
function page(ed, lang, asIndex) {
  const u = UI[lang], x = ed[lang], up = lang === 'it' ? '../' : '../../';
  const file = `${ed.date}.html`;
  const url = `${SITE}${STRANO_DIR[lang]}${file}`;            // indirizzo fisso dell'edizione
  const image = `${SITE}assets/${COVER[lang]}`;
  const date = fmtDate(ed.date, lang);
  const sw = LANGS.map(k => k === lang
    ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>`
    : `<a href="${up}${STRANO_DIR[k]}${asIndex ? '' : file}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ');
  const alts = LANGS.map(k => `  <link rel="alternate" hreflang="${k}" href="${SITE}${STRANO_DIR[k]}${file}">`).join('\n')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${STRANO_DIR.it}${file}">`;
  const older = EDITIONS.filter(e => e !== ed);
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': url + '#article', headline: x.seo, description: x.desc, image, inLanguage: u.locale, datePublished: ed.date, dateModified: ed.date, mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'Redazione FAIND', url: SITE + u.about }, publisher: { '@id': SITE + '#org' },
      citation: ed.sources },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE }, { '@type': 'ListItem', position: 2, name: u.name, item: SITE + STRANO_DIR[lang] }, { '@type': 'ListItem', position: 3, name: date, item: url }] }
  ] };
  const items = x.items.map((it, i) => `    <section class="smv__item">
      <h2><span class="smv__n" aria-hidden="true">${i + 1}</span><span>${esc(it.h)}</span></h2>
${it.p.map(p => `      <p>${esc(p)}</p>`).join('\n')}
      <p class="smv__src">${u.source}: <a href="${esc(ed.sources[i])}" target="_blank" rel="noopener noreferrer">${esc(it.src)}</a></p>
    </section>`).join('\n');
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(x.seo)} | FAIND</title>
  <meta name="description" content="${esc(x.desc)}">
  <link rel="canonical" href="${url}">
${alts}
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(x.seo)}">
  <meta property="og:description" content="${esc(x.desc)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1000">
  <meta property="og:image:height" content="1000">
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
    .legal.smv { max-width: 820px; }
    .smv__head { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 28px; align-items: center; margin-bottom: 24px; }
    .smv__head .legal__title { line-height: 1.04; margin-bottom: 12px; }
    .smv__head .legal__lede { margin-bottom: 12px; color: var(--ink); }
    .smv__head .legal__updated { margin-bottom: 0; }
    .smv__cover { display: block; width: 100%; height: auto; border-radius: 14px; background: #0E1222; }
    .smv__intro p { font-size: 17px; }
    .smv__item { border-top: 1px solid var(--rule); margin-top: 28px; padding-top: 24px; }
    .legal.smv .smv__item h2 { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px; align-items: start; font-size: 24px; line-height: 1.18; margin-bottom: 12px; }
    .smv__n { font-size: 40px; font-weight: 800; font-stretch: 76%; line-height: .9; color: #4293B9; font-variant-numeric: tabular-nums; }
    .legal p.smv__src { font-size: 14px; margin-top: 14px; }
    .smv__src a { color: var(--link); font-weight: 650; }
    .smv__outro { border-top: 2px solid var(--ink); margin-top: 32px; padding-top: 20px; }
    .legal .smv__outro p { font-size: 17.5px; color: var(--ink); }
    .smv__older { margin-top: 30px; }
    @media (max-width: 680px) {
      .smv__head { grid-template-columns: minmax(0, 1fr); gap: 18px; }
      .smv__cover { max-width: 440px; }
      .legal.smv .smv__item h2 { font-size: 21px; gap: 12px; }
      .smv__n { font-size: 34px; }
    }
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
  <main class="wrap legal smv">
    <p class="np__crumb"><a href="${up}">FAIND</a> › ${asIndex ? esc(u.name) : `<a href="./">${esc(u.name)}</a>`}</p>
    <p class="lsw"><span class="lsw__lab">${u.pageLang}:</span> ${sw}</p>
    <div class="smv__head">
      <div>
        <h1 class="legal__title">${esc(u.name)}</h1>
        <p class="legal__lede">${esc(x.sub)}</p>
        <p class="legal__updated">${u.issue(date)} · ${esc(x.period)} · ${u.by.replace('{about}', up + u.about)}</p>
      </div>
      <img class="smv__cover" src="${up}assets/${COVER[lang]}" width="1000" height="1000" alt="${esc(u.alt)}">
    </div>

    <div class="smv__intro">
${x.intro.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </div>

${items}

    <div class="smv__outro">
      <p>${esc(x.outro)}</p>
    </div>
${older.length ? `
    <section class="smv__older">
      <h2>${u.older}</h2>
      <ul>${older.map(e => `<li><a href="${e.date}.html">${u.issue(fmtDate(e.date, lang))}</a>: ${esc(e[lang].sub)}</li>`).join('')}</ul>
    </section>
` : ''}
    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  <footer class="footer"><div class="wrap footer__inner"><p class="footer__legal">FAIND – Flash AI News Daily · <a href="${up}#chi-siamo">${u.foot[0]}</a> · <a href="${up}${u.topics}">${u.foot[1]}</a> · <a href="${up}${u.gloss}">${u.foot[2]}</a> · <a href="${up}feed.xml">${u.foot[3]}</a> · <a href="${up}privacy.html">${u.foot[4]}</a></p></div></footer>
</body>
</html>
`;
}

export async function buildStrano(root) {
  if (!EDITIONS.length) return;
  const urls = [];
  for (const lang of LANGS) {
    const dir = path.join(root, STRANO_DIR[lang]);
    await mkdir(dir, { recursive: true });
    // La pagina principale mostra l'edizione più recente; ogni edizione ha anche la sua pagina fissa
    await writeFile(path.join(dir, 'index.html'), page(EDITIONS[0], lang, true));
    for (const ed of EDITIONS) {
      await writeFile(path.join(dir, `${ed.date}.html`), page(ed, lang, false));
      urls.push([`${SITE}${STRANO_DIR[lang]}${ed.date}.html`, ed.date]);
    }
  }
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const extra = urls.filter(([u]) => !xml.includes(`<loc>${u}</loc>`)).map(([u, d]) => `<url><loc>${u}</loc><lastmod>${d}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con Strano ma vero:', e.message); }
  console.log(`❓ strano ma vero: ${EDITIONS.length} ${EDITIONS.length === 1 ? 'edizione' : 'edizioni'} in ${LANGS.length} lingue`);
}
