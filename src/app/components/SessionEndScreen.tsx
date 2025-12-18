"use client";

import { useRouter } from "next/navigation";

export default function SessionEndScreen({ onReturn, onPractice }: { onReturn?: () => void, onPractice?: () => void }) {
    const router = useRouter();

    function handleReturn() {
        if (onReturn) onReturn();
        else router.push('/');
    }

    function handlePractice() {
        if (onPractice) onPractice();
        else router.push('/liber');
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="pixel-border" style={{ background: '#000', padding: '2rem', maxWidth: '90%', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>SESSION_COMPLETE</h2>
                <p style={{ marginBottom: '2rem', fontSize: '1.2rem' }}>That's enough for now.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="pixel-btn" onClick={handleReturn} style={{ padding: '1rem' }}>
                        RETURN_TOMORROW
                    </button>
                    <button className="pixel-btn" onClick={handlePractice} style={{ borderStyle: 'dashed', opacity: 0.7 }}>
                        PRACTICE_MORE (LIBER)
                    </button>
                    <button onClick={() => window.close()} style={{ background: 'none', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer' }}>
                        CLOSE_SYSTEM
                    </button>
                </div>
            </div>
        </div>
    );
}
