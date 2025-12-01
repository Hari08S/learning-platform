// src/components/CertificatesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { generateAndDownloadCertificate } from "./CertificateGenerator";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]); // { course: {...}, pct, status, purchasedAt, completedAt }

  const navigate = useNavigate();

  // user name (for cert) - read from localStorage user object if present
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const userName = user?.name || user?.email?.split?.("@")?.[0] || "Learner";

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // Use /api/me/progress which returns progress and purchasedCourses with normalized ids
      const res = await fetch(`${API_BASE}/api/me/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/html")) {
        // defensive: backend returned HTML (index.html or error page)
        throw new Error("Server returned HTML for /api/me/progress — API missing or misconfigured.");
      }

      if (!res.ok) {
        const json = ct.includes("application/json") ? await res.json() : null;
        throw new Error((json && json.message) || `Server error ${res.status}`);
      }

      const js = await res.json();
      const progressMap = (js.progress || []).reduce((acc, p) => {
        if (!p || !p.courseId) return acc;
        acc[String(p.courseId)] = p;
        return acc;
      }, {});

      // Only include active purchases (exclude cancelled) AND only where course metadata is resolvable
      const out = (js.purchasedCourses || [])
        .filter(pc => (pc.status || "active") === "active" && Boolean(pc.courseId) && (pc.title || pc.img))
        .map((pc) => {
          const courseObj = {
            id: pc.courseId,
            title: pc.title || "",
            author: pc.author || "",
            img: pc.img || "/logo.png",
          };
          const prog = progressMap[String(pc.courseId)] || { percent: 0, completedAt: null };
          const pct = typeof prog.percent === "number" ? prog.percent : Number(prog.percent) || 0;
          return {
            course: courseObj,
            pct,
            completedAt: prog.completedAt || null,
            status: pc.status || "active",
            purchasedAt: pc.purchasedAt ? new Date(pc.purchasedAt).toISOString() : null,
            price: pc.price,
          };
        });

      setRows(out);
    } catch (e) {
      console.error("Certificates load failed", e);
      setErr(e.message || "Could not load purchases");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await load();
    })();

    // refresh when purchases/progress change elsewhere
    function onUpdated() {
      load().catch((e) => console.warn("refresh certificates failed", e));
    }
    window.addEventListener("purchases.updated", onUpdated);
    window.addEventListener("user.updated", onUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("purchases.updated", onUpdated);
      window.removeEventListener("user.updated", onUpdated);
    };
  }, [load]);

  const [busy, setBusy] = useState(null);

  async function handleDownload(course) {
    const certId = makeCertId(course.id, userName);
    setBusy(course.id);
    try {
      await generateAndDownloadCertificate({
        course,
        userName,
        certId,
        issuedOn: new Date(),
        filename: `${(course.title || "certificate").replace(/\s+/g, "_")}_${certId}.png`,
      });
    } catch (err) {
      alert("Failed to generate certificate. Try again.");
      console.error(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="container" style={{ padding: "28px 20px 80px" }}>
      <h1 style={{ marginBottom: 8 }}>Certificates</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>
        Certificates for your purchased courses
      </p>

      {loading ? (
        <div>Loading…</div>
      ) : err ? (
        <>
          <div style={{ color: "#b91c1c", marginBottom: 12 }}>{err}</div>
          <div style={{ color: "#64748B" }}>
            {err.toLowerCase().includes("not authenticated") ? (
              <>
                Please <Link to="/login">sign in</Link> to view your purchased courses.
              </>
            ) : (
              <>You have no purchased courses yet or the server returned unexpected data.</>
            )}
          </div>
        </>
      ) : rows.length === 0 ? (
        <div style={{ color: "#64748B" }}>
          You have no purchased courses that are eligible for certificates. Browse <Link to="/courses">courses</Link> to get started.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {rows.map(({ course, pct, status, purchasedAt, completedAt }) => (
            <div key={String(course.id)} style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              background: "white",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 6px 18px rgba(2,6,23,0.04)"
            }}>
              <img src={course.img || "/logo.png"} alt={course.title} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{course.title || "Untitled"}</div>
                    <div style={{ color: "#64748B", marginTop: 6 }}>{course.author}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#6B7280" }}>
                      Purchased: {purchasedAt ? new Date(purchasedAt).toLocaleString() : "—"} • Status: <strong>{status}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: pct >= 100 ? "#10B981" : "#374151" }}>{pct}%</div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>{completedAt ? "Completed" : "In progress"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ height: 10, background: "#EEF2FF", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: completedAt ? "#10B981" : "#60A5FA", transition: "width 300ms" }} />
                  </div>
                </div>
              </div>

              <div style={{ minWidth: 220 }}>
                {completedAt ? (
                  <button className="btn primary" onClick={() => handleDownload(course)} disabled={busy === course.id} style={{ width: "100%" }}>
                    {busy === course.id ? "Preparing…" : "Download Certificate"}
                  </button>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "#94A3B8" }}>Complete the course AND pass the course quiz to unlock your certificate.</div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Link className="btn outline" to={`/courses/${course.id}`} style={{ textAlign: "center", flex: 1 }}>Continue Course</Link>
                      <Link className="btn primary" to={`/courses/${course.id}/quiz`} style={{ textAlign: "center", flex: 1 }}>Take Quiz</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18, color: "#94A3B8", fontSize: 13 }}>
        Note: these certificates are generated on your device. For verifiable certificates, a server-signed PDF with a verification endpoint is recommended.
      </div>
    </div>
  );
}

/* helper */
function makeCertId(courseId, userName) {
  const date = new Date().toISOString().slice(0,10).replace(/-/g, "");
  const userShort = (userName || "Learner").toUpperCase().replace(/\s+/g, "").slice(0,6);
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  return `UPWISE-${courseId}-${userShort}-${date}-${rand}`;
}
