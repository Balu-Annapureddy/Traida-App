'use client';

import { useState } from 'react';

export default function MirrorGridBuilder() {
    const [rows, setRows] = useState(6);
    const [cols, setCols] = useState(4); // Half-width
    const [grid, setGrid] = useState<number[][]>(
        Array(6).fill(0).map(() => Array(4).fill(0))
    );
    const [jsonOutput, setJsonOutput] = useState('');

    const toggleCell = (r: number, c: number) => {
        const newGrid = [...grid];
        newGrid[r] = [...newGrid[r]];
        newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
        setGrid(newGrid);
        updateJson(newGrid);
    };

    const updateJson = (g: number[][]) => {
        const data = {
            leftSide: g,
            axis: 'vertical'
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>MIRROR_GRID // BUILDER</h2>

            <p style={{ color: '#888', marginBottom: '10px' }}>Paint the LEFT side. The user must mirror this on the right.</p>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Painter */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 30px)`,
                    gap: '2px',
                    border: '1px solid #444',
                    padding: '10px',
                    borderRight: '2px solid gold' // Axis visual
                }}>
                    {grid.map((row, r) => (
                        row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => toggleCell(r, c)}
                                style={{
                                    width: '30px', height: '30px',
                                    background: cell === 1 ? '#0ff' : '#222',
                                    border: '1px solid #333',
                                    cursor: 'pointer'
                                }}
                            />
                        ))
                    ))}
                </div>

                {/* JSON Output */}
                <textarea
                    value={jsonOutput}
                    readOnly
                    style={{ width: '400px', height: '300px', background: '#111', color: '#0f0', fontFamily: 'monospace' }}
                />
            </div>
        </div>
    );
}
