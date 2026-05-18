import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css';
import useStore from '../store';
import SEO from './SEO.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Signup = () => {
  const nav = useNavigate();
  const login = useStore(state => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!name || !email || !pw || !cpw) {
      setErr('Please fill all fields.');
      return;
    }

    if (pw !== cpw) {
      setErr('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pw })
      });

      if (!res.ok) {
        const bodyTxt = await res.text();
        let msg = 'Registration failed';
        try {
          const j = JSON.parse(bodyTxt);
          if (j.message) msg = j.message;
        } catch (e) { }
        throw new Error(msg);
      }

      setSuccess(true);
      setTimeout(() => {
        nav('/login');
      }, 2000);

    } catch (err) {
      setErr(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <SEO title="Sign Up" description="Create an account to access premium courses on UPWISE." />
      <div className="login-panel container">
        <div className="panel-left">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <img src="/logo.png" alt="UPWISE" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#064e3b' }}>UPWISE</span>
          </div>
          <h2 className="lp-title">Create Your Account</h2>
          <p className="lp-desc">Sign up to access premium courses and internships.</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            <label className="field">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <div className="password-wrapper">
                <input
                  type={showPw ? "text" : "password"}
                  className="input input-with-eye"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Create password"
                />
                <button
                  type="button"
                  className="pw-eye"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </label>

            <label className="field">
              <span className="field-label">Confirm Password</span>
              <div className="password-wrapper">
                <input
                  type={showCpw ? "text" : "password"}
                  className="input input-with-eye"
                  value={cpw}
                  onChange={(e) => setCpw(e.target.value)}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="pw-eye"
                  aria-label={showCpw ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowCpw(!showCpw)}
                >
                  {showCpw ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </label>

            {err && <div className="form-error">{err}</div>}

            <button
              type="submit"
              className="btn login-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="small-note">
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: 700, color: "#065F46" }}>
                Login
              </Link>
            </div>

          </form>
        </div>

        <aside className="panel-right">
          <h3 className="right-title">Why Join UPWISE?</h3>
          <p style={{ color: "var(--muted)", marginBottom: "16px", fontSize: "0.95rem", lineHeight: "1.5" }}>
            Join 50,000+ professionals advancing their careers through premium courses and verified internships.
          </p>
          <ul className="right-features">
            <li>📚 Beginner to advanced courses</li>
            <li>🏆 Verifiable completion certificates</li>
            <li>💼 Apply for remote internships</li>
            <li>🚀 Grow your career exponentially</li>
          </ul>
        </aside>

      </div>
    </main>
  );
};

export default Signup;
