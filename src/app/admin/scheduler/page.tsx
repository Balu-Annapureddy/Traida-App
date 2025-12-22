'use client';

import { useState } from 'react';

const ENGINES = [
    'PIXEL_DOKU', 'MIRROR_GRID', 'BINARY_PULSE', 'RAPID_CIPHER',
    'SHIFT_KEY', 'SYMBOL_SUBSTITUTION', 'GLITCH_FIND',
    'CIRCUIT_BUILDER', 'INKBLOT', 'ECHO_PROMPT'
];

export default function SchedulerPage() {
    const [date, setDate] = useState('');
    const [slots, setSlots] = useState([
        { type: 'PIXEL_DOKU', config: '' },
        { type: 'BINARY_PULSE', config: '' },
        { type: 'INKBLOT', config: '' }
    ]);
    const [status, setStatus] = useState('');

    const updateSlot = (index: number, field: 'type' | 'config', value: string) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSlots(newSlots);
    };

    const handleSubmit = async () => {
        setStatus('VALIDATING...');

        // Client-side Basic Checks
        if (!date) { setStatus('ERROR: Date required'); return; }

        const types = new Set(slots.map(s => s.type));
        if (types.size !== 3) { setStatus('ERROR: Must use 3 UNIQUE engine types'); return; }

        try {
            // Validate JSON
            slots.forEach(s => JSON.parse(s.config));
        } catch (e) {
            setStatus('ERROR: Invalid JSON in one of the slots');
            return;
        }

        const res = await fetch('/api/admin/schedule', {
            method: 'POST',
            body: JSON.stringify({ date, slots }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            setStatus('SUCCESS: Protocol Scheduled');
        } else {
            const err = await res.text();
            setStatus(`FAILURE: ${err}`);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#fff', marginBottom: '20px' }}>DAILY_PROTOCOL // SCHEDULER</h1>

            <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #444' }}>
                <label style={{ display: 'block', color: '#0f0', marginBottom: '10px' }}>TARGET_DATE</label>
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    style={{ background: '#111', color: '#fff', padding: '10px', border: '1px solid #333' }}
                />
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                {slots.map((slot, i) => (
                    <div key={i} style={{ padding: '20px', border: '1px solid #333', background: '#080808' }}>
                        <div style={{ color: '#888', marginBottom: '10px' }}>SLOT 0{i + 1}</div>

                        <div style={{ marginBottom: '10px' }}>
                            <select
                                value={slot.type}
                                onChange={e => updateSlot(i, 'type', e.target.value)}
                                style={{ background: '#222', color: '#fff', padding: '5px', width: '200px' }}
                            >
                                {ENGINES.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>

                        <textarea
                            value={slot.config}
                            onChange={e => updateSlot(i, 'config', e.target.value)}
                            placeholder="Paste JSON Config Here..."
                            style={{
                                width: '100%', height: '100px',
                                background: '#111', color: '#0f0',
                                fontFamily: 'monospace', border: '1px solid #222'
                            }}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '15px 30px',
                        background: '#f00', color: '#fff',
                        border: 'none', fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    PUBLISH_PROTOCOL
                </button>
                <div style={{ color: status.startsWith('SUCCESS') ? '#0f0' : '#f00' }}>
                    {status}
                </div>
            </div>
        </div>
    );
}
