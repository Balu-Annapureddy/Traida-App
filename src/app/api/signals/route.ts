import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, content, contextId } = await req.json();

    if (!['DAILY', 'NOTE'].includes(type)) {
        return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 });
    }

    try {
        db.prepare(`
            INSERT INTO signals (user_id, type, content, context_id)
            VALUES (?, ?, ?, ?)
        `).run(session.user.id, type, content, contextId);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'FAILED' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch last 10 signals
    const signals = db.prepare('SELECT * FROM signals WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(session.user.id);
    return NextResponse.json({ signals });
}
