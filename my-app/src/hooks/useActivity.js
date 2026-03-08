import { useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function useActivity() {
    // getActivityData is unused except internally, but let's make it fetch
    const getActivityData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return {};
            const r = await fetch(`${API_BASE}/api/me/activity/heatmap`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return {};
            const d = await r.json();
            const map = {};
            (d.activity || []).forEach(a => { map[a.date] = a.minutes; });
            return map;
        } catch {
            return {};
        }
    }, []);

    const logActivity = useCallback(async (userId, minutes) => {
        if (!userId || !minutes) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await fetch(`${API_BASE}/api/me/activity/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ minutes })
            });
            window.dispatchEvent(new Event('activity.updated'));
        } catch (e) {
            console.error('Failed to log activity', e);
        }
    }, []);

    const getHeatmapData = useCallback(async () => {
        const data = await getActivityData();
        return Object.keys(data).map(date => ({
            date,
            count: data[date]
        }));
    }, [getActivityData]);

    const getStreak = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return 0;
            const r = await fetch(`${API_BASE}/api/me/activity/heatmap`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return 0;
            const d = await r.json();
            return d.streak || 0;
        } catch {
            return 0;
        }
    }, []);

    const getLongestStreak = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return 0;
            const r = await fetch(`${API_BASE}/api/me/activity/heatmap`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return 0;
            const d = await r.json();
            return d.longestStreak || 0;
        } catch {
            return 0;
        }
    }, []);

    const getTotalMinutes = useCallback(async (userId, yearStr) => {
        const data = await getActivityData();
        let total = 0;
        Object.keys(data).forEach(date => {
            if (date.startsWith(yearStr)) {
                total += data[date];
            }
        });
        return total;
    }, [getActivityData]);

    return { getActivityData, logActivity, getHeatmapData, getStreak, getLongestStreak, getTotalMinutes };
}
