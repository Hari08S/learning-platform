import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState('overview');
  const [heroSrc, setHeroSrc] = useState('/logo.png');
  const [loading, setLoading] = useState(true);
  const [buttonState, setButtonState] = useState('idle'); // 'idle' | 'processing' | 'purchased' | 'error'
  const [errMsg, setErrMsg] = useState('');
  const [purchased, setPurchased] = useState(false);

  // Fetch course detail
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/courses/${id}`);
        if (!res.ok) {
          const text = await res.text();
          if (!cancelled) {
            setErrMsg('Server error loading course');
            setLoading(false);
          }
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

  // load hero fallback
  useEffect(() => {
    if (!course) return;
    const candidate = course.img && typeof course.img === 'string'
      ? (course.img.startsWith('/') ? course.img : `/${course.img}`)
      : '/logo.png';
    const img = new Image();
    img.onload = () => setHeroSrc(candidate);
    img.onerror = () => setHeroSrc('/logo.png');
    img.src = candidate;
    return () => { img.onload = null; img.onerror = null; };
  }, [course]);

  // Check if purchased (server-side) when token exists, otherwise fallback to localStorage
  useEffect(() => {
    let mounted = true;

    async function checkPurchasedServer() {
      const token = localStorage.getItem('token');
      if (!token) {
        try {
          const purchasedList = JSON.parse(localStorage.getItem('purchased') || '[]');
          const idVal = course && course._id ? String(course._id) : id;
          setPurchased(purchasedList.includes(Number(id)) || purchasedList.includes(String(idVal)));
        } catch {
          setPurchased(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/me/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const purchasedList = JSON.parse(localStorage.getItem('purchased') || '[]');
          const idVal = course && course._id ? String(course._id) : id;
          setPurchased(purchasedList.includes(Number(id)) || purchasedList.includes(String(idVal)));
          return;
        }
        const js = await res.json();
        const purchasedCourses = js.purchasedCourses || [];
        const courseIdStr = course && course._id ? String(course._id) : id;

        // respect `status` so cancelled purchases are not considered purchased
        const found = purchasedCourses.some(pc => {
          const cid = pc.courseId && (pc.courseId._id || pc.courseId) ? (pc.courseId._id || pc.courseId) : pc.courseId;
          const isSame = String(cid) === String(courseIdStr);
          const isActive = (pc.status || 'active') === 'active';
          return isSame && isActive;
        });

        if (mounted) setPurchased(Boolean(found));
      } catch (err) {
        console.error('check purchased failed', err);
        try {
          const purchasedList = JSON.parse(localStorage.getItem('purchased') || '[]');
          const idVal = course && course._id ? String(course._id) : id;
          setPurchased(purchasedList.includes(Number(id)) || purchasedList.includes(String(idVal)));
        } catch {
          setPurchased(false);
        }
      }
    }

    checkPurchasedServer();

    function onUpdated() {
      checkPurchasedServer();
    }
    window.addEventListener('purchases.updated', onUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('purchases.updated', onUpdated);
    };
  }, [course, id]);

  if (loading) return <div className="container" style={{ padding: 48 }}>Loading...</div>;
  if (!course) return (
    <div className="container" style={{ padding: 48 }}>
      <p>
        Course not found. <Link to="/courses">Back to courses</Link>
      </p>
      {errMsg && <p style={{ color: 'red' }}>{errMsg}</p>}
    </div>
  );

  const handleBuy = async () => {
    setErrMsg('');
    if (buttonState === 'processing') return;
    setButtonState('processing');

    const token = localStorage.getItem('token');

    if (token) {
      try {
        const body = { courseId: course._id || course.id || id };
        const res = await fetch(`${API_BASE}/api/purchases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        const ct = res.headers.get('content-type') || '';
        if (!res.ok) {
          if (ct.includes('application/json')) {
            const j = await res.json();
            throw new Error(j.message || `Server ${res.status}`);
          } else {
            const txt = await res.text();
            throw new Error(txt ? txt.slice(0, 200) : `Server ${res.status}`);
          }
        }

        // update local fallback list as well
        try {
          const localList = JSON.parse(localStorage.getItem('purchased') || '[]');
          const idVal = course._id ? String(course._id) : id;
          if (!localList.includes(idVal) && !localList.includes(Number(id))) {
            localList.push(idVal);
            localStorage.setItem('purchased', JSON.stringify(localList));
          }
        } catch (e) { /* ignore */ }

        window.dispatchEvent(new Event('purchases.updated'));
        window.dispatchEvent(new Event('user.updated'));

        setButtonState('purchased');
        setPurchased(true);
        setTimeout(() => navigate('/dashboard'), 900);
        return;
      } catch (err) {
        console.error('Purchase failed', err);
        setErrMsg(err.message || 'Purchase failed');
        setButtonState('error');
        setTimeout(() => setButtonState('idle'), 2000);
        return;
      }
    }

    // fallback localStorage behavior
    try {
      const updated = [...new Set([...(JSON.parse(localStorage.getItem('purchased') || '[]') || []), Number(id)])];
      localStorage.setItem('purchased', JSON.stringify(updated));

      const prog = JSON.parse(localStorage.getItem('progress') || '{}');
      if (!prog[id]) {
        prog[id] = { percent: 0, hoursLearned: 0, lastSeenAt: new Date().toISOString() };
        localStorage.setItem('progress', JSON.stringify(prog));
      }

      window.dispatchEvent(new Event('purchases.updated'));
      setButtonState('purchased');
      setPurchased(true);
      setTimeout(() => navigate('/dashboard'), 800);
      return;
    } catch (err) {
      console.error('Local purchase failed', err);
      setErrMsg('Could not save purchase locally');
      setButtonState('error');
      setTimeout(() => setButtonState('idle'), 1600);
      return;
    }
  };

  const handleCancel = async () => {
    const ok = window.confirm('Are you sure you want to cancel this purchase? This will remove the course from Your Courses.');
    if (!ok) return;

    const token = localStorage.getItem('token');
    if (token) {
      setButtonState('processing');
      try {
        const courseId = course._id || id;
        const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

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

        // update local fallback too
        try {
          const localList = JSON.parse(localStorage.getItem('purchased') || '[]');
          const idVal = course._id ? String(course._id) : id;
          const filtered = (localList || []).filter(x => String(x) !== String(idVal) && String(x) !== String(Number(id)));
          localStorage.setItem('purchased', JSON.stringify(filtered));
        } catch (e) { /* ignore */ }

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
    } else {
      // fallback: cancel localStorage purchase
      try {
        const localList = JSON.parse(localStorage.getItem('purchased') || '[]');
        const filtered = (localList || []).filter(x => String(x) !== String(id) && String(x) !== String(Number(id)));
        localStorage.setItem('purchased', JSON.stringify(filtered));
        const prog = JSON.parse(localStorage.getItem('progress') || '{}');
        delete prog[id];
        localStorage.setItem('progress', JSON.stringify(prog));
        window.dispatchEvent(new Event('purchases.updated'));
        setPurchased(false);
        return;
      } catch (err) {
        console.error('Local cancel failed', err);
        setErrMsg('Cancel failed');
        return;
      }
    }
  };

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
                  {(course.curriculum || []).map((ch) => (
                    <div className="curriculum-item" key={ch.id}>
                      <div className="num">{ch.id}</div>
                      <div className="curriculum-body">
                        <div className="curriculum-title">{ch.title}</div>
                        <div className="curriculum-meta">
                          {ch.mins} min {ch.preview || purchased ? <span className="preview"> ✓ Unlocked</span> : <span className="locked"> Locked</span>}
                        </div>
                      </div>
                      <div className="curriculum-action">
                        {ch.preview || purchased ? <button className="btn outline small">View</button> : <span className="muted">Locked</span>}
                      </div>
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
            <div className="price">₹{course.price}</div>
            <div className="trial">Lifetime Access</div>

            {purchased || buttonState === 'purchased' ? (
              <>
                <button className="btn" style={{ background: "#10B981", width: "100%", marginTop: 18 }} disabled>✓ Purchased</button>
                <button className="btn outline" style={{ width: "100%", marginTop: 12 }} onClick={handleCancel}>Cancel Purchase</button>
              </>
            ) : (
              <button
                className="btn primary"
                style={{ width: "100%", marginTop: 18 }}
                onClick={handleBuy}
                disabled={buttonState === 'processing'}
              >
                {buttonState === 'processing' ? 'Processing...' : `Buy Now — ₹${course.price}`}
              </button>
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
