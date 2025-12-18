import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "../../clubs.module.css";
import ClubChat from "./ClubChat";
import JoinButton from "./JoinButton"; // Extract Clean Logic
import ManageClub from "./ManageClub";

export default async function ClubPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const clubId = params.id;

    // 1. Fetch Club
    const club = db.prepare('SELECT * FROM clubs WHERE id = ?').get(clubId) as any;
    if (!club) return <div>CLUB_NOT_FOUND</div>;

    // 2. Fetch Membership
    const membership = db.prepare('SELECT role FROM club_members WHERE club_id = ? AND user_id = ?').get(clubId, session.user.id) as any;
    const userRole = membership ? membership.role : null;

    // 3. Count Members
    const count = db.prepare('SELECT COUNT(*) as count FROM club_members WHERE club_id = ?').get(clubId) as any;

    const isMember = !!membership;
    const isPending = club.status === 'PENDING';
    const isRejected = club.status === 'REJECTED';

    if (isPending && club.creator_id !== session.user.id && !session.user.role?.includes('ADMIN')) {
        return <div>CLUB_PENDING_APPROVAL</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>{club.name}</h1>
                    <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span>STATUS: <span style={{ color: getStatusColor(club.status) }}>{club.status}</span></span>
                        <span>MEMBERS: {count.count}/30</span>
                        <span>TYPE: {club.is_private ? 'PRIVATE' : 'PUBLIC'}</span>
                        {['CREATOR', 'MODERATOR'].includes(userRole) && (
                            <ManageClub clubId={club.id} currentUserRole={userRole} />
                        )}
                    </div>
                </div>
                <Link href="/clubs" className="pixel-btn">RETURN</Link>
            </header>

            <div className={styles.section}>
                <p className="pixel-border" style={{ padding: '1rem', color: '#aaa' }}>{club.description || 'No Description'}</p>
            </div>

            {isMember ? (
                <div className={styles.section}>
                    <h2 style={{ color: 'var(--primary)' }}>SECURE_CHANNEL</h2>
                    {club.status === 'ACTIVE' ? (
                        <ClubChat clubId={club.id} currentUser={session.user} />
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #444', color: '#888' }}>
                            CHANNEL_OFFLINE (CLUB_{club.status})
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.section} style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>NON_MEMBER_ACCESS</h2>
                    <p style={{ marginBottom: '2rem' }}>You are viewing the public profile of this club.</p>

                    {club.status === 'ACTIVE' && (
                        <JoinButton clubId={club.id} />
                    )}
                </div>
            )}
        </div>
    );
}

function getStatusColor(status: string) {
    if (status === 'ACTIVE') return 'var(--primary)';
    if (status === 'PENDING') return 'orange';
    return 'red';
}
