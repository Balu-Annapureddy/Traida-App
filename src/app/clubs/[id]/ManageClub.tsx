"use client";

import { useState, useEffect } from "react";

export default function ManageClub({ clubId, currentUserRole }: { clubId: number, currentUserRole: string }) {
    const [open, setOpen] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]); // For invite
    const [tab, setTab] = useState('MEMBERS');

    useEffect(() => {
        if (open) {
            fetchMembers();
            if (currentUserRole !== 'MEMBER') fetchFriends();
        }
    }, [open]);

    async function fetchMembers() {
        // We need an API to list members. We don't have one yet?
        // Reuse /api/clubs/[id]/messages? No.
        // We need a member list endpoint. Or server passed it?
        // Let's fetch from a new endpoint or existing. 
        // I'll add `GET` to `manage/route.ts`? No, separation. 
        // Let's assume passed in or I add a simple fetcher.
        // For now, I'll fetch from `/api/clubs/${clubId}/members` (Need to implement).
        // I'll implement `GET /api/clubs/[id]/members` quickly in next step or inline it?
        // Let's assume I will implement it.
        try {
            const res = await fetch(`/api/clubs/${clubId}/members`);
            const data = await res.json();
            if (data.members) setMembers(data.members);
        } catch (e) { }
    }

    async function fetchFriends() {
        const res = await fetch('/api/amigos/list');
        const data = await res.json();
        if (data.friends) setFriends(data.friends);
    }

    async function handleAction(action: string, targetUserId: number) {
        if (!confirm(`CONFIRM: ${action}?`)) return;
        try {
            await fetch(`/api/clubs/${clubId}/manage`, {
                method: 'POST',
                body: JSON.stringify({ action, targetUserId })
            });
            fetchMembers();
        } catch (e) { alert("ERROR"); }
    }

    if (!['CREATOR', 'MODERATOR'].includes(currentUserRole)) return null;

    return (
        <div>
            <button className="pixel-btn" onClick={() => setOpen(!open)} style={{ fontSize: '0.7rem' }}>
                MANAGE_CREW
            </button>

            {open && (
                <div className="pixel-border" style={{ position: 'absolute', background: '#000', padding: '1rem', zIndex: 100, width: '300px', right: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>GOVERNANCE</h3>
                        <button onClick={() => setOpen(false)}>X</button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                        <button onClick={() => setTab('MEMBERS')} style={{ color: tab === 'MEMBERS' ? 'lime' : 'grey' }}>MEMBERS</button>
                        <button onClick={() => setTab('INVITE')} style={{ color: tab === 'INVITE' ? 'lime' : 'grey' }}>INVITE</button>
                    </div>

                    {tab === 'MEMBERS' && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {members.map(m => (
                                <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>{m.username} ({m.role.substring(0, 3)})</span>
                                    {m.role !== 'CREATOR' && (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {currentUserRole === 'CREATOR' && m.role === 'MEMBER' && (
                                                <button onClick={() => handleAction('PROMOTE', m.user_id)} style={{ color: 'gold' }}>^</button>
                                            )}
                                            <button onClick={() => handleAction('KICK', m.user_id)} style={{ color: 'red' }}>X</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'INVITE' && (
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {friends.map(f => (
                                <div key={f.userId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                                    <span>{f.username}</span>
                                    <button onClick={() => handleAction('INVITE', f.userId)} style={{ color: 'cyan' }}>SEND</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
