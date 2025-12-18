import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { SocialUtils } from '@/lib/social';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { requestId, action } = await req.json(); // action: 'ACCEPT' or 'REJECT'

    if (!['ACCEPT', 'REJECT'].includes(action)) {
        return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
    }

    // 1. Get Request
    const request = db.prepare('SELECT * FROM amigos WHERE id = ?').get(requestId) as any;
    if (!request) return NextResponse.json({ error: 'REQUEST_NOT_FOUND' }, { status: 404 });

    // 2. Validate Ownership
    // Only the person receiving the request (who didn't create it) can accept/reject.
    // We don't store "target_id" explicitly, we store pair + action_user_id.
    // If I am NOT action_user_id, then I am the target.

    // Check if I am part of the pair
    if (request.user_id_1 !== session.user.id && request.user_id_2 !== session.user.id) {
        return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 403 });
    }

    // If I initiated it, I cannot "Accept" my own request. (Maybe Cancel? But simpler for now)
    if (request.action_user_id === session.user.id) {
        return NextResponse.json({ error: 'CANNOT_RESPOND_OWN_REQUEST' }, { status: 400 });
    }

    if (request.status !== 'PENDING') {
        return NextResponse.json({ error: 'INVALID_STATUS' }, { status: 400 });
    }

    // 3. Process Action
    try {
        if (action === 'ACCEPT') {
            db.prepare("UPDATE amigos SET status = 'ACCEPTED', action_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                .run(session.user.id, requestId);

            // Notify Sender
            const senderId = (request.user_id_1 === session.user.id) ? request.user_id_2 : request.user_id_1;
            SocialUtils.sendNotification(senderId, 'SYSTEM', session.user.id, `${session.user.username} accepted your Amigo request.`);

        } else {
            // REJECT -> Delete row? Or set Rejected?
            // "Prevent duplicates" -> If we delete, they can request again.
            // If we mark REJECTED, do we allow re-request? 
            // MVP: Delete allows re-request (maybe annoying).
            // Better: Delete. Let them try again later if they want. 
            // "Block" is for permanent stop.
            db.prepare("DELETE FROM amigos WHERE id = ?").run(requestId);
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'ACTION_FAILED' }, { status: 500 });
    }
}
