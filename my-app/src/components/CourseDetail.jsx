import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';
import useActivity from '../hooks/useActivity';
import useNotes from '../hooks/useNotes';
import NotePanel from './NotePanel';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState('overview');
  const [heroSrc, setHeroSrc] = useState('/logo.png');
  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState('idle');
  const [errMsg, setErrMsg] = useState('');
  const [purchased, setPurchased] = useState(false);
  const [userProgressForCourse, setUserProgressForCourse] = useState(null);

  // NEW: quiz state (optional server-provided)
  const [quiz, setQuiz] = useState(null);
  const [quizAvailableOnServer, setQuizAvailableOnServer] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [myReviewRating, setMyReviewRating] = useState(5);
  const [myReviewComment, setMyReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const { logActivity } = useActivity();
  const { getNotes } = useNotes();
  const [courseNotes, setCourseNotes] = useState([]);
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userObj.id || userObj._id;

  // helper resolve id
  const courseIdResolved = () => course && (course._id || course.id) ? String(course._id || course.id) : String(id);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/courses/${id}`);
        if (!res.ok) {
          setErrMsg('Server error loading course');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!cancelled) setCourse(data.course);
      } catch (err) {
        console.error('Course detail fetch failed', err);
        if (!cancelled) setErrMsg('Server error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem('currentCourseId', String(id || (course && (course._id || course.id))));
    } catch (e) { /* ignore storage errors */ }
    return () => {
      try {
        const cur = localStorage.getItem('currentCourseId');
        if (cur && String(cur) === String(id || (course && (course._id || course.id)))) {
          localStorage.removeItem('currentCourseId');
        }
      } catch (e) { }
    };
  }, [id, course]);

  useEffect(() => {
    if (!course) return;
    const candidate = course.img && typeof course.img === 'string'
      ? (course.img.startsWith('http') || course.img.startsWith('/') ? course.img : `/${course.img}`)
      : '/logo.png';
    const img = new Image();
    img.onload = () => setHeroSrc(candidate);
    img.onerror = () => setHeroSrc('/logo.png');
    img.src = candidate;
    return () => { img.onload = null; img.onerror = null; };
  }, [course]);

  useEffect(() => {
    let mounted = true;
    async function loadProgressAndPurchase() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) { setPurchased(false); setUserProgressForCourse(null); }
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/me/progress`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          if (mounted) { setPurchased(false); setUserProgressForCourse(null); }
          return;
        }
        const js = await res.json();
        const purchasedCourses = js.purchasedCourses || [];
        const found = purchasedCourses.some(pc => {
          const cid = pc.courseId && (pc.courseId._id || pc.courseId) ? String(pc.courseId._id || pc.courseId) : String(pc.courseId);
          return cid === String(id) && (pc.status || 'active') === 'active';
        });
        if (mounted) setPurchased(Boolean(found));
        const prog = (js.progress || []).find(p => String(p.courseId) === String(id) || String(p.courseId) === String((course && (course._id || course.id)) || id));
        if (mounted) setUserProgressForCourse(prog || null);
      } catch (err) {
        console.error('load progress failed', err);
        if (mounted) { setPurchased(false); setUserProgressForCourse(null); }
      }
    }

    loadProgressAndPurchase();
    function onUpdated() { loadProgressAndPurchase(); }
    window.addEventListener('purchases.updated', onUpdated);
    window.addEventListener('user.updated', onUpdated);
    return () => {
      window.removeEventListener('purchases.updated', onUpdated);
      window.removeEventListener('user.updated', onUpdated);
      mounted = false;
    };
  }, [id, course]);

  // NEW: fetch quiz metadata for this course (if any) — but we will show final quiz regardless
  useEffect(() => {
    if (!id && !course) return;
    let mounted = true;
    async function fetchQuiz() {
      try {
        const resolvedId = courseIdResolved();
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // try multiple common endpoints (first match wins)
        const endpoints = [
          `${API_BASE}/api/courses/${resolvedId}/quiz`,      // matches server/routes/quiz.js GET('/courses/:courseId/quiz')
          `${API_BASE}/api/quizzes/course/${resolvedId}`,    // old client path - keep as fallback
          `${API_BASE}/api/quizzes/courses/${resolvedId}/quiz`,
          `${API_BASE}/api/quizzes/${resolvedId}/quiz`
        ];

        let got = false;
        for (const url of endpoints) {
          try {
            const r = await fetch(url, { headers });
            if (r.status === 404) continue; // not found — try next
            if (r.status === 401 || r.status === 403) {
              // quiz exists but protected — mark available (details hidden)
              if (mounted) { setQuiz(null); setQuizAvailableOnServer(true); }
              got = true;
              break;
            }
            if (!r.ok) continue;
            const j = await r.json();
            const quizObj = j.quiz || j;
            if (mounted) {
              setQuiz(quizObj);
              setQuizAvailableOnServer(true);
            }
            got = true;
            break;
          } catch (err) {
            console.warn('quiz fetch try failed', url, err);
            continue;
          }
        }

        if (!got && mounted) {
          setQuiz(null);
          setQuizAvailableOnServer(false);
        }
      } catch (err) {
        console.error('fetch quiz failed', err);
        if (mounted) { setQuiz(null); setQuizAvailableOnServer(false); }
      }
    }
    fetchQuiz();
    return () => { mounted = false; };
  }, [id, course]);

  // Fetch Reviews
  useEffect(() => {
    let mounted = true;
    async function fetchReviews() {
      try {
        const res = await fetch(`${API_BASE}/api/courses/${courseIdResolved()}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setReviews(data.reviews || []);
            setAvgRating(data.avgRating || 0);
          }
        }
      } catch (err) { }
    }
    if (courseIdResolved() && courseIdResolved() !== 'undefined') fetchReviews();
    return () => { mounted = false; };
  }, [id, course]);

  // NEW: fetch notes
  useEffect(() => {
    let mounted = true;
    if (userId) {
      getNotes(userId).then(list => {
        if (mounted) setCourseNotes(list || []);
      });
    }
    return () => { mounted = false; };
  }, [userId, getNotes, activeNoteIndex]); // re-fetch when panel closes

  if (loading) return <div className="container" style={{ padding: 48 }}>Loading...</div>;
  if (!course) return (
    <div className="container" style={{ padding: 48 }}>
      <p>Course not found. <Link to="/courses">Back to courses</Link></p>
      {errMsg && <p style={{ color: 'red' }}>{errMsg}</p>}
    </div>
  );

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [paymentCountdown, setPaymentCountdown] = useState(null);

  const handleBuy = async () => {
    setErrMsg('');
    if (buttonState === 'processing') return;
    setButtonState('processing');

    const token = localStorage.getItem('token');
    if (!token) {
      setErrMsg('Please sign in to purchase');
      setButtonState('idle');
      return;
    }

    try {
      // Create order on backend (to register the purchase intent)
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: courseIdResolved() })
      });
      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message || 'Failed to create order');

      // ── DEMO MODE: Auto-complete payment after 5 second countdown ──
      setPaymentCountdown(5);
      let count = 5;
      const timer = setInterval(() => {
        count -= 1;
        setPaymentCountdown(count);
        if (count <= 0) {
          clearInterval(timer);
          setPaymentCountdown(null);
          simulatePaymentSuccess(token, orderData);
        }
      }, 1000);

    } catch (err) {
      console.error('Purchase initiation failed', err);
      setErrMsg(err.message || 'Purchase failed');
      setButtonState('idle');
    }
  };

  const simulatePaymentSuccess = async (token, orderData) => {
    try {
      // Directly record the purchase without real Razorpay verification
      const purchaseRes = await fetch(`${API_BASE}/api/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId: courseIdResolved() })
      });

      if (!purchaseRes.ok) {
        // If already purchased, still treat as success
        const d = await purchaseRes.json();
        if (!d.message?.toLowerCase().includes('already')) {
          throw new Error(d.message || 'Purchase recording failed');
        }
      }

      import('react-hot-toast').then(mod => mod.toast.success('🎉 Payment Successful! Course unlocked.'));
      completePurchaseUI();
    } catch (err) {
      setErrMsg(err.message || 'Payment simulation failed');
      setButtonState('idle');
    }
  };

  const completePurchaseUI = () => {
    setButtonState('purchased');
    setPurchased(true);
    window.dispatchEvent(new Event('purchases.updated'));
    window.dispatchEvent(new Event('user.updated'));
    setTimeout(() => navigate('/dashboard'), 900);
  };

  const handleCancel = async () => {
    const ok = window.confirm('Are you sure you want to cancel this purchase? This will remove the course from Your Courses.');
    if (!ok) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be signed in to cancel purchases.');
      return;
    }

    setButtonState('processing');
    try {
      const courseId = course._id || id;
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const j = await res.json();
          throw new Error(j.message || `Server ${res.status}`);
        } else {
          const t = await res.text();
          throw new Error(t || `Server ${res.status}`);
        }
      }

      window.dispatchEvent(new Event('purchases.updated'));
      window.dispatchEvent(new Event('user.updated'));
      setPurchased(false);
      setButtonState('idle');
      return;
    } catch (err) {
      console.error('Cancel failed', err);
      setErrMsg(err.message || 'Cancel failed');
      setButtonState('error');
      setTimeout(() => setButtonState('idle'), 1600);
      return;
    }
  };

  const isLessonDone = (lesson, index) => {
    if (!lesson) return false;
    if (!purchased && index >= 2) return false;
    if (!userProgressForCourse || !userProgressForCourse.completedLessons) return false;
    const doneSet = new Set((userProgressForCourse.completedLessons || []).map(x => String(x)));
    const lid = String(lesson.id ?? lesson._id);
    return doneSet.has(lid);
  };

  // helper to navigate to quiz
  const openQuiz = () => {
    if (!purchased) return alert('Please purchase the course to view the quiz.');
    navigate(`/courses/${course._id || id}/quiz`);
  };

  // compute quiz module number
  const quizIndex = (course.curriculum || []).length + 1;

  return (
    <div className="container course-detail-page" style={{ padding: "28px 24px 80px" }}>
      <button className="btn outline" onClick={() => navigate('/courses')} style={{ marginBottom: 18 }}>
        ← Back to Courses
      </button>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-hero">
            <img src={heroSrc} alt={course.title} className="detail-hero-img" />
            <div className="hero-overlay">
              <div className="hero-tag">{course.tag}</div>
              <h1 className="detail-title">{course.title}</h1>
              <div className="detail-author">by {course.author}</div>
            </div>
          </div>

          <div className="detail-stats">
            <div className="stat">★ {course.rating} ({(course.students || 0).toLocaleString()} students)</div>
            <div className="stat">⏱ {course.hours}</div>
            <div className="stat">{(course.curriculum || []).length} lessons</div>
            <div className="stat level">{course.level}</div>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
            <button className={`tab ${tab === "curriculum" ? "active" : ""}`} onClick={() => setTab("curriculum")}>Curriculum</button>
            <button className={`tab ${tab === "instructor" ? "active" : ""}`} onClick={() => setTab("instructor")}>Instructor</button>
          </div>

          <div className="tab-panel">
            {tab === "overview" && (
              <>
                <h2>Course Description</h2>
                <p className="lead">{course.description}</p>

                <h3>What you'll learn</h3>
                <ul className="learn-list">
                  {(course.includes || []).map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </>
            )}

            {tab === "curriculum" && (
              <>
                <h2>Course Curriculum</h2>
                <div className="curriculum">
                  {(Array.isArray(course.curriculum) ? course.curriculum : []).map((ch, index) => {
                    if (!ch) return null;
                    const key = ch.id ?? ch._id;
                    const hasNote = Array.isArray(courseNotes) && courseNotes.some(n => String(n.courseId) === courseIdResolved() && n.lessonIndex === index && n.content.trim().length > 0);
                    return (
                      <div key={String(key)} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="curriculum-item">
                          <div className="num">
                            {index + 1}
                            {hasNote && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#F59E0B', borderRadius: '50%' }} title="Has note" />}
                          </div>
                          <div className="curriculum-body">
                            <div className="curriculum-title">{ch.title}</div>
                            <div className="curriculum-meta">
                              {ch.mins} min
                              {isLessonDone(ch, index) ? (
                                <span className="preview" style={{ background: '#10B981', marginLeft: 8 }}>✓ Done</span>
                              ) : (ch.preview || purchased || index < 2 ? (
                                <span className="preview" style={{ marginLeft: 8 }}>{purchased ? '🔓 Unlocked' : '🔓 Free Preview'}</span>
                              ) : (
                                <span className="locked" style={{ marginLeft: 8 }}>🔒 Locked</span>
                              ))}
                            </div>
                          </div>
                          <div className="curriculum-action" style={{ display: 'flex', gap: 8 }}>
                            {purchased && (
                              <button
                                className="btn outline small"
                                style={{ color: '#475569', borderColor: '#E2E8F0', padding: '6px 10px' }}
                                onClick={() => setActiveNoteIndex(activeNoteIndex === index ? null : index)}
                              >
                                📝 Add Note
                              </button>
                            )}
                            <button
                              className="btn outline small"
                              style={isLessonDone(ch, index) ? { background: '#10B981', color: '#fff', borderColor: '#10B981' } : {}}
                              onClick={() => {
                                const isUnlocked = purchased || ch.preview || index < 2;
                                if (!isUnlocked) return alert('Please purchase the course to view this lesson.');
                                logActivity(userId, parseInt(ch.mins) || 10);
                                navigate(`/courses/${course._id || course.id || id}/module/${ch.id ?? ch._id}`);
                              }}
                            >
                              {isLessonDone(ch, index) ? '✓ View' : 'View'}
                            </button>
                          </div>
                        </div>

                        <NotePanel
                          open={activeNoteIndex === index}
                          userId={userId}
                          courseId={courseIdResolved()}
                          lessonIndex={index}
                          courseData={course}
                          lessonData={ch}
                          onClose={() => setActiveNoteIndex(null)}
                        />
                      </div>
                    );
                  })}

                  {/* FINAL QUIZ: always shown as last module */}
                  <div className="curriculum-item quiz-item" key={`quiz-${quizIndex}`}>
                    <div className="num">{quizIndex}</div>
                    <div className="curriculum-body">
                      <div className="curriculum-title">Final Quiz</div>
                      <div className="curriculum-meta">
                        {quizAvailableOnServer && quiz && quiz.estimatedMins ? `${quiz.estimatedMins} min` : '10 min'}
                        {userProgressForCourse && userProgressForCourse.quizPassed ? (
                          <span className="preview" style={{ background: '#10B981', marginLeft: 8 }}>✓ Done</span>
                        ) : (purchased ? (
                          <span className="preview" style={{ marginLeft: 8 }}>🔓 Unlocked</span>
                        ) : (
                          <span className="locked" style={{ marginLeft: 8 }}>🔒 Locked</span>
                        ))}
                      </div>
                    </div>
                    <div className="curriculum-action">
                      <button
                        className="btn outline small"
                        style={userProgressForCourse && userProgressForCourse.quizPassed ? { background: '#10B981', color: '#fff', borderColor: '#10B981' } : {}}
                        onClick={() => {
                          if (!purchased) return alert('Please purchase the course to view the quiz.');
                          openQuiz();
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>

                {/* STUDENT REVIEWS SECTION */}
                <h2 style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '24px' }}>Student Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--upwise-dark)' }}>{avgRating}</div>
                  <div>
                    <div style={{ color: '#F59E0B', fontSize: '20px' }}>{'★'.repeat(Math.round(avgRating))}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Course Rating • {reviews.length} reviews</div>
                  </div>
                </div>

                {userProgressForCourse && userProgressForCourse.percent >= 100 && (
                  <div style={{ background: 'var(--bg-light)', padding: '20px', borderRadius: '12px', border: '1px solid var(--accent)', marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 12px', color: 'var(--upwise-dark)' }}>Write a Review</h4>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setMyReviewRating(star)}
                          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: star <= myReviewRating ? '#F59E0B' : '#cbd5e1' }}
                        >★</button>
                      ))}
                    </div>
                    <textarea
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', minHeight: '80px', fontFamily: 'inherit' }}
                      placeholder="What did you think of the course?"
                      value={myReviewComment}
                      onChange={e => setMyReviewComment(e.target.value)}
                    />
                    <button
                      className="btn primary small"
                      disabled={reviewLoading}
                      onClick={async () => {
                        setReviewLoading(true);
                        const token = localStorage.getItem('token');
                        try {
                          const r = await fetch(`${API_BASE}/api/courses/${courseIdResolved()}/reviews`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ rating: myReviewRating, comment: myReviewComment })
                          });
                          if (r.ok) {
                            import('react-hot-toast').then(mod => mod.toast.success('Review posted!'));
                            const p = await fetch(`${API_BASE}/api/courses/${courseIdResolved()}/reviews`);
                            if (p.ok) {
                              const pd = await p.json();
                              setReviews(pd.reviews);
                              setAvgRating(pd.avgRating);
                            }
                          }
                        } finally { setReviewLoading(false); }
                      }}
                    >Submit Review</button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.length === 0 ? <p style={{ color: 'var(--muted)' }}>No reviews yet.</p> : reviews.map(r => (
                    <div key={r._id} style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--upwise-mid)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {r.userAvatar || r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--upwise-dark)' }}>{r.userName}</div>
                          <div style={{ color: '#F59E0B', fontSize: '14px' }}>{'★'.repeat(r.rating)}</div>
                        </div>
                      </div>
                      <p style={{ margin: 0, color: 'var(--muted)', lineHeight: '1.5' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "instructor" && (
              <>
                <h2>Instructor</h2>
                <div className="instructor-card">
                  <div className="avatar">{(course.instructor?.name || 'I')[0]}</div>
                  <div>
                    <div className="instr-name">{course.instructor?.name}</div>
                    <div className="instr-bio">{course.instructor?.bio}</div>
                    <div className="instr-stats">★ {course.instructor?.rating} rating · {course.instructor?.students?.toLocaleString()} students · {course.instructor?.courses} courses</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="price-card">
            <div className="price">₹149</div>
            <div className="trial">Lifetime Access</div>

            {purchased || buttonState === 'purchased' ? (
              <>
                <button
                  className="btn primary"
                  style={{ background: "#7C3AED", width: "100%", marginTop: 18 }}
                  onClick={() => navigate('/dashboard')}
                >
                  {(!userProgressForCourse || !userProgressForCourse.percent) ? 'Start Learning →' :
                    (userProgressForCourse.percent >= 100) ? 'Review Course ✓' : 'Continue →'}
                </button>
                <button className="btn outline" style={{ width: "100%", marginTop: 12 }} onClick={handleCancel}>Cancel Purchase</button>
              </>
            ) : (
              <>
                <button
                  className="btn primary"
                  style={{ width: "100%", marginTop: 18, position: 'relative', overflow: 'hidden' }}
                  onClick={handleBuy}
                  disabled={buttonState === 'processing'}
                >
                  {buttonState === 'processing' && paymentCountdown !== null
                    ? `⏳ Auto-completing in ${paymentCountdown}s...`
                    : buttonState === 'processing'
                    ? 'Processing...'
                    : `Buy Now — ₹149`}
                </button>
                {paymentCountdown !== null && (
                  <div style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #065F46, #059669)',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 13,
                    textAlign: 'center',
                    fontWeight: 600,
                    animation: 'pulse 1s infinite',
                  }}>
                    🔒 Simulating secure payment...<br />
                    <span style={{ fontSize: 22, fontWeight: 800 }}>{paymentCountdown}</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}> seconds</span>
                  </div>
                )}
              </>
            )}

            <hr style={{ margin: "20px 0" }} />
            <h4>This course includes:</h4>
            <ul className="includes-list">
              {(course.includes || []).map((inc, i) => <li key={i}>{inc}</li>)}
            </ul>

            {errMsg && <div style={{ marginTop: 12, color: 'red', fontWeight: 700 }}>{errMsg}</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
