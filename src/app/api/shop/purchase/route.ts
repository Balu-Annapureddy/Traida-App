import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Economy } from '@/lib/economy';

const SHOP_ITEMS: Record<string, { cost: number, currency: 'COIN' | 'SP_COIN', type: 'EMOJI' | 'AVATAR' | 'ITEM', rarity: string }> = {
    'THEME_MATRIX': { cost: 500, currency: 'COIN', type: 'AVATAR', rarity: 'PREMIUM' }, // Demo item
    'EMOJI_PACK_PREMIUM': { cost: 1000, currency: 'COIN', type: 'EMOJI', rarity: 'PREMIUM' },
    'STREAK_SHIELD': { cost: 200, currency: 'COIN', type: 'ITEM', rarity: 'COMMON' },
};

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId } = await req.json();
    const item = SHOP_ITEMS[itemId];

    if (!item) return NextResponse.json({ error: 'ITEM_NOT_FOUND' }, { status: 404 });

    // Check if already owned
    const owned = db.prepare('SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ?').get(session.user.id, itemId) as any;

    // Stackable items logic
    const isStackable = itemId === 'STREAK_SHIELD';

    if (owned && !isStackable) return NextResponse.json({ error: 'ALREADY_OWNED' }, { status: 400 });

    try {
        Economy.transact(
            session.user.id,
            'SPEND_SHOP',
            -item.cost,
            item.currency,
            `Purchased ${itemId}`
        );

        if (owned && isStackable) {
            db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE id = ?').run(owned.id);
        } else {
            Economy.addToInventory(
                session.user.id,
                itemId,
                item.type,
                item.rarity
            );
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        if (e.message === 'INSUFFICIENT_FUNDS') {
            return NextResponse.json({ error: 'INSUFFICIENT_FUNDS' }, { status: 400 });
        }
        console.error(e);
        return NextResponse.json({ error: 'TRANSACTION_FAILED' }, { status: 500 });
    }
}
