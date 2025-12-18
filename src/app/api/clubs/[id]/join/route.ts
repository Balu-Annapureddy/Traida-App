import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clubId = params.id;

    // 1. Get Club Info
    const club = db.prepare('SELECT id, is_private, status FROM clubs WHERE id = ?').get(clubId) as any;

    if (!club) return NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 });
    if (club.status !== 'ACTIVE') return NextResponse.json({ error: 'CLUB_NOT_ACTIVE' }, { status: 400 });
    if (club.is_private) return NextResponse.json({ error: 'PRIVATE_CLUB' }, { status: 403 });

    // 2. Check User Limit (Max 2 Clubs)
    const userClubs = db.prepare('SELECT COUNT(*) as count FROM club_members WHERE user_id = ?').get(session.user.id) as any;
    if (userClubs.count >= 2) return NextResponse.json({ error: 'MAX_CLUBS_REACHED' }, { status: 400 });

    // 3. Check Club Size Limit (Max 30)
    const clubSize = db.prepare('SELECT COUNT(*) as count FROM club_members WHERE club_id = ?').get(clubId) as any;
    if (clubSize.count >= 30) return NextResponse.json({ error: 'CLUB_FULL' }, { status: 400 });

    // 4. Join
    try {
        db.prepare('INSERT INTO club_members (club_id, user_id, role) VALUES (?, ?, ?)')
            .run(clubId, session.user.id, 'MEMBER');

        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'ALREADY_MEMBER' }, { status: 400 });
        }
        console.error(e);
        return NextResponse.json({ error: 'JOIN_FAILED' }, { status: 500 });
    }
}
