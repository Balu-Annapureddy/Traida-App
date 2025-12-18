import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = parseInt(params.id);

    // Gating: User must have attempted the challenge to see messages?
    // Phase 1 Rules: "Only users who attempted the challenge can join"
    const attempt = db.prepare('SELECT id FROM attempts WHERE user_id = ? AND challenge_id = ?').get(session.user.id, roomId);
    if (!attempt) {
        return NextResponse.json({ error: 'Forbidden: Complete challenge first' }, { status: 403 });
    }

    // Fetch last 50 messages
    const messages = db.prepare(`
    SELECT m.id, m.content, m.timestamp, u.username 
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.timestamp DESC
    LIMIT 50
  `).all(roomId);

    return NextResponse.json({ messages: messages.reverse() }); // Oldest first for chat UI
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = parseInt(params.id);
    const { content } = await req.json();

    if (!content || !content.trim()) {
        return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    const { checkRateLimit } = require('@/lib/rate-limit');
    if (!checkRateLimit('CHAT', session.user.id.toString())) {
        return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    // Verify access again
    // Verify access again
    const attempt = db.prepare('SELECT id FROM attempts WHERE user_id = ? AND challenge_id = ?').get(session.user.id, roomId);
    if (!attempt) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Phase 2A: Check User Status (Fresh)
    const user = db.prepare('SELECT status FROM users WHERE id = ?').get(session.user.id) as any;
    if (user && (user.status === 'BANNED' || user.status === 'MUTED')) {
        return NextResponse.json({ error: 'TRANSMISSION_BLOCKED' }, { status: 403 });
    }

    // Phase 2A: Profanity Filter
    const { scrubText } = require('@/lib/moderation'); // Dynamic require for simplicity in API route
    const cleanContent = scrubText(content.trim().substring(0, 500));

    // Insert message
    db.prepare(`
    INSERT INTO messages (room_id, user_id, content) VALUES (?, ?, ?)
  `).run(roomId, session.user.id, cleanContent);

    return NextResponse.json({ success: true });
}
