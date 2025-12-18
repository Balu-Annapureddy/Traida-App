"use client";

import { useState, useEffect } from "react";
import styles from "./amigos.module.css";
import Link from "next/link";
// Styles assumed to exist or we use inline/global for now. Reuse clubs.module.css patterns? 
// Ideally we create amigos.module.css.

export default function AmigoHub() {
    const [tab, setTab] = useState<'FRIENDS' | 'REQUESTS' | 'BLOCKED'>('FRIENDS');
    const [data, setData] = useState<{ friends: any[], incoming: any[], outgoing: any[], blocked: any[] }>({
        friends: [], incoming: [], outgoing: [], blocked: []
    });
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        try {
            const res = await fetch('/api/amigos/list');
            const json = await res.json();
            if (json.friends) setData(json);
        } catch (e) { console.error(e); }
    }

    async function handleRequest(e: React.FormEvent) {
        e.preventDefault();
        if (!search.trim()) return;
        setStatus("SENDING...");

        try {
            const res = await fetch('/api/amigos/request', {
                method: 'POST',
                body: JSON.stringify({ targetUsername: search.trim() })
            });
            const d = await res.json();
            if (d.success) {
                setStatus("REQUEST_SENT");
                setSearch("");
                fetchList();
            } else {
                setStatus(`ERROR: ${d.error}`);
            }
        } catch (e) {
            setStatus("NETWORK_ERROR");
        }
    }

    async function handleRespond(requestId: number, action: 'ACCEPT' | 'REJECT') {
        try {
            await fetch('/api/amigos/respond', {
                method: 'POST',
                body: JSON.stringify({ requestId, action })
            });
            fetchList();
        } catch (e) { alert("ACTION_FAILED"); }
    }

    async function handleBlock(targetId: number) {
        if (!confirm("BLOCK_USER? (This is permanent until manual unblock)")) return;
        try {
            await fetch('/api/amigos/block', {
                method: 'POST',
                body: JSON.stringify({ targetId })
            });
            fetchList();
        } catch (e) { alert("BLOCK_FAILED"); }
    }

    return (
        <div className={styles.container}>
            {/* Search / Add */}
            <div className={`pixel-border ${styles.searchSection}`}>
                <h3>ADD_NEW_AMIGO</h3>
                <form onSubmit={handleRequest} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className="pixel-input"
                        placeholder="ENTER_USERNAME"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="pixel-btn">SEND_REQ</button>
                </form>
                {status && <p style={{ color: 'orange', fontSize: '0.8rem', marginTop: '5px' }}>{status}</p>}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button className={`pixel-btn ${tab === 'FRIENDS' ? styles.activeTab : ''}`} onClick={() => setTab('FRIENDS')}>
                    FRIENDS ({data.friends.length})
                </button>
                <button className={`pixel-btn ${tab === 'REQUESTS' ? styles.activeTab : ''}`} onClick={() => setTab('REQUESTS')}>
                    REQUESTS ({data.incoming.length + data.outgoing.length})
                </button>
                <button className={`pixel-btn ${tab === 'BLOCKED' ? styles.activeTab : ''}`} onClick={() => setTab('BLOCKED')}>
                    BLOCKED
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === 'FRIENDS' && (
                    <div className={styles.grid}>
                        {data.friends.length === 0 && <p className={styles.empty}>NO_ACTIVE_LINKS</p>}
                        {data.friends.map(f => (
                            <div key={f.id} className={`pixel-border ${styles.card}`}>
                                <span className={styles.name}>{f.username}</span>
                                <div className={styles.actions}>
                                    <Link href={`/dm/${f.userId}`} className="pixel-btn" style={{ fontSize: '0.7rem' }}>MSG</Link>
                                    <button onClick={() => handleBlock(f.userId)} className={styles.textBtn}>BLOCK</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'REQUESTS' && (
                    <div className={styles.list}>
                        {data.incoming.length > 0 && <h4>INCOMING</h4>}
                        {data.incoming.map(req => (
                            <div key={req.id} className={`pixel-border ${styles.row}`}>
                                <span>{req.username}</span>
                                <div className={styles.actions}>
                                    <button onClick={() => handleRespond(req.id, 'ACCEPT')} className="pixel-btn" style={{ color: 'lime' }}>ACCEPT</button>
                                    <button onClick={() => handleRespond(req.id, 'REJECT')} className="pixel-btn" style={{ color: 'red' }}>REJECT</button>
                                </div>
                            </div>
                        ))}

                        {data.outgoing.length > 0 && <h4>OUTGOING</h4>}
                        {data.outgoing.map(req => (
                            <div key={req.id} className={`pixel-border ${styles.row}`} style={{ opacity: 0.7 }}>
                                <span>{req.username}</span>
                                <span style={{ fontSize: '0.8rem' }}>PENDING...</span>
                            </div>
                        ))}

                        {data.incoming.length === 0 && data.outgoing.length === 0 && <p className={styles.empty}>NO_PENDING_REQUESTS</p>}
                    </div>
                )}

                {tab === 'BLOCKED' && (
                    <div className={styles.list}>
                        {data.blocked.map(b => (
                            <div key={b.id} className={`pixel-border ${styles.row}`}>
                                <span style={{ color: 'red' }}>{b.username}</span>
                                <span>BLOCKED</span>
                            </div>
                        ))}
                        {data.blocked.length === 0 && <p className={styles.empty}>NO_BLOCKED_USERS</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
