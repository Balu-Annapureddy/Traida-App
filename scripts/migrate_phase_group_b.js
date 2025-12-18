const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('--- Phase Group B Migration (Insights & Reflection) ---');

try {
    // 1. Trait Snapshots Table
    // Stores historical trait values for comparison (Last Month vs Now)
    console.log('Creating Table: trait_snapshots');
    db.exec(`
        CREATE TABLE IF NOT EXISTS trait_snapshots (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id INTEGER NOT NULL,
             traits_json TEXT NOT NULL, -- JSON string of current traits
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // 2. Weekly Reflections Table
    // Stores the generated "Sunday Letter"
    console.log('Creating Table: weekly_reflections');
    db.exec(`
        CREATE TABLE IF NOT EXISTS weekly_reflections (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id INTEGER NOT NULL,
             week_start_date TEXT NOT NULL, -- ISO Date string (e.g., 2025-12-15) identifying the week
             content TEXT NOT NULL,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id) REFERENCES users(id),
             UNIQUE(user_id, week_start_date)
        );
    `);

    console.log('✅ Phase Group B Tables Created Successfully.');

} catch (err) {
    console.error('❌ Error creating tables:', err.message);
}

console.log('--- Migration Complete ---');
