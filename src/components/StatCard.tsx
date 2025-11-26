import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: string;
    trendColor?: string;
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, trendColor, subtext }) => {
    return (
        <div className="glass-card p-6 flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            {icon && (
                <div className="absolute top-4 right-4 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    {icon}
                </div>
            )}

            <div className="mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                    {label}
                    {trend && (
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-${trendColor || 'primary'}/10 text-${trendColor || 'primary'}`}>
                            {trend}
                        </span>
                    )}
                </h3>
            </div>

            <div>
                <p className="text-4xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
                </p>
                {subtext && (
                    <p className="text-sm text-muted mt-1">{subtext}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
