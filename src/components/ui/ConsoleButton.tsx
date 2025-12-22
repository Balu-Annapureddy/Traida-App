'use client';

import React from 'react';

interface ConsoleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export default function ConsoleButton({
    children,
    variant = 'primary',
    size = 'md',
    style,
    ...props
}: ConsoleButtonProps) {

    let bg = 'var(--text-primary)';
    let color = 'var(--bg-app)';
    let border = 'none';

    if (variant === 'secondary') {
        bg = 'transparent';
        color = 'var(--text-primary)';
        border = '1px solid var(--border-muted)';
    } else if (variant === 'ghost') {
        bg = 'transparent';
        color = 'var(--text-secondary)';
    } else if (variant === 'danger') {
        bg = 'var(--accent-error)';
        color = '#fff';
    }

    const padding = size === 'sm' ? '4px 8px' : (size === 'lg' ? '12px 24px' : '8px 16px');
    const fontSize = size === 'sm' ? '12px' : (size === 'lg' ? '16px' : '14px');

    return (
        <button
            style={{
                background: bg,
                color: color,
                border: border,
                padding: padding,
                fontSize: fontSize,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.1s ease',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                ...style
            }}
            {...props}
        >
            {children}
        </button>
    );
}
