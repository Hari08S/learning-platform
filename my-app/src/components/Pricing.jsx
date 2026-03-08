import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const handleSubscribe = async (tier) => {
        if (!isLoggedIn) {
            toast.error('Please log in to upgrade your subscription.');
            return nav('/login');
        }

        setLoading(true);

        // Mock checkout flow
        setTimeout(() => {
            setLoading(false);
            if (tier === 'Pro') {
                const confirm = window.confirm('MOCK STRIPE/RAZORPAY CHECKOUT\\n\\nConfirm payment of ₹999 for PRO tier?');
                if (confirm) {
                    toast.success('Payment successful! You are now a PRO user.');
                    nav('/dashboard');
                } else {
                    toast.error('Payment cancelled.');
                }
            } else {
                toast.success('Enrolled in the Free Tier!');
                nav('/dashboard');
            }
        }, 1200);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: '60px', paddingBottom: '60px' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '10px' }}>Simple, transparent pricing</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '40px' }}>No hidden fees. Cancel anytime.</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>

                    {/* FREE TIER */}
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '350px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        border: '1px solid var(--border)',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Free</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', margin: '15px 0' }}>₹0 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/forever</span></div>
                        <p style={{ color: 'var(--muted)', marginBottom: '25px', lineHeight: 1.6 }}>Perfect for exploring the platform and trying limited courses.</p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: 'var(--text)' }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> Access to 5+ free courses
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> Community support
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)' }}>
                                <span style={{ fontWeight: 800 }}>✕</span> No certifications
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)' }}>
                                <span style={{ fontWeight: 800 }}>✕</span> No offline downloads
                            </li>
                        </ul>

                        <button
                            className="btn outline"
                            style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
                            onClick={() => handleSubscribe('Free')}
                            disabled={loading}
                        >
                            Get Started for Free
                        </button>
                    </div>

                    {/* PRO TIER */}
                    <div style={{
                        background: 'linear-gradient(145deg, var(--card-bg), var(--bg))',
                        borderRadius: '16px',
                        padding: '40px',
                        width: '100%',
                        maxWidth: '350px',
                        boxShadow: '0 20px 40px rgba(124, 58, 237, 0.15)',
                        border: '2px solid var(--accent-purple)',
                        textAlign: 'left',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-purple)', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800 }}>MOST POPULAR</div>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Pro</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', margin: '15px 0' }}>₹999 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/month</span></div>
                        <p style={{ color: 'var(--muted)', marginBottom: '25px', lineHeight: 1.6 }}>Unlimited access to all courses, certifications, and resources.</p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: 'var(--text)' }}>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> Unlimited access to 100+ courses
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> Official verified certificates
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> Offline downloads & mobile sync
                            </li>
                            <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--green-light)', fontWeight: 800 }}>✓</span> 1-on-1 mentor guidance weekly
                            </li>
                        </ul>

                        <button
                            className="btn primary"
                            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', background: 'linear-gradient(90deg, var(--accent-purple), #9333ea)' }}
                            onClick={() => handleSubscribe('Pro')}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Upgrade to Pro'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
