import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const includeRead = searchParams.get('all') === 'true';

    // 1. Prune Old (>30 days)
    // Ideally this is a cron, but we can do lazy delete on fetch for MVP.
    // "Auto-expire after 30 days"
    db.prepare("DELETE FROM notifications WHERE created_at < date('now', '-30 days')").run();

    // 2. Fetch
    let query = "SELECT * FROM notifications WHERE user_id = ?";
    if (!includeRead) {
        query += " AND is_read = 0";
    }
    query += " ORDER BY created_at DESC LIMIT 20";

    const notifications = db.prepare(query).all(userId);

    // 3. Count Unread
    const unread = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any;

    return NextResponse.json({ notifications, unreadCount: unread.count });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, id } = await req.json();

    if (action === 'MARK_READ') {
        if (id === 'ALL') {
            db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(session.user.id);
        } else {
            db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, session.user.id);
        }
    }

    return NextResponse.json({ success: true });
}
