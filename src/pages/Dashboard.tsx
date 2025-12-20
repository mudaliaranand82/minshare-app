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
    const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    // Hide donation widget if already donated
    const showDonationWidget = surplus > 0 && !status.donatedAmount;

    return (
        <DashboardLayout>
            {/* Compact Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '1rem' }}>{formattedDate}</p>
            </div>

            {/* Card 1: Monthly Minimum Tracker */}
            <div style={{ marginBottom: '1.5rem' }}>
                <MinimumTracker
                    currentUsage={status.actualUsage}
                    monthlyMinimum={75}
                    donatedAmount={status.donatedAmount}
                    allocationTarget={status.allocationTarget}
                    isFullUsage={status.isFullUsage}
                    onMarkFull={markFullUsage}
                />
            </div>

            {/* Card 2: Log Transactions + Activity Log (Two Equal Columns) */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                }}>
                    {/* Left Column: Log Transactions */}
                    <div>
                        {status.isFullUsage ? (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                padding: '1rem'
                            }}>
                                <h3 style={{
                                    color: 'var(--color-primary)',
                                    marginBottom: '0.5rem',
                                    fontSize: '1.25rem',
                                    fontFamily: 'var(--font-heading)'
                                }}>
                                    Minimum Met! 🎉
                                </h3>
                                <p className="text-muted">You've marked your monthly minimum as fully used.</p>
                            </div>
                        ) : (
                            <AddTransaction
                                onAdd={addTransaction}
                                transactionCount={status.transactions.length}
                            />
                        )}
                    </div>

                    {/* Right Column: Activity Log */}
                    <div style={{
                        borderLeft: '1px solid rgba(61, 103, 53, 0.1)',
                        paddingLeft: '1.5rem'
                    }}>
                        <ActivityLog transactions={status.transactions} />
                    </div>
                </div>
            </div>

            {/* Card 3: Donation / Share Surplus (only if not already donated) */}
            {showDonationWidget && (
                <div>
                    <DonationWidget
                        surplus={surplus}
                        onDonate={donateSurplus}
                    />
                </div>
            )}

            {/* Dev Tools - Only show in development */}
            {import.meta.env.DEV && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={resetMonth}
                        className="text-xs text-muted hover:text-danger underline"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                        Reset My Data (Dev Only)
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Dashboard;
