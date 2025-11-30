// src/components/LearningTimeline.jsx
import React from 'react';
import { relativeTime } from '../utils/time';
 // optional small local css; I also included main CSS changes below

const iconForType = {
  purchase: '🛒',
  lesson_completed: '✅',
  certificate_issued: '📜',
  streak: '🔥'
};

export default function LearningTimeline({ events = [] }) {
  // events: [{ id, type, title, courseId, time, meta }]
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ marginBottom: 10 }}>Learning Timeline</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        {events.length === 0 ? (
          <div style={{ color: '#64748B' }}>No recent activity — start a lesson to see timeline items.</div>
        ) : (
          events.map(ev => (
            <div key={ev.id} style={{
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
