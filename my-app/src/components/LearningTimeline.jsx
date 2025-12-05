import React from 'react';
import { relativeTime } from '../utils/time';

const iconForType = {
  purchase: '🛒',
  lesson_completed: '✅',
  course_completed: '🏁',
  certificate_issued: '📜',
  streak: '🔥',
  viewed: '👀'
};

export default function LearningTimeline({ events = [] }) {
  // Filter timeline for meaningful events and dedupe
  const filtered = (Array.isArray(events) ? events : []).filter(ev => {
    if (!ev || !ev.type) return false;
    if (ev.type === 'purchase') return false; // purchases in settings
    if (ev.type === 'viewed' && (ev.meta?.percent === 0 || ev.meta?.percent == null)) return false;
    return true;
  });

  const deduped = [];
  for (const ev of filtered) {
    const last = deduped[deduped.length - 1];
    if (last && last.type === ev.type && last.title === ev.title && String(last.courseId) === String(ev.courseId)) {
      continue;
    }
    deduped.push(ev);
  }

  const visible = deduped.slice(0, 5);

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 10 }}>Learning Timeline</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {visible.length === 0 ? (
          <div style={{ color: '#64748B' }}>No recent activity — start a lesson to see timeline items.</div>
        ) : (
          visible.map(ev => (
            <div key={ev.id || (ev.type + '-' + (ev.courseId || ev.time || Math.random()))} style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              background: '#fff',
              borderRadius: 10,
              padding: 12,
              boxShadow: '0 6px 18px rgba(2,6,23,0.04)'
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: '#F1F5F9'
              }}>
                {iconForType[ev.type] || '•'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 800 }}>{ev.title}</div>
                  <div style={{ color: '#94A3B8', fontSize: 13 }}>{relativeTime(ev.time)}</div>
                </div>
                <div style={{ marginTop: 6, color: '#6B7280', fontSize: 14 }}>
                  {ev.meta?.courseTitle ? ev.meta.courseTitle : (ev.courseTitle || '')}
                  {ev.meta?.percent != null ? ` • ${ev.meta.percent}%` : ''}
                </div>
                {ev.meta?.cta && (
                  <div style={{ marginTop: 8 }}>
                    <a className="btn course-btn" href={ev.meta.cta} style={{ textDecoration: 'none' }}>{ev.meta.ctaText || 'Open'}</a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
