import React from 'react';

type StatusType = 'LOCKED' | 'AVAILABLE' | 'COMPLETED' | 'FAILED' | 'PENDING';

interface StatusTagProps {
    status: StatusType;
}

export default function StatusTag({ status }: StatusTagProps) {
    let color = 'var(--text-muted)';

    switch (status) {
        case 'AVAILABLE': color = 'var(--accent-primary)'; break;
        case 'COMPLETED': color = 'var(--accent-info)'; break;
        case 'FAILED': color = 'var(--accent-error)'; break;
        case 'PENDING': color = 'var(--accent-warn)'; break;
        case 'LOCKED': default: color = 'var(--text-muted)'; break;
    }

    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            border: `1px solid ${color}`,
            color: color,
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        }}>
            {status}
        </span>
    );
}
