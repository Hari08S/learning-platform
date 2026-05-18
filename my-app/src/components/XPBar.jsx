import React from 'react';
import useStore from '../store';
import '../styles/courses.css'; // use existing styles

export default function XPBar() {
    const xp = useStore(state => state.xp);
    const level = useStore(state => state.level);

    // 100 XP per level
    const xpForNextLevel = level * 100;
    const progressPercent = Math.min(100, Math.max(0, ((xp % 100) / 100) * 100));

    return (
        <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--upwise-dark)' }}>Level {level}</span>
                <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>{xp} / {xpForNextLevel} XP</span>
            </div>
            <div style={{
                width: '100%',
                height: '10px',
                background: '#cbd5e1',
                borderRadius: '5px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--upwise-mid), var(--accent))',
                    transition: 'width 0.5s ease-in-out'
                }} />
            </div>
        </div>
    );
}
