'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type MirrorGridProps = {
    data: any; // { leftSide: [[1,0...]], axis: 'vertical' }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function MirrorGrid({ data, isDemo = false, onComplete }: MirrorGridProps) {
    const [rightGrid, setRightGrid] = useState<number[][]>([]);
    const [showDemo, setShowDemo] = useState(isDemo);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        if (data && data.leftSide) {
            const rows = data.leftSide.length;
            const cols = data.leftSide[0].length;
            setRightGrid(Array(rows).fill(0).map(() => Array(cols).fill(0)));
        }
    }, [data]);

    const toggleCell = (r: number, c: number) => {
        if (showDemo) return;
        const newGrid = [...rightGrid];
        newGrid[r] = [...newGrid[r]];
        newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
        setRightGrid(newGrid);
    };

    const checkSolution = () => {
        // Expect mirror image of leftSide
        const left = data.leftSide;
        let correct = true;

        for (let r = 0; r < rightGrid.length; r++) {
            for (let c = 0; c < rightGrid[0].length; c++) {
                // For vertical axis, right[r][0] mirrors left[r][last]
                const leftVal = left[r][left[0].length - 1 - c];
                if (rightGrid[r][c] !== leftVal) correct = false;
            }
        }

        onComplete(correct, Date.now() - startTime);
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="Complete the reflection. Mirror the pattern on the left."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>MIRROR_GRID // PATTERN</h3>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {/* Left (Static) */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data?.leftSide?.[0]?.length || 3}, 30px)`, gap: '2px', opacity: 0.7 }}>
                    {data?.leftSide?.map((row: number[], r: number) =>
                        row.map((cell, c) => (
                            <div
                                key={`l-${r}-${c}`}
                                style={{
                                    width: '30px', height: '30px',
                                    background: cell === 1 ? '#0ff' : '#222',
                                    border: '1px solid #444'
                                }}
                            />
                        ))
                    )}
                </div>

                {/* Axis */}
                <div style={{ width: '2px', height: '150px', background: 'gold' }}></div>

                {/* Right (Interactive) */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rightGrid?.[0]?.length || 3}, 30px)`, gap: '2px' }}>
                    {rightGrid.map((row, r) =>
                        row.map((cell, c) => (
                            <div
                                key={`r-${r}-${c}`}
                                onClick={() => toggleCell(r, c)}
                                style={{
                                    width: '30px', height: '30px',
                                    background: cell === 1 ? '#0f0' : '#111',
                                    border: '1px solid #444',
                                    cursor: 'pointer'
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            <button onClick={checkSolution} style={{ marginTop: '20px', padding: '10px' }}>
                VERIFY_SYMMETRY
            </button>
        </div>
    );
}
