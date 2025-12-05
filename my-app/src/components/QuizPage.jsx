// src/components/QuizPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Adjust API_BASE if your env var differs
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function QuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [courseTitle, setCourseTitle] = useState('Final Quiz');
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  // track start time
  const startRef = useRef(Date.now());

  // Set a global fallback start time in case other parts of app rely on it
  useEffect(() => {
    startRef.current = Date.now();
    window.__quizStartTime = startRef.current;
    return () => {
      try { delete window.__quizStartTime; } catch (e) {}
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const normalizeToClient = (payloadQuiz = {}) => {
      const questions = (payloadQuiz.questions || []).map((q, idx) => {
        const options = (q.options || q.choices || []).map((o, oi) => {
          if (typeof o === 'string') return { id: String(oi), text: o };
          return {
            id: o.id != null ? String(o.id) : (o._id != null ? String(o._id) : String(oi)),
            text: o.text ?? o.label ?? String(o)
          };
        });

        const correctOptionId = (q.correctOptionId != null)
          ? String(q.correctOptionId)
          : (q.correctOption != null ? String(q.correctOption) : (q.answer != null ? String(q.answer) : null));

        return {
          _id: q._id ?? q.id ?? `q${idx + 1}`,
          id: q._id ?? q.id ?? `q${idx + 1}`,
          question: q.text ?? q.question ?? q.title ?? `Question ${idx + 1}`,
          options,
          correctOptionId: correctOptionId != null ? String(correctOptionId) : null,
          points: Number(q.points || 1)
        };
      });

      return {
        _id: payloadQuiz._id ?? payloadQuiz.id ?? `quiz-${Date.now()}`,
        title: payloadQuiz.title || 'Final Quiz',
        passingScore: payloadQuiz.passingPercentage ?? payloadQuiz.passingScore ?? 50,
        estimatedMins: payloadQuiz.estimatedMins ?? 0,
        questions
      };
    };

    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) try /api/courses/:courseId/quiz
        const r = await fetch(`${API_BASE}/api/courses/${courseId}/quiz`, { headers });
        if (r.ok) {
          const j = await r.json();
          if (!mounted) return;
          const payload = j.quiz ?? j;
          const normalized = normalizeToClient(payload);
          setQuiz(normalized);
          setCourseTitle(normalized.title);
          setLoading(false);
          return;
        }

        // 2) fallback: /api/courses/:courseId (embedded quiz)
        const r2 = await fetch(`${API_BASE}/api/courses/${courseId}`, { headers });
        if (r2.ok) {
          const j2 = await r2.json();
          const courseData = j2.course ?? j2;
          if (courseData && courseData.quiz && Array.isArray(courseData.quiz.questions) && courseData.quiz.questions.length) {
            const normalized = normalizeToClient(courseData.quiz);
            if (!mounted) return;
            setQuiz(normalized);
            setCourseTitle(courseData.title ?? normalized.title);
            setLoading(false);
            return;
          }
        }

        // 3) no quiz found
        setQuiz(null);
        setError('No quiz found for this course.');
      } catch (err) {
        console.error('Quiz load error', err);
        setError('Could not load quiz. Try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadQuiz();

    return () => { mounted = false; };
  }, [courseId]);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}>Loading quiz...</div>;
  if (error) return <div style={{ padding: 48, textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!quiz) return <div style={{ padding: 48, textAlign: 'center' }}>No quiz available.</div>;

  const displayQuestions = quiz.questions || [];

  const handleSelect = (qIndex, optIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const resetForRetake = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    startRef.current = Date.now();
    window.__quizStartTime = startRef.current;
  };

  // The submit function — complete, authoritative uses server percentage
  const submitQuiz = async () => {
    // optional: confirm if unanswered
    if (Object.keys(selectedAnswers).length < displayQuestions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return;
    }

    // Quick client-side best-effort compute (fallback)
    let clientCorrect = 0;
    displayQuestions.forEach((q, i) => {
      const selIndex = selectedAnswers[i];
      if (selIndex == null) return;
      const selectedOption = (q.options || [])[selIndex];
      const selId = selectedOption ? String(selectedOption.id) : null;
      if (q.correctOptionId != null && selId != null && String(selId) === String(q.correctOptionId)) {
        clientCorrect++;
      }
    });
    const clientPct = displayQuestions.length ? Math.round((clientCorrect / displayQuestions.length) * 100) : 0;

    // show provisional results
    setScore(clientPct);
    setShowResults(true);

    // Build payload for server
    const payloadAnswers = displayQuestions.map((q, i) => {
      const sel = selectedAnswers[i];
      const selectedOption = (q.options || [])[sel];
      return {
        id: q._id ?? q.id ?? `q${i + 1}`,
        selectedOptionId: selectedOption ? String(selectedOption.id) : (sel != null ? String(sel) : null),
        selectedIndex: sel != null ? Number(sel) : null
      };
    });

    const timeTakenSeconds = Math.floor((Date.now() - (startRef.current || window.__quizStartTime || Date.now())) / 1000);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const resp = await fetch(`${API_BASE}/api/me/quiz/${courseId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: payloadAnswers, timeTakenSeconds })
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.warn('Quiz submit failed', resp.status, text);
        // keep client side result if server failed
        setScore(clientPct);
        return;
      }

      const data = await resp.json().catch(() => null);

      // Prefer several response shapes:
      // 1) { percentage: number }
      // 2) { result: { percentage: number, ... } }
      // 3) { result: { score, total } } -> compute
      let serverPct = null;
      if (data) {
        if (typeof data.percentage === 'number') serverPct = data.percentage;
        else if (data.result && typeof data.result.percentage === 'number') serverPct = data.result.percentage;
        else if (data.result && typeof data.result.score === 'number' && typeof data.result.total === 'number' && data.result.total > 0) {
          serverPct = Math.round((data.result.score / data.result.total) * 100);
        } else if (typeof data.result === 'number') {
          serverPct = Math.round(Number(data.result));
        }
      }

      if (serverPct !== null && typeof serverPct === 'number') {
        setScore(Math.round(serverPct));
      } else {
        setScore(clientPct);
      }

      // Fire events so Dashboard refreshes
      window.dispatchEvent(new Event('purchases.updated'));
      window.dispatchEvent(new Event('progress.updated'));
    } catch (err) {
      console.warn('Failed to submit quiz', err);
      // network error -> keep client pct
      setScore(clientPct);
    }
  };

  // Passing condition
  const passed = score >= (quiz.passingScore ?? 50);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, color: '#1e293b' }}>{courseTitle} - Final Quiz</h1>
      <p style={{ textAlign: 'center', color: '#666', fontSize: 18 }}>
        Passing Score: <strong>{quiz.passingScore ?? 50}%</strong>
      </p>

      {!showResults ? (
        <>
          {displayQuestions.map((q, i) => (
            <div key={q._id || i} style={{ background: '#fff', padding: 25, margin: '25px 0', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#0f172a' }}>{i + 1}. {q.question}</h3>
              {(q.options || []).map((opt, j) => (
                <label key={opt.id != null ? `${opt.id}` : j} onClick={() => handleSelect(i, j)}
                       style={{
                         display: 'block',
                         padding: 12,
                         margin: '8px 0',
                         background: selectedAnswers[i] === j ? '#eef2ff' : '#f8fafc',
                         border: `2px solid ${selectedAnswers[i] === j ? '#7c3aed' : '#e6eef8'}`,
                         borderRadius: 10,
                         cursor: 'pointer'
                       }}>
                  <input type="radio" checked={selectedAnswers[i] === j} readOnly style={{ marginRight: 12 }} />
                  {typeof opt === 'string' ? opt : (opt.text ?? JSON.stringify(opt))}
                </label>
              ))}
            </div>
          ))}

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <button onClick={submitQuiz} style={{
              padding: '14px 48px',
              fontSize: 18,
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer'
            }}>
              Submit Quiz
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, borderRadius: 12, marginTop: 40 }}>
          {passed ? (
            <div style={{ background: '#ecfdf5', border: '5px solid #10b981', borderRadius: 12, padding: 30 }}>
              <h2 style={{ fontSize: 34, color: '#166534' }}>Congratulations! You Passed 🎉</h2>
              <h3 style={{ fontSize: 28, marginTop: 12 }}>Score: {score}%</h3>
              <div style={{ marginTop: 30 }}>
                <button onClick={() => navigate('/dashboard')} style={{
                  padding: '12px 34px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 10, margin: '0 12px', cursor: 'pointer'
                }}>
                  Dashboard
                </button>
                <button onClick={() => navigate(`/courses/${courseId}/certificate`)} style={{
                  padding: '12px 34px', background: '#10b981', color: 'white', border: 'none', borderRadius: 10, margin: '0 12px', cursor: 'pointer'
                }}>
                  Download Certificate
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff7f7', border: '5px solid #ef4444', borderRadius: 12, padding: 30 }}>
              <h2 style={{ fontSize: 34, color: '#b91c1c' }}>You failed the quiz</h2>
              <h3 style={{ fontSize: 24, marginTop: 12 }}>Score: {score}% — Passing Score: {quiz.passingScore ?? 50}%</h3>
              <p style={{ color: '#6b7280', marginTop: 12 }}>Don't worry — you can retake the quiz. Review the course content and try again.</p>
              <div style={{ marginTop: 24 }}>
                <button onClick={resetForRetake} style={{
                  padding: '10px 28px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, margin: '0 10px', cursor: 'pointer'
                }}>
                  Retake Quiz
                </button>
                <button onClick={() => navigate(`/courses/${courseId}`)} style={{
                  padding: '10px 28px', background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb', borderRadius: 8, margin: '0 10px', cursor: 'pointer'
                }}>
                  Review Course
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
