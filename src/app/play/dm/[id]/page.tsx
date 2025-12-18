import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DMInterface from "./dm-interface";
import styles from "./chat.module.css"; // Reuse chat styles for convenience (need to ensure path is correct)
// Actually we need to copy or share styles. But dm-interface imports styles from ./chat.module.css
// Wait, dm-interface.tsx is in src/app/play/dm/[id]/. 
// I need `chat.module.css` there too or import from relative path. 
// For now I will assume I need to Create `chat.module.css` in this folder OR import from `../../room/chat.module.css`.
// Let's use `../../room/chat.module.css`.

export default async function DMPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session) redirect('/login');

    const amigoId = parseInt(params.id);

    // Verify Access & Get Friend Name
    const amigo = db.prepare(`
        SELECT a.id, a.user_id_1, a.user_id_2, u1.username as user1, u2.username as user2 
        FROM amigos a
        JOIN users u1 ON a.user_id_1 = u1.id
        JOIN users u2 ON a.user_id_2 = u2.id
        WHERE a.id = ?
    `).get(amigoId) as any;

    if (!amigo) redirect('/amigos');
    if (amigo.user_id_1 !== session.user.id && amigo.user_id_2 !== session.user.id) redirect('/amigos');

    const friendName = amigo.user_id_1 === session.user.id ? amigo.user2 : amigo.user1;

    return (
        <DMInterface
            amigoId={amigoId}
            username={session.user.username}
            friendName={friendName}
        />
    );
}
