const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

console.log('Running Phase 2C Migration (Economy)...');

try {
    // 1. Create Transactions Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- EARN_CHALLENGE, SPEND_SHOP, etc.
      amount INTEGER NOT NULL, -- Positive or Negative
      currency TEXT DEFAULT 'COIN', -- COIN, SP_COIN
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    `);
    console.log('Created transactions table.');

    // 2. Create Inventory Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL, -- e.g. 'THEME_MATRIX'
      item_type TEXT NOT NULL, -- EMOJI, AVATAR, THEME
      rarity TEXT DEFAULT 'COMMON',
      acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    `);
    console.log('Created inventory table.');

    console.log('Migration Complete.');

} catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
}
