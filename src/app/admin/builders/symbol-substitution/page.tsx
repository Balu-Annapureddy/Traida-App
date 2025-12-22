'use client';

import { useState } from 'react';

export default function SymbolSubBuilder() {
    const [sequence, setSequence] = useState('★ ■ ★');
    const [mapStr, setMapStr] = useState('★=A, ■=B');
    const [jsonOutput, setJsonOutput] = useState('');

    const generate = () => {
        const map: any = {};
        mapStr.split(',').forEach(pair => {
            const [sym, char] = pair.split('=');
            if (sym && char) map[sym.trim()] = char.trim();
        });

        const data = {
            sequence,
            map
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>SYMBOL_SUB // BUILDER</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>Sequence (Symbols):</label>
                <input
                    value={sequence}
                    onChange={e => setSequence(e.target.value)}
                    style={{ width: '100%', background: '#111', color: '#fff' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Map (Sym=Char, ...):</label>
                <input
                    value={mapStr}
                    onChange={e => setMapStr(e.target.value)}
                    style={{ width: '100%', background: '#111', color: '#fff' }}
                />
            </div>
            <button onClick={generate} style={{ marginBottom: '10px' }}>Generate JSON</button>
            <textarea value={jsonOutput} readOnly style={{ width: '100%', height: '200px', background: '#000', color: '#0f0' }} />
        </div>
    );
}
