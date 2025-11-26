import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return currentUser ? <>{children}</> : <Navigate to="/login" />;
};
