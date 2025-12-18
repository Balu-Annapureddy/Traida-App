"use client";

import { useState } from "react";
import styles from "./profile.module.css";
import { updateUsername } from "./actions";

export default function ProfileHeader({ user }: { user: any }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user.username);
    const [status, setStatus] = useState<string | null>(null);

    async function handleSave(formData: FormData) {
        setStatus("SAVING...");
        const res = await updateUsername(formData);

        if (res.error) {
            setStatus(`ERROR: ${res.error}`);
        } else {
            setStatus(null);
            setEditing(false);
            // Name update will reflect on revalidation refresh
        }
    }

    return (
        <div className={styles.header}>
            <div className={styles.avatarSection}>
                <div className={styles.avatarPlaceholder}>
                    {user.avatar_id ? '👤' : '?'}
                </div>
            </div>

            <div className={styles.infoSection}>
                {editing ? (
                    <form action={handleSave} className={styles.editForm}>
                        <input
                            name="username"
                            defaultValue={name}
                            className="pixel-input"
                            minLength={3}
                            maxLength={15}
                            required
                        />
                        <button type="submit" className="pixel-btn">SAVE (1 SP)</button>
                        <button type="button" onClick={() => setEditing(false)} className="pixel-btn" style={{ background: '#333' }}>CANCEL</button>
                        {status && <p className={styles.error}>{status}</p>}
                    </form>
                ) : (
                    <div className={styles.nameRow}>
                        <h1 className={styles.username}>{user.username}</h1>
                        <button onClick={() => setEditing(true)} className={styles.editBtn} title="Change Name (1 SP Coin)">✏️</button>
                    </div>
                )}

                <div className={styles.archetypeBadge}>
                    ARCHETYPE: <span className={styles.archetypeValue}>{user.archetype_id || 'UNKNOWN'}</span>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>COINS</span>
                    <span className={styles.statValue} style={{ color: 'gold' }}>{user.coins}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>SP COINS</span>
                    <span className={styles.statValue} style={{ color: '#9d00ff' }}>{user.sp_coins}</span>
                </div>
            </div>
        </div>
    );
}
