import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PlayInterface from "./interface"; // Client Component
import ClientSignalFlow from "./ClientSignalFlow"; // Client Signal/Closure

// Server Component Wrapper
export default async function PlayPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ signal?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const session = await getSession();
    if (!session) redirect('/login');

    const id = parseInt(params.id);
    const showSignalParam = searchParams?.signal === 'true';

    // Check if challenge exists
    const challenge = db.prepare('SELECT id, type, difficulty, content_json FROM challenges WHERE id = ?').get(id) as any;
    if (!challenge) return <div>INVALID_CHALLENGE_ID</div>;

    // Check if already attempted
    const attempt = db.prepare('SELECT id, score, is_success FROM attempts WHERE user_id = ? AND challenge_id = ?').get(session.user.id, id) as any;

    if (attempt) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                <h1 className="pixel-border" style={{ padding: '1rem', color: attempt.is_success ? 'var(--success)' : 'var(--error)' }}>
                    {attempt.is_success ? 'MISSION_SUCCESS' : 'MISSION_FAILED'}
                </h1>
                <p style={{ marginTop: '2rem' }}>SCORE: {attempt.score}</p>

                {showSignalParam ? (
                    <div style={{ marginTop: '2rem' }}>
                        <ClientSignalFlow challengeId={id} />
                    </div>
                ) : (
                    <div style={{ marginTop: '2rem' }}>
                        <a href="/" className="pixel-btn">RETURN_TO_BASE</a>
                        <Link href={`/play/${id}/room`} className="pixel-btn" style={{ marginLeft: '1rem', background: 'var(--secondary)', color: 'white' }}>
                            ENTER_ROOM
                        </Link>
                    </div>
                )}
            </div>
        )
    }

    // Parse JSON content
    const content = JSON.parse(challenge.content_json);

    return (
        <PlayInterface
            challengeId={id}
            type={challenge.type}
            content={content}
        />
    );
}
