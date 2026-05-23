// src/components/CertificatesPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const DOMAIN_STYLES = {
  tech:      { gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', icon: '💻' },
  software:  { gradient: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)', icon: '🖥️' },
  data:      { gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', icon: '📊' },
  marketing: { gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)', icon: '📣' },
  design:    { gradient: 'linear-gradient(135deg, #4c1d95 0%, #ec4899 100%)', icon: '🎨' },
  finance:   { gradient: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', icon: '💰' },
  other:     { gradient: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)', icon: '🏢' },
};

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

  const resolveImage = (imgSrc) => {
    if (!imgSrc || typeof imgSrc !== 'string') return '/logo.png';
    if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) return imgSrc;
    return `/${imgSrc}`;
  };

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [items, setItems] = useState([]); // { purchase, courseMeta, progress }
  const [internshipItems, setInternshipItems] = useState([]); // Array of { application, internship }

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
        // **Change:** filter out purchases that have status === 'cancelled' so cancelled courses do not show on Certificates page
        const initial = purchased
          .filter(pc => pc && pc.courseId && ((pc.status || 'active') !== 'cancelled')) // <-- filter cancelled here
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
          // setLoading(false);
        }

        // 2) Fetch internship certificates
        try {
          const intRes = await fetch(`${API_BASE}/api/user/internships/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (intRes.ok) {
            const intData = await intRes.json();
            const completedInternships = intData.applications || [];
            if (mounted) setInternshipItems(completedInternships);
          }
        } catch (errInt) {
          console.error('Failed fetching internship certs:', errInt);
        }

        if (mounted) setLoading(false);
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

  // new: handle generating/downloading certificate client-side
  const handleDownloadCertificate = async (courseMeta, cid) => {
    try {
      const userName = localStorage.getItem('name') || localStorage.getItem('userName') || 'Learner';
      const certId = `${cid}-${Date.now()}`;
      const safeTitle = (courseMeta?.title || 'certificate').replace(/[^\w\- ]/g, '').replace(/\s+/g, '_');
      const filename = `${safeTitle}_${certId}.png`;
      // generateAndDownloadCertificate is declared later in this file and exported
      await generateAndDownloadCertificate({ course: courseMeta, userName, certId, filename });
    } catch (e) {
      console.error('Certificate download failed', e);
      alert('Could not generate certificate. Try again.');
    }
  };

  const handleShare = (title) => {
    const userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email?.split('@')[0] || 'user' : 'user';
    const text = `I just completed the ${title} course on Upwise! 🚀 Check out my progress on my portfolio: ${window.location.origin}/portfolio/${userName}`;
    navigator.clipboard.writeText(text);
    import('react-hot-toast').then(mod => mod.toast.success("Share text copied to clipboard!"));
  };

  if (loading) {
    return <div className="container" style={{ padding: 48 }}>Loading certificates…</div>;
  }

  return (
    <div className="container" style={{ padding: '28px 24px 80px' }}>
      <h1 style={{ marginBottom: 8 }}>Certificates</h1>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>Certificates for your purchased courses and completed internships.</p>

      {err && <div style={{ color: 'red', marginBottom: 12 }}>{err}</div>}

      {items.length === 0 ? (
        <div style={{ padding: 18, color: '#6b7280' }}>
          You have no purchases yet. Browse <Link to="/courses">courses</Link> to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          {items.map((it) => {
            const { meta, progress, purchase, cid, statusText } = it;
            const percentRaw = Number(progress?.percent || 0);
            const percent = Number.isFinite(percentRaw) ? percentRaw : 0;

            // Behavior rules:
            // - percent >= 100: allow Download Certificate (and still show Continue)
            // - Math.round(percent) === 99: show Continue + Take Quiz
            // - percent < 99: show only Continue
            const rounded = Math.round(percent);
            const showDownload = percent >= 100;
            const showTakeQuiz = rounded === 99;
            const showContinue = true; // keep Continue visible for all (per your UI). If you want to hide on 100%, change this.

            const thumb = resolveImage(meta?.img);
            return (
              <div key={cid} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 30px rgba(2,6,23,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 120, height: 80, flex: '0 0 120px', borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={thumb} 
                    alt={meta?.title} 
                    onError={(e) => { e.target.src = '/logo.png'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
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
                  {/* Continue Course is always visible */}
                  {showContinue && (
                    <button className="btn outline" onClick={() => continueCourse(cid)} style={{ minWidth: 160 }}>
                      Continue Course
                    </button>
                  )}

                  {/* Show Take Quiz only when rounded percent === 99 */}
                  {showTakeQuiz && (
                    <button className="btn" onClick={() => goToQuiz(cid)} style={{ minWidth: 160, background: '#7c3aed', color: '#fff' }}>
                      Take Quiz
                    </button>
                  )}

                  {/* Download when completed (>=100) */}
                  {showDownload && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn outline"
                        onClick={() => handleShare(meta?.title)}
                        style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}
                        title="Copy Share Link"
                      >
                        🔗 Share
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleDownloadCertificate(meta, cid)}
                        style={{ minWidth: 160, background: '#059669', color: '#fff' }}
                      >
                        Download Certificate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INTERNSHIP CERTIFICATES SECTION */}
      {internshipItems.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ marginBottom: 12 }}>Internship Certificates</h2>
          <div style={{ display: 'grid', gap: 18 }}>
            {internshipItems.map((app) => {
              const i = app.internshipId;
              if (!i) return null;

              return (
                <div key={app._id} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 8px 30px rgba(2,6,23,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 120, height: 80, flex: '0 0 120px', borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {i.thumbnail ? (
                      <img 
                        src={resolveImage(i.thumbnail)} 
                        alt={i.title} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                    ) : null}
                    <div
                      style={{
                        display: i.thumbnail ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        background: (DOMAIN_STYLES[i.domain] || DOMAIN_STYLES.other).gradient,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>
                        {(DOMAIN_STYLES[i.domain] || DOMAIN_STYLES.other).icon}
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '4px 0 6px' }}>{i.title}</h3>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>
                      Company: <strong>{i.company || 'Upwise Hosted'}</strong> &nbsp;•&nbsp; {app.status === 'completed' ? `Completed: ${fmtDate(app.completedAt)}` : `Enrolled: ${fmtDate(app.createdAt)}`}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: app.status === 'completed' ? '#059669' : '#7c3aed', fontWeight: 700 }}>{app.progress || 0}%</div>
                        <div style={{ color: '#94a3b8', fontSize: 13 }}>{app.status === 'completed' ? 'Completed' : 'In progress'}</div>
                      </div>

                      <div style={{ height: 8, background: '#eef2f7', borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
                        <div style={{ width: `${app.progress || 0}%`, height: '100%', background: app.status === 'completed' ? '#10b981' : '#7c3aed' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                    {app.status === 'completed' ? (
                      <button
                        className="btn"
                        onClick={() => handleDownloadCertificate({ title: i.title + " Internship" }, app._id)}
                        style={{ minWidth: 160, background: '#059669', color: '#fff' }}
                      >
                        Download Certificate
                      </button>
                    ) : (
                      <Link
                        className="btn"
                        to={`/internships/${i._id}`}
                        style={{ minWidth: 160, textDecoration: 'none', textAlign: 'center', background: 'var(--border)', color: 'var(--text)' }}
                      >
                        Continue Internship
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div >
  );
}

// the following helper functions are unchanged from your original file
export async function generateAndDownloadCertificate({ course, userName, certId, issuedOn = new Date(), filename }) {
  const dateStr = (issuedOn instanceof Date) ? issuedOn.toLocaleDateString() : issuedOn;
  const title = course.title;
  const issuer = "UPWISE";
  const user = userName || "Learner";

  const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#065F46" />
            <stop offset="1" stop-color="#10B981" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="#fff" rx="20" />
        <rect x="40" y="40" width="1520" height="1050" rx="18" fill="url(#g)" opacity="0.06" />

        <g transform="translate(120,140)">
          <text x="0" y="0" font-size="40" font-family="Arial" fill="#065F46" font-weight="800">${issuer} Certificate</text>

          <text x="0" y="120" font-size="26" font-family="Arial" fill="#0f172a">This certifies that</text>

          <text x="0" y="210" font-size="56" font-family="Arial" fill="#0f172a" font-weight="800">${escapeXml(user)}</text>

          <text x="0" y="300" font-size="26" font-family="Arial" fill="#0f172a">has successfully completed the course</text>

          <text x="0" y="380" font-size="36" font-family="Arial" font-weight="800" fill="#064e3b">${escapeXml(title)}</text>

          <text x="0" y="540" font-size="18" font-family="Arial" fill="#475569">Issued on: ${escapeXml(dateStr)}</text>
          <text x="0" y="578" font-size="18" font-family="Arial" fill="#475569">Certificate ID: ${escapeXml(certId)}</text>

          <g transform="translate(1060, 420)">
            <rect x="0" y="0" width="240" height="110" rx="8" fill="#fff" opacity="0.95" />
            <text x="120" y="58" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#065F46">Verified</text>
          </g>
        </g>
      </svg>`;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = dlUrl;
    a.download = filename || `${certId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    URL.revokeObjectURL(dlUrl);
    return true;
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = (e) => rej(e);
    img.src = src;
    img.crossOrigin = "anonymous";
  });
}

function escapeXml(unsafe) {
  return String(unsafe || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
