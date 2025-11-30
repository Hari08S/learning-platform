// src/components/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

const Signup = () => {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !email || !pw || !cpw) {
      setErr("All fields are required.");
      return;
    }

    if (pw !== cpw) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setErr("");
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: pw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErr(data.message || "Signup failed.");
        return;
      }

      // Success → redirect to login (user asked earlier to go to login after creating account)
      nav("/login");
    } catch (error) {
      console.error(error);
      setErr("Server error. Try again later.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-panel container">
        <div className="panel-left">
          <h2 className="lp-title">Create Your Account</h2>

          <form className="login-form" onSubmit={handleSignUp} noValidate>

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
                  className="input"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Create password"
                />
                <span className="pw-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
            </label>

            <label className="field">
              <span className="field-label">Confirm Password</span>
              <div className="password-wrapper">
                <input
                  type={showCpw ? "text" : "password"}
                  className="input"
                  value={cpw}
                  onChange={(e) => setCpw(e.target.value)}
                  placeholder="Confirm password"
                />
                <span className="pw-eye" onClick={() => setShowCpw(!showCpw)}>
                  {showCpw ? "👁️" : "👁️‍🗨️"}
                </span>
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
          <ul className="right-features">
            <li>📚 Beginner to advanced courses</li>
            <li>🏆 Track your progress</li>
            <li>🚀 Grow your career exponentially</li>
          </ul>
        </aside>

      </div>
    </main>
  );
};

export default Signup;
