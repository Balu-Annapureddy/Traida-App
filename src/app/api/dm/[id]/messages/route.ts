import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SocialUtils } from '@/lib/social';

// GET Messages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = params.id;

    // Verify Access
    // Room users are user_id_1 and user_id_2.
    const room = db.prepare('SELECT user_id_1, user_id_2 FROM dm_rooms WHERE id = ?').get(roomId) as any;
    if (!room) return NextResponse.json({ error: 'ROOM_NOT_FOUND' }, { status: 404 });

    if (room.user_id_1 !== session.user.id && room.user_id_2 !== session.user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const messages = db.prepare(`
        SELECT m.id, m.content, m.timestamp, m.sender_id, u.username
        FROM dm_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.room_id = ?
        ORDER BY m.timestamp ASC
        LIMIT 50
    `).all(roomId);

    return NextResponse.json({ messages });
}

// POST Message
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const roomId = params.id;
    const { content } = await req.json();

    if (!content || !content.trim()) return NextResponse.json({ error: 'EMPTY_MSG' }, { status: 400 });

    const room = db.prepare('SELECT user_id_1, user_id_2 FROM dm_rooms WHERE id = ?').get(roomId) as any;
    if (!room) return NextResponse.json({ error: 'ROOM_NOT_FOUND' }, { status: 404 });

    if (room.user_id_1 !== session.user.id && room.user_id_2 !== session.user.id) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Check BLOCK status just in case (Hardening)
    const otherId = (room.user_id_1 === session.user.id) ? room.user_id_2 : room.user_id_1;
    const rel = SocialUtils.getRelationshipStatus(session.user.id, otherId);
    if (!rel || rel.status === 'BLOCKED') {
        return NextResponse.json({ error: 'CANNOT_SEND_BLOCKED' }, { status: 403 });
    }

    try {
        db.transaction(() => {
            // Insert Msg
            db.prepare('INSERT INTO dm_messages (room_id, sender_id, content) VALUES (?, ?, ?)').run(roomId, session.user.id, content.trim());

            // Update Room Activity
            db.prepare('UPDATE dm_rooms SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?').run(roomId);

            // Notify Recipient
            SocialUtils.sendNotification(otherId, 'DM', session.user.id, `New message from ${session.user.username}`);
        })();

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'SEND_FAILED' }, { status: 500 });
    }
}
