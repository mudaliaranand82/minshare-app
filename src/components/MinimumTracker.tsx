import React from 'react';

interface MinimumTrackerProps {
    currentUsage: number;
    monthlyMinimum: number;
    isFullUsage?: boolean;
    onMarkFull?: () => void;
}

const MinimumTracker: React.FC<MinimumTrackerProps> = ({ currentUsage, monthlyMinimum, onMarkFull }) => {
    const percentage = Math.min((currentUsage / monthlyMinimum) * 100, 100);
    const remaining = Math.max(monthlyMinimum - currentUsage, 0);

    return (
        <div className="glass-card mb-4">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>Your Monthly Minimum</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                    <div style={{ background: 'rgba(61, 103, 53, 0.1)', borderRadius: '1.25rem', height: '2.5rem', overflow: 'hidden', position: 'relative', marginBottom: '0.5rem' }}>
                        {percentage > 0 && (
                            <div style={{
                                width: `${percentage}%`,
                                background: percentage >= 100 ? 'var(--color-secondary)' : 'var(--color-primary)',
                                height: '100%',
                                transition: 'width 0.5s ease-out',
                                borderRadius: '1.25rem',
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
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: percentage > 50 ? 'white' : 'var(--color-primary)',
                            zIndex: 10
                        }}>
                            ${currentUsage.toFixed(2)} of ${monthlyMinimum.toFixed(2)}
                        </div>
                    </div>
                    <p className="text-sm text-muted">You have <strong>${remaining.toFixed(2)}</strong> left on your minimum.</p>
                </div>

                {remaining > 0 && (
                    <div>
                        <button
                            onClick={onMarkFull}
                            className="btn btn-primary flex items-center justify-center w-full"
                            style={{
                                height: '2.5rem',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap',
                                borderRadius: '1.25rem'
                            }}
                        >
                            Use Remaining ${remaining.toFixed(2)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinimumTracker;
