import React from 'react';

interface ConsoleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export default function ConsoleInput({ label, style, ...props }: ConsoleInputProps) {
    return (
        <div style={{ marginBottom: 'var(--space-md)' }}>
            {label && (
                <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: 'var(--space-xs)'
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: '100%',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-muted)',
                    padding: '10px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                    ...style
                }}
                {...props}
            />
        </div>
    );
}
