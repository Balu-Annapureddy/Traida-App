"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            router.push('/');
            router.refresh();
        } else {
            setError(data.error || 'Login failed');
        }
    }

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.card}`}>
                <h1 className={styles.title} style={{ color: 'var(--foreground)', fontSize: '1.2rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                    TRAIDA
                </h1>

                {error && <div className={styles.error} style={{ color: 'var(--error)', border: '1px solid var(--error)' }}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--secondary)' }}>Identifier</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pixel-input"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--secondary)' }}>Passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pixel-input"
                            required
                        />
                    </div>

                    <button type="submit" className="pixel-btn" style={{ marginTop: '1rem', width: '100%' }}>
                        Begin
                    </button>
                </form>

                <div className={styles.footer}>
                    <a href="/register" style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Create Identity</a>
                </div>
            </div>
        </div>
    );
}
