import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // Optional: Refresh user data from DB to get latest coins/streaks
    // Use session.user.id
    const stmt = db.prepare('SELECT id, username, coins, sp_coins, archetype_id, current_streak FROM users WHERE id = ?');
    const user = stmt.get(session.user.id);

    if (!user) {
        return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
}
