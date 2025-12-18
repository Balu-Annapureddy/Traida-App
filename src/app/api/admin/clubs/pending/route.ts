import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    // TODO: Add strict ADMIN role check once roles are fully implemented
    // For now assuming session means authenticated.
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pendingClubs = db.prepare(`
        SELECT c.*, u.username as creator_name 
        FROM clubs c
        JOIN users u ON c.creator_id = u.id
        WHERE c.status = 'PENDING'
    `).all();

    return NextResponse.json({ clubs: pendingClubs });
}
