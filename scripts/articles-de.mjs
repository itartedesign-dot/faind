/* =====================================================================
   FAIND — Approfondimenti in tedesco (approfondimenti/de/)
   ---------------------------------------------------------------------
   Traduzione degli articoli di scripts/articles.mjs. Ogni voce ha lo
   stesso "slug" dell'articolo italiano: se un articolo qui manca, la
   pagina tedesca non viene creata.
   I link interni partono da approfondimenti/de/, quindi iniziano con
   "../../" (es. ../../glossario/de/#prompt). I link ad altri
   approfondimenti sono solo "nome-articolo.html".
   ===================================================================== */

export default {
  'intelligenza-artificiale-sostituira-uomo-lavori-a-rischio': {
    title: `Wird künstliche Intelligenz den Menschen ersetzen? Gefährdete Berufe und sichere Berufe`,
    card: `Welche Berufe verschwinden, welche sich verändern und welche bleiben: was die Daten sagen.`,
    desc: `Wird künstliche Intelligenz den Menschen in der Arbeitswelt ersetzen? Die gefährdeten und die sicheren Berufe, was auf Programmierer, Ärzte und Lehrkräfte zukommt und wie man sich vorbereitet.`,
    lede: `Diese Frage stellen sich immer mehr Menschen: Wird künstliche Intelligenz den Menschen in der Arbeitswelt ersetzen? Die kurze Antwort lautet: Sie ersetzt Aufgaben, nicht Menschen. Manche Berufe werden sich aber deutlich stärker verändern als andere.`,
    brief: [
      `KI automatisiert einzelne Aufgaben eher als ganze Berufe.`,
      `Am stärksten betroffen sind repetitive Bürotätigkeiten, die auf Texten und Daten beruhen.`,
      `Am wenigsten betroffen sind Berufe, die körperliche Anwesenheit, Handarbeit, menschlichen Kontakt und Verantwortung erfordern.`
    ],
    sections: [
      [`Welche Berufe durch künstliche Intelligenz gefährdet sind`, `Am stärksten betroffen sind Berufe, die größtenteils aus wiederkehrenden Aufgaben mit Texten und Daten bestehen: Dateneingabe, Kundenservice auf erster Ebene, Standardübersetzungen, einfache Buchhaltung, Teile der Sekretariatsarbeit und der Erstellung von Dokumenten. Der Internationale Währungsfonds schätzte 2024, dass weltweit rund 40 % der Arbeitsplätze von künstlicher Intelligenz betroffen sind, in den fortgeschrittenen Volkswirtschaften rund 60 %. Betroffen heißt nicht gestrichen: Bei etwa der Hälfte dieser Arbeitsplätze kann KI eine Hilfe sein, die die Produktivität steigert.`],
      [`Die Berufe, die nicht gefährdet sind`, `Besser behaupten sich Berufe, die körperliche Anwesenheit und feine Handarbeit erfordern (Installateure, Elektriker, Pflegekräfte, Handwerker), den direkten Umgang mit Menschen (Erzieher, Betreuung, anspruchsvoller Vertrieb) und die Verantwortung für eine Entscheidung. Es sind auch die Berufe, in denen ein Fehler teuer ist und jemand dafür einstehen muss.`],
      [`Programmierer, Ärzte, Lehrkräfte: Werden sie ersetzt?`, `Das sind drei Berufe, nach denen bei Google häufig zusammen mit dem Wort „ersetzen“ gesucht wird. <strong>Programmierer</strong> nutzen KI bereits, um schneller Code zu schreiben: Die Arbeit verlagert sich vom Tippen zum Entwerfen und Prüfen. Für <strong>Ärzte</strong> ist KI ein zweites Paar Augen bei Bildaufnahmen und eine Hilfe bei der Verwaltungsarbeit, Diagnose und Verantwortung bleiben aber beim Arzt. Bei <strong>Lehrkräften</strong> ändert sich die Art, Unterricht und Prüfungen vorzubereiten, nicht die Beziehung zur Klasse.`],
      [`Wie viele Arbeitsplätze verschwinden und wie viele entstehen`, `Die Schätzungen gehen von Studie zu Studie weit auseinander, und bei allzu eindeutigen Zahlen ist Vorsicht angebracht. Das Weltwirtschaftsforum erwartet in seinem Bericht zur Zukunft der Arbeit 2025, dass bis 2030 weltweit rund 92 Millionen Arbeitsplätze wegfallen und 170 Millionen neue entstehen, und zwar durch mehrere Faktoren, darunter KI. Entscheidend ist nicht nur, wie viele, sondern wer: Neue Arbeitsplätze entstehen nicht unbedingt dort und für diejenigen, die den alten verloren haben.`],
      [`Wie man sich vorbereitet`, `Man muss nicht Programmierer werden. Man muss lernen, die Werkzeuge im eigenen Beruf gut einzusetzen: die richtige Anfrage stellen, das Ergebnis prüfen, wissen, wo KI Fehler macht. Wer das kann, arbeitet schon heute schneller als jemand, der sie ignoriert. FAIND veröffentlicht täglich die <a href="../../#job">Rangliste der gefragtesten KI-Jobs</a> und verfolgt das Thema auf der Seite <a href="../../temi/de/ki-arbeit.html">KI und Arbeit</a>.`]
    ],
    faq: [
      [`Wird künstliche Intelligenz den Menschen ersetzen?`, `Sie ersetzt eher einzelne Aufgaben als Menschen. Manche repetitiven Bürotätigkeiten werden weniger, andere entstehen neu, und in den meisten ändert sich die Arbeitsweise.`],
      [`Welche Berufe sind durch künstliche Intelligenz nicht gefährdet?`, `Berufe, die körperliche Anwesenheit, Handarbeit, den Umgang mit Menschen und direkte Verantwortung erfordern: Gesundheitswesen, Betreuung, Handwerk, technische Berufe vor Ort.`]
    ],
    sources: [
      `Internationaler Währungsfonds, „Gen-AI: Artificial Intelligence and the Future of Work“ (2024)`,
      `Weltwirtschaftsforum, „Future of Jobs Report 2025“`
    ]
  },

  'intelligenza-artificiale-e-pericolosa': {
    title: `Ist künstliche Intelligenz gefährlich? Kann sie sich wirklich auflehnen?`,
    card: `Aufstand, Auslöschung, Kontrollverlust: was daran stimmt und was nicht.`,
    desc: `Ist künstliche Intelligenz gefährlich? Kann sie sich auflehnen, die Menschheit zerstören oder zum Aussterben führen? Was Fachleute sagen, welche Gefahren heute real sind und welche hypothetisch.`,
    lede: `Zu den häufigsten Suchanfragen bei Google gehören „Kann sich künstliche Intelligenz auflehnen“ und „Kann sie die Menschheit zerstören“. Das sind keine naiven Fragen: Dieselben Sorgen haben einige der Wissenschaftler geäußert, die diese Technologie aufgebaut haben.`,
    brief: [
      `Heute hat keine KI einen eigenen Willen oder kann sich „auflehnen“ wie im Film.`,
      `Einige führende Fachleute halten das Risiko eines künftigen Kontrollverlusts für ernst; andere halten es für übertrieben.`,
      `Die bereits realen Gefahren sind andere: Betrug, Desinformation, Fehler, militärische Nutzung.`
    ],
    sections: [
      [`Kann sich künstliche Intelligenz auflehnen?`, `Heutige Systeme haben weder Wünsche noch Bewusstsein noch einen Willen: Sie erzeugen Antworten, indem sie Wahrscheinlichkeiten berechnen. Sie können nicht „beschließen“, sich aufzulehnen. Die Sorge der Fachleute ist eine andere und konkreter: Immer leistungsfähigere Systeme, denen wir wichtige Aufgaben anvertrauen, könnten das vorgegebene Ziel auf Wegen verfolgen, die wir nicht vorhergesehen haben und nicht rechtzeitig korrigieren können.`],
      [`Warum von Auslöschung die Rede ist`, `2023 unterzeichneten Hunderte von Forschenden und Führungskräften der Branche, darunter Geoffrey Hinton, Yoshua Bengio und die Chefs von OpenAI und Google DeepMind, eine Erklärung aus einem einzigen Satz: Das Risiko einer Auslöschung durch KI zu verringern, sollte eine globale Priorität sein, ebenso wie Pandemien und Atomkrieg. Hinton, Physik-Nobelpreisträger 2024, verließ Google gerade deshalb, um frei über diese Risiken sprechen zu können.`],
      [`Wer anderer Meinung ist`, `Andere ebenso angesehene Wissenschaftler wie Yann LeCun halten diese Szenarien für fern und teilweise für Science-Fiction und befürchten, dass sie von den Problemen der Gegenwart ablenken. Die Uneinigkeit ist echt: Niemand kann mit Sicherheit sagen, wie leistungsfähig Maschinen werden und wann.`],
      [`Die realen Gefahren, schon heute`, `Man muss nicht auf die Zukunft warten. KI wird bereits für Betrug mit geklonten Stimmen und Gesichtern eingesetzt, für Desinformation in großem Maßstab und für wirksamere Cyberangriffe. Sie kann in heiklen Bereichen wie Gesundheit und Justiz Fehler machen und Diskriminierung wiedergeben, die in den Daten steckt. Hinzu kommt die militärische Nutzung mit immer autonomeren Waffen.`],
      [`Was unternommen wird`, `Die Europäische Union hat den <a href="../../glossario/de/#ai-act">AI Act</a> verabschiedet, der bestimmte Anwendungen verbietet und für Hochrisiko-Anwendungen Kontrollen vorschreibt; mehrere Länder haben öffentliche Institute für KI-Sicherheit gegründet. Wie man sich vor den alltäglichen Risiken schützt, steht in <a href="come-riconoscere-audio-foto-video-intelligenza-artificiale.html">So erkennt man mit KI erstellte Audios, Fotos und Videos</a>.`]
    ],
    faq: [
      [`Ist künstliche Intelligenz eine Gefahr für die Menschheit?`, `Die Fachleute sind uneins. Einige halten das Risiko, künftig die Kontrolle über sehr fortgeschrittene Systeme zu verlieren, für ernst, andere für fernliegend. Bereits konkret sind die Risiken durch Betrug, Desinformation, Fehler und militärische Nutzung.`],
      [`Kann künstliche Intelligenz denken?`, `Sie verarbeitet Informationen und erzeugt Schlussfolgerungen, die wie Denken wirken, hat aber weder Bewusstsein noch Absichten. Ob man das „Denken“ nennen kann, ist in der Forschung noch eine offene Frage.`]
    ],
    sources: [`Center for AI Safety, „Statement on AI Risk“ (2023)`]
  },

  'imparare-a-usare-intelligenza-artificiale': {
    title: `Künstliche Intelligenz nutzen lernen: Womit man anfängt`,
    card: `Ein Leitfaden für Einsteiger: welche man nutzt, was man sie fragt, was man vermeidet.`,
    desc: `Wie man von null an lernt, künstliche Intelligenz zu nutzen: wie sie funktioniert, welche KI man wählt, wie man eine Anfrage formuliert, wie man sie fürs Lernen und Arbeiten einsetzt und welche Fehler man vermeidet.`,
    lede: `Um den Umgang mit künstlicher Intelligenz zu lernen, braucht man kein technisches Studium. Man braucht eine Stunde zum Ausprobieren und ein paar Regeln, um sich nicht täuschen zu lassen. Das ist der Leitfaden, den wir am Anfang gern gelesen hätten.`,
    brief: [
      `Der Einstieg ist kostenlos: Alle großen Assistenten haben einen Gratis-Tarif.`,
      `Die Qualität der Antwort hängt davon ab, wie klar die Anfrage ist.`,
      `Nie ohne Prüfung vertrauen, nie vertrauliche Daten eingeben.`
    ],
    sections: [
      [`Wie KI funktioniert, in zwei Sätzen`, `Assistenten wie ChatGPT, Claude und Gemini sind <a href="../../glossario/de/#llm">Sprachmodelle</a>: Sie haben riesige Textmengen gelesen und sagen Wort für Wort die plausibelste Antwort voraus. Deshalb schreiben sie gut und behaupten manchmal mit großer Sicherheit Falsches.`],
      [`Welche man zum Einstieg nutzt`, `Irgendeinen der großen, in der kostenlosen Version: Man muss nicht den perfekten finden. Wer bereits Gmail und Docs nutzt, hat es mit Gemini am bequemsten; für den allgemeinen Gebrauch eignet sich ChatGPT sehr gut; zum Schreiben und für die Arbeit an langen Texten bevorzugen viele Claude. Unterschiede und Preise stehen auf der Seite <a href="../../confronto/de/">KI-Assistenten im Vergleich</a>.`],
      [`Wie man eine gute Anfrage schreibt`, `Die Anfrage heißt <a href="../../glossario/de/#prompt">Prompt</a>. Sie funktioniert besser, wenn sie vier Dinge enthält: <strong>wer Sie sind</strong> oder für wen das Ergebnis gedacht ist, <strong>was Sie wollen</strong>, und zwar genau, <strong>das Material</strong>, mit dem gearbeitet werden soll, und <strong>das Format</strong> der Antwort. „Schreib eine E-Mail“ liefert ein allgemeines Ergebnis; „Schreib eine dreizeilige E-Mail an einen Kunden, um den Termin am Donnerstag zu verschieben, in freundlichem Ton“ liefert ein brauchbares. Überzeugt die Antwort nicht, korrigiert man: Es ist ein Gespräch, keine Suche.`],
      [`Wie man KI zum Lernen und in der Schule nutzt`, `Sie eignet sich gut, um sich ein Thema in einfacheren Worten erklären zu lassen, sich abfragen zu lassen, eigene Notizen zusammenzufassen und Beispiele zu finden. Sie eignet sich schlecht und bringt einem nichts bei, wenn man sie die Hausaufgaben an unserer Stelle machen lässt. Die Faustregel: als Tutor nutzen, nicht als Ersatz.`],
      [`Die Fehler, die man vermeiden sollte`, `Vor allem drei. Vertrauen ohne Prüfung: Daten, Zahlen und Zitate müssen immer kontrolliert werden. Vertrauliche Daten eingeben: Arbeitsunterlagen, Kundendaten, Gesundheitsinformationen. Glauben, dass eine gut formulierte Antwort zwangsläufig richtig ist. Für Begriffe, die Ihnen begegnen, gibt es das <a href="../../glossario/de/">Glossar</a>.`]
    ],
    faq: [
      [`Wie lernt man, künstliche Intelligenz zu nutzen?`, `Indem man einen kostenlosen Assistenten an echten Aufgaben ausprobiert: eine E-Mail, eine Zusammenfassung, eine Erklärung. Besser wird man, wenn man lernt, genaue Anfragen zu schreiben und die Antworten zu prüfen.`],
      [`Muss man bezahlen, um künstliche Intelligenz zu nutzen?`, `Nein. Alle großen Dienste haben einen Gratis-Tarif, der zum Lernen ausreicht. Die kostenpflichtigen Tarife sind für alle gedacht, die sie viel nutzen.`]
    ],
    sources: []
  },

  'guadagnare-con-intelligenza-artificiale': {
    title: `Mit künstlicher Intelligenz Geld verdienen: Was wirklich funktioniert`,
    card: `Keine Zauberformeln: wo KI Zeit spart und wo die Versprechen leer sind.`,
    desc: `Kann man mit künstlicher Intelligenz Geld verdienen? Was wirklich funktioniert, was nicht, wie man KI nutzt, um besser zu arbeiten, und woran man Kurse und Versprechen vom schnellen Geld erkennt.`,
    lede: `„Mit künstlicher Intelligenz Geld verdienen“ gehört zu den häufigsten Suchanfragen und zieht zugleich die meisten leichten Versprechen an. Die Wahrheit ist weniger spektakulär: KI erzeugt kein Geld aus dem Nichts, aber sie spart denen Zeit, die bereits einen Beruf oder eine Idee haben.`,
    brief: [
      `KI vervielfacht eine Fähigkeit, die Sie haben; sie ersetzt sie nicht.`,
      `Echte Einnahmen entstehen durch gesparte Zeit und besser erbrachte Leistungen.`,
      `Wer automatische Einkünfte verspricht, verkauft meistens einen Kurs.`
    ],
    sections: [
      [`Was wirklich funktioniert`, `Es funktioniert, KI zu nutzen, um eine Arbeit schneller oder besser zu erledigen, für die schon jemand bezahlt: ein Grafiker, der mehr Entwürfe vorbereitet, ein Übersetzer, der überarbeitet, statt von Grund auf zu übersetzen, ein Handwerker, der sich Angebote und Antworten an Kunden schreiben lässt, ein Onlineshop, der Beschreibungen und Kundenservice verbessert. Der Gewinn ist die frei gewordene Zeit und die Zahl der Kunden, die Sie betreuen können.`],
      [`Neue Leistungen, die Sie vorher nicht anbieten konnten`, `Wer eine Fähigkeit hat, kann sie erweitern: Wer schreibt, kann auch Webtexte und Newsletter anbieten, wer Videos macht, kann Untertitel und Fassungen in anderen Sprachen hinzufügen, wer berät, kann kleinen Unternehmen helfen, diese Werkzeuge einzuführen. Hier gibt es echte Nachfrage, weil viele Unternehmen nicht wissen, wo sie anfangen sollen.`],
      [`Was nicht funktioniert`, `Das Web mit automatisch erzeugten Inhalten zu füllen: Suchmaschinen erkennen sie und stufen sie herab. Digitale Produkte, die in fünf Minuten entstanden sind, in bereits gesättigten Märkten zu verkaufen. Sich bei Geldanlage oder Trading auf KI zu verlassen: Sie sagt die Märkte nicht voraus, und wer das verspricht, verkauft etwas.`],
      [`Woran man leere Versprechen erkennt`, `Seien Sie misstrauisch, wenn jemand Einnahmen zeigt, ohne die Arbeit dahinter zu erklären, von „passivem Einkommen“ und einer „geheimen Methode“ spricht oder einen Kurs als einzigen Weg verkauft. Die Frage, die man sich stellen sollte, ist einfach: Verdient die Person, die mir das erzählt, ihr Geld mit dem Einsatz von KI oder mit dem Verkauf von Kursen darüber, wie man mit KI Geld verdient?`],
      [`Womit man anfängt`, `Mit Ihrem Beruf. Schreiben Sie die Tätigkeiten auf, die Sie am meisten Zeit kosten, und versuchen Sie, eine davon diese Woche mit KI zu erledigen. Wenn Sie nicht wissen, welches Werkzeug Sie wählen sollen, gibt es den <a href="../../confronto/de/">Vergleich der KI-Assistenten</a>; wenn Sie bei null anfangen, <a href="imparare-a-usare-intelligenza-artificiale.html">den Leitfaden für den Einstieg</a>. Die von Unternehmen am meisten gesuchten Rollen stehen im Bereich <a href="../../#job">KI-Jobs</a>.`]
    ],
    faq: [
      [`Kann man mit künstlicher Intelligenz Geld verdienen?`, `Ja, vor allem, indem man sie nutzt, um in einem Beruf, den man schon beherrscht, schneller zu arbeiten oder neue Leistungen anzubieten. Automatische Einnahmen ohne Fähigkeiten gibt es nicht.`],
      [`Wie nutzt man KI, um ohne Erfahrung Geld zu verdienen?`, `Ohne eine Fähigkeit, die man anbieten kann, ist es schwierig. Der realistische erste Schritt ist, sie in einem bestimmten Bereich gut nutzen zu lernen und dann diese Leistung anzubieten.`]
    ],
    sources: []
  },

  'intelligenza-artificiale-rischi-e-vantaggi': {
    title: `Künstliche Intelligenz: Risiken und Vorteile`,
    card: `Der konkrete Nutzen und die realen Risiken, auf derselben Waage.`,
    desc: `Künstliche Intelligenz: Risiken und Vorteile im Vergleich. Der Nutzen in Medizin, Arbeit und Alltag, die Risiken für Privatsphäre, Arbeit und Information und die Chancen, die sich bieten.`,
    lede: `Nach Risiken und Vorteilen der künstlichen Intelligenz wird fast immer gemeinsam gesucht, und das zu Recht: Es sind die zwei Seiten derselben Technologie. Hier eine Bilanz ohne Begeisterung und ohne Alarm.`,
    brief: [
      `Die solidesten Vorteile liegen in der wissenschaftlichen Forschung, der Medizin und der Produktivität.`,
      `Die konkretesten Risiken betreffen Fehler, Privatsphäre, Desinformation und Arbeit.`,
      `Fast jeder Vorteil hat ein entsprechendes Risiko: Es kommt darauf an, wie man sie nutzt.`
    ],
    sections: [
      [`Die Vorteile der künstlichen Intelligenz`, `In der <strong>Forschung</strong> beschleunigt sie Entdeckungen, die früher Jahre dauerten: Die Vorhersage der Form von Proteinen, 2024 mit dem Nobelpreis für Chemie ausgezeichnet, ist das bekannteste Beispiel. In der <strong>Medizin</strong> hilft sie, Untersuchungen und Bildaufnahmen auszuwerten und manche Krankheiten früher zu erkennen. Bei der <strong>Arbeit</strong> nimmt sie wiederkehrenden Aufgaben Zeit ab. Im <strong>Alltag</strong> übersetzt sie, fasst zusammen, erklärt und macht Inhalte für Menschen mit Seh- oder Hörbehinderung zugänglich.`],
      [`Die Risiken der künstlichen Intelligenz`, `Sie kann in sicherem Ton <strong>Fehler machen</strong>, und im Gesundheitswesen oder in der Justiz wiegt ein Fehler schwer. Sie kann <strong>Diskriminierung</strong> wiedergeben, die in den Daten steckt, mit denen sie trainiert wurde. Sie setzt die <strong>Privatsphäre</strong> unter Druck, weil sie mit großen Mengen personenbezogener Daten arbeitet. Sie macht es leicht, <strong>Desinformation</strong> und realistische Fälschungen zu erzeugen. Und sie verändert die <strong>Arbeit</strong> schneller, als sich viele Menschen anpassen können.`],
      [`Risiken und Chancen für die psychische Gesundheit`, `Das ist eine der Suchanfragen, die zunehmen. Chatbots sind immer verfügbar und urteilen nicht, und manche Menschen nutzen sie als erstes Ventil. Sie sind aber keine Therapeuten: Sie kennen die Person nicht, können in Krisenmomenten unpassende Antworten geben und Isolation fördern. Bei ernsthaften Problemen braucht es eine Fachperson.`],
      [`Die Bilanz`, `Dasselbe Werkzeug, das einem Arzt hilft, kann eine Diagnose falsch stellen; das, was einen Text übersetzt, kann einen Betrug verfassen. Das Ergebnis hängt von drei Dingen ab: den Regeln, der Qualität der Kontrollen und dem Bewusstsein derer, die es nutzen. Zum Weiterlesen: <a href="intelligenza-artificiale-e-pericolosa.html">Ist KI gefährlich?</a>, <a href="intelligenza-artificiale-e-affidabile.html">Ist KI zuverlässig?</a>, <a href="../../temi/de/ki-medizin-gesundheit.html">KI in der Medizin</a>.`]
    ],
    faq: [
      [`Welche Vorteile hat künstliche Intelligenz?`, `Sie beschleunigt die wissenschaftliche Forschung, unterstützt Ärzte und Fachleute, automatisiert wiederkehrende Aufgaben und macht Informationen und Dienste zugänglicher.`],
      [`Welche Risiken hat künstliche Intelligenz?`, `Fehler, die als Gewissheiten präsentiert werden, Diskriminierung, Verletzungen der Privatsphäre, Desinformation, Betrug und rasche Veränderungen der Arbeit.`]
    ],
    sources: []
  },

  'perche-intelligenza-artificiale-consuma-acqua-energia': {
    title: `Warum verbraucht künstliche Intelligenz Wasser und Energie?`,
    card: `Rechenzentren, Strom und Kühlung: wie stark KI die Umwelt wirklich belastet.`,
    desc: `Warum verbraucht künstliche Intelligenz Wasser und Strom? Wie Rechenzentren funktionieren, wie viel sie verbrauchen, warum KI die Umwelt belastet und wie sie beim Energiesparen helfen kann.`,
    lede: `„Warum verbraucht KI Wasser“ und „Warum belastet KI die Umwelt“ gehören zu den meistgesuchten Fragen. Die Antwort liegt in Gebäuden, die fast niemand sieht: den Rechenzentren.`,
    brief: [
      `KI läuft in Rechenzentren, die viel Strom verbrauchen.`,
      `Wasser dient zur Kühlung der Rechner, direkt oder über die Kraftwerke.`,
      `Die Auswirkungen hängen davon ab, mit welcher Energie die Anlagen betrieben werden.`
    ],
    sections: [
      [`Warum künstliche Intelligenz Strom verbraucht`, `Jede Antwort eines Chatbots ist das Ergebnis von Milliarden Rechenschritten, ausgeführt von sehr leistungsstarken Prozessoren, den <a href="../../glossario/de/#gpu">GPUs</a>, die in <a href="../../glossario/de/#data-center">Rechenzentren</a> stehen. Energie wird zu zwei Zeitpunkten benötigt: beim <a href="../../glossario/de/#addestramento">Training</a> der Modelle, das Wochen dauert, und bei der täglichen Nutzung, die pro Anfrage weniger verbraucht, sich aber milliardenfach wiederholt.`],
      [`Wie viel sie verbraucht`, `Nach Angaben der Internationalen Energieagentur verbrauchten Rechenzentren 2024 rund 1,5 % des weltweiten Stroms, und ihr Verbrauch könnte sich bis 2030 etwa verdoppeln, vor allem getrieben von KI. Wie viel eine einzelne Anfrage ausmacht, hängt vom Modell und von der Messmethode ab: Die kursierenden Zahlen sollte man immer zusammen mit der Quelle lesen.`],
      [`Warum KI Wasser verbraucht`, `Rechner erzeugen Wärme und müssen gekühlt werden. Viele Anlagen nutzen Wasserkühlung, wobei ein Teil des Wassers verdunstet. Weiteres Wasser wird indirekt verbraucht, von den Kraftwerken, die den Strom erzeugen. Die Menge schwankt stark je nach örtlichem Klima und Technik: Deshalb sind neue Rechenzentren dort, wo Wasser knapp ist, oft umstritten.`],
      [`Belastet KI die Umwelt?`, `Das hängt von der Energie ab, mit der sie betrieben wird. Ein Rechenzentrum, das an erneuerbare Quellen angeschlossen ist, hat eine ganz andere Wirkung als eines, das mit Gas oder Kohle läuft. Die großen Unternehmen schließen Verträge für Solar-, Wind- und Kernenergie ab, haben aber auch eingeräumt, dass KI es schwieriger macht, die eigenen Emissionsziele einzuhalten.`],
      [`Die Rolle der KI beim Energiesparen`, `Dieselbe Technologie wird eingesetzt, um die Erzeugung aus Sonne und Wind vorherzusagen, Stromnetze auszugleichen und Verschwendung in Gebäuden und Fabriken zu verringern. Ob die Bilanz am Ende positiv ausfällt, ist noch nicht entschieden. FAIND verfolgt das Thema täglich auf der Seite <a href="../../temi/de/ki-klima-umwelt.html">KI, Klima und Umwelt</a>.`]
    ],
    faq: [
      [`Warum verbraucht künstliche Intelligenz Wasser?`, `Weil die Rechner in Rechenzentren Wärme erzeugen und viele Anlagen sie mit Wasser kühlen. Weiteres Wasser verbrauchen die Kraftwerke, die den Strom erzeugen.`],
      [`Belastet die Nutzung von ChatGPT die Umwelt?`, `Jede Anfrage verbraucht wenig Energie, multipliziert mit Milliarden Nutzungen wird das aber erheblich. Die Wirkung hängt von der Effizienz des Rechenzentrums und von der Energiequelle ab.`]
    ],
    sources: [`Internationale Energieagentur (IEA), „Energy and AI“ (2025)`]
  },

  'intelligenza-artificiale-e-affidabile': {
    title: `Ist künstliche Intelligenz zuverlässig? Wann sie sich irren kann`,
    card: `Warum KI sich in sicherem Ton irrt und woran man erkennt, wann man ihr trauen kann.`,
    desc: `Ist künstliche Intelligenz zuverlässig und sicher? Warum sie sich irren kann, was Halluzinationen sind, wann man ihr trauen kann und wie man die Antworten von ChatGPT, Claude und Gemini überprüft.`,
    lede: `„Ist künstliche Intelligenz zuverlässig?“ und „Kann sie sich irren?“ sind zwei der meistgesuchten Fragen. Die ehrliche Antwort: Für manches ist sie zuverlässig, für anderes nicht, und sie warnt nicht, wenn sie sich irrt.`,
    brief: [
      `KI kann Fakten, Daten und Zitate erfinden: Das nennt man Halluzinationen.`,
      `Sie ist zuverlässiger bei Texten, die Sie ihr geben, als bei Fakten, an die sie sich erinnern muss.`,
      `Die Überprüfung bleibt immer Sache dessen, der sie nutzt.`
    ],
    sections: [
      [`Warum sich künstliche Intelligenz irren kann`, `Ein Sprachmodell schlägt nicht in einem Faktenarchiv nach: Es erzeugt die plausibelste Antwort. Wenn es etwas nicht weiß, sagt es nicht „Ich weiß es nicht“: Es konstruiert eine glaubhafte Antwort. Das nennt man eine <a href="../../glossario/de/#allucinazione">Halluzination</a>. Der meistzitierte Fall betrifft Anwälte, die in den USA sanktioniert wurden, weil sie Schriftsätze mit nicht existierenden Präzedenzfällen eingereicht hatten, die ein Chatbot erfunden hatte.`],
      [`Wann sie zuverlässig ist`, `Sie funktioniert gut, wenn sie mit Material arbeitet, das Sie ihr geben: ein Dokument zusammenfassen, einen Text umschreiben, übersetzen, Notizen ordnen, ein bekanntes Konzept erklären. Besser funktioniert sie auch, wenn sie im Web sucht und Quellen nennt, weil Sie diese überprüfen können.`],
      [`Wann sie es nicht ist`, `Weniger zuverlässig ist sie bei Zahlen, Daten, Zitaten, Namen, Rechtsvorschriften, aktuellen Nachrichten und komplexen Berechnungen. Und bei allem, was Gesundheit, Geld und Rechtsfragen betrifft, wo ein Fehler Folgen hat: Dort kann sie beim Verstehen helfen, aber nicht beim Entscheiden.`],
      [`Ist künstliche Intelligenz sicher?`, `Sicherheit heißt auch Daten. Was Sie einem Chatbot schreiben, wird auf den Servern des Unternehmens verarbeitet und kann je nach Einstellung zur Verbesserung der Modelle verwendet werden. Besser gibt man keine personenbezogenen Daten anderer, keine vertraulichen Dokumente und keine Zugangsdaten ein und prüft die Datenschutzeinstellungen.`],
      [`Wie man eine Antwort überprüft`, `Fragen Sie nach den Quellen und öffnen Sie sie. Prüfen Sie Zahlen und Zitate auf einer offiziellen Website. Stellen Sie die Frage noch einmal anders oder einer anderen KI: Wenn sich die Antworten ändern, ist Zweifel angebracht. Und denken Sie daran, dass eine gut formulierte Antwort nicht unbedingt eine richtige ist.`]
    ],
    faq: [
      [`Kann sich künstliche Intelligenz irren?`, `Ja. Sie kann falsche Informationen erfinden und sie mit Sicherheit präsentieren, vor allem bei Fakten, Zahlen und Zitaten. Deshalb müssen die Antworten überprüft werden.`],
      [`Kann man ChatGPT vertrauen?`, `Beim Zusammenfassen, Umschreiben und Erklären ja, mit einer abschließenden Kontrolle. Für Entscheidungen zu Gesundheit, Geld und Rechtsfragen braucht es immer eine Fachperson.`]
    ],
    sources: []
  },

  'intelligenza-artificiale-gratis-o-a-pagamento': {
    title: `Ist künstliche Intelligenz kostenlos oder kostenpflichtig?`,
    card: `Was man ohne Bezahlung tun kann und wann sich ein Abo lohnt.`,
    desc: `Ist künstliche Intelligenz kostenlos oder kostenpflichtig? Was die Gratis-Tarife von ChatGPT, Claude und Gemini bieten, was die Abos kosten und wann sich das Bezahlen lohnt.`,
    lede: `Beides. Jeder große Assistent hat einen Gratis-Tarif und einen oder mehrere kostenpflichtige Tarife. Die nützliche Frage ist nicht, ob sie kostenlos ist, sondern was Ihnen entgeht, wenn Sie beim Gratis-Tarif bleiben.`,
    brief: [
      `ChatGPT, Claude, Gemini, Copilot und Perplexity haben alle einen Gratis-Tarif.`,
      `Der Standardtarif kostet fast überall rund 20 Dollar im Monat.`,
      `Bezahlen lohnt sich nur, wenn Sie oft an die Grenzen des Gratis-Tarifs stoßen.`
    ],
    sections: [
      [`Was man kostenlos tun kann`, `Viel: Texte schreiben und korrigieren, zusammenfassen, übersetzen, sich ein Thema erklären lassen, einige Bilder erzeugen. Die Grenzen betreffen die Zahl der Anfragen, den Zugang zu den leistungsstärksten Modellen und einige erweiterte Funktionen. Zum Lernen und für gelegentliche Nutzung reicht der Gratis-Tarif.`],
      [`Was die Abos kosten`, `Der Standardtarif kostet rund 20 Dollar im Monat: ChatGPT Plus, Claude Pro und Perplexity Pro 20, Google AI Pro und Microsoft 365 Premium 19,99. Es gibt günstigere Einstiege wie Google AI Plus für 4,99 und ChatGPT Go für 8 sowie Profi-Tarife von 100 bis 300 Dollar. Alle aktuellen Preise, vom teuersten bis zum günstigsten, stehen auf der Seite <a href="../../confronto/de/">KI-Assistenten im Vergleich</a>.`],
      [`Wann sich das Bezahlen lohnt`, `Wenn Sie KI täglich beruflich nutzen und der Gratis-Tarif Sie ausbremst, wenn Sie lange Dokumente oder viele Bilder brauchen, wenn Sie die neuesten Modelle wollen. Wenn Sie sie ein paar Mal pro Woche nutzen, ändert das Bezahlen fast nichts.`],
      [`Die kostenlosen Alternativen`, `Es gibt vollständig kostenlose Assistenten und <a href="../../glossario/de/#open-source">offene Modelle</a>, die man herunterladen und auf dem eigenen Rechner nutzen kann, ohne Abo und ohne Daten an irgendjemanden zu senden. Sie erfordern etwas mehr Übung und einen neueren Rechner; die offiziellen Links stehen im Bereich <a href="../../#guide">Anleitungen &amp; Downloads</a>.`],
      [`Vorsicht vor dem versteckten Preis`, `Kostenlos heißt nicht ohne Kosten: Manche Gratis-Tarife zeigen Werbung oder nutzen die Gespräche zur Verbesserung der Modelle, sofern man es nicht anders einstellt. Es lohnt sich zu lesen, womit man sich einverstanden erklärt.`]
    ],
    faq: [
      [`Ist künstliche Intelligenz kostenlos?`, `In der Basisversion ja: Alle großen Assistenten haben einen Gratis-Tarif mit Nutzungsgrenzen. Erweiterte Funktionen sind kostenpflichtig.`],
      [`Was kostet ChatGPT?`, `Es gibt einen Gratis-Tarif, ChatGPT Go für 8 Dollar im Monat, Plus für 20 und Pro-Tarife von 100 bis 200 Dollar. Die Preise können sich ändern: Sie werden auf der Vergleichsseite überprüft.`]
    ],
    sources: []
  },

  'leggi-intelligenza-artificiale-nel-mondo': {
    title: `Gesetze zur künstlichen Intelligenz weltweit`,
    card: `Europa, Italien, USA, China: wer KI reguliert und wie.`,
    desc: `Die Gesetze zur künstlichen Intelligenz weltweit: der europäische AI Act und seine Risikostufen, das italienische Gesetz, der Ansatz der USA, Chinas, des Vereinigten Königreichs und anderer Länder.`,
    lede: `Ein weltweites Gesetz zur künstlichen Intelligenz gibt es nicht. Es gibt unterschiedliche Ansätze: Europa reguliert nach Risiko, die USA setzen auf den Markt, China auf Kontrolle. Hier ist die Landkarte.`,
    brief: [
      `Die Europäische Union hat das weltweit erste umfassende Gesetz: den AI Act.`,
      `Italien hat ein eigenes nationales Gesetz, das das europäische ergänzt.`,
      `Die USA und China gehen sehr unterschiedliche Wege.`
    ],
    sections: [
      [`Europäische Union: der AI Act`, `Der <a href="../../glossario/de/#ai-act">AI Act</a> ist seit 2024 in Kraft und gilt stufenweise. Er stuft KI-Systeme nach Risiko ein: <strong>inakzeptabel</strong> (verboten, etwa die soziale Bewertung von Bürgern), <strong>hoch</strong> (erlaubt mit strengen Pflichten, zum Beispiel in Gesundheit, Arbeit, Bildung, Justiz), <strong>begrenzt</strong> (Transparenzpflichten, etwa der Hinweis, dass man mit einem Chatbot spricht oder dass ein Inhalt künstlich erzeugt ist) und <strong>minimal</strong> (keine Pflichten). Besondere Regeln gelten für große Modelle mit allgemeinem Verwendungszweck.`],
      [`Italien`, `Italien hat 2025 ein nationales Gesetz zur künstlichen Intelligenz verabschiedet, das die europäische Verordnung ergänzt: Es betrifft unter anderem Gesundheit, Arbeit, öffentliche Verwaltung, Justiz und Urheberrecht und führt Strafvorschriften gegen schädliche Deepfakes ein. Zuständige Behörden sind die Agentur für das digitale Italien und die Nationale Agentur für Cybersicherheit.`],
      [`USA`, `Ein umfassendes Bundesgesetz gibt es nicht. Die Regeln stammen aus Durchführungsverordnungen des Präsidenten, die sich mit den Regierungen ändern, von den Fachbehörden und aus den einzelnen Bundesstaaten, von denen einige eigene Gesetze verabschiedet haben. Die Grundausrichtung bevorzugt Innovation und den Wettbewerb mit China.`],
      [`China`, `China hat gezielte Regeln für einzelne Bereiche eingeführt: Empfehlungsalgorithmen, synthetische Inhalte und Dienste für generative KI, mit Pflichten zur Registrierung und zur Kennzeichnung erzeugter Inhalte. Die staatliche Kontrolle ist direkter als anderswo.`],
      [`Vereinigtes Königreich und andere Länder`, `Das Vereinigte Königreich hat sich bisher gegen ein einheitliches Gesetz entschieden und überlässt die Regeln den Fachbehörden. Japan und Südkorea haben Rahmengesetze verabschiedet, die auf die Förderung der Entwicklung ausgerichtet sind. International gibt es gemeinsame Grundsätze, etwa die der OECD, und ein Übereinkommen des Europarats über KI und Menschenrechte, aber keinen für alle verbindlichen Vertrag.`],
      [`Warum es auch Sie betrifft`, `Die europäischen Regeln gelten für alle, die KI-Dienste in der Union anbieten, auch wenn das Unternehmen seinen Sitz anderswo hat. Deshalb kommen manche Funktionen in Europa später an. Nachrichten zu Gesetzen und Regeln werden stündlich auf der FAIND-Startseite gesammelt, im Bereich „Recht &amp; Regulierung“.`]
    ],
    faq: [
      [`Gibt es in Italien ein Gesetz zur künstlichen Intelligenz?`, `Ja. Neben der europäischen KI-Verordnung (AI Act), die unmittelbar gilt, hat Italien 2025 ein nationales Gesetz zur künstlichen Intelligenz verabschiedet.`],
      [`Wie werden KI-Systeme nach dem AI Act eingestuft?`, `In vier Risikostufen: inakzeptabel (verboten), hoch (strenge Pflichten), begrenzt (Transparenzpflichten) und minimal (keine Pflichten).`]
    ],
    sources: [`Verordnung (EU) 2024/1689, „AI Act“`, `Italienisches Gesetz zur künstlichen Intelligenz (2025)`]
  },

  'come-riconoscere-audio-foto-video-intelligenza-artificiale': {
    title: `So erkennt man mit künstlicher Intelligenz erstellte Audios, Fotos und Videos`,
    card: `Worauf man achten und was man prüfen sollte, bevor man etwas glaubt oder teilt.`,
    desc: `So erkennt man ein mit künstlicher Intelligenz erzeugtes Foto, Video oder Audio: die sichtbaren und hörbaren Anzeichen, KI-Detektoren, die Überprüfung der Quellen und der Schutz vor Deepfakes.`,
    lede: `Mit KI erzeugte Inhalte sind mit bloßem Auge immer schwerer zu unterscheiden. Es gibt aber Anzeichen, nach denen man suchen kann, und vor allem Prüfungen, die auch dann funktionieren, wenn das Auge nicht mehr ausreicht.`,
    brief: [
      `Sichtbare Fehler werden mit jeder neuen Version weniger: Das Auge reicht nicht aus.`,
      `Die wirksamste Prüfung gilt der Quelle, nicht dem Bild.`,
      `Automatische Detektoren helfen, irren sich aber: Sie sind kein Beweis.`
    ],
    sections: [
      [`So erkennt man ein mit KI erstelltes Foto`, `Achten Sie auf die Details: Hände und Finger, Zähne, unterschiedliche Ohrringe, unleserliche Schrift im Hintergrund, unstimmige Schatten und Spiegelungen, zu glatte Haut, Gegenstände, die ineinander übergehen. Das sind nützliche Hinweise, doch neuere Modelle machen solche Fehler immer seltener.`],
      [`So erkennt man ein Video`, `Beobachten Sie, ob Lippen und Stimme synchron sind, den Lidschlag, die Ränder des Gesichts, wenn die Person den Kopf dreht, das Flimmern in Haaren und Hintergrund, Körperbewegungen, die nicht stimmig sind. Bei kurzen Videos mit niedriger Auflösung ist es schwieriger.`],
      [`So erkennt man ein mit KI erzeugtes Audio`, `Geklonte Stimmen klingen meist gleichförmig: wenig Variation im Ton, unnatürliche Pausen, kein Atmen, keine Hintergrundgeräusche. Das ist das Feld der Telefonbetrüger, die die Stimme eines Angehörigen nachahmen. Die beste Abwehr ist praktisch: auflegen und die Nummer zurückrufen, die Sie kennen, oder in der Familie ein Sicherheitswort vereinbaren.`],
      [`Die wirksamste Prüfung: die Quelle`, `Wer hat den Inhalt zuerst veröffentlicht? Berichten verlässliche Medien darüber? Mit der umgekehrten Bildersuche können Sie sehen, wo und wann ein Foto aufgetaucht ist. Wenn ein aufsehenerregender Inhalt nur auf einem unbekannten Profil existiert, ist Zweifel geboten.`],
      [`KI-Detektoren und Kennzeichnungen`, `Es gibt Werkzeuge, die einschätzen, ob ein Inhalt künstlich ist, aber sie liefern falsch positive und falsch negative Ergebnisse: Sie sind ein Hinweis, kein Beweis. Vielversprechender sind Kennzeichnungen an der Quelle: unsichtbare Wasserzeichen und „Content Credentials“, die festhalten, wie eine Datei entstanden ist. In Europa sieht der <a href="../../glossario/de/#ai-act">AI Act</a> die Pflicht vor, <a href="../../glossario/de/#deepfake">Deepfakes</a> zu kennzeichnen.`],
      [`Vor dem Teilen`, `Wenn ein Inhalt Sie wütend macht oder sehr überrascht, halten Sie einen Moment inne: Genau diese Wirkung will derjenige erzielen, der ihn hergestellt hat. Zu den weiterreichenden Risiken siehe <a href="intelligenza-artificiale-e-pericolosa.html">Ist künstliche Intelligenz gefährlich?</a>`]
    ],
    faq: [
      [`Woran erkennt man, ob ein Foto mit künstlicher Intelligenz erstellt wurde?`, `Prüfen Sie Hände, Schrift, Schatten und Spiegelungen, vor allem aber die Quelle mit einer umgekehrten Bildersuche: Sichtbare Fehler werden immer seltener.`],
      [`Sind KI-Detektoren zuverlässig?`, `Nur zum Teil. Sie können sich in beide Richtungen irren und sollten daher als Hinweis zusammen mit der Überprüfung der Quelle genutzt werden.`]
    ],
    sources: []
  }
};
