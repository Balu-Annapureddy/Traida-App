const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const initScript = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      
      -- Auth & OTP
      verified_at DATETIME,
      otp_secret TEXT,
      otp_expires_at DATETIME,

      -- Foundation Stats
      coins INTEGER DEFAULT 150,
      sp_coins INTEGER DEFAULT 3,
      traits_json TEXT DEFAULT '{}',
      archetype_id TEXT,
      
      -- Progress
      current_streak INTEGER DEFAULT 0,
      last_played_date TEXT,
      
      -- Liber Tracking
      liber_plays_today INTEGER DEFAULT 0,
      last_liber_reset DATETIME,

      role TEXT DEFAULT 'USER',
      status TEXT DEFAULT 'ACTIVE',
      last_username_change DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        date TEXT NOT NULL, -- YYYY-MM-DD
        data_json TEXT NOT NULL, -- The puzzle configuration
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        
        -- Logic Enforcement
        attempt_number INTEGER DEFAULT 1, -- 1 or 2
        score INTEGER DEFAULT 0,
        time_seconds INTEGER DEFAULT 0,
        success BOOLEAN DEFAULT 0,
        
        -- Acceptance
        accepted_at DATETIME, -- If NOT NULL, this is the official score
        
        -- Standard
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(challenge_id) REFERENCES challenges(id)
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        action TEXT NOT NULL,          -- "CREATE_CHALLENGE", "SCHEDULE_DAY", etc.
        target_id TEXT,                -- ID of created item or date
        details_json TEXT,             -- Snapshot of what changed
        ip_address TEXT,               -- Security trail
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(admin_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL, -- Can be challenge_id or other room types
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        room_type TEXT DEFAULT 'CHALLENGE',
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dm_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id_1 INTEGER NOT NULL,
        user_id_2 INTEGER NOT NULL,
        last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id_1) REFERENCES users(id),
        FOREIGN KEY(user_id_2) REFERENCES users(id),
        UNIQUE(user_id_1, user_id_2)
    );

    CREATE TABLE IF NOT EXISTS dm_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(room_id) REFERENCES dm_rooms(id),
        FOREIGN KEY(sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS amigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id_1 INTEGER NOT NULL,
        user_id_2 INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        action_user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id_1) REFERENCES users(id),
        FOREIGN KEY(user_id_2) REFERENCES users(id),
        UNIQUE(user_id_1, user_id_2)
    );

    CREATE TABLE IF NOT EXISTS clubs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        creator_id INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS club_members (
        club_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'MEMBER',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(club_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        reported_user_id INTEGER,
        message_id INTEGER,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        resolved_at DATETIME,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(reporter_id) REFERENCES users(id),
        FOREIGN KEY(reported_user_id) REFERENCES users(id),
        FOREIGN KEY(message_id) REFERENCES messages(id)
    );

`;

try {
    db.exec(initScript);
    console.log('Database Initialized Successfully (Standalone Script)');
} catch (error) {
    console.error('Failed to init DB:', error);
    process.exit(1);
}
