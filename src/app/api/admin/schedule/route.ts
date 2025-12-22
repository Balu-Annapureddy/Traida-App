import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    const user = await getSession();
    if (!user || user.role !== 'ADMIN') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { date, slots } = await req.json();

        // 1. Validation
        if (!date || !slots || slots.length !== 3) {
            return new NextResponse('Invalid Payload', { status: 400 });
        }

        // Check Duplicates in Request
        const types = new Set(slots.map((s: any) => s.type));
        if (types.size !== 3) {
            return new NextResponse('Duplicate Types in Schedule', { status: 400 });
        }

        // Check Existing Date
        const existing = db.prepare('SELECT id FROM challenges WHERE date = ?').get(date);
        if (existing) {
            return new NextResponse('Date already scheduled. Cannot overwrite.', { status: 409 });
        }

        // 2. Transaction
        const insertChallenge = db.prepare(
            'INSERT INTO challenges (type, date, data_json) VALUES (?, ?, ?)'
        );

        const logAction = db.prepare(
            'INSERT INTO admin_logs (admin_id, action, target_id, details_json, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        );

        const createTransaction = db.transaction(() => {
            // Insert 3 Challenges
            for (const slot of slots) {
                insertChallenge.run(slot.type, date, slot.config); // config is stringified JSON
            }

            // Log Action
            logAction.run(
                user.id,
                'SCHEDULE_DAY',
                date,
                JSON.stringify({ slots_types: slots.map((s: any) => s.type) })
            );
        });

        createTransaction();

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(e);
        return new NextResponse(`Server Error: ${e.message}`, { status: 500 });
    }
}
