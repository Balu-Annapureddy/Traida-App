'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type InkblotProps = {
    data: any; // { path: "M..." } or { seed: 123 }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function Inkblot({ data, isDemo = false, onComplete }: InkblotProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    // Generate random blob if no path provided
    // MVP: Single static blob for now, or random CSS border-radius
    const blobShape = data?.radius || "60% 40% 30% 70% / 60% 30% 70% 40%";

    const handleSubmit = () => {
        if (input.trim().length < 3) return; // Min length
        onComplete(true, Date.now() - startTime);
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333', textAlign: 'center' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="PERCEPTION: What do you see? There is no wrong answer."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>INKBLOT // CREATIVITY</h3>

            <div style={{
                margin: '20px auto',
                width: '200px', height: '200px',
                background: '#fff',
                borderRadius: blobShape,
                filter: 'blur(2px)',
                transition: 'border-radius 1s'
            }}></div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I see..."
                style={{
                    width: '100%', height: '80px',
                    background: '#111', color: '#fff',
                    border: '1px solid #444', padding: '10px',
                    marginBottom: '20px'
                }}
            />

            <button
                onClick={handleSubmit}
                style={{
                    padding: '10px 20px',
                    background: input.length > 2 ? '#0f0' : '#333',
                    color: input.length > 2 ? '#000' : '#888',
                    cursor: input.length > 2 ? 'pointer' : 'not-allowed',
                    border: 'none'
                }}
            >
                RECORD_PERCEPTION
            </button>
        </div>
    );
}
