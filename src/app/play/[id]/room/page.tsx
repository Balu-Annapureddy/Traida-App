import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatInterface from "./chat-interface"; // Client Component

export default async function RoomPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) redirect('/login');

    const challengeId = parseInt(params.id);

    // 1. Verify Attempt Exists (Gate)
    const attempt = db.prepare('SELECT id, is_success FROM attempts WHERE user_id = ? AND challenge_id = ?').get(session.user.id, challengeId) as any;

    if (!attempt) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h1 className="pixel-border" style={{ padding: '1rem', color: 'var(--error)' }}>ACCESS_DENIED</h1>
                <p>YOU_MUST_ATTEMPT_THE_CHALLENGE_FIRST</p>
                <div style={{ marginTop: '2rem' }}>
                    <Link href={`/play/${challengeId}`} className="pixel-btn">GO_TO_CHALLENGE</Link>
                </div>
            </div>
        );
    }

    const challenge = db.prepare('SELECT type FROM challenges WHERE id = ?').get(challengeId) as any;

    return (
        <ChatInterface
            roomId={challengeId}
            username={session.user.username}
            challengeType={challenge?.type || 'UNKNOWN'}
        />
    );
}
