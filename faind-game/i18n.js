/* FAIND GAME — testi nelle quattro lingue del sito (it, en, fr, de).
   La lingua è quella scelta sul sito (localStorage 'faind-lang'), altrimenti quella del browser; l'inglese è la base. */
const S = {
  en: {
    pageTitle: 'FAIND GAME – News Rush, the free AI newsroom arcade game',
    start: 'START', tagline: 'Catch the news. Deliver it to the newsroom.',
    howto: 'Move Faindo left and right to catch the falling news scrolls. Fly over the central hatch to deliver them to the newsroom. 180 seconds, 5 levels: the more you play, the less Faindo can carry. Drop three scrolls and it is game over. Avoid the red editions: catching one counts as a lost scroll. A mechanical arm sometimes offers an extra scroll: grab it before it retracts.',
    leaderboard: 'LEADERBOARD', soundOn: 'Sound on', soundOff: 'Sound off', pause: 'Pause', resume: 'RESUME', restart: 'RESTART', home: 'HOME',
    paused: 'PAUSED', pausedAuto: 'Paused while you were away.', score: 'SCORE', level: 'LEVEL', load: 'LOAD', full: 'FULL', time: 'Time',
    levelUp: 'LEVEL {n}', capacity: 'CAPACITY {n}', go: 'GO!', left: 'Move left', right: 'Move right', dragHint: 'CATCH THE NEWS · DELIVER TO THE NEWSROOM',
    keysHint: '← → or A D to move · P or Esc to pause', backToSite: 'Back to FAIND home',
    gameOver: 'TIME UP', gameOverLost: 'GAME OVER', missed: 'MISSED {n}/3', finalScore: 'FINAL SCORE', delivered: 'Delivered', lost: 'Lost', best: 'Your best', newBest: 'NEW PERSONAL BEST!',
    playAgain: 'PLAY AGAIN', share: 'SHARE SCORE', news: "TODAY'S AI NEWS", copyLink: 'Copy link', copied: 'Link copied',
    shareMsg: 'I scored {score} points in FAIND News Rush! Can you beat me?',
    top10: 'You made the Top 10!', topWeekly: 'Weekly Top 10 · #{n}', topAll: 'All-time Top 10 · #{n}',
    enterName: 'Enter your 3 letters and choose your country', initials: 'Initials', country: 'Country', chooseCountry: 'Choose your country', save: 'SAVE', saved: 'Saved! See you on the leaderboard.',
    skip: 'Skip', weekly: 'THIS WEEK', allTime: 'ALL TIME', close: 'Close', rank: '#', empty: 'No scores yet. Be the first!',
    loading: 'Loading…', retry: 'Retry', netError: 'Could not reach the leaderboard. Check your connection and try again.',
    offline: 'The online leaderboard is not available right now. You can still play: your best score is saved on this device.',
    offlineShort: 'Online leaderboard not available', resultOffline: 'Online leaderboard not available: score not submitted.',
    weekNote: 'The week runs from Monday 00:00 to Sunday, Rome time.', verifying: 'Verifying your score…', rejected: 'The server could not verify this game, so it was not ranked.',
    nameBad: 'Please use exactly three letters A–Z.', searchCountry: 'Search country', fullscreen: 'Fullscreen'
  },
  it: {
    pageTitle: 'FAIND GAME – News Rush, il gioco arcade gratuito della redazione AI',
    start: 'START', tagline: 'Cattura le notizie. Portale in redazione.',
    howto: 'Muovi Faindo a destra e a sinistra per afferrare i rotoli di notizie che cadono. Passa sulla bocchetta centrale per consegnarli in redazione. 180 secondi, 5 livelli: più si avanza, meno Faindo riesce a portare. Al terzo rotolo perso è game over. Evita le edizioni rosse: prenderne una vale come un rotolo perso. Ogni tanto un braccio meccanico porge un rotolo in più: prendilo prima che si ritragga.',
    leaderboard: 'CLASSIFICA', soundOn: 'Audio acceso', soundOff: 'Audio spento', pause: 'Pausa', resume: 'RIPRENDI', restart: 'RICOMINCIA', home: 'HOME',
    paused: 'IN PAUSA', pausedAuto: 'Messo in pausa mentre eri via.', score: 'PUNTI', level: 'LIVELLO', load: 'CARICO', full: 'PIENO', time: 'Tempo',
    levelUp: 'LIVELLO {n}', capacity: 'CAPACITÀ {n}', go: 'VIA!', left: 'Vai a sinistra', right: 'Vai a destra', dragHint: 'CATTURA LE NOTIZIE · PORTALE IN REDAZIONE',
    keysHint: '← → oppure A D per muoverti · P o Esc per la pausa', backToSite: 'Torna alla home di FAIND',
    gameOver: 'TEMPO SCADUTO', gameOverLost: 'GAME OVER', missed: 'PERSI {n}/3', finalScore: 'PUNTEGGIO FINALE', delivered: 'Consegnate', lost: 'Perse', best: 'Il tuo record', newBest: 'NUOVO RECORD PERSONALE!',
    playAgain: 'RIGIOCA', share: 'CONDIVIDI', news: 'NOTIZIE AI DI OGGI', copyLink: 'Copia link', copied: 'Link copiato',
    shareMsg: 'Ho fatto {score} punti a FAIND News Rush! Riesci a battermi?',
    top10: 'Sei nella Top 10!', topWeekly: 'Top 10 settimanale · n. {n}', topAll: 'Top 10 assoluta · n. {n}',
    enterName: 'Scrivi le tue 3 lettere e scegli la nazione', initials: 'Iniziali', country: 'Nazione', chooseCountry: 'Scegli la nazione', save: 'SALVA', saved: 'Salvato! Ci vediamo in classifica.',
    skip: 'Salta', weekly: 'SETTIMANA', allTime: 'ASSOLUTA', close: 'Chiudi', rank: 'n.', empty: 'Ancora nessun punteggio. Sii il primo!',
    loading: 'Caricamento…', retry: 'Riprova', netError: 'Non riesco a raggiungere la classifica. Controlla la connessione e riprova.',
    offline: 'La classifica online al momento non è disponibile. Puoi giocare lo stesso: il tuo record resta salvato su questo dispositivo.',
    offlineShort: 'Classifica online non disponibile', resultOffline: 'Classifica online non disponibile: punteggio non inviato.',
    weekNote: 'La settimana va dal lunedì alle 00:00 alla domenica, ora di Roma.', verifying: 'Verifico il punteggio…', rejected: 'Il server non ha potuto verificare questa partita, quindi non è in classifica.',
    nameBad: 'Usa esattamente tre lettere A–Z.', searchCountry: 'Cerca nazione', fullscreen: 'Schermo intero'
  },
  fr: {
    pageTitle: "FAIND GAME – News Rush, le jeu d'arcade gratuit de la rédaction IA",
    start: 'START', tagline: 'Attrape les infos. Livre-les à la rédaction.',
    howto: "Déplace Faindo à gauche et à droite pour attraper les rouleaux d'actualité qui tombent. Passe sur la trappe centrale pour les livrer à la rédaction. 180 secondes, 5 niveaux : plus tu avances, moins Faindo peut porter. Au troisième rouleau perdu, c'est game over. Évite les éditions rouges : en attraper une compte comme un rouleau perdu. Un bras mécanique tend parfois un rouleau en plus : attrape-le avant qu'il ne se rétracte.",
    leaderboard: 'CLASSEMENT', soundOn: 'Son activé', soundOff: 'Son coupé', pause: 'Pause', resume: 'REPRENDRE', restart: 'RECOMMENCER', home: 'ACCUEIL',
    paused: 'EN PAUSE', pausedAuto: 'Mis en pause pendant ton absence.', score: 'SCORE', level: 'NIVEAU', load: 'CHARGE', full: 'PLEIN', time: 'Temps',
    levelUp: 'NIVEAU {n}', capacity: 'CAPACITÉ {n}', go: 'GO !', left: 'Aller à gauche', right: 'Aller à droite', dragHint: 'ATTRAPE LES INFOS · LIVRE-LES À LA RÉDACTION',
    keysHint: '← → ou A D pour bouger · P ou Échap pour la pause', backToSite: "Retour à l'accueil de FAIND",
    gameOver: 'TEMPS ÉCOULÉ', gameOverLost: 'GAME OVER', missed: 'PERDUS {n}/3', finalScore: 'SCORE FINAL', delivered: 'Livrées', lost: 'Perdues', best: 'Ton record', newBest: 'NOUVEAU RECORD PERSONNEL !',
    playAgain: 'REJOUER', share: 'PARTAGER', news: "ACTUS IA DU JOUR", copyLink: 'Copier le lien', copied: 'Lien copié',
    shareMsg: "J'ai marqué {score} points à FAIND News Rush ! Tu peux me battre ?",
    top10: 'Tu es dans le Top 10 !', topWeekly: 'Top 10 de la semaine · n° {n}', topAll: 'Top 10 de tous les temps · n° {n}',
    enterName: 'Entre tes 3 lettres et choisis ton pays', initials: 'Initiales', country: 'Pays', chooseCountry: 'Choisis ton pays', save: 'ENREGISTRER', saved: 'Enregistré ! À bientôt au classement.',
    skip: 'Passer', weekly: 'SEMAINE', allTime: 'TOUS TEMPS', close: 'Fermer', rank: 'n°', empty: "Pas encore de score. Sois le premier !",
    loading: 'Chargement…', retry: 'Réessayer', netError: 'Impossible de joindre le classement. Vérifie ta connexion et réessaie.',
    offline: "Le classement en ligne n'est pas disponible pour le moment. Tu peux quand même jouer : ton record reste enregistré sur cet appareil.",
    offlineShort: 'Classement en ligne indisponible', resultOffline: 'Classement en ligne indisponible : score non envoyé.',
    weekNote: "La semaine va du lundi 00h00 au dimanche, heure de Rome.", verifying: 'Vérification du score…', rejected: "Le serveur n'a pas pu vérifier cette partie : elle n'est pas classée.",
    nameBad: 'Utilise exactement trois lettres A–Z.', searchCountry: 'Chercher un pays', fullscreen: 'Plein écran'
  },
  de: {
    pageTitle: 'FAIND GAME – News Rush, das kostenlose Arcade-Spiel der KI-Redaktion',
    start: 'START', tagline: 'Fang die News. Bring sie in die Redaktion.',
    howto: 'Bewege Faindo nach links und rechts und fang die fallenden Nachrichtenrollen. Fahr über die mittlere Luke, um sie in der Redaktion abzuliefern. 180 Sekunden, 5 Level: je weiter du kommst, desto weniger kann Faindo tragen. Bei der dritten verlorenen Rolle ist Game over. Meide die roten Ausgaben: eine zu fangen zählt wie eine verlorene Rolle. Ein Roboterarm reicht manchmal eine Extra-Rolle: schnapp sie dir, bevor er sich zurückzieht.',
    leaderboard: 'BESTENLISTE', soundOn: 'Ton an', soundOff: 'Ton aus', pause: 'Pause', resume: 'WEITER', restart: 'NEUSTART', home: 'HOME',
    paused: 'PAUSE', pausedAuto: 'Pausiert, während du weg warst.', score: 'PUNKTE', level: 'LEVEL', load: 'LADUNG', full: 'VOLL', time: 'Zeit',
    levelUp: 'LEVEL {n}', capacity: 'KAPAZITÄT {n}', go: 'LOS!', left: 'Nach links', right: 'Nach rechts', dragHint: 'FANG DIE NEWS · BRING SIE IN DIE REDAKTION',
    keysHint: '← → oder A D zum Bewegen · P oder Esc für Pause', backToSite: 'Zurück zur FAIND-Startseite',
    gameOver: 'ZEIT ABGELAUFEN', gameOverLost: 'GAME OVER', missed: 'VERLOREN {n}/3', finalScore: 'ENDPUNKTZAHL', delivered: 'Geliefert', lost: 'Verloren', best: 'Dein Rekord', newBest: 'NEUER PERSÖNLICHER REKORD!',
    playAgain: 'NOCH MAL', share: 'TEILEN', news: 'KI-NEWS VON HEUTE', copyLink: 'Link kopieren', copied: 'Link kopiert',
    shareMsg: 'Ich habe {score} Punkte bei FAIND News Rush! Schaffst du mehr?',
    top10: 'Du bist in den Top 10!', topWeekly: 'Wochen-Top-10 · Platz {n}', topAll: 'Ewige Top 10 · Platz {n}',
    enterName: 'Gib deine 3 Buchstaben ein und wähle dein Land', initials: 'Initialen', country: 'Land', chooseCountry: 'Wähle dein Land', save: 'SPEICHERN', saved: 'Gespeichert! Wir sehen uns in der Bestenliste.',
    skip: 'Überspringen', weekly: 'DIESE WOCHE', allTime: 'ALLE ZEITEN', close: 'Schließen', rank: 'Nr.', empty: 'Noch keine Punkte. Sei der Erste!',
    loading: 'Lädt…', retry: 'Nochmal', netError: 'Die Bestenliste ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.',
    offline: 'Die Online-Bestenliste ist gerade nicht verfügbar. Du kannst trotzdem spielen: dein Rekord bleibt auf diesem Gerät gespeichert.',
    offlineShort: 'Online-Bestenliste nicht verfügbar', resultOffline: 'Online-Bestenliste nicht verfügbar: Punktzahl nicht gesendet.',
    weekNote: 'Die Woche läuft von Montag 00:00 bis Sonntag, Rom-Zeit.', verifying: 'Punktzahl wird geprüft…', rejected: 'Der Server konnte dieses Spiel nicht prüfen, daher wurde es nicht gewertet.',
    nameBad: 'Bitte genau drei Buchstaben A–Z.', searchCountry: 'Land suchen', fullscreen: 'Vollbild'
  }
};

export function pickLang() {
  let s = null;
  try { s = localStorage.getItem('faind-lang'); } catch (e) {}
  if (s && S[s]) return s;
  const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return S[n] ? n : 'en';
}

export function makeT(lang) {
  const d = S[lang] || S.en;
  return (k, vars) => {
    let v = d[k] != null ? d[k] : (S.en[k] != null ? S.en[k] : k);
    if (vars) for (const x in vars) v = v.replace('{' + x + '}', vars[x]);
    return v;
  };
}
export const LANGS = Object.keys(S);
