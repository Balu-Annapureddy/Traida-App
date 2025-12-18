import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Economy } from '@/lib/economy';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clubId = params.id;

    const club = db.prepare('SELECT creator_id, status FROM clubs WHERE id = ?').get(clubId) as any;
    if (!club) return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });

    if (club.status !== 'PENDING') return NextResponse.json({ error: 'CLUB_NOT_PENDING' }, { status: 400 });

    try {
        const tx = db.transaction(() => {
            // 1. Set REJECTED
            db.prepare("UPDATE clubs SET status = 'REJECTED' WHERE id = ?").run(clubId);

            // 2. Refund 5 SP
            Economy.transact(
                club.creator_id,
                'ADMIN_GRANT', // Or generic refund type
                5,
                'SP_COIN',
                `Refund for rejected club: ${clubId}`
            );

            // 3. Log Audit
            db.prepare("INSERT INTO audit_logs (admin_id, action, target_id, details) VALUES (?, 'REJECT_CLUB', ?, 'Club Rejected')")
                .run(session.user.id, clubId);
        });

        tx();
        return NextResponse.json({ success: true });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'ACTION_FAILED' }, { status: 500 });
    }
}
