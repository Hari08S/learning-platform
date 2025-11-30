// src/components/QuickActions.jsx
import React from 'react';

export default function QuickActions({ lastCourseId, onResume, onDownloadCertificate, onSetGoal }) {
  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button className="btn primary" onClick={() => onResume && onResume(lastCourseId)}>Resume Last Course</button>
      <button className="btn outline" onClick={() => onDownloadCertificate && onDownloadCertificate(lastCourseId)}>Download Last Certificate</button>
      <button className="btn" style={{ background: '#FDE68A', color: '#92400E', fontWeight: 800 }} onClick={() => onSetGoal && onSetGoal()}>Set Weekly Goal</button>
      <div style={{ marginLeft: 'auto', color: '#64748B', fontSize: 13 }}>Tip: Set a weekly goal and we’ll remind you.</div>
    </div>
  );
}
