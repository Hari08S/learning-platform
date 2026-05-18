import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Load existing notifications
        const saved = JSON.parse(localStorage.getItem('upwise_notifications') || '[]');
        setNotifications(saved);

        // Listen for new notifications (like xp.added or purchases)
        const handleNewXP = (e) => {
            const { amount, reason } = e.detail;
            addNotification(`🎉 You earned ${amount} XP for ${reason}!`);
        };

        window.addEventListener('xp.added', handleNewXP);
        return () => window.removeEventListener('xp.added', handleNewXP);
    }, []);

    const addNotification = (msg) => {
        const notifs = JSON.parse(localStorage.getItem('upwise_notifications') || '[]');
        const newNotif = { id: Date.now(), msg, time: new Date().toISOString(), read: false };
        const updated = [newNotif, ...notifs].slice(0, 10);
        setNotifications(updated);
        localStorage.setItem('upwise_notifications', JSON.stringify(updated));
    };

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('upwise_notifications', JSON.stringify(updated));
        setOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: 'none', border: 'none',
                    fontSize: '24px', cursor: 'pointer',
                    color: 'var(--upwise-mid)',
                    position: 'relative'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: '#ef4444', color: '#fff', fontSize: '10px',
                        fontWeight: 'bold', width: '16px', height: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '40px', right: 0,
                    width: '300px', background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 100, overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-light)' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--upwise-dark)' }}>Notifications</span>
                        <button onClick={markAllRead} style={{ border: 'none', background: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', background: n.read ? '#fff' : '#f8fafc' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--upwise-dark)', fontWeight: n.read ? 400 : 700 }}>{n.msg}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Just now</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
