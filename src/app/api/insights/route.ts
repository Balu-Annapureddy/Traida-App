import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ReflectionEngine } from '@/lib/insights/reflection';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // 1. Get/Generate Weekly Reflection (B1)
    const reflection = await ReflectionEngine.getWeeklyReflection(userId);

    // 2. Trait Snapshots (B2 Comparison)
    // Get current User Traits (from users table or session)
    // We need traits from DB to be fresh.
    const user = db.prepare('SELECT traits_json FROM users WHERE id = ?').get(userId) as any;
    const currentTraits = JSON.parse(user.traits_json || '{}');

    // Get "Last Month" snapshot (approx 30 days ago)
    const lastMonthSnapshot = db.prepare(`
        SELECT traits_json FROM trait_snapshots 
        WHERE user_id = ? 
        AND created_at <= date('now', '-30 days')
        ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any; // If none > 30 days, maybe just oldest?

    // 3. Rhythm Log Data (B3)
    const rhythm = db.prepare(`
        SELECT strftime('%w', timestamp) as day, strftime('%H', timestamp) as hour
        FROM attempts 
        WHERE user_id = ? 
        AND timestamp >= date('now', '-30 days')
    `).all(userId);

    // 4. Challenge Palette Data (B4)
    const palette = db.prepare(`
        SELECT c.type, COUNT(*) as count
        FROM attempts a
        JOIN challenges c ON a.challenge_id = c.id
        WHERE a.user_id = ?
        GROUP BY c.type
    `).all(userId);

    // Capture Snapshot if needed (e.g., if no snapshot this week)
    // Simple check: Last snapshot date.
    const lastSnapshot = db.prepare('SELECT created_at FROM trait_snapshots WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;
    if (!lastSnapshot || new Date(lastSnapshot.created_at).getDate() !== new Date().getDate()) {
        // Limit snapshot freq? "Weekly/Monthly". 
        // Let's capture if > 7 days old.
        const shouldCapture = !lastSnapshot || (new Date().getTime() - new Date(lastSnapshot.created_at).getTime()) > 7 * 24 * 60 * 60 * 1000;
        if (shouldCapture) {
            ReflectionEngine.captureSnapshot(userId, currentTraits);
        }
    }

    return NextResponse.json({
        reflection,
        compass: {
            current: currentTraits,
            previous: lastMonthSnapshot ? JSON.parse(lastMonthSnapshot.traits_json) : null
        },
        rhythm,
        palette
    });
}
