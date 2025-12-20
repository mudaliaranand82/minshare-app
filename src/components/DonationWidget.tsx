import React, { useState } from 'react';

interface DonationWidgetProps {
    surplus: number;
    onDonate: (target: 'staff' | 'charity') => Promise<void>;
}

const DonationWidget: React.FC<DonationWidgetProps> = ({ surplus, onDonate }) => {
    const [loading, setLoading] = useState(false);
    const [donated, setDonated] = useState(false);
    const [donationTarget, setDonationTarget] = useState<'staff' | 'charity' | null>(null);

    const handleDonate = async (target: 'staff' | 'charity') => {
        setLoading(true);
        setDonationTarget(target);
        await onDonate(target);
        setDonated(true);
        setLoading(false);
    };

    if (surplus <= 0) return null;

    if (donated) {
        return (
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
        );
    }

    return (
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
                    disabled={loading}
                    style={{
                        flex: 1,
                        minWidth: '140px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '1.5rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    🍔 Staff Tips
                </button>
                <button
                    onClick={() => handleDonate('charity')}
                    disabled={loading}
                    style={{
                        flex: 1,
                        minWidth: '140px',
                        background: 'white',
                        color: 'var(--color-primary)',
                        border: '2px solid var(--color-primary)',
                        padding: '1rem',
                        borderRadius: '1.5rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    🎗️ Charity Fund
                </button>
            </div>
        </div>
    );
};

export default DonationWidget;
