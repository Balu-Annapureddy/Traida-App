import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Economy } from '@/lib/economy';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const balance = Economy.getBalance(userId);

    const transactions = db.prepare(`
        SELECT type, amount, currency, description, timestamp 
        FROM transactions 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT 50
    `).all(userId);

    const inventory = db.prepare(`
        SELECT item_id, item_type, rarity, acquired_at 
        FROM inventory 
        WHERE user_id = ?
    `).all(userId);

    return NextResponse.json({
        balance,
        transactions,
        inventory
    });
}
