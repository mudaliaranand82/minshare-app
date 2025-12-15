import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Onboarding: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [memberId, setMemberId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (currentUser?.displayName) {
            const names = currentUser.displayName.split(' ');
            setFirstName(names[0] || '');
            setLastName(names.slice(1).join(' ') || '');
        }
    }, [currentUser]);

    React.useEffect(() => {
        const checkProfile = async () => {
            if (!currentUser) {
                setChecking(false);
                return;
            }
            try {
                console.log('[Onboarding] Checking profile for user:', currentUser.uid);
                const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
                console.log('[Onboarding] Profile check result:', docSnap.exists());
                if (docSnap.exists()) {
                    navigate('/dashboard', { replace: true });
                } else {
                    setChecking(false);
                }
            } catch (err: any) {
                console.error("[Onboarding] Error checking profile:", err);
                setError(`Could not verify profile: ${err.message}`);
                setChecking(false);
            }
        };
        checkProfile();
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        setError('');

        try {
            console.log('[Onboarding] Saving profile...');

            // Add a timeout to prevent infinite hanging
            const savePromise = setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`.trim(),
                memberId,
                phoneNumber: phone,
                role: 'member',
                createdAt: new Date().toISOString()
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Save timed out. Please check your connection.')), 10000)
            );

            await Promise.race([savePromise, timeoutPromise]);

            console.log('[Onboarding] Profile saved successfully');
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            console.error("[Onboarding] Error saving profile:", err);
            setError(`Failed to save: ${err.message}`);
            setLoading(false);
        }
    };

    // Show loading while checking profile
    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-main)' }}>
                <div className="text-center">
                    <div className="text-xl font-bold text-primary">Loading...</div>
                    <p className="text-muted mt-2">Checking your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-main)', padding: '2rem' }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
                <h2 className="text-center mb-4" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Complete Your Profile</h2>
                <p className="text-center text-muted mb-6">Please confirm your details to set up your account.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>First Name</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                className="w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Last Name</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Member ID</label>
                        <input
                            type="text"
                            required
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            placeholder="e.g. 12345"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1rem',
                            color: '#ef4444',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                        {loading ? 'Saving...' : 'Continue to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
