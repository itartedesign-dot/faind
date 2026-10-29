/* =====================================================================
   FAIND — Approfondimenti in inglese (approfondimenti/en/)
   ---------------------------------------------------------------------
   Traduzione degli articoli di scripts/articles.mjs. Ogni voce ha lo
   stesso "slug" dell'articolo italiano: se un articolo qui manca, la
   pagina inglese non viene creata.
   I link interni partono da approfondimenti/en/, quindi iniziano con
   "../../" (es. ../../glossario/en/#prompt). I link ad altri
   approfondimenti sono solo "nome-articolo.html".
   ===================================================================== */

export default {
  'intelligenza-artificiale-sostituira-uomo-lavori-a-rischio': {
    title: `Will artificial intelligence replace humans? The jobs at risk and the ones that are safe`,
    card: `Which jobs will disappear, which will change and which will stay: what the data say.`,
    desc: `Will artificial intelligence replace humans at work? The jobs at risk, the jobs that are safe, what happens to programmers, doctors and teachers, and how to prepare.`,
    lede: `It is the question more and more people are asking: will artificial intelligence replace humans at work? The short answer is that it replaces tasks, not people. But some jobs will change far more than others.`,
    brief: [
      `AI automates individual tasks more than whole jobs.`,
      `The most exposed are repetitive office jobs based on text and data.`,
      `The least exposed require physical presence, manual skill, human contact and responsibility.`
    ],
    sections: [
      [`Which jobs are at risk from artificial intelligence`, `The most exposed jobs are those made up largely of repetitive tasks on text and data: data entry, first-line customer support, standard translation, basic bookkeeping, and part of secretarial work and document drafting. In 2024 the International Monetary Fund estimated that about 40% of jobs worldwide are exposed to artificial intelligence, and about 60% in advanced economies. Exposed does not mean wiped out: for roughly half of these jobs AI can be an aid that raises productivity.`],
      [`The jobs that are not at risk`, `Jobs that hold up better are those requiring physical presence and fine manual skill (plumbers, electricians, nurses, craftspeople), direct relationships with people (educators, care work, complex sales) and responsibility for a decision. They are also the jobs where a mistake is costly and someone has to answer for it.`],
      [`Programmers, doctors, teachers: will they be replaced?`, `These are three professions people often search for on Google together with the word “replace”. <strong>Programmers</strong> already use AI to write code faster: the work shifts from typing to designing and checking. For <strong>doctors</strong>, AI is a second pair of eyes on scans and a help with paperwork, but diagnosis and responsibility stay with the doctor. For <strong>teachers</strong>, what changes is how lessons and tests are prepared, not the relationship with the class.`],
      [`How many jobs will disappear and how many will be created`, `Estimates vary widely from one study to another, and it is wise to be wary of numbers that sound too precise. The World Economic Forum, in its 2025 Future of Jobs Report, expects about 92 million jobs to be lost and 170 million new ones to be created worldwide by 2030, as a result of several factors including AI. The point is not only how many, but who: new jobs do not necessarily appear where, and for whom, the old ones were lost.`],
      [`How to prepare`, `You do not need to become a programmer. You need to learn to use the tools well in your own job: asking the right question, checking the result, knowing where AI gets things wrong. Those who can do this already work faster than those who ignore it. Every day FAIND publishes the <a href="../../#job">ranking of the most in-demand AI jobs</a> and follows the topic on the <a href="../../temi/en/ai-jobs-work.html">AI and work</a> page. If you do not know where to start, <a href="imparare-a-usare-intelligenza-artificiale.html">learning to use artificial intelligence</a> begins with your own trade.`]
    ],
    faq: [
      [`Will artificial intelligence replace humans?`, `It replaces individual tasks more than people. Some repetitive office jobs will shrink, others will be created, and most will change the way they are done.`],
      [`Which jobs are not at risk from artificial intelligence?`, `Those that require physical presence, manual skill, relationships with people and direct responsibility: healthcare, care work, crafts and hands-on technical trades.`]
    ],
    sources: [
      `International Monetary Fund, “Gen-AI: Artificial Intelligence and the Future of Work” (2024)`,
      `World Economic Forum, “Future of Jobs Report 2025”`
    ]
  },

  'intelligenza-artificiale-e-pericolosa': {
    title: `Is artificial intelligence dangerous? Could it really turn against us?`,
    card: `Rebellion, extinction, loss of control: what is true and what is not.`,
    desc: `Is artificial intelligence dangerous? Could it rebel, destroy humanity or lead to extinction? What the experts say, which dangers are real today and which are hypothetical.`,
    lede: `Among the most frequent Google searches are “can artificial intelligence rebel” and “can it destroy humanity”. These are not naive questions: the same concerns have been voiced by some of the scientists who built this technology.`,
    brief: [
      `Today no AI has a will of its own or can “rebel” as in the films.`,
      `Some leading experts take the risk of losing control in the future seriously; others consider it exaggerated.`,
      `The dangers that are already real are different: scams, disinformation, errors, military use.`
    ],
    sections: [
      [`Can artificial intelligence rebel?`, `Today's systems have no desires, consciousness or will: they produce answers by calculating probabilities. They cannot “decide” to rebel. What experts fear is different and more concrete: increasingly capable systems, entrusted with important tasks, could pursue the goal they were given in ways we did not foresee and cannot correct in time.`],
      [`Why people talk about extinction`, `In 2023 hundreds of researchers and industry leaders, including Geoffrey Hinton, Yoshua Bengio and the heads of OpenAI and Google DeepMind, signed a one-sentence statement: mitigating the risk of extinction from AI should be a global priority, alongside pandemics and nuclear war. Hinton, winner of the 2024 Nobel Prize in Physics, left Google precisely so that he could speak freely about these risks.`],
      [`Those who disagree`, `Other equally authoritative scientists, such as Yann LeCun, regard these scenarios as distant and partly science fiction, and fear they distract from today's problems. The disagreement is real: nobody can say with certainty how capable machines will become, or when.`],
      [`The real dangers, already here`, `There is no need to wait for the future. AI is already used for scams with cloned voices and faces, to produce disinformation on a large scale, and to make cyberattacks more effective. It can make mistakes in sensitive areas such as healthcare and justice, and reproduce discrimination present in the data. Then there is military use, with increasingly autonomous weapons.`],
      [`What is being done`, `The European Union has passed the <a href="../../glossario/en/#ai-act">AI Act</a>, which bans some uses and imposes checks on high-risk ones; several countries have set up public institutes for AI safety. To understand how to protect yourself from everyday risks, see <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">how to spot audio, photos and videos made with AI</a>.`]
    ],
    faq: [
      [`Is artificial intelligence a danger to humanity?`, `Experts are divided. Some take seriously the risk of losing control of very advanced systems in the future, others consider it remote. The risks that are already concrete concern scams, disinformation, errors and military use.`],
      [`Can artificial intelligence think?`, `It processes information and produces reasoning that looks like thought, but it has no consciousness or intentions. Whether this can be called “thinking” is still an open question among scholars.`]
    ],
    sources: [`Center for AI Safety, “Statement on AI Risk” (2023)`]
  },

  'imparare-a-usare-intelligenza-artificiale': {
    title: `How to use artificial intelligence: a guide for complete beginners`,
    card: `A guide for complete beginners: which one to use, what to ask it, what to avoid.`,
    desc: `How to learn to use artificial intelligence from scratch: how it works, which AI to choose, how to write a request, how to use it for study and work, and the mistakes to avoid.`,
    lede: `Learning to use artificial intelligence does not require a technical background. It takes an hour of trying and a few rules to avoid being misled. This is the guide we wish we had read at the start.`,
    brief: [
      `You can start for free: all the main assistants have a free plan.`,
      `The quality of the answer depends on how clear the request is.`,
      `Never trust without checking, never enter confidential data.`
    ],
    sections: [
      [`How AI works, in two lines`, `Assistants such as ChatGPT, Claude and Gemini are <a href="../../glossario/en/#llm">language models</a>: they have read enormous amounts of text and predict, word by word, the most plausible answer. That is why they write well and, at times, state wrong things with confidence.`],
      [`Which one to start with`, `Any of the main ones, in its free version: there is no need to pick the perfect one. If you already use Gmail and Docs, Gemini is the most convenient; for general use ChatGPT is perfectly fine; for writing and reasoning over long texts many people prefer Claude. The differences and prices are on the <a href="../../confronto/en/">AI assistants compared</a> page.`],
      [`How to write a good request`, `The request is called a <a href="../../glossario/en/#prompt">prompt</a>. It works best when it contains four things: <strong>who you are</strong> or who the result is for, <strong>what you want</strong>, precisely, <strong>the material</strong> to work on, and <strong>the format</strong> of the answer. “Write an email” gives a generic result; “write a three-line email to a client to move Thursday's appointment, friendly tone” gives a useful one. If the answer is not convincing, correct it: this is a conversation, not a search.`],
      [`How to use AI for studying and at school`, `It works well for having a topic explained in simpler words, being quizzed, summarising your own notes and finding examples. It works badly, and teaches nothing, if you ask it to do your homework for you. The practical rule: use it as a tutor, not as a substitute.`],
      [`How to use artificial intelligence on your phone`, `It is the easiest way to start. Download the free ChatGPT, Gemini or Claude app and type or speak, as in a chat. On many Android phones Gemini is already installed as the assistant; on recent iPhones Siri can pass questions to ChatGPT. With the camera you can also show it something, a document or a label, and ask for an explanation.`],
      [`The mistakes to avoid`, `Three above all. Trusting without checking: dates, numbers and quotations must always be verified. Entering confidential data: work documents, client data, health information. Assuming that a well-written answer must be correct. For the terms you come across, there is the <a href="../../glossario/en/">glossary</a>.`]
    ],
    faq: [
      [`How do you learn to use artificial intelligence?`, `By trying a free assistant on real tasks: an email, a summary, an explanation. You improve by learning to write precise requests and to check the answers.`],
      [`Do you have to pay to use artificial intelligence?`, `No. All the main services have a free plan that is enough for learning. Paid plans are for those who use it a lot.`],
      [`How do you use artificial intelligence?`, `Open an assistant such as ChatGPT, Gemini or Claude, on the website or in the app, and write a precise request: what you want, for whom, on what material and in what format. Then improve the answer by continuing the conversation.`]
    ],
    sources: []
  },

  'guadagnare-con-intelligenza-artificiale': {
    title: `Making money with artificial intelligence: what really works`,
    card: `No magic formulas: where AI saves time and where the promises are empty.`,
    desc: `Can you make money with artificial intelligence? What really works, what does not, how to use AI to work better, and how to spot courses and promises of easy earnings.`,
    lede: `“Making money with artificial intelligence” is one of the most frequent searches, and also the one that attracts the most easy promises. The truth is less spectacular: AI does not create money out of nothing, but it saves time for people who already have a trade or an idea.`,
    brief: [
      `AI multiplies a skill you have; it does not replace it.`,
      `Real earnings come from time saved and services done better.`,
      `Anyone promising automatic income is usually selling a course.`
    ],
    sections: [
      [`What really works`, `What works is using AI to do faster, or better, a job somebody already pays for: a graphic designer who prepares more drafts, a translator who revises instead of translating from scratch, a tradesperson who has quotes and replies to customers written for them, an online shop that improves its descriptions and support. The gain is the time freed up and the number of clients you can handle.`],
      [`New services you could not offer before`, `Those who have a skill can broaden it: writers can also offer web copy and newsletters, video makers can add subtitles and versions in other languages, consultants can help small businesses introduce these tools. Here there is real demand, because many companies do not know where to begin.`],
      [`What does not work`, `Filling the web with automatically generated content: search engines recognise it and penalise it. Selling digital products made in five minutes in markets that are already saturated. Relying on AI for investing or trading: it does not predict the markets, and anyone who promises that is selling something.`],
      [`How to spot empty promises`, `Be wary of anyone who shows earnings without explaining the work behind them, who talks about “passive income” and a “secret method”, or who sells a course as the only way. The question to ask is simple: is the person telling me this earning money by using AI, or by selling courses on how to earn money with AI?`],
      [`Where to start`, `From your own trade. Write a list of the activities that take up most of your time and try doing one of them with AI this week. If you do not know which tool to choose, there is the <a href="../../confronto/en/">comparison of AI assistants</a>; if you are starting from scratch, <a href="imparare-a-usare-intelligenza-artificiale.html">the beginner's guide</a>. The roles companies are looking for most are in the <a href="../../#job">AI jobs</a> section.`]
    ],
    faq: [
      [`Can you make money with artificial intelligence?`, `Yes, above all by using it to work faster in a trade you already know, or to offer new services. There are no automatic earnings without skills.`],
      [`How can you use AI to make money with no experience?`, `Without a skill to offer it is difficult. The realistic first step is to learn to use it well in one specific area, then offer that service.`]
    ],
    sources: []
  },

  'intelligenza-artificiale-rischi-e-vantaggi': {
    title: `Artificial intelligence: risks and benefits`,
    card: `The concrete benefits and the real risks, weighed on the same scales.`,
    desc: `Artificial intelligence: risks and benefits compared. The benefits in medicine, work and everyday life, the risks for privacy, jobs and information, and the opportunities to seize.`,
    lede: `The risks and benefits of artificial intelligence are almost always searched for together, and rightly so: they are two sides of the same technology. Here is an assessment without hype and without alarm.`,
    brief: [
      `The most solid benefits are in scientific research, medicine and productivity.`,
      `The most concrete risks concern errors, privacy, disinformation and jobs.`,
      `Almost every benefit has a matching risk: what matters is how it is used.`
    ],
    sections: [
      [`The benefits of artificial intelligence`, `In <strong>research</strong> it speeds up discoveries that used to take years: predicting the shape of proteins, awarded the 2024 Nobel Prize in Chemistry, is the best-known example. In <strong>medicine</strong> it helps to read tests and scans and to detect some diseases earlier. At <strong>work</strong> it takes time away from repetitive tasks. In <strong>everyday life</strong> it translates, summarises, explains, and makes content accessible to people with a visual or hearing disability.`],
      [`The risks of artificial intelligence`, `It can <strong>make mistakes</strong> in a confident tone, and in healthcare or justice a mistake carries weight. It can reproduce <strong>discrimination</strong> present in the data it was trained on. It puts pressure on <strong>privacy</strong>, because it runs on large amounts of personal data. It makes it easy to produce <strong>disinformation</strong> and realistic fakes. And it changes <strong>work</strong> faster than many people can adapt.`],
      [`Risks and opportunities for mental health`, `This is one of the fastest-growing searches. Chatbots are always available and do not judge, and some people use them as a first outlet. But they are not therapists: they do not know the person, they can give inadequate answers in moments of crisis and they can encourage isolation. Serious distress calls for a professional.`],
      [`What the experts think`, `Even the people who built it are divided. Geoffrey Hinton, who won the 2024 Nobel Prize in Physics for work underlying AI, left Google in 2023 to speak freely about the risks, including that of losing control of systems smarter than us. Yann LeCun, for years head of AI research at Meta, considers fears of catastrophe exaggerated and sees the greater danger in power concentrated in a few companies. In between is the position of many researchers: benefits and risks are both real, and the balance depends on the rules.`],
      [`The balance`, `The same tool that helps a doctor can get a diagnosis wrong; the one that translates a text can write a scam. The outcome depends on three things: the rules, the quality of the checks and the awareness of the person using it. Further reading: <a href="intelligenza-artificiale-e-pericolosa.html">is AI dangerous?</a>, <a href="intelligenza-artificiale-e-affidabile.html">is AI reliable?</a>, <a href="../../temi/en/ai-medicine-health.html">AI in medicine</a>.`]
    ],
    faq: [
      [`What are the benefits of artificial intelligence?`, `It speeds up scientific research, helps doctors and professionals, automates repetitive tasks and makes information and services more accessible.`],
      [`What are the risks of artificial intelligence?`, `Errors presented as certainties, discrimination, privacy violations, disinformation, scams and rapid changes to work.`],
      [`What do experts think about artificial intelligence?`, `They are divided. Some, like Geoffrey Hinton, fear that very advanced systems could escape control; others, like Yann LeCun, think these fears are exaggerated. Almost all agree that rules and checks are needed.`]
    ],
    sources: []
  },

  'perche-intelligenza-artificiale-consuma-acqua-energia': {
    title: `Why does artificial intelligence use so much water and energy?`,
    card: `Data centres, electricity and cooling: how much AI really pollutes.`,
    desc: `Why does artificial intelligence use water and electricity? How data centres work, how much they consume, why AI pollutes and how it can help save energy.`,
    lede: `“Why does AI use water” and “why does AI pollute” are among the most searched questions. The answer lies in buildings almost nobody sees: data centres.`,
    brief: [
      `AI runs in data centres that use a lot of electricity.`,
      `Water is needed to cool the computers, directly or through power stations.`,
      `The impact depends on which energy powers the facilities.`
    ],
    sections: [
      [`Why artificial intelligence uses electricity`, `Every chatbot answer is the result of billions of calculations carried out by very powerful processors, <a href="../../glossario/en/#gpu">GPUs</a>, housed in <a href="../../glossario/en/#data-center">data centres</a>. Energy is needed at two stages: the <a href="../../glossario/en/#addestramento">training</a> of the models, which lasts weeks, and everyday use, which consumes less per request but is repeated billions of times.`],
      [`How much it consumes`, `According to the International Energy Agency, in 2024 data centres used about 1.5% of the world's electricity, and their consumption could roughly double by 2030, driven mainly by AI. How much a single request weighs depends on the model and on how it is measured: the figures in circulation should always be read with the source beside them.`],
      [`Why AI uses water`, `Computers produce heat and have to be cooled. Many facilities use water-based systems, and part of that water evaporates. More water is consumed indirectly, by the power stations that generate the electricity. The amount varies widely with the local climate and the technology: this is why new data centres are often contested where water is scarce.`],
      [`Does AI pollute?`, `It depends on the energy that powers it. A data centre connected to renewable sources has a very different impact from one running on gas or coal. The big companies are signing contracts for solar, wind and nuclear power, but they have also acknowledged that AI makes it harder to meet their own emissions targets.`],
      [`How much water a question to ChatGPT or Gemini uses`, `Little, but not nothing. According to Google (August 2025), a typical text request to Gemini uses about 0.26 millilitres of water, five drops, and 0.24 watt-hours of electricity. According to Sam Altman (June 2025), an average ChatGPT query uses about 0.3 millilitres and 0.34 watt-hours, but OpenAI has not explained how it calculated this. A 2023 study by the University of California, Riverside estimated about half a litre for every 10-50 answers from the older GPT-3, also counting the water used by power stations. The numbers differ so much because the model, the data centre and what is counted all change. Does AI waste water? A single question does not; the problem is the sum of billions of questions, concentrated in a few places.`],
      [`Where the water used by AI ends up`, `Not all of it is lost. Part of the water drawn by data centres goes back, warmer, to rivers and networks; the part that evaporates in cooling towers is truly consumed, and it matters most where water is scarce. That is why company reports distinguish between water <strong>withdrawn</strong> and water <strong>consumed</strong>: when you read a figure, check which of the two it is. Some new facilities use closed loops or air cooling, which use much less water but more electricity.`],
      [`The role of AI in saving energy`, `The same technology is used to forecast solar and wind output, balance power grids and cut waste in buildings and factories. Whether the final balance will be positive has not yet been settled. FAIND follows the topic every day on the <a href="../../temi/en/ai-climate-environment.html">AI, climate and environment</a> page.`]
    ],
    faq: [
      [`Why does artificial intelligence use water?`, `Because the computers in data centres produce heat and many facilities cool them with water. More water is used by the power stations that generate the electricity.`],
      [`Does using ChatGPT pollute?`, `Each request uses little energy, but multiplied by billions of uses it becomes significant. The impact depends on the efficiency of the data centre and on the energy source.`],
      [`How much water does a question to AI use?`, `According to the companies' own data, between 0.26 and 0.3 millilitres for a text request, a few drops. Older independent estimates went up to half a litre every 10-50 answers, including the water used by power stations.`],
      [`Does AI waste water?`, `A single question does not: it uses a few drops. The problem is the sum of billions of requests, concentrated in a few data centres, sometimes in areas where water is scarce.`]
    ],
    sources: [`International Energy Agency (IEA), “Energy and AI” (2025)`, `Google, study on the environmental impact of Gemini (August 2025)`, `Sam Altman, “The Gentle Singularity” (June 2025)`, `Li et al., “Making AI Less Thirsty”, University of California, Riverside (2023)`]
  },

  'intelligenza-artificiale-e-affidabile': {
    title: `Is artificial intelligence reliable? When it can get things wrong`,
    card: `Why AI gets things wrong in a confident tone, and how to tell when to trust it.`,
    desc: `Is artificial intelligence reliable and safe? Why it can make mistakes, what hallucinations are, when to trust it and how to check the answers of ChatGPT, Claude and Gemini.`,
    lede: `“Is artificial intelligence reliable?” and “can it make mistakes?” are two of the most searched questions. The honest answer: it is reliable for some things and not for others, and it does not warn you when it is wrong.`,
    brief: [
      `AI can make up facts, dates and quotations: these are called hallucinations.`,
      `It is more reliable on texts you give it than on facts it has to remember.`,
      `Checking always remains the user's job.`
    ],
    sections: [
      [`Why artificial intelligence can get things wrong`, `A language model does not consult an archive of facts: it generates the most plausible answer. When it does not know, it does not say “I don't know”: it builds a believable answer. This is what is called a <a href="../../glossario/en/#allucinazione">hallucination</a>. The most cited case is that of some lawyers sanctioned in the United States for filing documents with non-existent precedents, invented by a chatbot.`],
      [`When it is reliable`, `It works well when it works on material you give it: summarising a document, rewriting a text, translating, tidying up notes, explaining a well-known concept. It also works better when it searches the web and cites its sources, because you can check them.`],
      [`When it is not`, `It is less reliable on numbers, dates, quotations, names, legal provisions, recent news and complex calculations. And in everything to do with health, money and legal matters, where a mistake has consequences: there it can help you understand, but not decide.`],
      [`Is artificial intelligence safe?`, `Safety also means data. What you write to a chatbot is processed on the company's servers and, depending on the settings, may be used to improve the models. It is better not to enter other people's personal data, confidential documents or passwords, and to check the privacy settings.`],
      [`How often it gets things wrong: the numbers`, `Two studies help measure it. In October 2025, 22 public service broadcasters from 18 countries, coordinated by the EBU and the BBC, checked more than 3,000 answers about the news from ChatGPT, Copilot, Gemini and Perplexity: 45% contained at least one significant error, often in the sources cited. In April 2025 OpenAI stated that its o3 and o4-mini models made up information in 33% and 48% of answers to a test of questions about real people. The tests differ and models change fast, but the message is the same: on facts and news, mistakes are not rare.`],
      [`How to check an answer`, `Ask for the sources and open them. Check numbers and quotations on an official site. Ask the question again in a different way, or ask another AI: if the answers change, there is reason to doubt. And remember that a well-written answer is not necessarily a right one. For photos, audio and video that look real, see <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">how to spot AI-made content</a>.`]
    ],
    faq: [
      [`Can artificial intelligence make mistakes?`, `Yes. It can invent false information and present it with confidence, especially on facts, numbers and quotations. That is why answers need to be checked.`],
      [`Can you trust ChatGPT?`, `For summarising, rewriting and explaining, yes, with a final check. For decisions about health, money and legal matters you always need a professional.`],
      [`How reliable is artificial intelligence?`, `Very reliable when it works on texts you give it, much less on facts and news: in a 2025 European study, 45% of answers about the news contained at least one significant error. Use it with a final check.`],
      [`Does artificial intelligence always tell the truth?`, `No. It does not lie on purpose, but it generates the most plausible answer, and when it does not know it can make things up with confidence. That is why it is worth asking for sources and opening them.`]
    ],
    sources: [`EBU and BBC, “News Integrity in AI Assistants” (October 2025)`, `OpenAI, o3 and o4-mini system card (April 2025)`]
  },

  'intelligenza-artificiale-gratis-o-a-pagamento': {
    title: `Is artificial intelligence free or paid?`,
    card: `What you can do without paying, and when a subscription is worth it.`,
    desc: `Is artificial intelligence free or paid? What the free plans of ChatGPT, Claude and Gemini offer, how much subscriptions cost and when it is worth paying.`,
    lede: `Both. Every major assistant has a free plan and one or more paid plans. The useful question is not whether it is free, but what you lose by staying on the free plan.`,
    brief: [
      `ChatGPT, Claude, Gemini, Copilot and Perplexity all have a free plan.`,
      `The standard plan costs about 20 dollars a month almost everywhere.`,
      `Paying is only worth it if you often hit the limits of the free plan.`
    ],
    sections: [
      [`What you can do for free`, `A lot: write and correct texts, summarise, translate, have a topic explained, generate a few images. The limits concern the number of requests, access to the most powerful models and some advanced features. For learning and occasional use the free plan is enough.`],
      [`How much subscriptions cost`, `The standard plan costs about 20 dollars a month: ChatGPT Plus, Claude Pro and Perplexity Pro at 20, Google AI Pro and Microsoft 365 Premium at 19.99. There are cheaper entry points, such as Google AI Plus at 4.99 and ChatGPT Go at 8, and professional plans from 100 to 300 dollars. All the up-to-date prices, from the most expensive to the cheapest, are on the <a href="../../confronto/en/">AI assistants compared</a> page.`],
      [`When it is worth paying`, `When you use AI every day for work and the free plan stops you, when you need long documents or many images, when you want the latest models. If you use it a few times a week, paying changes almost nothing.`],
      [`The free alternatives`, `There are entirely free assistants and <a href="../../glossario/en/#open-source">open models</a> that can be downloaded and used on your own computer, with no subscription and without sending data to anyone. They take a little more practice and a recent computer; the official links are in the <a href="../../#guide">Guides &amp; downloads</a> section.`],
      [`Watch out for the hidden price`, `Free does not mean without cost: some free plans show advertising or use conversations to improve the models, unless you change the setting. It is worth reading what you are agreeing to.`]
    ],
    faq: [
      [`Is artificial intelligence free?`, `Yes, in its basic version: all the main assistants have a free plan with usage limits. Advanced features are paid.`],
      [`How much does ChatGPT cost?`, `It has a free plan, ChatGPT Go at 8 dollars a month, Plus at 20 and Pro plans from 100 to 200 dollars. Prices can change: they are checked on the comparison page.`]
    ],
    sources: []
  },

  'leggi-intelligenza-artificiale-nel-mondo': {
    title: `Artificial intelligence laws around the world`,
    card: `Europe, Italy, the United States, China: who regulates AI, and how.`,
    desc: `Artificial intelligence laws around the world: the European AI Act and its risk levels, the Italian law, and the approach of the United States, China, the United Kingdom and other countries.`,
    lede: `There is no worldwide law on artificial intelligence. There are different approaches: Europe regulates according to risk, the United States relies on the market, China on control. Here is the map.`,
    brief: [
      `The European Union has the world's first comprehensive law: the AI Act.`,
      `Italy has its own national law alongside the European one.`,
      `The United States and China follow very different paths.`
    ],
    sections: [
      [`European Union: the AI Act`, `The <a href="../../glossario/en/#ai-act">AI Act</a> has been in force since 2024 and applies in stages. It classifies AI systems by risk: <strong>unacceptable</strong> (banned, such as social scoring of citizens), <strong>high</strong> (allowed with strict obligations, for example in healthcare, employment, education and justice), <strong>limited</strong> (transparency obligations, such as declaring that you are talking to a chatbot or that content is artificial) and <strong>minimal</strong> (no obligations). Specific rules cover large general-purpose models.`],
      [`Italy`, `In 2025 Italy passed a national law on artificial intelligence that sits alongside the European regulation: among other things it covers healthcare, work, public administration, justice and copyright, and introduces criminal provisions against harmful deepfakes. The authorities in charge are the Agency for Digital Italy and the National Cybersecurity Agency.`],
      [`United States`, `There is no comprehensive federal law. Rules come from presidential executive orders, which change with each administration, from sector agencies and from individual states, some of which have passed laws of their own. The general approach favours innovation and competition with China.`],
      [`China`, `China has introduced targeted rules for individual areas: recommendation algorithms, synthetic content and generative AI services, with obligations to register and to label generated content. State control is more direct than elsewhere.`],
      [`The United Kingdom and other countries`, `The United Kingdom has so far chosen not to pass a single law, leaving the rules to sector regulators. Japan and South Korea have passed framework laws aimed at promoting development. Internationally there are shared principles, such as those of the OECD, and a Council of Europe convention on AI and human rights, but no treaty that is binding on everyone.`],
      [`Why it concerns you too`, `European rules apply to anyone offering AI services in the Union, even if the company is based elsewhere. This is why some features arrive in Europe later. News on laws and rules is gathered every hour on the FAIND home page, in the “Law &amp; policy” section.`]
    ],
    faq: [
      [`Is there a law on artificial intelligence in Italy?`, `Yes. In addition to the European AI Act, which applies directly, Italy passed a national law on artificial intelligence in 2025.`],
      [`How are AI systems classified under the AI Act?`, `Into four risk levels: unacceptable (banned), high (strict obligations), limited (transparency obligations) and minimal (no obligations).`]
    ],
    sources: [`Regulation (EU) 2024/1689, “AI Act”`, `Italian law on artificial intelligence (2025)`]
  },

  'come-riconoscere-audio-foto-video-intelligenza-artificiale': {
    title: `How to spot audio, photos and videos made with artificial intelligence`,
    card: `The signs to look for and the checks to make before believing, or sharing.`,
    desc: `How to spot a photo, video or audio clip generated with artificial intelligence: the visual and audio signs, AI detectors, source checking and how to protect yourself from deepfakes.`,
    lede: `AI-generated content is increasingly hard to tell apart by eye. But there are signs to look for and, above all, checks that work even when the eye is not enough.`,
    brief: [
      `Visible flaws decrease with every new version: the eye is not enough.`,
      `The most effective check is on the source, not on the image.`,
      `Automatic detectors help but make mistakes: they are not proof.`
    ],
    sections: [
      [`How to spot a photo made with AI`, `Look at the details: hands and fingers, teeth, earrings that do not match, unreadable writing in the background, inconsistent shadows and reflections, skin that is too smooth, objects that merge into one another. These are useful clues, but recent models make fewer and fewer of these mistakes.`],
      [`How to spot a video`, `Watch the sync between lips and voice, the blinking, the edges of the face when the person turns their head, flickering in the hair and background, and body movements that do not add up. In short, low-resolution videos it is harder.`],
      [`How to spot AI-generated audio`, `Cloned voices tend to be uniform: little variation in tone, unnatural pauses, no breathing, no background noise. This is the territory of phone scams using the voice of a family member. The best defence is practical: hang up and call back the number you know, or agree a safe word within the family.`],
      [`The check that works best: the source`, `Who published that content first? Are reliable news outlets reporting it? With a reverse image search you can see where and when a photo appeared. If a sensational piece of content exists only on an unknown profile, doubt is in order.`],
      [`AI detectors and labels`, `There are tools that estimate whether content is artificial, but they give false positives and false negatives: they are a clue, not proof. More promising are labels applied at the source: invisible watermarks and “content credentials” that record how a file was created. In Europe the <a href="../../glossario/en/#ai-act">AI Act</a> requires <a href="../../glossario/en/#deepfake">deepfakes</a> to be flagged.`],
      [`Before you share`, `If a piece of content makes you angry or surprises you a great deal, stop for a moment: that is exactly the effect its maker is after. For the wider risks, see <a href="intelligenza-artificiale-e-pericolosa.html">is artificial intelligence dangerous?</a>`]
    ],
    faq: [
      [`How can you tell if a photo was made with artificial intelligence?`, `Check hands, writing, shadows and reflections, but above all verify the source with a reverse image search: visible flaws are becoming rarer.`],
      [`Are AI detectors reliable?`, `Only in part. They can be wrong in both directions, so they should be used as a clue alongside checking the source.`]
    ],
    sources: []
  },
  'cos-e-intelligenza-artificiale-come-funziona': {
    title: `What is artificial intelligence and how does it work? A simple explanation`,
    card: `What it means, how a machine learns and why it sometimes gets things wrong.`,
    desc: `What artificial intelligence (AI) is and how it works, explained simply: how it learns from data, what machine learning and language models are, where you already use it and what its limits are.`,
    lede: `In brief: artificial intelligence (AI) is a set of programs that carry out tasks that normally require human intelligence, such as understanding a sentence, recognising a face or writing a text. It does not follow hand-written rules: it learns from huge numbers of examples.`,
    brief: [
      `AI learns from examples rather than from hand-written rules.`,
      `ChatGPT, Gemini and Claude are language models: they predict the most likely next word.`,
      `It is powerful but does not understand like a person: it can be confidently wrong.`
    ],
    sections: [
      [`What artificial intelligence is, in simple words`, `It is a computer's ability to do things we consider intelligent: recognise images, understand and produce language, make decisions, make predictions. The name dates back to 1956, to a conference at Dartmouth College in the United States. For decades it stayed in the lab; since 2022, with ChatGPT, it has entered everyone's life.`],
      [`How it works: it learns from examples`, `A traditional program follows instructions written by a programmer. An AI system is <a href="../../glossario/en/#addestramento">trained</a> instead: it is shown millions of examples and adjusts billions of internal numbers, its <a href="../../glossario/en/#parametri">parameters</a>, until its answers get close to the right ones. To recognise a cat, nobody explains what a cat is: it is shown a great many photos of cats. This method is called <a href="../../glossario/en/#machine-learning">machine learning</a>; its most powerful form, based on many-layered <a href="../../glossario/en/#rete-neurale">neural networks</a>, is <a href="../../glossario/en/#deep-learning">deep learning</a>.`],
      [`How ChatGPT, Gemini and Claude work`, `They are <a href="../../glossario/en/#llm">large language models</a>: they have read a huge share of the available text and learned to predict, word by word, the most likely continuation. After that they are refined with example conversations and with the judgement of people who rate the answers. The result writes fluently about almost anything, but it does not consult an archive of facts, which is why it sometimes makes things up. More in <a href="intelligenza-artificiale-e-affidabile.html">is AI reliable?</a>`],
      [`Where you already use it without knowing`, `In film and music recommendations, spam filters, face unlock on your phone, automatic translation, maps that estimate traffic and cameras that improve photos. <a href="../../glossario/en/#ai-generativa">Generative AI</a>, which creates text, images and video, is only the newest and most visible part.`],
      [`Narrow AI and general AI`, `Every system that exists today is specialised: excellent at some tasks, useless outside them. The idea of an AI able to do everything a person can is called <a href="../../glossario/en/#agi">artificial general intelligence</a> (AGI): some companies say they are aiming for it, many researchers doubt it is close. Either way, today's AI has no consciousness or intentions.`],
      [`What it can and cannot do`, `It can summarise, translate, write, program, analyse data and recognise images and voices. It cannot check by itself whether what it says is true, it has no experience of the world and it reflects the flaws of the data it learned from. To get started there is the guide <a href="imparare-a-usare-intelligenza-artificiale.html">how to use artificial intelligence</a>; for pros and cons, <a href="intelligenza-artificiale-rischi-e-vantaggi.html">risks and benefits</a>.`]
    ],
    faq: [
      [`What is artificial intelligence in simple words?`, `Programs that learn from many examples to carry out tasks typical of human intelligence, such as understanding language, recognising images or making decisions.`],
      [`How does artificial intelligence work?`, `It is trained on large amounts of data, adjusting billions of parameters until its answers get close to the correct ones. Chatbots such as ChatGPT predict the most likely next word.`],
      [`Who invented artificial intelligence?`, `There is no single inventor. The name was proposed by John McCarthy for a conference at Dartmouth College in 1956; Alan Turing had laid the theoretical foundations in 1950.`]
    ],
    sources: [`J. McCarthy et al., Dartmouth Summer Research Project on Artificial Intelligence proposal (1955)`, `A. M. Turing, “Computing Machinery and Intelligence” (1950)`]
  },
  'cos-e-chatgpt-come-funziona': {
    title: `What is ChatGPT, how does it work and how do you use it?`,
    card: `What it does, what it costs, how to start and what to watch out for.`,
    desc: `What ChatGPT is and how it works: who made it, what it can do, how to use it for free on the web and in the app, what Go, Plus and Pro cost, and the limits to know about mistakes and privacy.`,
    lede: `In brief: ChatGPT is an artificial intelligence assistant made by OpenAI that you talk to by typing or by voice, as in a chat. It answers questions, writes and corrects texts, summarises, translates and reads files and images. It can be used for free at chatgpt.com or in the app.`,
    brief: [
      `It is an OpenAI chatbot, launched on 30 November 2022.`,
      `It can be used for free; Plus costs 20 dollars a month.`,
      `It can be confidently wrong: answers about facts and numbers need checking.`
    ],
    sections: [
      [`What ChatGPT is`, `It is a conversation program, a <a href="../../glossario/en/#chatbot">chatbot</a>, developed by the American company OpenAI and launched on 30 November 2022. According to an estimate by the bank UBS it reached 100 million users in two months, a growth never seen before for a digital service; in August 2026 OpenAI said it had more than a billion users a week. The name comes from GPT, Generative Pre-trained Transformer, the family of models it is based on.`],
      [`How it works`, `ChatGPT is based on a <a href="../../glossario/en/#llm">language model</a> trained on huge amounts of text: given a question, it builds the answer by predicting one word after another. It was then refined with the judgement of people who rated its answers, to make it more useful and careful. Today it can also search the web and cite sources, read documents and photos, create images and talk by voice. For the general mechanism, see <a href="cos-e-intelligenza-artificiale-come-funziona.html">what is artificial intelligence and how does it work</a>.`],
      [`How to use ChatGPT`, `Open chatgpt.com or download the app for iPhone or Android, sign in and write a request. The more precise it is, the better: who you are, what you want, what material to work on, in what format. If the answer is not right, correct it by continuing the conversation. Examples and rules are in the guide <a href="imparare-a-usare-intelligenza-artificiale.html">how to use artificial intelligence</a>.`],
      [`How much it costs`, `The free version is enough for light daily use. ChatGPT Go costs 8 dollars a month, Plus 20 and the Pro plans 100 to 200 dollars a month, with higher limits and access to the most powerful models. Up-to-date prices, compared with Claude, Gemini and the others, are on the <a href="../../confronto/en/">AI comparison</a> page; if you are torn with Gemini, see <a href="chatgpt-o-gemini-quale-scegliere.html">ChatGPT or Gemini: which to choose</a>.`],
      [`What it does well and what it does not`, `Well: writing and correcting texts, summarising documents, translating, explaining topics, helping with code, suggesting ideas. Badly: numbers, dates, quotations and recent news without sources, where it can make things up (these are called <a href="../../glossario/en/#allucinazione">hallucinations</a>). For health, money and legal questions it helps you understand, but it does not replace a professional.`],
      [`ChatGPT and privacy`, `Conversations are processed on OpenAI's servers and, unless you change the setting, may be used to improve the models; this can be switched off in the settings. In Italy the data protection authority temporarily blocked ChatGPT in spring 2023 and in December 2024 fined OpenAI 15 million euros. Avoid entering other people's personal data, confidential documents or passwords.`]
    ],
    faq: [
      [`Is ChatGPT free?`, `Yes, there is a free version with usage limits. Paid plans start at 8 dollars a month (Go); Plus costs 20 dollars.`],
      [`Who created ChatGPT?`, `OpenAI, an American company based in San Francisco and led by Sam Altman. ChatGPT was launched on 30 November 2022.`],
      [`Does ChatGPT always tell the truth?`, `No. It can make up information with confidence, especially facts, numbers and quotations. Important answers should be checked.`]
    ],
    sources: [`OpenAI, “Introducing ChatGPT” (30 November 2022)`, `Italian data protection authority (Garante), decision fining OpenAI (December 2024)`]
  },
  'chatgpt-o-gemini-quale-scegliere': {
    title: `ChatGPT or Gemini: which should you choose? Differences, prices, pros and cons`,
    card: `The two most used assistants compared, without taking sides.`,
    desc: `ChatGPT or Gemini, which to choose? The differences between the two most used AI assistants: what each does best, free and paid plans, integration with Google and the iPhone, and advice for every kind of use.`,
    lede: `In brief: they are the two most used assistants in the world and for everyday use they are about equal. Gemini suits people who live inside Google (Gmail, Docs, Android); ChatGPT suits those who want the most versatile assistant. The best way to choose is to try both for free on the same task.`,
    brief: [
      `For writing, summarising and explaining they are about equal.`,
      `Gemini is built into Gmail, Docs and Android; ChatGPT has the widest range of features.`,
      `Both have a free plan and one at about 20 dollars a month.`
    ],
    sections: [
      [`Who they are`, `ChatGPT belongs to OpenAI and came out in November 2022; in August 2026 OpenAI said it had more than a billion users a week. Gemini belongs to Google, replaced Bard in 2024 and in August 2026 Google said it had more than a billion users a month (the two figures are not comparable: one is weekly, the other monthly). Both are mature products updated all the time: rankings of which is best change every few months.`],
      [`Where ChatGPT is stronger`, `In versatility: very natural voice conversation, memory of your preferences, projects to organise work, image generation, a large collection of custom assistants (GPTs) and integration with Siri on recent iPhones. It is also the tool with the most guides and examples, which helps beginners.`],
      [`Where Gemini is stronger`, `In its integration with Google: it reads and summarises Gmail messages, works inside Docs, Sheets and Drive, uses Maps and YouTube and is the default assistant on many Android phones. It has direct access to Google Search and handles long documents and videos well. The paid Google AI Pro plan also includes Google Drive storage.`],
      [`Prices compared`, `Both have a free plan. ChatGPT: Go at 8 dollars a month, Plus at 20, Pro from 100 to 200. Gemini: Google AI Plus at 4.99 and Google AI Pro at 19.99, with higher plans for professional use. Up-to-date prices, with Claude, Copilot, Perplexity and the others, are on the <a href="../../confronto/en/">AI comparison</a> page.`],
      [`Which to choose`, `If you use Gmail and an Android phone every day, start with Gemini. If you want a general assistant for writing, studying and working, or you use an iPhone, start with ChatGPT. If you write or analyse long texts, try Claude too. The method stays the same: give both the same real request, an email or a summary, and keep the one that answers better. Paying only makes sense if you often hit the free limits: see <a href="intelligenza-artificiale-gratis-o-a-pagamento.html">is AI free or paid?</a>`],
      [`A warning for both`, `Both can be wrong on facts, numbers and news, and both may use conversations to improve their models unless you change the setting. How to check answers is explained in <a href="intelligenza-artificiale-e-affidabile.html">is AI reliable?</a>; for how ChatGPT works, see <a href="cos-e-chatgpt-come-funziona.html">what is ChatGPT</a>.`]
    ],
    faq: [
      [`Is ChatGPT or Gemini better?`, `For everyday use they are about equal. Gemini suits heavy users of Gmail, Docs and Android; ChatGPT suits those who want the most versatile assistant. Trying both for free on the same task is the best way to choose.`],
      [`Is Gemini free?`, `Yes, it has a free version. Google AI Plus costs 4.99 a month and Google AI Pro 19.99, with more features and Drive storage.`],
      [`Can you use both?`, `Yes, they are independent services and the free versions cost nothing: many people use Gemini for email and documents and ChatGPT for the rest.`]
    ],
    sources: [`OpenAI, announcement of one billion weekly ChatGPT users (August 2026)`, `Google, announcement of one billion monthly Gemini app users (August 2026)`]
  },
  'intelligenza-artificiale-a-scuola': {
    title: `Artificial intelligence at school: rules, risks and how to use it well`,
    card: `What Italy's school guidelines say and how to use AI to really learn.`,
    desc: `Artificial intelligence at school: what the Italian Ministry of Education's guidelines require, how to use AI to study without copying, the risks for learning and privacy, and what teachers and parents can do.`,
    lede: `In brief: since September 2025 Italian schools have official guidelines on artificial intelligence. It can be used, but with rules: the teacher stays responsible for educational choices, students' data must be protected, and AI must help students learn, not do their homework for them.`,
    brief: [
      `Italy's school guidelines (decree 166/2025) apply from September 2025.`,
      `AI cannot decide marks and assessments: they stay with the teacher.`,
      `Used as a tutor it helps; used to copy it removes the learning itself.`
    ],
    sections: [
      [`The rules in Italy`, `The Italian Ministry of Education and Merit adopted its guidelines with decree 166 of 9 August 2025, in force since 2 September 2025. They rest on four principles: the centrality of the person, equity and inclusion, ethics and responsibility, transparency. AI may not take educational, assessment or disciplinary decisions: responsibility stays with the teacher. Schools that introduce AI tools must proceed in stages, from trials in small groups to evaluating the results, and share their projects on the ministry's Unica platform.`],
      [`Privacy and student data`, `Schools must check that suppliers comply with the GDPR and update their privacy notices. Students, or families for minors, have the right to refuse the use of their data to train systems, without penalties and with an alternative. Many services also have a minimum age: ChatGPT, for example, cannot be used under 13, and between 13 and 18 parental consent is required.`],
      [`How to use it to study (without copying)`, `It works well as a tutor: having a topic explained again in different words, being quizzed before a test, asking for examples and exercises, checking reasoning you have already done. It works badly if you ask it to do the homework: the text arrives, the learning does not, and often with mistakes. A practical rule: try on your own first, then use AI to check and understand where you went wrong.`],
      [`The risks`, `The first is learning less: handing over writing and reasoning does little to train the very skills school must build. Then there are mistakes stated with confidence, invented sources and the gap between those who have tools and guidance at home and those who do not. And detectors of AI-written text are not reliable: a judgement should never rest on them alone. Why AI gets things wrong is explained in <a href="intelligenza-artificiale-e-affidabile.html">is AI reliable?</a>`],
      [`What teachers and parents can do`, `Teachers can use it to prepare materials, tailored exercises and alternative explanations, and say clearly in class when and how it is allowed. Parents do better talking about it with their children than banning it: ask how they use it, try it together, explain that it must always be checked. To get started there is the guide <a href="imparare-a-usare-intelligenza-artificiale.html">how to use artificial intelligence</a>.`]
    ],
    faq: [
      [`Can artificial intelligence be used at school?`, `In Italy, yes: since September 2025 the Ministry of Education's guidelines regulate its use, with rules on privacy, transparency and teacher responsibility.`],
      [`Is using ChatGPT for homework cheating?`, `It depends how. Having something explained or corrected is like using a good book; having the homework written and handing it in as your own is copying, and it removes the learning.`],
      [`At what age can you use ChatGPT?`, `According to OpenAI's terms, from 13, and up to 18 with parental consent.`]
    ],
    sources: [`Italian Ministry of Education and Merit, decree 166 of 9 August 2025 and guidelines for introducing artificial intelligence in schools`, `OpenAI, terms of use`]
  }
};
