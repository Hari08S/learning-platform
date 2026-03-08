import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
    const spinnerStyle = {
        display: 'inline-block',
        width: '40px',
        height: '40px',
        border: '4px solid rgba(16, 185, 129, 0.2)', // var(--green-light) semi-transparent
        borderTop: '4px solid #10b981',             // var(--green-light)
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const containerStyle = fullScreen ? {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'var(--bg)',
        zIndex: 9999
    } : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px'
    };

    return (
        <div style={containerStyle} aria-live="polite" aria-busy="true">
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
            <div style={spinnerStyle} role="status" aria-label="Loading...">
            </div>
        </div>
    );
};

export default LoadingSpinner;
