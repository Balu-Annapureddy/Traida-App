"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitChallenge, submitPractice } from "../actions";
import styles from "./play.module.css";
import SignalCard from "@/app/components/SignalCard";
import SessionEndScreen from "@/app/components/SessionEndScreen";

interface GameInterfaceProps {
    challengeId: number;
    type: string;
    content: any;
    challenge?: any; // Legacy prop? Or just full object
    mode?: 'ranked' | 'practice';
}

export default function PlayInterface({ challengeId, type, content, mode = 'ranked' }: GameInterfaceProps) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 mins in seconds
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [gameStatus, setGameStatus] = useState('PLAYING'); // PLAYING, WON, LOST
    const [score, setScore] = useState(0);

    // CD1/CD2 State
    const [showSignal, setShowSignal] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    useEffect(() => {
        if (gameStatus !== 'PLAYING') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameStatus]);

    async function handleSubmit(overrideAnswer: string | null) {
        if (submitting || gameStatus !== 'PLAYING') return;
        setSubmitting(true);

        const answer = overrideAnswer || selectedOption || "";

        // PRACTICE MODE LOGIC
        if (mode === 'practice') {
            const isCorrect = await submitPractice(challengeId, answer);
            setGameStatus(isCorrect ? 'WON' : 'LOST');
            setSubmitting(false);
            // In Practice, we show Signal then Closure too
            setShowSignal(true);
            return;
        }

        const timeTakenMs = (300 - timeLeft) * 1000;
        await submitChallenge(challengeId, answer, timeTakenMs);
        // Ranked: Reload to show result from Server Page? 
        // Logic in Page.tsx checks for attempt.
        // If we reload, we lose Client State (Signal Card).
        // WE MUST NOT RELOAD if we want to show Signal Card client-side.
        // Instead, we should handle "Success" state here, or we use a persistent "Signal Needed" check on Page.tsx.
        // Given Phase CD requirements ("Signal appears after challenge"), 
        // let's update local state to "COMPLETED" and show Signal, 
        // THEN on SessionEnd -> Router Push or Reload.

        // However, Page.tsx handles the "Result View". 
        // If we want to use that view, we should reload. 
        // But then Page.tsx needs to know to show Signal.
        // Complexity: Page.tsx checks DB. If we assume Page.tsx logic handles "Already Attempted", 
        // we can modify Page.tsx to also show Signal if attempt is fresh? Hard to track "fresh".
        // EASIER: Handle result display INLINE here for the immediate post-game flow.
        // We won't reload. We will setGameStatus('COMPLETE') and show Score/Result here.

        // We need to know if we won/lost and score. `submitChallenge` returns void?
        // Let's modify logic to wait or assuming success? 
        // Actually, `submitChallenge` is Server Action. 
        // We can't easily get result unless we refactor action to return it.
        // FOR NOW: Let's assume we reload for Ranked reliability (Server logic is source of truth).
        // BUT how to show Signal? 
        // Option A: Cookie/Param?
        // Option B: Query Param `?just_finished=true`.

        // Let's use `window.location.href = window.location.pathname + '?signal=true'` to reload and trigger signal?
        // Or refactor PlayPage to handle it.
        // Let's try inline handling if possible. 
        // IF I cannot change server action easily, I will stick to Reload + Query Param for Signal Trigger.

        window.location.href = window.location.pathname + '?signal=true';
    }

    // ... render logic ...

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={styles.container}>
            <div className={`pixel-border ${styles.header}`}>
                <span>{type}</span>
                <span className={styles.timer} style={{ color: timeLeft < 60 ? 'var(--error)' : 'var(--primary)' }}>
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
            </div>

            <div className={`pixel-border ${styles.questionCard}`}>
                <p className={styles.questionText}>{content.question}</p>

                <div className={styles.optionsGrid}>
                    {content.options.map((opt: string) => (
                        <button
                            key={opt}
                            className={`pixel-btn ${selectedOption === opt ? styles.selected : ''}`}
                            onClick={() => setSelectedOption(opt)}
                            disabled={submitting}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className={`pixel-btn ${styles.submitBtn}`}
                onClick={() => handleSubmit(null)}
                disabled={!selectedOption || submitting}
            >
                {submitting ? 'TRANSMITTING...' : 'LOCK_ANSWER'}
            </button>
        </div>
    );
}
