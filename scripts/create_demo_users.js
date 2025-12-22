const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

async function seed() {
    console.log('Seeding Demo Users...');

    const userPass = await bcrypt.hash('password123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);
    const now = new Date().toISOString();

    // 1. Clear existing demo users if any to avoid uniqueness errors
    db.prepare("DELETE FROM users WHERE email IN ('demo@traida.com', 'admin@traida.com')").run();

    // 2. Insert Standard User
    const infoUser = db.prepare(`
        INSERT INTO users (username, email, password_hash, is_verified, verified_at, role, coins, sp_coins, traits_json)
        VALUES (?, ?, ?, 1, ?, 'USER', 10, 0, ?)
    `).run('DemoUser', 'demo@traida.com', userPass, now, JSON.stringify({ LOGIC: 5, SPEED: 3 }));

    console.log(`Created User: DemoUser (ID: ${infoUser.lastInsertRowid})`);

    // 3. Insert Admin User
    const infoAdmin = db.prepare(`
        INSERT INTO users (username, email, password_hash, is_verified, verified_at, role, coins, sp_coins)
        VALUES (?, ?, ?, 1, ?, 'ADMIN', 999, 999)
    `).run('SystemAdmin', 'admin@traida.com', adminPass, now);

    console.log(`Created Admin: SystemAdmin (ID: ${infoAdmin.lastInsertRowid})`);
}

seed();
