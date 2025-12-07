// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const Login = ({ setLoggedIn }) => {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !pw) {
      setErr('Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Login failed');
      }

      const body = await res.json();
      // store token + user
      if (body.token) {
        localStorage.setItem('token', body.token);
      }
      if (body.user) {
        localStorage.setItem('user', JSON.stringify(body.user));
      }
      localStorage.setItem('isLoggedIn', 'true');

      setLoggedIn(true);
      setSuccess(true);

      // notify any listeners
      window.dispatchEvent(new Event('user.updated'));

      setTimeout(() => {
        nav('/dashboard');
      }, 900);
    } catch (err) {
      setErr(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="blobs">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="blob b4" />
      </div>

      <div className="login-panel container">
        {success ? (
          <div className="success-box">
            <div className="success-animation">
              <div className="success-circle"></div>
              <div className="success-check">✓</div>
            </div>
            <h2 className="success-text">Login Successful!</h2>
            <p className="success-subtext">Redirecting to Dashboard...</p>
          </div>
        ) : (
          <>
            <div className="panel-left">
              <h2 className="lp-title">Welcome back to UPWISE</h2>
              <p className="lp-desc">Sign in to continue your learning journey.</p>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input type="email" placeholder="you@example.com" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className="field">
                  <span className="field-label">Password</span>
                  <div className="password-wrapper">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Your password"
                      className="input input-with-eye"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
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

                {err && <div className="form-error">{err}</div>}

                <div className="forgot-link">
                  <Link to="/forgot-password" className="forgot-text">Forgot Password?</Link>
                </div>

                <button type="submit" className="btn login-btn" disabled={loading}>
                  {loading ? 'Signing in…' : 'Login'}
                </button>

                <div className="small-note">
                  New here? <Link to="/signup" style={{ color: "#065F46", fontWeight: 700 }}>Create an account</Link>
                </div>
              </form>
            </div>

            <aside className="panel-right">
              <h3 className="right-title">Why UPWISE?</h3>
              <ul className="right-features">
                <li>🎓 Expert-led courses</li>
                <li>⏱ Learn at your pace</li>
                <li>🚀 Boost your career</li>
              </ul>
            </aside>
          </>
        )}
      </div>
    </main>
  );
};

export default Login;
