import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const { checkRateLimit } = require('@/lib/rate-limit');
        // Use username or IP as identifier. For MVP, username is safer for logic, but IP is better for security. 
        // Next.js request IP is tricky in dev. Let's use username for now as it's passed in body.
        if (!checkRateLimit('LOGIN', username)) {
            return NextResponse.json({ error: 'TOO_MANY_ATTEMPTS' }, { status: 429 });
        }

        // Fetch user
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username) as any;

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check pass
        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (user.status === 'BANNED') {
            return NextResponse.json({ error: 'ACCOUNT_SUSPENDED' }, { status: 403 });
        }

        // Create session
        await createSession({
            id: user.id,
            username: user.username,
            archetype_id: user.archetype_id
        });

        return NextResponse.json({ success: true, user: { username: user.username, coins: user.coins } });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
