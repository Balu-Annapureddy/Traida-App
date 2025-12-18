import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./profile.module.css";

// Helper to calculate simple archetype based on highest trait
function calculateArchetype(traits: any) {
    if (!traits || Object.keys(traits).length === 0) return "BLANK_SLATE";

    // Find key with max value
    let maxKey = "BALANCED";
    let maxValue = -1;

    for (const [key, value] of Object.entries(traits)) {
        if (typeof value === 'number' && value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }

    // Map to cool names
    const map: Record<string, string> = {
        'LOGIC': 'LOGIC_ENGINE',
        'speed': 'VELOCITY_DEMON', // keys might be lowercase from JSON?
        'SPEED': 'VELOCITY_DEMON',
        'ETHICS': 'MORAL_COMPASS',
        'PATTERN': 'PATTERN_SEEKER'
    };

    return map[maxKey] || maxKey;
}

import ProfileHeader from "./ProfileHeader";

// ... keep imports ...

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = db.prepare('SELECT id, username, coins, sp_coins, traits_json, archetype_id, created_at FROM users WHERE id = ?').get(session.user.id) as any;

    if (!user) redirect('/login');

    const traits = JSON.parse(user.traits_json || '{}');
    // const archetype = calculateArchetype(traits); // Logic moved inside header or just passed raw? 
    // ProfileHeader uses user object directly.

    // Default traits list for visualization
    const traitKeys = ['LOGIC', 'SPEED', 'ETHICS', 'PATTERN'];

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.header}`}>
                <h1>IDENTITY_CARD</h1>
                <Link href="/" className="pixel-btn">RETURN</Link>
            </div>

            <div className={`pixel-border ${styles.card}`}>
                <ProfileHeader user={user} />

                {/* Stats Grid removed (moved to Header) or kept? 
                    ProfileHeader includes stats. So we remove statsGrid here.
                */}

                <div className={styles.traitsSection}>
                    <h3>EVALUATED_TRAITS</h3>
                    {traitKeys.map(key => {
                        const val = traits[key] || 0;
                        // Simple bar calc (assuming max 10 for MVP visual ?)
                        const width = Math.min(100, (val / 10) * 100);

                        return (
                            <div key={key} className={styles.traitRow}>
                                <div className={styles.traitLabel}>
                                    <span>{key}</span>
                                    <span>{val}</span>
                                </div>
                                <div className={styles.barContainer}>
                                    <div className={styles.barFill} style={{ width: `${width}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                    {true && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>* TRAITS EVOLVE WITH CHALLENGES</p>}
                </div>
            </div>
        </div>
    );
}
