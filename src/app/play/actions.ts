'use server';

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitPractice(challengeId: number, answer: string) {
    const challenge = db.prepare('SELECT solution FROM challenges WHERE id = ?').get(challengeId) as any;
    if (!challenge) return false;
    return answer.trim().toLowerCase() === challenge.solution.trim().toLowerCase();
}

export async function submitChallenge(challengeId: number, answer: string, timeTakenMs: number) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const userId = session.user.id;

    // 1. Verify Attempt Limit (Double check)
    const existing = db.prepare('SELECT id FROM attempts WHERE user_id = ? AND challenge_id = ?').get(userId, challengeId);
    if (existing) {
        return { error: "ALREADY_ATTEMPTED" };
    }

    // 2. Get Challenge Solution
    const challenge = db.prepare('SELECT solution, type FROM challenges WHERE id = ?').get(challengeId) as any;
    if (!challenge) return { error: "INVALID_CHALLENGE" };

    // 3. Check Answer
    const isSuccess = challenge.solution.toLowerCase() === answer.toLowerCase();

    // 4. Calculate Score
    // Base 1000. Deduct 1 point per second? Or just 1000 if correct, 0 if fail?
    // MVP: 1000 points for Sync, Logic, etc. Time bonus?
    // Let's say: 1000 Base. 
    // Bonus = (300000ms - timeTaken) / 1000. (Max 5 mins).
    // If fail => 0.

    let score = 0;
    if (isSuccess) {
        const timeBonus = Math.max(0, Math.floor((300000 - timeTakenMs) / 1000));
        score = 1000 + timeBonus;
    }

    // 5. Update DB
    db.prepare(`
        INSERT INTO attempts (user_id, challenge_id, score, time_taken_ms, is_success) 
        VALUES (?, ?, ?, ?, ?)
    `).run(userId, challengeId, score, timeTakenMs, isSuccess ? 1 : 0);

    // 6. Update User Traits (Placeholder Logic)
    // If LOGIC & Success -> Logic + 1
    if (isSuccess) {
        // Fetch current traits and streak data
        const user = db.prepare('SELECT traits_json, current_streak, last_played_date FROM users WHERE id = ?').get(userId) as any;
        const traits = JSON.parse(user.traits_json || '{}');

        // Update Traits
        const typeKey = challenge.type.toUpperCase();
        traits[typeKey] = (traits[typeKey] || 0) + 1;

        // Update Streak
        let streak = user.current_streak || 0;
        const lastDate = user.last_played_date ? new Date(user.last_played_date) : null;
        const today = new Date();
        // Use local or UTC? App seems to use simplified ISO string for now.
        // To be safe, let's just count full days steps.

        // Strip time for accurate day stats (UTC 00:00)
        const getDayTime = (d: Date) => Math.floor(d.getTime() / 86400000);

        const todayTime = getDayTime(today);
        const lastTime = lastDate ? getDayTime(lastDate) : null;
        const todayStr = today.toISOString().split('T')[0];

        if (lastTime !== null) {
            const diffDays = todayTime - lastTime;

            if (diffDays === 0) {
                // Same day, do nothing
            } else if (diffDays === 1) {
                // Consecutive day
                streak += 1;
            } else {
                // Missed diffDays - 1 days
                // e.g. Mon(1) -> Wed(3). Missed Tue. diff=2. missed=1.
                const missedDays = diffDays - 1;

                // Check Shields
                const shielding = db.prepare("SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = 'STREAK_SHIELD'").get(userId) as any;
                const ownedShields = shielding ? shielding.quantity : 0;

                console.log(`Debug Streak: Missed ${missedDays}, Owned ${ownedShields}`);

                if (ownedShields >= missedDays) {
                    // Consumed enough shields
                    streak += 1; // Count today as success, bridge the gap
                    const newQty = ownedShields - missedDays;

                    if (newQty <= 0) {
                        db.prepare("DELETE FROM inventory WHERE id = ?").run(shielding.id);
                    } else {
                        db.prepare("UPDATE inventory SET quantity = ? WHERE id = ?").run(newQty, shielding.id);
                    }

                    // Log usage
                    db.prepare(`
                        INSERT INTO transactions (user_id, type, amount, currency, description) 
                        VALUES (?, 'USE_SHIELD', 0, 'ITEM', ?)
                    `).run(userId, `Used ${missedDays} Streak Shields`);

                } else {
                    streak = 1; // Reset unfortunately
                }
            }
        } else {
            streak = 1; // First game
        }

        db.prepare('UPDATE users SET traits_json = ?, current_streak = ?, last_played_date = ? WHERE id = ?')
            .run(JSON.stringify(traits), streak, todayStr, userId);
    }

    revalidatePath('/'); // Update dashboard
    return { success: true, score, isSuccess };
}
