"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { submitChallenge, submitPractice } from "../actions";
import styles from "./play.module.css";

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
            return;
        }

        const timeTakenMs = (300 - timeLeft) * 1000;
        await submitChallenge(challengeId, answer, timeTakenMs);
        window.location.reload();
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
