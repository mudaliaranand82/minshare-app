import React from 'react';

interface MinimumTrackerProps {
    currentUsage: number;
    monthlyMinimum: number;
    isFullUsage?: boolean;
    onMarkFull?: () => void;
}

const MinimumTracker: React.FC<MinimumTrackerProps> = ({ currentUsage, monthlyMinimum, isFullUsage, onMarkFull }) => {
    const percentage = Math.min((currentUsage / monthlyMinimum) * 100, 100);
    const remaining = Math.max(monthlyMinimum - currentUsage, 0);

    return (
        <div className="glass-card mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Monthly Progress</h3>

                {isFullUsage ? (
                    <span className="badge" style={{ background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                        Fully Used
                    </span>
                ) : (
                    <button
                        onClick={onMarkFull}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', height: 'auto' }}
                    >
                        Use All / ${monthlyMinimum}
                    </button>
                )}
            </div>

            <div style={{ background: 'rgba(61, 103, 53, 0.1)', borderRadius: '1rem', height: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                {percentage > 0 && (
                    <div style={{
                        width: `${percentage}%`,
                        background: percentage >= 100 ? 'var(--color-secondary)' : 'var(--color-primary)',
                        height: '100%',
                        transition: 'width 0.5s ease-out',
                        borderRadius: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} />
                )}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: percentage > 50 ? 'white' : 'var(--color-primary)',
                    zIndex: 10
                }}>
                    ${currentUsage.toFixed(2)} / ${monthlyMinimum}
                </div>
            </div>

            <div className="mt-4 text-center">
                {remaining > 0 ? (
                    <p>You have <strong style={{ color: 'var(--color-accent)' }}>${remaining.toFixed(2)}</strong> remaining to reach your minimum.</p>
                ) : (
                    <p style={{ color: 'var(--color-secondary)' }}>🎉 You have met your monthly minimum!</p>
                )}
            </div>
        </div>
    );
};

export default MinimumTracker;
