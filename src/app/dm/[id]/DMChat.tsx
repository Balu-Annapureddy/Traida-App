"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
// Using inline styles for speed as per requested batch efficiency

export default function DMChat({ roomId, currentUser }: { roomId: number, currentUser: any }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [roomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/dm/${roomId}/messages`);
            const data = await res.json();
            if (data.messages) setMessages(data.messages);
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
            await fetch(`/api/dm/${roomId}/messages`, {
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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid #333' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#050505', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loading && <div style={{ color: '#666' }}>DECRYPTING...</div>}
                {messages.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#444', marginTop: '2rem' }}>START_TRANSMISSION</div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender_id === currentUser.id;
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
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '2px solid #333' }}>
                <input
                    className="pixel-input"
                    style={{ flex: 1, border: 'none', padding: '1rem' }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="SECURE_TEXT..."
                    maxLength={500}
                />
                <button className="pixel-btn" style={{ border: 'none', borderLeft: '2px solid #333' }}>SEND</button>
            </form>
        </div>
    );
}
