import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        try {
            setError('');
            await signInWithGoogle();

            // Note: We'll rely on a separate effect or component to handle redirection 
            // because strict mode or component re-renders might cause race conditions
            // here. However, basic logic is:
            // The AuthContext updates the user. The Dashboard/PrivateRoute might need to check if profile exists.
            // Actually, best place to check is here after await, OR in a routing guard.
            // Let's do it here for simplicity as requested.

            // We need to fetch the user doc to see if they are onboarded.
            // We can't use 'currentUser' from context immediately here as it might not be updated yet in the closure.
            // But 'signInWithGoogle' in context waits for popup.
            // Let's look at AuthContext again. It updates state on onAuthStateChanged.
            // So we might need to wait or just let the PrivateRoute handle it? Note that PrivateRoute just checks 'currentUser'.

            // Let's try to fetch using the auth result if we had access to it, but context wraps it.
            // We will trust that after signInWithGoogle resolves, the user is signed in.
            // We'll navigate to a 'CheckAuth' or just navigate to Dashboard and let Dashboard redirect?
            // "once a user google auth's in and before we put them on the dashboard page. We need a form"
            // So we should navigate to /onboarding maybe, and let Onboarding redirect to dashboard if already exists?
            // Or better: Navigate to '/' which is a loader that decides?

            // Plan:
            // 1. User signs in.
            // 2. We navigate to a loading/decision route or simply check doc here.

            // Let's import db here to check.

            navigate('/onboarding'); // Logic: Always go to onboarding. Onboarding will check if profile exists and forward to dashboard if so.
            // Wait, that might flash the form. 
            // Better: Check here.

        } catch (error: any) {
            console.error("Login failed", error);
            setError(error.message || 'Failed to sign in');
        }
    };

    return (
        <div className="login-container">
            {/* Left Side (Desktop) / Top Section (Mobile) - Hero Content */}
            <div className="hero-section">
                {/* Decorative Pattern */}
                <div className="pattern-overlay" />

                <div className="hero-content">
                    <div className="brand-header">
                        <div className="logo-wrapper" style={{
                            width: '64px',
                            height: '64px',
                            background: 'transparent',
                            boxShadow: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* Inline SVG for perfect transparency */}
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" fill="white" />
                                <path d="M50 10 C 70 10, 90 30, 90 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 10 50" stroke="#3D6735" strokeWidth="12" strokeLinecap="round" />
                                <path d="M50 25 C 65 25, 75 35, 75 50" stroke="#8fbc8f" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="10" fill="#d4af37" />
                            </svg>
                        </div>
                        <h1>MinShare</h1>
                    </div>

                    <h2>Make the most of your club minimums</h2>
                    <p className="hero-description">
                        Members often lose unused food and beverage credits every month. MinShare helps you keep track, stay ahead, and share leftover value with staff or charity.
                    </p>

                    <div className="feature-list">
                        <p className="feature-title">A simple way to</p>
                        <ul>
                            <li>
                                <span className="bullet">•</span> track your monthly minimum
                            </li>
                            <li>
                                <span className="bullet">•</span> avoid unused credits
                            </li>
                            <li>
                                <span className="bullet">•</span> share your remainder with people who make the club special
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Side (Desktop) / Bottom Section (Mobile) - Login Form */}
            <div className="login-section">
                <div className="login-card-wrapper">
                    <div className="glass-card login-card">
                        <div className="text-center mb-6">
                            <h2>Welcome back</h2>
                            <p className="text-muted">Sign in to manage your monthly minimum and track your balance.</p>
                        </div>

                        <button onClick={handleLogin} className="btn btn-primary login-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                            </svg>
                            Continue with Google
                        </button>

                        {error && <p className="error-message">{error}</p>}

                        <div className="text-center mt-4">
                            <p className="text-sm text-muted">
                                Don't have an account? <span className="link-primary">Contact Admin</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
