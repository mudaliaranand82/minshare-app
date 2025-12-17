import React from 'react';

interface MinimumTrackerProps {
    currentUsage: number;
    monthlyMinimum: number;
    donatedAmount?: number;
    allocationTarget?: 'staff' | 'charity';
    isFullUsage?: boolean;
    onMarkFull?: () => void;
}

const MinimumTracker: React.FC<MinimumTrackerProps> = ({
    currentUsage,
    monthlyMinimum,
    donatedAmount = 0,
    allocationTarget,
    onMarkFull
}) => {
    const selfSpentPercentage = Math.min((currentUsage / monthlyMinimum) * 100, 100);
    const donatedPercentage = Math.min((donatedAmount / monthlyMinimum) * 100, 100 - selfSpentPercentage);
    const remaining = Math.max(monthlyMinimum - currentUsage - donatedAmount, 0);
    const hasDonated = donatedAmount > 0 && allocationTarget;

    // Calculate days remaining in the month
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - now.getDate();

    return (
        <div className="glass-card">
            <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Your Monthly Minimum</h3>
                <p className="text-sm text-muted" style={{ margin: 0 }}>Track your required monthly spending progress.</p>
            </div>

            {/* Progress Bar */}
            <div style={{
                background: 'rgba(61, 103, 53, 0.1)',
                borderRadius: '1.25rem',
                height: '2.75rem',
                overflow: 'hidden',
                position: 'relative',
                marginBottom: '0.75rem'
            }}>
                {/* Self-spent portion (teal) */}
                {selfSpentPercentage > 0 && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${selfSpentPercentage}%`,
                        background: 'var(--color-accent-teal)',
                        height: '100%',
                        transition: 'width 0.5s ease-out',
                        borderRadius: donatedPercentage > 0 ? '1.25rem 0 0 1.25rem' : '1.25rem',
                        boxShadow: '0 2px 8px rgba(169, 220, 227, 0.4)'
                    }} />
                )}

                {/* Donated portion (green) */}
                {donatedPercentage > 0 && (
                    <div style={{
                        position: 'absolute',
                        left: `${selfSpentPercentage}%`,
                        top: 0,
                        width: `${donatedPercentage}%`,
                        background: 'var(--color-primary)',
                        height: '100%',
                        transition: 'width 0.5s ease-out, left 0.5s ease-out',
                        borderRadius: selfSpentPercentage > 0 ? '0 1.25rem 1.25rem 0' : '1.25rem',
                        boxShadow: '0 2px 8px rgba(61, 103, 53, 0.3)'
                    }} />
                )}

                {/* Center label */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: (selfSpentPercentage + donatedPercentage) > 50 ? 'white' : 'var(--color-primary)',
                    zIndex: 10,
                    textShadow: (selfSpentPercentage + donatedPercentage) > 50 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                }}>
                    ${(currentUsage + donatedAmount).toFixed(2)} of ${monthlyMinimum.toFixed(2)}
                </div>
            </div>

            {/* Legend (only show if there's a split) */}
            {hasDonated && (
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: 'var(--color-accent-teal)'
                        }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>
                            Self-spent: <strong style={{ color: 'var(--color-primary)' }}>${currentUsage.toFixed(2)}</strong>
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: 'var(--color-primary)'
                        }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>
                            Shared ({allocationTarget === 'staff' ? 'Staff Food 🍔' : 'Charity 🎗️'}): <strong style={{ color: 'var(--color-primary)' }}>${donatedAmount.toFixed(2)}</strong>
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom Row: Days Remaining + Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                {/* Status Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: remaining > 0 ? 'rgba(169, 220, 227, 0.2)' : 'rgba(143, 188, 143, 0.2)',
                    borderRadius: '2rem',
                    fontSize: '0.9rem'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>{remaining > 0 ? '⏳' : '✅'}</span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        {remaining > 0 ? (
                            <>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left to spend <strong>${remaining.toFixed(2)}</strong></>
                        ) : (
                            <>All allocated! 🎉</>
                        )}
                    </span>
                </div>

                {/* Mark as Spent Button */}
                {remaining > 0 && !hasDonated && (
                    <button
                        onClick={onMarkFull}
                        className="btn btn-outline"
                        style={{
                            fontSize: '0.9rem',
                            padding: '0.6rem 1.25rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Minimum Spent ✓
                    </button>
                )}
            </div>
        </div>
    );
};

export default MinimumTracker;
