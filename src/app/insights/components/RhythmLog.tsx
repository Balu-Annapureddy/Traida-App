"use client";

import styles from "../insights.module.css";

export default function RhythmLog({ data }: { data: any[] }) {
    // Data: [{ day: '0'-'6', hour: '00'-'23' }]
    // Grid: 7 Cols (Sun-Sat), 24 Rows (0-23)
    // Wait, simpler visual: 7 cols (Days), with blocks for active hours.

    // Transform data into map
    const map = new Set<string>();
    data.forEach(d => map.add(`${d.day}-${d.hour}`));

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

    return (
        <div className={`pixel-border`} style={{ padding: '1rem' }}>
            <div className={styles.rhythmGrid}>
                {days.map((d, dayIndex) => (
                    <div key={d} className={styles.dayColumn}>
                        <span style={{ fontSize: '0.6rem', color: '#666', textAlign: 'center', marginBottom: '2px' }}>{d}</span>
                        {hours.map(h => {
                            const isActive = map.has(`${dayIndex}-${h.toString().padStart(2, '0')}`);
                            return (
                                <div
                                    key={h}
                                    className={`${styles.hourBlock} ${isActive ? styles.activeBlock : ''}`}
                                    title={`${d} ${h}:00`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#666' }}>
                <span>00:00</span>
                <span>12:00</span>
                <span>23:00</span>
            </div>
        </div>
    );
}
