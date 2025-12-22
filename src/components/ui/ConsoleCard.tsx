import React from 'react';
import '@/styles/theme.css'; // Ensure theme vars are available

interface ConsoleCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export default function ConsoleCard({ children, title, className = '' }: ConsoleCardProps) {
    return (
        <div
            className={className}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-muted)',
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-md)',
                boxShadow: 'var(--shadow-card)',
                borderRadius: 'var(--radius-sm)'
            }}
        >
            {title && (
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-md)',
                    borderBottom: '1px solid var(--border-muted)',
                    paddingBottom: 'var(--space-xs)',
                    letterSpacing: '1px'
                }}>
                    {title}
                </div>
            )}
            {children}
        </div>
    );
}
