// src/components/AchievementsRow.jsx
import React from 'react';

export default function AchievementsRow({ badges = [] }) {
  // badges: [{ id, title, icon, earnedAt, description, progress }]
  return (
    <div style={{ marginTop: 22 }}>
      <h3 style={{ marginBottom: 10 }}>Achievements</h3>
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 6
      }}>
        {badges.length === 0 ? (
          <div style={{ color: '#64748B' }}>No achievements yet — complete lessons to earn badges.</div>
        ) : badges.map(b => (
          <div key={b.id} style={{
            minWidth: 180,
            background: '#fff',
            borderRadius: 12,
            padding: 14,
            boxShadow: '0 8px 28px rgba(2,6,23,0.04)'
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 10, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22, background: '#F8FAFF'
              }}>{b.icon || '🏅'}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{b.title}</div>
                <div style={{ color: '#94A3B8', fontSize: 13 }}>{b.earnedAt ? new Date(b.earnedAt).toLocaleDateString() : (b.progress ? `${Math.round(b.progress*100)}%` : 'Locked')}</div>
              </div>
            </div>
            {b.description && <div style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>{b.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
