"use client";

import { useState, useEffect } from "react";

export default function AdminConfigPanel() {
    const [config, setConfig] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        try {
            const res = await fetch('/api/admin/config');
            if (res.ok) {
                const data = await res.json();
                setConfig(data.config);
            }
            setLoading(false);
        } catch (e) { setLoading(false); }
    }

    async function toggle(key: string) {
        const newValue = !config[key];
        // Optimistic update
        setConfig(prev => ({ ...prev, [key]: newValue }));

        try {
            await fetch('/api/admin/config', {
                method: 'POST',
                body: JSON.stringify({ key, value: newValue })
            });
        } catch (e) {
            fetchConfig(); // Revert on error
        }
    }

    if (loading) return <div>LOADING_CONFIG...</div>;

    const KEYS = ['DISABLE_SIGNUPS', 'DISABLE_CLUB_CREATION', 'DISABLE_DMS'];

    return (
        <div className="pixel-border" style={{ padding: '1rem', background: '#111', marginTop: '2rem' }}>
            <h3 style={{ color: 'red', marginBottom: '1rem' }}>EMERGENCY_CONTROLS (KILL_SWITCHES)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {KEYS.map(key => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #333' }}>
                        <span>{key}</span>
                        <button
                            onClick={() => toggle(key)}
                            style={{
                                background: config[key] ? 'red' : '#333',
                                color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer'
                            }}
                        >
                            {config[key] ? 'DISABLED' : 'ACTIVE'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
