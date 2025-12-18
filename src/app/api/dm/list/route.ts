import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Fetch rooms sorted by activity
    const rooms = db.prepare(`
        SELECT r.*, 
               u1.username as u1_name, u2.username as u2_name
        FROM dm_rooms r
        JOIN users u1 ON r.user_id_1 = u1.id
        JOIN users u2 ON r.user_id_2 = u2.id
        WHERE r.user_id_1 = ? OR r.user_id_2 = ?
        ORDER BY r.last_activity_at DESC
    `).all(userId, userId) as any[];

    const inbox = rooms.map(r => {
        const isUser1 = r.user_id_1 === userId;
        return {
            id: r.id,
            partnerId: isUser1 ? r.user_id_2 : r.user_id_1,
            partnerName: isUser1 ? r.u2_name : r.u1_name,
            lastActivity: r.last_activity_at
        };
    });

    return NextResponse.json({ inbox });
}
