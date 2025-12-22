'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/login.module.css';

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('Verifying...');

        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailParam, otp })
        });

        const data = await res.json();

        if (data.success) {
            setStatus('Verified! Redirecting...');
            setTimeout(() => router.push('/dashboard'), 1000);
        } else {
            setError(data.error || 'Verification failed');
            setStatus('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>VERIFY ACCOUNT</h1>
                <p>Enter the code sent to {emailParam}</p>

                <form onSubmit={handleVerify} className={styles.form}>
                    <input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={styles.input}
                        maxLength={6}
                    />

                    {error && <div className={styles.error}>{error}</div>}
                    {status && <div className={styles.success}>{status}</div>}

                    <button type="submit" className={styles.button}>CONFIRM</button>
                </form>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
