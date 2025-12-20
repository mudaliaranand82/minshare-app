import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail } from '../config/admins';

interface MemberStatus {
    uid: string;
    plannedUsage: number;
    actualUsage: number;
    allocationTarget?: 'staff' | 'charity';
    donatedAmount: number;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber: string;
    memberId: string;
}

interface MemberWithProfile extends MemberStatus {
    profile?: UserProfile;
}

interface ContactRequest {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: any;
    status: string;
}

const AdminDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Check admin access
    useEffect(() => {
        if (currentUser && !isAdminEmail(currentUser.email)) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const q = query(collection(db, 'monthly_status'), where('month', '==', currentMonth));
            const querySnapshot = await getDocs(q);

            const membersData: MemberWithProfile[] = [];

            // Fetch monthly status data
            querySnapshot.forEach((docSnap) => {
                membersData.push(docSnap.data() as MemberWithProfile);
            });

            // Fetch user profiles for each member
            const membersWithProfiles = await Promise.all(
                membersData.map(async (member) => {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', member.uid));
                        if (userDoc.exists()) {
                            return { ...member, profile: userDoc.data() as UserProfile };
                        }
                    } catch (err) {
                        console.error(`Error fetching profile for ${member.uid}:`, err);
                    }
                    return member;
                })
            );

            setMembers(membersWithProfiles);

            // Fetch contact requests
            const contactQuery = query(
                collection(db, 'contact_requests'),
                orderBy('createdAt', 'desc')
            );
            const contactSnapshot = await getDocs(contactQuery);
            const contactData: ContactRequest[] = [];
            contactSnapshot.forEach((docSnap) => {
                contactData.push({ id: docSnap.id, ...docSnap.data() } as ContactRequest);
            });
            setContactRequests(contactData);

            setLoading(false);
        };

        fetchData();
    }, []);

    const totalPool = members.reduce((acc, curr) => {
        if (curr.allocationTarget) {
            return acc + (curr.donatedAmount || 0);
        }
        return acc;
    }, 0);

    const staffPool = members
        .filter(m => m.allocationTarget === 'staff')
        .reduce((acc, curr) => acc + (curr.donatedAmount || 0), 0);

    const charityPool = members
        .filter(m => m.allocationTarget === 'charity')
        .reduce((acc, curr) => acc + (curr.donatedAmount || 0), 0);

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Reset a member's monthly status
    const handleResetMember = async (uid: string, memberName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to reset ${memberName || 'this member'}?\n\nThis will:\n• Clear all their transactions\n• Reset their spending to $0\n• Remove any donations\n\nThis cannot be undone.`
        );

        if (!confirmed) return;

        try {
            // Delete the monthly_status document
            await deleteDoc(doc(db, 'monthly_status', `${uid}_${currentMonth}`));

            // Remove from local state
            setMembers(prev => prev.filter(m => m.uid !== uid));

            alert(`${memberName || 'Member'} has been reset successfully.`);
        } catch (err) {
            console.error('Error resetting member:', err);
            alert('Failed to reset member. Please try again.');
        }
    };

    // Delete a contact request
    const handleDeleteContact = async (id: string) => {
        const confirmed = window.confirm('Delete this contact request?');
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'contact_requests', id));
            setContactRequests(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting contact:', err);
            alert('Failed to delete contact request.');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64 flex-col gap-4">
                    <div className="text-xl font-bold text-primary">Loading Admin Data...</div>
                    <p className="text-muted">Fetching member statistics...</p>
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
                    Admin Overview
                </h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {monthName}
                </p>
            </div>

            {/* Stats Cards Row */}
            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Total Pool Card */}
                <div className="glass-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(169, 220, 227, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            💰
                        </div>
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Total Pool
                        </span>
                    </div>
                    <p style={{
                        fontSize: '2.25rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        ${totalPool.toFixed(2)}
                    </p>
                    <p style={{
                        margin: '0.5rem 0 0 0',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        from {members.filter(m => m.allocationTarget).length} members
                    </p>
                </div>

                {/* Staff Tips Card */}
                <div className="glass-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(61, 103, 53, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🍔
                        </div>
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Staff Tips
                        </span>
                    </div>
                    <p style={{
                        fontSize: '2.25rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        ${staffPool.toFixed(2)}
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => alert('Funds distributed to Staff!')}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.6rem 1rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        Distribute Funds
                    </button>
                </div>

                {/* Charity Fund Card */}
                <div className="glass-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(212, 175, 55, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🎗️
                        </div>
                        <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Charity Fund
                        </span>
                    </div>
                    <p style={{
                        fontSize: '2.25rem',
                        fontWeight: 700,
                        margin: 0,
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        ${charityPool.toFixed(2)}
                    </p>
                    <button
                        className="btn btn-outline"
                        onClick={() => alert('Funds sent to Charity!')}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.6rem 1rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        Donate Funds
                    </button>
                </div>
            </div>

            {/* Member Table Card */}
            <div className="glass-card">
                <h3 style={{
                    margin: '0 0 1.25rem 0',
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-primary)'
                }}>
                    Member Activity
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(61, 103, 53, 0.1)' }}>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Member</th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Phone</th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'right',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Spent</th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'right',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Shared</th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Allocation</th>
                                <th style={{
                                    padding: '0.75rem 1rem',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member, index) => (
                                <tr
                                    key={member.uid}
                                    style={{
                                        borderBottom: index < members.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                                        transition: 'background 0.15s'
                                    }}
                                >
                                    <td style={{
                                        padding: '1rem',
                                        fontSize: '0.95rem'
                                    }}>
                                        <div style={{ fontWeight: 500 }}>
                                            {member.profile?.displayName || member.profile?.firstName
                                                ? `${member.profile.firstName} ${member.profile.lastName}`.trim()
                                                : '—'}
                                        </div>
                                        {member.profile?.memberId && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-muted)',
                                                marginTop: '0.25rem'
                                            }}>
                                                ID: {member.profile.memberId}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        fontSize: '0.9rem',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {member.profile?.phoneNumber || '—'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'right',
                                        fontWeight: 500,
                                        fontSize: '0.95rem'
                                    }}>
                                        ${member.actualUsage.toFixed(2)}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'right',
                                        fontWeight: 600,
                                        color: 'var(--color-primary)',
                                        fontSize: '0.95rem'
                                    }}>
                                        {member.allocationTarget ? `$${member.donatedAmount.toFixed(2)}` : '—'}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        {member.allocationTarget === 'staff' && (
                                            <span style={{
                                                background: 'rgba(61, 103, 53, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                🍔 Staff
                                            </span>
                                        )}
                                        {member.allocationTarget === 'charity' && (
                                            <span style={{
                                                background: 'rgba(212, 175, 55, 0.1)',
                                                color: '#b8860b',
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                🎗️ Charity
                                            </span>
                                        )}
                                        {!member.allocationTarget && (
                                            <span style={{
                                                color: 'var(--color-text-muted)',
                                                fontSize: '0.8rem'
                                            }}>
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td style={{
                                        padding: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        <button
                                            onClick={() => handleResetMember(
                                                member.uid,
                                                member.profile?.displayName ||
                                                (member.profile?.firstName ? `${member.profile.firstName} ${member.profile.lastName}`.trim() : '')
                                            )}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#dc2626',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Reset
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        style={{
                                            padding: '3rem 1rem',
                                            textAlign: 'center',
                                            color: 'var(--color-text-muted)'
                                        }}
                                    >
                                        No member data found for this month.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contact Requests Section */}
            {contactRequests.length > 0 && (
                <div className="glass-card" style={{ marginTop: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 1.25rem 0',
                        fontSize: '1.25rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📬 Contact Requests
                        <span style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {contactRequests.length}
                        </span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {contactRequests.map((request) => (
                            <div
                                key={request.id}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(169, 220, 227, 0.1)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.75rem'
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
                                            {request.name}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            {request.email}
                                            {request.phone && ` • ${request.phone}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteContact(request.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            fontSize: '1.25rem'
                                        }}
                                        title="Delete request"
                                    >
                                        ×
                                    </button>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-main)',
                                    lineHeight: 1.5
                                }}>
                                    {request.message}
                                </p>
                                <p style={{
                                    margin: '0.75rem 0 0 0',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    {request.createdAt?.toDate?.().toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    }) || 'Just now'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;
