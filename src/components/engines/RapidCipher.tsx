'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type RapidCipherProps = {
    data: any; // { key: {A:1, B:2...}, ciphertext: "CAB" }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function RapidCipher({ data, isDemo = false, onComplete }: RapidCipherProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    const key = data?.key || {};
    const ciphertext = data?.ciphertext || "";

    // Calculate expected numeric string? Or just assume solution is provided in prompt props?
    // Let's assume user inputs the VALUES mapped from the key.
    // e.g. A=1, B=2. Cipher="AB". Input="12".

    const expected = ciphertext.split('').map((char: string) => key[char]).join('');

    const handleTap = (val: string) => {
        if (showDemo) return;

        const newVal = input + val;

        // Validation check (immediate fail if wrong? Or wait for submit?)
        // "Speed" usually implies immediate feedback or race.
        // Let's check length.

        if (newVal.length > expected.length) return; // Cap length

        setInput(newVal);

        if (newVal.length === expected.length) {
            const correct = newVal === expected;
            onComplete(correct, Date.now() - startTime);
        }
    };

    const handleBackspace = () => {
        setInput(prev => prev.slice(0, -1));
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="DECODE: Use the key to translate the text. Be fast."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>RAPID_CIPHER // SPEED</h3>

            {/* KEY */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px', opacity: 0.8 }}>
                {Object.entries(key).map(([k, v]) => (
                    <div key={k} style={{ border: '1px solid #444', padding: '5px 10px', fontSize: '12px' }}>
                        {k}:{String(v)}
                    </div>
                ))}
            </div>

            {/* CIPHERTEXT */}
            <div style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '3px', marginBottom: '10px' }}>
                {ciphertext}
            </div>

            {/* USER INPUT DISPLAY */}
            <div style={{
                height: '40px',
                borderBottom: '2px solid #0f0',
                textAlign: 'center',
                fontSize: '24px',
                marginBottom: '20px',
                color: '#0f0'
            }}>
                {input}
            </div>

            {/* NUMPAD (Assuming values are 0-9) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                    <button
                        key={num}
                        onClick={() => handleTap(num.toString())}
                        style={{ padding: '15px', background: '#222', border: '1px solid #555', color: '#fff' }}
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleBackspace}
                    style={{ gridColumn: 'span 2', background: '#300', border: '1px solid #f00' }}
                >
                    DEL
                </button>
            </div>
        </div>
    );
}
