'use client';

import { useState } from 'react';

export default function InkblotBuilder() {
    const [radius, setRadius] = useState('60% 40% 30% 70% / 60% 30% 70% 40%');
    const [jsonOutput, setJsonOutput] = useState('');

    const generate = () => {
        const data = { radius };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>INKBLOT // BUILDER</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>Border Radius (CSS):</label>
                <input
                    value={radius}
                    onChange={e => setRadius(e.target.value)}
                    style={{ width: '100%', background: '#111', color: '#fff' }}
                />
            </div>

            <div style={{
                width: '100px', height: '100px',
                background: '#fff',
                borderRadius: radius,
                marginBottom: '20px'
            }}></div>

            <button onClick={generate} style={{ marginBottom: '10px' }}>Generate JSON</button>
            <textarea value={jsonOutput} readOnly style={{ width: '100%', height: '200px', background: '#000', color: '#0f0' }} />
        </div>
    );
}
