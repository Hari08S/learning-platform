import React, { useEffect, useState } from 'react';
import useStore from '../store';
import LoadingSpinner from './LoadingSpinner';
import SEO from './SEO';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = useStore(state => state.user);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                const res = await fetch(`${API_BASE}/api/leaderboard`);
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                const data = await res.json();
                setLeaders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const myRank = leaders.find(l => String(l._id) === String(user?.id || user?._id))?.rank;

    return (
        <>
            <SEO title="Leaderboard" description="Top learners on Upwise" />
            <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ color: 'var(--upwise-dark)', marginBottom: '8px', textAlign: 'center' }}>Top Learners Leaderboard 🏆</h1>

                {myRank ? (
                    <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '32px' }}>
                        You are ranked <strong>#{myRank}</strong> out of all students! Keep learning to climb higher.
                    </p>
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '32px' }}>
                        Complete lessons and courses to earn XP and get your name on the board!
                    </p>
                )}

                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {leaders.map((leader, i) => {
                            const isMe = String(leader._id) === String(user?.id || user?._id);

                            let rankDisplay = `#${leader.rank}`;
                            if (leader.rank === 1) rankDisplay = '🥇 1st';
                            if (leader.rank === 2) rankDisplay = '🥈 2nd';
                            if (leader.rank === 3) rankDisplay = '🥉 3rd';

                            return (
                                <div key={leader._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px 24px',
                                    background: isMe ? 'var(--card-bg)' : '#fff',
                                    border: isMe ? '2px solid var(--accent)' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ width: '60px', fontWeight: 'bold', fontSize: '18px', color: 'var(--upwise-dark)' }}>
                                        {rankDisplay}
                                    </div>

                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'var(--upwise-mid)', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', marginRight: '16px'
                                    }}>
                                        {leader.avatar || leader.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{leader.name} {isMe && '(You)'}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>Level {leader.level}</div>
                                    </div>

                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--upwise-dark)' }}>
                                        {leader.xp} XP
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
