import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const normId = (v) => {
  if (!v && v !== 0) return '';
  if (typeof v === 'object') return String(v._id ?? v.id ?? '');
  return String(v);
};

const fmtDate = (iso) => {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return String(iso);
  }
};

// helper to detect meaningful title (same logic used on server)
function isMeaningfulTitle(t) {
  if (!t) return false;
  const s = String(t).trim();
  if (!s) return false;
  const low = s.toLowerCase();
  return !(low === 'untitled' || low === 'title' || low === 'n/a' || low === 'undefined' || low === 'null' || low === 'nan');
}

export default function CertificatesPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState([]); // { purchase, courseMeta, progress }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (mounted) {
            setErr('Please sign in to view your certificates.');
            setItems([]);
            setLoading(false);
          }
          return;
        }

        // 1) get user's purchases + progress from server
        const progRes = await fetch(`${API_BASE}/api/me/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!progRes.ok) {
          if (mounted) {
            if (progRes.status === 401 || progRes.status === 403) {
              setErr('You need to sign in to view your certificates.');
            } else {
              setErr(`Server error ${progRes.status}`);
            }
            setItems([]);
            setLoading(false);
          }
          return;
        }

        const js = await progRes.json();
        const purchased = Array.isArray(js.purchasedCourses) ? js.purchasedCourses : [];
        const progressList = Array.isArray(js.progress) ? js.progress : [];

        // Map progress for quick lookup by normalized id
        const progressMap = {};
        progressList.forEach(p => {
          const id = normId(p.courseId);
          if (id) progressMap[id] = p;
        });

        // Build an initial list of items (some purchases may already include course object)
        const initial = purchased
          .filter(pc => pc && pc.courseId) // ignore invalid
          .map(pc => {
            const cid = normId(pc.courseId);
            // course metadata might be embedded in pc.courseId
            const courseMeta = (typeof pc.courseId === 'object' && (pc.courseId.title || pc.courseId._id))
              ? {
                  _id: normId(pc.courseId),
                  title: pc.courseId.title || pc.title || 'Untitled',
                  img: pc.courseId.img || pc.img || '/logo.png',
                  author: pc.courseId.author || pc.author || 'Author'
                }
              : null;

            return {
              purchase: pc,
              cid,
              courseMeta,
              progress: progressMap[cid] || { percent: 0, quizPassed: false, completedAt: null, lastSeenAt: null }
            };
          });

        // Find items missing courseMeta -> fetch metadata in parallel
        const needFetch = initial.filter(it => !it.courseMeta).map(it => it.cid);
        const uniqueToFetch = Array.from(new Set(needFetch)).filter(Boolean);

        const fetchedMeta = {};
        if (uniqueToFetch.length) {
          const fetches = uniqueToFetch.map(async (cid) => {
            try {
              const r = await fetch(`${API_BASE}/api/courses/${cid}`);
              if (!r.ok) return null;
              const j = await r.json();
              const c = j.course || j;
              if (!c) return null;
              return { cid, meta: { _id: normId(c._id || c.id), title: c.title || 'Untitled', img: c.img || '/logo.png', author: c.author || 'Author' } };
            } catch (e) {
              return null;
            }
          });

          const results = await Promise.all(fetches);
          results.forEach(r => {
            if (r && r.cid) fetchedMeta[r.cid] = r.meta;
          });
        }

        // Finalize items
        const finalItems = initial.map(it => {
          const meta = it.courseMeta || fetchedMeta[it.cid] || {
            _id: it.cid,
            title: it.purchase.title || 'Untitled',
            img: it.purchase.img || '/logo.png',
            author: it.purchase.author || 'Author'
          };

          // compute display percent: prefer progress.percent; if progress.percent >=100 but quiz not passed -> show 99 as UI does
          let percent = Number(it.progress?.percent ?? 0);
          if (percent >= 100 && !it.progress?.quizPassed) percent = 99;

          const statusText = (percent >= 100 || it.progress?.quizPassed || it.progress?.completedAt) ? 'Completed' : 'In progress';

          return {
            cid: it.cid,
            purchase: it.purchase,
            meta,
            progress: { ...it.progress, percent },
            statusText
          };
        });

        // --- FRONTEND SAFEGUARD: remove items with non-meaningful titles (e.g. "Untitled") ---
        const cleanedItems = finalItems.filter(it => {
          const title = (it && it.meta && it.meta.title) || (it && it.purchase && it.purchase.title) || '';
          return isMeaningfulTitle(title);
        });

        if (mounted) {
          setItems(cleanedItems);
          setLoading(false);
        }
      } catch (e) {
        console.error('Certificates load error', e);
        if (mounted) {
          setErr('Could not load certificates. Try again later.');
          setItems([]);
          setLoading(false);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const continueCourse = (courseId) => {
    if (!courseId) return;
    // navigate to course detail
    nav(`/courses/${courseId}`);
  };

  const goToQuiz = (courseId) => {
    if (!courseId) return;
    nav(`/courses/${courseId}/quiz`);
  };

  if (loading) {
    return <div className="container" style={{ padding: 48 }}>Loading certificates…</div>;
  }

  return (
    <div className="container" style={{ padding: '28px 24px 80px' }}>
      <h1 style={{ marginBottom: 8 }}>Certificates</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Certificates for your purchased courses</p>

      {err && <div style={{ color: 'red', marginBottom: 12 }}>{err}</div>}

      {items.length === 0 ? (
        <div style={{ padding: 18, color: '#6b7280' }}>
          You have no purchases yet. Browse <Link to="/courses">courses</Link> to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {items.map((it) => {
            const { meta, progress, purchase, cid, statusText } = it;
            const percent = Number(progress?.percent || 0);
            const thumb = meta?.img || '/logo.png';
            return (
              <div key={cid} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 30px rgba(2,6,23,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 120, height: 80, flex: '0 0 120px', borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={thumb} alt={meta?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '4px 0 6px' }}>{meta?.title || 'Untitled'}</h3>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>
                    Purchased: {fmtDate(purchase?.purchasedAt)} &nbsp;•&nbsp; Status: <strong>{purchase?.status || 'active'}</strong>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ color: percent >= 100 ? '#059669' : '#6b7280', fontWeight: 700 }}>{percent}%</div>
                      <div style={{ color: '#94a3b8', fontSize: 13 }}>{statusText}</div>
                    </div>

                    <div style={{ height: 8, background: '#eef2f7', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
                      <div style={{ width: `${Math.min(100, percent)}%`, height: '100%', background: percent >= 100 ? '#10b981' : '#7c3aed' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                  <button className="btn outline" onClick={() => continueCourse(cid)} style={{ minWidth: 160 }}>
                    Continue Course
                  </button>
                  <button className="btn" onClick={() => goToQuiz(cid)} style={{ minWidth: 160, background: '#7c3aed', color: '#fff' }}>
                    Take Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
