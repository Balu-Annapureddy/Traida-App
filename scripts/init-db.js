const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const initScript = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password_hash TEXT,
      coins INTEGER DEFAULT 150,
      sp_coins INTEGER DEFAULT 3,
      traits_json TEXT DEFAULT '{}',
      archetype_id TEXT,
      current_streak INTEGER DEFAULT 0,
      last_played_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_active TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
      type TEXT NOT NULL,
      difficulty TEXT DEFAULT 'normal',
      content_json TEXT NOT NULL,
      solution TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      score INTEGER,
      time_taken_ms INTEGER,
      is_success BOOLEAN,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(challenge_id) REFERENCES challenges(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(room_id) REFERENCES challenges(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
`;

try {
    db.exec(initScript);
    console.log('Database Initialized Successfully (Standalone Script)');
} catch (error) {
    console.error('Failed to init DB:', error);
    process.exit(1);
}
