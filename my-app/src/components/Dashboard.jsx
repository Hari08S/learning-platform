// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import { Link, useNavigate } from 'react-router-dom';
import SEO from './SEO.jsx';
import '../styles/courses.css';

import LearningTimeline from './LearningTimeline';
import AchievementsRow from './AchievementsRow';
import QuickActions from './QuickActions';
import PurchaseHistoryModal from './PurchaseHistoryModal';
import LearningHeatmap from './LearningHeatmap.jsx';
import MyNotes from './MyNotes.jsx';
import XPBar from './XPBar.jsx';
import DailyChallenge from './DailyChallenge.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/**
 * Normalizes courseId-like values to a string or '' when invalid.
 */
const normId = v => {
  if (!v && v !== 0) return '';
  try {
    if (typeof v === 'object') {
      const candidate = v._id ?? v.id ?? v.courseId ?? v;
      if (!candidate) return '';
      return String(candidate);
    }
    return String(v);
  } catch (e) {
    return '';
  }
};

/**
 * computeFromProgress (fallback)
 * Basic sanitization — but the dashboard uses a stricter rule (only visible purchases
 * with percent >=100 and quizPassed === true are counted as Completed).
 */
function computeFromProgress(progressList = []) {
  const list = Array.isArray(progressList) ? progressList : [];
  const completedCourseIds = new Set();
  let hours = 0;

  list.forEach(p => {
    if (!p || !p.courseId) return;
    const cid = normId(p.courseId);
    if (!cid) return;

    const pct = Number(p.percent || 0);
    if (pct >= 100) completedCourseIds.add(cid);

    let h = Number(p.hoursLearned || 0);
    if (!isFinite(h) || h < 0) h = 0;
    // ❌ removed: if (h > 50) h = 0;
    hours += h;
  });

  return { completedCount: completedCourseIds.size, hoursLearned: hours };
}

