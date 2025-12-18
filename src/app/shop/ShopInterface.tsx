"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./shop.module.css";

// Replicating Server Items for MVP Display
const SHOP_ITEMS = [
    { id: 'THEME_MATRIX', name: 'The Matrix Theme', cost: 500, type: 'AVATAR', rarity: 'PREMIUM', locked: false },
    { id: 'EMOJI_PACK_PREMIUM', name: 'Premium Emojis', cost: 1000, type: 'EMOJI', rarity: 'PREMIUM', locked: true }, // Example locked item
];

export default function ShopInterface() {
    const [balance, setBalance] = useState({ coins: 0, spCoins: 0 });
    const [inventory, setInventory] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWallet();
    }, []);

    async function fetchWallet() {
        try {
            const res = await fetch('/api/wallet');
            const data = await res.json();
            if (data.balance) {
                setBalance(data.balance);
                setInventory(data.inventory.map((i: any) => i.item_id));
            }
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    }

    async function buy(itemId: string) {
        if (!confirm("CONFIRM_PURCHASE?")) return;

        try {
            const res = await fetch('/api/shop/purchase', {
                method: 'POST',
                body: JSON.stringify({ itemId })
            });
            const data = await res.json();

            if (data.success) {
                alert("TRANSACTION_COMPLETE");
                fetchWallet();
            } else {
                alert("ERROR: " + data.error);
            }
        } catch (e) {
            alert("NETWORK_FAIL");
        }
    }

    if (loading) return <div className={styles.loading}>LOADING_MARKET...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>VIRTUAL_MARKET</h1>
                <div className={styles.balance}>
                    <span style={{ color: 'gold' }}>{balance.coins} COINS</span>
                    <span style={{ color: 'purple' }}>{balance.spCoins} SP</span>
                </div>
                <Link href="/" className="pixel-btn">EXIT</Link>
            </header>

            <div className={styles.grid}>
                {SHOP_ITEMS.map(item => {
                    const owned = inventory.includes(item.id);
                    // For MVP, locked items are just 'Coming Soon' if explicitly locked logic existed, 
                    // but here we used a flag. Let's strictly follow the 'locked items show Coming Soon' rule 
                    // if they are not actually buyable or just placeholders.
                    // For this demo, let's treat the 'Premium Emojis' as effectively 'Sold Out' or 'Locked' via UI to demonstrate.

                    const isLocked = item.locked;

                    return (
                        <div key={item.id} className={`${styles.card} ${owned ? styles.owned : ''}`}>
                            <div className={styles.icon}>
                                {item.type === 'AVATAR' ? '👤' : '📦'}
                            </div>
                            <h3>{item.name}</h3>
                            <p className={styles.rarity}>{item.rarity}</p>

                            {owned ? (
                                <div className={styles.status}>OWNED</div>
                            ) : isLocked ? (
                                <div className={styles.cost} style={{ color: '#666' }}>COMING_SOON</div> // "Locked items show Coming Soon"
                            ) : (
                                <button className="pixel-btn" onClick={() => buy(item.id)}>
                                    BUY ({item.cost})
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={`pixel-border ${styles.notice}`}>
                <p>⚠️ MARKETPLACE_RULES:</p>
                <ul style={{ fontSize: '0.8rem', color: '#888' }}>
                    <li>NO_REFUNDS</li>
                    <li>COSMETIC_ONLY</li>
                    <li>NO_PAY_TO_WIN</li>
                </ul>
            </div>
        </div>
    );
}
