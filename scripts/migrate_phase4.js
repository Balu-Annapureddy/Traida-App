const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('--- Phase 4A Migration (Clubs Schema) ---');

try {
    // 1. Clubs Table
    console.log('Creating Table: clubs');
    db.exec(`
        CREATE TABLE IF NOT EXISTS clubs (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT UNIQUE NOT NULL,
             description TEXT,
             creator_id INTEGER NOT NULL,
             is_private INTEGER DEFAULT 0,
             status TEXT DEFAULT 'PENDING',
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(creator_id) REFERENCES users(id)
        );
    `);

    // 2. Club Members Table
    console.log('Creating Table: club_members');
    db.exec(`
        CREATE TABLE IF NOT EXISTS club_members (
             club_id INTEGER NOT NULL,
             user_id INTEGER NOT NULL,
             role TEXT DEFAULT 'MEMBER',
             joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(club_id) REFERENCES clubs(id),
             FOREIGN KEY(user_id) REFERENCES users(id),
             UNIQUE(club_id, user_id)
        );
    `);

    // 3. Club Join Requests Table
    console.log('Creating Table: club_join_requests');
    db.exec(`
        CREATE TABLE IF NOT EXISTS club_join_requests (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             club_id INTEGER NOT NULL,
             user_id INTEGER NOT NULL,
             status TEXT DEFAULT 'PENDING',
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY(club_id) REFERENCES clubs(id),
             FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // 4. Club Messages Table
    console.log('Creating Table: club_messages');
    db.exec(`
         CREATE TABLE IF NOT EXISTS club_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(club_id) REFERENCES clubs(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
         );
    `);

    console.log('✅ Phase 4 Tables Created Successfully.');

} catch (err) {
    console.error('❌ Error creating tables:', err.message);
}

console.log('--- Migration Complete ---');
