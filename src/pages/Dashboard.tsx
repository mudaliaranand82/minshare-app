import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MinimumTracker from '../components/MinimumTracker';
import AddTransaction from '../components/AddTransaction';
import DonationWidget from '../components/DonationWidget';
import ActivityLog from '../components/ActivityLog';
import { useMonthlyStatus } from '../hooks/useMonthlyStatus';

const Dashboard: React.FC = () => {
    const { status, loading, addTransaction, markFullUsage, donateSurplus, resetMonth } = useMonthlyStatus();

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64 flex-col gap-4">
                    <div className="text-xl font-bold text-primary">Loading Dashboard...</div>
                    <p className="text-muted">Connecting to database...</p>
                </div>
            </DashboardLayout>
        );
    }

    const surplus = Math.max(75 - status.actualUsage, 0);
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <DashboardLayout>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{monthName}</h2>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{formattedDate}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <MinimumTracker
                        currentUsage={status.actualUsage}
                        monthlyMinimum={75}
                        isFullUsage={status.isFullUsage}
                        onMarkFull={markFullUsage}
                    />

                    <DonationWidget
                        surplus={surplus}
                        onDonate={donateSurplus}
                    />
                </div>
                <div>
                    {status.isFullUsage ? (
                        <div className="glass-card mb-4 p-6 text-center">
                            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Minimum Met! 🎉</h3>
                            <p className="text-muted">You have marked your monthly minimum as fully used.</p>
                        </div>
                    ) : (
                        <AddTransaction
                            onAdd={addTransaction}
                            transactionCount={status.transactions.length}
                        />
                    )}

                    <div className="mt-6">
                        <ActivityLog transactions={status.transactions} />
                    </div>

                    {import.meta.env.DEV && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={resetMonth}
                                className="text-xs text-muted hover:text-danger underline"
                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Reset My Data (Dev Only)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
