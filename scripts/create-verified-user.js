const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'traida.db');
const db = new Database(dbPath);

async function createVerifiedUser() {
    const username = 'sys_admin'; // Professional sounding bypass user
    const password = 'password123';
    const email = 'admin@system.local';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Delete if exists to ensure clean slate
        db.prepare('DELETE FROM users WHERE username = ?').run(username);

        const stmt = db.prepare(`
            INSERT INTO users (
                username, 
                email, 
                password_hash, 
                verified_at, 
                role, 
                status, 
                coins, 
                sp_coins,
                otp_secret,
                otp_expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // verified_at is set to current time, bypassing email check
        // role is ADMIN to ensure access to everything
        stmt.run(
            username,
            email,
            hashedPassword,
            Date.now(),
            'ADMIN',
            'ACTIVE',
            9999,
            99,
            'MANUAL_OVERRIDE',
            Date.now()
        );

        console.log(`SUCCESS: User '${username}' created.`);
        console.log(`Credentials: ${username} / ${password}`);

    } catch (error) {
        console.error('FAILED to create user:', error);
    }
}

createVerifiedUser();
