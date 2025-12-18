const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

console.log('Running Phase 2A Migration...');

try {
    // 1. Add Columns to Users
    // Check if column exists first to be safe (sqlite doesn't have IF NOT EXISTS for columns easily in one liner without check)
    const userColumns = db.prepare('PRAGMA table_info(users)').all();
    const hasRole = userColumns.some(c => c.name === 'role');
    const hasStatus = userColumns.some(c => c.name === 'status');

    if (!hasRole) {
        db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER'").run();
        console.log('Added role column.');
    }
    if (!hasStatus) {
        db.prepare("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'").run();
        console.log('Added status column.');
    }

    // 2. Create Reports Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      reported_user_id INTEGER, -- Optional, if reporting a profile
      message_id INTEGER,       -- Optional, if reporting a message
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING', -- PENDING, RESOLVED, DISMISSED
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(reporter_id) REFERENCES users(id),
      FOREIGN KEY(reported_user_id) REFERENCES users(id),
      FOREIGN KEY(message_id) REFERENCES messages(id)
    );
    `);
    console.log('Created reports table.');

    // 3. Create Audit Logs Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL, -- BAN_USER, MUTE_USER, RESOLVE_REPORT
      target_id INTEGER,    -- ID of thing being acted on
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES users(id)
    );
    `);
    console.log('Created audit_logs table.');

    console.log('Migration Complete.');

} catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
}
