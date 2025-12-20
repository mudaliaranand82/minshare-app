import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

const Login: React.FC = () => {
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = async () => {
        try {
            setError('');
            setIsLoading(true);

            console.log('[Login] Starting Google sign-in...');
            await signInWithGoogle();
            console.log('[Login] Google sign-in complete');

            // Get the current user immediately after sign-in
            const user = auth.currentUser;
            console.log('[Login] Current user:', user?.uid);

            if (!user) {
                throw new Error('Sign in failed - no user returned');
            }

            // Check if user profile exists
            console.log('[Login] Checking Firestore for user profile...');
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                console.log('[Login] Firestore response:', userDoc.exists() ? 'Profile exists' : 'No profile');

                if (userDoc.exists()) {
                    navigate('/dashboard', { replace: true });
                } else {
                    navigate('/onboarding', { replace: true });
                }
            } catch (firestoreError: any) {
                console.error('[Login] Firestore error:', firestoreError);
                // If Firestore fails, still try to proceed to onboarding
                // The user is authenticated, just can't check profile
                setError(`Database error: ${firestoreError.message}. Redirecting to setup...`);
                setTimeout(() => {
                    navigate('/onboarding', { replace: true });
                }, 2000);
            }
        } catch (error: any) {
            console.error('[Login] Error:', error);
            setError(error.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
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

                    <h2>Turn unused credits into something meaningful</h2>
                    <p className="hero-description">
                        Members often lose unused food and beverage credits every month. MinShare makes it easy to redirect that value to the people who make your club special.
                    </p>

                    <div className="feature-list">
                        <p className="feature-title">A simple way to</p>
                        <ul>
                            <li>
                                <span className="bullet">•</span> give back to the staff who take care of you
                            </li>
                            <li>
                                <span className="bullet">•</span> support causes your club cares about
                            </li>
                            <li>
                                <span className="bullet">•</span> make every dollar count, even the ones you don't spend
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
                            <h2>Welcome</h2>
                            <p className="text-muted">Sign in to share your unused balance with those who matter.</p>
                        </div>

                        <button onClick={handleLogin} className="btn btn-primary login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <>Signing in...</>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <Link
                            to="/demo"
                            className="btn"
                            style={{
                                width: '100%',
                                background: 'var(--color-accent-teal)',
                                color: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '0.75rem',
                                padding: '0.875rem 1rem',
                                borderRadius: '1.5rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                border: 'none'
                            }}
                        >
                            🧪 Test Drive the App
                        </Link>

                        {error && <p className="error-message">{error}</p>}

                        <div className="text-center mt-4">
                            <p className="text-sm text-muted">
                                Don't have an account? <Link to="/contact" className="link-primary" style={{ cursor: 'pointer' }}>Contact Admin</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
