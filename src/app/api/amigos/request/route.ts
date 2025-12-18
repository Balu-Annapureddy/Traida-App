import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SocialUtils } from '@/lib/social';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUsername } = await req.json();

    if (!targetUsername || targetUsername === session.user.username) {
        return NextResponse.json({ error: 'INVALID_TARGET' }, { status: 400 });
    }

    // 1. Resolve Target User
    const target = db.prepare('SELECT id FROM users WHERE username = ?').get(targetUsername) as any;
    if (!target) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const userId1 = session.user.id;
    const userId2 = target.id;

    // 2. Check Rate Limit
    if (!SocialUtils.checkFriendRequestLimit(userId1)) {
        return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    // 3. Check Existing Relationship
    const { id1, id2 } = SocialUtils.getSortedPair(userId1, userId2);
    const existing = db.prepare('SELECT * FROM amigos WHERE user_id_1 = ? AND user_id_2 = ?').get(id1, id2) as any;

    if (existing) {
        if (existing.status === 'BLOCKED') {
            // If blocker is me -> I can unblock (via block endpoint), but cannot request? 
            // Actually, if I blocked them, I should unblock first. 
            // If they blocked me -> Silent fail or Error? "Cannot add user".
            // Hardening rule: "Prevents future requests".
            return NextResponse.json({ error: 'ACTION_FORBIDDEN' }, { status: 403 });
        }
        if (existing.status === 'ACCEPTED') {
            return NextResponse.json({ error: 'ALREADY_FRIENDS' }, { status: 400 });
        }
        if (existing.status === 'PENDING') {
            if (existing.action_user_id === userId1) {
                return NextResponse.json({ error: 'REQUEST_ALREADY_SENT' }, { status: 400 });
            } else {
                // They requested ME. Auto-accept? Or tell user to accept?
                // Better UX: Tell user to accept pending request.
                return NextResponse.json({ error: 'PENDING_REQUEST_FROM_USER' }, { status: 400 });
            }
        }
    }

    // 4. Create Request
    try {
        db.prepare(`
            INSERT INTO amigos (user_id_1, user_id_2, status, action_user_id)
            VALUES (?, ?, 'PENDING', ?)
        `).run(id1, id2, userId1);

        // 5. Notify Target
        SocialUtils.sendNotification(userId2, 'AMIGO_REQ', userId1, `${session.user.username} sent you an Amigo request.`);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'ACTION_FAILED' }, { status: 500 });
    }
}
