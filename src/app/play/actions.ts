'use server';

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
        // Fetch current traits
        const user = db.prepare('SELECT traits_json FROM users WHERE id = ?').get(userId) as any;
        const traits = JSON.parse(user.traits_json || '{}');

        const typeKey = challenge.type.toUpperCase(); // LOGIC, PATTERN, etc
        traits[typeKey] = (traits[typeKey] || 0) + 1; // Increment trait

        db.prepare('UPDATE users SET traits_json = ? WHERE id = ?').run(JSON.stringify(traits), userId);
    }

    revalidatePath('/'); // Update dashboard
    return { success: true, score, isSuccess };
}
