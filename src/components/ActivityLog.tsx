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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
                margin: '0 0 1.25rem 0',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-primary)'
            }}>
                Activity Log
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '220px' }}>
                {sortedTransactions.length === 0 ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '150px'
                    }}>
                        <p className="text-muted text-sm" style={{ textAlign: 'center' }}>
                            No activity yet this month.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {sortedTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(169, 220, 227, 0.1)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(61, 103, 53, 0.05)'
                                }}
                            >
                                <div>
                                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>
                                        {tx.description}
                                    </p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <span style={{
                                    fontWeight: 600,
                                    color: 'var(--color-primary)',
                                    fontSize: '1rem'
                                }}>
                                    ${tx.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
