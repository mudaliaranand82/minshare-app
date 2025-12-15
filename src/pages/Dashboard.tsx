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
            {/* Header with better spacing */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>{monthName}</h2>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>{formattedDate}</p>
                </div>
            </div>

            {/* 1. Monthly Minimum Tracker - Prominent First Card */}
            <div className="mb-8">
                <MinimumTracker
                    currentUsage={status.actualUsage}
                    monthlyMinimum={75}
                    isFullUsage={status.isFullUsage}
                    onMarkFull={markFullUsage}
                />
            </div>

            {/* 2. Combined Log Spending & Activity Card */}
            <div className="glass-card mb-8">
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Left Panel: Input / Status */}
                    <div className="h-full" style={{ minHeight: '200px' }}>
                        {status.isFullUsage ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Minimum Met! 🎉</h3>
                                <p className="text-muted">You have marked your monthly minimum as fully used.</p>
                            </div>
                        ) : (
                            <AddTransaction
                                onAdd={addTransaction}
                                transactionCount={status.transactions.length}
                            />
                        )}
                    </div>

                    {/* Right Panel: Activity Log */}
                    <div className="md:border-l md:pl-8" style={{ borderColor: 'rgba(61, 103, 53, 0.1)' }}>
                        <ActivityLog transactions={status.transactions} />
                    </div>
                </div>
            </div>

            {/* 3. Donation / Share Surplus Card */}
            <div className="mb-8">
                <DonationWidget
                    surplus={surplus}
                    onDonate={donateSurplus}
                />
            </div>

            {/* Dev Tools - Only show in development */}
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
        </DashboardLayout>
    );
};

export default Dashboard;
