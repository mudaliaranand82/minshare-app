import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { isAdminEmail } from '../config/admins';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdmin = isAdminEmail(currentUser?.email);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinkStyle = (path: string) => ({
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontWeight: isActive(path) ? 600 : 500,
        fontSize: '0.9rem',
        textDecoration: 'none',
        padding: '0.5rem 0',
        borderBottom: isActive(path) ? '2px solid var(--color-primary)' : '2px solid transparent',
        transition: 'all 0.2s'
    });

    const mobileNavLinkStyle = (path: string) => ({
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-main)',
        fontWeight: isActive(path) ? 600 : 500,
        fontSize: '1rem',
        textDecoration: 'none',
        padding: '1rem 1.5rem',
        display: 'block',
        background: isActive(path) ? 'rgba(61, 103, 53, 0.08)' : 'transparent',
        borderLeft: isActive(path) ? '3px solid var(--color-primary)' : '3px solid transparent'
    });

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-main)' }}>
            {/* Desktop Header */}
            <header className="desktop-header" style={{
                background: 'white',
                borderBottom: '1px solid var(--glass-border)',
                padding: '0.75rem 0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 1rem'
                }}>
                    {/* Logo */}
                    <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{ width: '36px', height: '36px' }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="48" stroke="#3D6735" strokeWidth="4" fill="none" />
                                <path d="M50 10 C 70 10, 90 30, 90 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 10 50" stroke="#3D6735" strokeWidth="12" strokeLinecap="round" />
                                <path d="M50 25 C 65 25, 75 35, 75 50" stroke="#8fbc8f" strokeWidth="8" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="10" fill="#d4af37" />
                            </svg>
                        </div>
                        <span style={{ fontSize: '1.35rem', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                            MinShare
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Home</Link>
                        <Link to="/profile" style={navLinkStyle('/profile')}>Profile</Link>
                        {isAdmin && <Link to="/admin" style={navLinkStyle('/admin')}>Admin</Link>}

                        <div style={{
                            height: '24px',
                            width: '1px',
                            background: 'var(--glass-border)',
                            margin: '0 0.5rem'
                        }} />

                        <span style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.85rem',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {currentUser?.displayName?.split(' ')[0]}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline"
                            style={{
                                padding: '0.4rem 1rem',
                                fontSize: '0.8rem',
                                borderRadius: '2rem'
                            }}
                        >
                            Sign Out
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--color-primary)'
                        }}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Slide-out Menu */}
            {menuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 200
                    }}
                />
            )}
            <div
                className="mobile-menu"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '280px',
                    background: 'white',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
                    transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease',
                    zIndex: 300,
                    display: 'none',
                    flexDirection: 'column'
                }}
            >
                {/* Mobile Menu Header */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        Menu
                    </span>
                    <button
                        onClick={() => setMenuOpen(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User Info */}
                <div style={{
                    padding: '1rem 1.5rem',
                    background: 'rgba(61, 103, 53, 0.05)',
                    borderBottom: '1px solid var(--glass-border)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                        {currentUser?.displayName}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {currentUser?.email}
                    </p>
                </div>

                {/* Mobile Nav Links */}
                <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
                    <Link
                        to="/dashboard"
                        style={mobileNavLinkStyle('/dashboard')}
                        onClick={() => setMenuOpen(false)}
                    >
                        🏠 Home
                    </Link>
                    <Link
                        to="/profile"
                        style={mobileNavLinkStyle('/profile')}
                        onClick={() => setMenuOpen(false)}
                    >
                        👤 Profile
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/admin"
                            style={mobileNavLinkStyle('/admin')}
                            onClick={() => setMenuOpen(false)}
                        >
                            ⚙️ Admin
                        </Link>
                    )}
                </nav>

                {/* Sign Out Button */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="btn btn-outline"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="container flex-grow" style={{ padding: '1.5rem 1rem' }}>
                {children}
            </main>

            {/* Responsive Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                    .mobile-menu {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
