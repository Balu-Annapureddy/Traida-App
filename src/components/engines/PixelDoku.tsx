'use client';

import { useState, useEffect } from 'react';
import DemoOverlay from '../demo/DemoOverlay';

type PixelDokuProps = {
    data: any; // { grid: [[0,1...]], rowHints: [], colHints: [] }
    isDemo?: boolean;
    onComplete: (success: boolean, timeMs: number) => void;
};

export default function PixelDoku({ data, isDemo = false, onComplete }: PixelDokuProps) {
    // State
    const [grid, setGrid] = useState<number[][]>([]);
    const [startTime] = useState(Date.now());
    const [showDemo, setShowDemo] = useState(isDemo);

    // Init
    useEffect(() => {
        // Init empty grid based on dimensions
        if (data && data.rowHints) {
            const rows = data.rowHints.length;
            const cols = data.colHints.length;
            setGrid(Array(rows).fill(0).map(() => Array(cols).fill(0)));
        }
    }, [data]);

    const toggleCell = (r: number, c: number) => {
        if (showDemo) return; // Block interaction if overlay is up, or allow loop logic

        const newGrid = [...grid];
        newGrid[r] = [...newGrid[r]];
        newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
        setGrid(newGrid);
    };

    const checkSolution = () => {
        // Compare current grid with solution in data (if provided) or validate against hints
        // For MVP/Batch1, we assume data.solutionGrid is provided for easy check
        const solution = data.solutionGrid;

        let correct = true;
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[0].length; j++) {
                if (grid[i][j] !== solution[i][j]) correct = false;
            }
        }

        onComplete(correct, Date.now() - startTime);
    };

    return (
        <div style={{ position: 'relative', padding: '20px', border: '1px solid #333' }}>
            {showDemo && (
                <DemoOverlay
                    instructions="Toggle pixels to match row/column numbers. Don't guess."
                    onStart={() => setShowDemo(false)}
                />
            )}

            <h3>PIXEL_DOKU // LOGIC</h3>

            <div style={{ display: 'flex' }}>
                {/* Hints and Grid Render */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${(data?.colHints?.length || 5)}, 30px)`, gap: '2px' }}>
                    {data?.colHints?.map((hint: number[], i: number) => (
                        <div key={`col-${i}`} style={{ textAlign: 'center', fontSize: '10px', paddingBottom: '5px' }}>
                            {hint.join('\n')}
                        </div>
                    ))}

                    {grid.map((row, r) => (
                        row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => toggleCell(r, c)}
                                style={{
                                    width: '30px', height: '30px',
                                    background: cell === 1 ? '#0f0' : '#222',
                                    border: '1px solid #444',
                                    cursor: 'pointer'
                                }}
                            />
                        ))
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '10px' }}>
                    {data?.rowHints?.map((hint: number[], i: number) => (
                        <div key={`row-${i}`} style={{ height: '30px', display: 'flex', alignItems: 'center', fontSize: '10px' }}>
                            {hint.join(' ')}
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={checkSolution} style={{ marginTop: '20px', padding: '10px' }}>
                SUBMIT_PATTERN
            </button>
        </div>
    );
}
