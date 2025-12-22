import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
        }

        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email) as any;

        if (!user) {
            return NextResponse.json({ error: 'Invalid User' }, { status: 404 });
        }

        if (user.verified_at) {
            return NextResponse.json({ success: true, message: 'Already verified' });
        }

        // Validate OTP
        const now = new Date();
        const expires = new Date(user.otp_expires_at);

        if (user.otp_secret !== otp) {
            return NextResponse.json({ error: 'Invalid Code' }, { status: 400 });
        }

        if (now > expires) {
            return NextResponse.json({ error: 'Code Expired' }, { status: 400 });
        }

        // Success - Update User
        const update = db.prepare(`
            UPDATE users 
            SET verified_at = CURRENT_TIMESTAMP, otp_secret = NULL, otp_expires_at = NULL 
            WHERE id = ?
        `);
        update.run(user.id);

        // Create Session (Auto-login)
        // Create Session (Auto-login)
        await createSession({
            id: user.id,
            username: user.username,
            role: user.role,
            archetype_id: user.archetype_id
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Verification Failed' }, { status: 500 });
    }
}
