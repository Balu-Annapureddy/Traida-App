export default function BuildersPage() {
    const engines = [
        { name: 'Pixel-Doku', slug: 'pixel-doku' },
        { name: 'Mirror Grid', slug: 'mirror-grid' },
        { name: 'Binary Pulse', slug: 'binary-pulse' },
        { name: 'Rapid Cipher', slug: 'rapid-cipher' },
        { name: 'Shift Key', slug: 'shift-key' },
        { name: 'Symbol Substitution', slug: 'symbol-substitution' },
        { name: 'Glitch-Find', slug: 'glitch-find' },
        { name: 'Circuit Builder', slug: 'circuit-builder' },
        { name: 'Inkblot', slug: 'inkblot' },
        { name: 'Echo Prompt', slug: 'echo-prompt' },
    ];

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#fff' }}>ENGINE_BUILDERS</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {engines.map(e => (
                    <a
                        key={e.slug}
                        href={`/admin/builders/${e.slug}`}
                        style={{
                            display: 'block',
                            padding: '20px',
                            background: '#111',
                            border: '1px solid #333',
                            color: '#0f0',
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {e.name}
                    </a>
                ))}
            </div>
        </div>
    );
}
