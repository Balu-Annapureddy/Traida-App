import { db } from "../db";

export class ReflectionEngine {

    // Lazy Load: Generate if missing for current week
    static async getWeeklyReflection(userId: number) {
        // 1. Determine Week Start (Sunday)
        const today = new Date();
        const diff = today.getDate() - today.getDay(); // Sunday is 0
        const weekStart = new Date(today.setDate(diff)).toISOString().split('T')[0];

        // 2. Check existing
        const existing = db.prepare('SELECT * FROM weekly_reflections WHERE user_id = ? AND week_start_date = ?').get(userId, weekStart) as any;
        if (existing) return existing;

        // 3. Generate New
        // Fetch last 7 days activity
        const recentAttempts = db.prepare(`
            SELECT a.*, c.type 
            FROM attempts a
            JOIN challenges c ON a.challenge_id = c.id
            WHERE a.user_id = ? 
            AND a.timestamp >= date('now', '-7 days')
        `).all(userId) as any[];

        const content = this.generateNarrative(recentAttempts);

        // 4. Save
        const info = db.prepare(`
            INSERT INTO weekly_reflections (user_id, week_start_date, content)
            VALUES (?, ?, ?)
        `).run(userId, weekStart, content);

        return { id: info.lastInsertRowid, content, week_start_date: weekStart, created_at: new Date().toISOString() };
    }

    // Logic for B1 Sunday Letter
    private static generateNarrative(attempts: any[]): string {
        if (attempts.length === 0) {
            return "The studio was quiet this week. Sometimes a pause is as valuable as action. When you are ready, the challenges await.";
        }

        const count = attempts.length;
        const types: Record<string, number> = {};
        let successCount = 0;

        attempts.forEach(a => {
            types[a.type] = (types[a.type] || 0) + 1;
            if (a.is_success) successCount++;
        });

        const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0];

        // Narrative Construction
        let text = "";

        // Opening (Activity Level)
        if (count < 3) text += "A measured week, with sparing but deliberate activity. ";
        else if (count < 10) text += "A steady rhythm this week. You engaged consistently. ";
        else text += "A week of high intensity and focus. ";

        // Focus Area
        if (topType) {
            text += `You leaned naturally towards ${topType[0]} challenges, finding comfort in that pattern. `;
        }

        // Success vs Effort (Non-judgmental)
        if (successCount === count) {
            text += "Your clarity was absolute, solving every puzzle you touched. ";
        } else {
            text += "You pushed into difficult territory, valuing the attempt as much as the solution. ";
        }

        // Closing
        text += "Carry this momentum forward.";

        return text;
    }

    // Capture Trait Snapshot (Called weekly or periodically)
    static async captureSnapshot(userId: number, currentTraits: any) {
        // Check if snapshot exists for this week? 
        // Strategy: "Weekly/Monthly". 
        // Let's just save one if none exists for current week to save space.
        const today = new Date().toISOString().split('T')[0];
        // Unique constraint on date? No, just periodic.
        // Let's just insert.
        db.prepare('INSERT INTO trait_snapshots (user_id, traits_json) VALUES (?, ?)').run(userId, JSON.stringify(currentTraits));
    }
}
