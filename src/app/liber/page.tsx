import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import GameInterface from "../play/[id]/interface";
import styles from "../play/[id]/play.module.css";

// Force new challenge every load
export const dynamic = 'force-dynamic';

export default async function LiberPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = db.prepare('SELECT liber_plays_today, last_liber_reset FROM users WHERE id = ?').get(session.id) as any;

    // Check reset
    const todayStr = new Date().toISOString().split('T')[0];
    const lastReset = user.last_liber_reset ? user.last_liber_reset.split('T')[0] : null;
    let plays = user.liber_plays_today;

    if (lastReset !== todayStr) {
        plays = 0; // It will be reset on first submit, but for display we assume 0
    }

    if (plays >= 10) {
        return (
            <div className={styles.container}>
                <div className="pixel-border" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3>LIMIT_REACHED</h3>
                    <p style={{ margin: '1rem 0', color: 'var(--secondary)' }}>
                        Practice usage caps at 10 sessions daily.
                    </p>
                    <a href="/" className="pixel-btn">Return</a>
                </div>
            </div>
        );
    }

    // Fetch ONE random challenge
    // We reuse existing challenges for practice
    const challenge = db.prepare('SELECT * FROM challenges ORDER BY RANDOM() LIMIT 1').get() as any;

    if (!challenge) return <div>NO_DATA</div>;

    // Parse options if JSON
    let options = [];
    try {
        options = JSON.parse(challenge.options);
    } catch {
        options = [];
    }

    const formattedChallenge = {
        ...challenge,
        options
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>LIBER // PRACTICE_MODE</h1>
                <span style={{ color: 'yellow' }}>NO_STREAK • NO_TRAITS</span>
            </header>
            <GameInterface
                challengeId={formattedChallenge.id}
                type={formattedChallenge.type}
                content={{
                    question: formattedChallenge.question,
                    options: formattedChallenge.options
                }}
                mode="practice"
            />
        </div>
    );
}
