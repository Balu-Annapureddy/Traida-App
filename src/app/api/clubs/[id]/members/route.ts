import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clubId = params.id;

    // Check if user is member? Or public?
    // Public directory shows member count but not list usually unless member?
    // "Member list with "..." menu per user" -> Typically for members/admins.
    // Let's restrict to members for privacy.
    const isMember = db.prepare('SELECT 1 FROM club_members WHERE club_id = ? AND user_id = ?').get(clubId, session.user.id);
    if (!isMember) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    const members = db.prepare(`
        SELECT m.user_id, m.role, u.username 
        FROM club_members m
        JOIN users u ON m.user_id = u.id
        WHERE m.club_id = ?
        ORDER BY 
            CASE m.role WHEN 'CREATOR' THEN 1 WHEN 'MODERATOR' THEN 2 ELSE 3 END,
            u.username ASC
    `).all(clubId);

    return NextResponse.json({ members });
}
