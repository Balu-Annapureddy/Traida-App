"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./chat.module.css"; // Reuse existing styles

// Helper Component for DM Chat
export default function DMInterface({ amigoId, username, friendName }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Polling logic
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // 2s poll
        return () => clearInterval(interval);
    }, [amigoId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/dm/${amigoId}/messages`);
            const data = await res.json();
            if (data.messages) {
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

        const originalInput = input;
        setInput("");

        try {
            await fetch(`/api/dm/${amigoId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content: originalInput })
            });
            fetchMessages();
        } catch (e) {
            setInput(originalInput);
        }
    }

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.header}`}>
                <div>
                    <h1 className={styles.title} style={{ color: 'var(--secondary)' }}>UPLINK: {friendName}</h1>
                    <span className={styles.status} style={{ color: 'green' }}>ENCRYPTED_CHANNEL</span>
                </div>
                <Link href="/amigos" className="pixel-btn" style={{ fontSize: '0.8rem' }}>BACK</Link>
            </div>

            <div className={`pixel-border ${styles.chatWindow}`}>
                {loading && <div style={{ padding: '1rem', color: '#666' }}>HANDSHAKE...</div>}
                {messages.length === 0 && !loading && <div style={{ textAlign: 'center', marginTop: '2rem', color: '#444' }}>CHANNEL_OPEN. BEGIN_TRANSMISSION.</div>}

                {messages.map((msg) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={msg.id} className={`${styles.message} ${isMe ? styles.me : ''}`}>
                            <div className={styles.msgHeader}>
                                <span className={styles.msgUser}>{msg.username}</span>
                                <span className={styles.msgTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className={styles.msgContent}>{msg.content}</div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className={styles.inputArea}>
                <input
                    type="text"
                    className={`pixel-border ${styles.input}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="SECURE_MESSAGE..."
                    maxLength={500}
                />
                <button type="submit" className="pixel-btn">→</button>
            </form>
        </div>
    );
}
