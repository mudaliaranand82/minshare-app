import React from 'react';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
}

interface ActivityLogProps {
    transactions: Transaction[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ transactions }) => {
    // Sort transactions by date (newest first)
    const sortedTransactions = [...(transactions || [])].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="glass-card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Activity Log</h3>

            {sortedTransactions.length === 0 ? (
                <p className="text-muted text-sm text-center py-4">No activity yet this month.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {sortedTransactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '0.5rem' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>{tx.description}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {new Date(tx.date).toLocaleDateString()}
                                </p>
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                ${tx.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
