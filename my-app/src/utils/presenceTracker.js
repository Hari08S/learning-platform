// src/utils/presenceTracker.js
// Lightweight presence tracker that sends periodic pings to the server.
// startPresenceTracker({ intervalSeconds, minActiveSecondsToSend })
// returns a cleanup function to stop the tracker.

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function startPresenceTracker({ intervalSeconds = 60, minActiveSecondsToSend = 60 } = {}) {
  let intervalId = null;
  let lastActivityAt = Date.now();

  function sendPresence() {
    const token = localStorage.getItem("token");
    if (!token) return;
    // Use courseId last seen from localStorage if your app sets it; otherwise backend will assign to most-recent
    const lastCourseId = localStorage.getItem("lastCourseId") || null;
    // send seconds equal to intervalSeconds (or minActiveSecondsToSend)
    fetch(`${API_BASE}/api/me/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courseId: lastCourseId, seconds: minActiveSecondsToSend })
    }).catch((e) => {
      // ignore network errors silently
      // console.warn('presence ping failed', e);
    });
  }

  function onActivity() {
    lastActivityAt = Date.now();
  }

  // start interval
  intervalId = setInterval(() => {
    const now = Date.now();
    // only send presence if user was active in the last interval (mouse/keyboard)
    if (now - lastActivityAt <= intervalSeconds * 1000 * 2) {
      sendPresence();
    }
  }, intervalSeconds * 1000);

  // listen for interactions
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

export function stopPresenceTracker() {
  // left for symmetry in case you want a top-level stop
  // but `cleanup` returned from startPresenceTracker already stops listeners/interval
}
