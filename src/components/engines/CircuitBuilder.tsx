'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type CircuitBuilderProps = {
    data: any; // { grid: [types...], start: 0, end: 8 }
    // types: 1=Line, 2=Corner, 3=T, 4=Cross
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

// Simple connections map: { type: { rotation: [top, right, bottom, left] } }
// 1 = True (Connected)
const TILE_TYPES: any = {
    1: [1, 0, 1, 0], // Line (Vertical init)
    2: [0, 1, 1, 0], // Corner (Right-Bottom init)
    3: [0, 1, 1, 1], // T (Right-Bottom-Left init)
    4: [1, 1, 1, 1], // Cross
};

export default function CircuitBuilder({ data, isDemo = false, onComplete }: CircuitBuilderProps) {
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    // State: Rotations [0, 1, 2, 3] per cell (x90 deg)
    const [rotations, setRotations] = useState<number[]>([]);

    // Init Grid
    const size = data?.size || 3; // 3x3
    const gridLayout = data?.grid || [2, 1, 2, 1, 4, 1, 2, 1, 2]; // Sample loop
    const startIdx = data?.start || 0;
    const endIdx = data?.end || (size * size) - 1;

    useEffect(() => {
        setRotations(Array(size * size).fill(0));
    }, [size]);

    const rotate = (index: number) => {
        if (showDemo) return;
        const newRots = [...rotations];
        newRots[index] = (newRots[index] + 1) % 4;
        setRotations(newRots);
    };

    const getConnections = (type: number, rot: number) => {
        // Rotate the [T, R, B, L] array 'rot' times clockwise
        // Shift right 'rot' times.
        const base = TILE_TYPES[type] || [0, 0, 0, 0];
        // e.g. rot 1: [L, T, R, B] -> move last to first
        const arr = [...base];
        for (let i = 0; i < rot; i++) {
            arr.unshift(arr.pop());
        }
        return arr; // [Top, Right, Bottom, Left]
    };

    const checkSolution = () => {
        // BFS to find path from Start to End
        const visited = new Set();
        const queue = [startIdx];
        visited.add(startIdx);

        let found = false;

        while (queue.length > 0) {
            const curr = queue.shift()!;
            if (curr === endIdx) {
                found = true;
                break;
            }

            const r = Math.floor(curr / size);
            const c = curr % size;

            const type = gridLayout[curr];
            const rot = rotations[curr];
            const [top, right, bottom, left] = getConnections(type, rot);

            // Check Neighbors
            // UP
            if (top && r > 0) {
                const nIdx = curr - size;
                const nType = gridLayout[nIdx];
                const nRot = rotations[nIdx];
                const nConns = getConnections(nType, nRot);
                if (nConns[2]) { // If neighbor has Bottom
                    if (!visited.has(nIdx)) { visited.add(nIdx); queue.push(nIdx); }
                }
            }
            // RIGHT
            if (right && c < size - 1) {
                const nIdx = curr + 1;
                const nType = gridLayout[nIdx];
                const nRot = rotations[nIdx];
                const nConns = getConnections(nType, nRot);
                if (nConns[3]) { // If neighbor has Left
                    if (!visited.has(nIdx)) { visited.add(nIdx); queue.push(nIdx); }
                }
            }
            // DOWN
            if (bottom && r < size - 1) {
                const nIdx = curr + size;
                const nType = gridLayout[nIdx];
                const nRot = rotations[nIdx];
                const nConns = getConnections(nType, nRot);
                if (nConns[0]) { // If neighbor has Top
                    if (!visited.has(nIdx)) { visited.add(nIdx); queue.push(nIdx); }
                }
            }
            // LEFT
            if (left && c > 0) {
                const nIdx = curr - 1;
                const nType = gridLayout[nIdx];
                const nRot = rotations[nIdx];
                const nConns = getConnections(nType, nRot);
                if (nConns[1]) { // If neighbor has Right
                    if (!visited.has(nIdx)) { visited.add(nIdx); queue.push(nIdx); }
                }
            }
        }

        onComplete(found, Date.now() - startTime);
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="CONNECT: Rotate tiles to build a circuit from Green to Red."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>CIRCUIT_BUILDER // LOGIC</h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 50px)`,
                gap: '0',
                justifyContent: 'center',
                margin: '20px'
            }}>
                {gridLayout.map((type: number, i: number) => (
                    <div
                        key={i}
                        onClick={() => rotate(i)}
                        style={{
                            width: '50px', height: '50px',
                            background: i === startIdx ? '#050' : (i === endIdx ? '#500' : '#111'),
                            border: '1px solid #333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            transform: `rotate(${rotations[i] * 90}deg)`,
                            transition: 'transform 0.2s'
                        }}
                    >
                        {/* ASCII Art for lines? Or SVG? SVG is safer for "Ugly but Correct" rotation. */}
                        <svg width="30" height="30" viewBox="0 0 100 100" stroke="#0f0" strokeWidth="15" fill="none">
                            {type === 1 && <path d="M50,0 L50,100" />}
                            {type === 2 && <path d="M100,50 L50,50 L50,100" />}
                            {type === 3 && <path d="M0,50 L100,50 M50,50 L50,100" />}
                            {type === 4 && <path d="M50,0 L50,100 M0,50 L100,50" />}
                        </svg>
                    </div>
                ))}
            </div>

            <button onClick={checkSolution} style={{ padding: '10px 20px' }}>
                ACTIVATE CHECK
            </button>
        </div>
    );
}
