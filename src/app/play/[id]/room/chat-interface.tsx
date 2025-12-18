"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./chat.module.css";

export default function ChatInterface({ roomId, username, challengeType }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Polling logic
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // 2s poll
        return () => clearInterval(interval);
    }, [roomId]);

    // Auto-scroll on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/room/${roomId}/messages`);
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
            }
            setLoading(false);
        } catch (e) {
            console.error("Chat Error", e);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim()) return;

        const originalInput = input;
        setInput(""); // Optimistic clear

        try {
            await fetch(`/api/room/${roomId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ content: originalInput })
            });
            fetchMessages(); // Immediate refresh
        } catch (e) {
            setInput(originalInput); // Revert on fail
        }
    }

    async function handleReport(messageId: number) {
        if (!confirm("REPORT_OFFENSE? (Only for spam/abuse)")) return;

        try {
            await fetch('/api/report', {
                method: 'POST',
                body: JSON.stringify({ message_id: messageId, reason: "Spam/Abuse" }) // MVP simple reason
            });
            alert("REPORT_FILED. ADMINS_ALERTED.");
        } catch (e) {
            alert("ERROR_FILING_REPORT");
        }
    }

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.header}`}>
                <div>
                    <h1 className={styles.title}>ROOM: {challengeType}</h1>
                    <span className={styles.status}>CONNECTED</span>
                </div>
                <Link href="/" className="pixel-btn" style={{ fontSize: '0.8rem' }}>EXIT</Link>
            </div>

            <div className={`pixel-border ${styles.chatWindow}`}>
                {loading && <div style={{ padding: '1rem', color: '#666' }}>ESTABLISHING_UPLINK...</div>}
                {messages.map((msg) => {
                    const isMe = msg.username === username;
                    return (
                        <div key={msg.id} className={`${styles.message} ${isMe ? styles.me : ''}`}>
                            <div className={styles.msgHeader}>
                                <span className={styles.msgUser}>{msg.username}</span>
                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <span className={styles.msgTime}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!isMe && (
                                        <button
                                            onClick={() => handleReport(msg.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#666',
                                                cursor: 'pointer',
                                                fontSize: '0.6rem',
                                                marginLeft: '5px'
                                            }}
                                            title="REPORT"
                                        >
                                            [!]
                                        </button>
                                    )}
                                </div>
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
                    placeholder="TRANSMIT_MESSAGE..."
                    maxLength={500}
                />
                <button type="submit" className="pixel-btn">→</button>
            </form>
        </div>
    );
}
