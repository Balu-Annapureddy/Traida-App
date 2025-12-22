'use client';

import { useState, useEffect, useRef } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type BinaryPulseProps = {
    data: any; // { sequence: "010110..." }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function BinaryPulse({ data, isDemo = false, onComplete }: BinaryPulseProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());
    const [failed, setFailed] = useState(false);

    // Auto-focus or key listener? Mobile-first -> On-screen buttons are safer.

    // MVP: Just match the string.
    const sequence = data?.sequence || "010101";

    const handleInput = (bit: string) => {
        if (failed || showDemo) return;

        const nextIndex = input.length;
        const expected = sequence[nextIndex];

        if (bit === expected) {
            const newInput = input + bit;
            setInput(newInput);

            // Check Success
            if (newInput.length === sequence.length) {
                onComplete(true, Date.now() - startTime);
            }
        } else {
            // Failure State
            setFailed(true);
            setTimeout(() => {
                onComplete(false, Date.now() - startTime); // Fail immediately
            }, 1000);
        }
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333', textAlign: 'center' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="SPEED: Tap 0 or 1 to match the sequence exactly. No errors allowed."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>BINARY_PULSE // SPEED</h3>

            <div style={{
                fontFamily: 'monospace',
                fontSize: '24px',
                letterSpacing: '5px',
                margin: '30px 0',
                wordBreak: 'break-all',
                color: failed ? '#f00' : '#fff'
            }}>
                {/* Render Sequence with highlighting */}
                {sequence.split('').map((char: string, i: number) => (
                    <span key={i} style={{
                        color: i < input.length ? '#0f0' : (i === input.length ? '#fff' : '#444'),
                        textDecoration: (failed && i === input.length) ? 'line-through' : 'none'
                    }}>
                        {char}
                    </span>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button
                    onClick={() => handleInput('0')}
                    style={{ padding: '20px 40px', fontSize: '24px', background: '#222', border: '1px solid #0f0', color: '#0f0' }}
                >
                    0
                </button>
                <button
                    onClick={() => handleInput('1')}
                    style={{ padding: '20px 40px', fontSize: '24px', background: '#222', border: '1px solid #0f0', color: '#0f0' }}
                >
                    1
                </button>
            </div>

            {failed && <div style={{ color: 'red', marginTop: '10px' }}>Sync Desynchronized. FAILURE.</div>}
        </div>
    );
}