const Dashboard = () => {
  const nav = useNavigate();
  const userObj = JSON.parse(localStorage.getItem('user') || '{}');
  const [userName, setUserName] = useState(userObj.name || userObj.email || '');
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeCourses, setActiveCourses] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [hoursLearned, setHoursLearned] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [badges, setBadges] = useState([]);
  const [lastCourseId, setLastCourseId] = useState(null);
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(0);

  // New Internship State
  const [internships, setInternships] = useState([]);
  const [loadingInternships, setLoadingInternships] = useState(true);

  /**
   * fmtHours: minutes for <1h, 1-decimal hours for >=1h
   */
  const fmtHours = (val) => {
    let hours = Number(val || 0);
    if (!isFinite(hours) || hours <= 0) return '0 h';

    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return `${mins} min`;
    }

    const dec = Number(hours.toFixed(1));
    if (dec > 1000) return '999+ h';
    return `${dec.toFixed(1)} h`;
  };

  const handleSetWeeklyGoal = async () => {
    try {
      const input = prompt('Set weekly goal in minutes (e.g. 150). Leave empty to cancel.');
      if (!input) return;
      const mins = Math.max(0, Math.floor(Number(input)));
      if (!isFinite(mins) || mins <= 0) return alert('Please enter a valid number of minutes.');

      const token = localStorage.getItem('token');
      if (!token) return alert('Not logged in');

      const r = await fetch(`${API_BASE}/api/me/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weeklyGoalMinutes: mins })
      });
      if (r.ok) {
        setWeeklyGoalMinutes(mins);
        alert('Weekly goal saved.');
        window.dispatchEvent(new Event('user.updated'));
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Set weekly goal failed', err);
      alert('Could not save weekly goal.');
    }
  };

  const refreshAndLoad = async (token) => {
    setLoadingUser(true);
    setLoadingPurchases(true);
    setErrMsg('');
    try {
      // best-effort user name & goal
      try {
        const [meRes, goalRes, internshipRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/me/goal`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/user/internships/my`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (meRes.ok) {
          const meJson = await meRes.json();
          setUserName(meJson.user?.name || meJson.user?.email || '');
        }
        if (goalRes.ok) {
          const goalJson = await goalRes.json();
          setWeeklyGoalMinutes(goalJson.weeklyGoalMinutes || 0);
        }
        if (internshipRes.ok) {
          const intJson = await internshipRes.json();
          setInternships(intJson.applications || []);
        }
      } catch (e) { /* ignore */ }
      setLoadingInternships(false);

      const progRes = await fetch(`${API_BASE}/api/me/progress`, { headers: { Authorization: `Bearer ${token}` } });
      if (!progRes.ok) {
        if (progRes.status === 401 || progRes.status === 403) {
          setErrMsg('You need to sign in to view your dashboard.');
          setLoadingUser(false);
          setLoadingPurchases(false);
          return;
        }
        throw new Error(`Server responded ${progRes.status}`);
      }
      const js = await progRes.json();

      const serverPurchases = Array.isArray(js.purchasedCourses) ? js.purchasedCourses : [];
      const progressList = Array.isArray(js.progress) ? js.progress : [];

      if (js.currentCourseId && !localStorage.getItem('currentCourseId')) {
        localStorage.setItem('currentCourseId', String(js.currentCourseId));
      }

      // fallback summary
      const summary = computeFromProgress(progressList);
      setStreakDays(Number(js.streakDays || 0));

      // build progress map (dedupe)
      const progressMap = {};
      progressList.forEach(p => {
        const pid = normId(p.courseId);
        if (!pid) return;
        const existing = progressMap[pid];
        if (!existing) {
          progressMap[pid] = { ...p, courseId: pid };
        } else {
          existing.percent = Math.max(Number(existing.percent || 0), Number(p.percent || 0));
          existing.hoursLearned = Math.max(Number(existing.hoursLearned || 0), Number(p.hoursLearned || 0) || 0);
          existing.quizPassed = existing.quizPassed || !!p.quizPassed;
          existing.completedAt = existing.completedAt || p.completedAt;
          progressMap[pid] = existing;
        }
      });

      // prepare purchases and fetch missing metadata
      const activePurchases = serverPurchases
        .filter(pc => (pc.status || 'active') === 'active' && Boolean(pc.courseId))
        .map(pc => ({ pc, cid: normId(pc.courseId) }));

      const items = [];
      const fetchTasks = [];

      activePurchases.forEach(({ pc, cid }) => {
        if (!cid) return;
        if (pc && typeof pc === 'object' && (pc.title || (pc.courseId && typeof pc.courseId === 'object' && pc.courseId.title))) {
          const courseObj = (typeof pc.courseId === 'object' && pc.courseId.title) ? pc.courseId : {};
          items.push({
            courseId: cid,
            title: pc.title || courseObj.title || 'Untitled',
            author: pc.author || courseObj.author || 'Author',
            img: pc.img || courseObj.img || '/logo.png',
            price: pc.price != null ? pc.price : '',
            progress: progressMap[cid] || { percent: 0, hoursLearned: 0, quizPassed: false },
            raw: pc
          });
        } else {
          fetchTasks.push({ cid, pc });
        }
      });

      if (fetchTasks.length) {
        const fetches = fetchTasks.map(async ({ cid, pc }) => {
          try {
            const r = await fetch(`${API_BASE}/api/courses/${cid}`);
            if (!r.ok) return null;
            const js2 = await r.json();
            const c = js2.course;
            if (!c || !c.title) return null;
            return {
              courseId: cid,
              title: c.title || pc.title || 'Untitled',
              author: c.author || pc.author || 'Author',
              img: c.img || pc.img || '/logo.png',
              price: pc.price != null ? pc.price : (c.price || ''),
              progress: progressMap[cid] || { percent: 0, hoursLearned: 0, quizPassed: false },
              raw: pc
            };
          } catch (e) { return null; }
        });
        const results = await Promise.all(fetches);
        results.forEach(r => { if (r) items.push(r); });
      }

      const visibleItems = items.filter(i => i && i.courseId);
      setPurchasedCourses(visibleItems);
      setActiveCourses(visibleItems.length);

      // compute completedCount/hours only for visible purchases
      const visibleSet = new Set(visibleItems.map(i => String(i.courseId)));
      const completedSet = new Set();
      let visibleHours = 0;

      Object.keys(progressMap).forEach(pid => {
        if (!visibleSet.has(pid)) return;
        const p = progressMap[pid];
        const pct = Number(p.percent || 0);
        const quizPassed = !!p.quizPassed;
        // strict rule: both percent >=100 and quizPassed true
        if (pct >= 100 && quizPassed) completedSet.add(pid);

        let h = Number(p.hoursLearned || 0);
        if (!isFinite(h) || h < 0) h = 0;
        // ❌ removed: if (h > 50) h = 0;
        visibleHours += h;
      });

      if (visibleItems.length === 0) {
        setCompletedCount(summary.completedCount);
        setHoursLearned(summary.hoursLearned);
      } else {
        setCompletedCount(completedSet.size);
        setHoursLearned(visibleHours);
      }

      // determine sensible lastCourseId:
      let lastId = null;
      try {
        const stored = localStorage.getItem('currentCourseId');
        if (stored) lastId = String(stored);
      } catch (e) { /* ignore */ }

      if (!lastId) {
        // choose the most recent lastSeenAt among visible progress entries
        let best = null;
        progressList.forEach(p => {
          if (!p || !p.courseId) return;
          const pid = normId(p.courseId);
          if (!visibleSet.has(pid)) return;
          const ts = p.lastSeenAt ? new Date(p.lastSeenAt).getTime() : 0;
          if (!best || ts > best.ts) best = { pid, ts };
        });
        if (best) lastId = best.pid;
      }
      setLastCourseId(lastId || null);

      // load timeline/badges (best-effort)
      try {
        const [actRes, badgesRes] = await Promise.all([
          fetch(`${API_BASE}/api/me/activity`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/me/badges`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (actRes.ok) {
          const ajs = await actRes.json();
          setTimeline(Array.isArray(ajs.events) ? ajs.events.slice(0, 5) : []);
        } else {
          // fallback: build a small timeline from recent progress
          const fallbackEvents = [];
          // streak event
          if (Number(js.streakDays || 0) > 0) {
            fallbackEvents.push({
              id: `streak-${Date.now()}`,
              type: 'streak',
              title: `Learning streak: ${Number(js.streakDays || 0)} day${Number(js.streakDays || 0) === 1 ? '' : 's'}`,
              time: new Date().toISOString(),
              meta: {}
            });
          }
          // progress events
          const sortedProgress = (progressList || [])
            .filter(p => p && p.courseId && visibleSet.has(normId(p.courseId)))
            .sort((a, b) => {
              const ta = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
              const tb = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
              return tb - ta;
            })
            .slice(0, 4);

          sortedProgress.forEach(p => {
            fallbackEvents.push({
              id: `prog-${normId(p.courseId)}-${p.lastSeenAt || ''}`,
              type: 'viewed',
              title: `Progress: ${p.courseTitle || p.title || 'Course'}`,
              time: p.lastSeenAt || new Date().toISOString(),
              courseId: normId(p.courseId),
              meta: { courseTitle: p.courseTitle || p.title || '', percent: p.percent || 0 }
            });
          });

          setTimeline(fallbackEvents.slice(0, 5));
        }

        if (badgesRes.ok) {
          const bjs = await badgesRes.json();
          setBadges(Array.isArray(bjs.badges) ? bjs.badges : []);
        } else {
          // attach badges from serverProgress if present
          setBadges(Array.isArray(js.badges) ? js.badges : []);
        }
      } catch (e) {
        // fallback timeline/badges from progress/purchasedCourses
        const fallbackEvents = [];
        if (Number(js.streakDays || 0) > 0) {
          fallbackEvents.push({
            id: `streak-${Date.now()}`,
            type: 'streak',
            title: `Learning streak: ${Number(js.streakDays || 0)} day${Number(js.streakDays || 0) === 1 ? '' : 's'}`,
            time: new Date().toISOString(),
            meta: {}
          });
        }
        setTimeline(fallbackEvents);
        setBadges(Array.isArray(js.badges) ? js.badges : []);
      }

    } catch (err) {
      console.error('Dashboard load error', err);
      setErrMsg(err.message || 'Could not load dashboard data');
    } finally {
      setLoadingUser(false);
      setLoadingPurchases(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshAndLoad(token);
    } else {
      setLoadingUser(false);
      setLoadingPurchases(false);
      setErrMsg('You need to sign in to view your dashboard.');
    }

    const onUpdated = () => {
      const t = localStorage.getItem('token');
      if (t) refreshAndLoad(t);
      setWeeklyGoalMinutes(Number(localStorage.getItem('weeklyGoalMinutes')) || 0);
    };
    window.addEventListener('purchases.updated', onUpdated);
    window.addEventListener('user.updated', onUpdated);
    return () => {
      window.removeEventListener('purchases.updated', onUpdated);
      window.removeEventListener('user.updated', onUpdated);
    };
  }, []);

  const handleCancel = async (courseId) => {
    if (!window.confirm('Are you sure you want to cancel this purchase?')) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be signed in.');
    try {
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setPurchasedCourses(prev => {
          const updated = prev.filter(pc => String(pc.courseId) !== String(courseId));
          setActiveCourses(updated.length);
          return updated;
        });
        window.dispatchEvent(new Event('purchases.updated'));
      } else {
        alert(body.message || 'Could not cancel purchase');
      }
    } catch (err) { alert(err.message); }
  };

  const handleCancelInternship = async (internshipId) => {
    if (!window.confirm('Are you sure you want to withdraw from this internship? All your submissions will be deleted.')) return;
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be signed in.');
    try {
      const res = await fetch(`${API_BASE}/api/user/internships/${internshipId}/withdraw`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setInternships(prev => prev.filter(app => {
          const iId = app.internshipId?._id || app.internshipId;
          return String(iId) !== String(internshipId);
        }));
        window.dispatchEvent(new Event('user.updated'));
      } else {
        alert(body.message || 'Could not withdraw from internship');
      }
    } catch (err) { alert(err.message); }
  };

  const CourseCard = ({ c }) => {
    const rawProgress = c.progress || {};
    let percent = (typeof rawProgress.percent === 'number') ? rawProgress.percent : Number(rawProgress.percent || 0);
    if (percent >= 100 && !rawProgress.quizPassed) percent = 99;
    const thumb = c.img && typeof c.img === 'string' ? c.img : '/logo.png';
    const tag = (c.raw && c.raw.tag) || 'Course';
    const level = (c.raw && c.raw.level) || 'All Levels';
    return (
      <article className="course-card small-card" style={{ marginBottom: 18 }}>
        <div className="card-media" style={{ height: 150, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
          <img src={thumb} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="card-tag" style={{ position: 'absolute', top: 10, bottom: 'auto', left: 10, right: 'auto', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, boxShadow: 'none' }}>{tag}</div>
          <div className="card-tag" style={{ position: 'absolute', bottom: 10, top: 'auto', right: 10, left: 'auto', background: 'rgba(124, 58, 237, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, boxShadow: 'none' }}>{level}</div>
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
          <div className="card-actions" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={() => nav(`/courses/${c.courseId}`)} style={{ flex: 1, whiteSpace: 'nowrap' }}>Continue</button>
            <button className="btn outline" onClick={() => handleCancel(c.courseId)} style={{ padding: '8px 14px' }}>Cancel</button>
          </div>
        </div>
      </article>
    );
  };

  const displayName = loadingUser ? '...' : (userName || 'Learner');
  const resumeLast = (id) => id && nav(`/courses/${id}`);
  const downloadLastCert = (id) => id && nav(`/courses/${id}`);

  // Calculate goal progress based on hoursLearned
  const currentMinutesLearned = hoursLearned * 60;
  const goalPercent = weeklyGoalMinutes > 0 ? Math.min(100, Math.round((currentMinutesLearned / weeklyGoalMinutes) * 100)) : 0;

  const dailyQuotes = [
    "“The beautiful thing about learning is that nobody can take it away from you.” — B.B. King",
    "“Live as if you were to die tomorrow. Learn as if you were to live forever.” — Mahatma Gandhi",
    "“Wisdom is not a product of schooling but of the lifelong attempt to acquire it.” — Albert Einstein",
    "Every expert was once a beginner. Keep pushing forward!",
    "Your learning streak is your superpower. Don't break it!",
  ];
  const qIndex = new Date().getDay() % dailyQuotes.length;

  return (
    <div className="dash-container container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 className="dash-title" style={{ margin: 0 }}>Welcome back, {displayName}! 👋</h1>
        <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: '0 4px 14px rgba(124,58,237,0.3)', width: 'fit-content', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💡</span> Tip of the Day: {dailyQuotes[qIndex]}
        </div>
      </div>

      <XPBar />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 18 }}>
        <div style={{ background: 'var(--dash-c1)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Active Courses</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6B6B' }}>{activeCourses}</div>
        </div>
        <div style={{ background: 'var(--dash-c2)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Completed</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#4ECDC4' }}>{completedCount}</div>
        </div>
        <div style={{ background: 'var(--dash-c3)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Hours Learned</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#45B7D1' }}>{fmtHours(hoursLearned)}</div>
        </div>
        <div style={{ background: 'var(--dash-c4)', borderRadius: 12, padding: '18px 20px', position: 'relative' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Learning Streak</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#F9CA24', display: 'flex', alignItems: 'center', gap: 6 }}>
            {streakDays} days
            {streakDays >= 3 && (
              <span style={{ display: 'inline-block', animation: 'flameBounce 1s infinite alternate ease-in-out', fontSize: 24 }}>🔥</span>
            )}
          </div>
        </div>
      </div>

      {weeklyGoalMinutes > 0 && (
        <div style={{ marginTop: 24, background: 'var(--card-bg)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Weekly Goal: {weeklyGoalMinutes} mins</h3>
            <div style={{ fontWeight: 800, color: goalPercent >= 100 ? '#10B981' : '#7C3AED' }}>{goalPercent}%</div>
          </div>
          <div style={{ height: 10, background: 'var(--progress-bg, #eef2f7)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${goalPercent}%`, height: '100%', background: goalPercent >= 100 ? '#10B981' : 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
          </div>
          <p style={{ margin: '8px 0 0', color: '#64748B', fontSize: 13 }}>
            You've completed {Math.round(currentMinutesLearned)} minutes out of your {weeklyGoalMinutes} minute goal.
          </p>
        </div>
      )}

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'flex-start' }}>

        {/* Main Column */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, color: 'var(--upwise-dark)' }}>Your Courses</h2>
            <button className="btn outline" onClick={() => setPurchasesOpen(true)} style={{ padding: '8px 16px', fontSize: 13 }}>📋 Purchase History</button>
          </div>
          {loadingPurchases ? <div>Loading...</div> : purchasedCourses.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-light)', borderRadius: '12px', border: '1px solid var(--accent)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <p style={{ color: 'var(--upwise-dark)', fontWeight: 'bold', fontSize: '18px' }}>Your learning journey awaits!</p>
              <button className="btn primary" onClick={() => nav('/courses')} style={{ marginTop: '16px' }}>Start Learning →</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {purchasedCourses.map((c) => <CourseCard key={String(c.courseId)} c={c} />)}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div>
          <DailyChallenge />
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ marginBottom: 16, color: 'var(--upwise-dark)' }}>Your Internships</h2>
        {loadingInternships ? <div>Loading internships...</div> : internships.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Get real-world experience. Apply for an internship today!</p>
            <button className="btn outline" onClick={() => nav('/internships')} style={{ marginTop: '12px' }}>Browse Internships</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {internships.map((app) => {
              const i = app.internshipId;
              if (!i) return null;
              const thumb = i.thumbnail || '/logo.png';
              const pct = applicationProgress => typeof applicationProgress === 'number' ? applicationProgress : 0;
              const isCompleted = app.status === 'completed';

              return (
                <article className="course-card small-card" key={app._id} style={{ marginBottom: 18 }}>
                  <div className="card-media" style={{ height: 150, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f4f6', position: 'relative' }}>
                    <img src={thumb} alt={i.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="card-tag" style={{ position: 'absolute', top: 10, bottom: 'auto', left: 10, right: 'auto', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, textTransform: 'capitalize', boxShadow: 'none' }}>{i.domain}</div>
                    <div className="card-tag" style={{ position: 'absolute', bottom: 10, top: 'auto', right: 10, left: 'auto', background: 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12, boxShadow: 'none' }}>{app.status}</div>
                  </div>
                  <div className="card-body" style={{ paddingTop: 12 }}>
                    <h3 className="card-title" style={{ marginBottom: 6 }}>{i.title}</h3>
                    <p className="card-author" style={{ margin: 0, color: '#6b7280' }}>at {i.company || 'Upwise'}</p>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 8, background: '#eef2f7', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, pct(app.progress))}%`, height: '100%', background: '#10b981' }} />
                      </div>
                      <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>{pct(app.progress)}% completed</div>
                    </div>
                    <div className="card-actions" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      {isCompleted ? (
                        <>
                          <button className="btn primary" onClick={() => nav(`/internships/${i._id}/portal`)} style={{ flex: 1, whiteSpace: 'nowrap', background: '#7c3aed' }}>🎓 View Certificate</button>
                        </>
                      ) : (
                        <>
                          <button className="btn primary" onClick={() => nav(`/internships/${i._id}/portal`)} style={{ flex: 1, whiteSpace: 'nowrap', background: '#10b981' }}>Continue</button>
                          <button className="btn outline" onClick={() => handleCancelInternship(i._id)} style={{ padding: '8px 14px' }}>Withdraw</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ marginTop: 32 }}>
        <QuickActions
          lastCourseId={lastCourseId}
          onResume={resumeLast}
          onSetGoal={handleSetWeeklyGoal}
        />
        <AchievementsRow badges={badges} />

        <LearningHeatmap userId={userObj?.id || userObj?._id || 'unknown'} />

        <MyNotes userId={userObj?.id || userObj?._id || 'unknown'} />

        <LearningTimeline events={timeline} />
      </div>
      <PurchaseHistoryModal open={purchasesOpen} onClose={() => setPurchasesOpen(false)} />
    </div>
  );
};

export default Dashboard;
