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
      role TEXT DEFAULT 'USER', -- NEW Phase 2A
      status TEXT DEFAULT 'ACTIVE', -- NEW Phase 2A
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ... challenges ...

    -- ... attempts ...

    -- ... messages ...

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      reported_user_id INTEGER,
      message_id INTEGER,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(reporter_id) REFERENCES users(id),
      FOREIGN KEY(reported_user_id) REFERENCES users(id),
      FOREIGN KEY(message_id) REFERENCES messages(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_id INTEGER,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES users(id)
    );
  `;

  db.exec(initScript);
  console.log('Database Initialized: traida.db');
}

// Auto-initialize on import is causing locks during parallel build
// Run 'npm run db:init' to setup tables
// try {
//    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
//    const table = stmt.get();
//    if (!table) {
//        initDB();
//    }
// } catch (err) {
//     console.error("DB Init Error:", err);
// }
