import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate Admin Role (Placeholder)
    // if (session.user.role !== 'ADMIN') ...

    const clubId = params.id;

    try {
        const info = db.prepare("UPDATE clubs SET status = 'ACTIVE' WHERE id = ?").run(clubId);

        if (info.changes === 0) return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });

        // Log Audit
        db.prepare("INSERT INTO audit_logs (admin_id, action, target_id, details) VALUES (?, 'APPROVE_CLUB', ?, 'Club Approved')")
            .run(session.user.id, clubId);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'ACTION_FAILED' }, { status: 500 });
    }
}
