import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function GET() {
    await logout();
    return NextResponse.redirect(new URL('/login', 'http://localhost:3000')); // Hardcoded host for MVP dev
}
