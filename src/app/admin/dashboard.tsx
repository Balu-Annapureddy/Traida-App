"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveReport, manageUser } from "./actions";
import styles from "./admin.module.css";

export default function AdminDashboard({ stats, reports, logs }: any) {
    const [targetUser, setTargetUser] = useState("");
    const [userAction, setUserAction] = useState<"MUTE" | "BAN" | "ACTIVE">("MUTE");

    async function handleUserAction() {
        if (!targetUser) return;
        if (!confirm(`CONFIRM: ${userAction} -> ${targetUser}?`)) return;

        const res = await manageUser(targetUser, userAction);
        if (res?.error) alert(res.error);
        else {
            alert("ACTION_EXECUTED");
            setTargetUser("");
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 style={{ color: 'var(--error)' }}>ADMIN_CONSOLE</h1>
                <Link href="/" className="pixel-btn">EXIT</Link>
            </header>

            <section className={styles.statsRow}>
                <div className={`pixel-border ${styles.statCard}`}>
                    <label>TOTAL_USERS</label>
                    <span>{stats.users.count}</span>
                </div>
                <div className={`pixel-border ${styles.statCard}`}>
                    <label>ACTIVE_TODAY</label>
                    <span>{stats.activeToday.count}</span>
                </div>
                <div className={`pixel-border ${styles.statCard}`}>
                    <label>PENDING_REPORTS</label>
                    <span style={{ color: stats.reports.count > 0 ? 'red' : 'green' }}>
                        {stats.reports.count}
                    </span>
                </div>
            </section>

            <div className={styles.grid}>
                <div className={`pixel-border ${styles.panel}`}>
                    <h2>USER_MANAGEMENT</h2>
                    <div className={styles.controlGroup}>
                        <input
                            className="pixel-border"
                            placeholder="USERNAME"
                            value={targetUser}
                            onChange={e => setTargetUser(e.target.value)}
                        />
                        <select
                            className="pixel-border"
                            value={userAction}
                            onChange={e => setUserAction(e.target.value as any)}
                        >
                            <option value="MUTE">MUTE (Chat Block)</option>
                            <option value="BAN">BAN (Login Block)</option>
                            <option value="ACTIVE">RESTORE ACTIVE</option>
                        </select>
                        <button className="pixel-btn" onClick={handleUserAction} style={{ background: 'var(--error)', color: 'white' }}>EXECUTE</button>
                    </div>
                </div>

                <div className={`pixel-border ${styles.panel}`}>
                    <h2>REPORTS_QUEUE</h2>
                    {reports.length === 0 ? (
                        <p style={{ color: '#666' }}>ALL_CLEAR</p>
                    ) : (
                        <ul className={styles.list}>
                            {reports.map((r: any) => (
                                <li key={r.id} className={styles.listItem}>
                                    <div style={{ marginBottom: '5px' }}>
                                        <span style={{ color: 'red' }}>{r.offender}</span> reported by {r.reporter}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>
                                        Reason: {r.reason}
                                    </div>
                                    <div className={styles.msgPreview}>"{r.message}"</div>
                                    <div className={styles.actions}>
                                        <button onClick={() => resolveReport(r.id, 'RESOLVE')} className="pixel-btn">RESOLVE</button>
                                        <button onClick={() => resolveReport(r.id, 'DISMISS')} className="pixel-btn">DISMISS</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className={`pixel-border ${styles.panel}`}>
                    <h2>AUDIT_LOG</h2>
                    <ul className={styles.list}>
                        {logs.map((l: any, i: number) => (
                            <li key={i} className={styles.logItem}>
                                <span style={{ color: 'var(--secondary)' }}>[{l.admin}]</span> {l.action} : {l.details}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
