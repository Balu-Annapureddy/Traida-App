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
                <h1 className={styles.title}>ACCESS_TERMINAL</h1>

                {error && <div className={styles.error}>ERROR: {error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>IDENTIFIER</label>
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
                        <label>PASSCODE</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="********"
                            required
                        />
                    </div>

                    <button type="submit" className="pixel-btn">
                        INITIALIZE_SESSION
                    </button>
                </form>

                <div className={styles.footer}>
                    <span>NEW_ENTITY? </span>
                    <a href="/register">ESTABLISH_IDENTITY</a>
                </div>
            </div>
        </div>
    );
}
