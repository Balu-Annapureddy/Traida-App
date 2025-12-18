import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./dashboard"; // Client Component

export default async function AdminPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    // 1. Gate Access
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.user.id) as any;
    if (user.role !== 'ADMIN') {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '5rem', color: 'red' }}>
                <h1>403_FORBIDDEN</h1>
                <p>UNAUTHORIZED_ACCESS_DETECTED</p>
                <p>INCIDENT_LOGGED</p>
            </div>
        );
    }

    // 2. Fetch Stats
    const stats = {
        users: db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
        activeToday: db.prepare("SELECT COUNT(*) as count FROM users WHERE date(last_played_date) = date('now')").get() as any,
        reports: db.prepare('SELECT COUNT(*) as count FROM reports WHERE status = ?').get('PENDING') as any
    };

    // 3. Fetch Pending Reports
    const reports = db.prepare(`
        SELECT r.id, r.reason, r.timestamp, u.username as reporter, m.content as message, reported.username as offender
        FROM reports r
        JOIN users u ON r.reporter_id = u.id
        LEFT JOIN messages m ON r.message_id = m.id
        LEFT JOIN users reported ON r.reported_user_id = reported.id
        WHERE r.status = 'PENDING'
    `).all();

    // 4. Fetch Audit Log
    const logs = db.prepare(`
        SELECT l.action, l.details, l.timestamp, u.username as admin
        FROM audit_logs l
        JOIN users u ON l.admin_id = u.id
        ORDER BY l.timestamp DESC
        LIMIT 20
    `).all();

    return (
        <AdminDashboard
            stats={stats}
            reports={reports}
            logs={logs}
        />
    );
}
