/* =====================================================================
   FAIND — Glossario dell'intelligenza artificiale (cartella glossario/)
   ---------------------------------------------------------------------
   • Una pagina per lingua: glossario/ (italiano), glossario/en/,
     glossario/fr/, glossario/de/. Definizioni originali, scritte qui.
   • Collegamenti automatici: nelle pagine notizia i termini del glossario
     trovati nel testo diventano link alla definizione (linkify) e
     compaiono nel riquadro "Parole chiave" (termsIn).
   • Sotto ogni termine, le ultime notizie che lo citano.
   • Una pagina per termine e per lingua (glossario/<id>.html,
     glossario/en/<id>.html…): definizione e tutte le notizie archiviate
     che lo citano, quindi cresce da sola. I link dalle notizie portano lì.

   Per aggiungere un termine: una riga in TERMS con
     id  = ancora nella pagina (senza spazi)
     re  = come riconoscerlo nel testo delle notizie (null = non collegare)
     it/en/fr/de = [nome, definizione]
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { shell, newsListHtml, footerHtml, alsoBand, ALSO_CSS } from './argomenti.mjs';

const SITE = 'https://faind.org/';
export const GLOSSARY_PATH = { it: 'glossario/', en: 'glossario/en/', fr: 'glossario/fr/', de: 'glossario/de/' };

export const TERMS = [
  { id: 'intelligenza-artificiale', re: null,
    it: ['Intelligenza artificiale (AI)', 'L\'insieme delle tecniche che permettono a un computer di svolgere compiti che di solito richiedono l\'intelligenza umana: capire un testo, riconoscere un\'immagine, tradurre, prevedere, decidere. In italiano si abbrevia anche IA.'],
    en: ['Artificial intelligence (AI)', 'The set of techniques that let a computer carry out tasks that usually require human intelligence: understanding text, recognising images, translating, predicting, deciding.'],
    fr: ['Intelligence artificielle (IA)', 'L\'ensemble des techniques qui permettent à un ordinateur d\'accomplir des tâches demandant d\'ordinaire l\'intelligence humaine : comprendre un texte, reconnaître une image, traduire, prévoir, décider.'],
    de: ['Künstliche Intelligenz (KI)', 'Die Gesamtheit der Verfahren, mit denen ein Computer Aufgaben erledigt, die sonst menschliche Intelligenz erfordern: Texte verstehen, Bilder erkennen, übersetzen, vorhersagen, entscheiden.'] },
  { id: 'ai-generativa', re: /ai generativa|ia generativa|intelligenza artificiale generativa|generative ai|genai|ia générative|generative ki/i,
    it: ['AI generativa', 'L\'intelligenza artificiale che crea contenuti nuovi, cioè testi, immagini, video, musica o codice, a partire da una richiesta. ChatGPT, Claude, Gemini e i generatori di immagini ne sono esempi.'],
    en: ['Generative AI', 'Artificial intelligence that creates new content, such as text, images, video, music or code, from a request. ChatGPT, Claude, Gemini and image generators are examples.'],
    fr: ['IA générative', 'L\'intelligence artificielle qui crée des contenus nouveaux, textes, images, vidéos, musique ou code, à partir d\'une demande. ChatGPT, Claude, Gemini et les générateurs d\'images en sont des exemples.'],
    de: ['Generative KI', 'Künstliche Intelligenz, die auf eine Anfrage hin neue Inhalte erzeugt: Texte, Bilder, Videos, Musik oder Code. Beispiele sind ChatGPT, Claude, Gemini und Bildgeneratoren.'] },
  { id: 'llm', re: /\bllms?\b|large language model|modell[oi] linguistic[oi]|grands? modèles? de langage|sprachmodell/i,
    it: ['LLM (modello linguistico di grandi dimensioni)', 'Un modello di AI addestrato su enormi quantità di testo per prevedere la parola successiva. Da questa capacità nascono le risposte, i riassunti e le traduzioni dei chatbot. LLM sta per Large Language Model.'],
    en: ['LLM (large language model)', 'An AI model trained on huge amounts of text to predict the next word. That ability is what produces the answers, summaries and translations of chatbots.'],
    fr: ['LLM (grand modèle de langage)', 'Un modèle d\'IA entraîné sur d\'énormes quantités de texte pour prédire le mot suivant. C\'est de cette capacité que viennent les réponses, résumés et traductions des chatbots. LLM signifie Large Language Model.'],
    de: ['LLM (großes Sprachmodell)', 'Ein KI-Modell, das mit riesigen Textmengen trainiert wurde, um das nächste Wort vorherzusagen. Aus dieser Fähigkeit entstehen die Antworten, Zusammenfassungen und Übersetzungen von Chatbots. LLM steht für Large Language Model.'] },
  { id: 'chatbot', re: /chatbots?/i,
    it: ['Chatbot', 'Un programma con cui si dialoga in linguaggio naturale, scrivendo o parlando. Quelli di ultima generazione si basano su un LLM e possono anche cercare sul web, leggere documenti e usare altri strumenti.'],
    en: ['Chatbot', 'A program you talk to in natural language, by typing or speaking. The latest ones are built on an LLM and can also search the web, read documents and use other tools.'],
    fr: ['Chatbot', 'Un programme avec lequel on dialogue en langage naturel, par écrit ou à la voix. Les plus récents reposent sur un LLM et peuvent aussi chercher sur le web, lire des documents et utiliser d\'autres outils.'],
    de: ['Chatbot', 'Ein Programm, mit dem man sich in natürlicher Sprache unterhält, schriftlich oder mündlich. Die neuesten basieren auf einem LLM und können auch im Web suchen, Dokumente lesen und andere Werkzeuge nutzen.'] },
  { id: 'prompt', re: /\bprompts?\b/i,
    it: ['Prompt', 'La richiesta che si scrive a un\'AI: una domanda, un\'istruzione, un testo da elaborare. Più il prompt è chiaro e ricco di contesto, migliore è di solito la risposta.'],
    en: ['Prompt', 'The request you give an AI: a question, an instruction, a text to work on. The clearer the prompt and the more context it carries, the better the answer usually is.'],
    fr: ['Prompt', 'La demande que l\'on adresse à une IA : une question, une consigne, un texte à traiter. Plus le prompt est clair et riche en contexte, meilleure est en général la réponse.'],
    de: ['Prompt', 'Die Eingabe, die man einer KI gibt: eine Frage, eine Anweisung, ein zu bearbeitender Text. Je klarer der Prompt und je mehr Kontext er enthält, desto besser ist meist die Antwort.'] },
  { id: 'token', re: /\btokens?\b/i,
    it: ['Token', 'Il pezzetto di testo, una parola o una sua parte, con cui un modello linguistico legge e scrive. I limiti e i prezzi dei servizi AI si misurano spesso in token.'],
    en: ['Token', 'The small piece of text, a word or part of one, that a language model reads and writes with. Limits and prices of AI services are often measured in tokens.'],
    fr: ['Token', 'Le petit morceau de texte, un mot ou une partie de mot, avec lequel un modèle de langage lit et écrit. Les limites et les prix des services d\'IA se mesurent souvent en tokens.'],
    de: ['Token', 'Das kleine Textstück, ein Wort oder Wortteil, mit dem ein Sprachmodell liest und schreibt. Grenzen und Preise von KI-Diensten werden oft in Tokens gemessen.'] },
  { id: 'allucinazione', re: /allucinazion|hallucinat|halluzin/i,
    it: ['Allucinazione', 'Quando un\'AI produce un\'informazione falsa o inventata presentandola con sicurezza: una citazione inesistente, una data sbagliata, una fonte mai esistita. È il motivo per cui le risposte vanno verificate.'],
    en: ['Hallucination', 'When an AI states something false or made up with full confidence: a quote that does not exist, a wrong date, a source that never existed. It is why answers need checking.'],
    fr: ['Hallucination', 'Quand une IA affirme avec assurance une information fausse ou inventée : une citation inexistante, une date erronée, une source qui n\'a jamais existé. C\'est pourquoi les réponses doivent être vérifiées.'],
    de: ['Halluzination', 'Wenn eine KI etwas Falsches oder Erfundenes mit voller Überzeugung behauptet: ein nicht existierendes Zitat, ein falsches Datum, eine Quelle, die es nie gab. Deshalb müssen Antworten überprüft werden.'] },
  { id: 'agente-ai', re: /agent[ei] (ai|ia)\b|agent[ei] autonom|\bai agents?\b|\bagentic|agents? ia\b|ki-agent/i,
    it: ['Agente AI', 'Un sistema di intelligenza artificiale che non si limita a rispondere, ma svolge un compito in più passaggi: cerca informazioni, usa programmi, compila moduli, scrive e prova codice, con una supervisione umana più o meno stretta.'],
    en: ['AI agent', 'An AI system that does not just answer but carries out a task over several steps: it looks up information, uses software, fills in forms, writes and tests code, with more or less human supervision.'],
    fr: ['Agent IA', 'Un système d\'intelligence artificielle qui ne se contente pas de répondre mais accomplit une tâche en plusieurs étapes : il cherche des informations, utilise des logiciels, remplit des formulaires, écrit et teste du code, sous une supervision humaine plus ou moins étroite.'],
    de: ['KI-Agent', 'Ein KI-System, das nicht nur antwortet, sondern eine Aufgabe in mehreren Schritten erledigt: Es sucht Informationen, bedient Programme, füllt Formulare aus, schreibt und testet Code, mit mehr oder weniger menschlicher Aufsicht.'] },
  // Fonti: LangChain, "Deep Agents" (blog, 30 luglio 2025) e documentazione ufficiale di Deep Agents (docs.langchain.com)
  { id: 'deep-agents', re: /\bdeep ?agents?\b|\bdeepagents\b/i,
    it: ['Deep agents', 'Agenti AI costruiti per compiti lunghi e complessi, che un agente semplice non riesce a portare a termine. Si basano su quattro elementi: istruzioni molto dettagliate, uno strumento per pianificare il lavoro in passi, la possibilità di affidare parti del compito a sotto-agenti e un archivio di file dove salvare appunti e risultati. Il termine è stato proposto nel 2025 da LangChain, che lo usa anche per la sua libreria Deep Agents; tra gli esempi cita Claude Code, Deep Research e Manus.'],
    en: ['Deep agents', 'AI agents built for long, complex tasks that a simple agent cannot complete. They rely on four elements: very detailed instructions, a tool for planning the work in steps, the ability to hand parts of the task to sub-agents, and a file system for saving notes and results. The term was proposed in 2025 by LangChain, which also uses it for its Deep Agents library; the examples it cites include Claude Code, Deep Research and Manus.'],
    fr: ['Deep agents (agents « profonds »)', 'Des agents IA conçus pour des tâches longues et complexes, qu\'un agent simple ne parvient pas à mener à bien. Ils reposent sur quatre éléments : des instructions très détaillées, un outil pour planifier le travail par étapes, la possibilité de confier des parties de la tâche à des sous-agents et un système de fichiers pour garder notes et résultats. Le terme a été proposé en 2025 par LangChain, qui l\'utilise aussi pour sa bibliothèque Deep Agents ; parmi les exemples cités figurent Claude Code, Deep Research et Manus.'],
    de: ['Deep Agents', 'KI-Agenten für lange, komplexe Aufgaben, die ein einfacher Agent nicht bewältigt. Sie beruhen auf vier Bausteinen: sehr ausführlichen Anweisungen, einem Werkzeug, um die Arbeit in Schritten zu planen, der Möglichkeit, Teile der Aufgabe an Unteragenten abzugeben, und einem Dateisystem für Notizen und Ergebnisse. Den Begriff hat LangChain 2025 vorgeschlagen und nutzt ihn auch für seine Bibliothek Deep Agents; als Beispiele nennt es Claude Code, Deep Research und Manus.'] },
  { id: 'machine-learning', re: /machine learning|apprendimento automatico|apprentissage automatique|maschinelle[sn]? lernen/i,
    it: ['Machine learning (apprendimento automatico)', 'Il metodo con cui un programma impara dagli esempi invece di seguire regole scritte una per una. È la base di quasi tutta l\'intelligenza artificiale di oggi.'],
    en: ['Machine learning', 'The method by which a program learns from examples instead of following rules written one by one. It is the basis of almost all of today\'s artificial intelligence.'],
    fr: ['Machine learning (apprentissage automatique)', 'La méthode par laquelle un programme apprend à partir d\'exemples au lieu de suivre des règles écrites une à une. C\'est la base de presque toute l\'intelligence artificielle actuelle.'],
    de: ['Machine Learning (maschinelles Lernen)', 'Das Verfahren, bei dem ein Programm aus Beispielen lernt, statt einzeln geschriebenen Regeln zu folgen. Es ist die Grundlage fast aller heutigen künstlichen Intelligenz.'] },
  { id: 'deep-learning', re: /deep learning|apprendimento profondo|apprentissage profond/i,
    it: ['Deep learning', 'Un tipo di machine learning che usa reti neurali con molti strati. Ha reso possibili il riconoscimento di immagini e voce e i modelli linguistici attuali.'],
    en: ['Deep learning', 'A type of machine learning that uses neural networks with many layers. It made image and speech recognition and today\'s language models possible.'],
    fr: ['Deep learning (apprentissage profond)', 'Un type de machine learning qui utilise des réseaux de neurones à nombreuses couches. Il a rendu possibles la reconnaissance d\'images et de la voix ainsi que les modèles de langage actuels.'],
    de: ['Deep Learning', 'Eine Form des maschinellen Lernens, die neuronale Netze mit vielen Schichten nutzt. Sie hat Bild- und Spracherkennung sowie die heutigen Sprachmodelle möglich gemacht.'] },
  { id: 'rete-neurale', re: /ret[ei] neural|neural networks?|réseaux? de neurones|neuronale[sn]? netz/i,
    it: ['Rete neurale', 'Un modello matematico ispirato alla lontana ai neuroni del cervello: tanti nodi collegati tra loro, i cui collegamenti si regolano durante l\'addestramento fino a produrre il risultato voluto.'],
    en: ['Neural network', 'A mathematical model loosely inspired by the neurons of the brain: many connected nodes whose connections are adjusted during training until they produce the desired result.'],
    fr: ['Réseau de neurones', 'Un modèle mathématique lointainement inspiré des neurones du cerveau : de nombreux nœuds reliés entre eux, dont les connexions s\'ajustent pendant l\'entraînement jusqu\'à produire le résultat voulu.'],
    de: ['Neuronales Netz', 'Ein mathematisches Modell, das entfernt von den Neuronen des Gehirns inspiriert ist: viele verbundene Knoten, deren Verbindungen im Training angepasst werden, bis das gewünschte Ergebnis entsteht.'] },
  { id: 'addestramento', re: /addestrament|addestrat[oiae]\b|\btraining\b|entraînement|trainiert/i,
    it: ['Addestramento (training)', 'La fase in cui un modello impara, analizzando grandi quantità di dati e correggendo via via i propri errori. Richiede molta potenza di calcolo ed è la parte più costosa dello sviluppo di un\'AI.'],
    en: ['Training', 'The phase in which a model learns, by analysing large amounts of data and gradually correcting its own errors. It takes a great deal of computing power and is the most expensive part of building an AI.'],
    fr: ['Entraînement', 'La phase pendant laquelle un modèle apprend, en analysant de grandes quantités de données et en corrigeant peu à peu ses erreurs. Elle exige beaucoup de puissance de calcul et constitue la partie la plus coûteuse du développement d\'une IA.'],
    de: ['Training', 'Die Phase, in der ein Modell lernt, indem es große Datenmengen auswertet und seine Fehler schrittweise korrigiert. Sie erfordert sehr viel Rechenleistung und ist der teuerste Teil der KI-Entwicklung.'] },
  { id: 'fine-tuning', re: /fine[- ]?tun/i,
    it: ['Fine-tuning', 'L\'addestramento aggiuntivo di un modello già pronto, su dati specifici, per adattarlo a un compito o a un settore: per esempio il linguaggio legale o lo stile di un\'azienda.'],
    en: ['Fine-tuning', 'Additional training of an existing model on specific data, to adapt it to a task or a field: for example legal language or a company\'s style.'],
    fr: ['Fine-tuning (ajustement)', 'L\'entraînement supplémentaire d\'un modèle existant sur des données spécifiques, pour l\'adapter à une tâche ou à un domaine : par exemple le langage juridique ou le style d\'une entreprise.'],
    de: ['Fine-Tuning', 'Das zusätzliche Training eines bestehenden Modells mit speziellen Daten, um es an eine Aufgabe oder ein Fachgebiet anzupassen, etwa an juristische Sprache oder den Stil eines Unternehmens.'] },
  { id: 'inferenza', re: /\binferenz|\binference\b|inférence/i,
    it: ['Inferenza', 'Il momento in cui un modello già addestrato viene usato per rispondere a una richiesta. Ogni domanda a un chatbot è un\'inferenza: consuma meno di un addestramento, ma si ripete miliardi di volte.'],
    en: ['Inference', 'The moment an already trained model is used to answer a request. Every question to a chatbot is an inference: it uses far less than training, but it happens billions of times.'],
    fr: ['Inférence', 'Le moment où un modèle déjà entraîné est utilisé pour répondre à une demande. Chaque question posée à un chatbot est une inférence : elle consomme moins qu\'un entraînement, mais se répète des milliards de fois.'],
    de: ['Inferenz', 'Der Moment, in dem ein bereits trainiertes Modell eine Anfrage beantwortet. Jede Frage an einen Chatbot ist eine Inferenz: Sie verbraucht weit weniger als das Training, findet aber milliardenfach statt.'] },
  { id: 'multimodale', re: /multimodal/i,
    it: ['Modello multimodale', 'Un modello capace di lavorare con più tipi di contenuto insieme: testo, immagini, audio, video. Può, per esempio, descrivere una foto o rispondere a voce.'],
    en: ['Multimodal model', 'A model that can work with several kinds of content together: text, images, audio, video. It can, for example, describe a photo or answer by voice.'],
    fr: ['Modèle multimodal', 'Un modèle capable de traiter plusieurs types de contenus à la fois : texte, images, audio, vidéo. Il peut par exemple décrire une photo ou répondre à la voix.'],
    de: ['Multimodales Modell', 'Ein Modell, das mehrere Arten von Inhalten zugleich verarbeitet: Text, Bilder, Audio, Video. Es kann zum Beispiel ein Foto beschreiben oder per Stimme antworten.'] },
  { id: 'rag', re: /\bRAG\b|retrieval[- ]augmented/,
    it: ['RAG', 'Tecnica che fa cercare al modello le informazioni in documenti o archivi prima di rispondere, così che la risposta si basi su fonti precise e aggiornate. RAG sta per Retrieval-Augmented Generation.'],
    en: ['RAG', 'A technique that has the model look up information in documents or databases before answering, so the answer rests on specific, up-to-date sources. RAG stands for retrieval-augmented generation.'],
    fr: ['RAG', 'Technique qui fait chercher au modèle des informations dans des documents ou des bases de données avant de répondre, afin que la réponse s\'appuie sur des sources précises et à jour. RAG signifie Retrieval-Augmented Generation.'],
    de: ['RAG', 'Ein Verfahren, bei dem das Modell vor der Antwort Informationen in Dokumenten oder Datenbanken nachschlägt, damit die Antwort auf konkreten, aktuellen Quellen beruht. RAG steht für Retrieval-Augmented Generation.'] },
  { id: 'open-source', re: /open[- ]source|open weights?|pesi aperti|poids ouverts|offene gewichte/i,
    it: ['Open source e pesi aperti', 'Un modello è a pesi aperti quando chiunque può scaricarlo e farlo girare sui propri computer. Open source, in senso pieno, significa che sono pubblici anche il codice e le condizioni per modificarlo e riusarlo.'],
    en: ['Open source and open weights', 'A model has open weights when anyone can download it and run it on their own computers. Open source, in the full sense, means the code and the terms for modifying and reusing it are public too.'],
    fr: ['Open source et poids ouverts', 'Un modèle est à poids ouverts quand chacun peut le télécharger et le faire tourner sur ses propres machines. Open source, au sens plein, signifie que le code et les conditions de modification et de réutilisation sont eux aussi publics.'],
    de: ['Open Source und offene Gewichte', 'Ein Modell hat offene Gewichte, wenn jeder es herunterladen und auf eigenen Rechnern betreiben kann. Open Source im vollen Sinn bedeutet, dass auch der Code und die Bedingungen für Änderung und Weiterverwendung öffentlich sind.'] },
  { id: 'parametri', re: /(miliardi|milioni|billion|million|milliards?|millions?|milliarden|millionen) (di |de |d')?param/i,
    it: ['Parametri', 'I numeri interni di un modello, regolati durante l\'addestramento, che ne determinano il comportamento. I modelli più grandi ne hanno miliardi; più parametri non significa automaticamente risposte migliori.'],
    en: ['Parameters', 'The internal numbers of a model, set during training, that determine how it behaves. The largest models have billions; more parameters does not automatically mean better answers.'],
    fr: ['Paramètres', 'Les nombres internes d\'un modèle, réglés pendant l\'entraînement, qui déterminent son comportement. Les plus grands modèles en comptent des milliards ; davantage de paramètres ne signifie pas forcément de meilleures réponses.'],
    de: ['Parameter', 'Die internen Zahlenwerte eines Modells, die im Training eingestellt werden und sein Verhalten bestimmen. Die größten Modelle haben Milliarden davon; mehr Parameter bedeuten nicht automatisch bessere Antworten.'] },
  { id: 'finestra-di-contesto', re: /finestra di contesto|context window|fenêtre de contexte|kontextfenster/i,
    it: ['Finestra di contesto', 'La quantità di testo che un modello riesce a tenere presente in una sola conversazione, misurata in token. Oltre quel limite le parti più vecchie vengono dimenticate o riassunte.'],
    en: ['Context window', 'The amount of text a model can keep in mind within a single conversation, measured in tokens. Beyond that limit the oldest parts are forgotten or summarised.'],
    fr: ['Fenêtre de contexte', 'La quantité de texte qu\'un modèle peut garder en tête dans une même conversation, mesurée en tokens. Au-delà de cette limite, les parties les plus anciennes sont oubliées ou résumées.'],
    de: ['Kontextfenster', 'Die Textmenge, die ein Modell in einer einzelnen Unterhaltung im Blick behalten kann, gemessen in Tokens. Jenseits dieser Grenze werden die ältesten Teile vergessen oder zusammengefasst.'] },
  { id: 'agi', re: /\bAGI\b|superintelligen|intelligenza artificiale generale|general intelligence|intelligence artificielle générale|allgemeine (künstliche )?intelligenz/,
    it: ['AGI (intelligenza artificiale generale)', 'Un\'ipotetica AI capace di svolgere qualunque compito intellettuale al livello di una persona, o meglio. Non esiste una definizione condivisa né accordo su se e quando arriverà.'],
    en: ['AGI (artificial general intelligence)', 'A hypothetical AI able to perform any intellectual task as well as a person, or better. There is no agreed definition, nor agreement on whether or when it will arrive.'],
    fr: ['AGI (intelligence artificielle générale)', 'Une IA hypothétique capable d\'accomplir n\'importe quelle tâche intellectuelle aussi bien qu\'une personne, voire mieux. Il n\'existe ni définition partagée ni accord sur le fait qu\'elle arrive, ni sur la date.'],
    de: ['AGI (allgemeine künstliche Intelligenz)', 'Eine hypothetische KI, die jede geistige Aufgabe so gut wie ein Mensch oder besser lösen kann. Es gibt weder eine einheitliche Definition noch Einigkeit darüber, ob und wann sie kommt.'] },
  { id: 'gpu', re: /\bGPUs?\b/,
    it: ['GPU', 'Il processore grafico, nato per i videogiochi, che si è rivelato ideale per i calcoli dell\'intelligenza artificiale. Le GPU sono la risorsa più contesa del settore.'],
    en: ['GPU', 'The graphics processor, originally built for video games, that turned out to be ideal for AI calculations. GPUs are the most sought-after resource in the industry.'],
    fr: ['GPU', 'Le processeur graphique, né pour les jeux vidéo, qui s\'est révélé idéal pour les calculs de l\'intelligence artificielle. Les GPU sont la ressource la plus disputée du secteur.'],
    de: ['GPU', 'Der Grafikprozessor, ursprünglich für Videospiele entwickelt, der sich als ideal für KI-Berechnungen erwiesen hat. GPUs sind die begehrteste Ressource der Branche.'] },
  { id: 'data-center', re: /data ?cent(er|re)s?|centres? de données|rechenzentr/i,
    it: ['Data center', 'Gli edifici che ospitano i computer su cui vengono addestrati e fatti funzionare i modelli di AI. Consumano molta elettricità e, per il raffreddamento, spesso anche acqua.'],
    en: ['Data centre', 'The buildings that house the computers on which AI models are trained and run. They use a great deal of electricity and, for cooling, often water as well.'],
    fr: ['Centre de données (data center)', 'Les bâtiments qui abritent les ordinateurs sur lesquels les modèles d\'IA sont entraînés et exploités. Ils consomment beaucoup d\'électricité et, pour le refroidissement, souvent de l\'eau.'],
    de: ['Rechenzentrum', 'Die Gebäude, in denen die Computer stehen, auf denen KI-Modelle trainiert und betrieben werden. Sie verbrauchen viel Strom und zur Kühlung häufig auch Wasser.'] },
  { id: 'deepfake', re: /deepfakes?/i,
    it: ['Deepfake', 'Un video, un\'immagine o un audio falso ma realistico, creato con l\'AI, che mostra una persona dire o fare cose mai avvenute.'],
    en: ['Deepfake', 'A fake but realistic video, image or audio clip made with AI, showing a person saying or doing things that never happened.'],
    fr: ['Deepfake', 'Une vidéo, une image ou un enregistrement audio faux mais réaliste, créé avec l\'IA, montrant une personne dire ou faire des choses qui n\'ont jamais eu lieu.'],
    de: ['Deepfake', 'Ein gefälschtes, aber realistisches Video, Bild oder Audio, das mit KI erzeugt wurde und eine Person Dinge sagen oder tun lässt, die nie geschehen sind.'] },
  { id: 'ai-act', re: /\bAI Act\b|regolamento (europeo )?sull['’](intelligenza artificiale|ia)\b|ki-verordnung|règlement (européen )?sur l['’](ia|intelligence artificielle)/i,
    it: ['AI Act', 'Il regolamento dell\'Unione europea sull\'intelligenza artificiale, in vigore dal 2024 e applicato per gradi. Classifica i sistemi in base al rischio: alcuni usi sono vietati, altri sono soggetti a obblighi di trasparenza e controllo.'],
    en: ['AI Act', 'The European Union\'s regulation on artificial intelligence, in force since 2024 and applied in stages. It classifies systems by risk: some uses are banned, others are subject to transparency and oversight obligations.'],
    fr: ['AI Act', 'Le règlement de l\'Union européenne sur l\'intelligence artificielle, en vigueur depuis 2024 et appliqué par étapes. Il classe les systèmes selon le risque : certains usages sont interdits, d\'autres soumis à des obligations de transparence et de contrôle.'],
    de: ['AI Act (KI-Verordnung)', 'Die Verordnung der Europäischen Union über künstliche Intelligenz, seit 2024 in Kraft und schrittweise anwendbar. Sie stuft Systeme nach Risiko ein: Manche Anwendungen sind verboten, andere unterliegen Transparenz- und Aufsichtspflichten.'] },
  { id: 'benchmark', re: /benchmarks?/i,
    it: ['Benchmark', 'Una prova standard, uguale per tutti, usata per confrontare i modelli di AI. Utile per orientarsi, ma un punteggio alto in un test non garantisce buoni risultati nell\'uso reale.'],
    en: ['Benchmark', 'A standard test, the same for everyone, used to compare AI models. Useful as a guide, but a high score on a test does not guarantee good results in real use.'],
    fr: ['Benchmark', 'Un test standard, identique pour tous, servant à comparer les modèles d\'IA. Utile pour s\'orienter, mais un score élevé à un test ne garantit pas de bons résultats en usage réel.'],
    de: ['Benchmark', 'Ein für alle gleicher Standardtest zum Vergleich von KI-Modellen. Hilfreich zur Orientierung, doch ein hoher Testwert garantiert keine guten Ergebnisse im echten Einsatz.'] },
  { id: 'modello-di-diffusione', re: /diffusion models?|modell[oi] di diffusione|modèles? de diffusion|diffusionsmodell/i,
    it: ['Modello di diffusione', 'La tecnica alla base di molti generatori di immagini e video: il modello impara a togliere il rumore da un\'immagine confusa, un passo alla volta, fino a far emergere il contenuto richiesto.'],
    en: ['Diffusion model', 'The technique behind many image and video generators: the model learns to remove noise from a blurred image, one step at a time, until the requested content emerges.'],
    fr: ['Modèle de diffusion', 'La technique à la base de nombreux générateurs d\'images et de vidéos : le modèle apprend à retirer le bruit d\'une image brouillée, étape par étape, jusqu\'à faire apparaître le contenu demandé.'],
    de: ['Diffusionsmodell', 'Die Technik hinter vielen Bild- und Videogeneratoren: Das Modell lernt, Rauschen Schritt für Schritt aus einem verrauschten Bild zu entfernen, bis der gewünschte Inhalt entsteht.'] },
  { id: 'api', re: /\bAPIs?\b/,
    it: ['API', 'L\'interfaccia che permette a un programma di usare un servizio di un altro. Con le API le aziende inseriscono i modelli di AI nelle proprie app e nei propri siti, pagando in base all\'uso.'],
    en: ['API', 'The interface that lets one program use another\'s service. Through APIs, companies build AI models into their own apps and websites, paying according to use.'],
    fr: ['API', 'L\'interface qui permet à un programme d\'utiliser le service d\'un autre. Grâce aux API, les entreprises intègrent des modèles d\'IA dans leurs applications et leurs sites, en payant à l\'usage.'],
    de: ['API', 'Die Schnittstelle, über die ein Programm den Dienst eines anderen nutzt. Über APIs bauen Unternehmen KI-Modelle in eigene Apps und Websites ein und zahlen nach Verbrauch.'] },
  { id: 'embedding', re: /embeddings?/i,
    it: ['Embedding', 'La trasformazione di un testo, o di un\'immagine, in una serie di numeri che ne rappresenta il significato. Permette di trovare contenuti simili per senso e non solo per parole uguali.'],
    en: ['Embedding', 'The conversion of a text, or an image, into a series of numbers that represents its meaning. It makes it possible to find content that is similar in sense, not just in wording.'],
    fr: ['Embedding (plongement)', 'La transformation d\'un texte, ou d\'une image, en une suite de nombres qui en représente le sens. Elle permet de retrouver des contenus proches par le sens et pas seulement par les mots.'],
    de: ['Embedding', 'Die Umwandlung eines Textes oder Bildes in eine Zahlenreihe, die seine Bedeutung abbildet. Damit lassen sich Inhalte finden, die dem Sinn nach ähnlich sind und nicht nur dem Wortlaut nach.'] }
];

const UI = {
  it: { locale: 'it-IT', lang: 'Lingua della pagina', title: 'Glossario dell\'intelligenza artificiale', seo: 'Glossario AI: i termini dell\'intelligenza artificiale spiegati semplice',
    desc: 'Che cosa significano LLM, prompt, token, allucinazione, agente AI, RAG, AGI? Il glossario di FAIND spiega in parole semplici i termini dell\'intelligenza artificiale, con le notizie che li citano.',
    lede: 'Le parole dell\'intelligenza artificiale, spiegate in modo semplice e senza giri di parole. Nelle pagine notizia di FAIND i termini del glossario sono collegati in automatico alla loro definizione.',
    news: 'Nelle notizie', back: '← Tutte le notizie', home: 'Torna alle notizie di FAIND', crumb: 'Glossario', index: 'Indice dei termini',
    foot: ['Chi siamo', 'Temi', 'Glossario', 'Feed RSS', 'Privacy e note legali'], about: 'redazione.html', topics: 'temi/', allNews: 'Tutte le notizie che lo citano', allTerms: 'Tutti i termini del glossario', what: "cos'è e cosa significa" },
  en: { locale: 'en', lang: 'Page language', title: 'Artificial intelligence glossary', seo: 'AI glossary: artificial intelligence terms explained simply',
    desc: 'What do LLM, prompt, token, hallucination, AI agent, RAG and AGI mean? The FAIND glossary explains artificial intelligence terms in plain words, with the news stories that mention them.',
    lede: 'The words of artificial intelligence, explained simply and without jargon. On FAIND news pages, glossary terms are linked automatically to their definition.',
    news: 'In the news', back: '← All news', home: 'Back to FAIND news', crumb: 'Glossary', index: 'Index of terms',
    foot: ['About us', 'Topics', 'Glossary', 'RSS feed', 'Privacy and legal notes'], about: 'about.html', topics: 'temi/en/', allNews: 'All the news that mentions it', allTerms: 'All glossary terms', what: 'what it is and what it means' },
  fr: { locale: 'fr', lang: 'Langue de la page', title: 'Glossaire de l\'intelligence artificielle', seo: 'Glossaire IA : les termes de l\'intelligence artificielle expliqués simplement',
    desc: 'Que signifient LLM, prompt, token, hallucination, agent IA, RAG, AGI ? Le glossaire de FAIND explique simplement les termes de l\'intelligence artificielle, avec les actualités qui les citent.',
    lede: 'Les mots de l\'intelligence artificielle, expliqués simplement et sans jargon. Dans les pages d\'actualité de FAIND, les termes du glossaire renvoient automatiquement à leur définition.',
    news: 'Dans l\'actualité', back: '← Toutes les actualités', home: 'Retour aux actualités de FAIND', crumb: 'Glossaire', index: 'Index des termes',
    foot: ['Qui sommes-nous', 'Thèmes', 'Glossaire', 'Flux RSS', 'Confidentialité et mentions légales'], about: 'a-propos.html', topics: 'temi/fr/', allNews: 'Toutes les actualités qui le citent', allTerms: 'Tous les termes du glossaire', what: 'définition et signification' },
  de: { locale: 'de', lang: 'Sprache der Seite', title: 'Glossar der künstlichen Intelligenz', seo: 'KI-Glossar: Begriffe der künstlichen Intelligenz einfach erklärt',
    desc: 'Was bedeuten LLM, Prompt, Token, Halluzination, KI-Agent, RAG und AGI? Das FAIND-Glossar erklärt die Begriffe der künstlichen Intelligenz in einfachen Worten, mit den Nachrichten, in denen sie vorkommen.',
    lede: 'Die Begriffe der künstlichen Intelligenz, einfach und ohne Fachjargon erklärt. Auf den Nachrichtenseiten von FAIND sind Glossarbegriffe automatisch mit ihrer Definition verknüpft.',
    news: 'In den Nachrichten', back: '← Alle Nachrichten', home: 'Zurück zu den FAIND-Nachrichten', crumb: 'Glossar', index: 'Verzeichnis der Begriffe',
    foot: ['Über uns', 'Themen', 'Glossar', 'RSS-Feed', 'Datenschutz und rechtliche Hinweise'], about: 'ueber-uns.html', topics: 'temi/de/', allNews: 'Alle Nachrichten, die ihn erwähnen', allTerms: 'Alle Begriffe im Glossar', what: 'was es ist und was es bedeutet' }
};
const LANG_LABEL = { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v) => (v == null ? '' : typeof v === 'string' ? v : (v.it || v.en || ''));

/* Pagina di un termine (relativa alla radice del sito) */
export const termPath = (id, lang = 'it') => `${GLOSSARY_PATH[lang] || GLOSSARY_PATH.it}${id}.html`;

