/* FAIND SIGNAL MAZE — configurazione della classifica online.
   FAIND_MAZE_API = indirizzo (https, senza barra finale) del server delle classifiche: il Worker di game-api/ (vedi game-api/README.md),
   che serve la classifica di Signal Maze alle rotte /maze/*. Se il server non risponde il gioco funziona lo stesso e il record
   resta sul dispositivo; con l'indirizzo vuoto la classifica online è dichiarata non disponibile. */
window.FAIND_MAZE_API = 'https://faind-game-api.faind.workers.dev';
