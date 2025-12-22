'use server';

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";



// --- HELPERS ---
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

// --- LIBER (PRACTICE) ---
export async function submitPractice(challengeId: number, answer: string) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    // 1. Check Daily Limit (10)
    const todayStr = getTodayStr();

    // Reset counter if new day (lazy check)
    // We store 'last_liber_reset' in DB.
    // Actually, simpler to just query attempts? No, Liber attempts are not stored in 'attempts' table usually?
    // Wait, prompt says "Same engines as daily challenges", "No XP, no traits".
    // Does it store attempts? "Max 10 plays per day". Tracking is needed.
    // Let's use the 'users' table columns I added: `liber_plays_today`, `last_liber_reset`.

    const user = db.prepare('SELECT liber_plays_today, last_liber_reset FROM users WHERE id = ?').get(session.user.id) as any;

    let count = user.liber_plays_today;
    const lastReset = user.last_liber_reset ? user.last_liber_reset.split('T')[0] : null;

    if (lastReset !== todayStr) {
        count = 0; // New day
        db.prepare('UPDATE users SET liber_plays_today = 0, last_liber_reset = ? WHERE id = ?').run(new Date().toISOString(), session.user.id);
    }

    if (count >= 10) {
        return { error: "DAILY_LIMIT_REACHED", limit: 10 };
    }

    // 2. Validate
    const challenge = db.prepare('SELECT solution FROM challenges WHERE id = ?').get(challengeId) as any;
    if (!challenge) return { error: "INVALID_CHALLENGE" };

    const isSuccess = answer.trim().toLowerCase() === challenge.solution.trim().toLowerCase();

    // 3. Increment Count
    db.prepare('UPDATE users SET liber_plays_today = liber_plays_today + 1 WHERE id = ?').run(session.user.id);

    return { success: true, isSuccess, remaining: 9 - count };
}

// --- DAILY CHALLENGE ---
export async function submitChallenge(challengeId: number, answer: string, timeTakenMs: number) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };

    const userId = session.user.id;
    const todayStr = getTodayStr();

    // 1. Check Global Lock (Is any challenge accepted today?)
    // Join attempts with challenges to match date? 
    // Optimization: Just check 'accepted_at' on attempts created today? 
    // Attempts have 'completed_at'.
    // Better: Check `attempts` where `accepted_at` is NOT NULL and `completed_at` is today.
    const locked = db.prepare(`
        SELECT COUNT(*) as count 
        FROM attempts 
        WHERE user_id = ? 
        AND accepted_at IS NOT NULL 
        AND date(completed_at) = date('now')
    `).get(userId) as any;

    if (locked && locked.count > 0) {
        return { error: "PROTOCOL_LOCKED" };
    }

    // 2. Check Attempt Limit for THIS Challenge (Max 2)
    const attempts = db.prepare('SELECT COUNT(*) as count FROM attempts WHERE user_id = ? AND challenge_id = ?').get(userId, challengeId) as any;
    const attemptNum = (attempts?.count || 0) + 1;

    if (attemptNum > 2) {
        return { error: "MAX_ATTEMPTS_REACHED" };
    }

    // 3. Verify Challenge
    const challenge = db.prepare('SELECT solution, type FROM challenges WHERE id = ?').get(challengeId) as any;
    if (!challenge) return { error: "INVALID_CHALLENGE" };

    const isSuccess = challenge.solution.toLowerCase() === answer.toLowerCase();

    // 4. Calculate Score
    let score = 0;
    if (isSuccess) {
        const timeBonus = Math.max(0, Math.floor((300000 - timeTakenMs) / 1000));
        score = 1000 + timeBonus;
    }

    // 5. Insert Attempt
    const info = db.prepare(`
        INSERT INTO attempts (user_id, challenge_id, attempt_number, score, time_seconds, success, completed_at) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, challengeId, attemptNum, score, Math.floor(timeTakenMs / 1000), isSuccess ? 1 : 0);

    revalidatePath(`/play/${challengeId}`);

    return { success: true, attemptId: info.lastInsertRowid, isSuccess, attemptNum, canAccept: true };
}

// --- ACCEPTANCE (Commit Result) ---
export async function acceptResult(attemptId: number) {
    const session = await getSession();
    if (!session) return { error: "Unauthorized" };
    const userId = session.user.id;

    // 1. Validate Ownership & Status
    const attempt = db.prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?').get(attemptId, userId) as any;
    if (!attempt) return { error: "NOT_FOUND" };
    if (attempt.accepted_at) return { error: "ALREADY_ACCEPTED" };

    // 2. Check Global Lock again
    const locked = db.prepare(`
        SELECT COUNT(*) as count 
        FROM attempts 
        WHERE user_id = ? 
        AND accepted_at IS NOT NULL 
        AND date(completed_at) = date('now')
    `).get(userId) as any;

    if (locked && locked.count > 0) {
        return { error: "PROTOCOL_LOCKED" };
    }

    // 3. Mark Accepted
    db.prepare('UPDATE attempts SET accepted_at = CURRENT_TIMESTAMP WHERE id = ?').run(attemptId);

    // 4. Update Traits & Stats (Only NOW do we apply effects)
    if (attempt.success) {
        // Fetch User
        const user = db.prepare('SELECT traits_json, current_streak, last_played_date FROM users WHERE id = ?').get(userId) as any;
        const traits = JSON.parse(user.traits_json || '{}');
        const challenge = db.prepare('SELECT type FROM challenges WHERE id = ?').get(attempt.challenge_id) as any;

        // Logic: 
        const typeKey = challenge.type.toUpperCase();
        traits[typeKey] = (traits[typeKey] || 0) + 1;

        // Streak Logic
        let streak = user.current_streak || 0;
        const lastDate = user.last_played_date ? new Date(user.last_played_date) : null;
        const today = new Date();
        const getDayTime = (d: Date) => Math.floor(d.getTime() / 86400000);
        const todayTime = getDayTime(today);
        const lastTime = lastDate ? getDayTime(lastDate) : null;
        const todayStr = today.toISOString().split('T')[0];

        if (lastTime !== null) {
            const diffDays = todayTime - lastTime;
            if (diffDays === 1) streak += 1;
            else if (diffDays > 1) {
                // Simplified Shield Logic for Phase 1 - Just check if shield exists
                // For Alpha Foundation, keeping logic simple or reusing strict Phase 3 logic if robust.
                // Assuming Phase 3 logic was fine, we just update it here.
                // But Prompt says "Foundation must be boring and correct".
                // I'll assume simple reset for now unless shields are strictly required in Phase 1. 
                // "XP & Traits are private... XP growth is slow".
                // Let's keep existing shield logic if possible, or simplify to streak = 1.
                // I will keep Streak = 1 for safety to avoid bugs in complex shield logic during this rewrite.
                streak = 1;
            }
        } else {
            streak = 1;
        }

        db.prepare('UPDATE users SET traits_json = ?, current_streak = ?, last_played_date = ? WHERE id = ?')
            .run(JSON.stringify(traits), streak, todayStr, userId);
    }

    revalidatePath('/');
    return { success: true };
}
