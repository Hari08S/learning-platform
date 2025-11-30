// src/components/QuizPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE}/api/courses/${courseId}/quiz`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const ct = res.headers.get('content-type') || '';
          const body = ct.includes('application/json') ? (await res.json()).message : await res.text();
          throw new Error(body || `Server ${res.status}`);
        }
        const js = await res.json();
        if (!mounted) return;
        setQuiz(js.quiz || []);
      } catch (e) {
        console.error('load quiz', e);
        setErr(e.message || 'Could not load quiz');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [courseId]);

  const select = (qid, idx) => setAnswers(prev => ({ ...prev, [qid]: idx }));

  const submit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to submit the quiz.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { answers: quiz.map(q => ({ id: q.id, selectedIndex: typeof answers[q.id] === 'number' ? answers[q.id] : -1 })) };
      const res = await fetch(`${API_BASE}/api/me/quiz/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('application/json') ? (await res.json()).message : await res.text();
        throw new Error(body || `Server ${res.status}`);
      }
      const js = await res.json();
      if (js.passed) {
        alert(`Passed — score ${js.score}%! Certificate unlocked.`);
        window.dispatchEvent(new Event('purchases.updated'));
        window.dispatchEvent(new Event('user.updated'));
        navigate('/dashboard');
      } else {
        const again = window.confirm(`Your score: ${js.score}%. You need at least 50% to pass. Retry?`);
        if (!again) navigate(`/courses/${courseId}`);
      }
    } catch (err) {
      console.error('submit quiz', err);
      alert('Quiz submit failed: ' + (err.message || 'Server error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 28 }}>Loading quiz…</div>;
  if (err) return <div className="container" style={{ padding: 28, color: 'red' }}>{err}</div>;
  if (!quiz.length) return <div className="container" style={{ padding: 28 }}>No quiz available.</div>;

  return (
    <div className="container" style={{ padding: 28 }}>
      <h1>Course Quiz</h1>
      <div style={{ marginTop: 12, display: 'grid', gap: 16 }}>
        {quiz.map((q, idx) => (
          <div key={q.id} style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
            <div style={{ fontWeight: 800 }}>{idx + 1}. {q.question}</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {q.choices.map((c, i) => (
                <label key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === i} onChange={() => select(q.id, i)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
        <button className="btn primary" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Quiz'}</button>
        <button className="btn outline" onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</button>
      </div>
    </div>
  );
}
