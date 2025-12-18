import { db } from '@/lib/db';

type Currency = 'COIN' | 'SP_COIN';
type TxType = 'EARN_CHALLENGE' | 'EARN_STREAK' | 'SPEND_SHOP' | 'SPEND_AVATAR' | 'SPEND_USERNAME_CHANGE' | 'ADMIN_GRANT';

export const Economy = {
    getBalance: (userId: number) => {
        const user = db.prepare('SELECT coins, sp_coins FROM users WHERE id = ?').get(userId) as any;
        return { coins: user?.coins || 0, spCoins: user?.sp_coins || 0 };
    },

    transact: (userId: number, type: TxType, amount: number, currency: Currency, description: string) => {
        const col = currency === 'COIN' ? 'coins' : 'sp_coins';

        // Transaction Wrapper
        const transact = db.transaction(() => {
            // Check balance if spending
            if (amount < 0) {
                const current = db.prepare(`SELECT ${col} FROM users WHERE id = ?`).get(userId) as any;
                if (!current || current[col] < Math.abs(amount)) {
                    throw new Error('INSUFFICIENT_FUNDS');
                }
            }

            // Update User
            db.prepare(`UPDATE users SET ${col} = ${col} + ? WHERE id = ?`).run(amount, userId);

            // Log Transaction
            db.prepare(`
                INSERT INTO transactions (user_id, type, amount, currency, description)
                VALUES (?, ?, ?, ?, ?)
            `).run(userId, type, amount, currency, description);
        });

        transact();
    },

    addToInventory: (userId: number, itemId: string, itemType: 'EMOJI' | 'AVATAR', rarity: string = 'COMMON') => {
        db.prepare(`
            INSERT INTO inventory (user_id, item_id, item_type, rarity)
            VALUES (?, ?, ?, ?)
        `).run(userId, itemId, itemType, rarity);
    }
};
