// src/components/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';

import LearningTimeline from './LearningTimeline';
import AchievementsRow from './AchievementsRow';
import QuickActions from './QuickActions';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Dashboard = () => {
  const nav = useNavigate();

  const [userName, setUserName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  // stats
  const [activeCourses, setActiveCourses] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [hoursLearned, setHoursLearned] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  // purchased courses list when logged in
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  // new small pieces
  const [timeline, setTimeline] = useState([]);
  const [badges, setBadges] = useState([]);
  const [lastCourseId, setLastCourseId] = useState(null);

  const loadFromServer = async (token) => {
    setLoadingUser(true);
    setLoadingPurchases(true);
    setErrMsg('');
    try {
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUserName(meData.user?.name || meData.user?.email || '');
        }
      } catch (er) {
        console.warn('Warning: /api/auth/me fetch failed', er);
      }

      const progRes = await fetch(`${API_BASE}/api/me/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!progRes.ok) {
        if (progRes.status === 401 || progRes.status === 403) {
          setErrMsg('You need to sign in to view your dashboard.');
          setPurchasedCourses([]);
          setActiveCourses(0);
          setCompletedCount(0);
          setHoursLearned(0);
          setStreakDays(0);
          return;
        }
        const contentType = progRes.headers.get('content-type') || '';
        let body = '';
        try {
          body = contentType.includes('application/json') ? (await progRes.json()).message || JSON.stringify(await progRes.json()) : await progRes.text();
        } catch (e) {
          body = `Server responded ${progRes.status}`;
        }
        throw new Error(body || `Server responded ${progRes.status}`);
      }

      const js = await progRes.json();

      // Filter active purchases
      const purchased = Array.isArray(js.purchasedCourses)
        ? js.purchasedCourses
            .filter(pc => (pc.status || 'active') === 'active')
            .map(pc => {
              const courseObj = pc.courseId && pc.courseId.title ? pc.courseId : (pc.courseId || {});
              const id = (pc.courseId && (pc.courseId._id || pc.courseId)) || courseObj._id || courseObj.id;
              return {
                courseId: id,
                title: courseObj.title || pc.title || 'Untitled',
                author: courseObj.author || 'Author',
                img: courseObj.img || '/logo.png',
                price: pc.price != null ? pc.price : (courseObj.price || ''),
                progress: (js.progress || []).find(p => String(p.courseId) === String(courseObj._id) || String(p.courseId) === String(courseObj.id)) || { percent: 0, hoursLearned: 0 }
              };
            })
        : [];

      setPurchasedCourses(purchased);
      setActiveCourses(purchased.length);
      setCompletedCount(js.completedCount || 0);
      setHoursLearned(js.hoursLearned || 0);
      setStreakDays(js.streakDays || 0);
      setErrMsg('');

      // fetch timeline + badges using backend endpoints if available
      try {
        const [actRes, badgesRes] = await Promise.all([
          fetch(`${API_BASE}/api/me/activity`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/me/badges`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (actRes.ok) {
          const actJs = await actRes.json();
          setTimeline(Array.isArray(actJs.events) ? actJs.events : []);
          if (actJs.events?.length) setLastCourseId(actJs.events[0].courseId || purchased[0]?.courseId);
        } else {
          setTimeline([]);
        }

        if (badgesRes.ok) {
          const badJs = await badgesRes.json();
          setBadges(Array.isArray(badJs.badges) ? badJs.badges : []);
        } else {
          setBadges([]);
        }
      } catch (e) {
        // fallback: derive minimal timeline client-side
        const derived = [];
        (purchased || []).forEach(pc => {
          derived.push({
            id: `p-${pc.courseId}`,
            type: 'purchase',
            title: `Purchased: ${pc.title}`,
            courseId: pc.courseId,
            time: pc.purchasedAt || new Date().toISOString(),
            meta: { courseTitle: pc.title, price: pc.price }
          });
        });
        (js.progress || []).forEach(p => {
          derived.push({
            id: `prog-${p.courseId}`,
            type: 'lesson_completed',
            title: `Progress: ${p.percent}% — ${p.courseId}`,
            courseId: p.courseId,
            time: p.lastSeenAt || new Date().toISOString(),
            meta: { percent: p.percent }
          });
        });
        derived.sort((a,b) => new Date(b.time) - new Date(a.time));
        setTimeline(derived.slice(0, 20));
      }
    } catch (err) {
      console.error('Dashboard load error', err);
      setErrMsg(typeof err === 'string' ? err : (err.message || 'Could not load dashboard data from server'));
      setPurchasedCourses([]);
      setActiveCourses(0);
      setCompletedCount(0);
      setHoursLearned(0);
      setStreakDays(0);
      setTimeline([]);
      setBadges([]);
    } finally {
      setLoadingUser(false);
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadFromServer(token);
    } else {
      setLoadingUser(false);
      setLoadingPurchases(false);
      setErrMsg('You need to sign in to view your dashboard.');
    }

    function onPurchasesUpdated() {
      const t = localStorage.getItem('token');
      if (t) loadFromServer(t);
    }

    window.addEventListener('purchases.updated', onPurchasesUpdated);
    window.addEventListener('user.updated', onPurchasesUpdated);

    return () => {
      window.removeEventListener('purchases.updated', onPurchasesUpdated);
      window.removeEventListener('user.updated', onPurchasesUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (courseId) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be signed in to cancel purchases.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        let msg = `Server responded ${res.status}`;
        if (ct.includes('application/json')) {
          const j = await res.json();
          msg = j.message || msg;
        } else {
          const t = await res.text();
          msg = t || msg;
        }
        throw new Error(msg);
      }

      setPurchasedCourses(prev => prev.filter(pc => String(pc.courseId) !== String(courseId)));
      window.dispatchEvent(new Event('purchases.updated'));
    } catch (err) {
      console.error('Cancel failed', err);
      alert('Could not cancel purchase: ' + (err.message || 'Server error'));
    }
  };

  const CourseCard = ({ c }) => {
    const percent = (c.progress && typeof c.progress.percent === 'number') ? c.progress.percent : 0;
    const thumb = c.img && typeof c.img === 'string' ? c.img : '/logo.png';

    return (
      <article className="course-card small-card" style={{ width: 320, marginBottom: 18 }}>
        <div className="card-media" style={{
          height: 150,
          borderRadius: 8,
          overflow: 'hidden',
          display: 'block',
          backgroundColor: '#f3f4f6'
        }}>
          <img src={thumb} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div className="card-body" style={{ paddingTop: 12 }}>
          <h3 className="card-title" style={{ marginBottom: 6 }}>{c.title}</h3>
          <p className="card-author" style={{ margin: 0, color: '#6b7280' }}>{c.author}</p>

          <div style={{ marginTop: 12 }}>
            <div style={{ height: 8, background: '#eef2f7', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, percent)}%`, height: '100%', background: '#7c3aed' }} />
            </div>
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>{percent}% completed</div>
          </div>

          <div className="card-actions" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => nav(`/courses/${c.courseId}`)} style={{ flex: 1 }}>
              Continue Learning
            </button>
            <button className="btn outline" onClick={() => handleCancel(c.courseId)}>
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  };

  const displayName = (() => {
    if (loadingUser) return '...';
    if (!userName) return 'Learner';
    return userName;
  })();

  const resumeLast = (courseId) => {
    if (!courseId) return;
    nav(`/courses/${courseId}`);
  };

  const downloadLastCert = (courseId) => {
    if (!courseId) return alert('No certificate found');
    nav(`/courses/${courseId}`); // placeholder - adapt to your cert flow
  };

  const setWeeklyGoal = () => {
    const g = prompt('Set a weekly minutes goal (e.g. 120)', '120');
    if (g) alert(`Weekly goal set to ${g} minutes — nice!`);
  };

  return (
    <div className="dash-container container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h1 className="dash-title">Welcome back, {displayName}! <span style={{ marginLeft: 8 }}>👋</span></h1>
      <p className="dash-sub">Continue your learning journey</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 16,
        marginTop: 18
      }}>
        <div style={{ background: '#FFEDEE', borderRadius: 12, padding: '18px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.04)' }}>
          <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>Active Courses</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6B6B' }}>{activeCourses}</div>
        </div>

        <div style={{ background: '#E8FFFC', borderRadius: 12, padding: '18px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.04)' }}>
          <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>Completed</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#4ECDC4' }}>{completedCount}</div>
        </div>

        <div style={{ background: '#E8F9FB', borderRadius: 12, padding: '18px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.04)' }}>
          <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>Hours Learned</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#45B7D1' }}>{hoursLearned}</div>
        </div>

        <div style={{ background: '#FFF8DF', borderRadius: 12, padding: '18px 20px', boxShadow: '0 8px 20px rgba(2,6,23,0.04)' }}>
          <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>Learning Streak</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#F9CA24' }}>{streakDays} days</div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Your Courses</h2>

        {loadingPurchases ? (
          <div style={{ padding: 18 }}>Loading your courses...</div>
        ) : errMsg ? (
          <div style={{ padding: 18, color: '#6b7280' }}>
            {errMsg}
            {errMsg.includes('sign in') && (
              <div style={{ marginTop: 10 }}>
                <Link to="/login" className="btn">Sign in</Link>
              </div>
            )}
          </div>
        ) : purchasedCourses.length === 0 ? (
          <div style={{ padding: 18, color: '#6b7280' }}>
            You have no purchased courses yet. Browse <Link to="/courses">courses</Link> to get started.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
            marginTop: 12
          }}>
            {purchasedCourses.map((c) => (
              <CourseCard key={String(c.courseId)} c={c} />
            ))}
          </div>
        )}
      </div>

      {/* New area: Quick actions, Achievements, Timeline */}
      <div style={{ marginTop: 32 }}>
        <QuickActions
          lastCourseId={lastCourseId}
          onResume={resumeLast}
          onDownloadCertificate={downloadLastCert}
          onSetGoal={setWeeklyGoal}
        />
        <AchievementsRow badges={badges} />
        <LearningTimeline events={timeline} />
      </div>
    </div>
  );
};

export default Dashboard;
