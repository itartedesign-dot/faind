/* FAIND LOST SIGNAL — configurazione.
   FAIND_LOST_LEVELS = numero di livelli della partita (15 mappe salvate; oltre quelle il gioco ne genera altre verificate). La classifica
   online vale solo con 15, perché è la partita che il server rifà.
   FAIND_LOST_API = indirizzo (https, senza barra finale) del server delle classifiche: il Worker di game-api/ (vedi game-api/README.md),
   che serve la classifica di Lost Signal alle rotte /lost/*. Se il server non risponde il gioco funziona lo stesso e il record resta
   sul dispositivo; con l'indirizzo vuoto la classifica online è dichiarata non disponibile. */
window.FAIND_LOST_LEVELS = 15;
window.FAIND_LOST_API = 'https://faind-game-api.faind.workers.dev';
