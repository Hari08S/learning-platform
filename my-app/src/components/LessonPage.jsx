import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function LessonPage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE}/api/courses/${courseId}/module/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const ct = res.headers.get('content-type') || '';
          const body = ct.includes('application/json') ? (await res.json()).message : await res.text();
          throw new Error(body || `Server ${res.status}`);
        }
        const js = await res.json();
        if (!mounted) return;
        setModule(js.module);
      } catch (e) {
        console.error('load module', e);
        setErr(e.message || 'Could not load module');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseId, moduleId]);

  const handleMark = async (goNext = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to mark lessons as done.');
      return;
    }
    if (marking) return;
    setMarking(true);
    try {
      const res = await fetch(`${API_BASE}/api/me/progress/mark-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId, lessonId: module.id || module._id || moduleId })
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('application/json') ? (await res.json()).message : await res.text();
        throw new Error(body || `Server ${res.status}`);
      }

      // let the rest of the app update
      window.dispatchEvent(new Event('purchases.updated'));
      window.dispatchEvent(new Event('user.updated'));

      if (goNext) {
        // fetch course to compute next module
        const cRes = await fetch(`${API_BASE}/api/courses/${courseId}`);
        if (cRes.ok) {
          const cjs = await cRes.json();
          const curriculum = cjs.course.curriculum || [];
          // find by id or _id; normalize as strings
          const idx = curriculum.findIndex(ci => String(ci.id ?? ci._id) === String(moduleId) || String(ci.id ?? ci._id) === String(module.id ?? module._id));
          if (idx >= 0 && idx < curriculum.length - 1) {
            const nextId = curriculum[idx + 1].id ?? curriculum[idx + 1]._id;
            navigate(`/courses/${courseId}/module/${nextId}`);
            return;
          } else {
            // last -> go to quiz
            navigate(`/courses/${courseId}/quiz`);
            return;
          }
        } else {
          // fallback numeric increment
          if (/^\d+$/.test(String(moduleId))) {
            navigate(`/courses/${courseId}/module/${String(Number(moduleId) + 1)}`);
            return;
          }
          navigate(`/courses/${courseId}`);
        }
      } else {
        // show a transient confirmation
        alert('Marked done ✓');
      }
    } catch (err) {
      console.error(err);
      alert('Could not mark lesson: ' + (err.message || 'Server error'));
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 28 }}>Loading lesson…</div>;
  if (err) return <div className="container" style={{ padding: 28, color: 'red' }}>{err}</div>;
  if (!module) return <div className="container" style={{ padding: 28 }}>Lesson not found</div>;

  const isQuiz = module.type === 'quiz';

  return (
    <div className="container" style={{ padding: 28 }}>
      <button className="btn outline" onClick={() => navigate(`/courses/${courseId}`)} style={{ marginBottom: 18 }}>← Back to Course</button>

      <h1>{module.title}</h1>
      <div style={{ color: '#64748B', marginBottom: 12 }}>{module.mins || '—'} min</div>

      <div style={{ background: '#fff', padding: 22, borderRadius: 12, boxShadow: '0 6px 20px rgba(2,6,23,0.04)' }}>
        {module.body ? <div dangerouslySetInnerHTML={{ __html: module.body }} /> : <p style={{ color: '#475569' }}>No content provided for this lesson.</p>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        {!isQuiz && (
          <>
            <button className="btn primary" onClick={() => handleMark(false)} disabled={marking}>{marking ? 'Marking…' : 'Mark as done'}</button>
            <button className="btn outline" onClick={() => handleMark(true)} disabled={marking}>{marking ? 'Processing…' : 'Mark done & Next'}</button>
          </>
        )}

        {isQuiz && <button className="btn primary" onClick={() => navigate(`/courses/${courseId}/quiz`)}>Take Quiz</button>}

        <div style={{ marginLeft: 'auto', color: '#64748B', alignSelf: 'center' }}>Tip: mark lessons to track progress.</div>
      </div>
    </div>
  );
}
