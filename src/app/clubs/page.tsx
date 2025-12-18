import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./clubs.module.css";

export const dynamic = 'force-dynamic';

export default async function ClubsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    // 1. Fetch My Clubs (Active or Pending Membership/Creation)
    const myClubs = db.prepare(`
        SELECT c.*, m.role, m.joined_at 
        FROM clubs c
        JOIN club_members m ON c.id = m.club_id
        WHERE m.user_id = ?
        ORDER BY c.status DESC, c.created_at DESC
    `).all(session.user.id) as any[];

    // 2. Fetch Public Active Clubs (Directory)
    // Exclude ones I'm already in
    const joinedIds = myClubs.map(c => c.id);
    const placeholders = joinedIds.length > 0 ? joinedIds.map(() => '?').join(',') : '0'; // 0 ensures syntax validity if empty

    const publicClubs = db.prepare(`
        SELECT c.*, 
        (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
        FROM clubs c
        WHERE c.status = 'ACTIVE' 
        AND c.is_private = 0
        AND c.id NOT IN (${placeholders})
        ORDER BY c.created_at DESC
        LIMIT 20
    `).all(...joinedIds) as any[];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>COMMUNITIES</h1>
                <Link href="/clubs/create" className="pixel-btn">CREATE_CLUB (+)</Link>
            </header>

            {/* MY CLUBS SECTION */}
            <section className={styles.section}>
                <h2>MY_AFFILIATIONS</h2>
                {myClubs.length === 0 ? (
                    <p style={{ color: '#666' }}>NO_CLUBS_JOINED</p>
                ) : (
                    <div className={styles.grid}>
                        {myClubs.map(club => (
                            <Link key={club.id} href={`/clubs/${club.id}`} className={`pixel-border ${styles.card}`}>
                                <div>
                                    <h3 className={styles.cardTitle}>{club.name}</h3>
                                    <span className={`${styles.status} ${club.status === 'ACTIVE' ? styles.statusActive : styles.statusPending}`}>
                                        {club.status}
                                    </span>
                                </div>
                                <div className={styles.meta}>
                                    <span>ROLE: {club.role}</span>
                                    <span>{club.is_private ? 'PRIVATE' : 'PUBLIC'}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* DIRECTORY SECTION */}
            <section className={styles.section}>
                <h2>PUBLIC_DIRECTORY</h2>
                {publicClubs.length === 0 ? (
                    <p style={{ color: '#666' }}>NO_PUBLIC_CLUBS_FOUND</p>
                ) : (
                    <div className={styles.grid}>
                        {publicClubs.map(club => (
                            <Link key={club.id} href={`/clubs/${club.id}`} className={`pixel-border ${styles.card}`}>
                                <div>
                                    <h3 className={styles.cardTitle}>{club.name}</h3>
                                    <p className={styles.cardDesc}>{club.description || 'No description'}</p>
                                </div>
                                <div className={styles.meta}>
                                    <span>MEMBERS: {club.member_count}/30</span>
                                    <span>OPEN</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
