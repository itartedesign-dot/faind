-- FAIND GAME — tabelle della classifica (Cloudflare D1)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  seed INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  ip TEXT NOT NULL,
  submitted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sessions_ip ON sessions (ip, created_at);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,                 -- stesso id della sessione: un solo punteggio per partita
  score INTEGER NOT NULL,
  delivered INTEGER NOT NULL,
  lost INTEGER NOT NULL,
  created_at INTEGER NOT NULL,         -- istante in cui il server ha registrato il risultato (decide i pari merito)
  week TEXT NOT NULL,                  -- lunedì della settimana (ora di Roma), YYYY-MM-DD
  initials TEXT,                       -- vuote finché il giocatore non le inserisce: senza non compare in classifica
  country TEXT
);
CREATE INDEX IF NOT EXISTS scores_all ON scores (initials, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS scores_week ON scores (week, score DESC, created_at ASC);
