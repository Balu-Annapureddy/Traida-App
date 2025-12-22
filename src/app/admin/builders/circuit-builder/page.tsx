'use client';

import { useState } from 'react';

export default function CircuitBuilderBuilder() {
    const [size, setSize] = useState(3);
    // Grid of types: 1=Line, 2=Corner, 3=T, 4=Cross
    const [grid, setGrid] = useState<number[]>(Array(9).fill(1));
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(8);
    const [jsonOutput, setJsonOutput] = useState('');

    const toggleTile = (idx: number) => {
        const newGrid = [...grid];
        newGrid[idx] = (newGrid[idx] % 4) + 1; // Cycle 1-4
        setGrid(newGrid);
        updateJson(newGrid);
    };

    const updateJson = (g: number[]) => {
        const data = {
            size,
            grid: g,
            start,
            end
        };
        setJsonOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div>
            <h2>CIRCUIT_BUILDER // BUILDER</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 50px)`,
                gap: '2px',
                marginBottom: '20px'
            }}>
                {grid.map((type, i) => (
                    <div
                        key={i}
                        onClick={() => toggleTile(i)}
                        style={{
                            width: '50px', height: '50px',
                            background: '#222',
                            border: i === start ? '2px solid #0f0' : (i === end ? '2px solid #f00' : '1px solid #444'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff'
                        }}
                    >
                        {type === 1 && "│"}
                        {type === 2 && "└"}
                        {type === 3 && "┴"}
                        {type === 4 && "┼"}
                    </div>
                ))}
            </div>

            <p>Click to cycle tile types.</p>
            <div style={{ marginBottom: '10px' }}>Start Idx: <input type="number" value={start} onChange={e => setStart(parseInt(e.target.value))} /></div>
            <div style={{ marginBottom: '10px' }}>End Idx: <input type="number" value={end} onChange={e => setEnd(parseInt(e.target.value))} /></div>

            <textarea value={jsonOutput} readOnly style={{ width: '100%', height: '200px', background: '#000', color: '#0f0' }} />
        </div>
    );
}
