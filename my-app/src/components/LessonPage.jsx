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
  const [isCompleted, setIsCompleted] = useState(false);

  // Notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTime, setNewNoteTime] = useState('');

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
        setIsCompleted(!!js.isCompleted);
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

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/me/notes/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.filter(n => String(n.lessonId) === String(moduleId)));
      }
    } catch (err) { }
  };

  useEffect(() => {
    fetchNotes();
  }, [courseId, moduleId]);

  useEffect(() => {
    // mark this course as current so presence tracker attributes time here
    const prev = localStorage.getItem('currentCourseId');
    localStorage.setItem('currentCourseId', courseId);
    return () => {
      // only remove if we set it (avoid wiping if other page changed it)
      const cur = localStorage.getItem('currentCourseId');
      if (cur === courseId) localStorage.removeItem('currentCourseId');
    };
  }, [courseId]);


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
        setIsCompleted(true);
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

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('Please sign in to add a note.');

    // Parse timestamp like "1:20" to seconds
    let timestamp = 0;
    if (newNoteTime) {
      const parts = newNoteTime.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        timestamp = parts[0] * 60 + parts[1];
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        timestamp = parts[0];
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/me/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          courseId,
          lessonId: moduleId,
          timestamp,
          text: newNoteText
        })
      });
      if (res.ok) {
        setNewNoteText('');
        setNewNoteTime('');
        fetchNotes();
        import('react-hot-toast').then(mod => mod.toast.success("Note saved!"));
      } else {
        alert('Failed to save note');
      }
    } catch (e) {
      alert('Error saving note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/me/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotes();
        import('react-hot-toast').then(mod => mod.toast.success("Note deleted"));
      }
    } catch (e) { }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="container" style={{ padding: 28 }}>
      <button className="btn outline" onClick={() => navigate(`/courses/${courseId}`)} style={{ marginBottom: 18 }}>← Back to Course</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{module.title}</h1>
          <div style={{ color: '#64748B', marginTop: 8 }}>{module.mins || '—'} min</div>
        </div>
        <button className="btn outline" onClick={() => setNotesOpen(!notesOpen)}>
          {notesOpen ? 'Hide Notes' : '📝 My Notes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, background: '#fff', padding: 22, borderRadius: 12, boxShadow: '0 6px 20px rgba(2,6,23,0.04)' }}>
          {module.type === 'video' && module.videoUrl && (
            <div style={{ marginBottom: 24 }}>
              <iframe
                width="100%"
                height="500"
                src={module.videoUrl}
                title={module.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 8, background: '#000' }}
              ></iframe>
            </div>
          )}

          {module.content ? (
            <div style={{ lineHeight: 1.6, color: '#334155', fontSize: '1.05rem', whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: module.content }} />
          ) : module.body ? (
            <div dangerouslySetInnerHTML={{ __html: module.body }} />
          ) : !module.videoUrl ? (
            <p style={{ color: '#475569' }}>No content provided for this lesson.</p>
          ) : null}
        </div>

        {notesOpen && (
          <div style={{ width: '350px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 16px', color: 'var(--upwise-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📝 My Notes
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Time (e.g. 1:20)"
                value={newNoteTime}
                onChange={e => setNewNoteTime(e.target.value)}
                style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <textarea
                placeholder="Add a note..."
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', minHeight: '40px' }}
              />
            </div>
            <button className="btn primary small" onClick={handleAddNote} style={{ marginBottom: '24px' }}>Save Note</button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '400px' }}>
              {notes.length === 0 ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No notes for this lesson yet.</p> : notes.map(n => (
                <div key={n._id} style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
                  <button
                    onClick={() => handleDeleteNote(n._id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >✕</button>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '4px' }}>
                    {formatTime(n.timestamp)}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--upwise-dark)', whiteSpace: 'pre-line' }}>{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        {!isQuiz && (
          <>
            <button
              className={`btn ${isCompleted ? 'outline' : 'primary'}`}
              onClick={() => handleMark(false)}
              disabled={marking || isCompleted}
            >
              {marking ? 'Marking…' : isCompleted ? '✓ Completed' : 'Mark as done'}
            </button>
            <button className="btn outline" onClick={() => handleMark(true)} disabled={marking}>{marking ? 'Processing…' : 'Mark done & Next'}</button>
          </>
        )}

        {isQuiz && <button className="btn primary" onClick={() => navigate(`/courses/${courseId}/quiz`)}>Take Quiz</button>}

        <div style={{ marginLeft: 'auto', color: '#64748B', alignSelf: 'center' }}>Tip: mark lessons to track progress.</div>
      </div>
    </div>
  );
}