/* Termini del glossario presenti in un testo */
export function termsIn(text) {
  return TERMS.filter(t => t.re && t.re.test(text));
}
/* Trasforma in link la prima comparsa di ogni termine (al massimo "max"). Il testo deve essere già "escapato". */
export function linkify(escaped, base, lang = 'it', max = 4) {
  let parts = [escaped], done = 0;
  for (const t of TERMS) {
    if (!t.re || done >= max) continue;
    for (let i = 0; i < parts.length; i += 2) {           // indici pari = testo non ancora collegato
      const m = t.re.exec(parts[i]);
      if (!m) continue;
      // estendo alla parola intera, per non spezzare "chatbots" o "allucinazioni"
      let a = m.index, b = m.index + m[0].length;
      while (b < parts[i].length && /[\p{L}\p{N}]/u.test(parts[i][b])) b++;
      while (a > 0 && /[\p{L}\p{N}]/u.test(parts[i][a - 1])) a--;
      const word = parts[i].slice(a, b);
      const link = `<a class="gl" href="${base}${termPath(t.id, lang)}" title="${esc((t[lang] || t.it)[1])}">${word}</a>`;
      parts.splice(i, 1, parts[i].slice(0, a), link, parts[i].slice(b));
      done++; break;
    }
  }
  return parts.join('');
}

