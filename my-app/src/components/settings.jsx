// src/components/Settings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Settings({ setLoggedIn }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({ name: '', email: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      console.log('[settings] loading profile, token:', !!token);
      if (!token) {
        setMsg('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[settings] /me response status', res.status);
        if (res.status === 401) {
          setMsg('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          setLoggedIn(false);
          setLoading(false);
          setTimeout(() => nav('/login'), 800);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setUser({ name: data.user.name || '', email: data.user.email || '' });
      } catch (err) {
        console.warn(err);
        setMsg('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [nav, setLoggedIn]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!user.name || user.name.trim().length < 2) {
      setMsg('Please enter a valid name.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMsg('Not authenticated.');
      return;
    }

    setSaving(true);
    try {
      console.log('[settings] PATCH /me request body:', { name: user.name.trim() });
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: user.name.trim() })
      });

      console.log('[settings] PATCH /me response status', res.status);
      if (res.status === 401) {
        setMsg('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('isLoggedIn');
        setSaving(false);
        setLoggedIn(false);
        setTimeout(() => nav('/login'), 800);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Update failed');
      }

      const { user: updated } = await res.json();
      // update localStorage cached user
      localStorage.setItem('user', JSON.stringify({ id: updated.id, name: updated.name, email: updated.email }));
      // notify other parts of app (Navbar listens)
      window.dispatchEvent(new Event('user.updated'));

      setMsg('Profile updated.');
      setTimeout(() => {
        nav('/dashboard');
      }, 900);
    } catch (err) {
      console.error('Update error', err);
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 36 }}>Loading profile…</div>;

  return (
    <div className="container" style={{ padding: 36 }}>
      <h1 style={{ marginBottom: 8 }}>Settings</h1>
      <p style={{ color: '#475569', marginBottom: 18 }}>Manage your account details.</p>

      <form onSubmit={handleSave} style={{ maxWidth: 560 }}>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Full name</div>
          <input
            className="input"
            value={user.name}
            onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
            placeholder="Your full name"
          />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Email (read-only)</div>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#F8FAFC', border: '1px solid rgba(6,95,70,0.04)' }}>
            {user.email}
          </div>
        </label>

        {msg && <div style={{ marginBottom: 12, color: msg.includes('updated') ? '#065F46' : '#B91C1C' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <button type="button" className="btn outline" onClick={() => nav('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
