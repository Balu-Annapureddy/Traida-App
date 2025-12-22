"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css'; // Reuse login styles

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // Optional
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email }),
        });

        const data = await res.json();

        if (res.ok) {
            // Auto login or redirect to login? 
            // For MVP, redirect to home as session is created
            router.push('/');
            router.refresh();
        } else {
            setError(data.error || 'Registration failed');
        }
    }

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.card}`}>
                <h1 className={styles.title} style={{ color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                    New Identity
                </h1>

                {error && <div className={styles.error} style={{ color: 'var(--error)', border: '1px solid var(--error)' }}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--secondary)' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pixel-input"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--secondary)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pixel-input"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--secondary)' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pixel-input"
                            required
                        />
                    </div>

                    <button type="submit" className="pixel-btn" style={{ marginTop: '1rem', width: '100%' }}>
                        Create
                    </button>
                </form>

                <div className={styles.footer}>
                    <a href="/login" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Return to Entrance</a>
                </div>
            </div>
        </div>
    );
}
