'use client';

import { useState } from 'react';

export default function BinaryPulseBuilder() {
    const [sequence, setSequence] = useState('0101');
    const [jsonOutput, setJsonOutput] = useState('');

    const handleChange = (val: string) => {
        // Filter non-binary
        const clean = val.replace(/[^01]/g, '');
        setSequence(clean);

        const data = {
            sequence: clean
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>BINARY_PULSE // BUILDER</h2>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Sequence (0s and 1s only):</label>
                <input
                    type="text"
                    value={sequence}
                    onChange={(e) => handleChange(e.target.value)}
                    style={{
                        background: '#111', color: '#fff', border: '1px solid #444',
                        padding: '10px', width: '300px', letterSpacing: '2px', fontFamily: 'monospace'
                    }}
                />
            </div>

            <textarea
                value={jsonOutput}
                readOnly
                style={{ width: '400px', height: '200px', background: '#111', color: '#0f0', fontFamily: 'monospace' }}
            />
        </div>
    );
}
