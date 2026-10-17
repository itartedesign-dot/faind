/* =====================================================================
   FAIND — Approfondimenti in francese (approfondimenti/fr/)
   ---------------------------------------------------------------------
   Traduzione degli articoli di scripts/articles.mjs. Ogni voce ha lo
   stesso "slug" dell'articolo italiano: se un articolo qui manca, la
   pagina francese non viene creata.
   I link interni partono da approfondimenti/fr/, quindi iniziano con
   "../../" (es. ../../glossario/fr/#prompt). I link ad altri
   approfondimenti sono solo "nome-articolo.html".
   ===================================================================== */

export default {
  'intelligenza-artificiale-sostituira-uomo-lavori-a-rischio': {
    title: `L'intelligence artificielle remplacera-t-elle l'humain ? Les métiers menacés et ceux qui ne le sont pas`,
    card: `Quels métiers disparaîtront, lesquels changeront et lesquels resteront : ce que disent les données.`,
    desc: `L'intelligence artificielle remplacera-t-elle l'humain au travail ? Les métiers menacés, ceux qui ne le sont pas, ce qui attend les programmeurs, les médecins et les enseignants, et comment se préparer.`,
    lede: `C'est la question que se posent de plus en plus de personnes : l'intelligence artificielle remplacera-t-elle l'humain au travail ? La réponse courte est qu'elle remplace des tâches, pas des personnes. Mais certains métiers changeront bien plus que d'autres.`,
    brief: [
      `L'IA automatise des tâches isolées plutôt que des métiers entiers.`,
      `Les plus exposés sont les emplois de bureau répétitifs, fondés sur des textes et des données.`,
      `Les moins exposés exigent présence physique, habileté manuelle, relation humaine et responsabilité.`
    ],
    sections: [
      [`Quels sont les métiers menacés par l'intelligence artificielle`, `Les plus exposés sont les métiers composés en grande partie de tâches répétitives sur des textes et des données : saisie de données, assistance client de premier niveau, traductions standard, comptabilité de base, une partie du travail de secrétariat et de rédaction de documents. Le Fonds monétaire international a estimé en 2024 qu'environ 40 % des emplois dans le monde sont exposés à l'intelligence artificielle, et environ 60 % dans les économies avancées. Exposé ne veut pas dire supprimé : pour près de la moitié de ces emplois, l'IA peut être une aide qui augmente la productivité.`],
      [`Les métiers qui ne sont pas menacés`, `Résistent mieux les métiers qui exigent présence physique et habileté manuelle fine (plombiers, électriciens, infirmiers, artisans), relation directe avec les personnes (éducateurs, aide à la personne, vente complexe) et responsabilité d'une décision. Ce sont aussi les métiers où une erreur coûte cher et où quelqu'un doit en répondre.`],
      [`Programmeurs, médecins, enseignants : seront-ils remplacés ?`, `Ce sont trois professions souvent recherchées sur Google avec le mot « remplacer ». Les <strong>programmeurs</strong> utilisent déjà l'IA pour écrire du code plus vite : le travail passe de la saisie à la conception et au contrôle. Pour les <strong>médecins</strong>, l'IA est une seconde paire d'yeux sur les images et une aide pour les tâches administratives, mais le diagnostic et la responsabilité restent au médecin. Pour les <strong>enseignants</strong>, c'est la manière de préparer cours et évaluations qui change, pas la relation avec la classe.`],
      [`Combien d'emplois disparaîtront et combien seront créés`, `Les estimations varient beaucoup d'une étude à l'autre, et il vaut mieux se méfier des chiffres trop tranchés. Le Forum économique mondial, dans son rapport 2025 sur l'avenir de l'emploi, prévoit d'ici 2030 environ 92 millions d'emplois perdus et 170 millions de nouveaux emplois créés dans le monde, sous l'effet de plusieurs facteurs dont l'IA. La question n'est pas seulement combien, mais qui : les nouveaux emplois ne naissent pas forcément là où, ni pour ceux qui, ont perdu l'ancien.`],
      [`Comment se préparer`, `Inutile de devenir programmeur. Il faut apprendre à bien utiliser les outils dans son propre métier : formuler la bonne demande, contrôler le résultat, savoir où l'IA se trompe. Ceux qui savent le faire travaillent déjà plus vite que ceux qui l'ignorent. FAIND publie chaque jour le <a href="../../#job">classement des métiers de l'IA les plus demandés</a> et suit le sujet sur la page <a href="../../temi/fr/ia-travail.html">IA et travail</a>.`]
    ],
    faq: [
      [`L'intelligence artificielle remplacera-t-elle l'humain ?`, `Elle remplace des tâches isolées plutôt que des personnes. Certains emplois de bureau répétitifs se réduiront, d'autres naîtront, et la plupart changeront de façon de travailler.`],
      [`Quels métiers ne sont pas menacés par l'intelligence artificielle ?`, `Ceux qui exigent présence physique, habileté manuelle, relation avec les personnes et responsabilité directe : santé, aide à la personne, artisanat, métiers techniques de terrain.`]
    ],
    sources: [
      `Fonds monétaire international, « Gen-AI: Artificial Intelligence and the Future of Work » (2024)`,
      `Forum économique mondial, « Future of Jobs Report 2025 »`
    ]
  },

  'intelligenza-artificiale-e-pericolosa': {
    title: `L'intelligence artificielle est-elle dangereuse ? Peut-elle vraiment se rebeller ?`,
    card: `Rébellion, extinction, perte de contrôle : ce qui est vrai et ce qui ne l'est pas.`,
    desc: `L'intelligence artificielle est-elle dangereuse ? Peut-elle se rebeller, détruire l'humanité ou mener à l'extinction ? Ce que disent les experts, quels dangers sont réels aujourd'hui et lesquels sont hypothétiques.`,
    lede: `Parmi les recherches les plus fréquentes sur Google figurent « l'intelligence artificielle peut-elle se rebeller » et « peut-elle détruire l'humanité ». Ce ne sont pas des questions naïves : les mêmes inquiétudes ont été exprimées par certains des scientifiques qui ont construit cette technologie.`,
    brief: [
      `Aujourd'hui, aucune IA n'a de volonté propre ni ne peut « se rebeller » comme dans les films.`,
      `Certains experts de premier plan jugent sérieux le risque de perdre le contrôle à l'avenir ; d'autres le trouvent exagéré.`,
      `Les dangers déjà réels sont ailleurs : arnaques, désinformation, erreurs, usage militaire.`
    ],
    sections: [
      [`L'intelligence artificielle peut-elle se rebeller ?`, `Les systèmes actuels n'ont ni désirs, ni conscience, ni volonté : ils produisent des réponses en calculant des probabilités. Ils ne peuvent pas « décider » de se rebeller. La crainte des experts est différente et plus concrète : des systèmes toujours plus capables, auxquels nous confions des tâches importantes, pourraient poursuivre l'objectif reçu d'une manière que nous n'avions pas prévue et que nous ne parvenons pas à corriger à temps.`],
      [`Pourquoi parle-t-on d'extinction`, `En 2023, des centaines de chercheurs et de dirigeants du secteur, dont Geoffrey Hinton, Yoshua Bengio et les patrons d'OpenAI et de Google DeepMind, ont signé une déclaration d'une seule phrase : réduire le risque d'extinction lié à l'IA devrait être une priorité mondiale, au même titre que les pandémies et la guerre nucléaire. Hinton, prix Nobel de physique 2024, a quitté Google précisément pour pouvoir parler librement de ces risques.`],
      [`Ceux qui ne sont pas d'accord`, `D'autres scientifiques tout aussi reconnus, comme Yann LeCun, jugent ces scénarios lointains et en partie relevant de la science-fiction, et craignent qu'ils ne détournent l'attention des problèmes d'aujourd'hui. Le désaccord est réel : personne ne sait dire avec certitude jusqu'où ni quand les machines deviendront capables.`],
      [`Les dangers réels, dès aujourd'hui`, `Inutile d'attendre l'avenir. L'IA sert déjà à des arnaques avec des voix et des visages clonés, à produire de la désinformation à grande échelle, à rendre les cyberattaques plus efficaces. Elle peut se tromper dans des domaines sensibles comme la santé et la justice, et reproduire des discriminations présentes dans les données. Il y a enfin l'usage militaire, avec des armes de plus en plus autonomes.`],
      [`Ce qui est fait`, `L'Union européenne a adopté l'<a href="../../glossario/fr/#ai-act">AI Act</a>, qui interdit certains usages et impose des contrôles sur ceux à haut risque ; plusieurs pays ont créé des instituts publics pour la sécurité de l'IA. Pour savoir comment se protéger des risques du quotidien, voir <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">comment reconnaître les sons, photos et vidéos créés avec l'IA</a>.`]
    ],
    faq: [
      [`L'intelligence artificielle est-elle un danger pour l'humanité ?`, `Les experts sont divisés. Certains jugent sérieux le risque de perdre à l'avenir le contrôle de systèmes très avancés, d'autres le considèrent comme lointain. Les risques déjà concrets concernent les arnaques, la désinformation, les erreurs et l'usage militaire.`],
      [`L'intelligence artificielle peut-elle penser ?`, `Elle traite des informations et produit des raisonnements qui ressemblent à de la pensée, mais elle n'a ni conscience ni intentions. Savoir si l'on peut appeler cela « penser » reste une question ouverte parmi les chercheurs.`]
    ],
    sources: [`Center for AI Safety, « Statement on AI Risk » (2023)`]
  },

  'imparare-a-usare-intelligenza-artificiale': {
    title: `Comment utiliser l'intelligence artificielle : guide pour débuter`,
    card: `Un guide pour qui part de zéro : laquelle utiliser, quoi lui demander, quoi éviter.`,
    desc: `Comment apprendre à utiliser l'intelligence artificielle en partant de zéro : comment elle fonctionne, quelle IA choisir, comment rédiger une demande, comment l'utiliser pour étudier et travailler, et les erreurs à éviter.`,
    lede: `Apprendre à utiliser l'intelligence artificielle ne demande pas d'études techniques. Il faut une heure pour essayer et quelques règles pour ne pas se laisser tromper. Voici le guide que nous aurions aimé lire au début.`,
    brief: [
      `On commence gratuitement : tous les principaux assistants ont une offre gratuite.`,
      `La qualité de la réponse dépend de la clarté de la demande.`,
      `Ne jamais faire confiance sans vérifier, ne jamais saisir de données confidentielles.`
    ],
    sections: [
      [`Comment fonctionne l'IA, en deux lignes`, `Les assistants comme ChatGPT, Claude et Gemini sont des <a href="../../glossario/fr/#llm">modèles de langage</a> : ils ont lu d'énormes quantités de texte et prédisent, mot après mot, la réponse la plus plausible. C'est pourquoi ils écrivent bien et, parfois, affirment avec assurance des choses fausses.`],
      [`Lequel utiliser pour commencer`, `N'importe lequel des principaux, dans sa version gratuite : inutile de chercher le modèle parfait. Si vous utilisez déjà Gmail et Docs, Gemini est le plus pratique ; pour un usage général, ChatGPT convient très bien ; pour écrire et raisonner sur de longs textes, beaucoup préfèrent Claude. Les différences et les prix figurent sur la page <a href="../../confronto/fr/">Les IA comparées</a>.`],
      [`Comment rédiger une bonne demande`, `La demande s'appelle un <a href="../../glossario/fr/#prompt">prompt</a>. Elle fonctionne mieux si elle contient quatre éléments : <strong>qui vous êtes</strong> ou à qui s'adresse le résultat, <strong>ce que vous voulez</strong>, précisément, <strong>le matériau</strong> sur lequel travailler, <strong>le format</strong> de la réponse. « Écris un e-mail » donne un résultat générique ; « écris un e-mail de trois lignes à un client pour déplacer le rendez-vous de jeudi, sur un ton cordial » donne un résultat utile. Si la réponse ne convainc pas, on corrige : c'est une conversation, pas une recherche.`],
      [`Comment utiliser l'IA pour étudier et à l'école`, `Elle fonctionne bien pour se faire expliquer un sujet avec des mots plus simples, se faire interroger, résumer ses propres notes, trouver des exemples. Elle fonctionne mal, et n'apprend rien, si on lui demande de faire les devoirs à notre place. La règle pratique : l'utiliser comme un tuteur, pas comme un remplaçant.`],
      [`Comment utiliser l'intelligence artificielle sur son téléphone`, `C'est la façon la plus simple de commencer. On télécharge l'application gratuite de ChatGPT, Gemini ou Claude et on écrit ou on parle, comme dans une messagerie. Sur beaucoup de téléphones Android, Gemini est déjà installé comme assistant ; sur les iPhone récents, Siri peut transmettre les questions à ChatGPT. Avec l'appareil photo, on peut aussi lui montrer quelque chose, un document ou une étiquette, et demander des explications.`],
      [`Les erreurs à éviter`, `Trois surtout. Faire confiance sans vérifier : dates, chiffres et citations doivent toujours être contrôlés. Saisir des données confidentielles : documents de travail, données de clients, informations de santé. Croire qu'une réponse bien écrite est forcément exacte. Pour les termes que vous rencontrez, il y a le <a href="../../glossario/fr/">glossaire</a>.`]
    ],
    faq: [
      [`Comment apprend-on à utiliser l'intelligence artificielle ?`, `En essayant un assistant gratuit sur des tâches réelles : un e-mail, un résumé, une explication. On progresse en apprenant à rédiger des demandes précises et à vérifier les réponses.`],
      [`Faut-il payer pour utiliser l'intelligence artificielle ?`, `Non. Tous les principaux services ont une offre gratuite suffisante pour apprendre. Les offres payantes servent à ceux qui l'utilisent beaucoup.`],
      [`Comment utilise-t-on l'intelligence artificielle ?`, `On ouvre un assistant comme ChatGPT, Gemini ou Claude, sur le site ou dans l'application, et on écrit une demande précise : ce que l'on veut, pour qui, sur quel matériau et sous quelle forme. Puis on améliore la réponse en poursuivant la conversation.`]
    ],
    sources: []
  },

  'guadagnare-con-intelligenza-artificiale': {
    title: `Gagner de l'argent avec l'intelligence artificielle : ce qui marche vraiment`,
    card: `Pas de formule magique : où l'IA fait gagner du temps et où les promesses sont creuses.`,
    desc: `Peut-on gagner de l'argent avec l'intelligence artificielle ? Ce qui marche vraiment, ce qui ne marche pas, comment utiliser l'IA pour mieux travailler et comment reconnaître les formations et les promesses de gains faciles.`,
    lede: `« Gagner de l'argent avec l'intelligence artificielle » est l'une des recherches les plus fréquentes, et aussi celle qui attire le plus de promesses faciles. La vérité est moins spectaculaire : l'IA ne crée pas d'argent à partir de rien, mais elle fait gagner du temps à ceux qui ont déjà un métier ou une idée.`,
    brief: [
      `L'IA démultiplie une compétence que vous avez, elle ne la remplace pas.`,
      `Les gains réels viennent du temps économisé et de services mieux réalisés.`,
      `Qui promet des revenus automatiques vend en général une formation.`
    ],
    sections: [
      [`Ce qui marche vraiment`, `Ce qui marche, c'est utiliser l'IA pour faire plus vite, ou mieux, un travail pour lequel quelqu'un paie déjà : un graphiste qui prépare davantage d'ébauches, un traducteur qui révise au lieu de traduire à partir de zéro, un artisan qui se fait rédiger devis et réponses aux clients, une boutique en ligne qui améliore ses descriptions et son assistance. Le gain, c'est le temps libéré et le nombre de clients que vous parvenez à suivre.`],
      [`De nouveaux services que vous ne pouviez pas proposer avant`, `Qui possède une compétence peut l'élargir : celui qui écrit peut aussi proposer des textes pour le web et des newsletters, celui qui fait de la vidéo peut ajouter des sous-titres et des versions dans d'autres langues, celui qui fait du conseil peut aider les petites entreprises à adopter ces outils. Ici, la demande est réelle, car beaucoup d'entreprises ne savent pas par où commencer.`],
      [`Ce qui ne marche pas`, `Remplir le web de contenus générés automatiquement : les moteurs de recherche les reconnaissent et les pénalisent. Vendre des produits numériques fabriqués en cinq minutes sur des marchés déjà saturés. S'en remettre à l'IA pour investir ou faire du trading : elle ne prédit pas les marchés, et celui qui le promet vend quelque chose.`],
      [`Comment reconnaître les promesses creuses`, `Méfiez-vous de ceux qui affichent des gains sans expliquer le travail qu'il y a derrière, de ceux qui parlent de « revenu passif » et de « méthode secrète », de ceux qui vendent une formation comme seule voie possible. La question à se poser est simple : la personne qui me dit cela gagne-t-elle de l'argent en utilisant l'IA, ou en vendant des formations sur la façon d'en gagner avec l'IA ?`],
      [`Par où commencer`, `Par votre métier. Dressez la liste des activités qui vous prennent le plus de temps et essayez d'en réaliser une avec l'IA cette semaine. Si vous ne savez pas quel outil choisir, il y a le <a href="../../confronto/fr/">comparatif des IA</a> ; si vous partez de zéro, <a href="imparare-a-usare-intelligenza-artificiale.html">le guide pour débuter</a>. Les postes les plus recherchés par les entreprises se trouvent dans la rubrique <a href="../../#job">Emploi IA</a>.`]
    ],
    faq: [
      [`Peut-on gagner de l'argent avec l'intelligence artificielle ?`, `Oui, surtout en l'utilisant pour travailler plus vite dans un métier que l'on connaît déjà, ou pour proposer de nouveaux services. Il n'existe pas de gains automatiques sans compétences.`],
      [`Comment utiliser l'IA pour gagner de l'argent sans expérience ?`, `Sans compétence à proposer, c'est difficile. Le premier pas réaliste consiste à apprendre à bien l'utiliser dans un domaine précis, puis à proposer ce service.`]
    ],
    sources: []
  },

  'intelligenza-artificiale-rischi-e-vantaggi': {
    title: `Intelligence artificielle : risques et avantages`,
    card: `Les bénéfices concrets et les risques réels, mis sur la même balance.`,
    desc: `Intelligence artificielle : risques et avantages comparés. Les bénéfices en médecine, au travail et dans la vie quotidienne, les risques pour la vie privée, l'emploi et l'information, et les occasions à saisir.`,
    lede: `Les risques et les avantages de l'intelligence artificielle sont presque toujours recherchés ensemble, et à juste titre : ce sont les deux faces d'une même technologie. Voici un bilan sans enthousiasme excessif et sans alarmisme.`,
    brief: [
      `Les avantages les plus solides concernent la recherche scientifique, la médecine et la productivité.`,
      `Les risques les plus concrets concernent les erreurs, la vie privée, la désinformation et l'emploi.`,
      `Presque chaque avantage a son risque correspondant : tout dépend de l'usage.`
    ],
    sections: [
      [`Les avantages de l'intelligence artificielle`, `Dans la <strong>recherche</strong>, elle accélère des découvertes qui demandaient des années : la prédiction de la forme des protéines, récompensée par le prix Nobel de chimie 2024, en est l'exemple le plus connu. En <strong>médecine</strong>, elle aide à lire examens et images et à détecter plus tôt certaines maladies. Au <strong>travail</strong>, elle réduit le temps consacré aux tâches répétitives. Dans la <strong>vie quotidienne</strong>, elle traduit, résume, explique et rend des contenus accessibles aux personnes ayant un handicap visuel ou auditif.`],
      [`Les risques de l'intelligence artificielle`, `Elle peut <strong>se tromper</strong> sur un ton assuré, et en santé ou en justice une erreur pèse lourd. Elle peut reproduire des <strong>discriminations</strong> présentes dans les données sur lesquelles elle a été entraînée. Elle met la <strong>vie privée</strong> sous pression, car elle fonctionne avec de grandes quantités de données personnelles. Elle facilite la production de <strong>désinformation</strong> et de faux réalistes. Et elle transforme le <strong>travail</strong> plus vite que beaucoup de personnes ne peuvent s'adapter.`],
      [`Risques et opportunités pour la santé mentale`, `C'est l'une des recherches en hausse. Les chatbots sont toujours disponibles et ne jugent pas, et certaines personnes s'en servent comme premier exutoire. Mais ce ne sont pas des thérapeutes : ils ne connaissent pas la personne, peuvent donner des réponses inadaptées dans les moments de crise et favoriser l'isolement. Pour un mal-être sérieux, il faut un professionnel.`],
      [`L'avis des experts`, `Même ceux qui l'ont construite sont divisés. Geoffrey Hinton, prix Nobel de physique 2024 pour des travaux à la base de l'IA, a quitté Google en 2023 pour parler librement des risques, y compris celui de perdre le contrôle de systèmes plus intelligents que nous. Yann LeCun, longtemps à la tête de la recherche en IA de Meta, juge au contraire exagérées les craintes de catastrophe et voit le plus grand danger dans la concentration du pouvoir entre quelques entreprises. Entre les deux, la position de nombreux chercheurs : avantages et risques sont bien réels, et le bilan dépend des règles.`],
      [`Le bilan`, `Le même outil qui aide un médecin peut se tromper de diagnostic ; celui qui traduit un texte peut rédiger une arnaque. Le résultat dépend de trois choses : les règles, la qualité des contrôles et la lucidité de celui qui l'utilise. Pour aller plus loin : <a href="intelligenza-artificiale-e-pericolosa.html">l'IA est-elle dangereuse ?</a>, <a href="intelligenza-artificiale-e-affidabile.html">l'IA est-elle fiable ?</a>, <a href="../../temi/fr/ia-medecine-sante.html">l'IA en médecine</a>.`]
    ],
    faq: [
      [`Quels sont les avantages de l'intelligence artificielle ?`, `Elle accélère la recherche scientifique, aide les médecins et les professionnels, automatise les tâches répétitives et rend l'information et les services plus accessibles.`],
      [`Quels sont les risques de l'intelligence artificielle ?`, `Des erreurs présentées comme des certitudes, des discriminations, des atteintes à la vie privée, la désinformation, les arnaques et des transformations rapides du travail.`],
      [`Que pensent les experts de l'intelligence artificielle ?`, `Ils sont divisés. Certains, comme Geoffrey Hinton, craignent que des systèmes très avancés échappent au contrôle ; d'autres, comme Yann LeCun, jugent ces craintes exagérées. Presque tous s'accordent sur la nécessité de règles et de contrôles.`]
    ],
    sources: []
  },

  'perche-intelligenza-artificiale-consuma-acqua-energia': {
    title: `Pourquoi l'intelligence artificielle consomme-t-elle de l'eau et de l'énergie ?`,
    card: `Centres de données, électricité et refroidissement : ce que l'IA pollue vraiment.`,
    desc: `Pourquoi l'intelligence artificielle consomme-t-elle de l'eau et de l'électricité ? Comment fonctionnent les centres de données, combien ils consomment, pourquoi l'IA pollue et comment elle peut aider à économiser l'énergie.`,
    lede: `« Pourquoi l'IA consomme de l'eau » et « pourquoi l'IA pollue » comptent parmi les questions les plus recherchées. La réponse se trouve dans des bâtiments que presque personne ne voit : les centres de données.`,
    brief: [
      `L'IA tourne dans des centres de données qui consomment beaucoup d'électricité.`,
      `L'eau sert à refroidir les ordinateurs, directement ou par l'intermédiaire des centrales électriques.`,
      `L'impact dépend de l'énergie qui alimente les installations.`
    ],
    sections: [
      [`Pourquoi l'intelligence artificielle consomme de l'électricité`, `Chaque réponse d'un chatbot est le résultat de milliards de calculs effectués par des processeurs très puissants, les <a href="../../glossario/fr/#gpu">GPU</a>, hébergés dans des <a href="../../glossario/fr/#data-center">centres de données</a>. L'énergie est nécessaire à deux moments : l'<a href="../../glossario/fr/#addestramento">entraînement</a> des modèles, qui dure des semaines, et l'usage quotidien, qui consomme moins par demande mais se répète des milliards de fois.`],
      [`Combien elle consomme`, `Selon l'Agence internationale de l'énergie, les centres de données ont consommé en 2024 environ 1,5 % de l'électricité mondiale, et leur consommation pourrait à peu près doubler d'ici 2030, tirée surtout par l'IA. Le poids d'une seule demande dépend du modèle et de la façon de mesurer : les chiffres qui circulent doivent toujours être lus avec leur source.`],
      [`Pourquoi l'IA consomme de l'eau`, `Les ordinateurs produisent de la chaleur et doivent être refroidis. Beaucoup d'installations utilisent des systèmes à eau, dont une partie s'évapore. D'autre eau est consommée indirectement, par les centrales qui produisent l'électricité. La quantité varie beaucoup selon le climat du lieu et la technologie : c'est pourquoi les nouveaux centres de données sont souvent contestés là où l'eau manque.`],
      [`Combien d'eau consomme une question à ChatGPT ou Gemini`, `Peu, mais pas rien. Selon Google (août 2025), une demande de texte typique à Gemini consomme environ 0,26 millilitre d'eau, cinq gouttes, et 0,24 wattheure d'électricité. Selon Sam Altman (juin 2025), une question moyenne à ChatGPT utilise environ 0,3 millilitre et 0,34 wattheure, mais OpenAI n'a pas expliqué sa méthode de calcul. Une étude de l'Université de Californie à Riverside (2023) estimait plutôt un demi-litre toutes les 10 à 50 réponses de l'ancien GPT-3, en comptant aussi l'eau des centrales électriques. Les chiffres diffèrent parce que le modèle, le centre de données et ce que l'on compte changent. L'IA gaspille-t-elle de l'eau ? Une question isolée, non ; le problème est la somme de milliards de questions, concentrée en quelques lieux.`],
      [`L'IA pollue-t-elle ?`, `Cela dépend de l'énergie qui l'alimente. Un centre de données relié à des sources renouvelables a un impact très différent de celui d'un centre alimenté au gaz ou au charbon. Les grandes entreprises signent des contrats pour le solaire, l'éolien et le nucléaire, mais elles ont aussi reconnu que l'IA rend plus difficile le respect de leurs propres objectifs d'émissions.`],
      [`Où finit l'eau utilisée par l'IA`, `Elle n'est pas toute perdue. Une partie de l'eau prélevée par les centres de données retourne, plus chaude, aux rivières et aux réseaux ; la partie qui s'évapore dans les tours de refroidissement est réellement consommée, et elle pèse davantage là où l'eau manque. C'est pourquoi les rapports des entreprises distinguent l'eau <strong>prélevée</strong> de l'eau <strong>consommée</strong> : quand vous lisez un chiffre, vérifiez duquel il s'agit. Certaines installations récentes utilisent des circuits fermés ou un refroidissement par air, qui consomment beaucoup moins d'eau mais plus d'électricité.`],
      [`Le rôle de l'IA dans les économies d'énergie`, `La même technologie sert à prévoir la production solaire et éolienne, à équilibrer les réseaux électriques et à réduire le gaspillage dans les bâtiments et les usines. Savoir si le bilan final sera positif n'est pas encore tranché. FAIND suit le sujet chaque jour sur la page <a href="../../temi/fr/ia-climat-environnement.html">IA, climat et environnement</a>.`]
    ],
    faq: [
      [`Pourquoi l'intelligence artificielle consomme-t-elle de l'eau ?`, `Parce que les ordinateurs des centres de données produisent de la chaleur et que beaucoup d'installations les refroidissent à l'eau. D'autre eau est utilisée par les centrales qui produisent l'électricité.`],
      [`Combien d'eau consomme une question à l'IA ?`, `Selon les données des entreprises, entre 0,26 et 0,3 millilitre pour une demande de texte, soit quelques gouttes. D'anciennes estimations indépendantes allaient jusqu'à un demi-litre toutes les 10 à 50 réponses, en comptant l'eau des centrales.`],
      [`Utiliser ChatGPT pollue-t-il ?`, `Chaque demande consomme peu d'énergie, mais multipliée par des milliards d'utilisations elle devient significative. L'impact dépend de l'efficacité du centre de données et de la source d'énergie.`],
      [`L'IA gaspille-t-elle de l'eau ?`, `Une question seule, non : elle consomme quelques gouttes. Le problème est la somme de milliards de demandes, concentrée dans quelques centres de données, parfois dans des régions où l'eau manque.`],
      [`Pourquoi l'IA consomme-t-elle autant d'eau ?`, `Parce que les centres de données tournent jour et nuit et que la chaleur doit être évacuée en continu : beaucoup d'installations utilisent des tours de refroidissement où l'eau s'évapore. Plus l'usage de l'IA augmente, plus les calculs, la chaleur et l'eau augmentent.`]
    ],
    sources: [`Agence internationale de l'énergie (AIE), « Energy and AI » (2025)`, `Google, étude sur l'impact environnemental de Gemini (août 2025)`, `Sam Altman, « The Gentle Singularity » (juin 2025)`, `Li et al., « Making AI Less Thirsty », Université de Californie à Riverside (2023)`]
  },

  'intelligenza-artificiale-e-affidabile': {
    title: `L'intelligence artificielle est-elle fiable ? Quand elle peut se tromper`,
    card: `Pourquoi l'IA se trompe sur un ton assuré et comment savoir quand lui faire confiance.`,
    desc: `L'intelligence artificielle est-elle fiable et sûre ? Pourquoi elle peut se tromper, ce que sont les hallucinations, quand lui faire confiance et comment vérifier les réponses de ChatGPT, Claude et Gemini.`,
    lede: `« L'intelligence artificielle est-elle fiable ? » et « peut-elle se tromper ? » sont deux des questions les plus recherchées. La réponse honnête : elle est fiable pour certaines choses, pas pour d'autres, et elle ne prévient pas quand elle se trompe.`,
    brief: [
      `L'IA peut inventer des faits, des dates et des citations : on appelle cela des hallucinations.`,
      `Elle est plus fiable sur les textes que vous lui fournissez que sur les faits dont elle doit se souvenir.`,
      `La vérification revient toujours à celui qui l'utilise.`
    ],
    sections: [
      [`Pourquoi l'intelligence artificielle peut se tromper`, `Un modèle de langage ne consulte pas une archive de faits : il génère la réponse la plus plausible. Quand il ne sait pas, il ne dit pas « je ne sais pas » : il construit une réponse vraisemblable. C'est ce que l'on appelle une <a href="../../glossario/fr/#allucinazione">hallucination</a>. Le cas le plus cité est celui d'avocats sanctionnés aux États-Unis pour avoir déposé des actes citant des précédents inexistants, inventés par un chatbot.`],
      [`Quand elle est fiable`, `Elle fonctionne bien lorsqu'elle travaille sur un matériau que vous lui donnez : résumer un document, réécrire un texte, traduire, mettre de l'ordre dans des notes, expliquer un concept connu. Elle fonctionne mieux aussi lorsqu'elle cherche sur le web et cite ses sources, car vous pouvez les contrôler.`],
      [`Quand elle ne l'est pas`, `Elle est moins fiable sur les chiffres, les dates, les citations, les noms, les textes de loi, l'actualité récente et les calculs complexes. Et dans tout ce qui touche à la santé, à l'argent et aux questions juridiques, où une erreur a des conséquences : là, elle peut aider à comprendre, mais pas à décider.`],
      [`L'intelligence artificielle est-elle sûre ?`, `La sécurité, ce sont aussi les données. Ce que vous écrivez à un chatbot est traité sur les serveurs de l'entreprise et, selon les réglages, peut servir à améliorer les modèles. Mieux vaut ne pas saisir les données personnelles d'autrui, des documents confidentiels ou des identifiants, et vérifier les réglages de confidentialité.`],
      [`À quelle fréquence elle se trompe : les chiffres`, `Deux études aident à le mesurer. En octobre 2025, 22 médias de service public de 18 pays, coordonnés par l'UER et la BBC, ont vérifié plus de 3 000 réponses de ChatGPT, Copilot, Gemini et Perplexity sur l'actualité : 45 % contenaient au moins une erreur importante, souvent dans les sources citées. En avril 2025, OpenAI a indiqué que ses modèles o3 et o4-mini inventaient des informations dans 33 % et 48 % des réponses à un test de questions sur des personnes réelles. Les tests diffèrent et les modèles changent vite, mais le message est le même : sur les faits et l'actualité, l'erreur n'est pas rare.`],
      [`Comment vérifier une réponse`, `Demandez les sources et ouvrez-les. Contrôlez chiffres et citations sur un site officiel. Reposez la question autrement, ou à une autre IA : si les réponses changent, il y a lieu de douter. Et souvenez-vous qu'une réponse bien écrite n'est pas forcément une réponse juste.`]
    ],
    faq: [
      [`L'intelligence artificielle peut-elle se tromper ?`, `Oui. Elle peut inventer de fausses informations en les présentant avec assurance, surtout sur les faits, les chiffres et les citations. C'est pourquoi les réponses doivent être vérifiées.`],
      [`Peut-on faire confiance à ChatGPT ?`, `Pour résumer, réécrire et expliquer, oui, avec un contrôle final. Pour les décisions concernant la santé, l'argent et les questions juridiques, il faut toujours un professionnel.`],
      [`Quelle est la fiabilité de l'intelligence artificielle ?`, `Grande lorsqu'elle travaille sur des textes que vous lui fournissez, bien moindre sur les faits et l'actualité : dans une étude européenne de 2025, 45 % des réponses sur l'actualité contenaient au moins une erreur importante. Il faut l'utiliser avec une vérification finale.`],
      [`L'intelligence artificielle dit-elle toujours la vérité ?`, `Non. Elle ne ment pas exprès, mais elle produit la réponse la plus plausible, et quand elle ne sait pas, elle peut inventer avec assurance. D'où l'intérêt de demander les sources et de les ouvrir.`]
    ],
    sources: [`UER et BBC, « News Integrity in AI Assistants » (octobre 2025)`, `OpenAI, fiche technique de o3 et o4-mini (avril 2025)`]
  },

  'intelligenza-artificiale-gratis-o-a-pagamento': {
    title: `L'intelligence artificielle est-elle gratuite ou payante ?`,
    card: `Ce que l'on peut faire sans payer et quand un abonnement vaut la peine.`,
    desc: `L'intelligence artificielle est-elle gratuite ou payante ? Ce que proposent les offres gratuites de ChatGPT, Claude et Gemini, combien coûtent les abonnements et quand il vaut la peine de payer.`,
    lede: `Les deux. Chaque grand assistant a une offre gratuite et une ou plusieurs offres payantes. La question utile n'est pas de savoir si c'est gratuit, mais ce que vous perdez en restant sur l'offre gratuite.`,
    brief: [
      `ChatGPT, Claude, Gemini, Copilot et Perplexity ont tous une offre gratuite.`,
      `L'offre standard coûte environ 20 dollars par mois presque partout.`,
      `Payer ne vaut la peine que si vous atteignez souvent les limites de l'offre gratuite.`
    ],
    sections: [
      [`Ce que l'on peut faire gratuitement`, `Beaucoup : écrire et corriger des textes, résumer, traduire, se faire expliquer un sujet, générer quelques images. Les limites portent sur le nombre de demandes, l'accès aux modèles les plus puissants et certaines fonctions avancées. Pour apprendre et pour un usage occasionnel, l'offre gratuite suffit.`],
      [`Combien coûtent les abonnements`, `L'offre standard coûte environ 20 dollars par mois : ChatGPT Plus, Claude Pro et Perplexity Pro à 20, Google AI Pro et Microsoft 365 Premium à 19,99. Il existe des entrées de gamme moins chères, comme Google AI Plus à 4,99 et ChatGPT Go à 8, et des offres professionnelles de 100 à 300 dollars. Tous les prix à jour, du plus cher au moins cher, figurent sur la page <a href="../../confronto/fr/">Les IA comparées</a>.`],
      [`Quand il vaut la peine de payer`, `Quand vous utilisez l'IA chaque jour pour le travail et que l'offre gratuite vous arrête, quand vous avez besoin de longs documents ou de nombreuses images, quand vous voulez les modèles les plus récents. Si vous l'utilisez quelques fois par semaine, payer ne change presque rien.`],
      [`Les alternatives gratuites`, `Il existe des assistants entièrement gratuits et des <a href="../../glossario/fr/#open-source">modèles ouverts</a> que l'on peut télécharger et utiliser sur son propre ordinateur, sans abonnement et sans envoyer de données à qui que ce soit. Ils demandent un peu plus de pratique et un ordinateur récent ; les liens officiels se trouvent dans la rubrique <a href="../../#guide">Guides et téléchargements</a>.`],
      [`Attention au prix caché`, `Gratuit ne veut pas dire sans coût : certaines offres gratuites affichent de la publicité ou utilisent les conversations pour améliorer les modèles, sauf réglage contraire. Il vaut la peine de lire ce que vous acceptez.`]
    ],
    faq: [
      [`L'intelligence artificielle est-elle gratuite ?`, `Oui dans sa version de base : tous les principaux assistants ont une offre gratuite avec des limites d'utilisation. Les fonctions avancées sont payantes.`],
      [`Combien coûte ChatGPT ?`, `Il existe une offre gratuite, ChatGPT Go à 8 dollars par mois, Plus à 20 et des offres Pro de 100 à 200 dollars. Les prix peuvent changer : ils sont vérifiés sur la page de comparaison.`]
    ],
    sources: []
  },

  'leggi-intelligenza-artificiale-nel-mondo': {
    title: `Les lois sur l'intelligence artificielle dans le monde`,
    card: `Europe, Italie, États-Unis, Chine : qui régule l'IA et comment.`,
    desc: `Les lois sur l'intelligence artificielle dans le monde : l'AI Act européen et ses niveaux de risque, la loi italienne, l'approche des États-Unis, de la Chine, du Royaume-Uni et des autres pays.`,
    lede: `Il n'existe pas de loi mondiale sur l'intelligence artificielle. Il existe des approches différentes : l'Europe régule selon le risque, les États-Unis misent sur le marché, la Chine sur le contrôle. Voici la carte.`,
    brief: [
      `L'Union européenne a la première loi d'ensemble au monde : l'AI Act.`,
      `L'Italie a sa propre loi nationale, qui complète la loi européenne.`,
      `Les États-Unis et la Chine suivent des voies très différentes.`
    ],
    sections: [
      [`Union européenne : l'AI Act`, `L'<a href="../../glossario/fr/#ai-act">AI Act</a> est en vigueur depuis 2024 et s'applique par étapes. Il classe les systèmes d'IA selon le risque : <strong>inacceptable</strong> (interdits, comme la notation sociale des citoyens), <strong>élevé</strong> (autorisés avec des obligations strictes, par exemple en santé, emploi, éducation, justice), <strong>limité</strong> (obligations de transparence, comme déclarer que l'on parle à un chatbot ou qu'un contenu est artificiel) et <strong>minimal</strong> (aucune obligation). Des règles spécifiques concernent les grands modèles à usage général.`],
      [`Italie`, `L'Italie a adopté en 2025 une loi nationale sur l'intelligence artificielle qui complète le règlement européen : elle concerne notamment la santé, le travail, l'administration publique, la justice et le droit d'auteur, et introduit des dispositions pénales contre les deepfakes préjudiciables. Les autorités de référence sont l'Agence pour l'Italie numérique et l'Agence nationale pour la cybersécurité.`],
      [`États-Unis`, `Il n'existe pas de loi fédérale d'ensemble. Les règles viennent des décrets présidentiels, qui changent avec les administrations, des agences sectorielles et des États, dont certains ont adopté leurs propres lois. L'orientation générale privilégie l'innovation et la concurrence avec la Chine.`],
      [`Chine`, `La Chine a introduit des règles ciblées par domaine : algorithmes de recommandation, contenus synthétiques et services d'IA générative, avec des obligations d'enregistrement et d'étiquetage des contenus générés. Le contrôle de l'État y est plus direct qu'ailleurs.`],
      [`Royaume-Uni et autres pays`, `Le Royaume-Uni a choisi jusqu'ici de ne pas adopter de loi unique, en confiant les règles aux autorités sectorielles. Le Japon et la Corée du Sud ont adopté des lois-cadres visant à promouvoir le développement. Au niveau international, il existe des principes partagés, comme ceux de l'OCDE, et une convention du Conseil de l'Europe sur l'IA et les droits humains, mais aucun traité contraignant pour tous.`],
      [`Pourquoi cela vous concerne aussi`, `Les règles européennes s'appliquent à quiconque propose des services d'IA dans l'Union, même si l'entreprise a son siège ailleurs. C'est pourquoi certaines fonctions arrivent plus tard en Europe. Les actualités sur les lois et les règles sont rassemblées chaque heure sur la page d'accueil de FAIND, dans la rubrique « Lois et régulation ».`]
    ],
    faq: [
      [`Existe-t-il une loi sur l'intelligence artificielle en Italie ?`, `Oui. Outre le règlement européen AI Act, directement applicable, l'Italie a adopté en 2025 une loi nationale sur l'intelligence artificielle.`],
      [`Comment les systèmes d'IA sont-ils classés selon l'AI Act ?`, `En quatre niveaux de risque : inacceptable (interdits), élevé (obligations strictes), limité (obligations de transparence) et minimal (aucune obligation).`]
    ],
    sources: [`Règlement (UE) 2024/1689, « AI Act »`, `Loi italienne sur l'intelligence artificielle (2025)`]
  },

  'come-riconoscere-audio-foto-video-intelligenza-artificiale': {
    title: `Comment reconnaître les sons, photos et vidéos créés avec l'intelligence artificielle`,
    card: `Les signes à observer et les vérifications à faire avant de croire, ou de partager.`,
    desc: `Comment reconnaître une photo, une vidéo ou un enregistrement audio générés avec l'intelligence artificielle : les signes visuels et sonores, les détecteurs d'IA, la vérification des sources et comment se protéger des deepfakes.`,
    lede: `Les contenus générés par l'IA sont de plus en plus difficiles à distinguer à l'œil nu. Mais il existe des signes à chercher et, surtout, des vérifications qui fonctionnent même quand l'œil ne suffit plus.`,
    brief: [
      `Les défauts visibles diminuent à chaque nouvelle version : l'œil ne suffit pas.`,
      `Le contrôle le plus efficace porte sur la source, pas sur l'image.`,
      `Les détecteurs automatiques aident mais se trompent : ce ne sont pas des preuves.`
    ],
    sections: [
      [`Comment reconnaître une photo créée avec l'IA`, `Regardez les détails : mains et doigts, dents, boucles d'oreilles dépareillées, inscriptions illisibles à l'arrière-plan, ombres et reflets incohérents, peau trop lisse, objets qui se fondent les uns dans les autres. Ce sont des indices utiles, mais les modèles récents en commettent de moins en moins.`],
      [`Comment reconnaître une vidéo`, `Observez la synchronisation entre les lèvres et la voix, les clignements des yeux, les contours du visage quand la personne tourne la tête, les scintillements dans les cheveux et l'arrière-plan, les mouvements du corps qui ne collent pas. Dans les vidéos courtes et de basse résolution, c'est plus difficile.`],
      [`Comment reconnaître un enregistrement audio généré par l'IA`, `Les voix clonées ont tendance à être uniformes : peu de variation de ton, pauses peu naturelles, respirations absentes, aucun bruit de fond. C'est le terrain des arnaques téléphoniques avec la voix d'un proche. La meilleure défense est pratique : raccrocher et rappeler le numéro que vous connaissez, ou convenir en famille d'un mot de sécurité.`],
      [`La vérification la plus efficace : la source`, `Qui a publié ce contenu en premier ? Des médias fiables le relaient-ils ? Avec la recherche inversée d'images, vous pouvez voir où et quand une photo est apparue. Si un contenu spectaculaire n'existe que sur un profil inconnu, le doute s'impose.`],
      [`Détecteurs d'IA et étiquettes`, `Il existe des outils qui estiment si un contenu est artificiel, mais ils donnent des faux positifs et des faux négatifs : ce sont des indices, pas des preuves. Plus prometteuses sont les étiquettes à la source : filigranes invisibles et « content credentials » qui enregistrent la façon dont un fichier a été créé. En Europe, l'<a href="../../glossario/fr/#ai-act">AI Act</a> prévoit l'obligation de signaler les <a href="../../glossario/fr/#deepfake">deepfakes</a>.`],
      [`Avant de partager`, `Si un contenu vous met en colère ou vous surprend beaucoup, arrêtez-vous un instant : c'est précisément l'effet recherché par celui qui l'a fabriqué. Pour les risques plus larges, voir <a href="intelligenza-artificiale-e-pericolosa.html">l'intelligence artificielle est-elle dangereuse ?</a>`]
    ],
    faq: [
      [`Comment savoir si une photo a été créée avec l'intelligence artificielle ?`, `Contrôlez les mains, les inscriptions, les ombres et les reflets, mais surtout vérifiez la source avec une recherche inversée d'images : les défauts visibles sont de plus en plus rares.`],
      [`Les détecteurs d'IA sont-ils fiables ?`, `En partie seulement. Ils peuvent se tromper dans les deux sens ; il faut donc les utiliser comme un indice, avec la vérification de la source.`]
    ],
    sources: []
  },
  'cos-e-intelligenza-artificiale-come-funziona': {
    title: `Qu'est-ce que l'intelligence artificielle et comment fonctionne-t-elle ? Explication simple`,
    card: `Ce que cela veut dire, comment une machine apprend et pourquoi elle se trompe parfois.`,
    desc: `Qu'est-ce que l'intelligence artificielle (IA) et comment fonctionne-t-elle, expliqué simplement : comment elle apprend des données, ce que sont le machine learning et les modèles de langage, où vous l'utilisez déjà et quelles sont ses limites.`,
    lede: `En bref : l'intelligence artificielle (IA) est un ensemble de programmes qui accomplissent des tâches demandant d'habitude une intelligence humaine, comme comprendre une phrase, reconnaître un visage ou écrire un texte. Elle ne suit pas des règles écrites à la main : elle apprend à partir d'énormément d'exemples.`,
    brief: [
      `L'IA apprend à partir d'exemples plutôt que de règles écrites à la main.`,
      `ChatGPT, Gemini et Claude sont des modèles de langage : ils prédisent le mot suivant le plus probable.`,
      `Elle est puissante mais ne comprend pas comme une personne : elle peut se tromper avec assurance.`
    ],
    sections: [
      [`L'intelligence artificielle, en termes simples`, `C'est la capacité d'un ordinateur à faire des choses que nous jugeons intelligentes : reconnaître des images, comprendre et produire du langage, prendre des décisions, faire des prévisions. Le nom remonte à 1956, à un colloque au Dartmouth College aux États-Unis. Pendant des décennies, elle est restée une affaire de laboratoire ; depuis 2022, avec ChatGPT, elle est entrée dans la vie de tous.`],
      [`Comment elle fonctionne : elle apprend par l'exemple`, `Un programme classique suit les instructions d'un programmeur. Un système d'IA, lui, est <a href="../../glossario/fr/#addestramento">entraîné</a> : on lui montre des millions d'exemples et il ajuste seul des milliards de nombres internes, ses <a href="../../glossario/fr/#parametri">paramètres</a>, jusqu'à ce que ses réponses se rapprochent des bonnes. Pour reconnaître un chat, on ne lui explique pas ce qu'est un chat : on lui montre énormément de photos de chats. Cette méthode s'appelle <a href="../../glossario/fr/#machine-learning">apprentissage automatique</a> ; sa forme la plus puissante, fondée sur des <a href="../../glossario/fr/#rete-neurale">réseaux de neurones</a> à nombreuses couches, est le <a href="../../glossario/fr/#deep-learning">deep learning</a>.`],
      [`Comment fonctionnent ChatGPT, Gemini et Claude`, `Ce sont des <a href="../../glossario/fr/#llm">grands modèles de langage</a> : ils ont lu une part énorme des textes disponibles et appris à prédire, mot après mot, la suite la plus probable. Ils sont ensuite affinés avec des exemples de conversations et le jugement de personnes qui notent les réponses. Le résultat écrit avec aisance sur presque tout, mais ne consulte pas une base de faits : c'est pourquoi il invente parfois. Plus de détails dans <a href="intelligenza-artificiale-e-affidabile.html">l'IA est-elle fiable ?</a>`],
      [`Là où vous l'utilisez déjà sans le savoir`, `Dans les recommandations de films et de musique, les filtres antispam, le déverrouillage du téléphone par le visage, la traduction automatique, les cartes qui calculent le trafic, l'appareil photo qui améliore les images. L'<a href="../../glossario/fr/#ai-generativa">IA générative</a>, qui crée textes, images et vidéos, n'en est que la partie la plus récente et la plus visible.`],
      [`IA spécialisée et IA générale`, `Tous les systèmes actuels sont spécialisés : excellents dans certaines tâches, incapables en dehors. L'idée d'une IA capable de faire tout ce que fait une personne s'appelle <a href="../../glossario/fr/#agi">intelligence artificielle générale</a> (AGI) : certaines entreprises disent la viser, beaucoup de chercheurs doutent qu'elle soit proche. Dans tous les cas, l'IA d'aujourd'hui n'a ni conscience ni intentions.`],
      [`Ce qu'elle sait faire et ce qu'elle ne sait pas faire`, `Elle sait résumer, traduire, écrire, programmer, analyser des données, reconnaître images et voix. Elle ne sait pas vérifier seule si ce qu'elle dit est vrai, n'a pas d'expérience du monde et reflète les défauts des données dont elle a appris. Pour commencer, il y a le guide <a href="imparare-a-usare-intelligenza-artificiale.html">comment utiliser l'intelligence artificielle</a> ; pour le pour et le contre, <a href="intelligenza-artificiale-rischi-e-vantaggi.html">risques et avantages</a>.`]
    ],
    faq: [
      [`Qu'est-ce que l'intelligence artificielle en termes simples ?`, `Des programmes qui apprennent à partir de nombreux exemples à accomplir des tâches propres à l'intelligence humaine, comme comprendre le langage, reconnaître des images ou prendre des décisions.`],
      [`Comment fonctionne l'intelligence artificielle ?`, `Elle est entraînée sur de grandes quantités de données et ajuste seule des milliards de paramètres jusqu'à ce que ses réponses se rapprochent des bonnes. Les chatbots comme ChatGPT prédisent le mot suivant le plus probable.`],
      [`Qui a inventé l'intelligence artificielle ?`, `Il n'y a pas un seul inventeur. Le nom a été proposé par John McCarthy pour un colloque au Dartmouth College en 1956 ; Alan Turing en avait posé les bases théoriques en 1950.`]
    ],
    sources: [`J. McCarthy et al., Dartmouth Summer Research Project on Artificial Intelligence proposal (1955)`, `A. M. Turing, “Computing Machinery and Intelligence” (1950)`]
  },
  'cos-e-chatgpt-come-funziona': {
    title: `Qu'est-ce que ChatGPT, comment ça marche et comment l'utiliser ?`,
    card: `Ce qu'il fait, combien il coûte, comment commencer et à quoi faire attention.`,
    desc: `Qu'est-ce que ChatGPT et comment fonctionne-t-il : qui l'a créé, ce qu'il sait faire, comment l'utiliser gratuitement sur le site et l'application, le prix de Go, Plus et Pro, et les limites à connaître sur les erreurs et la vie privée.`,
    lede: `En bref : ChatGPT est un assistant d'intelligence artificielle créé par OpenAI, avec lequel on dialogue par écrit ou à la voix, comme dans une messagerie. Il répond aux questions, écrit et corrige des textes, résume, traduit, lit des fichiers et des images. Il s'utilise gratuitement sur chatgpt.com ou dans l'application.`,
    brief: [
      `C'est un chatbot d'OpenAI, lancé le 30 novembre 2022.`,
      `Il est utilisable gratuitement ; Plus coûte 20 dollars par mois.`,
      `Il peut se tromper avec assurance : les réponses sur des faits et des chiffres sont à vérifier.`
    ],
    sections: [
      [`Qu'est-ce que ChatGPT`, `C'est un programme de conversation, un <a href="../../glossario/fr/#chatbot">chatbot</a>, développé par l'entreprise américaine OpenAI et lancé le 30 novembre 2022. Selon une estimation de la banque UBS, il a atteint 100 millions d'utilisateurs en deux mois, une croissance jamais vue pour un service numérique ; en août 2026, OpenAI a annoncé plus d'un milliard d'utilisateurs par semaine. Le nom vient de GPT, Generative Pre-trained Transformer, la famille de modèles sur laquelle il repose.`],
      [`Comment il fonctionne`, `ChatGPT repose sur un <a href="../../glossario/fr/#llm">modèle de langage</a> entraîné sur d'énormes quantités de texte : face à une question, il construit la réponse en prédisant un mot après l'autre. Il a ensuite été affiné grâce au jugement de personnes qui ont noté ses réponses, pour le rendre plus utile et plus prudent. Aujourd'hui, il peut aussi chercher sur le web et citer ses sources, lire des documents et des photos, créer des images et parler à voix haute. Pour le mécanisme général, voir <a href="cos-e-intelligenza-artificiale-come-funziona.html">qu'est-ce que l'intelligence artificielle</a>.`],
      [`Comment utiliser ChatGPT`, `On ouvre chatgpt.com ou on télécharge l'application pour iPhone ou Android, on se connecte et on écrit une demande. Plus elle est précise, mieux c'est : qui vous êtes, ce que vous voulez, sur quel matériau, sous quelle forme. Si la réponse ne convient pas, on la corrige en poursuivant la conversation. Exemples et règles dans le guide <a href="imparare-a-usare-intelligenza-artificiale.html">comment utiliser l'intelligence artificielle</a>.`],
      [`Combien il coûte`, `La version gratuite suffit pour un usage quotidien léger. ChatGPT Go coûte 8 dollars par mois, Plus 20, et les offres Pro de 100 à 200 dollars par mois, avec des limites plus hautes et l'accès aux modèles les plus puissants. Les prix à jour, comparés à Claude, Gemini et aux autres, sont sur la page <a href="../../confronto/fr/">comparatif des IA</a> ; si vous hésitez avec Gemini, voir <a href="chatgpt-o-gemini-quale-scegliere.html">ChatGPT ou Gemini : lequel choisir</a>.`],
      [`Ce qu'il fait bien et moins bien`, `Bien : écrire et corriger des textes, résumer des documents, traduire, expliquer un sujet, aider à programmer, proposer des idées. Moins bien : chiffres, dates, citations et actualité récente sans sources, où il peut inventer (on parle d'<a href="../../glossario/fr/#allucinazione">hallucinations</a>). Pour la santé, l'argent et les questions juridiques, il aide à comprendre mais ne remplace pas un professionnel.`],
      [`ChatGPT et vie privée`, `Les conversations sont traitées sur les serveurs d'OpenAI et, sauf réglage contraire, peuvent servir à améliorer les modèles : cela se désactive dans les paramètres. En Italie, l'autorité de protection des données a bloqué temporairement ChatGPT au printemps 2023 et, en décembre 2024, a infligé à OpenAI une amende de 15 millions d'euros. Mieux vaut ne pas y saisir les données personnelles d'autrui, des documents confidentiels ou des mots de passe.`]
    ],
    faq: [
      [`ChatGPT est-il gratuit ?`, `Oui, il existe une version gratuite avec des limites d'utilisation. Les offres payantes commencent à 8 dollars par mois (Go) ; Plus coûte 20 dollars.`],
      [`Qui a créé ChatGPT ?`, `OpenAI, une entreprise américaine basée à San Francisco et dirigée par Sam Altman. ChatGPT a été lancé le 30 novembre 2022.`],
      [`ChatGPT dit-il toujours la vérité ?`, `Non. Il peut inventer des informations avec assurance, surtout des faits, des chiffres et des citations. Les réponses importantes sont à vérifier.`]
    ],
    sources: [`OpenAI, « Introducing ChatGPT » (30 novembre 2022)`, `Garante italien pour la protection des données, sanction contre OpenAI (décembre 2024)`]
  },
  'chatgpt-o-gemini-quale-scegliere': {
    title: `ChatGPT ou Gemini : lequel choisir ? Différences, prix, avantages et inconvénients`,
    card: `Les deux assistants les plus utilisés comparés, sans parti pris.`,
    desc: `ChatGPT ou Gemini, lequel choisir ? Les différences entre les deux assistants IA les plus utilisés : les points forts de chacun, les offres gratuites et payantes, l'intégration avec Google et l'iPhone, et un conseil pour chaque usage.`,
    lede: `En bref : ce sont les deux assistants les plus utilisés au monde et, pour un usage quotidien, ils se valent. Gemini convient à ceux qui vivent dans l'univers Google (Gmail, Docs, Android) ; ChatGPT à ceux qui veulent l'assistant le plus polyvalent. Le mieux est de les essayer tous les deux gratuitement sur la même tâche.`,
    brief: [
      `Pour écrire, résumer et expliquer, ils se valent.`,
      `Gemini est intégré à Gmail, Docs et Android ; ChatGPT offre la gamme de fonctions la plus large.`,
      `Les deux ont une offre gratuite et une autour de 20 dollars par mois.`
    ],
    sections: [
      [`Qui sont-ils`, `ChatGPT appartient à OpenAI et est sorti en novembre 2022 ; en août 2026, OpenAI a annoncé plus d'un milliard d'utilisateurs par semaine. Gemini appartient à Google, a remplacé Bard en 2024 et, en août 2026, Google a annoncé plus d'un milliard d'utilisateurs par mois (les deux chiffres ne sont pas comparables : l'un est hebdomadaire, l'autre mensuel). Ce sont deux produits mûrs, mis à jour en permanence : les classements du meilleur changent tous les quelques mois.`],
      [`Les points forts de ChatGPT`, `La polyvalence : conversation vocale très naturelle, mémoire des préférences, projets pour organiser le travail, génération d'images, une grande collection d'assistants personnalisés (les GPT) et l'intégration avec Siri sur les iPhone récents. C'est aussi l'outil pour lequel il existe le plus de guides et d'exemples, utile pour débuter.`],
      [`Les points forts de Gemini`, `L'intégration avec Google : il lit et résume les e-mails de Gmail, travaille dans Docs, Sheets et Drive, utilise Maps et YouTube et c'est l'assistant par défaut de nombreux téléphones Android. Il a un accès direct à la recherche Google et gère bien les longs documents et les longues vidéos. L'offre payante Google AI Pro comprend aussi de l'espace de stockage sur Google Drive.`],
      [`Les prix comparés`, `Les deux ont une offre gratuite. ChatGPT : Go à 8 dollars par mois, Plus à 20, Pro de 100 à 200. Gemini : Google AI Plus à 4,99 et Google AI Pro à 19,99, avec des offres supérieures pour un usage professionnel. Les tarifs à jour, avec Claude, Copilot, Perplexity et les autres, sont sur la page <a href="../../confronto/fr/">comparatif des IA</a>.`],
      [`Lequel choisir`, `Si vous utilisez Gmail et un téléphone Android tous les jours, commencez par Gemini. Si vous voulez un assistant généraliste pour écrire, étudier et travailler, ou si vous avez un iPhone, commencez par ChatGPT. Si vous écrivez ou analysez de longs textes, essayez aussi Claude. La méthode reste la même : donnez à chacun la même demande réelle, un e-mail ou un résumé, et gardez celui qui répond le mieux. Payer n'a de sens que si vous atteignez souvent les limites gratuites : voir <a href="intelligenza-artificiale-gratis-o-a-pagamento.html">l'IA est-elle gratuite ou payante ?</a>`],
      [`Attention dans les deux cas`, `Les deux peuvent se tromper sur les faits, les chiffres et l'actualité, et les deux peuvent utiliser les conversations pour améliorer leurs modèles, sauf réglage contraire. Comment vérifier les réponses : <a href="intelligenza-artificiale-e-affidabile.html">l'IA est-elle fiable ?</a> ; pour comprendre ChatGPT : <a href="cos-e-chatgpt-come-funziona.html">qu'est-ce que ChatGPT</a>.`]
    ],
    faq: [
      [`Vaut-il mieux ChatGPT ou Gemini ?`, `Pour un usage quotidien, ils se valent. Gemini convient aux grands utilisateurs de Gmail, Docs et Android ; ChatGPT à ceux qui veulent l'assistant le plus polyvalent. Les essayer tous les deux gratuitement sur la même tâche est le meilleur moyen de choisir.`],
      [`Gemini est-il gratuit ?`, `Oui, il a une version gratuite. Google AI Plus coûte 4,99 par mois et Google AI Pro 19,99, avec plus de fonctions et de l'espace sur Drive.`],
      [`Peut-on utiliser les deux ?`, `Oui, ce sont des services indépendants et les versions gratuites ne coûtent rien : beaucoup utilisent Gemini pour les e-mails et les documents, et ChatGPT pour le reste.`]
    ],
    sources: [`OpenAI, annonce d'un milliard d'utilisateurs hebdomadaires de ChatGPT (août 2026)`, `Google, annonce d'un milliard d'utilisateurs mensuels de l'application Gemini (août 2026)`]
  },
  'intelligenza-artificiale-a-scuola': {
    title: `L'intelligence artificielle à l'école : règles, risques et bon usage`,
    card: `Ce que disent les lignes directrices italiennes et comment utiliser l'IA pour vraiment apprendre.`,
    desc: `L'intelligence artificielle à l'école : ce que prévoient les lignes directrices du ministère italien de l'Éducation, comment l'utiliser pour étudier sans copier, les risques pour l'apprentissage et la vie privée, et ce que peuvent faire enseignants et parents.`,
    lede: `En bref : depuis septembre 2025, les écoles italiennes disposent de lignes directrices officielles sur l'intelligence artificielle. On peut l'utiliser, mais avec des règles : l'enseignant reste responsable des choix éducatifs, les données des élèves doivent être protégées et l'IA doit aider à apprendre, pas faire les devoirs à la place des élèves.`,
    brief: [
      `Les lignes directrices italiennes (décret 166/2025) s'appliquent depuis septembre 2025.`,
      `L'IA ne peut pas décider des notes et des évaluations : elles restent à l'enseignant.`,
      `Utilisée comme tuteur, elle aide ; utilisée pour copier, elle supprime l'apprentissage.`
    ],
    sections: [
      [`Les règles en Italie`, `Le ministère italien de l'Éducation et du Mérite a adopté ses lignes directrices par le décret 166 du 9 août 2025, en vigueur depuis le 2 septembre 2025. Elles reposent sur quatre principes : la centralité de la personne, l'équité et l'inclusion, l'éthique et la responsabilité, la transparence. L'IA ne peut pas prendre de décisions éducatives, d'évaluation ou disciplinaires : la responsabilité reste à l'enseignant. Les écoles qui introduisent des outils d'IA doivent avancer par étapes, de l'essai en petits groupes à l'évaluation des résultats, et partager leurs projets sur la plateforme ministérielle Unica.`],
      [`Vie privée et données des élèves`, `Les écoles doivent vérifier que les fournisseurs respectent le RGPD et mettre à jour leurs informations sur la vie privée. Les élèves, ou les familles pour les mineurs, ont le droit de refuser que leurs données servent à entraîner les systèmes, sans pénalité et avec une solution alternative. Beaucoup de services imposent aussi un âge minimum : ChatGPT, par exemple, est interdit aux moins de 13 ans, et entre 13 et 18 ans l'accord des parents est nécessaire.`],
      [`L'utiliser pour étudier (sans copier)`, `Elle fonctionne bien comme tuteur : se faire réexpliquer un sujet avec d'autres mots, se faire interroger avant un contrôle, demander des exemples et des exercices, vérifier un raisonnement déjà fait. Elle fonctionne mal si on lui demande de faire le devoir : le texte arrive, l'apprentissage non, et souvent avec des erreurs. Une règle pratique : essayer d'abord seul, puis utiliser l'IA pour vérifier et comprendre où l'on s'est trompé.`],
      [`Les risques`, `Le premier est d'apprendre moins : déléguer l'écriture et le raisonnement entraîne peu les compétences que l'école doit construire. Il y a ensuite les erreurs affirmées avec assurance, les sources inventées et l'écart entre ceux qui ont des outils et un accompagnement à la maison et les autres. Enfin, les détecteurs de textes écrits par l'IA ne sont pas fiables : un jugement ne devrait jamais reposer sur eux seuls. Pourquoi l'IA se trompe : <a href="intelligenza-artificiale-e-affidabile.html">l'IA est-elle fiable ?</a>`],
      [`Ce que peuvent faire enseignants et parents`, `Les enseignants peuvent l'utiliser pour préparer des supports, des exercices adaptés et des explications alternatives, et dire clairement en classe quand et comment elle est autorisée. Les parents ont intérêt à en parler avec leurs enfants plutôt qu'à l'interdire : demander comment ils l'utilisent, l'essayer ensemble, expliquer qu'il faut toujours vérifier. Pour commencer, le guide <a href="imparare-a-usare-intelligenza-artificiale.html">comment utiliser l'intelligence artificielle</a>.`]
    ],
    faq: [
      [`Peut-on utiliser l'intelligence artificielle à l'école ?`, `En Italie, oui : depuis septembre 2025, les lignes directrices du ministère de l'Éducation encadrent son usage, avec des règles sur la vie privée, la transparence et la responsabilité de l'enseignant.`],
      [`Utiliser ChatGPT pour les devoirs, est-ce tricher ?`, `Cela dépend de la manière. Se faire expliquer ou corriger, c'est comme utiliser un bon livre ; se faire écrire le devoir et le rendre comme le sien, c'est copier, et cela supprime l'apprentissage.`],
      [`À partir de quel âge peut-on utiliser ChatGPT ?`, `Selon les conditions d'OpenAI, à partir de 13 ans, et jusqu'à 18 ans avec l'accord des parents.`]
    ],
    sources: [`Ministère italien de l'Éducation et du Mérite, décret 166 du 9 août 2025 et lignes directrices pour l'introduction de l'intelligence artificielle à l'école`, `OpenAI, conditions d'utilisation`]
  }
};
