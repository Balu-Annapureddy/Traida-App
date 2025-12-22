import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth'; // Removed createSession
import { OTPUtils } from '@/lib/otp';
import { EmailService } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { username, password, email } = await req.json();

        if (!username || !password || !email) {
            return NextResponse.json({ error: 'Username, password, and email required' }, { status: 400 });
        }

        // Check existing user
        const checkStmt = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        const existing = checkStmt.get(username, email);
        if (existing) {
            return NextResponse.json({ error: 'Username or Email already taken' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const otp = OTPUtils.generate();
        const expiry = OTPUtils.getExpiry().toISOString();

        // Insert new user
        const insertStmt = db.prepare(`
      INSERT INTO users (username, password_hash, email, otp_secret, otp_expires_at, verified_at, coins, sp_coins)
      VALUES (?, ?, ?, ?, ?, NULL, 150, 3)
    `);

        insertStmt.run(username, hashedPassword, email, otp, expiry);

        // Send OTP
        await EmailService.sendOTP(email, otp);

        // Do NOT create session. User must verify.
        return NextResponse.json({ success: true, requireVerification: true, email });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
