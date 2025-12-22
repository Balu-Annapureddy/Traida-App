'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type ShiftKeyProps = {
    data: any; // { shift: 1, text: "HAL" } -> Expect "IBM" (or decrypt logic?)
    // Let's assume prompt is "Encrypt this" or "Decrypt this". 
    // Standard: "Apply Process". Text + Shift -> Result.
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function ShiftKey({ data, isDemo = false, onComplete }: ShiftKeyProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    const shift = data?.shift || 1;
    const text = data?.text || "TEST";

    // Logic: Caesar Shift
    const shiftChar = (char: string, n: number) => {
        const code = char.charCodeAt(0);
        // Assume A-Z (65-90)
        if (code >= 65 && code <= 90) {
            let nCode = code + n;
            if (nCode > 90) nCode = 65 + (nCode - 91);
            if (nCode < 65) nCode = 90 - (64 - nCode);
            return String.fromCharCode(nCode);
        }
        return char;
    };

    const expected = text.split('').map((c: string) => shiftChar(c, shift)).join('');

    const handleTap = (char: string) => {
        if (showDemo) return;

        const newVal = input + char;
        if (newVal.length > expected.length) return;

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
                    instructions={`RULE: SHIFT ${shift > 0 ? '+' : ''}${shift}. Transform the text.`}
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>SHIFT_KEY // ENCRYPTION</h3>

            <div style={{ textAlign: 'center', margin: '20px' }}>
                <div style={{ fontSize: '14px', color: '#888' }}>RULE</div>
                <div style={{ fontSize: '24px', color: '#0ff' }}>SHIFT {shift > 0 ? '+' : ''}{shift}</div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '32px', letterSpacing: '5px', marginBottom: '10px' }}>
                {text}
            </div>

            <div style={{ textAlign: 'center', fontSize: '24px', color: '#0f0', borderBottom: '2px solid #0f0', height: '40px', marginBottom: '20px' }}>
                {input}
            </div>

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
                    &larr;
                </button>
            </div>
        </div>
    );
}
