import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import DMChat from "./DMChat";

export default async function DMPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const roomId = params.id;

    // Verify Access & Fetch Partner Name
    const room = db.prepare(`
        SELECT r.*, 
               u1.username as u1_name, u2.username as u2_name
        FROM dm_rooms r
        JOIN users u1 ON r.user_id_1 = u1.id
        JOIN users u2 ON r.user_id_2 = u2.id
        WHERE r.id = ?
    `).get(roomId) as any;

    if (!room) return <div>CHANNEL_LOST</div>;

    if (room.user_id_1 !== session.user.id && room.user_id_2 !== session.user.id) {
        return <div>ACCESS_DENIED</div>;
    }

    const isUser1 = room.user_id_1 === session.user.id;
    const partnerName = isUser1 ? room.u2_name : room.u1_name;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>LINK: {partnerName}</h1>
                <Link href="/dm" className="pixel-btn" style={{ fontSize: '0.8rem' }}>RETURN</Link>
            </header>

            <div style={{ flex: 1 }}>
                <DMChat roomId={parseInt(roomId)} currentUser={session.user} />
            </div>
        </div>
    );
}
