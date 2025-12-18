import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password, email } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // Check existing user
        const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
        const existing = checkStmt.get(username);
        if (existing) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        // Insert new user
        const insertStmt = db.prepare(`
      INSERT INTO users (username, password_hash, email, coins, sp_coins)
      VALUES (?, ?, ?, 150, 3)
    `);

        // Using transaction for safety (optional for single insert but good practice)
        const info = insertStmt.run(username, hashedPassword, email || null);

        // Create session
        await createSession({
            id: info.lastInsertRowid as number,
            username,
        });

        return NextResponse.json({ success: true, userId: info.lastInsertRowid });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
