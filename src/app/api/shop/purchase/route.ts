import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Economy } from '@/lib/economy';

const SHOP_ITEMS: Record<string, { cost: number, currency: 'COIN' | 'SP_COIN', type: 'EMOJI' | 'AVATAR', rarity: string }> = {
    'THEME_MATRIX': { cost: 500, currency: 'COIN', type: 'AVATAR', rarity: 'PREMIUM' }, // Demo item
    'EMOJI_PACK_PREMIUM': { cost: 1000, currency: 'COIN', type: 'EMOJI', rarity: 'PREMIUM' },
};

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId } = await req.json();
    const item = SHOP_ITEMS[itemId];

    if (!item) return NextResponse.json({ error: 'ITEM_NOT_FOUND' }, { status: 404 });

    // Check if already owned
    const owned = db.prepare('SELECT id FROM inventory WHERE user_id = ? AND item_id = ?').get(session.user.id, itemId);
    if (owned) return NextResponse.json({ error: 'ALREADY_OWNED' }, { status: 400 });

    try {
        Economy.transact(
            session.user.id,
            'SPEND_SHOP',
            -item.cost,
            item.currency,
            `Purchased ${itemId}`
        );

        Economy.addToInventory(
            session.user.id,
            itemId,
            item.type,
            item.rarity
        );

        return NextResponse.json({ success: true });

    } catch (e: any) {
        if (e.message === 'INSUFFICIENT_FUNDS') {
            return NextResponse.json({ error: 'INSUFFICIENT_FUNDS' }, { status: 400 });
        }
        console.error(e);
        return NextResponse.json({ error: 'TRANSACTION_FAILED' }, { status: 500 });
    }
}
