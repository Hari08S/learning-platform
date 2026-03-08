import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
                    <h1 style={{ color: '#ef4444' }}>Something went wrong.</h1>
                    <p style={{ color: 'var(--muted)', marginTop: '10px' }}>An unexpected error occurred. The team has been notified.</p>
                    <button
                        style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--green)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => window.location.href = '/'}
                    >
                        Go back to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
