"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import Link from "next/link";
import styles from "../clubs.module.css";

export default function CreateClubPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!confirm("CONFIRM: CREATE_CLUB?\nCost: 5 SP Coins\n(Refunded if rejected)")) return;

        setStatus("TRANSMITTING...");

        try {
            const res = await fetch('/api/clubs/create', {
                method: 'POST',
                body: JSON.stringify({ name, description: desc, isPrivate })
            });

            const data = await res.json();

            if (data.success) {
                // Redirect
                router.push('/clubs');
                router.refresh();
            } else {
                setStatus(`ERROR: ${data.error}`);
            }
        } catch (e) {
            setStatus("NETWORK_ERROR");
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>INIT_NEW_CLUB</h1>
                <Link href="/clubs" className="pixel-btn">CANCEL</Link>
            </header>

            <div className={`pixel-border ${styles.form}`}>
                <div className={styles.warning}>
                    Please note: Creating a club requires Admin Approval.
                    <strong> 5 SP Coins</strong> will be deducted immediately.
                    If rejected, the SP will be automatically refunded.
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label className={styles.label}>
                        CLUB_NAME (Unique)
                        <input
                            type="text"
                            className="pixel-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            minLength={3}
                            maxLength={20}
                            required
                        />
                    </label>

                    <label className={styles.label}>
                        DESCRIPTION
                        <textarea
                            className="pixel-input"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            maxLength={100}
                            rows={3}
                        />
                    </label>

                    <label className={`${styles.label} ${styles.checkbox}`}>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={e => setIsPrivate(e.target.checked)}
                        />
                        PRIVATE_CLUB (Invite Only)
                    </label>

                    <button type="submit" className="pixel-btn">
                        ESTABLISH_CLUB (5 SP)
                    </button>

                    {status && <p style={{ color: status.startsWith('ERROR') ? 'red' : '#fff' }}>{status}</p>}
                </form>
            </div>
        </div>
    );
}
