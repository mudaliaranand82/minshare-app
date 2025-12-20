import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
}

const initialTransactions: Transaction[] = [
    { id: '1', amount: 25, description: 'Lunch at the Grill', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', amount: 18, description: 'Drinks at the Bar', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const Demo: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [donated, setDonated] = useState(false);
    const [donationTarget, setDonationTarget] = useState<'staff' | 'charity' | null>(null);

    const actualUsage = transactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyMinimum = 75;
    const surplus = Math.max(monthlyMinimum - actualUsage, 0);
    const progress = Math.min((actualUsage / monthlyMinimum) * 100, 100);

    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDate.getDate();

    const addTransaction = () => {
        if (!amount || parseFloat(amount) <= 0) return;
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            description: description || 'Transaction',
            date: new Date().toISOString()
        };
        setTransactions(prev => [...prev, newTransaction]);
        setAmount('');
        setDescription('');
    };

    const resetDemo = () => {
        setTransactions(initialTransactions);
        setDonated(false);
        setDonationTarget(null);
    };

    const handleDonate = (target: 'staff' | 'charity') => {
        setDonationTarget(target);
        setDonated(true);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-main)',
            paddingBottom: '2rem'
        }}>
            {/* Demo Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-accent-teal) 0%, #7ec8d3 100%)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🧪</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        Demo Mode
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        – Try it out! No data is saved.
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={resetDemo}
                        style={{
                            background: 'white',
                            border: '1px solid var(--glass-border)',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Reset
                    </button>
                    <Link
                        to="/login"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                        }}
                    >
                        Sign Up →
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
                {/* Date */}
                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>

                {/* Progress Card */}
                <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.25rem',
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-primary)'
                    }}>
                        Your Monthly Minimum
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Track your required monthly spending progress.
                    </p>

                    {/* Progress Bar */}
                    <div style={{
                        background: 'rgba(61, 103, 53, 0.1)',
                        borderRadius: '1rem',
                        height: '2rem',
                        overflow: 'hidden',
                        marginBottom: '0.75rem'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            borderRadius: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            transition: 'width 0.3s ease'
                        }}>
                            ${actualUsage.toFixed(2)} of ${monthlyMinimum}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                            Self-spent: <strong>${actualUsage.toFixed(2)}</strong>
                        </span>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                            {daysRemaining} days remaining
                        </span>
                    </div>
                </div>

                {/* Log Transactions + Activity Log */}
                <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* Left: Add Transaction */}
                        <div>
                            <h3 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.25rem',
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--color-primary)'
                            }}>
                                Log Transaction
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    type="number"
                                    placeholder="Amount ($)"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--glass-border)',
                                        fontSize: '1rem'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--glass-border)',
                                        fontSize: '1rem'
                                    }}
                                />
                                <button
                                    onClick={addTransaction}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '1.5rem',
                                        fontWeight: 600
                                    }}
                                >
                                    + Add Transaction
                                </button>
                            </div>
                        </div>

                        {/* Right: Activity Log */}
                        <div style={{ borderLeft: '1px solid rgba(61, 103, 53, 0.1)', paddingLeft: '1.5rem' }}>
                            <h3 style={{
                                margin: '0 0 1rem 0',
                                fontSize: '1.25rem',
                                fontFamily: 'var(--font-heading)',
                                color: 'var(--color-primary)'
                            }}>
                                Activity Log
                            </h3>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {transactions.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        No transactions yet.
                                    </p>
                                ) : (
                                    transactions.slice().reverse().map(t => (
                                        <div key={t.id} style={{
                                            padding: '0.75rem 0',
                                            borderBottom: '1px solid rgba(61, 103, 53, 0.05)',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 500 }}>{t.description}</p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {new Date(t.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                                ${t.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Donation Widget */}
                {surplus > 0 && !donated && (
                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, rgba(169, 220, 227, 0.3) 0%, rgba(143, 188, 143, 0.2) 100%)'
                    }}>
                        <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.25rem',
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--color-primary)'
                        }}>
                            Share Your Surplus
                        </h3>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)' }}>
                            You have <strong>${surplus.toFixed(2)}</strong> remaining. Where would you like to redirect it?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleDonate('staff')}
                                className="btn"
                                style={{
                                    flex: 1,
                                    minWidth: '140px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                🍔 Staff Tips
                            </button>
                            <button
                                onClick={() => handleDonate('charity')}
                                className="btn"
                                style={{
                                    flex: 1,
                                    minWidth: '140px',
                                    background: 'white',
                                    color: 'var(--color-primary)',
                                    border: '2px solid var(--color-primary)',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                🎗️ Charity Fund
                            </button>
                        </div>
                    </div>
                )}

                {donated && (
                    <div className="glass-card" style={{
                        background: 'linear-gradient(135deg, rgba(61, 103, 53, 0.1) 0%, rgba(143, 188, 143, 0.2) 100%)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                        <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.25rem',
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--color-primary)'
                        }}>
                            Thank You!
                        </h3>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                            You allocated ${surplus.toFixed(2)} to {donationTarget === 'staff' ? '🍔 Staff Tips' : '🎗️ Charity Fund'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Demo;
