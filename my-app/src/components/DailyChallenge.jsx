import React, { useState, useEffect } from 'react';
import useStore from '../store';
import questions from '../data/interviewQuestions';

// Simple daily hash based on date string
const getDailyQuestion = () => {
    const allQ = Object.values(questions).flat();
    const dateStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % allQ.length;
    return { ...allQ[index], options: [allQ[index].answer, "Dummy option A", "Dummy option B", "Dummy option C"].sort(() => Math.random() - 0.5) };
};

export default function DailyChallenge() {
    const addXP = useStore(state => state.addXP);
    const [q, setQ] = useState(null);
    const [selected, setSelected] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [correct, setCorrect] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem(`daily_challenge_${today}`);
        if (stored) {
            setSubmitted(true);
            setCorrect(stored === 'true');
        } else {
            setQ(getDailyQuestion());
        }
    }, []);

    const handleSubmit = () => {
        if (!selected) return;
        const isRight = selected === q.answer;
        setCorrect(isRight);
        setSubmitted(true);

        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`daily_challenge_${today}`, String(isRight));

        if (isRight) {
            addXP(15, "Completing the daily challenge");
        }
    };

    return (
        <div style={{
            background: 'var(--bg-light)',
            border: '2px dashed var(--accent)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--upwise-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Today's Challenge 🔥
            </h3>

            {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                        {correct ? '🎉' : '💡'}
                    </div>
                    <h4 style={{ color: correct ? 'var(--accent)' : 'var(--muted)', marginBottom: '8px' }}>
                        {correct ? '+15 XP Awarded!' : 'Nice try!'}
                    </h4>
                    <p style={{ color: 'var(--upwise-mid)' }}>Come back tomorrow for a new challenge!</p>
                </div>
            ) : q ? (
                <>
                    <p style={{ fontWeight: 600, color: 'var(--upwise-dark)', marginBottom: '16px' }}>{q.question}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {q.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => setSelected(opt)}
                                style={{
                                    padding: '12px',
                                    textAlign: 'left',
                                    background: selected === opt ? 'var(--upwise-mid)' : '#fff',
                                    color: selected === opt ? '#fff' : 'var(--muted)',
                                    border: `1px solid ${selected === opt ? 'var(--upwise-mid)' : '#e2e8f0'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: selected === opt ? 600 : 400
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn primary"
                        style={{ width: '100%' }}
                        disabled={!selected}
                        onClick={handleSubmit}
                    >
                        Submit Answer
                    </button>
                </>
            ) : <p>Loading challenge...</p>}
        </div>
    );
}
