"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../../clubs.module.css";
// We can reuse chat styles or make new ones. 
// Let's reuse basic styles but inline some specific overrides or make a new persistent chat module?
// For MVP speed, let's use the provided clubs.module.css or inline heavily, 
// OR import the Chat module from game if possible?
// Importing from another route's module is risky in Next.js if not global. 
// Let's copy basic chat CSS to clubs.module.css or just use inline for the window.
// Actually, let's add chat styles to clubs.module.css in previous step? 
// No I didn't add chat styles there. 
// Let's add simple chat styles to clubs.module.css first or now.
// I'll just add them to the component style tag for now to avoid re-writing the css file immediately.

export default function ClubChat({ clubId, currentUser }: { clubId: number, currentUser: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Polling
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // 3s polling
        return () => clearInterval(interval);
    }, [clubId]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/clubs/${clubId}/messages`);
            const data = await res.json();
            if (data.messages) {
                // If ID is new, append? Or just replace for MVP polling?
                // Replace is safer for deletions/updates but heavier. MVP: Replace.
                setMessages(data.messages);
            }
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;
        const original = input;
        setInput("");

        try {
            await fetch(`/api/clubs/${clubId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content: original })
            });
            fetchMessages();
        } catch (e) {
            setInput(original);
            alert("SEND_FAILED");
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '600px', border: '2px solid #333' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#050505', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loading && <div style={{ color: '#666' }}>SYNCING_ARCHIVES...</div>}

                {messages.length === 0 && !loading && (
                    <div style={{ color: '#444', textAlign: 'center', marginTop: '2rem' }}>NO_TRANSMISSIONS_YET</div>
                )}

                {messages.map(msg => {
                    const isMe = msg.user_id === currentUser.id;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: isMe ? '#222' : '#111',
                            padding: '0.5rem 1rem',
                            borderLeft: isMe ? 'none' : '2px solid #555',
                            borderRight: isMe ? '2px solid var(--primary)' : 'none',
                        }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{ color: isMe ? 'var(--primary)' : 'var(--secondary)' }}>{msg.username}</span>
                                <span>{new Date(msg.timestamp).toLocaleString()}</span>
                            </div>
                            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '2px solid #333' }}>
                <input
                    className="pixel-input"
                    style={{ flex: 1, border: 'none', padding: '1rem' }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="ENTER_MESSAGE..."
                    maxLength={500}
                />
                <button type="submit" className="pixel-btn" style={{ border: 'none', borderLeft: '2px solid #333' }}>SEND</button>
            </form>
        </div>
    );
}
