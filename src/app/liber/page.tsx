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
                challenge={formattedChallenge} // Keep for safety if used elsewhere
                mode="practice"
            />
        </div>
    );
}