function page(lang, news, now) {
  const u = UI[lang], up = lang === 'it' ? '../' : '../../';
  const url = SITE + GLOSSARY_PATH[lang];
  const terms = TERMS.map(t => ({ id: t.id, re: t.re, name: t[lang][0], def: t[lang][1] })).sort((a, b) => a.name.localeCompare(b.name, lang));
  const sw = Object.keys(GLOSSARY_PATH).map(k => k === lang
    ? `<span class="lsw__on" aria-current="page">${LANG_LABEL[k]}</span>`
    : `<a href="${up}${GLOSSARY_PATH[k]}" hreflang="${k}" lang="${k}">${LANG_LABEL[k]}</a>`).join(' ');
  const alts = Object.keys(GLOSSARY_PATH).map(k => `  <link rel="alternate" hreflang="${k}" href="${SITE}${GLOSSARY_PATH[k]}">`).join('\n') + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}${GLOSSARY_PATH.it}">`;
  const body = terms.map(t => {
    const hits = t.re ? news.filter(n => t.re.test(`${tx(n.title)} ${tx(n.summary) || ''}`)) : [];
    const pref = [...hits.filter(n => (n.lang || 'it') === lang), ...hits.filter(n => (n.lang || 'it') !== lang)].slice(0, 3);
    const list = pref.length ? `\n      <p class="gt__news"><b>${u.news}:</b> ${pref.map(n => `<a href="${esc(n.page ? up + n.page : n.link.url)}">${esc(tx(n.title))}</a>`).join(' · ')}</p>` : '';
    return `    <section id="${t.id}" class="gt">\n      <h2><a href="${t.id}.html">${esc(t.name)}</a></h2>\n      <p>${esc(t.def)}</p>${list}\n    </section>`;
  }).join('\n');
  const jsonld = { '@context': 'https://schema.org', '@type': 'DefinedTermSet', '@id': url, url, name: u.title, inLanguage: u.locale, dateModified: new Date(now).toISOString(),
    isPartOf: { '@id': SITE + '#website' },
    hasDefinedTerm: terms.map(t => ({ '@type': 'DefinedTerm', name: t.name, description: t.def, url: `${url}#${t.id}`, inDefinedTermSet: url })) };
  return `<!doctype html>
<html lang="${lang}" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(u.seo)} | FAIND</title>
  <meta name="description" content="${esc(u.desc)}">
  <link rel="canonical" href="${url}">
${alts}
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FAIND">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(u.title)}">
  <meta property="og:description" content="${esc(u.desc)}">
  <meta property="og:image" content="${SITE}assets/og-image.png">
  <link rel="icon" href="${up}assets/favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="${up}assets/icon-180.png">
  <link rel="manifest" href="${up}manifest.webmanifest">
  <script>(function(){var t=null;try{t=localStorage.getItem('faind-theme')}catch(e){}if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="stylesheet" href="${up}assets/fonts/archivo.css">
  <link rel="stylesheet" href="${up}style.css">
  <style>
    .lsw { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; font-size: 13.5px; margin-bottom: 18px; }
    .lsw__lab { color: var(--muted); } .lsw a { color: var(--ink); font-weight: 600; } .lsw__on { font-weight: 800; color: #4293B9; }
    .legal section.gt { padding-top: 16px; margin-top: 16px; }
    .legal .gt h2 { font-size: 19px; margin-bottom: 6px; }
    .legal .gt p { color: var(--ink); }
    .legal .gt p.gt__news { font-size: 14px; color: var(--muted); margin-top: 8px; }
    .gt__news a { color: var(--link); }
    .legal .gt h2 a { color: var(--ink); text-decoration: none; }
    .legal .gt h2 a:hover { color: var(--link); text-decoration: underline; }
${ALSO_CSS}
    .gt:target { background: rgba(66,147,185,.12); border-radius: 10px; padding: 16px 14px; margin-inline: -14px; }
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
  <main class="wrap legal">
    <p class="lsw"><span class="lsw__lab">${u.lang}:</span> ${sw}</p>
    <h1 class="legal__title">${esc(u.title)}</h1>
    <p class="legal__lede">${esc(u.lede)}</p>
    <nav class="legal__toc" aria-label="${esc(u.index)}">
      ${terms.map(t => `<a href="#${t.id}">${esc(t.name.replace(/ \(.*\)$/, ''))}</a>`).join('')}
    </nav>
${body}
    ${alsoBand(lang, up)}
    <p class="legal__back"><a class="btn btn--primary" href="${up}">${u.home}</a></p>
  </main>
  ${footerHtml(lang, up)}
</body>
</html>
`;
}

