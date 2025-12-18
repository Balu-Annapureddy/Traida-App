const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('--- Phase Group CD Migration (Signals & Readiness) ---');

try {
    // 1. Signals Table
    // Stores private, optional user signals (e.g., "Focused", "Calm")
    console.log('Creating Table: signals');
    db.exec(`
        CREATE TABLE IF NOT EXISTS signals (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id INTEGER NOT NULL,
             type TEXT NOT NULL, -- 'DAILY', 'NOTE'
             content TEXT NOT NULL, -- 'FOCUSED', 'CALM', etc. or Note text
             context_id TEXT, -- Optional: Challenge ID or context
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // 2. System Config Table
    // Key-Value store for Admin Kill Switches and global settings
    console.log('Creating Table: system_config');
    db.exec(`
        CREATE TABLE IF NOT EXISTS system_config (
             key TEXT PRIMARY KEY,
             value TEXT NOT NULL, -- Stored as string, parse on read
             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Insert Default Configs (All features ENABLED by default, meaning DISABLED = false)
    const insertConfig = db.prepare('INSERT OR IGNORE INTO system_config (key, value) VALUES (?, ?)');
    insertConfig.run('DISABLE_SIGNUPS', 'false');
    insertConfig.run('DISABLE_CLUB_CREATION', 'false');
    insertConfig.run('DISABLE_DMS', 'false');

    console.log('✅ Phase Group CD Tables Created Successfully.');

} catch (err) {
    console.error('❌ Error creating tables:', err.message);
}

console.log('--- Migration Complete ---');
