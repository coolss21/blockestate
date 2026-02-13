// components/ProtectedRoute.jsx - Protected route wrapper
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to user's correct dashboard
        const dashboardMap = {
            citizen: '/citizen/dashboard',
            registrar: '/registrar/dashboard',
            court: '/court/dashboard',
            admin: '/admin/dashboard'
        };
        return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
