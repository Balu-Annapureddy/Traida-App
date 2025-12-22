'use client';

import { useState } from 'react';

export default function ShiftKeyBuilder() {
    const [text, setText] = useState('HELLO');
    const [shift, setShift] = useState(1);
    const [jsonOutput, setJsonOutput] = useState('');

    const updateJson = (t: string, s: number) => {
        const data = {
            text: t.toUpperCase(),
            shift: s
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>SHIFT_KEY // BUILDER</h2>

            <div style={{ marginBottom: '20px' }}>
                <label>Text to Encrypt: </label>
                <input
                    value={text}
                    onChange={e => { setText(e.target.value); updateJson(e.target.value, shift); }}
                    style={{ background: '#111', color: '#fff', padding: '5px' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Shift Amount: </label>
                <input
                    type="number"
                    value={shift}
                    onChange={e => { setShift(parseInt(e.target.value)); updateJson(text, parseInt(e.target.value)); }}
                    style={{ background: '#111', color: '#fff', padding: '5px' }}
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
