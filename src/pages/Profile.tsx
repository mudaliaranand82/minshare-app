import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import DashboardLayout from '../components/DashboardLayout';

interface UserProfile {
    firstName: string;
    lastName: string;
    memberId: string;
    phoneNumber: string;
    email: string;
}

const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [memberId, setMemberId] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            try {
                const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setMemberId(data.memberId || '');
                    setPhone(data.phoneNumber || '');
                } else {
                    // No profile, redirect to onboarding
                    navigate('/onboarding', { replace: true });
                }
            } catch (err: any) {
                setError(`Failed to load profile: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [currentUser, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`.trim(),
                memberId,
                phoneNumber: phone,
                updatedAt: new Date().toISOString()
            });
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(`Failed to save: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64 flex-col gap-4">
                    <div className="text-xl font-bold text-primary">Loading Profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    margin: '0 0 0.25rem 0',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)'
                }}>
                    Your Profile
                </h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                    Manage your account details
                </p>
            </div>

            {/* Profile Card */}
            <div className="glass-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Email (read-only) */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--color-text-muted)'
                        }}>
                            Email Address
                        </label>
                        <div style={{
                            padding: '0.875rem',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '0.5rem',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.95rem'
                        }}>
                            {currentUser?.email}
                        </div>
                    </div>

                    {/* Name Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Member ID */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Member ID
                        </label>
                        <input
                            type="text"
                            required
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            placeholder="e.g. 12345"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Error Message */}
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

                    {/* Success Message */}
                    {success && (
                        <div style={{
                            background: 'rgba(61, 103, 53, 0.1)',
                            border: '1px solid rgba(61, 103, 53, 0.3)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1rem',
                            color: 'var(--color-primary)',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ✓ {success}
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate('/dashboard')}
                            style={{ flex: 1 }}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{ flex: 1 }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
