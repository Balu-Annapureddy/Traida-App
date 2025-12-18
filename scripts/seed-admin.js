const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

async function seedAdmin() {
    console.log('Seeding Admin User...');

    // Check if admin exists
    const admin = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").get();
    if (admin) {
        console.log('Admin already exists. Skipped.');
        return;
    }

    const username = 'sysadmin';
    const password = 'secure_admin_password_123'; // Change in prod
    const hash = await bcrypt.hash(password, 10);

    try {
        db.prepare(`
            INSERT INTO users (username, password_hash, role, status, coins, sp_coins)
            VALUES (?, ?, 'ADMIN', 'ACTIVE', 9999, 999)
        `).run(username, hash);

        console.log(`Admin created. Username: ${username}, Password: ${password}`);
    } catch (e) {
        console.error('Failed to create admin:', e);
    }
}

seedAdmin();
