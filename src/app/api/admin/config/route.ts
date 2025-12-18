import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session || !session.user.role?.includes('ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const configs = db.prepare('SELECT * FROM system_config').all();
    const configMap: Record<string, boolean> = {};
    configs.forEach((c: any) => {
        configMap[c.key] = c.value === 'true';
    });

    return NextResponse.json({ config: configMap });
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || !session.user.role?.includes('ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { key, value } = await req.json(); // value is boolean

    try {
        db.prepare('INSERT OR REPLACE INTO system_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
            .run(key, String(value));

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'FAILED' }, { status: 500 });
    }
}
