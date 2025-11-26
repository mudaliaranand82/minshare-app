import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

interface MemberStatus {
    uid: string;
    plannedUsage: number;
    actualUsage: number;
    allocationTarget?: 'staff' | 'charity';
    donatedAmount: number;
}

const AdminDashboard: React.FC = () => {
    const [members, setMembers] = useState<MemberStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const q = query(collection(db, 'monthly_status'), where('month', '==', currentMonth));
            const querySnapshot = await getDocs(q);

            const data: MemberStatus[] = [];
            querySnapshot.forEach((doc) => {
                data.push(doc.data() as MemberStatus);
            });
            setMembers(data);
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

    if (loading) {
        return <DashboardLayout>Loading Admin Data...</DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Admin Overview</h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1rem' }}>Manage club minimums and distributions.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-sm uppercase tracking-wider text-muted mb-2 font-bold">Total Pool</h3>
                    <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>${totalPool.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span style={{ fontSize: '3rem' }}>☕️</span>
                    </div>
                    <h3 className="text-sm uppercase tracking-wider text-muted mb-2 font-bold">Staff Tips</h3>
                    <p className="text-3xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>${staffPool.toFixed(2)}</p>
                    <button className="btn btn-primary btn-sm w-full" onClick={() => alert('Funds distributed to Staff!')}>Distribute Funds</button>
                </div>
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span style={{ fontSize: '3rem' }}>🎗️</span>
                    </div>
                    <h3 className="text-sm uppercase tracking-wider text-muted mb-2 font-bold">Charity Fund</h3>
                    <p className="text-3xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-heading)' }}>${charityPool.toFixed(2)}</p>
                    <button className="btn btn-outline btn-sm w-full" onClick={() => alert('Funds sent to Charity!')}>Donate Funds</button>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Member Statuses</h3>
                <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                                <th className="p-3 text-sm font-semibold text-muted">User ID</th>
                                <th className="p-3 text-sm font-semibold text-muted">Spent</th>
                                <th className="p-3 text-sm font-semibold text-muted">Donation</th>
                                <th className="p-3 text-sm font-semibold text-muted">Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.uid} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td className="p-3 font-mono text-xs text-muted">{member.uid.slice(0, 8)}...</td>
                                    <td className="p-3 font-medium">${member.actualUsage.toFixed(2)}</td>
                                    <td className="p-3 font-bold text-primary">
                                        {member.allocationTarget ? `$${member.donatedAmount.toFixed(2)}` : '-'}
                                    </td>
                                    <td className="p-3">
                                        {member.allocationTarget === 'staff' && (
                                            <span className="badge" style={{ background: 'rgba(61, 103, 53, 0.1)', color: 'var(--color-primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                                                Staff Tip
                                            </span>
                                        )}
                                        {member.allocationTarget === 'charity' && (
                                            <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                                                Charity
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-muted">No member data found for this month.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default AdminDashboard;