// Pagina di un singolo termine: definizione e tutte le notizie (archivio compreso) che lo citano
const TERM_MAX = 60;
function termPage(t, lang, news, now) {
  const u = UI[lang], up = lang === 'it' ? '../' : '../../';
  const [name, def] = t[lang];
  const url = SITE + termPath(t.id, lang);
  const hits = t.re ? news.filter(n => t.re.test(`${tx(n.title)} ${tx(n.summary) || ''}`)) : [];
  const short = name.replace(/ \(.*\)$/, '');
  const jsonld = { '@context': 'https://schema.org', '@type': 'DefinedTerm', '@id': url, url, name, description: def, inLanguage: u.locale,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: u.title, url: SITE + GLOSSARY_PATH[lang] }, dateModified: new Date(now).toISOString() };
  const main = `    ${hits.length ? `<h2 class="al-month" style="border:0;margin-top:34px">${esc(u.allNews)}</h2>\n${newsListHtml(hits.slice(0, TERM_MAX), up, lang)}` : ''}
    <p style="margin-top:28px"><a href="./">${esc(u.allTerms)} →</a></p>`;
  return shell({ lang, up, url, title: `${short}: ${u.what} | ${u.crumb} FAIND`, desc: def.length > 155 ? def.slice(0, 152).replace(/\s+\S*$/, '') + '…' : def,
    h1: name, lede: esc(def), main, jsonld,
    alternates: Object.keys(GLOSSARY_PATH).map(l => ({ lang: l, url: SITE + termPath(t.id, l) })),
    crumb: `<a href="${up}">FAIND</a> › <a href="./">${esc(u.crumb)}</a>` });
}

export async function buildGlossary(news, root, now = Date.now()) {
  const list = [...(news || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const urls = [];
  for (const lang of Object.keys(GLOSSARY_PATH)) {
    const dir = path.join(root, GLOSSARY_PATH[lang]);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(lang, list, now));
    urls.push(SITE + GLOSSARY_PATH[lang]);
    for (const t of TERMS) {
      await writeFile(path.join(dir, `${t.id}.html`), termPage(t, lang, list, now));
      urls.push(SITE + termPath(t.id, lang));
    }
  }
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`)).map(u => `<url><loc>${u}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con il glossario:', e.message); }
  console.log(`📖 glossario: ${TERMS.length} termini in ${Object.keys(GLOSSARY_PATH).length} lingue, ${urls.length} pagine`);
}
