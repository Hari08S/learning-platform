import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
            <h1 style={{ fontSize: '4rem', color: '#10B981', marginBottom: 16 }}>404</h1>
            <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Page Not Found</h2>
            <p style={{ color: '#64748B', marginBottom: 32 }}>Oops! The page you are looking for doesn't exist or has been moved.</p>
            <button className="btn primary" onClick={() => navigate('/')}>
                Go Home
            </button>
        </div>
    );
}
