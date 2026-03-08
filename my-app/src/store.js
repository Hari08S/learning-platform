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
        set({ user: null, token: null, isLoggedIn: false });
        window.dispatchEvent(new Event('user.updated'));
    },

    internshipEnrollments: [],
    setInternshipEnrollments: (list) => set({ internshipEnrollments: list }),
}));

export default useStore;
