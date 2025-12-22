import { NextResponse } from 'next/server';
import { CleanupService } from '@/lib/cleanup';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = CleanupService.run();
        return NextResponse.json({ success: true, stats });
    } catch (e) {
        return NextResponse.json({ error: 'Cleanup Failed' }, { status: 500 });
    }
}
