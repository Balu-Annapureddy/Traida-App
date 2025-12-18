import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Helper to normalize user IDs
function getPair(id1: number, id2: number) {
    return id1 < id2 ? [id1, id2] : [id2, id1];
}

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    const amigos = db.prepare(`
        SELECT a.id, a.status, a.action_user_id,
               u1.username as user1, u2.username as user2,
               u1.id as id1, u2.id as id2
        FROM amigos a
        JOIN users u1 ON a.user_id_1 = u1.id
        JOIN users u2 ON a.user_id_2 = u2.id
        WHERE a.user_id_1 = ? OR a.user_id_2 = ?
    `).all(userId, userId) as any[];

    const formatted = amigos.map(a => {
        const friendId = a.id1 === userId ? a.id2 : a.id1;
        const friendName = a.id1 === userId ? a.user2 : a.user1;
        return {
            id: a.id,
            status: a.status,
            friendId,
            friendName,
            isRequester: a.action_user_id === userId
        };
    });

    return NextResponse.json({
        friends: formatted.filter(f => f.status === 'ACCEPTED'),
        pending_received: formatted.filter(f => f.status === 'PENDING' && !f.isRequester),
        pending_sent: formatted.filter(f => f.status === 'PENDING' && f.isRequester)
    });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, targetUsername, amigoId } = await req.json();

    try {
        if (action === 'REQUEST') {
            const target = db.prepare('SELECT id FROM users WHERE username = ?').get(targetUsername) as any;
            if (!target) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
            if (target.id === session.user.id) return NextResponse.json({ error: 'CANNOT_ADD_SELF' }, { status: 400 });

            const [id1, id2] = getPair(session.user.id, target.id);

            // Check existing
            const existing = db.prepare('SELECT status FROM amigos WHERE user_id_1 = ? AND user_id_2 = ?').get(id1, id2) as any;
            if (existing) {
                if (existing.status === 'BLOCKED') return NextResponse.json({ error: 'BLOCKED' }, { status: 403 });
                if (existing.status === 'ACCEPTED') return NextResponse.json({ error: 'ALREADY_FRIENDS' }, { status: 400 });
                return NextResponse.json({ error: 'REQUEST_ALREADY_SENT' }, { status: 400 });
            }

            db.prepare(`
                INSERT INTO amigos (user_id_1, user_id_2, status, action_user_id) VALUES (?, ?, 'PENDING', ?)
            `).run(id1, id2, session.user.id);

            return NextResponse.json({ success: true });
        }

        if (action === 'ACCEPT' || action === 'REJECT' || action === 'BLOCK') {
            // For simplify, we assume amigoId is valid and relates to user.
            // In real app, verify user is part of this amigo tuple.
            const amigo = db.prepare('SELECT * FROM amigos WHERE id = ?').get(amigoId) as any;
            if (!amigo) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

            if (amigo.user_id_1 !== session.user.id && amigo.user_id_2 !== session.user.id) {
                return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
            }

            if (action === 'ACCEPT') {
                db.prepare('UPDATE amigos SET status = ?, action_user_id = ? WHERE id = ?').run('ACCEPTED', session.user.id, amigoId);
            } else if (action === 'REJECT') {
                db.prepare('DELETE FROM amigos WHERE id = ?').run(amigoId); // Just delete for reject
            } else if (action === 'BLOCK') {
                db.prepare('UPDATE amigos SET status = ?, action_user_id = ? WHERE id = ?').run('BLOCKED', session.user.id, amigoId);
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });

    } catch (e) {
        console.error("Amigo Action Error", e);
        return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
    }
}
