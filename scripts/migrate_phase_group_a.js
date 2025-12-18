const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('--- Phase Group A Migration (Social & Retention) ---');

try {
    // 1. Amigos Table
    // Stores friendships. user_id_1 should always be < user_id_2 for uniqueness logic, 
    // but the API will enforce sorting. The constraint ensures no duplicate pairs.
    console.log('Creating Table: amigos');
    db.exec(`
        CREATE TABLE IF NOT EXISTS amigos (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id_1 INTEGER NOT NULL,
             user_id_2 INTEGER NOT NULL,
             status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, BLOCKED
             action_user_id INTEGER NOT NULL, -- Who initiated the current status (Requestor/Blocker)
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id_1) REFERENCES users(id),
             FOREIGN KEY(user_id_2) REFERENCES users(id),
             UNIQUE(user_id_1, user_id_2)
        );
    `);

    // 2. DM Rooms Table
    // 1-on-1 Rooms. user_id_1 < user_id_2 enforced.
    console.log('Creating Table: dm_rooms');
    db.exec(`
        CREATE TABLE IF NOT EXISTS dm_rooms (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id_1 INTEGER NOT NULL,
             user_id_2 INTEGER NOT NULL,
             last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id_1) REFERENCES users(id),
             FOREIGN KEY(user_id_2) REFERENCES users(id),
             UNIQUE(user_id_1, user_id_2)
        );
    `);

    // 3. DM Messages Table
    console.log('Creating Table: dm_messages');
    db.exec(`
         CREATE TABLE IF NOT EXISTS dm_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(room_id) REFERENCES dm_rooms(id) ON DELETE CASCADE,
            FOREIGN KEY(sender_id) REFERENCES users(id)
         );
    `);

    // 4. Notifications Table
    console.log('Creating Table: notifications');
    db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             user_id INTEGER NOT NULL,
             type TEXT NOT NULL, -- AMIGO_REQ, DM, CLUB_INVITE, SYSTEM
             source_id INTEGER, -- UserID or ClubID depending on type
             message TEXT,
             is_read INTEGER DEFAULT 0,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Index for fast notification lookups
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);`);

    console.log('✅ Phase Group A Tables Created Successfully.');

} catch (err) {
    console.error('❌ Error creating tables:', err.message);
}

console.log('--- Migration Complete ---');
