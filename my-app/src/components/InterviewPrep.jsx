import React, { useState } from 'react';
import questions from '../data/interviewQuestions';
import SEO from './SEO';

export default function InterviewPrep() {
    const [activeTab, setActiveTab] = useState(Object.keys(questions)[0]);
    const [revealed, setRevealed] = useState({});

    // Check localStorage for progress tracking
    const [practiced, setPracticed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('interview_practiced') || '{}');
        } catch (e) { return {}; }
    });

    const toggleReveal = (id) => {
        setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const togglePracticed = (id) => {
        const next = { ...practiced, [id]: !practiced[id] };
        setPracticed(next);
        localStorage.setItem('interview_practiced', JSON.stringify(next));
    };

    const totalInTopic = questions[activeTab]?.length || 0;
    const practicedInTopic = questions[activeTab]?.filter(q => practiced[`${activeTab}_${q.id}`])?.length || 0;

    return (
        <>
            <SEO title="Interview Prep" description="Crack your next technical interview on Upwise" />
            <div className="container" style={{ padding: '40px 24px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: 'var(--upwise-dark)', marginBottom: '8px' }}>Crack Your Next Interview 🎯</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '18px' }}>Practice top system design, behavioral, and technical questions.</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
                    {Object.keys(questions).map(topic => (
                        <button
                            key={topic}
                            onClick={() => setActiveTab(topic)}
                            style={{
                                padding: '8px 16px',
                                background: activeTab === topic ? 'var(--upwise-dark)' : '#f1f5f9',
                                color: activeTab === topic ? '#fff' : 'var(--muted)',
                                border: 'none',
                                borderRadius: '20px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: activeTab === topic ? 'scale(1.05)' : 'none'
                            }}
                        >
                            {topic}
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--upwise-mid)', fontWeight: 'bold' }}>
                    Progress: {practicedInTopic} / {totalInTopic} practiced in {activeTab}
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {questions[activeTab]?.map((q, i) => {
                        const qId = `${activeTab}_${q.id}`;
                        const isRevealed = !!revealed[qId];
                        return (
                            <div key={q.id} style={{
                                background: '#fff',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--upwise-dark)', fontSize: '18px', fontWeight: 600 }}>
                                        {i + 1}. {q.question}
                                    </h3>
                                    <button
                                        onClick={() => toggleReveal(qId)}
                                        style={{ whiteSpace: 'nowrap', padding: '6px 12px', background: 'var(--bg-light)', color: 'var(--upwise-dark)', border: '1px solid var(--accent)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        {isRevealed ? 'Hide Answer' : 'Show Answer'}
                                    </button>
                                </div>

                                <div style={{
                                    maxHeight: isRevealed ? '500px' : '0',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.4s ease-in-out',
                                    marginTop: isRevealed ? '16px' : '0',
                                    color: 'var(--muted)',
                                    lineHeight: 1.6
                                }}>
                                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                                        {q.answer}
                                    </div>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', cursor: 'pointer', fontWeight: 600, color: 'var(--upwise-mid)' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!practiced[qId]}
                                            onChange={() => togglePracticed(qId)}
                                            style={{ transform: 'scale(1.2)' }}
                                        />
                                        Mark as Practiced
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
