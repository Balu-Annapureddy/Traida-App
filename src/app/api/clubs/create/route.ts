import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Economy } from '@/lib/economy';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, isPrivate } = await req.json();

    if (!name || name.length < 3) {
        return NextResponse.json({ error: 'INVALID_NAME' }, { status: 400 });
    }

    // 1. Check Uniqueness
    const existing = db.prepare('SELECT id FROM clubs WHERE name = ?').get(name);
    if (existing) {
        return NextResponse.json({ error: 'NAME_TAKEN' }, { status: 400 });
    }

    // 2. Check Club Limit (Max 2 creator/membership?)
    // Spec says: "Max 2 Clubs per user". We should count memberships.
    const memberships = db.prepare('SELECT COUNT(*) as count FROM club_members WHERE user_id = ?').get(session.user.id) as any;
    if (memberships.count >= 2) {
        return NextResponse.json({ error: 'MAX_CLUBS_REACHED' }, { status: 400 });
    }

    // Also check Pending Requests? 
    // Spec says: "rate limit: max 1 pending request".
    const pending = db.prepare("SELECT id FROM clubs WHERE creator_id = ? AND status = 'PENDING'").get(session.user.id);
    if (pending) {
        return NextResponse.json({ error: 'PENDING_REQUEST_EXISTS' }, { status: 400 });
    }

    // 3. Create (Transaction)
    try {
        const tx = db.transaction(() => {
            // Deduct 5 SP
            Economy.transact(
                session.user.id,
                'SPEND_CLUB_CREATE', // We need to add this type or just use generic SPEND_SHOP
                -5,
                'SP_COIN',
                `Created club: ${name}`
            );

            // Insert Club
            const result = db.prepare(`
                INSERT INTO clubs (name, description, creator_id, is_private, status)
                VALUES (?, ?, ?, ?, 'PENDING')
            `).run(name, description || '', session.user.id, isPrivate ? 1 : 0);

            const clubId = result.lastInsertRowid;

            // Insert Creator as Member (Role: CREATOR)
            db.prepare(`
                INSERT INTO club_members (club_id, user_id, role)
                VALUES (?, ?, 'CREATOR')
            `).run(clubId, session.user.id);

            return clubId;
        });

        const newClubId = tx();
        return NextResponse.json({ success: true, clubId: newClubId });

    } catch (e: any) {
        if (e.message === 'INSUFFICIENT_FUNDS') {
            return NextResponse.json({ error: 'INSUFFICIENT_FUNDS' }, { status: 400 });
        }
        console.error("Club Create Error:", e);
        return NextResponse.json({ error: 'CREATION_FAILED' }, { status: 500 });
    }
}
