const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function startPresenceTracker({ intervalSeconds = 60, minActiveSecondsToSend = 60 } = {}) {
  let intervalId = null;
  let lastActivityAt = Date.now();

  function sendPresence() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const lastCourseId = localStorage.getItem("lastCourseId") || null;
    fetch(`${API_BASE}/api/me/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId: lastCourseId, seconds: minActiveSecondsToSend })
    }).catch(() => {});
  }

  function onActivity() {
    lastActivityAt = Date.now();
  }

  intervalId = setInterval(() => {
    const now = Date.now();
    if (now - lastActivityAt <= intervalSeconds * 1000 * 2) {
      sendPresence();
    }
  }, intervalSeconds * 1000);

  window.addEventListener("mousemove", onActivity, { passive: true });
  window.addEventListener("keydown", onActivity, { passive: true });
  window.addEventListener("scroll", onActivity, { passive: true });
  window.addEventListener("click", onActivity, { passive: true });

  const cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener("mousemove", onActivity);
    window.removeEventListener("keydown", onActivity);
    window.removeEventListener("scroll", onActivity);
    window.removeEventListener("click", onActivity);
  };

  return cleanup;
}

export function stopPresenceTracker() {}
