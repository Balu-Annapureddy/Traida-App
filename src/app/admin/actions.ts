'use server';

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to verify admin
async function verifyAdmin() {
    const session = await getSession();
    if (!session) return null;
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.user.id) as any;
    if (user.role !== 'ADMIN') return null;
    return session.user.id;
}

export async function resolveReport(reportId: number, action: 'RESOLVE' | 'DISMISS') {
    const adminId = await verifyAdmin();
    if (!adminId) return { error: 'Unauthorized' };

    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(action, reportId);

    // Log
    db.prepare('INSERT INTO audit_logs (admin_id, action, target_id, details) VALUES (?, ?, ?, ?)')
        .run(adminId, 'RESOLVE_REPORT', reportId, action);

    revalidatePath('/admin');
}

export async function manageUser(username: string, action: 'MUTE' | 'BAN' | 'ACTIVE') {
    const adminId = await verifyAdmin();
    if (!adminId) return { error: 'Unauthorized' };

    const target = db.prepare('SELECT id FROM users WHERE username = ?').get(username) as any;
    if (!target) return { error: 'User not found' };

    // Prevent banning other admins
    const targetRole = db.prepare('SELECT role FROM users WHERE id = ?').get(target.id) as any;
    if (targetRole.role === 'ADMIN' && action === 'BAN') {
        return { error: 'Cannot ban admin' };
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(action, target.id);

    // Log
    db.prepare('INSERT INTO audit_logs (admin_id, action, target_id, details) VALUES (?, ?, ?, ?)')
        .run(adminId, 'MANAGE_USER', target.id, `Set status to ${action}`);

    revalidatePath('/admin');
    return { success: true };
}
