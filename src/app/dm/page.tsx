import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db"; // Use same server-side logic as API or call API? Server component can query DB directly. 
// Server Fetching is better pattern.

export const dynamic = 'force-dynamic';

export default async function DMInboxPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const userId = session.user.id;

    // Direct DB Query for Server Component efficiency
    const rooms = db.prepare(`
        SELECT r.*, 
               u1.username as u1_name, u2.username as u2_name
        FROM dm_rooms r
        JOIN users u1 ON r.user_id_1 = u1.id
        JOIN users u2 ON r.user_id_2 = u2.id
        WHERE r.user_id_1 = ? OR r.user_id_2 = ?
        ORDER BY r.last_activity_at DESC
    `).all(userId, userId) as any[];

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1>COMM_LINKS</h1>
                <Link href="/amigos" className="pixel-btn">NEW_LINK (+)</Link>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rooms.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>NO_ACTIVE_CHANNELS</p>}

                {rooms.map(r => {
                    const isUser1 = r.user_id_1 === userId;
                    const partnerName = isUser1 ? r.u2_name : r.u1_name;

                    return (
                        <Link key={r.id} href={`/dm/${r.id}`} className="pixel-border" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--primary)' }}>{partnerName}</h3>
                                <span style={{ fontSize: '0.7rem', color: '#666' }}>LAST_ACT: {new Date(r.last_activity_at).toLocaleDateString()}</span>
                            </div>
                            <span className="pixel-btn" style={{ fontSize: '0.8rem' }}>OPEN</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
