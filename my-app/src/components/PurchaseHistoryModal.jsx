// src/components/PurchaseHistoryModal.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function PurchaseHistoryModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    async function loadPurchases() {
      setLoading(true);
      setErr('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE}/api/me/purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) {
          throw new Error(
            'Server returned HTML for /api/me/purchases — API may be misconfigured.'
          );
        }

        if (!res.ok) {
          const json = ct.includes('application/json') ? await res.json() : null;
          throw new Error((json && json.message) || `Server ${res.status}`);
        }

        const js = await res.json();
        console.log('Purchase history API result:', js); // DEBUG

        const rawPurch = Array.isArray(js.purchases) ? js.purchases : [];

        const normalized = rawPurch
          .map((p, idx) => {
            const courseId = p.courseId ? String(p.courseId) : '';
            // Always generate some id so we don't accidentally drop items
            const baseId = p.purchaseId || p._id || courseId || `idx-${idx}`;
            const purchaseId = String(baseId);

            return {
              purchaseId,
              courseId,
              title: (p.title || '').trim() || 'Course',
              author: p.author || '',
              img: p.img || '/logo.png',
              price: p.price,
              status: p.status || 'active',
              purchasedAt: p.purchasedAt || null,
              cancelledAt: p.cancelledAt || null
            };
          })
          // only require courseId to be present; allow auto-generated purchaseId + default title
          .filter(p => p.courseId);

        if (!mounted) return;
        setPurchases(normalized);
      } catch (e) {
        console.error('PurchaseHistory load failed', e);
        if (!mounted) return;
        setErr(e.message || 'Failed to load purchases');
        setPurchases([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPurchases();

    function onUpdated() {
      loadPurchases().catch(() => {});
    }
    window.addEventListener('purchases.updated', onUpdated);
    window.addEventListener('user.updated', onUpdated);

    return () => {
      mounted = false;
      window.removeEventListener('purchases.updated', onUpdated);
      window.removeEventListener('user.updated', onUpdated);
    };
  }, [open]);

  const doCancel = async (purchaseId) => {
    if (!window.confirm('Cancel this purchase?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/purchases/${purchaseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('application/json')
          ? (await res.json()).message
          : await res.text();
        throw new Error(body || `Server ${res.status}`);
      }
      window.dispatchEvent(new Event('purchases.updated'));
    } catch (err) {
      console.error('cancel error', err);
      alert('Could not cancel: ' + (err.message || 'Server error'));
    }
  };

  const doRestore = async (purchaseId) => {
    if (!window.confirm('Restore this purchase?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/purchases/${purchaseId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const body = ct.includes('application/json')
          ? (await res.json()).message
          : await res.text();
        throw new Error(body || `Server ${res.status}`);
      }
      window.dispatchEvent(new Event('purchases.updated'));
    } catch (err) {
      console.error('restore error', err);
      alert('Could not restore: ' + (err.message || 'Server error'));
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        className="modal"
        style={{
          width: 920,
          maxWidth: '95%',
          maxHeight: '80vh',
          background: '#fff',
          borderRadius: 12,
          padding: 0,
          boxShadow: '0 10px 40px rgba(2,6,23,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 18,
            borderBottom: '1px solid rgba(15,23,42,0.06)'
          }}
        >
          <h3 style={{ margin: 0 }}>Purchase History</h3>
          <div>
            <button className="btn outline" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <div
          style={{
            padding: 14,
            overflowY: 'auto',
            flex: '1 1 auto'
          }}
        >
          {loading ? (
            <div>Loading…</div>
          ) : err ? (
            <>
              <div style={{ color: '#b91c1c', marginBottom: 8 }}>{err}</div>
              <div style={{ color: '#64748B' }}>
                {err.toLowerCase().includes('not authenticated') ? (
                  <>
                    Please <Link to="/login">sign in</Link> to view your purchases.
                  </>
                ) : (
                  <>There was an error loading your purchases.</>
                )}
              </div>
            </>
          ) : purchases.length === 0 ? (
            <div style={{ color: '#6b7280', padding: 18 }}>
              You have no purchases yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {purchases.map((p) => (
                <div
                  key={p.purchaseId}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    borderRadius: 8,
                    padding: 12,
                    background: '#f9fafb'
                  }}
                >
                  <img
                    src={p.img || '/logo.png'}
                    alt={p.title}
                    style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.title}</div>
                    <div style={{ color: '#6b7280', marginTop: 4 }}>{p.author}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: '#374151' }}>
                      Price: ₹{p.price || '—'} • Purchased:{' '}
                      {p.purchasedAt ? new Date(p.purchasedAt).toLocaleString() : '—'} • Status:{' '}
                      <strong>{p.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.status === 'active' ? (
                      <button
                        className="btn outline"
                        onClick={() => doCancel(p.purchaseId)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="btn primary"
                        onClick={() => doRestore(p.purchaseId)}
                      >
                        Restore
                      </button>
                    )}
                    <Link
                      className="btn"
                      to={`/courses/${p.courseId}`}
                      onClick={onClose}
                      style={{ textDecoration: 'none', textAlign: 'center' }}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
