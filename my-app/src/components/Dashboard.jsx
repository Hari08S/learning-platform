// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';

import LearningTimeline from './LearningTimeline';
import AchievementsRow from './AchievementsRow';
import QuickActions from './QuickActions';
import PurchaseHistoryModal from './PurchaseHistoryModal';

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
  const [userName, setUserName] = useState('');
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

  const refreshAndLoad = async (token) => {
    setLoadingUser(true);
    setLoadingPurchases(true);
    setErrMsg('');
    try {
      // best-effort user name
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
        if (meRes.ok) {
          const meJson = await meRes.json();
          setUserName(meJson.user?.name || meJson.user?.email || '');
        }
      } catch (e) { /* ignore */ }

      const progRes = await fetch(`${API_BASE}/api/me/progress`, { headers: { Authorization: `Bearer ${token}` }});
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

      // load timeline/badges (best-effort)
      try {
        const [actRes, badgesRes] = await Promise.all([
          fetch(`${API_BASE}/api/me/activity`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/me/badges`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (actRes.ok) {
          const ajs = await actRes.json();
          setTimeline(Array.isArray(ajs.events) ? ajs.events.slice(0, 5) : []);
        }
        if (badgesRes.ok) {
          const bjs = await badgesRes.json();
          setBadges(Array.isArray(bjs.badges) ? bjs.badges : []);
        }
      } catch (e) { /* ignore */ }

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
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.ok) {
        setPurchasedCourses(prev => prev.filter(pc => String(pc.courseId) !== String(courseId)));
        window.dispatchEvent(new Event('purchases.updated'));
      }
    } catch(err) { alert(err.message); }
  };

  const CourseCard = ({ c }) => {
    const rawProgress = c.progress || {};
    let percent = (typeof rawProgress.percent === 'number') ? rawProgress.percent : Number(rawProgress.percent || 0);
    // keep UX: show 99% if percent >=100 but user hasn't passed quiz
    if (percent >= 100 && !rawProgress.quizPassed) percent = 99;
    const thumb = c.img && typeof c.img === 'string' ? c.img : '/logo.png';
    return (
      <article className="course-card small-card" style={{ width: 320, marginBottom: 18 }}>
        <div className="card-media" style={{ height: 150, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
          <img src={thumb} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <button className="btn primary" onClick={() => nav(`/courses/${c.courseId}`)} style={{ flex: 1 }}>Continue Learning</button>
            <button className="btn outline" onClick={() => handleCancel(c.courseId)}>Cancel</button>
          </div>
        </div>
      </article>
    );
  };

  const displayName = loadingUser ? '...' : (userName || 'Learner');
  const resumeLast = (id) => id && nav(`/courses/${id}`);
  const downloadLastCert = (id) => id && nav(`/courses/${id}`);

  return (
    <div className="dash-container container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h1 className="dash-title">Welcome back, {displayName}! 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 18 }}>
        <div style={{ background: '#FFEDEE', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Active Courses</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#FF6B6B' }}>{activeCourses}</div>
        </div>
        <div style={{ background: '#E8FFFC', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Completed</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#4ECDC4' }}>{completedCount}</div>
        </div>
        <div style={{ background: '#E8F9FB', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Hours Learned</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#45B7D1' }}>{fmtHours(hoursLearned)}</div>
        </div>
        <div style={{ background: '#FFF8DF', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Learning Streak</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#F9CA24' }}>{streakDays} days</div>
        </div>
      </div>
      <div style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Your Courses</h2>
        {loadingPurchases ? <div>Loading...</div> : purchasedCourses.length === 0 ? <div>No courses yet.</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {purchasedCourses.map((c) => <CourseCard key={String(c.courseId)} c={c} />)}
          </div>
        )}
      </div>
      <div style={{ marginTop: 32 }}>
        <QuickActions lastCourseId={lastCourseId} onResume={resumeLast} onDownloadCertificate={downloadLastCert} />
        <AchievementsRow badges={badges} />
        <LearningTimeline events={timeline} />
      </div>
    </div>
  );
};

export default Dashboard;
