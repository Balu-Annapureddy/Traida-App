"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Inline styles for simplicity

export default function NotificationBell() {
    const [unread, setUnread] = useState(0);
    const [items, setItems] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchNotes();
        const interval = setInterval(fetchNotes, 15000); // 15s polling for Pulse
        return () => clearInterval(interval);
    }, []);

    async function fetchNotes() {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.notifications) {
                setItems(data.notifications);
                setUnread(data.unreadCount);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function markRead(id: number | 'ALL') {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                body: JSON.stringify({ action: 'MARK_READ', id })
            });
            fetchNotes(); // Refresh
        } catch (e) { console.error(e); }
    }

    function handleItemClick(n: any) {
        // Mark read then route logic?
        markRead(n.id);
        // We rely on Link href to navigate, this just handles read state.
    }

    function getLink(n: any) {
        if (n.type === 'AMIGO_REQ') return '/amigos'; // Go to requests tab
        if (n.type === 'DM') return `/dm/${n.source_id}`; // Technically source_id is user_id here, but need room_id. 
        // Wait, source_id for DM type notification in `SocialUtils.sendNotification` passed `userId` (sender).
        // To link to DM room, we need to know the Room ID or have /dm/user/[id] redirect. 
        // For MVP, user can go to /dm inbox or we update `source_id` to be RoomID?
        // Let's stick to /dm inbox or just /amigos for simplicity if room not known.
        // Or update SocialUtils to send RoomID? 
        // Let's assume user goes to /dm implies checking inbox.
        if (n.type === 'DM') return '/dm';
        if (n.type === 'CLUB_INVITE') return `/clubs/${n.source_id}`;
        return '#';
    }

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="pixel-btn"
                style={{ padding: '5px 10px', fontSize: '1rem', position: 'relative' }}
                onClick={() => setOpen(!open)}
            >
                🔔
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: 'red', color: 'white', borderRadius: '50%',
                        fontSize: '0.6rem', padding: '2px 5px', border: '1px solid white'
                    }}>
                        {unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="pixel-border" style={{
                    position: 'absolute', top: '40px', right: '0',
                    width: '300px', background: 'var(--card-bg)', zIndex: 1000,
                    maxHeight: '400px', overflowY: 'auto', padding: '0.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>NOTIFICATIONS</span>
                        <button onClick={() => markRead('ALL')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.7rem' }}>CLEAR_ALL</button>
                    </div>

                    {items.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>SILENCE...</div>}

                    {items.map(n => (
                        <Link
                            key={n.id}
                            href={getLink(n)}
                            onClick={() => handleItemClick(n)}
                            style={{
                                display: 'block', padding: '0.5rem', marginBottom: '0.5rem',
                                background: n.is_read ? 'transparent' : '#222',
                                textDecoration: 'none', color: 'inherit', borderLeft: n.is_read ? 'none' : '2px solid var(--primary)'
                            }}
                        >
                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: '2px' }}>{n.type}</div>
                            <div style={{ fontSize: '0.8rem' }}>{n.message}</div>
                            <div style={{ fontSize: '0.6rem', color: '#666', textAlign: 'right' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
