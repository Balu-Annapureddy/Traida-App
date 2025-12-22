'use client';

import { useState, useEffect } from 'react';

export default function RapidCipherBuilder() {
    const [ciphertext, setCiphertext] = useState('CAB');
    const [keyMap, setKeyMap] = useState("A=1, B=2, C=3");
    const [jsonOutput, setJsonOutput] = useState('');

    useEffect(() => {
        updateJson();
    }, [ciphertext, keyMap]);

    const updateJson = () => {
        // Parse key map string "A=1, B=2" -> {A:1, B:2}
        const keyObj: any = {};
        const pairs = keyMap.split(',').map(s => s.trim());
        pairs.forEach(p => {
            const [k, v] = p.split('=');
            if (k && v) {
                keyObj[k.trim().toUpperCase()] = parseInt(v.trim());
            }
        });

        const data = {
            ciphertext: ciphertext.toUpperCase(),
            key: keyObj
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>RAPID_CIPHER // BUILDER</h2>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Ciphertext (Text to Decode):</label>
                <input
                    type="text"
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    style={{ background: '#111', color: '#fff', border: '1px solid #444', padding: '10px', width: '300px' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Key Mapping (Format: A=1, B=2):</label>
                <textarea
                    value={keyMap}
                    onChange={(e) => setKeyMap(e.target.value)}
                    style={{ background: '#111', color: '#fff', border: '1px solid #444', padding: '10px', width: '300px', height: '100px' }}
                />
            </div>

            <textarea
                value={jsonOutput}
                readOnly
                style={{ width: '400px', height: '300px', background: '#111', color: '#0f0', fontFamily: 'monospace' }}
            />
        </div>
    );
}
