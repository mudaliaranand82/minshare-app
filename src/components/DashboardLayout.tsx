import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-main)' }}>
            <header style={{ background: 'white', borderBottom: '1px solid var(--glass-border)', padding: '1rem 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Inline SVG Logo (Green Version) */}
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="#3D6735" strokeWidth="4" fill="none" />
                                <path d="M50 10 C 70 10, 90 30, 90 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 10 50" stroke="#3D6735" strokeWidth="12" strokeLinecap="round" />
                                <path d="M50 25 C 65 25, 75 35, 75 50" stroke="#8fbc8f" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="10" fill="#d4af37" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>MinShare</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/onboarding" className="text-sm font-medium text-muted hover:text-primary transition-colors">
                            Profile
                        </Link>
                        <Link to="/admin" className="text-sm font-medium text-muted hover:text-primary transition-colors">
                            Admin
                        </Link>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{currentUser?.displayName}</span>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '2rem' }}>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header >
            <main className="container flex-grow" style={{ padding: '2rem 1rem' }}>
                {children}
            </main>
        </div >
    );
};

export default DashboardLayout;
