'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type SymbolSubstitutionProps = {
    data: any; // { map: {'★':'A'}, sequence: "★" }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function SymbolSubstitution({ data, isDemo = false, onComplete }: SymbolSubstitutionProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    const map = data?.map || {};
    const sequence: string = data?.sequence || "";

    const expected = sequence.split('').map(s => map[s] || '?').join('');

    const handleTap = (char: string) => {
        if (showDemo) return;
        if (input.length >= expected.length) return;

        const newVal = input + char;
        setInput(newVal);

        if (newVal.length === expected.length) {
            onComplete(newVal === expected, Date.now() - startTime);
        }
    };

    const handleBackspace = () => {
        setInput(prev => prev.slice(0, -1));
    };

    const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="SUBSTITUTION: Translate the symbols using the key."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>SYMBOL_SUB // ENCRYPTION</h3>

            {/* KEY */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px', padding: '10px', border: '1px solid #333' }}>
                {Object.entries(map).map(([sym, char]) => (
                    <div key={sym} style={{ fontSize: '14px' }}>
                        <span style={{ color: '#0ff' }}>{sym}</span> = {String(char)}
                    </div>
                ))}
            </div>

            {/* CHALLENGE */}
            <div style={{ textAlign: 'center', fontSize: '32px', letterSpacing: '5px', marginBottom: '10px', color: '#0ff' }}>
                {sequence}
            </div>

            {/* INPUT */}
            <div style={{ textAlign: 'center', fontSize: '24px', color: '#0f0', height: '40px', borderBottom: '1px solid #0f0', marginBottom: '20px' }}>
                {input}
            </div>

            {/* KEYBOARD */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                {keys.map(k => (
                    <button
                        key={k}
                        onClick={() => handleTap(k)}
                        style={{ width: '30px', height: '35px', background: '#222', border: '1px solid #444', color: '#fff', cursor: 'pointer' }}
                    >
                        {k}
                    </button>
                ))}
                <button
                    onClick={handleBackspace}
                    style={{ padding: '0 10px', background: '#300', border: '1px solid #f00', color: '#fff' }}
                >
                    DEL
                </button>
            </div>
        </div>
    );
}
