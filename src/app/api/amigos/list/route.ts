import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Fetch all relationships
    const rows = db.prepare(`
        SELECT a.*, 
               u1.username as u1_name, u2.username as u2_name
        FROM amigos a
        JOIN users u1 ON a.user_id_1 = u1.id
        JOIN users u2 ON a.user_id_2 = u2.id
        WHERE a.user_id_1 = ? OR a.user_id_2 = ?
    `).all(userId, userId) as any[];

    const friends: any[] = [];
    const incoming: any[] = [];
    const outgoing: any[] = [];
    const blocked: any[] = []; // Only ones *I* blocked

    for (const r of rows) {
        // Determine "Other" user
        const isUser1 = r.user_id_1 === userId;
        const otherId = isUser1 ? r.user_id_2 : r.user_id_1;
        const otherName = isUser1 ? r.u2_name : r.u1_name;

        const item = {
            id: r.id, // Relationship ID (for respond/block)
            userId: otherId,
            username: otherName,
            status: r.status,
            createdAt: r.created_at
        };

        if (r.status === 'ACCEPTED') {
            friends.push(item);
        } else if (r.status === 'PENDING') {
            if (r.action_user_id === userId) {
                outgoing.push(item);
            } else {
                incoming.push(item);
            }
        } else if (r.status === 'BLOCKED') {
            if (r.action_user_id === userId) {
                blocked.push(item);
            }
            // If I was blocked (action_user_id != me), I don't see it in list generally.
        }
    }

    return NextResponse.json({ friends, incoming, outgoing, blocked });
}
