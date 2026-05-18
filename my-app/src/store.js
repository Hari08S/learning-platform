import { create } from 'zustand';

const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',

    login: (userData, tokenStr) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenStr);
        localStorage.setItem('isLoggedIn', 'true');
        set({ user: userData, token: tokenStr, isLoggedIn: true });
        window.dispatchEvent(new Event('user.updated'));
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.setItem('isLoggedIn', 'false');
        set({ user: null, token: null, isLoggedIn: false, xp: 0, level: 1 });
        window.dispatchEvent(new Event('user.updated'));
    },

    xp: 0,
    level: 1,
    setXPData: (xp) => set({ xp, level: Math.floor(xp / 100) + 1 }),
    addXP: async (amount, reason) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
            const res = await fetch(`${API_BASE}/api/me/xp/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ amount, reason })
            });
            if (res.ok) {
                const data = await res.json();
                set({ xp: data.xp, level: data.level });
                // Optional: dispatch a local event to show a toast
                window.dispatchEvent(new CustomEvent('xp.added', { detail: { amount, reason } }));
            }
        } catch (err) {
            console.error('Failed to add XP', err);
        }
    },

    internshipEnrollments: [],
    setInternshipEnrollments: (list) => set({ internshipEnrollments: list }),
}));

export default useStore;
