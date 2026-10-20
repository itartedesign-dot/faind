/* Approfondimenti per le voci del glossario più cercate (Search Console, 20/10/2026).
   Ogni voce: lingua → elenco di [titoletto, testo]. Si mostrano nella pagina del termine, sopra le notizie.
   Aggiungere una voce solo se c'è davvero qualcosa di utile da dire: niente testo di riempimento. */
export const MORE = {
  'data-center': {
    it: [
      ['Cos\'è un data center', 'Un data center è un edificio, o un gruppo di edifici, pieno di server: computer collegati in rete, con impianti per l\'alimentazione elettrica, il raffreddamento e le connessioni a internet. Ci girano siti web, app, archivi di dati e, sempre più spesso, i modelli di intelligenza artificiale. Si scrive anche "datacenter", tutto attaccato, o "data centre" all\'inglese britannico: è la stessa cosa.'],
      ['Perché l\'AI ne ha bisogno', 'Addestrare un modello e farlo rispondere richiede migliaia di <a href="gpu.html">GPU</a> che lavorano insieme, e un telefono o un portatile non bastano. Quando scrivi a un chatbot, la richiesta parte dal tuo dispositivo, viaggia fino a un data center, a volte a centinaia di chilometri, e la risposta torna indietro in pochi secondi.'],
      ['Quanta energia e quanta acqua consumano', 'Secondo l\'Agenzia internazionale dell\'energia (IEA), nel 2024 i data center del mondo hanno consumato circa 415 terawattora, l\'1,5% dell\'elettricità mondiale, e potrebbero arrivare a circa 945 entro il 2030, soprattutto per l\'AI. Per raffreddare i computer molti impianti usano acqua, in parte evaporata. Cifre, confronti e dubbi sono spiegati nell\'approfondimento qui sotto.'],
      ['Un equivoco comune', 'Si dice che i dati stanno "nel cloud" come se fossero in aria. In realtà il cloud sono data center fisici, di proprietà di qualcun altro: ogni foto salvata online e ogni risposta di un chatbot passano da edifici veri, con consumi veri, costruiti in luoghi precisi. Per questo l\'apertura di un nuovo data center è spesso una notizia, e a volte una discussione locale.']
    ],
    en: [
      ['What a data centre is', 'A data centre is a building, or a group of buildings, filled with servers: networked computers, together with the power supply, cooling and internet connections they need. Websites, apps, stored data and, more and more, AI models run there. "Datacenter" and "data center" are spelling variants of the same thing; "data centre" is the British form.'],
      ['Why AI needs them', 'Training a model and answering questions takes thousands of GPUs working together, far more than a phone or laptop can offer. When you message a chatbot, the request leaves your device, reaches a data centre that may be hundreds of kilometres away, and the answer comes back in seconds.'],
      ['Energy and water', 'According to the International Energy Agency, data centres worldwide used about 415 terawatt-hours of electricity in 2024, around 1.5% of the world total, and could reach about 945 by 2030, mostly because of AI. Many sites also use water for cooling, part of which evaporates. The article below explains the figures and the caveats.']
    ],
    fr: [
      ['Ce qu\'est un centre de données', 'Un centre de données (data center) est un bâtiment, ou un ensemble de bâtiments, rempli de serveurs : des ordinateurs en réseau, avec l\'alimentation électrique, le refroidissement et les connexions internet nécessaires. On y trouve des sites web, des applications, des données stockées et, de plus en plus, des modèles d\'IA.'],
      ['Pourquoi l\'IA en a besoin', 'Entraîner un modèle et le faire répondre demande des milliers de GPU qui travaillent ensemble, bien plus qu\'un téléphone ou un portable ne peut offrir. Quand vous écrivez à un chatbot, la requête quitte votre appareil, arrive dans un centre de données parfois à des centaines de kilomètres, puis la réponse revient en quelques secondes.'],
      ['Énergie et eau', 'Selon l\'Agence internationale de l\'énergie, les centres de données du monde ont consommé environ 415 térawattheures en 2024, soit 1,5 % de l\'électricité mondiale, et pourraient atteindre environ 945 d\'ici 2030, surtout à cause de l\'IA. Beaucoup de sites utilisent aussi de l\'eau pour le refroidissement, dont une partie s\'évapore.']
    ],
    de: [
      ['Was ein Rechenzentrum ist', 'Ein Rechenzentrum ist ein Gebäude oder Gebäudekomplex voller Server, also vernetzter Computer, samt Stromversorgung, Kühlung und Internetanbindung. Dort laufen Websites, Apps, gespeicherte Daten und zunehmend KI-Modelle. „Data Center“ und „Datacenter“ sind englische Bezeichnungen für dasselbe.'],
      ['Warum KI sie braucht', 'Ein Modell zu trainieren und Antworten zu berechnen erfordert Tausende GPUs im Verbund, weit mehr als ein Handy oder Laptop leisten kann. Wer einem Chatbot schreibt, schickt die Anfrage an ein Rechenzentrum, manchmal Hunderte Kilometer entfernt; die Antwort kommt binnen Sekunden zurück.'],
      ['Energie und Wasser', 'Laut der Internationalen Energieagentur verbrauchten Rechenzentren weltweit 2024 rund 415 Terawattstunden Strom, etwa 1,5 % des weltweiten Verbrauchs, und könnten bis 2030 auf etwa 945 steigen, vor allem wegen KI. Viele Anlagen kühlen außerdem mit Wasser, von dem ein Teil verdunstet.']
    ]
  },
  gpu: {
    it: [
      ['Che differenza c\'è tra GPU e CPU', 'La CPU è il processore generale di un computer: esegue poche operazioni alla volta, ma molto varie e complesse. La GPU, nata per disegnare la grafica dei videogiochi, ne esegue migliaia contemporaneamente, tutte semplici. Addestrare e far funzionare un modello di intelligenza artificiale significa fare enormi quantità di moltiplicazioni quasi identiche, ed è un lavoro su misura per una GPU.'],
      ['Perché sono così contese', 'I chip per l\'AI sono costosi, si producono in pochi stabilimenti e un grande <a href="data-center.html">data center</a> ne usa migliaia. Nvidia è il principale produttore di GPU per l\'AI; esistono anche chip pensati apposta, come le TPU di Google, che però non sono GPU in senso stretto. La disponibilità di questi chip condiziona chi può permettersi di creare un modello avanzato.'],
      ['Serve una GPU per usare ChatGPT?', 'No. Usando ChatGPT, Gemini o Claude da sito o app, i calcoli si fanno nei data center dell\'azienda: basta un telefono qualsiasi. Una GPU potente serve a chi vuole far girare un modello sul proprio computer, perché la sua memoria (la VRAM) limita quanto grande può essere il modello.']
    ],
    en: [
      ['GPU versus CPU', 'A CPU is a computer\'s general-purpose processor: it does a few operations at a time, but varied and complex ones. A GPU, born to draw video-game graphics, does thousands at once, all simple. Training and running an AI model means vast numbers of nearly identical multiplications, which suits a GPU well.'],
      ['Do you need one to use ChatGPT?', 'No. With ChatGPT, Gemini or Claude on the web or in an app, the calculations happen in the company\'s data centres, so any phone will do. A powerful GPU matters if you want to run a model on your own computer, because its memory (VRAM) limits how large the model can be.']
    ],
    fr: [
      ['GPU et CPU', 'Le CPU est le processeur généraliste d\'un ordinateur : il exécute peu d\'opérations à la fois, mais variées et complexes. Le GPU, né pour afficher les jeux vidéo, en exécute des milliers en parallèle, toutes simples. Entraîner et faire tourner un modèle d\'IA revient à faire d\'énormes quantités de multiplications quasi identiques, un travail taillé pour le GPU.'],
      ['Faut-il un GPU pour utiliser ChatGPT ?', 'Non. Avec ChatGPT, Gemini ou Claude sur le web ou en application, les calculs se font dans les centres de données de l\'entreprise : n\'importe quel téléphone suffit. Un GPU puissant sert à faire tourner un modèle sur son propre ordinateur, car sa mémoire (VRAM) limite la taille du modèle.']
    ],
    de: [
      ['GPU und CPU', 'Die CPU ist der Allzweckprozessor eines Computers: Sie führt wenige, aber vielfältige und komplexe Operationen gleichzeitig aus. Die GPU, ursprünglich für Videospielgrafik gebaut, führt Tausende einfache Operationen parallel aus. KI-Modelle zu trainieren und zu betreiben bedeutet enorm viele fast gleiche Multiplikationen, genau die Aufgabe für eine GPU.'],
      ['Braucht man eine GPU für ChatGPT?', 'Nein. Bei ChatGPT, Gemini oder Claude im Web oder in der App rechnen die Rechenzentren des Anbieters; jedes Handy genügt. Eine starke GPU braucht, wer ein Modell auf dem eigenen Computer laufen lassen will, denn ihr Speicher (VRAM) begrenzt die Modellgröße.']
    ]
  },
  prompt: {
    it: [
      ['Cos\'è un prompt, in pratica', 'Il prompt è l\'istruzione che dai a un modello di AI: una domanda, una richiesta, un testo da riassumere, a volte con immagini o file allegati. La qualità della risposta dipende molto da come è scritto, perché il modello non può chiederti cosa intendevi: lavora su ciò che legge.'],
      ['Come scriverne uno migliore', 'Funzionano quasi sempre quattro cose: dire chi è il destinatario e a cosa serve il testo, indicare il compito in modo preciso, specificare il formato che vuoi (elenco, tabella, tre righe) e, se possibile, aggiungere un esempio di ciò che ti piace. "Parlami di Roma" dà una risposta generica; "Elencami 5 cose da vedere a Roma in un giorno, per chi la visita con bambini" ne dà una utile.'],
      ['Prompt di sistema e falsi miti', 'Le aziende aggiungono ai messaggi dell\'utente un "prompt di sistema" che l\'utente non vede: regole su tono, limiti e sicurezza. Non esistono invece formule segrete che "sbloccano" l\'AI: chiarezza, contesto e verifica del risultato contano più di qualunque trucco.']
    ],
    en: [
      ['What a prompt is', 'A prompt is the instruction you give an AI model: a question, a request, a text to summarise, sometimes with images or files attached. The answer depends heavily on how it is written, because the model cannot ask what you meant; it works with what it reads.'],
      ['Writing a better one', 'Four things almost always help: say who the text is for, state the task precisely, specify the format you want (list, table, three lines) and, if you can, add an example of what you like. "Tell me about Rome" gives a generic answer; "List five things to see in Rome in one day for a family with young children" gives a useful one.']
    ],
    fr: [
      ['Ce qu\'est un prompt', 'Le prompt est l\'instruction que vous donnez à un modèle d\'IA : une question, une demande, un texte à résumer, parfois avec des images ou des fichiers. La réponse dépend beaucoup de la façon dont il est écrit, car le modèle ne peut pas demander ce que vous vouliez dire.'],
      ['Mieux l\'écrire', 'Quatre choses aident presque toujours : préciser à qui s\'adresse le texte, définir la tâche exactement, indiquer le format voulu (liste, tableau, trois lignes) et, si possible, donner un exemple. « Parle-moi de Rome » donne une réponse générique ; « Liste cinq choses à voir à Rome en un jour avec des enfants » en donne une utile.']
    ],
    de: [
      ['Was ein Prompt ist', 'Ein Prompt ist die Anweisung an ein KI-Modell: eine Frage, ein Auftrag, ein Text zum Zusammenfassen, manchmal mit Bildern oder Dateien. Die Antwort hängt stark von der Formulierung ab, denn das Modell kann nicht nachfragen, was gemeint war.'],
      ['Besser formulieren', 'Vier Dinge helfen fast immer: sagen, für wen der Text ist, die Aufgabe genau benennen, das gewünschte Format angeben (Liste, Tabelle, drei Zeilen) und möglichst ein Beispiel geben. „Erzähl mir von Rom“ liefert Allgemeines; „Nenne fünf Sehenswürdigkeiten in Rom für einen Tag mit Kindern“ liefert Brauchbares.']
    ]
  },
  token: {
    it: [
      ['Il token non è una parola', 'Un modello di linguaggio non legge parole ma token: pezzi di testo che possono essere una parola intera, una parte di parola, un numero o un segno di punteggiatura. Una parola corta e comune di solito è un token solo; una lunga o rara viene spezzata in più pezzi.'],
      ['Perché i token contano', 'Per due motivi pratici. Primo, il prezzo: i servizi che si pagano a consumo, come le <a href="api.html">API</a>, fatturano in base ai token letti e scritti, di solito per milione. Secondo, il limite: la <a href="finestra-di-contesto.html">finestra di contesto</a> di un modello si misura in token, e oltre quella soglia il modello non "ricorda" più la conversazione.'],
      ['Quanti token sono un testo', 'Come regola grossolana, in inglese un token vale circa tre quarti di parola. In italiano e in altre lingue diverse dall\'inglese le parole tendono a spezzarsi di più, quindi lo stesso testo costa un po\' più token. Il numero esatto dipende dal modello e si vede con gli strumenti di conteggio che molti fornitori mettono a disposizione.'],
      ['Da non confondere', 'Il token dell\'AI non c\'entra con i token delle criptovalute né con quelli di accesso a un sito: è solo il nome di un pezzetto di testo.']
    ],
    en: [
      ['A token is not a word', 'A language model does not read words but tokens: pieces of text that can be a whole word, part of a word, a number or a punctuation mark. A short, common word is usually one token; a long or rare one is split into several.'],
      ['Why tokens matter', 'Two practical reasons. Price: pay-as-you-go services such as APIs bill by tokens read and written, usually per million. Limits: a model\'s context window is measured in tokens, and beyond it the model no longer "remembers" the conversation.'],
      ['Not to be confused', 'In English a token is roughly three quarters of a word; other languages tend to be split into more tokens. An AI token has nothing to do with crypto tokens or login tokens: it is just the name for a piece of text.']
    ],
    fr: [
      ['Un token n\'est pas un mot', 'Un modèle de langage ne lit pas des mots mais des tokens : des morceaux de texte qui peuvent être un mot entier, une partie de mot, un nombre ou un signe de ponctuation. Un mot court et courant est en général un seul token ; un mot long ou rare est découpé en plusieurs.'],
      ['Pourquoi ils comptent', 'Deux raisons pratiques. Le prix : les services facturés à l\'usage, comme les API, comptent les tokens lus et écrits, en général par million. La limite : la fenêtre de contexte d\'un modèle se mesure en tokens ; au-delà, il « oublie » la conversation. Sans rapport avec les jetons des cryptomonnaies.']
    ],
    de: [
      ['Ein Token ist kein Wort', 'Ein Sprachmodell liest keine Wörter, sondern Tokens: Textstücke, die ein ganzes Wort, ein Wortteil, eine Zahl oder ein Satzzeichen sein können. Ein kurzes, häufiges Wort ist meist ein Token; ein langes oder seltenes wird in mehrere zerlegt.'],
      ['Warum Tokens zählen', 'Aus zwei praktischen Gründen. Preis: nutzungsabhängige Dienste wie APIs rechnen nach gelesenen und geschriebenen Tokens ab, meist pro Million. Grenze: Das Kontextfenster eines Modells wird in Tokens gemessen; darüber hinaus „vergisst“ das Modell das Gespräch. Mit Krypto-Token hat das nichts zu tun.']
    ]
  }
};
