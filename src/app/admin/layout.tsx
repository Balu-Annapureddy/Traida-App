import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Strict Role Check
    const user = await getSession();

    // getSession now returns the user object directly if valid
    if (!user || user.role !== 'ADMIN') {
        // Hard Redirect
        redirect('/dashboard');
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            {/* Admin Header - distinct from User Header */}
            <header style={{
                background: '#220000', // Deep Red for Admin Context
                borderBottom: '1px solid #f00',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontWeight: 'bold', color: '#f00', letterSpacing: '1px' }}>ADMIN_LAB // CURATOR_MODE</div>
                <nav style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                    <a href="/admin/builders" style={{ color: '#fff', textDecoration: 'none' }}>BUILDERS</a>
                    <a href="/admin/scheduler" style={{ color: '#fff', textDecoration: 'none' }}>SCHEDULER</a>
                    <a href="/admin/logs" style={{ color: '#fff', textDecoration: 'none' }}>AUDIT_LOGS</a>
                </nav>
            </header>

            <main style={{ flex: 1, padding: '2rem', background: '#050000', color: '#aaa' }}>
                {children}
            </main>
        </div>
    );
}
