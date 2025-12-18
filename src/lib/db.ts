import Database from 'better-sqlite3';
import path from 'path';

// TRAIDA - Phase 0: Database Setup
// Using a local SQLite file for MVP (Phase 1-3)

const dbPath = path.join(process.cwd(), 'traida.db');

export const db = new Database(dbPath, { 
//   verbose: console.log 
});

// Enforce WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize Schema
export function initDB() {
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

  db.exec(initScript);
  console.log('Database Initialized: traida.db');
}

// Auto-initialize on import (for now, in a real app might be explicit)
// Using a check to avoid re-init in hot reload if needed
try {
   const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
   const table = stmt.get();
   if (!table) {
       initDB();
   }
} catch (err) {
    console.error("DB Init Error:", err);
}
