const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

console.log('Running Phase 2B Migration...');

try {
    // 1. Create Amigos Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS amigos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id_1 INTEGER NOT NULL,
      user_id_2 INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, BLOCKED
      action_user_id INTEGER NOT NULL, -- Who initiated the last status
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id_1) REFERENCES users(id),
      FOREIGN KEY(user_id_2) REFERENCES users(id),
      UNIQUE(user_id_1, user_id_2)
    );
    `);
    console.log('Created amigos table.');

    // 2. Add room_type to Messages
    const messageColumns = db.prepare('PRAGMA table_info(messages)').all();
    const hasRoomType = messageColumns.some(c => c.name === 'room_type');

    if (!hasRoomType) {
        db.prepare("ALTER TABLE messages ADD COLUMN room_type TEXT DEFAULT 'CHALLENGE'").run();
        console.log('Added room_type column to messages.');
    }

    console.log('Migration Complete.');

} catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
}
