'use client';

type DemoOverlayProps = {
    instructions: string;
    onStart: () => void;
};

export default function DemoOverlay({ instructions, onStart }: DemoOverlayProps) {
    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 10, 10, 0.95)',
            color: 'var(--foreground)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--secondary)' }}>
                SIMULATION MODE
            </h2>
            <p style={{ maxWidth: '400px', marginBottom: '3rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
                {instructions}
            </p>
            <div className="pixel-border" style={{ padding: '1rem 2rem', marginBottom: '2rem', background: 'var(--bg-app)' }}>
                Training Environment Active
            </div>
            <button
                onClick={onStart}
                className="pixel-btn"
                style={{
                    padding: '0.75rem 2rem',
                    minWidth: '200px'
                }}
            >
                Begin Protocol
            </button>
        </div>
    );
}
