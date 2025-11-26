import React, { useState } from 'react';

interface DonationWidgetProps {
    surplus: number;
    onDonate: (target: 'staff' | 'charity') => Promise<void>;
}

const DonationWidget: React.FC<DonationWidgetProps> = ({ surplus, onDonate }) => {
    const [loading, setLoading] = useState(false);
    const [donated, setDonated] = useState(false);

    const handleDonate = async (target: 'staff' | 'charity') => {
        setLoading(true);
        await onDonate(target);
        setDonated(true);
        setLoading(false);
    };

    if (surplus <= 0) return null;

    if (donated) {
        return (
            <div className="glass-card mt-6 text-center">
                <h3 style={{ color: 'var(--color-secondary)' }}>Thank You!</h3>
                <p>Your surplus has been allocated.</p>
            </div>
        );
    }

    return (
        <div className="glass-card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Share Your Surplus</h3>
            <p className="mb-4 text-muted" style={{ fontSize: '0.95rem' }}>
                You have <strong>${surplus.toFixed(2)}</strong> available to share.
                Would you like to donate it?
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => handleDonate('staff')}
                    className="btn btn-outline flex-1"
                    disabled={loading}
                >
                    Tip Staff ☕️
                </button>
                <button
                    onClick={() => handleDonate('charity')}
                    className="btn btn-outline flex-1"
                    disabled={loading}
                >
                    Charity Fund 🎗️
                </button>
            </div>
        </div>
    );
};

export default DonationWidget;
