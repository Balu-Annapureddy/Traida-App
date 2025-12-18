import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET Messages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clubId = params.id;

    // Check Membership
    const member = db.prepare('SELECT role FROM club_members WHERE club_id = ? AND user_id = ?').get(clubId, session.user.id);
    if (!member) return NextResponse.json({ error: 'NOT_MEMBER' }, { status: 403 });

    const messages = db.prepare(`
        SELECT m.id, m.content, m.timestamp, u.username, m.user_id 
        FROM club_messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.club_id = ?
        ORDER BY m.timestamp ASC
        LIMIT 50
    `).all(clubId);

    return NextResponse.json({ messages });
}

// POST Message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clubId = params.id;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) return NextResponse.json({ error: 'EMPTY_MESSAGE' }, { status: 400 });

    // Check Membership
    const member = db.prepare('SELECT role FROM club_members WHERE club_id = ? AND user_id = ?').get(clubId, session.user.id);
    if (!member) return NextResponse.json({ error: 'NOT_MEMBER' }, { status: 403 });

    // Rate Limit (Simple in-memory or just proceed for MVP)
    // Reusing Global Chat limits logic would be ideal if abstracted. 
    // For now, simple insert.

    try {
        db.prepare('INSERT INTO club_messages (club_id, user_id, content) VALUES (?, ?, ?)')
            .run(clubId, session.user.id, content.trim());

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'SEND_FAILED' }, { status: 500 });
    }
}
