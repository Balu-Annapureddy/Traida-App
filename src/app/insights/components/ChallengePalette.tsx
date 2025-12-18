"use client";

import styles from "../insights.module.css";

export default function ChallengePalette({ data }: { data: any[] }) {
    // data: [{ type: string, count: number }]
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const sorted = [...data].sort((a, b) => b.count - a.count);

    return (
        <div className={`pixel-border`} style={{ padding: '1rem' }}>
            <div className={styles.barContainer}>
                {sorted.length === 0 && <p style={{ color: '#666', fontSize: '0.8rem' }}>NO_PREFERENCES_YET</p>}

                {sorted.map(item => {
                    const pct = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                        <div key={item.type} className={styles.barRow}>
                            <span className={styles.label}>{item.type}</span>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: `${pct}%` }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', width: '30px', color: '#666' }}>{Math.round(pct)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
