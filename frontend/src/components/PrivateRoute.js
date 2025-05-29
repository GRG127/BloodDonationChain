import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        // Redirect to appropriate dashboard based on user role
        const dashboardRoutes = {
            donor: '/donor/dashboard',
            recipient: '/recipient/dashboard',
            hospital: '/hospital/dashboard',
            admin: '/admin/dashboard'
        };
        return <Navigate to={dashboardRoutes[user.role]} />;
    }

    return children;
};

export default PrivateRoute;