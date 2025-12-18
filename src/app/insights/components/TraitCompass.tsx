"use client";

import { useMemo } from "react";
import styles from "../insights.module.css";

// Traits: Logic, Pattern, Speed, Encryption, Creativity (Example set)
const TRAIT_KEYS = ['logic', 'pattern', 'speed', 'encryption', 'creativity']; // Adjust if real keys differ

export default function TraitCompass({ current, previous }: { current: any, previous: any }) {

    // Normalize traits to 0-100 (assuming they are unbounded integers)
    // We need a max value for scaling. Let's assume 100 is "high" or calculate dynamic max.
    // For visual consistency, let's use a fixed max like 50 for MVP or max of set.

    const maxVal = useMemo(() => {
        const allVals = [...Object.values(current || {}) as number[], ...(previous ? Object.values(previous) as number[] : [])];
        return Math.max(50, ...allVals);
    }, [current, previous]);

    function getPoints(traits: any) {
        if (!traits) return "";
        const center = 150;
        const radius = 100;
        const angleStep = (Math.PI * 2) / TRAIT_KEYS.length;

        return TRAIT_KEYS.map((key, i) => {
            const val = (traits[key] || 0);
            const r = (val / maxVal) * radius;
            const angle = i * angleStep - Math.PI / 2; // Start at top
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
        }).join(" ");
    }

    const currentPoints = getPoints(current);
    const prevPoints = getPoints(previous);
    const center = 150;

    return (
        <div className={`pixel-border ${styles.compassContainer}`}>
            <svg width="300" height="300">
                {/* Background Web */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
                    <circle key={scale} cx={center} cy={center} r={100 * scale} fill="none" stroke="#222" strokeWidth="1" />
                ))}

                {/* Axes */}
                {TRAIT_KEYS.map((key, i) => {
                    const angle = i * ((Math.PI * 2) / TRAIT_KEYS.length) - Math.PI / 2;
                    const x = center + 100 * Math.cos(angle);
                    const y = center + 100 * Math.sin(angle);
                    return <line key={key} x1={center} y1={center} x2={x} y2={y} stroke="#222" />;
                })}

                {/* Previous (Ghost) */}
                {previous && (
                    <polygon points={prevPoints} fill="none" stroke="#444" strokeWidth="2" strokeDasharray="4 4" />
                )}

                {/* Current */}
                <polygon points={currentPoints} fill="rgba(0, 255, 0, 0.1)" stroke="var(--primary)" strokeWidth="2" />

                {/* Labels */}
                {TRAIT_KEYS.map((key, i) => {
                    const angle = i * ((Math.PI * 2) / TRAIT_KEYS.length) - Math.PI / 2;
                    const x = center + 120 * Math.cos(angle);
                    const y = center + 120 * Math.sin(angle);
                    return (
                        <text key={key} x={x} y={y} fill="#666" fontSize="10" textAnchor="middle" alignmentBaseline="middle">
                            {key.toUpperCase().substring(0, 3)}
                        </text>
                    );
                })}
            </svg>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '10px', color: '#444' }}>
                SHAPE IDENTITY
            </div>
        </div>
    );
}
