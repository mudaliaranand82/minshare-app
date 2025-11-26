import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Onboarding: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [memberId, setMemberId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        try {
            await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                memberId,
                phoneNumber: phone,
                role: 'member',
                createdAt: new Date().toISOString()
            });
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving profile", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
                <h2 className="text-center mb-4">Complete Your Profile</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

                    <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
                        {loading ? 'Saving...' : 'Continue to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
