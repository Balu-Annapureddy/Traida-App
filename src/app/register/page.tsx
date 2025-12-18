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
                <h1 className={styles.title}>NEW_IDENTITY_PROTOCOL</h1>

                {error && <div className={styles.error}>ERROR: {error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>IDENTIFIER *</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            placeholder="USERNAME"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>PASSCODE *</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="********"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>COMM_LINK (OPTIONAL)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="EMAIL"
                        />
                    </div>

                    <button type="submit" className="pixel-btn">
                        GENERATE_IDENTITY
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>ALREADY_EXIST? </span>
                    <a href="/login">ACCESS_TERMINAL</a>
                </div>
            </div>
        </div>
    );
}
