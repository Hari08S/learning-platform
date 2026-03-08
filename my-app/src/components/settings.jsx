// src/components/Settings.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiSave, FiArrowLeft } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Settings({ setLoggedIn }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', createdAt: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) {
        setMsg('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        setUser({
          name: data.user.name || '',
          email: data.user.email || '',
          createdAt: data.user.createdAt || data.user.created_at || ''
        });
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
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: user.name.trim() })
      });

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
      localStorage.setItem('user', JSON.stringify({ id: updated.id, name: updated.name, email: updated.email }));
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

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-card">
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            Loading profile…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-card">
        {/* Profile Avatar Section */}
        <div className="settings-avatar-section">
          <div className="settings-avatar">{initials}</div>
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your profile information</p>
        </div>

        <div className="settings-divider" />

        {/* Form Section */}
        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-field">
            <label className="settings-label">
              <FiUser className="settings-label-icon" />
              Full Name
            </label>
            <input
              className="settings-input"
              value={user.name}
              onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div className="settings-field">
            <label className="settings-label">
              <FiMail className="settings-label-icon" />
              Email Address
            </label>
            <div className="settings-readonly">
              {user.email}
              <span className="settings-readonly-badge">Read-only</span>
            </div>
          </div>

          {memberSince && (
            <div className="settings-field">
              <label className="settings-label">
                <FiCalendar className="settings-label-icon" />
                Member Since
              </label>
              <div className="settings-readonly">
                {memberSince}
              </div>
            </div>
          )}

          {msg && (
            <div className={`settings-msg ${msg.includes('updated') ? 'success' : 'error'}`}>
              {msg.includes('updated') ? '✓' : '⚠'} {msg}
            </div>
          )}

          <div className="settings-actions">
            <button type="button" className="settings-btn settings-btn--outline" onClick={() => nav('/dashboard')}>
              <FiArrowLeft style={{ fontSize: 16 }} />
              Back
            </button>
            <button type="submit" className="settings-btn settings-btn--primary" disabled={saving}>
              <FiSave style={{ fontSize: 16 }} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

