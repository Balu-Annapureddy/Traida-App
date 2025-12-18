"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ clubId }: { clubId: any }) {
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(null);

    async function handleJoin() {
        if (!confirm("JOIN_CLUB?")) return;
        setStatus("JOINING...");

        try {
            const res = await fetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                router.refresh();
            } else {
                setStatus(`ERROR: ${data.error}`);
            }
        } catch (e) {
            setStatus("NETWORK_FAIL");
        }
    }

    return (
        <div>
            <button className="pixel-btn" onClick={handleJoin}>
                INITIATE_JOIN_REQUEST
            </button>
            {status && <p style={{ marginTop: '1rem', color: 'orange' }}>{status}</p>}
        </div>
    );
}
