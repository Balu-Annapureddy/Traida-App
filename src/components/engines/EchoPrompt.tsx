'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type EchoPromptProps = {
    data: any; // { question: "..." }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function EchoPrompt({ data, isDemo = false, onComplete }: EchoPromptProps) {
    const [input, setInput] = useState("");
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    const question = data?.question || "What matters most right now?";

    const handleSubmit = () => {
        if (input.trim().length < 3) return;
        onComplete(true, Date.now() - startTime);
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333', textAlign: 'center' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="REFLECTION: Answer honestly. The system listens."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>ECHO_PROMPT // CREATIVITY</h3>

            <div style={{ fontSize: '20px', margin: '30px 0', color: '#0ff', fontStyle: 'italic' }}>
                "{question}"
            </div>

            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="..."
                style={{
                    width: '100%', height: '100px',
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
                TRANSMIT_THOUGHT
            </button>
        </div>
    );
}
