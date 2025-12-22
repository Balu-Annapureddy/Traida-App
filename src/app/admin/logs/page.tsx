import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getLogs() {
    // In a real app we'd paginate. MVP: Last 50.
    const logs = db.prepare(`
        SELECT admin_logs.*, users.username as admin_name 
        FROM admin_logs 
        JOIN users ON admin_logs.admin_id = users.id 
        ORDER BY admin_logs.created_at DESC 
        LIMIT 50
    `).all();
    return logs;
}

export default async function AdminLogsPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') redirect('/dashboard');

    const logs = await getLogs();

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                AUDIT_LOG // SYSTEM_TRAIL
            </h1>

            <div style={{ background: '#111', border: '1px solid #333' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#222', color: '#888' }}>
                            <th style={{ padding: '10px' }}>TIMESTAMP</th>
                            <th style={{ padding: '10px' }}>ADMIN</th>
                            <th style={{ padding: '10px' }}>ACTION</th>
                            <th style={{ padding: '10px' }}>TARGET</th>
                            <th style={{ padding: '10px' }}>DETAILS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: any) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #222', color: '#ccc' }}>
                                <td style={{ padding: '10px', whiteSpace: 'nowrap', color: '#666' }}>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td style={{ padding: '10px', color: '#0f0' }}>{log.admin_name}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.action}</td>
                                <td style={{ padding: '10px' }}>{log.target_id || '-'}</td>
                                <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>
                                    {log.details_json ? log.details_json.substring(0, 50) + (log.details_json.length > 50 ? '...' : '') : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>NO LOGS FOUND</div>
                )}
            </div>
        </div>
    );
}
