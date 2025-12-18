'use server';

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUsername(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "UNAUTHORIZED" };

    const newUsername = formData.get('username') as string;
    if (!newUsername || newUsername.length < 3) return { error: "INVALID_NAME" };

    const userId = session.user.id;

    // Check Balance (1 SP Coin)
    const user = db.prepare('SELECT sp_coins FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.sp_coins < 1) return { error: "INSUFFICIENT_SP_COINS" };

    // Check Uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(newUsername);
    if (existing) return { error: "NAME_TAKEN" };

    try {
        const transact = db.transaction(() => {
            // Deduct Cost
            db.prepare('UPDATE users SET sp_coins = sp_coins - 1 WHERE id = ?').run(userId);

            // Update Name
            db.prepare('UPDATE users SET username = ?, last_username_change = CURRENT_TIMESTAMP WHERE id = ?').run(newUsername, userId);

            // Log Transaction
            db.prepare(`
                INSERT INTO transactions (user_id, type, amount, currency, description)
                VALUES (?, 'SPEND_USERNAME_CHANGE', -1, 'SP_COIN', ?)
            `).run(userId, `Changed name to ${newUsername}`);
        });

        transact();
        revalidatePath('/profile');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "SYSTEM_ERROR" };
    }
}
