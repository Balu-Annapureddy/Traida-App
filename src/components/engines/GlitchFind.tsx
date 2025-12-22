'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type GlitchFindProps = {
    data: any; // { size: 5, target: 12, symbol: 'X', glitch: 'Y' }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function GlitchFind({ data, isDemo = false, onComplete }: GlitchFindProps) {
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    // Default 5x5
    const size = data?.size || 5;
    const total = size * size;
    const targetIndex = data?.target !== undefined ? data.target : Math.floor(Math.random() * total);

    const symbol = data?.symbol || "0";
    const glitch = data?.glitch || "O"; // Zero vs O

    const handleCellClick = (index: number) => {
        if (showDemo) return;

        if (index === targetIndex) {
            onComplete(true, Date.now() - startTime);
        } else {
            // Immediate fail on wrong click? Or penalty?
            // Pattern matching usually allows retries with penalty or just fails.
            // Prompt says "Visual Reasoning".
            // Let's go with Immediate Fail for "Correction" strictness.
            onComplete(false, Date.now() - startTime);
        }
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="ANOMALY: Identify the glitch. One cell is different."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>GLITCH_FIND // PATTERN</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 40px)`,
                gap: '2px',
                justifyContent: 'center',
                margin: '20px'
            }}>
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        onClick={() => handleCellClick(i)}
                        style={{
                            width: '40px', height: '40px',
                            background: '#111',
                            border: '1px solid #333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: i === targetIndex ? '#ccc' : '#888', // Subtle color diff? Or identical color?
                            // Let's rely on Character diff mostly.
                            fontSize: '20px'
                        }}
                    >
                        {i === targetIndex ? glitch : symbol}
                    </div>
                ))}
            </div>
        </div>
    );
}
