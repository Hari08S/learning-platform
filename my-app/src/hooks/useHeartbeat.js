// src/hooks/useHeartbeat.js
import { useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

/**
 * useHeartbeat
 * - courseId: the id of the course being viewed (required)
 * - enabled: boolean (start/stop)
 * - intervalSec: how often to POST the seconds to server (default 15s)
 *
 * Behavior:
 * - counts "active" seconds while page is visible
 * - sends accumulated seconds every intervalSec
 * - sends remaining seconds on visibilitychange -> hidden and beforeunload
 * - if server responds with updated progress/streak, we dispatch 'user.updated' so other UI (Dashboard) refreshes
 */
export default function useHeartbeat({ courseId, enabled = true, intervalSec = 15 }) {
  const accRef = useRef(0); // accumulated seconds not sent yet
  const lastTickRef = useRef(null);
  const mountedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!courseId) return;

    mountedRef.current = true;

    function startTick() {
      lastTickRef.current = Date.now();
      if (timerRef.current) return;
      // tick every 1s to count active time precisely
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const last = lastTickRef.current || now;
        const deltaMs = Math.max(0, now - last);
        lastTickRef.current = now;
        // only count when visible
        if (document.visibilityState === 'visible') {
          accRef.current += Math.floor(deltaMs / 1000);
        }
      }, 1000);
    }

    function stopTick() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      lastTickRef.current = null;
    }

    async function sendSeconds(sec) {
      if (!sec || sec <= 0) return null;
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const res = await fetch(`${API_BASE}/api/me/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId, seconds: sec }),
        });

        if (!res.ok) {
          // don't throw — return null so we can try again later
          return null;
        }
        const body = await res.json().catch(() => null);
        // notify other parts of the app to refresh (Dashboard listens to this)
        window.dispatchEvent(new Event('user.updated'));
        return body;
      } catch (e) {
        // network error — ignore, will retry next tick
        return null;
      }
    }

    // send accumulator periodically
    async function periodicSender() {
      if (!mountedRef.current) return;
      const toSend = accRef.current;
      if (toSend <= 0) return;
      // reset accumulator immediately to avoid double-send
      accRef.current = 0;
      await sendSeconds(toSend);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        // send remaining seconds immediately
        const toSend = accRef.current;
        accRef.current = 0;
        if (toSend > 0) sendSeconds(toSend);
      } else {
        // resumed
        lastTickRef.current = Date.now();
      }
    }

    // start counting if enabled
    if (enabled) {
      startTick();
    }

    // send every intervalSec
    const safeInterval = Math.max(5000, Number(intervalSec || 15) * 1000);
    const senderInterval = setInterval(periodicSender, safeInterval);

    document.addEventListener('visibilitychange', onVisibilityChange);

    // beforeunload fallback
    const onBeforeUnload = (e) => {
      const toSend = accRef.current;
      accRef.current = 0;
      if (toSend > 0) {
        // navigator.sendBeacon is best-effort for unloading pages; fall back to synchronous XHR if needed.
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const url = `${API_BASE}/api/me/heartbeat`;
            const payload = JSON.stringify({ courseId, seconds: toSend });
            // try navigator.sendBeacon first
            if (navigator.sendBeacon) {
              const blob = new Blob([payload], { type: 'application/json' });
              navigator.sendBeacon(url, blob);
            } else {
              // synchronous XHR as a last resort
              const xhr = new XMLHttpRequest();
              xhr.open('POST', url, false); // false = synchronous
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
              try { xhr.send(payload); } catch (err) { /* ignore */ }
            }
          }
        } catch (err) { /* ignore */ }
      }
      // no need to call preventDefault unless you want a prompt
    };

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      mountedRef.current = false;
      stopTick();
      clearInterval(senderInterval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [courseId, enabled, intervalSec]);
}
