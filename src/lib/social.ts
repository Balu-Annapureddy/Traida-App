import { db } from "./db";

export class SocialUtils {
    // Enforce sorted IDs rule
    static getSortedPair(id1: number, id2: number) {
        return id1 < id2 ? { id1: id1, id2: id2 } : { id1: id2, id2: id1 };
    }

    // Check if a block exists between two users
    static getRelationshipStatus(userId1: number, userId2: number) {
        const { id1, id2 } = this.getSortedPair(userId1, userId2);

        const rel = db.prepare('SELECT status, action_user_id FROM amigos WHERE user_id_1 = ? AND user_id_2 = ?').get(id1, id2) as any;
        return rel; // returns { status: 'PENDING'|'ACCEPTED'|'BLOCKED', action_user_id: number } or undefined
    }

    // Check rate limit for Amigo Requests (5/day)
    static checkFriendRequestLimit(userId: number): boolean {
        const today = new Date().toISOString().split('T')[0];

        // Count requests initiated by user today
        // Note: 'created_at' is stored. We need to check requests where action_user_id = user AND status = 'PENDING' (or any status really, if we count attempts)
        // Hardening rule: "Amigo requests: 5/day". This implies attempts.
        // We look at 'amigos' table where created_at is today AND action_user_id = userId AND status='PENDING' (usually).
        // Actually, if they became friends, it still counts as a request made today.

        const count = db.prepare(`
            SELECT COUNT(*) as count 
            FROM amigos 
            WHERE action_user_id = ? 
            AND date(created_at) = date('now')
            AND status = 'PENDING'
        `).get(userId) as any;

        return count.count < 5;
    }

    // Send Notification
    static sendNotification(targetUserId: number, type: 'AMIGO_REQ' | 'DM' | 'CLUB_INVITE' | 'SYSTEM', sourceId: number | null, message: string) {
        try {
            db.prepare(`
                INSERT INTO notifications (user_id, type, source_id, message)
                VALUES (?, ?, ?, ?)
            `).run(targetUserId, type, sourceId, message);
        } catch (e) {
            console.error("Failed to send notification", e);
        }
    }
}
