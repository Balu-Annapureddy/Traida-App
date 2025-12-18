"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./amigos.module.css";

export default function AmigoHub() {
    const [friends, setFriends] = useState<any[]>([]);
    const [received, setReceived] = useState<any[]>([]);
    const [sent, setSent] = useState<any[]>([]);
    const [targetUsername, setTargetUsername] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAmigos();
    }, []);

    async function fetchAmigos() {
        try {
            const res = await fetch('/api/amigos');
            const data = await res.json();
            if (data.friends) {
                setFriends(data.friends);
                setReceived(data.pending_received);
                setSent(data.pending_sent);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function sendRequest() {
        if (!targetUsername.trim()) return;
        try {
            const res = await fetch('/api/amigos', {
                method: 'POST',
                body: JSON.stringify({ action: 'REQUEST', targetUsername })
            });
            const data = await res.json();
            if (data.error) alert(data.error);
            else {
                alert("REQUEST_TRANSMITTED");
                setTargetUsername("");
                fetchAmigos();
            }
        } catch (e) {
            alert("TRANSMISSION_ERROR");
        }
    }

    async function handleAction(action: string, amigoId: number) {
        try {
            await fetch('/api/amigos', {
                method: 'POST',
                body: JSON.stringify({ action, amigoId })
            });
            fetchAmigos();
        } catch (e) {
            alert("ERROR");
        }
    }

    if (loading) return <div>SCANNING_NETWORK...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>AMIGO_NETWORK_HUB</h1>
                <Link href="/" className="pixel-btn">EXIT</Link>
            </header>

            <div className={`pixel-border ${styles.section}`}>
                <h2>ADD_NEW_LINK</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className="pixel-border"
                        placeholder="ENTER_USERNAME"
                        value={targetUsername}
                        onChange={e => setTargetUsername(e.target.value)}
                    />
                    <button className="pixel-btn" onClick={sendRequest}>CONNECT</button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={`pixel-border ${styles.column}`}>
                    <h2>INCOMING_REQS ({received.length})</h2>
                    {received.length === 0 && <p style={{ color: '#666' }}>NO_SIGNALS</p>}
                    {received.map(r => (
                        <div key={r.id} className={styles.card}>
                            <span>{r.friendName}</span>
                            <div className={styles.actions}>
                                <button className="pixel-btn" onClick={() => handleAction('ACCEPT', r.id)}>ACEPT</button>
                                <button className="pixel-btn" onClick={() => handleAction('REJECT', r.id)}>DENY</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`pixel-border ${styles.column}`}>
                    <h2>ESTABLISHED_LINKS ({friends.length})</h2>
                    {friends.length === 0 && <p style={{ color: '#666' }}>ISOLATED_NODE</p>}
                    {friends.map(f => (
                        <div key={f.id} className={styles.card}>
                            <span className={styles.friendName}>{f.friendName}</span>
                            <div className={styles.actions}>
                                <Link href={`/play/dm/${f.id}`} className="pixel-btn" style={{ background: 'var(--primary)', color: 'black' }}>MSG</Link>
                                <button className="pixel-btn" onClick={() => handleAction('BLOCK', f.id)} style={{ color: 'red' }}>BLK</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`pixel-border ${styles.column}`}>
                    <h2>PENDING_OUT ({sent.length})</h2>
                    {sent.length === 0 && <p style={{ color: '#666' }}>NONE</p>}
                    {sent.map(s => (
                        <div key={s.id} className={styles.card}>
                            <span>{s.friendName}</span>
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>AWAITING_ACK...</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
