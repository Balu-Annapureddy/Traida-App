"use client";

import { useState } from "react";
import SignalCard from "@/app/components/SignalCard";
import SessionEndScreen from "@/app/components/SessionEndScreen";

export default function ClientSignalFlow({ challengeId }: { challengeId: number }) {
    const [step, setStep] = useState('SIGNAL'); // SIGNAL, END

    if (step === 'SIGNAL') {
        return (
            <div>
                <SignalCard contextId={challengeId.toString()} onComplete={() => setStep('END')} />
                <button onClick={() => setStep('END')} style={{ background: 'none', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer', fontSize: '0.7rem' }}>SKIP_SIGNAL</button>
            </div>
        );
    }

    if (step === 'END') {
        return <SessionEndScreen />;
    }

    return null;
}
