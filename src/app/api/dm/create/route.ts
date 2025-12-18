import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SocialUtils } from '@/lib/social';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: 'INVALID_TARGET' }, { status: 400 });

    // 1. Check Friendship
    const rel = SocialUtils.getRelationshipStatus(session.user.id, targetUserId);
    if (!rel || rel.status !== 'ACCEPTED') {
        return NextResponse.json({ error: 'NOT_FRIENDS' }, { status: 403 });
    }

    // 2. Get/Create Room
    const { id1, id2 } = SocialUtils.getSortedPair(session.user.id, targetUserId);

    let room = db.prepare('SELECT id FROM dm_rooms WHERE user_id_1 = ? AND user_id_2 = ?').get(id1, id2) as any;

    if (!room) {
        const info = db.prepare('INSERT INTO dm_rooms (user_id_1, user_id_2) VALUES (?, ?)').run(id1, id2);
        room = { id: info.lastInsertRowid };
    }

    return NextResponse.json({ roomId: room.id });
}
