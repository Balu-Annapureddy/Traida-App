'use client';

import { useState } from 'react';

export default function GlitchFindBuilder() {
    const [size, setSize] = useState(5);
    const [symbol, setSymbol] = useState('0');
    const [glitch, setGlitch] = useState('O');
    const [target, setTarget] = useState(-1); // -1 = Random
    const [jsonOutput, setJsonOutput] = useState('');

    const generate = () => {
        const data: any = { size, symbol, glitch };
        if (target >= 0) data.target = target;
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>GLITCH_FIND // BUILDER</h2>
            <div style={{ marginBottom: '10px' }}>Size: <input type="number" value={size} onChange={e => setSize(parseInt(e.target.value))} /></div>
            <div style={{ marginBottom: '10px' }}>Symbol: <input value={symbol} onChange={e => setSymbol(e.target.value)} /></div>
            <div style={{ marginBottom: '10px' }}>Glitch: <input value={glitch} onChange={e => setGlitch(e.target.value)} /></div>
            <div style={{ marginBottom: '10px' }}>Target Index (-1 for Random): <input type="number" value={target} onChange={e => setTarget(parseInt(e.target.value))} /></div>

            <button onClick={generate} style={{ marginBottom: '10px' }}>Generate JSON</button>
            <textarea value={jsonOutput} readOnly style={{ width: '100%', height: '200px', background: '#000', color: '#0f0' }} />
        </div>
    );
}
