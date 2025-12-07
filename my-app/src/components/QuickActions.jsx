// src/components/QuickActions.jsx
import React from 'react';

export default function QuickActions({ lastCourseId, onResume, onSetGoal }) {
  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        className="btn primary"
        onClick={() => {
          if (!onResume) return;
          if (!lastCourseId) {
            alert('No recent course to resume.');
            return;
          }
          onResume(lastCourseId);
        }}
      >
        Resume Last Course
      </button>

      {/* Removed duplicate "Download Last Certificate" button per request */}

      <button
        className="btn"
        style={{ background: '#FDE68A', color: '#92400E', fontWeight: 800 }}
        onClick={() => {
          if (!onSetGoal) {
            // fallback simple prompt behaviour if parent didn't pass handler
            const mins = Number(prompt('Set weekly goal in minutes (e.g. 150)'));
            if (!isFinite(mins) || mins <= 0) return alert('Invalid value');
            localStorage.setItem('weeklyGoalMinutes', String(mins));
            alert('Weekly goal saved locally.');
            window.dispatchEvent(new Event('user.updated'));
            return;
          }
          onSetGoal();
        }}
      >
        Set Weekly Goal
      </button>

      <div style={{ marginLeft: 'auto', color: '#64748B', fontSize: 13 }}>
        Tip: Set a weekly goal and we’ll remind you.
      </div>
    </div>
  );
}
