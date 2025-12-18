"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./insights.module.css";
import TraitCompass from "./components/TraitCompass";
import RhythmLog from "./components/RhythmLog";
import ChallengePalette from "./components/ChallengePalette";

export default function InsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/insights')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, []);

    if (loading) return <div className={styles.container}>REFLECTING...</div>;
    if (!data) return <div className={styles.container}>UNABLE_TO_REFLECT</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>INSIGHTS</h1>
                <Link href="/" className="pixel-btn">RETURN</Link>
            </header>

            {/* B1 Weekly Reflection */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>WEEKLY_REFLECTION</h2>
                <div className={styles.letter}>
                    <span className={styles.date}>WEEK OF {data.reflection.week_start_date}</span>
                    <p>{data.reflection.content}</p>
                </div>
            </section>

            {/* B2 Compass */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>TRAIT_IDENTITY</h2>
                <TraitCompass current={data.compass.current} previous={data.compass.previous} />
                <div className={styles.legend}>
                    <span style={{ color: 'var(--primary)' }}>• CURRENT</span>
                    <span style={{ textDecoration: 'dashed' }}>- - PREVIOUS</span>
                </div>
            </section>

            {/* B3 Rhythm */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>RHYTHM_LOG</h2>
                <RhythmLog data={data.rhythm} />
            </section>

            {/* B4 Palette */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>CHALLENGE_PALETTE</h2>
                <ChallengePalette data={data.palette} />
            </section>
        </div>
    );
}
