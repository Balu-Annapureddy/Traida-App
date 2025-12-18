"use client";

import { useState } from "react";
// Inline styles for speed

const SIGNALS = ['FOCUSED', 'CURIOUS', 'CALM', 'TIRED', 'DISTRACTED'];

export default function SignalCard({ contextId, onComplete }: { contextId?: string, onComplete?: () => void }) {
    const [submitted, setSubmitted] = useState(false);

    async function handleSelect(signal: string) {
        try {
            await fetch('/api/signals', {
                method: 'POST',
                body: JSON.stringify({ type: 'DAILY', content: signal, contextId })
            });
            setSubmitted(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);
        } catch (e) { }
    }

    if (submitted) {
        return (
            <div className="pixel-border" style={{ padding: '2rem', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                <p style={{ color: 'var(--primary)' }}>SIGNAL_LOGGED</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Pattern Recorded.</p>
            </div>
        );
    }

    return (
        <div className="pixel-border" style={{ padding: '1.5rem', maxWidth: '400px', margin: '1rem auto' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#aaa', fontSize: '0.9rem' }}>HOW_IS_YOUR_MIND?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {SIGNALS.map(s => (
                    <button
                        key={s}
                        className="pixel-btn"
                        onClick={() => handleSelect(s)}
                        style={{ fontSize: '0.8rem', padding: '10px' }}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.6rem', color: '#444', marginTop: '1rem' }}>PRIVATE • OPTIONAL • NO SCORE</p>
        </div>
    );
}
