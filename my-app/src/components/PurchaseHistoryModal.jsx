import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function PurchaseHistoryModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE}/api/me/purchases`, {
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
        const js = await res.json();
        if (!mounted) return;
        setPurchases(js.purchasedCourses || []);
      } catch (err) {
        console.error('Failed load purchases', err);
        setErr(err.message || 'Failed to load purchases');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [open]);

  const doCancel = async (courseId) => {
    if (!window.confirm('Cancel this purchase?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Cancel failed');
      // refresh list and notify app
      window.dispatchEvent(new Event('purchases.updated'));
      const updated = purchases.map(p => (String(p.courseId._id || p.courseId) === String(courseId) ? { ...p, status: 'cancelled', cancelledAt: new Date() } : p));
      setPurchases(updated);
    } catch (err) {
      console.error('cancel error', err);
      alert('Could not cancel: ' + (err.message || 'Server error'));
    }
  };

  const doRestore = async (courseId) => {
    if (!window.confirm('Restore this purchase?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/purchases/${courseId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Restore failed');
      window.dispatchEvent(new Event('purchases.updated'));
      const updated = purchases.map(p => (String(p.courseId._id || p.courseId) === String(courseId) ? { ...p, status: 'active', cancelledAt: null } : p));
      setPurchases(updated);
    } catch (err) {
      console.error('restore error', err);
      alert('Could not restore: ' + (err.message || 'Server error'));
    }
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop" style={{
      position:'fixed', inset:0, background: 'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
    }}>
      <div className="modal" style={{ width: 820, maxWidth:'95%', background:'#fff', borderRadius:10, padding:18, boxShadow:'0 10px 40px rgba(2,6,23,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
          <h3 style={{ margin:0 }}>Purchase History</h3>
          <div>
            <button className="btn outline" onClick={onClose}>Close</button>
          </div>
        </div>

        {loading ? <div>Loading…</div> : (
          <>
            {err && <div style={{ color:'#b91c1c' }}>{err}</div>}
            {purchases.length === 0 ? <div style={{ color:'#6b7280' }}>You have no purchases yet.</div> : (
              <div style={{ display:'grid', gap:12 }}>
                {purchases.map((p) => {
                  const course = (p.courseId && (p.courseId.title ? p.courseId : (p.courseId || {})));
                  const courseId = p.courseId && (p.courseId._id || p.courseId) ? (p.courseId._id || p.courseId) : p.courseId;
                  return (
                    <div key={String(courseId)} style={{ display:'flex', gap:12, alignItems:'center', borderRadius:8, padding:12, background:'#f9fafb' }}>
                      <img src={course.img || '/logo.png'} alt={course.title} style={{ width:160, height:90, objectFit:'cover', borderRadius:6 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700 }}>{course.title || 'Unknown course'}</div>
                        <div style={{ color:'#6b7280', marginTop:4 }}>{course.author || ''}</div>
                        <div style={{ marginTop:8, fontSize:13, color:'#374151' }}>
                          Price: ₹{p.price || (course.price || '—')} • Purchased: {new Date(p.purchasedAt).toLocaleString()} • Status: <strong>{p.status || 'active'}</strong>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {p.status === 'active' ? (
                          <button className="btn outline" onClick={() => doCancel(courseId)}>Cancel</button>
                        ) : (
                          <button className="btn primary" onClick={() => doRestore(courseId)}>Restore</button>
                        )}
                        <a className="btn" href={`/courses/${courseId}`} >Open</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
