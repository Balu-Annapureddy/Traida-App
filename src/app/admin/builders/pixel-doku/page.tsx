'use client';

import { useState } from 'react';

export default function PixelDokuBuilder() {
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(5);
    const [grid, setGrid] = useState<number[][]>(
        Array(5).fill(0).map(() => Array(5).fill(0))
    );
    const [jsonOutput, setJsonOutput] = useState('');

    const toggleCell = (r: number, c: number) => {
        const newGrid = [...grid];
        newGrid[r] = [...newGrid[r]];
        newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
        setGrid(newGrid);
        generateJson(newGrid);
    };

    const handleResize = (r: number, c: number) => {
        setRows(r);
        setCols(c);
        // Reset grid
        setGrid(Array(r).fill(0).map(() => Array(c).fill(0)));
        setJsonOutput('');
    };

    const calculateHints = (g: number[][]) => {
        // Rows
        const rowHints = g.map(row => {
            const hints = [];
            let count = 0;
            for (let val of row) {
                if (val === 1) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            }
            if (count > 0) hints.push(count);
            return hints.length === 0 ? [0] : hints;
        });

        // Cols
        const colHints = [];
        for (let j = 0; j < g[0].length; j++) {
            const hints = [];
            let count = 0;
            for (let i = 0; i < g.length; i++) {
                if (g[i][j] === 1) count++;
                else if (count > 0) { hints.push(count); count = 0; }
            }
            if (count > 0) hints.push(count);
            colHints.push(hints.length === 0 ? [0] : hints);
        }

        return { rowHints, colHints };
    };

    const generateJson = (currentGrid: number[][]) => {
        const { rowHints, colHints } = calculateHints(currentGrid);
        const data = {
            grid: currentGrid, // Store solution
            rowHints,
            colHints,
            solutionGrid: currentGrid
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>PIXEL_DOKU // BUILDER</h2>

            <div style={{ marginBottom: '20px' }}>
                <label>Size: </label>
                <select onChange={(e) => handleResize(parseInt(e.target.value), parseInt(e.target.value))}>
                    <option value="5">5x5</option>
                    <option value="10">10x10</option>
                    <option value="15">15x15</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Painter */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 30px)`,
                    gap: '2px',
                    border: '1px solid #444',
                    padding: '10px'
                }}>
                    {grid.map((row, r) => (
                        row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                onClick={() => toggleCell(r, c)}
                                style={{
                                    width: '30px', height: '30px',
                                    background: cell === 1 ? '#0f0' : '#222',
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
                    style={{ width: '400px', height: '400px', background: '#111', color: '#0f0', fontFamily: 'monospace' }}
                />
            </div>

            <div style={{ marginTop: '20px', color: '#888' }}>
                * Hints are auto-calculated from your drawing. Copy the JSON to use.
            </div>
        </div>
    );
}
