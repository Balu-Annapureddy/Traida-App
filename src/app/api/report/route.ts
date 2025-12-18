import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { message_id, reason } = await req.json();

        if (!message_id || !reason) {
            return NextResponse.json({ error: 'Missing details' }, { status: 400 });
        }

        // Get reported message details to link user
        const message = db.prepare('SELECT user_id FROM messages WHERE id = ?').get(message_id) as any;
        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.user_id === session.user.id) {
            return NextResponse.json({ error: 'Cannot report self' }, { status: 400 });
        }

        db.prepare(`
            INSERT INTO reports (reporter_id, reported_user_id, message_id, reason, status)
            VALUES (?, ?, ?, ?, 'PENDING')
        `).run(session.user.id, message.user_id, message_id, reason.trim().substring(0, 200));

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error('Report error:', e);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
