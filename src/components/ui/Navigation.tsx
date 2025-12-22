'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    const navItems = [
        { label: 'PROTOCOL', path: '/dashboard', icon: '◧' },   // Grid/Home
        { label: 'LIBER', path: '/liber', icon: '∞' },         // Practice
        { label: 'PROFILE', path: '/profile', icon: '👤' },    // User
    ];

    return (
        <>
            {/* DESKTOP SIDEBAR (Visible on lg screens, hidden on mobile - check CSS logic later, for now inline media query simulation or simple CSS class) */}
            <nav className="desktop-sidebar" style={{
                position: 'fixed', left: 0, top: 0, bottom: 0,
                width: '60px', background: 'var(--card-bg)',
                borderRight: '1px solid var(--card-border)',
                display: 'none', // Hidden by default, enable via CSS media query
                flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '40px',
                zIndex: 100
            }}>
                <div style={{ color: 'var(--foreground)', fontWeight: 'bold' }}>T</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            href={item.path}
                            style={{
                                color: isActive(item.path) ? 'var(--foreground)' : 'var(--secondary)',
                                textDecoration: 'none', fontSize: '24px',
                                padding: '10px'
                            }}
                        >
                            {item.icon}
                        </Link>
                    ))}
                </div>
            </nav>

            {/* MOBILE BOTTOM BAR (Fixed bottom) */}
            <nav className="mobile-bottom-bar" style={{
                position: 'fixed', left: 0, right: 0, bottom: 0,
                height: '60px', background: 'var(--card-bg)',
                borderTop: '1px solid var(--card-border)',
                display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                zIndex: 100
            }}>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            color: isActive(item.path) ? 'var(--foreground)' : 'var(--secondary)',
                            textDecoration: 'none', gap: '2px'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span style={{ fontSize: '10px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <style jsx global>{`
                @media (min-width: 768px) {
                    .desktop-sidebar { display: flex !important; }
                    .mobile-bottom-bar { display: none !important; }
                    main { margin-left: 60px; margin-bottom: 0; }
                }
                @media (max-width: 767px) {
                    main { margin-bottom: 60px; }
                }
            `}</style>
        </>
    );
}
