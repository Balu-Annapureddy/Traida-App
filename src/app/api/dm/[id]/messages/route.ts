import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { scrubText } from '@/lib/moderation';

// GET /api/dm/[amigo_id]/messages
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const amigoId = parseInt(params.id);

    // Verify Access: Is user part of this Amigo tuple?
    const amigo = db.prepare('SELECT user_id_1, user_id_2, status FROM amigos WHERE id = ?').get(amigoId) as any;
    if (!amigo) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    if (amigo.user_id_1 !== session.user.id && amigo.user_id_2 !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (amigo.status !== 'ACCEPTED') {
        return NextResponse.json({ messages: [], status: amigo.status }); // Can't chat if not accepted
    }

    // Fetch messages where room_id = amigoId AND room_type = 'DM'
    const messages = db.prepare(`
    SELECT m.id, m.content, m.timestamp, u.username 
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ? AND m.room_type = 'DM'
    ORDER BY m.timestamp DESC
    LIMIT 50
    `).all(amigoId);

    return NextResponse.json({ messages: messages.reverse(), status: 'ACTIVE' });
}

// POST /api/dm/[amigo_id]/messages
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const amigoId = parseInt(params.id);
    const { content } = await req.json();

    if (!content || !content.trim()) return NextResponse.json({ error: 'Empty' }, { status: 400 });

    // Rate Limit (reuse chat limit)
    if (!checkRateLimit('CHAT', session.user.id.toString())) {
        return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    // Verify Access
    const amigo = db.prepare('SELECT user_id_1, user_id_2, status FROM amigos WHERE id = ?').get(amigoId) as any;
    if (!amigo || (amigo.user_id_1 !== session.user.id && amigo.user_id_2 !== session.user.id)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (amigo.status !== 'ACCEPTED') {
        return NextResponse.json({ error: 'RELATIONSHIP_NOT_ACTIVE' }, { status: 400 });
    }

    // Check User Status (Ban/Mute)
    const user = db.prepare('SELECT status FROM users WHERE id = ?').get(session.user.id) as any;
    if (user && (user.status === 'BANNED' || user.status === 'MUTED')) {
        return NextResponse.json({ error: 'TRANSMISSION_BLOCKED' }, { status: 403 });
    }

    // Profanity Filter
    const cleanContent = scrubText(content.trim().substring(0, 500));

    // Insert Message (room_type = 'DM')
    db.prepare(`
        INSERT INTO messages (room_id, user_id, content, room_type) 
        VALUES (?, ?, ?, 'DM')
    `).run(amigoId, session.user.id, cleanContent);

    return NextResponse.json({ success: true });
}
